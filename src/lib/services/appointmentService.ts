/**
 * Appointment Service
 * Handles appointment API calls
 */

import api from '../api';

export interface Appointment {
  _id: string;
  appointmentId: string;
  tokenNo: number;
  patientId: string;
  doctorId: string;
  date: string;
  type: 'new' | 'follow-up';
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  billing: {
    hasBill: boolean;
    billId?: string;
    paymentStatus?: string;
  };
  patient?: {
    _id: string;
    name: string;
    phone: string;
    patientId: string;
  };
  doctor?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsResponse {
  success: boolean;
  data: {
    appointments: Appointment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export const appointmentService = {
  /**
   * Get all appointments
   */
  getAll: async (params: {
    date?: string;
    status?: string;
    doctorId?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<AppointmentsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.status) queryParams.append('status', params.status);
    if (params.doctorId) queryParams.append('doctorId', params.doctorId);
    if (params.patientId) queryParams.append('patientId', params.patientId);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    
    const query = queryParams.toString();
    return api.get(`/appointments${query ? `?${query}` : ''}`);
  },

  /**
   * Get single appointment by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: { appointment: Appointment } }> => {
    return api.get(`/appointments/${id}`);
  },

  /**
   * Create new appointment
   */
  create: async (data: {
    patientId: string;
    doctorId: string;
    date: string;
    type?: 'new' | 'follow-up';
    notes?: string;
  }): Promise<{ success: boolean; message: string; data: { appointment: Appointment } }> => {
    return api.post('/appointments', data);
  },

  /**
   * Update appointment
   */
  update: async (id: string, data: Partial<Appointment>): Promise<{ success: boolean; message: string; data: { appointment: Appointment } }> => {
    return api.put(`/appointments/${id}`, data);
  },
};

export default appointmentService;
