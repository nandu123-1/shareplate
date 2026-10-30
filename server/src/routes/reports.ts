import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logDonationHistory, createNotification } from '../services/historyAndNotification';

export const reportsRouter = Router();

const createReportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum([
    'Spoiled or unsafe food',
    'Inaccurate quantity/details',
    'Inaccessible pickup',
    'Spam or non-food',
    'Other'
  ]),
  description: z.string().min(5, 'Please provide more details in description')
});

// POST /api/reports
reportsRouter.post('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const data = createReportSchema.parse(req.body);
    const reporterId = req.user!.id;
    const reportId = 'rep_' + crypto.randomUUID();
    const now = new Date().toISOString();

    const listing = db.prepare('SELECT id, title, donor_id FROM food_listings WHERE id = ?').get(data.listingId) as any;
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    db.prepare(`
      INSERT INTO reports (id, reporter_id, listing_id, reason, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(reportId, reporterId, data.listingId, data.reason, data.description, now);

    // Notify admins
    const admins = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").all() as any[];
    for (const admin of admins) {
      createNotification(
        admin.id,
        'New Listing Report Filed',
        `Report received on "${listing.title}" for "${data.reason}".`,
        'ADMIN_ALERT',
        '/admin/reports'
      );
    }

    res.status(201).json({
      message: 'Report submitted. Our moderation team will review this shortly.',
      reportId
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports (Admin only)
reportsRouter.get('/', authenticateToken, requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const reports = db.prepare(`
      SELECT 
        rep.*,
        u.name as reporter_name,
        u.email as reporter_email,
        l.title as listing_title,
        l.status as listing_status,
        dp.business_name as donor_business_name
      FROM reports rep
      JOIN users u ON rep.reporter_id = u.id
      JOIN food_listings l ON rep.listing_id = l.id
      JOIN donor_profiles dp ON l.donor_id = dp.user_id
      ORDER BY rep.created_at DESC
    `).all();

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to retrieve reports' });
  }
});

// PUT /api/reports/:id/resolve (Admin only)
reportsRouter.put('/:id/resolve', authenticateToken, requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const { status, adminNotes, deactivateListing } = req.body;
    const now = new Date().toISOString();

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId) as any;
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    db.prepare(`
      UPDATE reports
      SET status = ?, admin_notes = ?, resolved_at = ?
      WHERE id = ?
    `).run(status || 'ACTION_TAKEN', adminNotes || 'Reviewed by admin', now, reportId);

    if (deactivateListing) {
      db.prepare("UPDATE food_listings SET status = 'FLAGGED', updated_at = ? WHERE id = ?").run(now, report.listing_id);
      logDonationHistory(
        report.listing_id,
        null,
        'MODERATED',
        'AVAILABLE',
        'FLAGGED',
        req.user!.id,
        `Listing flagged and taken down by admin: ${adminNotes || 'Report action taken'}`
      );
    }

    res.json({ message: 'Report resolved successfully' });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});
