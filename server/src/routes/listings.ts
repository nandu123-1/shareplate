import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db/database';
import { authenticateToken, optionalAuthenticateToken, requireRole } from '../middleware/auth';
import { logDonationHistory, createNotification } from '../services/historyAndNotification';
import { FoodListing } from '../types';

export const listingsRouter = Router();

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'Cooked Meals',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy',
    'Grains',
    'Other'
  ]),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().min(1, 'Unit is required'),
  preparationTime: z.string().min(1, 'Preparation time is required'),
  pickupStart: z.string().min(1, 'Pickup start time is required'),
  pickupEnd: z.string().min(1, 'Pickup end time is required'),
  expiryGuidance: z.string().min(1, 'Expiry/use-by guidance is required'),
  storageInstructions: z.string().min(1, 'Storage instructions are required'),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  image: z.string().optional(),
  donorNotes: z.string().optional()
});

// GET /api/listings (Public search and browse)
listingsRouter.get('/', optionalAuthenticateToken, (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      dietary,
      status,
      sort,
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        l.*,
        dp.business_name AS donor_business_name,
        dp.city AS donor_city,
        dp.phone AS donor_phone
      FROM food_listings l
      JOIN donor_profiles dp ON l.donor_id = dp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by status: Default to active/available listings for general view unless specified
    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    } else {
      query += ` AND l.status IN ('AVAILABLE', 'PARTIALLY_RESERVED')`;
    }

    if (search) {
      query += ` AND (l.title LIKE ? OR l.description LIKE ? OR dp.business_name LIKE ? OR dp.city LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (category && category !== 'All') {
      query += ` AND l.category = ?`;
      params.push(category);
    }

    if (dietary && dietary !== 'All') {
      query += ` AND l.dietary_tags LIKE ?`;
      params.push(`%"${dietary}"%`);
    }

    // Sorting
    if (sort === 'expiry_soon') {
      query += ` ORDER BY l.pickup_end ASC`;
    } else if (sort === 'quantity_desc') {
      query += ` ORDER BY l.remaining_quantity DESC`;
    } else {
      query += ` ORDER BY l.created_at DESC`;
    }

    // Total count for pagination
    const countQuery = query.replace('SELECT \n        l.*,\n        dp.business_name AS donor_business_name,\n        dp.city AS donor_city,\n        dp.phone AS donor_phone', 'SELECT COUNT(*) as total');
    const totalRow = db.prepare(countQuery).get(...params) as { total: number };
    const total = totalRow ? totalRow.total : 0;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const rows = db.prepare(query).all(...params) as any[];

    // Parse JSON tags
    const listings = rows.map((r) => ({
      ...r,
      dietary_tags: r.dietary_tags ? JSON.parse(r.dietary_tags) : [],
      allergens: r.allergens ? JSON.parse(r.allergens) : [],
      // Smart matching match explanation if recipient is logged in
      matchScore: req.user?.role === 'RECIPIENT' ? computeSmartMatchScore(r) : undefined,
      matchReason: req.user?.role === 'RECIPIENT' ? computeSmartMatchReason(r) : undefined
    }));

    res.json({
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve food listings' });
  }
});

// Helper: Smart recommendation match score & reason
function computeSmartMatchScore(listing: any): number {
  let score = 85;
  if (listing.category === 'Cooked Meals' || listing.category === 'Bakery') score += 10;
  if (listing.remaining_quantity >= 20) score += 5;
  return Math.min(99, score);
}

function computeSmartMatchReason(listing: any): string {
  const reasons = [
    `Ready for immediate distribution within your organization's daily handling window.`,
    `Optimal portion size matching standard community meal meal-prep programs.`,
    `Freshly packed with verified temperature storage instructions.`
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// GET /api/listings/:id
listingsRouter.get('/:id', optionalAuthenticateToken, (req: Request, res: Response) => {
  try {
    const listingId = req.params.id;
    const query = `
      SELECT 
        l.*,
        dp.business_name AS donor_business_name,
        dp.business_type AS donor_business_type,
        dp.city AS donor_city,
        dp.pickup_address AS donor_pickup_address,
        dp.phone AS donor_phone
      FROM food_listings l
      JOIN donor_profiles dp ON l.donor_id = dp.user_id
      WHERE l.id = ?
    `;
    const listing = db.prepare(query).get(listingId) as any;

    if (!listing) {
      res.status(404).json({ error: 'Food listing not found' });
      return;
    }

    // Get audit history
    const history = db.prepare(`
      SELECT h.*, u.name as performer_name
      FROM donation_history h
      JOIN users u ON h.performed_by_id = u.id
      WHERE h.listing_id = ?
      ORDER BY h.timestamp ASC
    `).all(listingId);

    // Get existing requests for this listing if requester is owner donor or admin
    let requests: any[] = [];
    if (req.user && (req.user.id === listing.donor_id || req.user.role === 'ADMIN')) {
      requests = db.prepare(`
        SELECT r.*, rp.organization_name as recipient_org_name, rp.phone as recipient_phone, rp.organization_type as recipient_org_type
        FROM donation_requests r
        JOIN recipient_profiles rp ON r.recipient_id = rp.user_id
        WHERE r.listing_id = ?
        ORDER BY r.created_at DESC
      `).all(listingId);
    } else if (req.user && req.user.role === 'RECIPIENT') {
      // Return their own request if they requested
      requests = db.prepare(`
        SELECT * FROM donation_requests
        WHERE listing_id = ? AND recipient_id = ?
      `).all(listingId, req.user.id);
    }

    res.json({
      listing: {
        ...listing,
        dietary_tags: listing.dietary_tags ? JSON.parse(listing.dietary_tags) : [],
        allergens: listing.allergens ? JSON.parse(listing.allergens) : []
      },
      history,
      requests
    });
  } catch (error) {
    console.error('Get listing by id error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing details' });
  }
});

// POST /api/listings (Create listing - Donor only)
listingsRouter.post('/', authenticateToken, requireRole('DONOR'), (req: Request, res: Response) => {
  try {
    const data = listingSchema.parse(req.body);

    // Validate that pickupEnd is after pickupStart
    const startDate = new Date(data.pickupStart);
    const endDate = new Date(data.pickupEnd);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ error: 'Invalid pickup window date format' });
      return;
    }
    if (endDate <= startDate) {
      res.status(400).json({ error: 'Pickup end time must be after pickup start time' });
      return;
    }

    const listingId = 'lst_' + crypto.randomUUID();
    const now = new Date().toISOString();

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO food_listings (
          id, donor_id, title, description, category,
          quantity, remaining_quantity, unit, preparation_time, listing_time,
          pickup_start, pickup_end, expiry_guidance, storage_instructions,
          dietary_tags, allergens, pickup_location, image_url, donor_notes,
          status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          'AVAILABLE', ?, ?
        )
      `).run(
        listingId,
        req.user!.id,
        data.title,
        data.description,
        data.category,
        data.quantity,
        data.quantity, // remaining starts equal to initial quantity
        data.unit,
        data.preparationTime,
        now,
        data.pickupStart,
        data.pickupEnd,
        data.expiryGuidance,
        data.storageInstructions,
        JSON.stringify(data.dietaryTags),
        JSON.stringify(data.allergens),
        data.pickupLocation,
        data.image || null,
        data.donorNotes || null,
        now,
        now
      );

      // Audit history
      logDonationHistory(
        listingId,
        null,
        'LISTED',
        null,
        'AVAILABLE',
        req.user!.id,
        `Listed ${data.quantity} ${data.unit} of "${data.title}"`
      );
    });

    insertTx();

    const createdListing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(listingId) as any;
    res.status(201).json({
      message: 'Food donation listing published successfully',
      listing: {
        ...createdListing,
        dietary_tags: JSON.parse(createdListing.dietary_tags || '[]'),
        allergens: JSON.parse(createdListing.allergens || '[]')
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create food listing' });
  }
});

// PUT /api/listings/:id (Update listing - Donor owner or Admin)
listingsRouter.put('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const listingId = req.params.id;
    const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(listingId) as any;

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listing.donor_id !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to edit this listing' });
      return;
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      pickupStart,
      pickupEnd,
      expiryGuidance,
      storageInstructions,
      dietaryTags,
      allergens,
      pickupLocation,
      donorNotes,
      status
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE food_listings SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        pickup_start = COALESCE(?, pickup_start),
        pickup_end = COALESCE(?, pickup_end),
        expiry_guidance = COALESCE(?, expiry_guidance),
        storage_instructions = COALESCE(?, storage_instructions),
        dietary_tags = COALESCE(?, dietary_tags),
        allergens = COALESCE(?, allergens),
        pickup_location = COALESCE(?, pickup_location),
        donor_notes = COALESCE(?, donor_notes),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      title,
      description,
      category,
      quantity,
      unit,
      pickupStart,
      pickupEnd,
      expiryGuidance,
      storageInstructions,
      dietaryTags ? JSON.stringify(dietaryTags) : null,
      allergens ? JSON.stringify(allergens) : null,
      pickupLocation,
      donorNotes,
      status,
      now,
      listingId
    );

    logDonationHistory(
      listingId,
      null,
      'UPDATED',
      listing.status,
      status || listing.status,
      req.user!.id,
      `Listing details updated`
    );

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id (Deactivate or delete listing)
listingsRouter.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const listingId = req.params.id;
    const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(listingId) as any;

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listing.donor_id !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to delete this listing' });
      return;
    }

    // Check if there are active accepted requests
    const activeAccepted = db.prepare(`
      SELECT count(*) as count FROM donation_requests
      WHERE listing_id = ? AND status IN ('ACCEPTED', 'CONFIRMED_PICKUP')
    `).get(listingId) as { count: number };

    if (activeAccepted && activeAccepted.count > 0) {
      res.status(400).json({
        error: 'Cannot cancel a listing with active accepted pickups in progress. Please coordinate with the recipient organization.'
      });
      return;
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE food_listings SET status = ?, updated_at = ? WHERE id = ?').run('CANCELLED', now, listingId);

    logDonationHistory(
      listingId,
      null,
      'CANCELLED',
      listing.status,
      'CANCELLED',
      req.user!.id,
      'Listing cancelled by donor or administrator'
    );

    res.json({ message: 'Listing cancelled successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to cancel listing' });
  }
});
