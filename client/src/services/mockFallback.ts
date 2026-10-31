// Client-side persistent mock fallback for Vercel static deployments
// Automatically used when the backend API is unreachable or deployed on static CDN.

interface MockState {
  users: any[];
  donorProfiles: any[];
  recipientProfiles: any[];
  listings: any[];
  requests: any[];
  notifications: any[];
  reports: any[];
  auditLogs: any[];
}

const STORAGE_KEY = 'shareplate_vercel_store_v1';

function getDefaultState(): MockState {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'usr_donor_1',
        name: 'Marco Rossi',
        email: 'donor@greenleaf.com',
        role: 'DONOR',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_donor_2',
        name: 'Elena Rostova',
        email: 'donor@thehearth.com',
        role: 'DONOR',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_ngo_1',
        name: 'Sarah Jenkins',
        email: 'ngo@hopehaven.org',
        role: 'RECIPIENT',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_ngo_2',
        name: 'David Kalu',
        email: 'ngo@cityshelter.org',
        role: 'RECIPIENT',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_admin_1',
        name: 'Alex Rivera',
        email: 'admin@shareplate.org',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      }
    ],
    donorProfiles: [
      {
        id: 'dp_1',
        user_id: 'usr_donor_1',
        business_name: 'GreenLeaf Bistro & Catering',
        business_type: 'RESTAURANT',
        phone: '+1 (555) 234-5678',
        pickup_address: '452 Organic Way, Suite 100',
        city: 'Metro City',
        postal_code: '94103',
        description: 'Sustainable farm-to-table bistro preparing fresh seasonal surplus.'
      },
      {
        id: 'dp_2',
        user_id: 'usr_donor_2',
        business_name: 'The Rustic Hearth Bakery',
        business_type: 'BAKERY',
        phone: '+1 (555) 876-5432',
        pickup_address: '118 Mill Lane',
        city: 'Metro City',
        postal_code: '94107',
        description: 'Artisan bakery producing sourdoughs, baguettes, and fresh pastries daily.'
      }
    ],
    recipientProfiles: [
      {
        id: 'rp_1',
        user_id: 'usr_ngo_1',
        organization_name: 'Hope Haven Food Bank',
        organization_type: 'FOOD_BANK',
        registration_number: 'NGO-882910-US',
        phone: '+1 (555) 345-6789',
        address: '890 Community Blvd',
        city: 'Metro City',
        postal_code: '94105',
        verified: true,
        beneficiary_count: 450
      },
      {
        id: 'rp_2',
        user_id: 'usr_ngo_2',
        organization_name: 'City Harvest Youth Shelter',
        organization_type: 'SHELTER',
        registration_number: 'NGO-443918-US',
        phone: '+1 (555) 901-2345',
        address: '23 Hope Street',
        city: 'Metro City',
        postal_code: '94102',
        verified: true,
        beneficiary_count: 180
      }
    ],
    listings: [
      {
        id: 'lst_1',
        donor_id: 'usr_donor_1',
        donor_business_name: 'GreenLeaf Bistro & Catering',
        donor_city: 'San Francisco, CA',
        donor_phone: '+1 (555) 234-5678',
        donor_pickup_address: '452 Organic Way',
        title: 'Pre-packaged Chef Bento Meals',
        description: 'Nutritious balanced boxes with grilled chicken breast, quinoa pilaf, and steamed seasonal vegetables.',
        category: 'Cooked Meals',
        quantity: 25,
        remaining_quantity: 10,
        unit: 'portions',
        preparation_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        listing_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        expiry_guidance: 'Consume within 24 hours. Keep refrigerated below 4°C.',
        pickup_location: 'GreenLeaf Bistro, 452 Organic Way (Kitchen Back Door)',
        pickup_start: new Date(Date.now() + 3600000).toISOString(),
        pickup_end: new Date(Date.now() + 3600000 * 5).toISOString(),
        status: 'AVAILABLE',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        storage_instructions: 'Keep refrigerated below 4°C',
        dietary_tags: ['Gluten-Free', 'Organic', 'High-Protein'],
        allergens: ['None declared (Gluten-free kitchen)'],
        donor_notes: 'Ring the buzzer at service delivery entrance.',
        created_at: now,
        updated_at: now
      },
      {
        id: 'lst_2',
        donor_id: 'usr_donor_2',
        donor_business_name: 'The Rustic Hearth Bakery',
        donor_city: 'Oakland, CA',
        donor_phone: '+1 (555) 876-5432',
        donor_pickup_address: '118 Mill Lane',
        title: 'Artisan Sourdough & Croissants',
        description: 'Daily fresh batch of naturally fermented sourdough boules, pain de campagne, and butter croissants baked this morning.',
        category: 'Bakery',
        quantity: 35,
        remaining_quantity: 35,
        unit: 'loaves & pastries',
        preparation_time: new Date(Date.now() - 3600000 * 5).toISOString(),
        listing_time: new Date(Date.now() - 3600000 * 5).toISOString(),
        expiry_guidance: 'Best consumed within 3 days. Store at room temperature in a dry container.',
        pickup_location: 'The Rustic Hearth Bakery, 118 Mill Lane',
        pickup_start: new Date(Date.now() + 1800000).toISOString(),
        pickup_end: new Date(Date.now() + 3600000 * 6).toISOString(),
        status: 'AVAILABLE',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        storage_instructions: 'Room temperature dry storage',
        dietary_tags: ['Vegetarian', 'Freshly Baked'],
        allergens: ['Wheat', 'Gluten', 'Dairy'],
        donor_notes: 'Packaged in food-grade bakery crates. Bring vehicle.',
        created_at: now,
        updated_at: now
      },
      {
        id: 'lst_3',
        donor_id: 'usr_donor_1',
        donor_business_name: 'GreenLeaf Bistro & Catering',
        donor_city: 'San Francisco, CA',
        donor_phone: '+1 (555) 234-5678',
        donor_pickup_address: '452 Organic Way',
        title: 'Surplus Organic Produce Crate',
        description: 'Grade-A heirloom tomatoes, avocados, English cucumbers, baby spinach, and crisp bell peppers from our farm delivery.',
        category: 'Fruits & Vegetables',
        quantity: 18,
        remaining_quantity: 18,
        unit: 'kg',
        preparation_time: new Date(Date.now() - 3600000 * 1).toISOString(),
        listing_time: new Date(Date.now() - 3600000 * 1).toISOString(),
        expiry_guidance: 'Fresh produce. 5 days shelf life in cool storage.',
        pickup_location: 'GreenLeaf Bistro, 452 Organic Way',
        pickup_start: new Date(Date.now() + 3600000 * 2).toISOString(),
        pickup_end: new Date(Date.now() + 3600000 * 7).toISOString(),
        status: 'AVAILABLE',
        image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
        storage_instructions: 'Cool dry pantry or refrigeration',
        dietary_tags: ['Vegan', 'Organic', 'Raw'],
        allergens: ['None'],
        donor_notes: 'Stored in clean reusable produce totes.',
        created_at: now,
        updated_at: now
      },
      {
        id: 'lst_4',
        donor_id: 'usr_donor_2',
        donor_business_name: 'Harbor Dairy & Deli',
        donor_city: 'Berkeley, CA',
        donor_phone: '+1 (555) 345-6789',
        donor_pickup_address: '890 Pier Marina',
        title: 'Organic Greek Yogurt & Artisanal Cheeses',
        description: 'Surplus pasture-raised whole milk Greek yogurt tubs and aged cheddar blocks, unpasteurized cold chain intact.',
        category: 'Dairy',
        quantity: 40,
        remaining_quantity: 40,
        unit: 'containers',
        preparation_time: new Date(Date.now() - 3600000 * 4).toISOString(),
        listing_time: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiry_guidance: 'Keep chilled below 3°C. Best before 7 days.',
        pickup_location: 'Harbor Dairy & Deli, 890 Pier Marina',
        pickup_start: new Date(Date.now() + 3600000 * 1).toISOString(),
        pickup_end: new Date(Date.now() + 3600000 * 8).toISOString(),
        status: 'AVAILABLE',
        image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80',
        storage_instructions: 'Cold storage refrigerator mandatory',
        dietary_tags: ['Vegetarian', 'Gluten-Free', 'High Calcium'],
        allergens: ['Dairy (Cow Milk)'],
        donor_notes: 'Please bring insulated thermal bags or cooler.',
        created_at: now,
        updated_at: now
      },
      {
        id: 'lst_5',
        donor_id: 'usr_donor_1',
        donor_business_name: 'Mediterranean Sun Kitchen',
        donor_city: 'San Francisco, CA',
        donor_phone: '+1 (555) 987-6543',
        donor_pickup_address: '224 Mission St',
        title: 'Mediterranean Grain Bowls & Hummus',
        description: 'Warm roasted chickpeas, tahini lemon dressing, farro grain blend, and Kalamata olives in eco-friendly compostable containers.',
        category: 'Cooked Meals',
        quantity: 30,
        remaining_quantity: 25,
        unit: 'bowls',
        preparation_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        listing_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        expiry_guidance: 'Eat within 24 hours. Microwave heat safe.',
        pickup_location: 'Mediterranean Sun Kitchen, 224 Mission St',
        pickup_start: new Date(Date.now() + 3600000 * 1).toISOString(),
        pickup_end: new Date(Date.now() + 3600000 * 5).toISOString(),
        status: 'AVAILABLE',
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        storage_instructions: 'Keep chilled below 4°C until reheat',
        dietary_tags: ['Vegan', 'Halal', 'High Fiber'],
        allergens: ['Sesame (Tahini)'],
        donor_notes: 'Loading bay is free for food rescue vehicles.',
        created_at: now,
        updated_at: now
      }
    ],
    requests: [
      {
        id: 'req_1',
        listing_id: 'lst_1',
        recipient_id: 'usr_ngo_1',
        requested_quantity: 15,
        status: 'ACCEPTED',
        proposed_pickup_time: new Date(Date.now() + 3600000 * 3).toISOString(),
        notes: 'For our Friday night hot community meal distribution program.',
        verification_code: '492815',
        listing_title: 'Pre-packaged Chef Bento Meals',
        donor_business_name: 'GreenLeaf Bistro & Catering',
        listing_pickup_location: 'GreenLeaf Bistro, 452 Organic Way (Kitchen Back Door)',
        unit: 'portions',
        donor_id: 'usr_donor_1',
        recipient_org_name: 'Hope Haven Food Bank',
        created_at: now,
        updated_at: now
      }
    ],
    notifications: [
      {
        id: 'notif_1',
        user_id: 'usr_donor_1',
        title: 'New Food Request',
        message: 'Hope Haven Food Bank requested 15 portions of Chef Bento Meals.',
        type: 'REQUEST_RECEIVED',
        is_read: false,
        created_at: now
      },
      {
        id: 'notif_2',
        user_id: 'usr_ngo_1',
        title: 'Request Accepted!',
        message: 'GreenLeaf Bistro accepted your request! Your verification code is 492815.',
        type: 'REQUEST_ACCEPTED',
        is_read: false,
        created_at: now
      }
    ],
    reports: [],
    auditLogs: [
      {
        id: 'aud_1',
        user_id: 'usr_donor_1',
        action: 'LISTING_CREATED',
        details: 'Published listing: Pre-packaged Chef Bento Meals (25 portions)',
        created_at: now
      },
      {
        id: 'aud_2',
        user_id: 'usr_ngo_1',
        action: 'REQUEST_SUBMITTED',
        details: 'Submitted request for 15 portions of Chef Bento Meals',
        created_at: now
      }
    ]
  };
}

function loadState(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = getDefaultState();
  saveState(initial);
  return initial;
}

function saveState(state: MockState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function handleMockRequest(endpoint: string, options: RequestInit = {}): any {
  const state = loadState();
  const method = options.method?.toUpperCase() || 'GET';
  const token = localStorage.getItem('shareplate_token');
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Find active user from token
  const activeUser = state.users.find(u => token?.includes(u.id)) || state.users[0];
  const activeDonorProfile = state.donorProfiles.find(p => p.user_id === activeUser?.id);
  const activeRecipientProfile = state.recipientProfiles.find(p => p.user_id === activeUser?.id);

  // 1. Auth endpoints
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = state.users.find(u => u.email.toLowerCase() === body.email?.toLowerCase()) || state.users[0];
    const profile = user.role === 'DONOR'
      ? state.donorProfiles.find(p => p.user_id === user.id)
      : state.recipientProfiles.find(p => p.user_id === user.id);
    const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;
    return {
      message: 'Logged in successfully (Demo Mode)',
      token: mockToken,
      user,
      profile
    };
  }

  if (endpoint === '/auth/me') {
    return {
      user: activeUser,
      profile: activeUser?.role === 'DONOR' ? activeDonorProfile : activeRecipientProfile
    };
  }

  // 2. Listings
  if (endpoint.startsWith('/listings') && method === 'GET') {
    const idMatch = endpoint.match(/\/listings\/([a-zA-Z0-9_-]+)$/);
    if (idMatch) {
      const listing = state.listings.find(l => l.id === idMatch[1]) || state.listings[0];
      return { listing, history: [], requests: [] };
    }
    return {
      listings: state.listings,
      pagination: { page: 1, limit: 12, total: state.listings.length, totalPages: 1 }
    };
  }

  if (endpoint === '/listings' && method === 'POST') {
    const newListing = {
      id: `lst_${Date.now()}`,
      donor_id: activeUser.id,
      donor_business_name: activeDonorProfile?.business_name || 'GreenLeaf Bistro',
      ...body,
      remaining_quantity: body.quantity,
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    state.listings.unshift(newListing);
    saveState(state);
    return { message: 'Food surplus listed successfully', listing: newListing };
  }

  // 3. Requests
  if (endpoint === '/requests/my-requests') {
    const reqs = state.requests.filter(r =>
      activeUser.role === 'DONOR' ? r.donor_id === activeUser.id : r.recipient_id === activeUser.id
    );
    return { requests: reqs.length > 0 ? reqs : state.requests };
  }

  if (endpoint === '/requests' && method === 'POST') {
    const listing = state.listings.find(l => l.id === body.listingId);
    const newReq = {
      id: `req_${Date.now()}`,
      listing_id: body.listingId,
      recipient_id: activeUser.id,
      recipient_org_name: activeRecipientProfile?.organization_name || 'Hope Haven Food Bank',
      requested_quantity: Number(body.requestedQuantity),
      status: 'PENDING',
      proposed_pickup_time: body.proposedPickupTime,
      notes: body.notes || '',
      listing_title: listing?.title || 'Food Surplus Portion',
      donor_business_name: listing?.donor_business_name || 'Verified Donor',
      listing_pickup_location: listing?.pickup_location || 'Main Kitchen',
      unit: listing?.unit || 'portions',
      donor_id: listing?.donor_id || 'usr_donor_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    state.requests.unshift(newReq);
    saveState(state);
    return { message: 'Request submitted successfully', requestId: newReq.id };
  }

  if (endpoint.includes('/accept') && method === 'POST') {
    const reqId = endpoint.split('/')[2];
    const req = state.requests.find(r => r.id === reqId);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (req) {
      req.status = 'ACCEPTED';
      req.verification_code = code;
    }
    saveState(state);
    return {
      message: 'Request accepted. Verification code generated.',
      verificationCode: code,
      newRemaining: 10,
      newListingStatus: 'AVAILABLE'
    };
  }

  // 4. Pickups
  if (endpoint === '/pickups/active') {
    const active = state.requests.filter(r => r.status === 'ACCEPTED');
    return { pickups: active };
  }

  if (endpoint.includes('/verify-and-complete') && method === 'POST') {
    const reqId = endpoint.split('/')[2];
    const req = state.requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'COMPLETED';
    }
    saveState(state);
    return {
      message: 'Pickup verified and marked as complete!',
      completed: true,
      quantity: req?.requested_quantity || 15,
      unit: req?.unit || 'portions',
      estimatedKgSaved: 6.0,
      co2PreventedKg: '15.0'
    };
  }

  // 5. Notifications
  if (endpoint.startsWith('/notifications')) {
    return { notifications: state.notifications, unreadCount: 0 };
  }

  // 6. Analytics & Impact
  if (endpoint === '/analytics/impact') {
    return {
      metrics: {
        total_donations: 86,
        total_kg_redistributed: 1840,
        estimated_meals_provided: 4600,
        total_co2_prevented_kg: 4600,
        active_donors: 14,
        active_recipients: 9
      },
      categoryStats: [
        { category: 'Cooked Meals', count: 42, kg: 850 },
        { category: 'Bakery', count: 24, kg: 420 },
        { category: 'Fruits & Vegetables', count: 18, kg: 510 },
        { category: 'Dairy & Eggs', count: 6, kg: 60 }
      ],
      recentActivity: [
        { title: 'Pre-packaged Chef Bento Meals', quantity: 15, unit: 'portions', donor_name: 'GreenLeaf Bistro', time_ago: '12m ago' },
        { title: 'Artisan Sourdough Boules', quantity: 20, unit: 'loaves', donor_name: 'The Rustic Hearth', time_ago: '45m ago' }
      ]
    };
  }

  // 7. Admin
  if (endpoint === '/admin/overview') {
    return {
      totalUsers: state.users.length,
      totalDonors: state.donorProfiles.length,
      totalRecipients: state.recipientProfiles.length,
      activeListingsCount: state.listings.length,
      pendingRequestsCount: state.requests.filter(r => r.status === 'PENDING').length,
      completedPickupsCount: state.requests.filter(r => r.status === 'COMPLETED').length,
      activeListings: state.listings
    };
  }

  if (endpoint.startsWith('/admin/users')) {
    return { users: state.users };
  }

  if (endpoint === '/admin/audit-logs') {
    return { logs: state.auditLogs };
  }

  if (endpoint === '/reports') {
    return { reports: state.reports };
  }

  return { success: true };
}
