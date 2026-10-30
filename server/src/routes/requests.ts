import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  logDonationHistory,
  createNotification,
  generateVerificationCode
} from '../services/historyAndNotification';

export const requestsRouter = Router();

const createRequestSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  requestedQuantity: z.number().positive('Requested quantity must be greater than zero'),
  proposedPickupTime: z.string().min(1, 'Proposed pickup time is required'),
  notes: z.string().optional()
});

// GET /api/requests/my-requests
requestsRouter.get('/my-requests', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = '';
    let params: any[] = [];

    if (role === 'RECIPIENT') {
      query = `
        SELECT 
          r.*,
          l.title AS listing_title,
          l.category AS listing_category,
          l.image_url AS listing_image_url,
          l.pickup_location AS listing_pickup_location,
          l.pickup_start AS listing_pickup_start,
          l.pickup_end AS listing_pickup_end,
          l.storage_instructions AS listing_storage_instructions,
          dp.business_name AS donor_business_name,
          dp.phone AS donor_phone
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        JOIN donor_profiles dp ON l.donor_id = dp.user_id
        WHERE r.recipient_id = ?
        ORDER BY r.created_at DESC
      `;
      params = [userId];
    } else if (role === 'DONOR') {
      query = `
        SELECT 
          r.*,
          l.title AS listing_title,
          l.category AS listing_category,
          l.remaining_quantity AS listing_remaining_quantity,
          l.pickup_location AS listing_pickup_location,
          rp.organization_name AS recipient_org_name,
          rp.organization_type AS recipient_org_type,
          rp.phone AS recipient_phone
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        JOIN recipient_profiles rp ON r.recipient_id = rp.user_id
        WHERE l.donor_id = ?
        ORDER BY r.created_at DESC
      `;
      params = [userId];
    } else {
      // ADMIN
      query = `
        SELECT 
          r.*,
          l.title AS listing_title,
          l.category AS listing_category,
          dp.business_name AS donor_business_name,
          rp.organization_name AS recipient_org_name
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        JOIN donor_profiles dp ON l.donor_id = dp.user_id
        JOIN recipient_profiles rp ON r.recipient_id = rp.user_id
        ORDER BY r.created_at DESC
      `;
    }

    const requests = db.prepare(query).all(...params);
    res.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve donation requests' });
  }
});

// POST /api/requests (Recipient creates request)
requestsRouter.post('/', authenticateToken, requireRole('RECIPIENT'), (req: Request, res: Response) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const recipientId = req.user!.id;

    // Concurrency-safe check inside a transaction
    const requestTx = db.transaction(() => {
      const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(data.listingId) as any;

      if (!listing) {
        throw new Error('Listing does not exist');
      }

      if (listing.status !== 'AVAILABLE' && listing.status !== 'PARTIALLY_RESERVED') {
        throw new Error(`This listing is currently ${listing.status.toLowerCase()} and cannot be requested.`);
      }

      if (data.requestedQuantity > listing.remaining_quantity) {
        throw new Error(
          `Requested quantity (${data.requestedQuantity} ${listing.unit}) exceeds available surplus (${listing.remaining_quantity} ${listing.unit}).`
        );
      }

      // Check if recipient already has an active pending or accepted request for this listing
      const existing = db.prepare(`
        SELECT id FROM donation_requests
        WHERE listing_id = ? AND recipient_id = ? AND status IN ('PENDING', 'ACCEPTED')
      `).get(data.listingId, recipientId);

      if (existing) {
        throw new Error('Your organization already has an active pending or accepted request for this food listing.');
      }

      const requestId = 'req_' + crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO donation_requests (
          id, listing_id, recipient_id, requested_quantity, unit,
          status, notes, proposed_pickup_time, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
      `).run(
        requestId,
        data.listingId,
        recipientId,
        data.requestedQuantity,
        listing.unit,
        data.notes || null,
        data.proposedPickupTime,
        now,
        now
      );

      // Audit history
      logDonationHistory(
        listing.id,
        requestId,
        'REQUESTED',
        listing.status,
        listing.status,
        recipientId,
        `Requested ${data.requestedQuantity} ${listing.unit} for pickup at ${data.proposedPickupTime}`
      );

      // Notify donor
      const recipientOrg = db.prepare('SELECT organization_name FROM recipient_profiles WHERE user_id = ?').get(recipientId) as any;
      const orgName = recipientOrg ? recipientOrg.organization_name : 'A verified organization';

      createNotification(
        listing.donor_id,
        'New Food Donation Request',
        `${orgName} requested ${data.requestedQuantity} ${listing.unit} of "${listing.title}".`,
        'REQUEST_RECEIVED',
        `/donor/requests`
      );

      return requestId;
    });

    const requestId = requestTx();
    res.status(201).json({
      message: 'Donation request submitted successfully',
      requestId
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Create request error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to submit request' });
  }
});

// POST /api/requests/:id/accept (Donor accepts request)
requestsRouter.post('/:id/accept', authenticateToken, requireRole('DONOR'), (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const donorId = req.user!.id;

    const acceptTx = db.transaction(() => {
      const request = db.prepare(`
        SELECT r.*, l.donor_id, l.title as listing_title, l.remaining_quantity, l.unit, l.status as listing_status
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        throw new Error('Donation request not found');
      }

      if (request.donor_id !== donorId) {
        throw new Error('Unauthorized: You are not the donor of this food listing');
      }

      if (request.status !== 'PENDING') {
        throw new Error(`Cannot accept request in status "${request.status}". Only pending requests can be accepted.`);
      }

      // Concurrency check on remaining quantity
      if (request.requested_quantity > request.remaining_quantity) {
        throw new Error(
          `Cannot accept: requested quantity (${request.requested_quantity} ${request.unit}) exceeds currently available surplus (${request.remaining_quantity} ${request.unit}).`
        );
      }

      const newRemaining = request.remaining_quantity - request.requested_quantity;
      const newListingStatus = newRemaining === 0 ? 'RESERVED' : 'PARTIALLY_RESERVED';
      const verificationCode = generateVerificationCode();
      const now = new Date().toISOString();

      // 1. Update request to ACCEPTED with verification code
      db.prepare(`
        UPDATE donation_requests
        SET status = 'ACCEPTED', verification_code = ?, updated_at = ?
        WHERE id = ?
      `).run(verificationCode, now, requestId);

      // 2. Atomically update food listing remaining quantity and status
      db.prepare(`
        UPDATE food_listings
        SET remaining_quantity = ?, status = ?, updated_at = ?
        WHERE id = ?
      `).run(newRemaining, newListingStatus, now, request.listing_id);

      // 3. Log history
      logDonationHistory(
        request.listing_id,
        requestId,
        'ACCEPTED',
        request.listing_status,
        newListingStatus,
        donorId,
        `Donor accepted request for ${request.requested_quantity} ${request.unit}. Verification code generated.`
      );

      // 4. Notify recipient
      createNotification(
        request.recipient_id,
        'Donation Request Accepted!',
        `Your request for ${request.requested_quantity} ${request.unit} of "${request.listing_title}" was accepted. Pickup code: ${verificationCode}.`,
        'REQUEST_ACCEPTED',
        `/recipient/pickups`
      );

      return { verificationCode, newRemaining, newListingStatus };
    });

    const result = acceptTx();
    res.json({
      message: 'Request accepted successfully. Quantity reserved.',
      ...result
    });
  } catch (error: any) {
    console.error('Accept request error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to accept request' });
  }
});

// POST /api/requests/:id/reject (Donor rejects request)
requestsRouter.post('/:id/reject', authenticateToken, requireRole('DONOR'), (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const donorId = req.user!.id;
    const { reason } = req.body;

    const rejectTx = db.transaction(() => {
      const request = db.prepare(`
        SELECT r.*, l.donor_id, l.title as listing_title, l.unit
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        throw new Error('Donation request not found');
      }

      if (request.donor_id !== donorId) {
        throw new Error('Unauthorized: You are not the donor of this food listing');
      }

      if (request.status !== 'PENDING') {
        throw new Error(`Cannot reject request in status "${request.status}". Only pending requests can be rejected.`);
      }

      const now = new Date().toISOString();

      db.prepare(`
        UPDATE donation_requests
        SET status = 'REJECTED', cancellation_reason = ?, updated_at = ?
        WHERE id = ?
      `).run(reason || 'Donor unable to fulfill request at this time', now, requestId);

      // Log history
      logDonationHistory(
        request.listing_id,
        requestId,
        'REJECTED',
        'PENDING',
        'REJECTED',
        donorId,
        `Donor rejected request: ${reason || 'Capacity/schedule constraint'}`
      );

      // Notify recipient
      createNotification(
        request.recipient_id,
        'Donation Request Declined',
        `Your request for "${request.listing_title}" was declined: ${reason || 'Donor could not fulfill at this time'}.`,
        'REQUEST_REJECTED',
        `/recipient/requests`
      );
    });

    rejectTx();
    res.json({ message: 'Request rejected' });
  } catch (error: any) {
    console.error('Reject request error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to reject request' });
  }
});

// POST /api/requests/:id/cancel (Recipient or Donor cancels request)
requestsRouter.post('/:id/cancel', authenticateToken, (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { reason } = req.body;

    const cancelTx = db.transaction(() => {
      const request = db.prepare(`
        SELECT r.*, l.donor_id, l.title as listing_title, l.remaining_quantity, l.quantity as total_quantity, l.unit, l.status as listing_status
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        throw new Error('Donation request not found');
      }

      const isRequester = request.recipient_id === userId;
      const isDonor = request.donor_id === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isRequester && !isDonor && !isAdmin) {
        throw new Error('Unauthorized to cancel this request');
      }

      if (request.status === 'COMPLETED' || request.status === 'CANCELLED' || request.status === 'REJECTED') {
        throw new Error(`Cannot cancel request in status "${request.status}"`);
      }

      const now = new Date().toISOString();

      // If it was ACCEPTED, restore remaining quantity to listing!
      if (request.status === 'ACCEPTED' || request.status === 'CONFIRMED_PICKUP') {
        const restoredQuantity = request.remaining_quantity + request.requested_quantity;
        const restoredStatus = restoredQuantity >= request.total_quantity ? 'AVAILABLE' : 'PARTIALLY_RESERVED';

        db.prepare(`
          UPDATE food_listings
          SET remaining_quantity = ?, status = ?, updated_at = ?
          WHERE id = ?
        `).run(restoredQuantity, restoredStatus, now, request.listing_id);

        logDonationHistory(
          request.listing_id,
          requestId,
          'QUANTITY_RESTORED',
          request.listing_status,
          restoredStatus,
          userId,
          `Restored ${request.requested_quantity} ${request.unit} surplus due to request cancellation.`
        );
      }

      db.prepare(`
        UPDATE donation_requests
        SET status = 'CANCELLED', cancellation_reason = ?, updated_at = ?
        WHERE id = ?
      `).run(reason || 'Cancelled by user', now, requestId);

      logDonationHistory(
        request.listing_id,
        requestId,
        'CANCELLED',
        request.status,
        'CANCELLED',
        userId,
        `Request cancelled: ${reason || 'No reason provided'}`
      );

      // Notify the other party
      const notifyUserId = isRequester ? request.donor_id : request.recipient_id;
      createNotification(
        notifyUserId,
        'Donation Request Cancelled',
        `A request for "${request.listing_title}" was cancelled (${reason || 'User cancelled'}).`,
        'REQUEST_CANCELLED',
        isRequester ? '/donor/requests' : '/recipient/requests'
      );
    });

    cancelTx();
    res.json({ message: 'Request cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel request error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to cancel request' });
  }
});
