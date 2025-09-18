// src/app/providers/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Box, VStack, HStack, Text, IconButton, Alert } from 'native-base';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react-native';
import { Animated, Dimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  // Show different types of toasts
  showSuccess: (message: string, options?: Partial<Toast>) => string;
  showError: (message: string, options?: Partial<Toast>) => string;
  showWarning: (message: string, options?: Partial<Toast>) => string;
  showInfo: (message: string, options?: Partial<Toast>) => string;
  
  // Generic show toast
  showToast: (toast: Omit<Toast, 'id'>) => string;
  
  // Hide specific toast
  hideToast: (id: string) => void;
  
  // Hide all toasts
  hideAllToasts: () => void;
  
  // Current toasts
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 4000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }

    return id;
  }, [generateId, defaultDuration, maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string, options?: Partial<Toast>): string => {
    return showToast({
      type: 'success',
      message,
      ...options,
    });
  }, [showToast]);

  const showError = useCallback((message: string, options?: Partial<Toast>): string => {
    return showToast({
      type: 'error',
      message,
      duration: 6000, // Longer duration for errors
      ...options,
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, options?: Partial<Toast>): string => {
    return showToast({
      type: 'warning',
      message,
      ...options,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, options?: Partial<Toast>): string => {
    return showToast({
      type: 'info',
      message,
      ...options,
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    hideToast,
    hideAllToasts,
    toasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast container component
const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();
  const { width } = Dimensions.get('window');

  if (toasts.length === 0) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top="12"
      left="4"
      right="4"
      zIndex="9999"
      pointerEvents="box-none"
    >
      <VStack space="2">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => hideToast(toast.id)}
            index={index}
          />
        ))}
      </VStack>
    </Box>
  );
};

// Individual toast item component
interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, index }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleDismiss = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          status: 'success' as const,
          icon: <CheckCircle size={20} color="#10B981" />,
          colorScheme: 'success',
        };
      case 'error':
        return {
          status: 'error' as const,
          icon: <AlertCircle size={20} color="#EF4444" />,
          colorScheme: 'error',
        };
      case 'warning':
        return {
          status: 'warning' as const,
          icon: <AlertTriangle size={20} color="#F59E0B" />,
          colorScheme: 'warning',
        };
      case 'info':
        return {
          status: 'info' as const,
          icon: <Info size={20} color="#3B82F6" />,
          colorScheme: 'info',
        };
      default:
        return {
          status: 'info' as const,
          icon: <Info size={20} color="#3B82F6" />,
          colorScheme: 'info',
        };
    }
  };

  const config = getToastConfig(toast.type);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: index > 0 ? 8 : 0,
      }}
    >
      <Alert
        status={config.status}
        borderRadius="lg"
        shadow="3"
        bg="white"
        borderWidth="1"
        borderColor={`${config.colorScheme}.200`}
      >
        <HStack space="3" alignItems="flex-start" flex="1">
          {config.icon}
          
          <VStack space="1" flex="1">
            {toast.title && (
              <Text fontSize="sm" fontWeight="bold" color={`${config.colorScheme}.700`}>
                {toast.title}
              </Text>
            )}
            
            <Text fontSize="sm" color={`${config.colorScheme}.600`} flexWrap="wrap">
              {toast.message}
            </Text>

            {toast.action && (
              <Box mt="2">
                <Text
                  fontSize="sm"
                  color={`${config.colorScheme}.500`}
                  fontWeight="medium"
                  onPress={toast.action.onPress}
                  textDecorationLine="underline"
                >
                  {toast.action.label}
                </Text>
              </Box>
            )}
          </VStack>

          <IconButton
            size="sm"
            variant="ghost"
            icon={<X size={16} color="#6B7280" />}
            onPress={handleDismiss}
          />
        </HStack>
      </Alert>
    </Animated.View>
  );
};

// Hook to use toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Utility hooks for common toast patterns
export const useApiToast = () => {
  const { showSuccess, showError } = useToast();

  const handleApiSuccess = useCallback((message: string = 'Operation completed successfully') => {
    showSuccess(message);
  }, [showSuccess]);

  const handleApiError = useCallback((error: any, fallbackMessage: string = 'An error occurred') => {
    const message = error?.response?.data?.message || error?.message || fallbackMessage;
    showError(message, { persistent: true });
  }, [showError]);

  return { handleApiSuccess, handleApiError };
};

export const useFormToast = () => {
  const { showSuccess, showError, showWarning } = useToast();

  const handleFormSuccess = useCallback((message: string = 'Form submitted successfully') => {
    showSuccess(message);
  }, [showSuccess]);

  const handleFormError = useCallback((message: string = 'Please check your input and try again') => {
    showError(message);
  }, [showError]);

  const handleFormWarning = useCallback((message: string) => {
    showWarning(message);
  }, [showWarning]);

  return { handleFormSuccess, handleFormError, handleFormWarning };
};
