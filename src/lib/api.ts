/**
 * API Configuration and Axios Instance
 * Centralized API client for the entire application
 */

import axios from 'axios';

// Single source of truth for API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Unauthorized
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          localStorage.removeItem('tenant');
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/activate') &&
              !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      return Promise.reject({ error: error.message });
    }
  }
);

export default api;
