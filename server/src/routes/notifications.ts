import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticateToken } from '../middleware/auth';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(userId) as { count: number };

    res.json({
      notifications,
      unreadCount: unreadCount ? unreadCount.count : 0
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', authenticateToken, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/read-all
notificationsRouter.put('/read-all', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});
