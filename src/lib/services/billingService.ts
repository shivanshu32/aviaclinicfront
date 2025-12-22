/**
 * Billing Service
 * Handles OPD, Misc, and Medicine billing API calls
 */

import api from '../api';

export interface BillItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface Bill {
  _id: string;
  billNo: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  items: BillItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'mixed';
  paymentStatus: string;
  remarks?: string;
  createdAt: string;
}

export const billingService = {
  // OPD Bills
  opd: {
    getAll: async (params: { page?: number; limit?: number; dateFrom?: string; dateTo?: string; patientId?: string } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') query.append(key, String(value));
      });
      return api.get(`/billing/opd?${query}`);
    },

    getById: async (id: string) => {
      return api.get(`/billing/opd/${id}`);
    },

    create: async (data: {
      patientId: string;
      doctorId: string;
      appointmentId?: string;
      items: BillItem[];
      discountType?: 'percentage' | 'fixed';
      discountValue?: number;
      paymentMode: string;
      remarks?: string;
    }) => {
      return api.post('/billing/opd', data);
    },
  },

  // Misc Bills (Lab/Radiology)
  misc: {
    getAll: async (params: { page?: number; limit?: number; dateFrom?: string; dateTo?: string } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') query.append(key, String(value));
      });
      return api.get(`/billing/misc?${query}`);
    },

    getById: async (id: string) => {
      return api.get(`/billing/misc/${id}`);
    },

    create: async (data: {
      patientId: string;
      items: BillItem[];
      discountType?: 'percentage' | 'fixed';
      discountValue?: number;
      paymentMode: string;
      remarks?: string;
    }) => {
      return api.post('/billing/misc', data);
    },
  },

  // Medicine Bills
  medicine: {
    getAll: async (params: { page?: number; limit?: number; dateFrom?: string; dateTo?: string } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') query.append(key, String(value));
      });
      return api.get(`/billing/medicine?${query}`);
    },

    getById: async (id: string) => {
      return api.get(`/billing/medicine/${id}`);
    },

    create: async (data: {
      patientId?: string;
      patientName?: string;
      patientPhone?: string;
      items: BillItem[];
      discountType?: 'percentage' | 'fixed';
      discountValue?: number;
      paymentMode: string;
      remarks?: string;
    }) => {
      return api.post('/billing/medicine', data);
    },
  },
};

export default billingService;
