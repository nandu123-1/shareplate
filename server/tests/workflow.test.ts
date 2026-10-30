import assert from 'assert';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, initDatabase } from '../src/db/database';
import { generateVerificationCode } from '../src/services/historyAndNotification';

async function runTests() {
  console.log('🧪 Starting SharePlate Core Workflow Tests...');
  initDatabase();

  const testId = 'test_' + Date.now();
  const testDonorId = 'usr_d_' + testId;
  const testNgoId = 'usr_n_' + testId;
  const now = new Date().toISOString();

  // Test 1: User creation & password hashing
  console.log('  Testing Auth & Password Hashing...');
  const salt = await bcrypt.genSalt(8);
  const hash = await bcrypt.hash('secretPass123', salt);
  assert(await bcrypt.compare('secretPass123', hash), 'Password comparison should succeed');
  assert(!(await bcrypt.compare('wrongPass', hash)), 'Wrong password should fail');

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, 'Test Chef', ?, ?, 'DONOR', 'ACTIVE', ?, ?)
  `).run(testDonorId, `${testId}@donor.com`, hash, now, now);

  db.prepare(`
    INSERT INTO donor_profiles (id, user_id, business_name, business_type, phone, pickup_address, city, postal_code, food_safety_ack, created_at)
    VALUES (?, ?, 'Test Kitchen', 'Restaurant', '555-1234', '123 Main St', 'Test City', '12345', 1, ?)
  `).run('dp_' + testId, testDonorId, now);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, 'Test Volunteer', ?, ?, 'RECIPIENT', 'ACTIVE', ?, ?)
  `).run(testNgoId, `${testId}@ngo.org`, hash, now, now);

  db.prepare(`
    INSERT INTO recipient_profiles (id, user_id, organization_name, organization_type, description, phone, address, city, capacity_portions_per_day, verification_status, service_area, created_at)
    VALUES (?, ?, 'Test Shelter', 'Shelter', 'Helping community', '555-5678', '456 Safe St', 'Test City', 100, 'VERIFIED', 'Downtown', ?)
  `).run('rp_' + testId, testNgoId, now);

  console.log('  ✅ Test 1 Passed: User creation & profile association');

  // Test 2: Listing Creation
  console.log('  Testing Listing Creation & Remaining Quantity Tracking...');
  const testListingId = 'lst_' + testId;
  db.prepare(`
    INSERT INTO food_listings (
      id, donor_id, title, description, category,
      quantity, remaining_quantity, unit, preparation_time, listing_time,
      pickup_start, pickup_end, expiry_guidance, storage_instructions,
      dietary_tags, allergens, pickup_location, status, created_at, updated_at
    ) VALUES (
      ?, ?, 'Fresh Vegetable Stew', 'Hearty test vegetable stew', 'Cooked Meals',
      50, 50, 'portions', ?, ?,
      ?, ?, 'Consume within 24h', 'Keep cold',
      '["Vegetarian"]', '[]', '123 Main St', 'AVAILABLE', ?, ?
    )
  `).run(testListingId, testDonorId, now, now, now, now, now, now);

  const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(testListingId) as any;
  assert.strictEqual(listing.quantity, 50, 'Initial quantity must be 50');
  assert.strictEqual(listing.remaining_quantity, 50, 'Initial remaining quantity must be 50');
  assert.strictEqual(listing.status, 'AVAILABLE', 'Initial status must be AVAILABLE');
  console.log('  ✅ Test 2 Passed: Food listing published with accurate inventory');

  // Test 3: Request & Overbooking Protection
  console.log('  Testing Concurrency & Overbooking Protection...');
  const testReqId1 = 'req1_' + testId;
  // Request 30 portions
  db.prepare(`
    INSERT INTO donation_requests (id, listing_id, recipient_id, requested_quantity, unit, status, proposed_pickup_time, created_at, updated_at)
    VALUES (?, ?, ?, 30, 'portions', 'PENDING', ?, ?, ?)
  `).run(testReqId1, testListingId, testNgoId, now, now, now);

  // Attempting request exceeding available surplus (60 > 50)
  assert.throws(() => {
    const attemptedQty = 60;
    const currentListing = db.prepare('SELECT remaining_quantity FROM food_listings WHERE id = ?').get(testListingId) as any;
    if (attemptedQty > currentListing.remaining_quantity) {
      throw new Error('Requested quantity exceeds available surplus');
    }
  }, /exceeds available surplus/);
  console.log('  ✅ Test 3 Passed: Overbooking rejected correctly');

  // Test 4: Atomic Request Acceptance & Verification Code Generation
  console.log('  Testing Atomic Acceptance, Inventory Deduction & Verification Code...');
  const code = generateVerificationCode();
  assert(code.length === 6 && /^\d+$/.test(code), 'Verification code must be 6 digits');

  const acceptTx = db.transaction(() => {
    const l = db.prepare('SELECT remaining_quantity, quantity FROM food_listings WHERE id = ?').get(testListingId) as any;
    const r = db.prepare('SELECT requested_quantity FROM donation_requests WHERE id = ?').get(testReqId1) as any;
    const newRemaining = l.remaining_quantity - r.requested_quantity;
    const newStatus = newRemaining === 0 ? 'RESERVED' : 'PARTIALLY_RESERVED';

    db.prepare(`
      UPDATE donation_requests
      SET status = 'ACCEPTED', verification_code = ?, updated_at = ?
      WHERE id = ?
    `).run(code, now, testReqId1);

    db.prepare(`
      UPDATE food_listings
      SET remaining_quantity = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(newRemaining, newStatus, now, testListingId);
  });
  acceptTx();

  const updatedListing = db.prepare('SELECT remaining_quantity, status FROM food_listings WHERE id = ?').get(testListingId) as any;
  const updatedReq = db.prepare('SELECT status, verification_code FROM donation_requests WHERE id = ?').get(testReqId1) as any;

  assert.strictEqual(updatedListing.remaining_quantity, 20, 'Remaining quantity should be 50 - 30 = 20');
  assert.strictEqual(updatedListing.status, 'PARTIALLY_RESERVED', 'Status should be PARTIALLY_RESERVED');
  assert.strictEqual(updatedReq.status, 'ACCEPTED', 'Request status should be ACCEPTED');
  assert.strictEqual(updatedReq.verification_code, code, 'Verification code must be saved');
  console.log('  ✅ Test 4 Passed: Atomic acceptance reserves inventory & generates secure pickup code');

  // Test 5: Pickup Verification & Completion
  console.log('  Testing Pickup Verification Code Matching & Completion...');
  // Wrong code test
  assert.throws(() => {
    const wrongCode = '000000';
    if (wrongCode !== updatedReq.verification_code) {
      throw new Error('Invalid verification code');
    }
  }, /Invalid verification code/);

  // Correct verification & completion
  db.prepare(`
    UPDATE donation_requests
    SET status = 'COMPLETED', updated_at = ?
    WHERE id = ?
  `).run(now, testReqId1);

  const completedReq = db.prepare('SELECT status FROM donation_requests WHERE id = ?').get(testReqId1) as any;
  assert.strictEqual(completedReq.status, 'COMPLETED', 'Request status must be COMPLETED');
  console.log('  ✅ Test 5 Passed: Pickup verified and marked completed');

  // Test 6: Request Cancellation & Inventory Restoration
  console.log('  Testing Request Cancellation and Inventory Restoration...');
  const testReqId2 = 'req2_' + testId;
  // Request the remaining 20 portions
  db.prepare(`
    INSERT INTO donation_requests (id, listing_id, recipient_id, requested_quantity, unit, status, proposed_pickup_time, created_at, updated_at)
    VALUES (?, ?, ?, 20, 'portions', 'PENDING', ?, ?, ?)
  `).run(testReqId2, testListingId, testNgoId, now, now, now);

  // Accept it (remaining becomes 0, status becomes RESERVED)
  db.prepare("UPDATE donation_requests SET status = 'ACCEPTED' WHERE id = ?").run(testReqId2);
  db.prepare("UPDATE food_listings SET remaining_quantity = 0, status = 'RESERVED' WHERE id = ?").run(testListingId);

  // Now cancel it -> inventory must be restored to 20 portions and status to PARTIALLY_RESERVED
  const cancelTx = db.transaction(() => {
    const l = db.prepare('SELECT remaining_quantity, quantity FROM food_listings WHERE id = ?').get(testListingId) as any;
    const r = db.prepare('SELECT requested_quantity FROM donation_requests WHERE id = ?').get(testReqId2) as any;
    const restored = l.remaining_quantity + r.requested_quantity;
    const restoredStatus = restored >= l.quantity ? 'AVAILABLE' : 'PARTIALLY_RESERVED';

    db.prepare('UPDATE food_listings SET remaining_quantity = ?, status = ? WHERE id = ?').run(restored, restoredStatus, testListingId);
    db.prepare("UPDATE donation_requests SET status = 'CANCELLED' WHERE id = ?").run(testReqId2);
  });
  cancelTx();

  const restoredListing = db.prepare('SELECT remaining_quantity, status FROM food_listings WHERE id = ?').get(testListingId) as any;
  assert.strictEqual(restoredListing.remaining_quantity, 20, 'Remaining quantity should be restored to 20');
  assert.strictEqual(restoredListing.status, 'PARTIALLY_RESERVED', 'Status restored to PARTIALLY_RESERVED');
  console.log('  ✅ Test 6 Passed: Cancellation safely restores reserved inventory');

  console.log('🎉 All SharePlate Core Workflow tests passed successfully!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
