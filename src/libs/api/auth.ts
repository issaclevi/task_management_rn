// src/libs/api/auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { useAuth, User } from '../../app/providers/AuthProvider';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

// Auth API functions
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
};

// React Query hooks
export const useLogin = () => {
  const { signIn } = useAuth();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const result = await signIn(data.email, data.password);
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      return result;
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    }
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onError: (error) => {
      console.error('Register mutation error:', error);
    }
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useLogout = () => {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout mutation error:', error);
      // Still clear queries even if logout API fails
      queryClient.clear();
    }
  });
};

export const useRefreshToken = () => {
  const { refreshToken } = useAuth();
  
  return useMutation({
    mutationFn: refreshToken,
    onError: (error) => {
      console.error('Token refresh error:', error);
    }
  });
};
