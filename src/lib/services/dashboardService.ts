/**
 * Dashboard Service
 * Handles dashboard API calls
 */

import api from '../api';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  lowStockItems: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface DashboardAppointmentsResponse {
  success: boolean;
  data: {
    appointments: any[];
    total: number;
  };
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStatsResponse> => {
    return api.get('/dashboard/stats');
  },

  /**
   * Get today's appointments
   */
  getAppointments: async (date?: string): Promise<DashboardAppointmentsResponse> => {
    const query = date ? `?date=${date}` : '';
    return api.get(`/dashboard/appointments${query}`);
  },

  /**
   * Get recent activity
   */
  getActivity: async (limit?: number): Promise<any> => {
    const query = limit ? `?limit=${limit}` : '';
    return api.get(`/dashboard/activity${query}`);
  },
};

export default dashboardService;
