import axios from 'axios';
import { ApiResponse } from '../types/apiType';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }
};