// src/libs/api/tasks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { useAuth } from '../../app/providers/AuthProvider';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  due_at?: string;
  created_at: string;
  acknowledged_at?: string;
  assigned_at?: string;
  geofence_center?: {
    lat: number;
    lng: number;
    radiusM: number;
  };
  geofence_radius_m?: number;
  distance_meters?: number;
  within_geofence?: boolean;
  created_by_email?: string;
  assignees?: Array<{
    user_id: string;
    email: string;
    assigned_at: string;
    acknowledged_at?: string;
  }>;
  user_assignment?: {
    assigned_at: string;
    acknowledged_at?: string;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueAt?: string;
  geofence?: {
    lat: number;
    lng: number;
    radiusM: number;
  } | null;
  assigneeIds: string[];
}

export interface AcknowledgeTaskRequest {
  lat?: number;
  lng?: number;
}

// Task API functions
export const tasksApi = {
  getUserTasks: async (lat?: number, lng?: number): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());

    const response = await api.get(`/api/tasks/me?${params.toString()}`);
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/api/tasks', data);
    return response.data;
  },

  acknowledgeTask: async (taskId: string, data: AcknowledgeTaskRequest): Promise<{ ok: boolean }> => {
    const response = await api.post(`/api/tasks/${taskId}/ack`, data);
    return response.data;
  },

  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId: string, data: Partial<CreateTaskRequest>): Promise<Task> => {
    const response = await api.put(`/api/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/api/tasks/${taskId}`);
  },

  getAllTasks: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    assigneeId?: string;
  }): Promise<{
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },

  getTaskStats: async (): Promise<{
    new_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    cancelled_tasks: number;
    overdue_tasks: number;
    geofenced_tasks: number;
  }> => {
    const response = await api.get('/api/tasks/stats');
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: Task['status']): Promise<Task> => {
    const response = await api.put(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  }
};

// React Query hooks
export const useUserTasks = (lat?: number, lng?: number) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'user', lat, lng],
    queryFn: () => tasksApi.getUserTasks(lat, lng),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      if (error?.response?.status >= 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useTask = (taskId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksApi.getTaskById(taskId),
    enabled: isAuthenticated && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      // Optionally add the new task to the cache
      queryClient.setQueryData(['tasks', newTask.id], newTask);
    },
    onError: (error) => {
      console.error('Create task error:', error);
    }
  });
};

export const useAcknowledgeTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: AcknowledgeTaskRequest }) =>
      tasksApi.acknowledgeTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate tasks queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error) => {
      console.error('Acknowledge task error:', error);
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<CreateTaskRequest> }) =>
      tasksApi.updateTask(taskId, data),
    onSuccess: (updatedTask, { taskId }) => {
      // Update the specific task in cache
      queryClient.setQueryData(['tasks', taskId], updatedTask);

      // Invalidate tasks list to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks', 'user'] });
    },
    onError: (error) => {
      console.error('Update task error:', error);
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (_, taskId) => {
      // Remove the task from cache
      queryClient.removeQueries({ queryKey: ['tasks', taskId] });

      // Invalidate tasks list to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks', 'user'] });
    },
    onError: (error) => {
      console.error('Delete task error:', error);
    }
  });
};

// Admin hooks for task management
export const useAllTasks = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  assigneeId?: string;
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'all', params],
    queryFn: () => tasksApi.getAllTasks(params),
    enabled: isAuthenticated && isAdmin,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      if (error?.response?.status >= 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useTaskStats = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: tasksApi.getTaskStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      if (error?.response?.status >= 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      tasksApi.updateTaskStatus(taskId, status),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(['tasks', taskId], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'stats'] });
    },
    onError: (error) => {
      console.error('Update task status error:', error);
    }
  });
};
