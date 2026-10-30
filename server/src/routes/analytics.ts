import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const analyticsRouter = Router();

// GET /api/analytics/impact (Public impact metrics)
analyticsRouter.get('/impact', (req: Request, res: Response) => {
  try {
    const completedListings = db.prepare("SELECT COUNT(*) as count FROM food_listings WHERE status = 'COMPLETED'").get() as { count: number };
    const completedPickups = db.prepare("SELECT COUNT(*) as count FROM donation_requests WHERE status = 'COMPLETED'").get() as { count: number };
    const totalDonors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'DONOR'").get() as { count: number };
    const totalRecipients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'RECIPIENT'").get() as { count: number };

    // Total redistributed quantity
    const qtyRow = db.prepare(`
      SELECT SUM(requested_quantity) as total_qty FROM donation_requests WHERE status = 'COMPLETED'
    `).get() as { total_qty: number };

    const totalRedistributedUnits = qtyRow.total_qty || 0;
    // Transparent conversion assumptions:
    // 1 portion ~= 0.40 kg edible food
    // 1 kg food waste diverted ~= 2.50 kg CO2 equivalent greenhouse gases avoided (FAO / WRAP standard)
    const estimatedKgRedistributed = Math.round(totalRedistributedUnits * 0.4);
    const estimatedCo2ePreventedKg = Math.round(estimatedKgRedistributed * 2.5);
    const estimatedMealsProvided = Math.round(totalRedistributedUnits);

    // Distribution by category
    const categoryStats = db.prepare(`
      SELECT 
        l.category, 
        COUNT(r.id) as collections_count, 
        COALESCE(SUM(r.requested_quantity), 0) as total_quantity
      FROM food_listings l
      JOIN donation_requests r ON l.id = r.listing_id
      WHERE r.status = 'COMPLETED'
      GROUP BY l.category
      ORDER BY total_quantity DESC
    `).all();

    // Recent completed activity timeline for public feed
    const recentActivity = db.prepare(`
      SELECT 
        h.id, h.timestamp, h.details,
        l.title as listing_title, l.category,
        dp.business_name as donor_business_name,
        rp.organization_name as recipient_org_name
      FROM donation_history h
      JOIN food_listings l ON h.listing_id = l.id
      JOIN donor_profiles dp ON l.donor_id = dp.user_id
      LEFT JOIN donation_requests r ON h.request_id = r.id
      LEFT JOIN recipient_profiles rp ON r.recipient_id = rp.user_id
      WHERE h.action = 'COMPLETED'
      ORDER BY h.timestamp DESC
      LIMIT 6
    `).all();

    res.json({
      metrics: {
        completedDonations: completedPickups.count || completedListings.count,
        totalPortionsRedistributed: totalRedistributedUnits,
        estimatedKgRedistributed,
        estimatedCo2ePreventedKg,
        estimatedMealsProvided,
        activeDonors: totalDonors.count,
        participatingOrganizations: totalRecipients.count,
        conversionAssumptions: {
          portionWeightKg: 0.4,
          co2FactorPerKg: 2.5,
          source: 'Standard FAO / WRAP food waste carbon displacement model'
        }
      },
      categoryStats,
      recentActivity
    });
  } catch (error) {
    console.error('Impact analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve impact metrics' });
  }
});
