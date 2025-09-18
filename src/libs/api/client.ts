import axios, { AxiosError, AxiosResponse } from "axios";
import Config from "react-native-config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = Config.API_BASE_URL ?? "http://10.0.2.2:3000";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }

    if (__DEV__) {
      console.log(`${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["auth_token", "auth_user"]);
    }

    return Promise.reject(error);
  }
);
