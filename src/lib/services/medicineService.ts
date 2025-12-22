/**
 * Medicine Service
 * Handles medicine and inventory API calls
 */

import api from '../api';

export interface Medicine {
  _id: string;
  medicineId: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer?: string;
  unit: string;
  reorderLevel: number;
  currentStock?: number;
  isActive: boolean;
  createdAt: string;
}

export interface StockBatch {
  _id: string;
  medicineId: string;
  batchNo: string;
  quantity: number;
  currentQty: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  status: string;
}

export const medicineService = {
  /**
   * Get all medicines
   */
  getAll: async (params: { search?: string; category?: string; page?: number; limit?: number; includeStock?: boolean } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.append(key, String(value));
    });
    return api.get(`/medicines?${query}`);
  },

  /**
   * Get medicine by ID
   */
  getById: async (id: string) => {
    return api.get(`/medicines/${id}`);
  },

  /**
   * Create new medicine
   */
  create: async (data: Partial<Medicine>) => {
    return api.post('/medicines', data);
  },

  /**
   * Update medicine
   */
  update: async (id: string, data: Partial<Medicine>) => {
    return api.put(`/medicines/${id}`, data);
  },

  /**
   * Get low stock medicines
   */
  getLowStock: async () => {
    return api.get('/medicines/low-stock');
  },

  /**
   * Get expiring medicines
   */
  getExpiring: async (days = 90) => {
    return api.get(`/medicines/expiring?days=${days}`);
  },

  /**
   * Add stock batch
   */
  addStock: async (data: { medicineId: string; batchNo: string; quantity: number; purchasePrice?: number; sellingPrice?: number; expiryDate: string }) => {
    return api.post('/medicines/stock', data);
  },
};

export default medicineService;
