/**
 * Auth Service
 * Handles authentication API calls
 */

import api from '../api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';
const TENANT_KEY = 'tenant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string;
  };
  onboarding?: {
    completed: boolean;
    completedAt: string | null;
    steps: {
      clinicDetails: boolean;
      branding: boolean;
      doctor: boolean;
    };
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tenant: Tenant;
    token: string;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    clinicName: string;
  };
}

export const authService = {
  /**
   * Sign up / Start free trial
   */
  signup: async (data: { email: string; ownerName: string; phone?: string }): Promise<SignupResponse> => {
    return api.post('/auth/signup', data);
  },

  /**
   * Activate account and set password
   */
  activate: async (token: string, password: string): Promise<LoginResponse> => {
    const response: LoginResponse = await api.post('/auth/activate', { token, password });
    
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      localStorage.setItem(TENANT_KEY, JSON.stringify(response.data.tenant));
    }
    
    return response;
  },

  /**
   * Verify activation token
   */
  verifyToken: async (token: string): Promise<{ success: boolean; data: { email: string; clinicName: string } }> => {
    return api.get(`/auth/verify-token/${token}`);
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response: LoginResponse = await api.post('/auth/login', { email, password });
    
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      localStorage.setItem(TENANT_KEY, JSON.stringify(response.data.tenant));
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TENANT_KEY);
  },

  /**
   * Verify current token
   */
  verify: async (): Promise<{ success: boolean; data: { user: User; tenant: Tenant } }> => {
    return api.get('/auth/verify');
  },

  /**
   * Resend activation email
   */
  resendActivation: async (email: string): Promise<{ success: boolean; message: string }> => {
    return api.post('/auth/resend-activation', { email });
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get stored tenant
   */
  getTenant: (): Tenant | null => {
    if (typeof window === 'undefined') return null;
    const tenant = localStorage.getItem(TENANT_KEY);
    return tenant ? JSON.parse(tenant) : null;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
