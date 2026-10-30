import { db } from '../db/database';
import crypto from 'crypto';

export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  const id = 'notif_' + crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `);

  stmt.run(id, userId, title, message, type, link || null, createdAt);
  return id;
}

export function logDonationHistory(
  listingId: string,
  requestId: string | null,
  action: string,
  previousStatus: string | null,
  newStatus: string,
  performedById: string,
  details?: string
) {
  const id = 'hist_' + crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    listingId,
    requestId,
    action,
    previousStatus,
    newStatus,
    performedById,
    details || null,
    timestamp
  );
  return id;
}

export function generateVerificationCode(): string {
  // Generates 6-digit verification code e.g. "847291"
  return Math.floor(100000 + Math.random() * 900000).toString();
}
