/**
 * WhatsApp Service
 * Handles WhatsApp API integration calls
 * Syncs with both WhatsApp API (whatsapp.aviawellness.com) and Backend API (api.aviawellness.com)
 */

import axios from 'axios';
import api from '../api';

const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'https://whatsapp.aviawellness.com';
const WHATSAPP_TOKEN_KEY = 'whatsappToken';

// Create axios instance for WhatsApp API
const whatsappApi = axios.create({
  baseURL: WHATSAPP_API_URL,
  timeout: 60000, // Longer timeout for QR code operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add WhatsApp auth token
whatsappApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(WHATSAPP_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
whatsappApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ error: 'Network error. Please check your connection.' });
  }
);

// Types
export interface WhatsAppSession {
  id: string;
  session_name: string;
  phone_number: string | null;
  status: 'initializing' | 'pending_qr' | 'logged_in' | 'logged_out' | 'error';
  last_active: string;
  created_at: string;
  error_message: string | null;
}

export interface WhatsAppLoginResponse {
  access_token: string;
  token_type: string;
}

export interface WhatsAppQRResponse {
  qr_data: string; // Base64 encoded QR image
  session_id: string;
  expires_at: string;
}

export interface CreateSessionResponse {
  id: string;
  session_name: string;
  status: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  session_id: string;
  recipient: string;
}

// Backend integration types
export interface BackendWhatsAppIntegration {
  id: string;
  sessionId: string;
  sessionName: string;
  phoneNumber: string | null;
  status: string;
  isDefault: boolean;
  lastActive: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const whatsappService = {
  /**
   * Login to WhatsApp API and get JWT token
   */
  login: async (email: string, password: string): Promise<WhatsAppLoginResponse> => {
    const response = await whatsappApi.post('/api/auth/login', { email, password }) as WhatsAppLoginResponse;
    if (response.access_token) {
      localStorage.setItem(WHATSAPP_TOKEN_KEY, response.access_token);
    }
    return response;
  },

  /**
   * Register a new user on WhatsApp API
   */
  register: async (email: string, password: string, name: string): Promise<{ message: string }> => {
    return whatsappApi.post('/api/auth/register', { email, password, name });
  },

  /**
   * Logout from WhatsApp API
   */
  logout: () => {
    localStorage.removeItem(WHATSAPP_TOKEN_KEY);
  },

  /**
   * Check if authenticated with WhatsApp API
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(WHATSAPP_TOKEN_KEY);
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WHATSAPP_TOKEN_KEY);
  },

  /**
   * List all WhatsApp sessions
   */
  listSessions: async (): Promise<WhatsAppSession[]> => {
    return whatsappApi.get('/api/whatsapp/sessions');
  },

  /**
   * Create a new WhatsApp session
   */
  createSession: async (sessionName: string): Promise<CreateSessionResponse> => {
    return whatsappApi.post('/api/whatsapp/sessions', { session_name: sessionName });
  },

  /**
   * Get QR code for a session
   */
  getQRCode: async (sessionId: string): Promise<WhatsAppQRResponse> => {
    return whatsappApi.post(`/api/whatsapp/sessions/${sessionId}/qr`);
  },

  /**
   * Get session status
   */
  getSessionStatus: async (sessionId: string): Promise<WhatsAppSession> => {
    return whatsappApi.get(`/api/whatsapp/sessions/${sessionId}/status`);
  },

  /**
   * Delete a session
   */
  deleteSession: async (sessionId: string): Promise<{ message: string }> => {
    return whatsappApi.delete(`/api/whatsapp/sessions/${sessionId}`);
  },

  /**
   * Send a text message
   */
  sendMessage: async (
    sessionId: string,
    phoneNumber: string,
    message: string
  ): Promise<SendMessageResponse> => {
    return whatsappApi.post('/api/whatsapp/send', {
      session_id: sessionId,
      phone_number: phoneNumber,
      message: message,
    });
  },

  /**
   * Send a message with file attachment
   */
  sendWithFile: async (
    sessionId: string,
    phoneNumber: string,
    file: File,
    caption?: string
  ): Promise<SendMessageResponse> => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('phone_number', phoneNumber);
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const token = localStorage.getItem(WHATSAPP_TOKEN_KEY);
    const response = await axios.post(`${WHATSAPP_API_URL}/api/whatsapp/send-with-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // ============================================
  // Backend API Methods (sync with main backend)
  // ============================================

  /**
   * Get all WhatsApp integrations from backend
   */
  getBackendIntegrations: async (): Promise<BackendWhatsAppIntegration[]> => {
    const response = await api.get('/whatsapp');
    return response.data?.integrations || [];
  },

  /**
   * Get integration status from backend
   */
  getBackendIntegrationStatus: async (): Promise<{
    hasIntegration: boolean;
    hasActiveIntegration: boolean;
    totalIntegrations: number;
  }> => {
    const response = await api.get('/whatsapp/status');
    return response.data;
  },

  /**
   * Get active integration from backend (for sending messages)
   */
  getActiveBackendIntegration: async (): Promise<BackendWhatsAppIntegration | null> => {
    try {
      const response = await api.get('/whatsapp/active');
      return response.data?.integration || null;
    } catch {
      return null;
    }
  },

  /**
   * Create/register integration in backend
   */
  createBackendIntegration: async (
    sessionId: string,
    sessionName: string,
    status: string,
    whatsappApiEmail?: string
  ): Promise<BackendWhatsAppIntegration> => {
    const response = await api.post('/whatsapp', {
      sessionId,
      sessionName,
      status,
      whatsappApiEmail,
    });
    return response.data?.integration;
  },

  /**
   * Update integration in backend
   */
  updateBackendIntegration: async (
    id: string,
    data: {
      sessionName?: string;
      phoneNumber?: string;
      status?: string;
      errorMessage?: string;
    }
  ): Promise<BackendWhatsAppIntegration> => {
    const response = await api.put(`/whatsapp/${id}`, data);
    return response.data?.integration;
  },

  /**
   * Sync integration status with backend
   */
  syncBackendIntegrationStatus: async (
    id: string,
    status: string,
    phoneNumber?: string,
    errorMessage?: string
  ): Promise<BackendWhatsAppIntegration> => {
    const response = await api.patch(`/whatsapp/${id}/sync`, {
      status,
      phoneNumber,
      errorMessage,
    });
    return response.data?.integration;
  },

  /**
   * Set integration as default in backend
   */
  setDefaultBackendIntegration: async (id: string): Promise<BackendWhatsAppIntegration> => {
    const response = await api.patch(`/whatsapp/${id}/default`);
    return response.data?.integration;
  },

  /**
   * Delete integration from backend
   */
  deleteBackendIntegration: async (id: string): Promise<void> => {
    await api.delete(`/whatsapp/${id}`);
  },
};

export default whatsappService;
