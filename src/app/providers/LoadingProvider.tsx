// src/app/providers/LoadingProvider.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Box, VStack, Spinner, Text, Modal, HStack, Progress } from 'native-base';
import { Loader2 } from 'lucide-react-native';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'overlay';
  cancellable?: boolean;
  onCancel?: () => void;
}

interface LoadingContextType {
  // Current loading state
  loading: LoadingState;
  
  // Show loading with message
  showLoading: (message?: string, options?: Partial<LoadingState>) => void;
  
  // Hide loading
  hideLoading: () => void;
  
  // Update loading message
  updateMessage: (message: string) => void;
  
  // Update progress (0-100)
  updateProgress: (progress: number) => void;
  
  // Show loading with progress
  showProgress: (message?: string, progress?: number) => void;
  
  // Show overlay loading
  showOverlay: (message?: string, cancellable?: boolean, onCancel?: () => void) => void;
  
  // Utility to wrap async operations with loading
  withLoading: <T>(
    operation: () => Promise<T>,
    message?: string,
    options?: Partial<LoadingState>
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    type: 'spinner',
  });

  const showLoading = useCallback((message?: string, options?: Partial<LoadingState>) => {
    setLoading({
      isLoading: true,
      message,
      type: 'spinner',
      ...options,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(prev => ({
      ...prev,
      isLoading: false,
      message: undefined,
      progress: undefined,
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoading(prev => ({
      ...prev,
      message,
    }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoading(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const showProgress = useCallback((message?: string, progress?: number) => {
    setLoading({
      isLoading: true,
      message,
      progress: progress ? Math.max(0, Math.min(100, progress)) : undefined,
      type: 'progress',
    });
  }, []);

  const showOverlay = useCallback((
    message?: string,
    cancellable?: boolean,
    onCancel?: () => void
  ) => {
    setLoading({
      isLoading: true,
      message,
      type: 'overlay',
      cancellable,
      onCancel,
    });
  }, []);

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    message?: string,
    options?: Partial<LoadingState>
  ): Promise<T> => {
    try {
      showLoading(message, options);
      const result = await operation();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const contextValue: LoadingContextType = {
    loading,
    showLoading,
    hideLoading,
    updateMessage,
    updateProgress,
    showProgress,
    showOverlay,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <LoadingOverlay />
    </LoadingContext.Provider>
  );
};

// Loading overlay component
const LoadingOverlay: React.FC = () => {
  const { loading, hideLoading } = useLoading();

  if (!loading.isLoading) {
    return null;
  }

  // Overlay type loading
  if (loading.type === 'overlay') {
    return (
      <Modal isOpen={true} onClose={() => {}} closeOnOverlayClick={false}>
        <Modal.Content maxWidth="300px">
          <Modal.Body>
            <VStack space="4" alignItems="center" py="4">
              <Spinner size="lg" color="blue.500" />
              
              {loading.message && (
                <Text fontSize="md" textAlign="center" color="gray.600">
                  {loading.message}
                </Text>
              )}

              {loading.progress !== undefined && (
                <VStack space="2" width="100%">
                  <Progress
                    value={loading.progress}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" textAlign="center" color="gray.500">
                    {Math.round(loading.progress)}%
                  </Text>
                </VStack>
              )}

              {loading.cancellable && loading.onCancel && (
                <Box mt="2">
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    textAlign="center"
                    onPress={loading.onCancel}
                    textDecorationLine="underline"
                  >
                    Cancel
                  </Text>
                </Box>
              )}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  // Progress type loading
  if (loading.type === 'progress') {
    return (
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(255, 255, 255, 0.9)"
        alignItems="center"
        justifyContent="center"
        zIndex="999"
      >
        <VStack space="4" alignItems="center" maxWidth="250px" p="6">
          <Loader2 size={32} color="#3B82F6" />
          
          {loading.message && (
            <Text fontSize="md" textAlign="center" color="gray.600">
              {loading.message}
            </Text>
          )}

          {loading.progress !== undefined && (
            <VStack space="2" width="100%">
              <Progress
                value={loading.progress}
                colorScheme="blue"
                size="md"
                borderRadius="full"
              />
              <Text fontSize="sm" textAlign="center" color="gray.500">
                {Math.round(loading.progress)}% complete
              </Text>
            </VStack>
          )}
        </VStack>
      </Box>
    );
  }

  // Default spinner type loading
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.8)"
      alignItems="center"
      justifyContent="center"
      zIndex="999"
    >
      <VStack space="3" alignItems="center">
        <Spinner size="lg" color="blue.500" />
        
        {loading.message && (
          <Text fontSize="md" textAlign="center" color="gray.600">
            {loading.message}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

// Hook to use loading context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Higher-order component for automatic loading on mount
export const withAutoLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingMessage?: string
) => {
  const WrappedComponent = (props: P) => {
    const { showLoading, hideLoading } = useLoading();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
      showLoading(loadingMessage || 'Loading...');
      
      // Simulate component mount delay
      const timer = setTimeout(() => {
        setMounted(true);
        hideLoading();
      }, 100);

      return () => {
        clearTimeout(timer);
        hideLoading();
      };
    }, [showLoading, hideLoading]);

    if (!mounted) {
      return null;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAutoLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for async operations with loading
export const useAsyncOperation = () => {
  const { withLoading } = useLoading();

  const executeWithLoading = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      loadingMessage?: string,
      options?: {
        showProgress?: boolean;
        onProgress?: (progress: number) => void;
        cancellable?: boolean;
      }
    ): Promise<T> => {
      return withLoading(
        operation,
        loadingMessage,
        {
          type: options?.showProgress ? 'progress' : 'spinner',
          cancellable: options?.cancellable,
        }
      );
    },
    [withLoading]
  );

  return { executeWithLoading };
};
