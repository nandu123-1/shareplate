import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../data/shareplate.db');

// Ensure data folder exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('DONOR', 'RECIPIENT', 'ADMIN')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donor_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      phone TEXT NOT NULL,
      pickup_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      food_safety_ack INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipient_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_name TEXT NOT NULL,
      organization_type TEXT NOT NULL,
      description TEXT,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      capacity_portions_per_day INTEGER NOT NULL DEFAULT 100,
      verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK(verification_status IN ('VERIFIED', 'PENDING', 'REJECTED')),
      service_area TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS food_listings (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Cooked Meals', 'Fruits', 'Vegetables', 'Bakery', 'Packaged Food', 'Dairy', 'Grains', 'Other')),
      quantity REAL NOT NULL,
      remaining_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      preparation_time TEXT NOT NULL,
      listing_time TEXT NOT NULL,
      pickup_start TEXT NOT NULL,
      pickup_end TEXT NOT NULL,
      expiry_guidance TEXT NOT NULL,
      storage_instructions TEXT NOT NULL,
      dietary_tags TEXT, -- JSON string array
      allergens TEXT,    -- JSON string array
      pickup_location TEXT NOT NULL,
      image_url TEXT,
      donor_notes TEXT,
      status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'PARTIALLY_RESERVED', 'RESERVED', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'FLAGGED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donation_requests (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
      recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED_PICKUP', 'COMPLETED', 'CANCELLED')),
      notes TEXT,
      proposed_pickup_time TEXT NOT NULL,
      verification_code TEXT,
      cancellation_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donation_history (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
      request_id TEXT REFERENCES donation_requests(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      performed_by_id TEXT NOT NULL REFERENCES users(id),
      details TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id TEXT NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED')),
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    -- Indexes for high-speed queries and foreign keys
    CREATE INDEX IF NOT EXISTS idx_listings_donor ON food_listings(donor_id);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON food_listings(status);
    CREATE INDEX IF NOT EXISTS idx_listings_category ON food_listings(category);
    CREATE INDEX IF NOT EXISTS idx_requests_listing ON donation_requests(listing_id);
    CREATE INDEX IF NOT EXISTS idx_requests_recipient ON donation_requests(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON donation_requests(status);
    CREATE INDEX IF NOT EXISTS idx_history_listing ON donation_history(listing_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  `);

  console.log('Database tables and indexes initialized successfully.');
}
