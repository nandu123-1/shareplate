import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { logDonationHistory, createNotification } from '../services/historyAndNotification';

export const pickupsRouter = Router();

// GET /api/pickups/active
pickupsRouter.get('/active', authenticateToken, (req: Request, res: Response) => {
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
          l.expiry_guidance AS listing_expiry_guidance,
          l.donor_notes AS listing_donor_notes,
          dp.business_name AS donor_business_name,
          dp.phone AS donor_phone,
          dp.pickup_address AS donor_pickup_address
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        JOIN donor_profiles dp ON l.donor_id = dp.user_id
        WHERE r.recipient_id = ? AND r.status IN ('ACCEPTED', 'CONFIRMED_PICKUP')
        ORDER BY r.proposed_pickup_time ASC
      `;
      params = [userId];
    } else if (role === 'DONOR') {
      query = `
        SELECT 
          r.*,
          l.title AS listing_title,
          l.category AS listing_category,
          l.pickup_location AS listing_pickup_location,
          l.pickup_start AS listing_pickup_start,
          l.pickup_end AS listing_pickup_end,
          l.storage_instructions AS listing_storage_instructions,
          rp.organization_name AS recipient_org_name,
          rp.organization_type AS recipient_org_type,
          rp.phone AS recipient_phone,
          rp.address AS recipient_address
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        JOIN recipient_profiles rp ON r.recipient_id = rp.user_id
        WHERE l.donor_id = ? AND r.status IN ('ACCEPTED', 'CONFIRMED_PICKUP')
        ORDER BY r.proposed_pickup_time ASC
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
        WHERE r.status IN ('ACCEPTED', 'CONFIRMED_PICKUP')
        ORDER BY r.proposed_pickup_time ASC
      `;
    }

    const pickups = db.prepare(query).all(...params);
    res.json({ pickups });
  } catch (error) {
    console.error('Get active pickups error:', error);
    res.status(500).json({ error: 'Failed to retrieve active pickups' });
  }
});

// POST /api/pickups/:id/verify-and-complete
pickupsRouter.post('/:id/verify-and-complete', authenticateToken, (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { verificationCode, note } = req.body;

    const completeTx = db.transaction(() => {
      const request = db.prepare(`
        SELECT r.*, l.donor_id, l.title as listing_title, l.remaining_quantity, l.category, l.unit
        FROM donation_requests r
        JOIN food_listings l ON r.listing_id = l.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        throw new Error('Pickup request not found');
      }

      const isDonor = request.donor_id === userId;
      const isRecipient = request.recipient_id === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isDonor && !isRecipient && !isAdmin) {
        throw new Error('Unauthorized: You are not a participant in this pickup coordination');
      }

      if (request.status !== 'ACCEPTED' && request.status !== 'CONFIRMED_PICKUP') {
        throw new Error(`Cannot complete pickup in status "${request.status}". Only accepted pickups can be verified.`);
      }

      // If code was entered, verify it
      if (verificationCode) {
        const cleanInput = String(verificationCode).trim();
        const cleanActual = String(request.verification_code || '').trim();
        if (cleanInput !== cleanActual) {
          throw new Error('Incorrect 6-digit verification code. Please check with the recipient organization.');
        }
      }

      const now = new Date().toISOString();

      // 1. Mark request as COMPLETED
      db.prepare(`
        UPDATE donation_requests
        SET status = 'COMPLETED', updated_at = ?
        WHERE id = ?
      `).run(now, requestId);

      // 2. Check if the listing is fully distributed and has no other pending/accepted requests
      const otherActive = db.prepare(`
        SELECT COUNT(*) as count FROM donation_requests
        WHERE listing_id = ? AND id != ? AND status IN ('PENDING', 'ACCEPTED')
      `).get(request.listing_id, requestId) as { count: number };

      let listingMarkedCompleted = false;
      if (request.remaining_quantity === 0 && otherActive.count === 0) {
        db.prepare(`
          UPDATE food_listings
          SET status = 'COMPLETED', updated_at = ?
          WHERE id = ?
        `).run(now, request.listing_id);
        listingMarkedCompleted = true;
      }

      // 3. Log history
      logDonationHistory(
        request.listing_id,
        requestId,
        'COMPLETED',
        request.status,
        'COMPLETED',
        userId,
        `Food collection confirmed & completed. ${request.requested_quantity} ${request.unit} successfully redistributed! Note: ${note || 'Verified via handover code'}`
      );

      // 4. Notify both parties
      const estKg = request.unit === 'kg' ? request.requested_quantity : Math.round(request.requested_quantity * 0.4);
      const estCo2 = (estKg * 2.5).toFixed(1);

      createNotification(
        request.donor_id,
        'Donation Completed! 🎉',
        `Collection confirmed for ${request.requested_quantity} ${request.unit} of "${request.listing_title}". You saved approx ~${estKg} kg of food and prevented ~${estCo2} kg CO2e!`,
        'DONATION_COMPLETED',
        `/donor/history`
      );

      createNotification(
        request.recipient_id,
        'Collection Confirmed! 🎉',
        `Food successfully collected from donor for "${request.listing_title}". Thank you for feeding your community!`,
        'DONATION_COMPLETED',
        `/recipient/history`
      );

      return {
        completed: true,
        listingMarkedCompleted,
        quantity: request.requested_quantity,
        unit: request.unit,
        estimatedKgSaved: estKg,
        co2PreventedKg: estCo2
      };
    });

    const result = completeTx();
    res.json({
      message: 'Pickup verified and marked completed successfully!',
      ...result
    });
  } catch (error: any) {
    console.error('Verify pickup error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to complete pickup' });
  }
});
