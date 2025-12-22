/**
 * Patient Service
 * Handles patient API calls
 */

import api from '../api';

export interface Patient {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientsResponse {
  success: boolean;
  data: {
    patients: Patient[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const patientService = {
  /**
   * Get all patients with pagination and search
   */
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
  } = {}): Promise<PatientsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    
    const query = queryParams.toString();
    return api.get(`/patients${query ? `?${query}` : ''}`);
  },

  /**
   * Get single patient by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { patient: Patient } }> => {
    return api.get(`/patients/${id}`);
  },

  /**
   * Create new patient
   */
  create: async (data: Partial<Patient>): Promise<{ success: boolean; message: string; data: { patient: Patient } }> => {
    return api.post('/patients', data);
  },

  /**
   * Update patient
   */
  update: async (id: string, data: Partial<Patient>): Promise<{ success: boolean; message: string; data: { patient: Patient } }> => {
    return api.put(`/patients/${id}`, data);
  },

  /**
   * Delete patient (soft delete)
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/patients/${id}`);
  },
};

export default patientService;
