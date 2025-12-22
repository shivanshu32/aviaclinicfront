/**
 * Doctor Service
 * Handles doctor API calls
 */

import api from '../api';

export interface Doctor {
  _id: string;
  doctorId: string;
  name: string;
  specialization?: string;
  qualification?: string;
  phone?: string;
  email?: string;
  consultationFee?: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorsResponse {
  success: boolean;
  data: {
    doctors: Doctor[];
  };
}

export const doctorService = {
  /**
   * Get all doctors
   */
  getAll: async (params: {
    search?: string;
    isActive?: boolean;
  } = {}): Promise<DoctorsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    
    const query = queryParams.toString();
    return api.get(`/doctors${query ? `?${query}` : ''}`);
  },

  /**
   * Get single doctor by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { doctor: Doctor } }> => {
    return api.get(`/doctors/${id}`);
  },

  /**
   * Create new doctor
   */
  create: async (data: Partial<Doctor>): Promise<{ success: boolean; message: string; data: { doctor: Doctor } }> => {
    return api.post('/doctors', data);
  },

  /**
   * Update doctor
   */
  update: async (id: string, data: Partial<Doctor>): Promise<{ success: boolean; message: string; data: { doctor: Doctor } }> => {
    return api.put(`/doctors/${id}`, data);
  },
};

export default doctorService;
