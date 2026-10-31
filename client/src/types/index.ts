export type UserRole = 'DONOR' | 'RECIPIENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  created_at: string;
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
  food_safety_ack: number;
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
}

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'PARTIALLY_RESERVED' 
  | 'RESERVED' 
  | 'COMPLETED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'FLAGGED';

export interface FoodListing {
  id: string;
  donor_id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  remaining_quantity: number;
  unit: string;
  preparation_time: string;
  listing_time?: string;
  pickup_start: string;
  pickup_end: string;
  expiry_guidance: string;
  storage_instructions: string;
  dietary_tags?: string[] | string;
  allergens?: string[] | string;
  pickup_location: string;
  image_url?: string;
  donor_notes?: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  donor_business_name?: string;
  donor_city?: string;
  donor_phone?: string;
  donor_business_type?: string;
  donor_pickup_address?: string;
  matchScore?: number;
  matchReason?: string;
}

export interface DonationRequest {
  id: string;
  listing_id: string;
  recipient_id: string;
  requested_quantity: number;
  unit: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED_PICKUP' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  proposed_pickup_time: string;
  verification_code?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_category?: string;
  listing_image_url?: string;
  listing_pickup_location?: string;
  listing_pickup_start?: string;
  listing_pickup_end?: string;
  listing_storage_instructions?: string;
  listing_expiry_guidance?: string;
  listing_donor_notes?: string;
  recipient_org_name?: string;
  recipient_org_type?: string;
  recipient_phone?: string;
  recipient_address?: string;
  donor_business_name?: string;
  donor_phone?: string;
  donor_pickup_address?: string;
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
  listing_title?: string;
  performer_role?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface ImpactMetrics {
  completedDonations: number;
  totalPortionsRedistributed: number;
  estimatedKgRedistributed: number;
  estimatedCo2ePreventedKg: number;
  estimatedMealsProvided: number;
  activeDonors: number;
  participatingOrganizations: number;
  conversionAssumptions: {
    portionWeightKg: number;
    co2FactorPerKg: number;
    source: string;
  };
}
