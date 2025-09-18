// src/libs/api/users.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { useAuth } from '../../app/providers/AuthProvider';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at: string;
}

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  created_at: string;
}

export interface RegisterDeviceRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

// Users API functions
export const usersApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/users/${userId}`);
  }
};

// Device tokens API functions
export const devicesApi = {
  registerDevice: async (data: RegisterDeviceRequest): Promise<{ ok: boolean; message: string }> => {
    const response = await api.post('/api/devices/register', data);
    return response.data;
  },

  unregisterDevice: async (token: string): Promise<{ ok: boolean; message: string; deleted: boolean }> => {
    const response = await api.delete('/api/devices/unregister', { data: { token } });
    return response.data;
  },

  getDeviceTokens: async (): Promise<DeviceToken[]> => {
    const response = await api.get('/api/devices/tokens');
    return response.data;
  }
};

// React Query hooks for users
export const useUsers = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers,
    enabled: isAuthenticated && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Don't retry on server errors (500) - likely backend issue
      if (error?.response?.status >= 500) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useUser = (userId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      usersApi.updateUser(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user in cache
      queryClient.setQueryData(['users', userId], updatedUser);

      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Update user error:', error);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (_, userId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: ['users', userId] });

      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    }
  });
};

// React Query hooks for device tokens
export const useDeviceTokens = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['devices', 'tokens'],
    queryFn: devicesApi.getDeviceTokens,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useRegisterDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.registerDevice,
    onSuccess: () => {
      // Invalidate device tokens to refetch
      queryClient.invalidateQueries({ queryKey: ['devices', 'tokens'] });
    },
    onError: (error) => {
      console.error('Register device error:', error);
    }
  });
};

export const useUnregisterDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.unregisterDevice,
    onSuccess: () => {
      // Invalidate device tokens to refetch
      queryClient.invalidateQueries({ queryKey: ['devices', 'tokens'] });
    },
    onError: (error) => {
      console.error('Unregister device error:', error);
    }
  });
};
