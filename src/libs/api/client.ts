// src/libs/api/client.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native CLI, use environment variables or default
const fromExtra = process.env.API_BASE_URL;

const FALLBACK = Platform.select({
  android: 'https://task.makdeveasy.com',
  ios: 'https://task.makdeveasy.com',
  default: 'https://task.makdeveasy.com'
});

export const API_BASE_URL = fromExtra ?? FALLBACK!;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // Log request in development
    if (__DEV__) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.error(`${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
      } catch (storageError) {
        console.error('Failed to clear auth data:', storageError);
      }
    }

    // Enhance error message for better UX
    const enhancedError = {
      ...error,
      message: getErrorMessage(error)
    };

    return Promise.reject(enhancedError);
  }
);

// Helper function to extract meaningful error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (typeof data === 'string') {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return data.error;
    }

    if (data.details) {
      return JSON.stringify(data.details);
    }
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network connection failed. Please check your internet connection.';
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Default error message
  return error.message || 'An unexpected error occurred';
}

// API health check
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200 && response.data?.ok === true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
