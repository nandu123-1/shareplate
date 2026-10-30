import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database';

export async function seed() {
  console.log('Seeding SharePlate database with realistic demo data...');
  initDatabase();

  // Clear existing data cleanly
  db.exec(`
    DELETE FROM reports;
    DELETE FROM notifications;
    DELETE FROM donation_history;
    DELETE FROM donation_requests;
    DELETE FROM food_listings;
    DELETE FROM donor_profiles;
    DELETE FROM recipient_profiles;
    DELETE FROM users;
  `);

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);

  const now = new Date();
  const formatTime = (d: Date) => d.toISOString();

  // 1. Users & Profiles
  // Admin
  const adminId = 'usr_admin_001';
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?, ?)
  `).run(adminId, 'Sarah Jenkins (Admin)', 'admin@shareplate.org', adminPassword, formatTime(now), formatTime(now));

  // Donors
  const donors = [
    {
      id: 'usr_donor_001',
      name: 'Marco Rossi',
      email: 'donor@greenleaf.com',
      businessName: 'GreenLeaf Bistro & Catering',
      businessType: 'Restaurant & Catering',
      phone: '+1 (555) 234-5678',
      pickupAddress: '428 Artisan Blvd, Suite 101',
      city: 'Metro Central',
      postalCode: '90210'
    },
    {
      id: 'usr_donor_002',
      name: 'Claire Beauchamp',
      email: 'donor@thehearth.com',
      businessName: 'The Rustic Hearth Artisan Bakery',
      businessType: 'Bakery & Patisserie',
      phone: '+1 (555) 345-6789',
      pickupAddress: '112 Baker Way',
      city: 'Metro Central',
      postalCode: '90211'
    },
    {
      id: 'usr_donor_003',
      name: 'Jonathan Sterling',
      email: 'donor@harborgrand.com',
      businessName: 'Harbor Grand Hotel & Banquets',
      businessType: 'Hotel & Convention Center',
      phone: '+1 (555) 456-7890',
      pickupAddress: '800 Ocean Promenade',
      city: 'Bay District',
      postalCode: '90215'
    },
    {
      id: 'usr_donor_004',
      name: 'Elena Rostova',
      email: 'donor@freshharvest.com',
      businessName: 'FreshHarvest Organic Market',
      businessType: 'Supermarket & Grocer',
      phone: '+1 (555) 567-8901',
      pickupAddress: '304 Valley Road',
      city: 'North Hills',
      postalCode: '90220'
    },
    {
      id: 'usr_donor_005',
      name: 'David Kim',
      email: 'donor@metrokitchen.com',
      businessName: 'Community Central Kitchen Co.',
      businessType: 'Commercial Commissary Kitchen',
      phone: '+1 (555) 678-9012',
      pickupAddress: '77 Warehouse Row, Dock 4',
      city: 'Metro Central',
      postalCode: '90212'
    }
  ];

  for (const d of donors) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'DONOR', 'ACTIVE', ?, ?)
    `).run(d.id, d.name, d.email, commonPassword, formatTime(now), formatTime(now));

    db.prepare(`
      INSERT INTO donor_profiles (
        id, user_id, business_name, business_type, phone,
        pickup_address, city, postal_code, food_safety_ack, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run('dp_' + d.id, d.id, d.businessName, d.businessType, d.phone, d.pickupAddress, d.city, d.postalCode, formatTime(now));
  }

  // Recipients (NGOs)
  const recipients = [
    {
      id: 'usr_ngo_001',
      name: 'Rev. Thomas Bradley',
      email: 'ngo@hopehaven.org',
      orgName: 'Hope Haven Food Bank',
      orgType: 'Food Bank & Emergency Pantry',
      description: 'Serving over 400 vulnerable families and individuals daily across the metropolitan area with dignified nutritional aid.',
      phone: '+1 (555) 789-0123',
      address: '940 Compassion St',
      city: 'Metro Central',
      capacity: 350,
      serviceArea: 'Downtown & Metro East'
    },
    {
      id: 'usr_ngo_002',
      name: 'Alicia Morales',
      email: 'ngo@cityshelter.org',
      orgName: 'City Harvest Youth Shelter',
      orgType: 'Youth Center & Transitional Shelter',
      description: 'Providing safe shelter, nutritious hot meals, and social support for homeless and at-risk young adults.',
      phone: '+1 (555) 890-1234',
      address: '215 Horizon Ave',
      city: 'Bay District',
      capacity: 120,
      serviceArea: 'Bay District & Port Corridor'
    },
    {
      id: 'usr_ngo_003',
      name: 'Arthur Pendelton',
      email: 'ngo@sunshinemeals.org',
      orgName: 'Sunshine Senior Community Dining',
      orgType: 'Senior Citizen Meal Program',
      description: 'Dedicated to fighting senior isolation and malnutrition through daily hot, balanced community lunches and food basket deliveries.',
      phone: '+1 (555) 901-2345',
      address: '502 Golden Gate Terrace',
      city: 'North Hills',
      capacity: 180,
      serviceArea: 'North Hills & Suburbs'
    }
  ];

  for (const r of recipients) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'RECIPIENT', 'ACTIVE', ?, ?)
    `).run(r.id, r.name, r.email, commonPassword, formatTime(now), formatTime(now));

    db.prepare(`
      INSERT INTO recipient_profiles (
        id, user_id, organization_name, organization_type, description,
        phone, address, city, capacity_portions_per_day, verification_status,
        service_area, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, ?)
    `).run('rp_' + r.id, r.id, r.orgName, r.orgType, r.description, r.phone, r.address, r.city, r.capacity, r.serviceArea, formatTime(now));
  }

  // Helper date generators
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
  const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();

  // 2. Food Listings
  const listings = [
    {
      id: 'lst_001',
      donorId: 'usr_donor_001',
      title: 'Mediterranean Herb Roast Chicken & Steamed Vegetables',
      description: 'Over-catered corporate lunch. Oven-roasted free-range chicken breasts with rosemary, served with steamed carrots, broccoli, and quinoa pilaf. Freshly prepared, cooled following HACCP guidelines, and packed into individual aluminium trays.',
      category: 'Cooked Meals',
      quantity: 45,
      remaining_quantity: 45,
      unit: 'portions',
      preparationTime: hoursAgo(3),
      listingTime: hoursAgo(2),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(5),
      expiryGuidance: 'Consume within 24 hours. Reheat above 75°C before serving.',
      storageInstructions: 'Keep refrigerated between 2°C and 4°C during transport.',
      dietaryTags: ['Halal', 'Gluten-Free', 'High Protein'],
      allergens: ['Celery'],
      pickupLocation: '428 Artisan Blvd, Rear Kitchen Loading Bay (Ring Bell #2)',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Please bring insulated thermal carriers.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_002',
      donorId: 'usr_donor_002',
      title: 'Artisan Sourdough Boules & Whole Wheat Batards',
      description: 'Unsold freshly baked daily bread assortment. Crisp golden crust with open tender crumb. Baked this morning at 5:00 AM using stoneground organic flour.',
      category: 'Bakery',
      quantity: 32,
      remaining_quantity: 32,
      unit: 'loaves',
      preparationTime: hoursAgo(10),
      listingTime: hoursAgo(4),
      pickupStart: hoursAgo(2),
      pickupEnd: hoursFromNow(6),
      expiryGuidance: 'Best consumed within 3 days or slice and freeze.',
      storageInstructions: 'Room temperature dry storage. Avoid plastic bag moisture build-up.',
      dietaryTags: ['Vegan', 'Dairy-Free', 'Organic'],
      allergens: ['Gluten (Wheat)'],
      pickupLocation: '112 Baker Way, Front Entrance Counter',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Pre-bagged in paper sacks for easy loading.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_003',
      donorId: 'usr_donor_004',
      title: 'Assorted Seasonal Organic Fruit & Citrus Crates',
      description: 'Surplus organic produce boxes including ripe bananas, Gala apples, navel oranges, and ripe Bartlett pears. Perfectly edible and sweet, with minor cosmetic skin variations.',
      category: 'Fruits',
      quantity: 60,
      remaining_quantity: 60,
      unit: 'kg',
      preparationTime: hoursAgo(6),
      listingTime: hoursAgo(3),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(8),
      expiryGuidance: 'Ideal for immediate fresh consumption, fruit salads, or smoothie prep within 4 days.',
      storageInstructions: 'Cool dry ambient storage (10°C - 15°C).',
      dietaryTags: ['Raw', 'Vegan', 'Organic', 'Non-GMO'],
      allergens: [],
      pickupLocation: '304 Valley Road, Produce Loading Bay #1',
      imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Stacked in standard wooden produce crates.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_004',
      donorId: 'usr_donor_003',
      title: 'Gourmet Vegetable Lasagna with Ricotta & Spinach',
      description: 'Executive banquet surplus. Fresh pasta sheets layered with san marzano tomato reduction, whole milk ricotta, wilted baby spinach, and mozzarella cheese.',
      category: 'Cooked Meals',
      quantity: 50,
      remaining_quantity: 20, // 30 portions already accepted and in pickup!
      unit: 'portions',
      preparationTime: hoursAgo(4),
      listingTime: hoursAgo(3),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(4),
      expiryGuidance: 'Store cold and consume within 36 hours. Heat to core temp 75°C.',
      storageInstructions: 'Chilled transport mandatory (< 5°C).',
      dietaryTags: ['Vegetarian'],
      allergens: ['Dairy', 'Gluten', 'Eggs'],
      pickupLocation: '800 Ocean Promenade, Hotel Service Entrance / Culinary Staging Area',
      imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Portioned in 5 catering hotel pans of 10 portions each.',
      status: 'PARTIALLY_RESERVED'
    },
    {
      id: 'lst_005',
      donorId: 'usr_donor_005',
      title: 'Freshly Prepared Lentil & Sweet Potato Curry with Basmati Rice',
      description: 'Nutritious vegan yellow dal curry simmered with turmeric, coconut milk, roasted sweet potatoes, and cumin. Comes with fragrant steamed basmati rice.',
      category: 'Cooked Meals',
      quantity: 80,
      remaining_quantity: 80,
      unit: 'portions',
      preparationTime: hoursAgo(2),
      listingTime: hoursAgo(1),
      pickupStart: hoursFromNow(1),
      pickupEnd: hoursFromNow(7),
      expiryGuidance: 'Reheat thoroughly before serving. Best within 48 hours chilled.',
      storageInstructions: 'Hot hold ready (> 63°C) or rapid-chill if collecting after 6 PM.',
      dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'High Fiber'],
      allergens: [],
      pickupLocation: '77 Warehouse Row, Dock 4 (Commercial Kitchen Entrance)',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Packed in two large Cambro insulated thermal beverage/soup dispensers.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_006',
      donorId: 'usr_donor_004',
      title: 'Fresh Farm Spinach, Crisp Romaine & Mixed Salad Greens',
      description: 'Harvest surplus washed and bagged crisp leafy greens. High moisture content, ideal for family food boxes or community salad service.',
      category: 'Vegetables',
      quantity: 25,
      remaining_quantity: 25,
      unit: 'kg',
      preparationTime: hoursAgo(8),
      listingTime: hoursAgo(5),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(12),
      expiryGuidance: 'Keep crisp in refrigeration; consume within 5 days.',
      storageInstructions: 'Refrigerated crisper (3°C - 5°C).',
      dietaryTags: ['Raw', 'Vegan', 'Organic'],
      allergens: [],
      pickupLocation: '304 Valley Road, Produce Dept Counter',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Pre-washed in chlorine-free ozonated water.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_007',
      donorId: 'usr_donor_001',
      title: 'Almond & Butter Croissants & Danish Pastry Selection',
      description: 'Morning pastry assortment from breakfast catering. Crisp layered buttery viennoiserie with almond cream and fruit fillings.',
      category: 'Bakery',
      quantity: 40,
      remaining_quantity: 40,
      unit: 'pieces',
      preparationTime: hoursAgo(7),
      listingTime: hoursAgo(4),
      pickupStart: hoursAgo(2),
      pickupEnd: hoursFromNow(5),
      expiryGuidance: 'Best consumed within 24 hours. Can be warmed in oven at 180°C for 3 mins.',
      storageInstructions: 'Dry ambient storage.',
      dietaryTags: ['Vegetarian'],
      allergens: ['Gluten', 'Dairy', 'Tree Nuts (Almonds)', 'Eggs'],
      pickupLocation: '428 Artisan Blvd, Front Cashier',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Packed in 4 bakery catering boxes.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_008',
      donorId: 'usr_donor_004',
      title: 'Organic Whole Milk & Low-Fat Greek Yogurts',
      description: 'Dairy case stock nearing 4 days before sell-by date. Pasteurized grade A whole milk cartons and 500g pots of plain Greek yogurt.',
      category: 'Dairy',
      quantity: 35,
      remaining_quantity: 35,
      unit: 'liters',
      preparationTime: hoursAgo(12),
      listingTime: hoursAgo(6),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(10),
      expiryGuidance: 'Keep strictly refrigerated. Use within 5 days.',
      storageInstructions: 'Continuous cold chain required (1°C - 4°C).',
      dietaryTags: ['Vegetarian', 'Gluten-Free', 'Organic'],
      allergens: ['Dairy (Cow Milk)'],
      pickupLocation: '304 Valley Road, Cold Storage Dock #2',
      imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Cold packs available upon request.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_009',
      donorId: 'usr_donor_003',
      title: 'Quinoa Grain Bowls with Roasted Chickpeas & Tahini',
      description: 'Conference boxed lunch overflow. Healthy grain salad with tricolor quinoa, lemon roasted chickpeas, cherry tomatoes, and tahini vinaigrette cups.',
      category: 'Grains',
      quantity: 30,
      remaining_quantity: 30,
      unit: 'boxes',
      preparationTime: hoursAgo(5),
      listingTime: hoursAgo(2),
      pickupStart: hoursAgo(1),
      pickupEnd: hoursFromNow(6),
      expiryGuidance: 'Ready-to-eat cold. Consume within 48 hours.',
      storageInstructions: 'Refrigerated between 2°C and 5°C.',
      dietaryTags: ['Vegan', 'Gluten-Free', 'High Protein'],
      allergens: ['Sesame (Tahini)'],
      pickupLocation: '800 Ocean Promenade, Banquet Service Desk',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Individually labeled compostable biodegradable bowls.',
      status: 'AVAILABLE'
    },
    {
      id: 'lst_010',
      donorId: 'usr_donor_005',
      title: 'Pantry Dry Staples: Brown Rice, Dried Black Beans & Oats',
      description: 'Surplus unbroken food-service packaging of non-perishable pantry essentials: 10kg bags of organic long-grain brown rice, 5kg bags of dry black beans, and rolled oats.',
      category: 'Packaged Food',
      quantity: 50,
      remaining_quantity: 50,
      unit: 'kg',
      preparationTime: hoursAgo(24),
      listingTime: hoursAgo(12),
      pickupStart: hoursAgo(4),
      pickupEnd: hoursFromNow(24),
      expiryGuidance: 'Long shelf life (> 8 months).',
      storageInstructions: 'Ambient dry pantry storage away from pest and moisture.',
      dietaryTags: ['Vegan', 'Gluten-Free', 'Kosher'],
      allergens: [],
      pickupLocation: '77 Warehouse Row, Main Loading Ramp',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Forklift pallet loading assistance available.',
      status: 'AVAILABLE'
    },
    // Completed listing for demonstration history
    {
      id: 'lst_011_completed',
      donorId: 'usr_donor_001',
      title: 'Creamy Butternut Squash Soup & Baguette Rolls',
      description: 'Hearty roasted squash soup flavored with nutmeg and sage, served with freshly baked French rolls.',
      category: 'Cooked Meals',
      quantity: 50,
      remaining_quantity: 0,
      unit: 'portions',
      preparationTime: hoursAgo(48),
      listingTime: hoursAgo(46),
      pickupStart: hoursAgo(44),
      pickupEnd: hoursAgo(40),
      expiryGuidance: 'Consumed safely.',
      storageInstructions: 'Insulated hot containers.',
      dietaryTags: ['Vegetarian'],
      allergens: ['Gluten', 'Dairy'],
      pickupLocation: '428 Artisan Blvd',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
      donorNotes: 'Donation complete.',
      status: 'COMPLETED'
    }
  ];

  for (const l of listings) {
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
        ?, ?, ?
      )
    `).run(
      l.id,
      l.donorId,
      l.title,
      l.description,
      l.category,
      l.quantity,
      l.remaining_quantity,
      l.unit,
      l.preparationTime,
      l.listingTime,
      l.pickupStart,
      l.pickupEnd,
      l.expiryGuidance,
      l.storageInstructions,
      JSON.stringify(l.dietaryTags),
      JSON.stringify(l.allergens),
      l.pickupLocation,
      l.imageUrl,
      l.donorNotes,
      l.status,
      l.listingTime,
      l.listingTime
    );

    // Initial listing audit history
    db.prepare(`
      INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
      VALUES (?, ?, NULL, 'LISTED', NULL, 'AVAILABLE', ?, ?, ?)
    `).run(
      'hist_init_' + l.id,
      l.id,
      l.donorId,
      `Published surplus food listing: ${l.quantity} ${l.unit} of ${l.title}`,
      l.listingTime
    );
  }

  // 3. Requests & Pickup Scenarios
  // Scenario A: Active Accepted Pickup with 6-digit verification code ready for demonstration!
  const reqAcceptedId = 'req_demo_accepted_01';
  const verificationCode = '582914';
  db.prepare(`
    INSERT INTO donation_requests (
      id, listing_id, recipient_id, requested_quantity, unit,
      status, notes, proposed_pickup_time, verification_code, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'ACCEPTED', ?, ?, ?, ?, ?)
  `).run(
    reqAcceptedId,
    'lst_004', // Gourmet Lasagna
    'usr_ngo_001', // Hope Haven Food Bank
    30,
    'portions',
    'We will collect with our refrigerated food rescue van at 3:30 PM for our evening shelter dinner service.',
    hoursFromNow(2),
    verificationCode,
    hoursAgo(2),
    hoursAgo(1)
  );

  db.prepare(`
    INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
    VALUES (?, ?, ?, 'REQUESTED', 'AVAILABLE', 'AVAILABLE', 'usr_ngo_001', 'Requested 30 portions for community dinner', ?)
  `).run('hist_req_01', 'lst_004', reqAcceptedId, hoursAgo(2));

  db.prepare(`
    INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
    VALUES (?, ?, ?, 'ACCEPTED', 'AVAILABLE', 'PARTIALLY_RESERVED', 'usr_donor_003', 'Donor accepted request. Verification code generated: ${verificationCode}', ?)
  `).run('hist_acc_01', 'lst_004', reqAcceptedId, hoursAgo(1));

  // Scenario B: Pending Request awaiting donor review
  const reqPendingId = 'req_demo_pending_02';
  db.prepare(`
    INSERT INTO donation_requests (
      id, listing_id, recipient_id, requested_quantity, unit,
      status, notes, proposed_pickup_time, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
  `).run(
    reqPendingId,
    'lst_001', // Roast Chicken
    'usr_ngo_002', // City Harvest Youth Shelter
    20,
    'portions',
    'Would love to include this in our transitional housing dinner program tonight.',
    hoursFromNow(3),
    hoursAgo(1),
    hoursAgo(1)
  );

  db.prepare(`
    INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
    VALUES (?, ?, ?, 'REQUESTED', 'AVAILABLE', 'AVAILABLE', 'usr_ngo_002', 'Submitted request for 20 portions', ?)
  `).run('hist_req_02', 'lst_001', reqPendingId, hoursAgo(1));

  // Scenario C: Completed Donation record
  const reqCompletedId = 'req_demo_completed_03';
  db.prepare(`
    INSERT INTO donation_requests (
      id, listing_id, recipient_id, requested_quantity, unit,
      status, notes, proposed_pickup_time, verification_code, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'COMPLETED', ?, ?, '419203', ?, ?)
  `).run(
    reqCompletedId,
    'lst_011_completed',
    'usr_ngo_003', // Sunshine Senior Meals
    50,
    'portions',
    'Collected and distributed to 50 seniors.',
    hoursAgo(42),
    hoursAgo(45),
    hoursAgo(41)
  );

  db.prepare(`
    INSERT INTO donation_history (id, listing_id, request_id, action, previous_status, new_status, performed_by_id, details, timestamp)
    VALUES (?, ?, ?, 'COMPLETED', 'ACCEPTED', 'COMPLETED', 'usr_donor_001', 'Pickup verified and completed. 50 portions (~20kg) redistributed.', ?)
  `).run('hist_comp_03', 'lst_011_completed', reqCompletedId, hoursAgo(41));

  // 4. Sample Notifications
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    'notif_001',
    'usr_donor_001',
    'New Food Donation Request',
    'City Harvest Youth Shelter requested 20 portions of "Mediterranean Herb Roast Chicken".',
    'REQUEST_RECEIVED',
    '/donor/requests',
    hoursAgo(1)
  );

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    'notif_002',
    'usr_ngo_001',
    'Donation Request Accepted! 🎉',
    `Your request for 30 portions of "Gourmet Vegetable Lasagna" was accepted. Pickup code: ${verificationCode}.`,
    'REQUEST_ACCEPTED',
    '/recipient/pickups',
    hoursAgo(1)
  );

  // 5. Sample Report for Admin Moderation
  db.prepare(`
    INSERT INTO reports (id, reporter_id, listing_id, reason, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
  `).run(
    'rep_demo_001',
    'usr_ngo_002',
    'lst_003',
    'Inaccurate quantity/details',
    'Note for admin: Donor updated quantity from 80kg to 60kg due to earlier internal staff allocation; please verify listing remaining weight.',
    hoursAgo(2)
  );

  console.log('✅ SharePlate database seeded successfully!');
  console.log('Demo Accounts:');
  console.log('  Admin: admin@shareplate.org / admin123');
  console.log('  Donor: donor@greenleaf.com / password123 (Restaurant)');
  console.log('  Donor: donor@thehearth.com / password123 (Bakery)');
  console.log('  Recipient: ngo@hopehaven.org / password123 (Food Bank)');
  console.log('  Recipient: ngo@cityshelter.org / password123 (Youth Shelter)');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
