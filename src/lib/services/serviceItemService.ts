/**
 * Service Item Service
 * Handles lab tests, procedures, and service charges API calls
 */

import api from '../api';

export interface ServiceItem {
  _id: string;
  name: string;
  category: 'laboratory' | 'radiology' | 'procedure' | 'other';
  rate: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const serviceItemService = {
  /**
   * Get all service items
   */
  getAll: async (params: { search?: string; category?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.append(key, String(value));
    });
    return api.get(`/services?${query}`);
  },

  /**
   * Get service item by ID
   */
  getById: async (id: string) => {
    return api.get(`/services/${id}`);
  },

  /**
   * Create new service item
   */
  create: async (data: Partial<ServiceItem>) => {
    return api.post('/services', data);
  },

  /**
   * Update service item
   */
  update: async (id: string, data: Partial<ServiceItem>) => {
    return api.put(`/services/${id}`, data);
  },

  /**
   * Delete service item
   */
  delete: async (id: string) => {
    return api.delete(`/services/${id}`);
  },
};

export default serviceItemService;
