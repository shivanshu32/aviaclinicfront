/**
 * Onboarding Service
 * Handles tenant onboarding API calls
 */

import api from '../api';

export interface OnboardingSteps {
  clinicDetails: boolean;
  branding: boolean;
  doctor: boolean;
}

export interface OnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  steps: OnboardingSteps;
}

export interface TenantBranding {
  logo: string | null;
  billHeaderImage: string | null;
}

export interface TenantAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface OnboardingStatusResponse {
  success: boolean;
  data: {
    onboarding: OnboardingStatus;
    tenant: {
      name: string;
      email: string;
      phone: string | null;
      address: TenantAddress;
      branding: TenantBranding;
    };
    doctorCount: number;
  };
}

export interface ClinicDetailsData {
  clinicName: string;
  phone?: string;
  email?: string;
  address?: TenantAddress;
}

export interface BrandingData {
  logo?: string | null;
  billHeaderImage?: string | null;
}

export interface DoctorData {
  name: string;
  specialization?: string;
  qualification?: string;
  phone?: string;
  email?: string;
  consultationFee?: number;
}

export const onboardingService = {
  /**
   * Get onboarding status
   */
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    return api.get('/onboarding/status');
  },

  /**
   * Save clinic details (Step 1)
   */
  saveClinicDetails: async (data: ClinicDetailsData): Promise<{ success: boolean; message: string }> => {
    return api.put('/onboarding/clinic-details', data);
  },

  /**
   * Save branding (Step 2)
   */
  saveBranding: async (data: BrandingData): Promise<{ success: boolean; message: string }> => {
    return api.put('/onboarding/branding', data);
  },

  /**
   * Add doctor (Step 3)
   */
  addDoctor: async (data: DoctorData): Promise<{ success: boolean; message: string; data: { doctor: unknown } }> => {
    return api.post('/onboarding/doctor', data);
  },

  /**
   * Complete onboarding
   */
  complete: async (): Promise<{ success: boolean; message: string }> => {
    return api.post('/onboarding/complete', {});
  },

  /**
   * Skip onboarding (owner only)
   */
  skip: async (): Promise<{ success: boolean; message: string }> => {
    return api.post('/onboarding/skip', {});
  },

  /**
   * Convert file to base64
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },
};

export default onboardingService;
