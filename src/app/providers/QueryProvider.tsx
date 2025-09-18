import React from 'react';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Configure focus manager for React Native
function onAppStateChange(status: string) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,

      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

export const QueryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      onlineManager.setOnline(!!state.isConnected);
    });

    return () => {
      subscription?.remove();
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
