/**
 * Super Admin Service
 * Handles super admin API calls for trial management and settings
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface TrialSettings {
  defaultTrialDays: number;
  timezone: string;
  updatedAt: string;
}

export interface TenantTrialDetails {
  tenantId: string;
  name: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  trialStatus: {
    status: string;
    isTrial: boolean;
    remainingDays: number;
    trialStartsAt: string;
    trialEndsAt: string;
  };
}

export interface TrialExtensionHistory {
  _id: string;
  superAdminId: string;
  action: string;
  details: {
    tenantId: string;
    tenantName?: string;
    oldTrialEnd: string;
    newTrialEnd: string;
    extensionMethod: string;
    reason: string;
  };
  superAdminName: string;
  superAdminEmail: string;
  timestamp: string;
}

export interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  trialStatus?: {
    status: string;
    isTrial: boolean;
    remainingDays: number;
    trialStartsAt: string;
    trialEndsAt: string;
  };
  stats: {
    users: number;
    patients: number;
  };
  createdAt: string;
}

export interface TenantsResponse {
  tenants: Tenant[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const superAdminService = {
  /**
   * Get trial settings
   */
  async getTrialSettings(): Promise<{ success: boolean; data: TrialSettings }> {
    const token = localStorage.getItem('superAdminToken');
    const response = await fetch(`${API_URL}/super-admin/settings/trial`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  /**
   * Update default trial duration
   */
  async updateTrialSettings(defaultTrialDays: number, reason: string): Promise<{ success: boolean; data: TrialSettings; message: string }> {
    const token = localStorage.getItem('superAdminToken');
    const response = await fetch(`${API_URL}/super-admin/settings/trial`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ defaultTrialDays, reason }),
    });
    return response.json();
  },

  /**
   * Get tenant trial details
   */
  async getTenantTrialDetails(tenantId: string): Promise<{ success: boolean; data: TenantTrialDetails }> {
    const token = localStorage.getItem('superAdminToken');
    const response = await fetch(`${API_URL}/super-admin/tenants/${tenantId}/trial`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  /**
   * Extend tenant trial
   */
  async extendTenantTrial(tenantId: string, days: number, reason: string): Promise<{ success: boolean; data: unknown; message: string }> {
    const token = localStorage.getItem('superAdminToken');
    const response = await fetch(`${API_URL}/super-admin/tenants/${tenantId}/trial/extend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ days, reason }),
    });
    return response.json();
  },

  /**
   * Get tenant trial extension history
   */
  async getTenantTrialHistory(tenantId: string): Promise<{ success: boolean; data: { tenantId: string; history: TrialExtensionHistory[] } }> {
    const token = localStorage.getItem('superAdminToken');
    const response = await fetch(`${API_URL}/super-admin/tenants/${tenantId}/trial/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  /**
   * Get all tenants
   */
  async getTenants(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<{ success: boolean; data: TenantsResponse }> {
    const token = localStorage.getItem('superAdminToken');
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`${API_URL}/super-admin/tenants?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  /**
   * Logout super admin
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (token) {
        // Call backend logout endpoint to clear server-side data
        await fetch(`${API_URL}/super-admin/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with client-side cleanup even if backend call fails
    }
    
    // Clear localStorage
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    return { success: true, message: 'Logged out successfully' };
  },
};

export default superAdminService;