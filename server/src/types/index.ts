export type UserRole = 'DONOR' | 'RECIPIENT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface DonorProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  phone: string;
  pickup_address: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  food_safety_ack: number;
  created_at: string;
}

export interface RecipientProfile {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  description?: string;
  phone: string;
  address: string;
  city: string;
  capacity_portions_per_day: number;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  service_area: string;
  created_at: string;
}

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'PARTIALLY_RESERVED' 
  | 'RESERVED' 
  | 'COMPLETED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'FLAGGED';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Fruits'
  | 'Vegetables'
  | 'Bakery'
  | 'Packaged Food'
  | 'Dairy'
  | 'Grains'
  | 'Other';

export interface FoodListing {
  id: string;
  donor_id: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  remaining_quantity: number;
  unit: string;
  preparation_time: string;
  listing_time: string;
  pickup_start: string;
  pickup_end: string;
  expiry_guidance: string;
  storage_instructions: string;
  dietary_tags: string[]; // parsed from JSON
  allergens: string[]; // parsed from JSON
  pickup_location: string;
  image_url?: string;
  donor_notes?: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  // joined fields
  donor_business_name?: string;
  donor_city?: string;
  donor_phone?: string;
}

export type RequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CONFIRMED_PICKUP' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface DonationRequest {
  id: string;
  listing_id: string;
  recipient_id: string;
  requested_quantity: number;
  unit: string;
  status: RequestStatus;
  notes?: string;
  proposed_pickup_time: string;
  verification_code?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  listing_title?: string;
  listing_category?: string;
  listing_image_url?: string;
  listing_pickup_location?: string;
  recipient_org_name?: string;
  recipient_phone?: string;
  donor_business_name?: string;
  donor_phone?: string;
  donor_id?: string;
}

export interface DonationHistory {
  id: string;
  listing_id: string;
  request_id?: string;
  action: string;
  previous_status?: string;
  new_status: string;
  performed_by_id: string;
  details?: string;
  timestamp: string;
  performer_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED';
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter_name?: string;
  listing_title?: string;
}
