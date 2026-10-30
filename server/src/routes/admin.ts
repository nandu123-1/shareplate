import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticateToken, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Apply admin guard to all routes
adminRouter.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/overview
adminRouter.get('/overview', (req: Request, res: Response) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const totalDonors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'DONOR'").get() as { count: number };
    const totalRecipients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'RECIPIENT'").get() as { count: number };
    const activeListings = db.prepare("SELECT COUNT(*) as count FROM food_listings WHERE status IN ('AVAILABLE', 'PARTIALLY_RESERVED')").get() as { count: number };
    const completedListings = db.prepare("SELECT COUNT(*) as count FROM food_listings WHERE status = 'COMPLETED'").get() as { count: number };
    const pendingRequests = db.prepare("SELECT COUNT(*) as count FROM donation_requests WHERE status = 'PENDING'").get() as { count: number };
    const completedPickups = db.prepare("SELECT COUNT(*) as count FROM donation_requests WHERE status = 'COMPLETED'").get() as { count: number };
    const openReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'PENDING'").get() as { count: number };

    // Total redistributed quantity
    const quantitySum = db.prepare(`
      SELECT SUM(requested_quantity) as total_qty FROM donation_requests WHERE status = 'COMPLETED'
    `).get() as { total_qty: number };

    // Status breakdown of listings
    const listingsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM food_listings GROUP BY status
    `).all();

    // Listings by category
    const listingsByCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM food_listings GROUP BY category
    `).all();

    res.json({
      metrics: {
        totalUsers: totalUsers.count,
        totalDonors: totalDonors.count,
        totalRecipients: totalRecipients.count,
        activeListings: activeListings.count,
        completedListings: completedListings.count,
        pendingRequests: pendingRequests.count,
        completedPickups: completedPickups.count,
        openReports: openReports.count,
        totalRedistributedQuantity: quantitySum.total_qty || 0,
        estimatedCo2PreventedKg: Math.round((quantitySum.total_qty || 0) * 0.4 * 2.5)
      },
      listingsByStatus,
      listingsByCategory
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin overview' });
  }
});

// GET /api/admin/users
adminRouter.get('/users', (req: Request, res: Response) => {
  try {
    const { role, status, search } = req.query;
    let query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at,
        dp.business_name, dp.business_type, dp.phone as donor_phone, dp.city as donor_city,
        rp.organization_name, rp.organization_type, rp.verification_status, rp.phone as recipient_phone, rp.city as recipient_city
      FROM users u
      LEFT JOIN donor_profiles dp ON u.id = dp.user_id
      LEFT JOIN recipient_profiles rp ON u.id = rp.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR dp.business_name LIKE ? OR rp.organization_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY u.created_at DESC`;
    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// PUT /api/admin/users/:id/status
adminRouter.put('/users/:id/status', (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid user status' });
      return;
    }

    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(
      status,
      new Date().toISOString(),
      userId
    );

    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const logs = db.prepare(`
      SELECT 
        h.*,
        u.name as performer_name,
        u.role as performer_role,
        l.title as listing_title
      FROM donation_history h
      JOIN users u ON h.performed_by_id = u.id
      JOIN food_listings l ON h.listing_id = l.id
      ORDER BY h.timestamp DESC
      LIMIT 100
    `).all();

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});
