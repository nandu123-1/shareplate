import { handleMockRequest } from './mockFallback';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('shareplate_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('shareplate_token', token);
  } else {
    localStorage.removeItem('shareplate_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data as T;
    }

    // If 404 or non-JSON returned (e.g. static host Vercel without express server), fall back to mock engine
    if (res.status === 404 || !contentType.includes('application/json')) {
      console.warn(`[SharePlate] Backend API not responding at ${endpoint}. Using persistent client store.`);
      return handleMockRequest(endpoint, options) as T;
    }

    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  } catch (err: any) {
    // If NetworkError or backend server offline, use client-side mock store seamlessly
    console.warn(`[SharePlate] Network offline (${err.message}). Using persistent client store for ${endpoint}.`);
    return handleMockRequest(endpoint, options) as T;
  }
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ message: string; token: string; user: any; profile: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (payload: any) =>
    request<{ message: string; token: string; user: any; profile: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCurrentUser: () =>
    request<{ user: any; profile: any }>('/auth/me'),

  updateProfile: (payload: any) =>
    request<{ message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Listings
  getListings: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ listings: any[]; pagination: any }>(`/listings?${query}`);
  },

  getListingById: (id: string) =>
    request<{ listing: any; history: any[]; requests: any[] }>(`/listings/${id}`),

  createListing: (payload: any) =>
    request<{ message: string; listing: any }>('/listings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateListing: (id: string, payload: any) =>
    request<{ message: string }>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  cancelListing: (id: string) =>
    request<{ message: string }>(`/listings/${id}`, {
      method: 'DELETE'
    }),

  // Requests
  getMyRequests: () =>
    request<{ requests: any[] }>('/requests/my-requests'),

  createRequest: (payload: { listingId: string; requestedQuantity: number; proposedPickupTime: string; notes?: string }) =>
    request<{ message: string; requestId: string }>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  acceptRequest: (requestId: string) =>
    request<{ message: string; verificationCode: string; newRemaining: number; newListingStatus: string }>(
      `/requests/${requestId}/accept`,
      { method: 'POST' }
    ),

  rejectRequest: (requestId: string, reason?: string) =>
    request<{ message: string }>(`/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  cancelRequest: (requestId: string, reason?: string) =>
    request<{ message: string }>(`/requests/${requestId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  // Pickups
  getActivePickups: () =>
    request<{ pickups: any[] }>('/pickups/active'),

  verifyAndCompletePickup: (requestId: string, verificationCode?: string, note?: string) =>
    request<{ message: string; completed: boolean; quantity: number; unit: string; estimatedKgSaved: number; co2PreventedKg: string }>(
      `/pickups/${requestId}/verify-and-complete`,
      {
        method: 'POST',
        body: JSON.stringify({ verificationCode, note })
      }
    ),

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // Reports
  submitReport: (payload: { listingId: string; reason: string; description: string }) =>
    request<{ message: string; reportId: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getReports: () =>
    request<{ reports: any[] }>('/reports'),

  resolveReport: (id: string, payload: { status: string; adminNotes: string; deactivateListing?: boolean }) =>
    request<{ message: string }>(`/reports/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Admin
  getAdminOverview: () =>
    request<any>('/admin/overview'),

  getAdminUsers: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ users: any[] }>(`/admin/users?${query}`);
  },

  updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') =>
    request<{ message: string }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  getAuditLogs: () =>
    request<{ logs: any[] }>('/admin/audit-logs'),

  // Analytics
  getImpactMetrics: () =>
    request<{ metrics: any; categoryStats: any[]; recentActivity: any[] }>('/analytics/impact')
};
