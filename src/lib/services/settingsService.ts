/**
 * Settings Service
 * Handles clinic settings API calls
 */

import api from '../api';

export interface ClinicSettings {
  _id: string;
  tenantId: string;
  clinicName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  logo?: string;
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  appointmentDuration?: number;
  currency?: string;
  taxRate?: number;
  invoicePrefix?: string;
  prescriptionHeader?: string;
  prescriptionFooter?: string;
}

export interface SettingsResponse {
  success: boolean;
  data: {
    settings: ClinicSettings;
    subscription?: {
      plan: string;
      status: string;
      trialEndsAt: string;
    };
  };
}

export const settingsService = {
  /**
   * Get clinic settings
   */
  get: async (): Promise<SettingsResponse> => {
    return api.get('/settings');
  },

  /**
   * Update clinic settings
   */
  update: async (data: Partial<ClinicSettings>): Promise<{ success: boolean; message: string; data: { settings: ClinicSettings } }> => {
    return api.put('/settings', data);
  },
};

export default settingsService;
