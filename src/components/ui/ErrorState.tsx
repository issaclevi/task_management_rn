// src/components/ui/ErrorState.tsx
import React from 'react';
import { Box, VStack, Text, Button, Alert, HStack } from 'native-base';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  variant?: 'full' | 'inline' | 'banner';
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  variant = 'full',
  showIcon = true
}) => {
  if (variant === 'banner') {
    return (
      <Alert status="error" borderRadius="md" mb="4">
        <HStack space="2" alignItems="center" flex="1">
          {showIcon && <AlertTriangle size={16} color="#EF4444" />}
          <VStack flex="1" space="1">
            <Text fontSize="sm" fontWeight="bold" color="red.600">
              {title}
            </Text>
            <Text fontSize="xs" color="red.600">
              {message}
            </Text>
          </VStack>
          {onRetry && (
            <Button size="xs" colorScheme="red" variant="outline" onPress={onRetry}>
              {retryText}
            </Button>
          )}
        </HStack>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <HStack space="2" alignItems="center" justifyContent="center" p="4">
        {showIcon && <AlertTriangle size={20} color="#EF4444" />}
        <VStack space="1" flex="1">
          <Text fontSize="sm" fontWeight="medium" color="red.600">
            {title}
          </Text>
          <Text fontSize="xs" color="red.500">
            {message}
          </Text>
        </VStack>
        {onRetry && (
          <Button size="sm" colorScheme="red" variant="outline" onPress={onRetry}>
            <RefreshCw size={14} />
          </Button>
        )}
      </HStack>
    );
  }

  return (
    <Box flex="1" alignItems="center" justifyContent="center" p="6">
      <VStack space="4" alignItems="center" maxWidth="300">
        {showIcon && (
          <Box p="4" bg="red.100" borderRadius="full">
            <AlertTriangle size={32} color="#EF4444" />
          </Box>
        )}
        
        <VStack space="2" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" color="red.600" textAlign="center">
            {title}
          </Text>
          <Text fontSize="md" color="red.500" textAlign="center">
            {message}
          </Text>
        </VStack>

        {onRetry && (
          <Button
            onPress={onRetry}
            colorScheme="red"
            variant="outline"
            leftIcon={<RefreshCw size={16} />}
          >
            {retryText}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  variant?: 'full' | 'inline' | 'banner';
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  variant = 'full'
}) => {
  return (
    <ErrorState
      title="Connection Error"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      retryText="Retry"
      variant={variant}
      showIcon={true}
    />
  );
};

interface NotFoundErrorProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  variant?: 'full' | 'inline' | 'banner';
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  title = 'Not Found',
  message = 'The requested item could not be found.',
  onGoBack,
  variant = 'full'
}) => {
  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={onGoBack}
      retryText="Go Back"
      variant={variant}
      showIcon={true}
    />
  );
};

interface PermissionErrorProps {
  title?: string;
  message?: string;
  onRequestPermission?: () => void;
  variant?: 'full' | 'inline' | 'banner';
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  title = 'Permission Required',
  message = 'This feature requires additional permissions to work properly.',
  onRequestPermission,
  variant = 'full'
}) => {
  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={onRequestPermission}
      retryText="Grant Permission"
      variant={variant}
      showIcon={true}
    />
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message = 'There are no items to display at the moment.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <Box flex="1" alignItems="center" justifyContent="center" p="6">
      <VStack space="4" alignItems="center" maxWidth="300">
        {icon && (
          <Box p="4" bg="gray.100" borderRadius="full">
            {icon}
          </Box>
        )}
        
        <VStack space="2" alignItems="center">
          <Text fontSize="lg" fontWeight="bold" color="gray.600" textAlign="center">
            {title}
          </Text>
          <Text fontSize="md" color="gray.500" textAlign="center">
            {message}
          </Text>
        </VStack>

        {onAction && actionText && (
          <Button onPress={onAction} colorScheme="blue">
            {actionText}
          </Button>
        )}
      </VStack>
    </Box>
  );
};
