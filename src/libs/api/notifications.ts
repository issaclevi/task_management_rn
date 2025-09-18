import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export interface NotificationTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueAt?: string;
  geofence?: {
    center: { lat: number; lng: number };
    radiusM: number;
  } | null;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
  task?: NotificationTask | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// Get user notifications
export const useUserNotifications = (userId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['notifications', 'user', userId, page, limit],
    queryFn: async (): Promise<NotificationResponse> => {
      const response = await api.get(`/api/notifications/user/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
};

// Get unread notification count
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<UnreadCountResponse> => {
      const response = await api.get('/api/notifications/unread-count');
      return response.data;
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for real-time badge updates
  });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.post(`/api/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Send test notification (admin only)
export const useSendTestNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/notifications/test');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notification queries to show new notification
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Notification helper functions
export const getNotificationIcon = (notification: Notification): string => {
  if (notification.task) {
    switch (notification.task.status) {
      case 'NEW':
        return '📋';
      case 'IN_PROGRESS':
        return '⏳';
      case 'COMPLETED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  }

  // Check notification type from data
  const type = notification.data?.type;
  switch (type) {
    case 'TASK_ASSIGNED':
      return '📋';
    case 'TASK_REMINDER':
      return '⏰';
    case 'GEOFENCE_ALERT':
      return '📍';
    case 'TASK_UPDATED':
      return '🔄';
    default:
      return '🔔';
  }
};

export const getNotificationColor = (notification: Notification): string => {
  if (notification.isRead) {
    return '#9CA3AF'; // Gray for read notifications
  }

  if (notification.task) {
    switch (notification.task.status) {
      case 'NEW':
        return '#3B82F6'; // Blue
      case 'IN_PROGRESS':
        return '#F59E0B'; // Orange
      case 'COMPLETED':
        return '#10B981'; // Green
      case 'CANCELLED':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  }

  return '#3B82F6'; // Default blue
};

export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  }
};
