// src/app/providers/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../libs/api/client';
import { oneSignalService } from '../../libs/push/oneSignalService';
import { permissionManager } from '../../libs/permissions/permissionManager';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize OneSignal
        await oneSignalService.initialize('391717f6-e570-4671-9ea0-bf58db95a048');

        // Request permissions after a short delay to ensure OneSignal is ready
        setTimeout(async () => {
          try {
            const permissions = await permissionManager.requestAllPermissions();
            console.log('📱 Permissions status:', permissions);
          } catch (error) {
            console.error('Error requesting permissions:', error);
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, newToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser))
      ]);

      setToken(newToken);
      setUser(newUser);

      console.log('Login successful:', newUser.id);


      await oneSignalService.getPushToken(newUser.id);

      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      if (token) {
        await oneSignalService.unregisterPushToken();
        await oneSignalService.removeExternalUserId();
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }

      await clearAuthData();
    } catch (error) {
      console.error('Sign out error:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) return false;

      const response = await api.post('/api/auth/refresh');
      const { token: newToken, user: newUser } = response.data;

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, newToken),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser))
      ]);

      setToken(newToken);
      setUser(newUser);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await clearAuthData();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    signIn,
    signOut,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};