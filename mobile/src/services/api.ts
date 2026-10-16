/**
 * GreenCampus Centralized Mobile API Client
 * Centralizes endpoint URLs, authentication headers, error transformations,
 * and request lifecycles.
 */

import { StorageService } from './storage';

// In Expo, EXPO_PUBLIC_API_URL can be set in mobile/.env
// Local Android Emulator default is http://10.0.2.2:8000; Physical phone uses your machine LAN IP.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ApiError {
  message: string;
  statusCode?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await StorageService.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.detail) {
          if (typeof errorBody.detail === 'string') {
            errorMessage = errorBody.detail;
          } else if (Array.isArray(errorBody.detail)) {
            errorMessage = errorBody.detail
              .map((e: { msg?: string }) => e.msg || 'Invalid input')
              .join(', ');
          }
        }
      } catch {
        // Fallback to HTTP status text
        errorMessage = response.statusText || errorMessage;
      }

      const err: ApiError = {
        message: errorMessage,
        statusCode: response.status,
      };
      throw err;
    }

    // Parse JSON
    return (await response.json()) as T;
  } catch (error: unknown) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    // Network or server unreachable error
    const networkError: ApiError = {
      message:
        'Unable to connect to GreenCampus server. Check your network or API URL configuration.',
      statusCode: 0,
    };
    throw networkError;
  }
}

// -----------------------------------------------------------------------------
// API SERVICE METHODS
// -----------------------------------------------------------------------------

export const ApiService = {
  // Authentication
  async register(fullName: string, email: string, password: string) {
    return request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
      }),
    });
  },

  async login(email: string, password: string) {
    return request<{
      access_token: string;
      token_type: string;
      user: {
        id: number;
        full_name: string;
        email: string;
        role: string;
        is_active: boolean;
        created_at: string;
      };
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return request<any>('/api/v1/auth/me', { method: 'GET' });
  },

  // ResourceCare
  async createIssue(data: {
    issue_type: string;
    description: string;
    location: string;
    image_url?: string;
  }) {
    return request<any>('/api/v1/issues/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyIssues() {
    return request<any[]>('/api/v1/issues/me', { method: 'GET' });
  },

  async getAllIssues(status?: string, type?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/v1/issues/${qs}`, { method: 'GET' });
  },

  async getIssueById(id: number) {
    return request<any>(`/api/v1/issues/${id}`, { method: 'GET' });
  },

  async updateIssueStatus(
    id: number,
    data: {
      status: string;
      comment?: string;
      assigned_to?: number;
      estimated_water_saved?: number;
      estimated_energy_saved?: number;
      estimated_waste_reduced?: number;
    }
  ) {
    return request<any>(`/api/v1/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // GreenShare Items
  async createItem(data: {
    name: string;
    description?: string;
    category: string;
    condition?: string;
    image_url?: string;
  }) {
    return request<any>('/api/v1/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCatalogItems(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/api/v1/items/${qs}`, { method: 'GET' });
  },

  async getMyItems() {
    return request<any[]>('/api/v1/items/me', { method: 'GET' });
  },

  async getItemById(id: number) {
    return request<any>(`/api/v1/items/${id}`, { method: 'GET' });
  },

  // GreenShare Borrowing
  async requestBorrow(itemId: number, message?: string) {
    return request<any>('/api/v1/borrow/request', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, message }),
    });
  },

  async getSentBorrowRequests() {
    return request<any[]>('/api/v1/borrow/requests/sent', { method: 'GET' });
  },

  async getReceivedBorrowRequests() {
    return request<any[]>('/api/v1/borrow/requests/received', { method: 'GET' });
  },

  async respondBorrowRequest(requestId: number, status: 'approved' | 'rejected') {
    return request<any>(`/api/v1/borrow/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getMyTransactions() {
    return request<any[]>('/api/v1/borrow/transactions', { method: 'GET' });
  },

  async returnBorrowedItem(transactionId: number) {
    return request<any>(`/api/v1/borrow/transactions/${transactionId}/return`, {
      method: 'POST',
    });
  },

  // Gamification & Badges
  async getMyPointsHistory() {
    return request<any[]>('/api/v1/gamification/points/me', { method: 'GET' });
  },

  async getBadges() {
    return request<any[]>('/api/v1/gamification/badges', { method: 'GET' });
  },

  async getLeaderboard() {
    return request<any[]>('/api/v1/gamification/leaderboard', { method: 'GET' });
  },

  // Dashboard
  async getDashboardMetrics() {
    return request<any>('/api/v1/dashboard/', { method: 'GET' });
  },

  // Notifications
  async getNotifications() {
    return request<any[]>('/api/v1/notifications/', { method: 'GET' });
  },

  async getUnreadCount() {
    return request<{ unread_count: number }>('/api/v1/notifications/unread-count', {
      method: 'GET',
    });
  },

  async markNotificationRead(id: number) {
    return request<any>(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return request<{ unread_count: number }>('/api/v1/notifications/read-all', {
      method: 'POST',
    });
  },

  // Admin Operations
  async getAdminAnalytics() {
    return request<{
      total_users: number;
      total_students: number;
      total_admins: number;
      total_issues: number;
      pending_reports: number;
      in_progress_reports: number;
      resolved_reports: number;
      total_items_listed: number;
      available_items: number;
      borrowed_items: number;
      pending_borrow_requests: number;
      total_borrow_cycles: number;
      purchases_avoided_count: number;
      total_green_points_awarded: number;
      estimated_water_saved_litres: number;
      estimated_energy_saved_kwh: number;
      estimated_waste_reduced_kg: number;
    }>('/api/v1/admin/analytics', { method: 'GET' });
  },

  async getAdminUsers(role?: string, search?: string) {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (search && search.trim()) params.append('search', search.trim());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Array<{
      id: number;
      full_name: string;
      email: string;
      role: string;
      is_active: boolean;
      created_at: string;
      green_points: number;
      reported_issues_count: number;
      items_listed_count: number;
    }>>(`/api/v1/admin/users${qs}`, { method: 'GET' });
  },

  async updateUserRole(userId: number, role: 'student' | 'admin') {
    return request<any>(`/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async getAdminGreenShareItems() {
    return request<Array<{
      id: number;
      name: string;
      description?: string;
      category: string;
      condition?: string;
      status: string;
      owner_id: number;
      owner_name: string;
      owner_email: string;
      created_at: string;
    }>>('/api/v1/admin/greenshare/items', { method: 'GET' });
  },

  async getAdminGreenShareRequests() {
    return request<Array<{
      id: number;
      item_id: number;
      item_name: string;
      requester_id: number;
      requester_name: string;
      requester_email: string;
      owner_id: number;
      owner_name: string;
      status: string;
      message?: string;
      requested_at: string;
      responded_at?: string;
    }>>('/api/v1/admin/greenshare/requests', { method: 'GET' });
  },

  async getAdminGreenShareTransactions() {
    return request<Array<{
      id: number;
      item_id: number;
      item_name: string;
      borrower_id: number;
      borrower_name: string;
      owner_id: number;
      owner_name: string;
      status: string;
      borrowed_at: string;
      due_at?: string;
      returned_at?: string;
    }>>('/api/v1/admin/greenshare/transactions', { method: 'GET' });
  },

  async getAdminImpact() {
    return request<{
      estimated_water_saved_litres: number;
      estimated_energy_saved_kwh: number;
      estimated_waste_reduced_kg: number;
      total_issues_resolved: number;
      total_items_shared: number;
      purchases_avoided: number;
      recent_records: Array<{
        id: number;
        user_name?: string;
        issue_id?: number;
        issue_type?: string;
        water_saved: number;
        energy_saved: number;
        waste_reduced: number;
        recorded_at: string;
      }>;
    }>('/api/v1/admin/impact', { method: 'GET' });
  },

  async getAdminStaff() {
    return request<Array<{
      id: number;
      name: string;
      email: string;
    }>>('/api/v1/admin/staff', { method: 'GET' });
  },
};
