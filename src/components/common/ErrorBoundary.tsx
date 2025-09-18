// src/components/common/ErrorBoundary.tsx
import React from 'react';
import { Box, Text, Button, VStack, Icon } from 'native-base';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry?: () => void;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => (
  <Box flex={1} justifyContent="center" alignItems="center" p={6}>
    <VStack space={4} alignItems="center">
      <Icon as={AlertTriangle} size="xl" color="red.500" />
      <Text fontSize="lg" fontWeight="bold" textAlign="center">
        Something went wrong
      </Text>
      <Text fontSize="md" color="gray.600" textAlign="center">
        {error?.message || 'An unexpected error occurred'}
      </Text>
      {retry && (
        <Button
          onPress={retry}
          leftIcon={<Icon as={RefreshCw} size="sm" />}
          variant="outline"
          colorScheme="blue"
        >
          Try Again
        </Button>
      )}
    </VStack>
  </Box>
);

// API Error Fallback Component
export const ApiErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => (
  <Box flex={1} justifyContent="center" alignItems="center" p={6}>
    <VStack space={4} alignItems="center">
      <Icon as={AlertTriangle} size="xl" color="orange.500" />
      <Text fontSize="lg" fontWeight="bold" textAlign="center">
        Connection Error
      </Text>
      <Text fontSize="md" color="gray.600" textAlign="center">
        Unable to connect to the server. Please check your internet connection and try again.
      </Text>
      {retry && (
        <Button
          onPress={retry}
          leftIcon={<Icon as={RefreshCw} size="sm" />}
          colorScheme="orange"
        >
          Retry
        </Button>
      )}
    </VStack>
  </Box>
);

// Loading Error Component for Query Errors
interface QueryErrorProps {
  error: any;
  refetch?: () => void;
  isRefetching?: boolean;
}

export const QueryError: React.FC<QueryErrorProps> = ({ error, refetch, isRefetching }) => {
  const getErrorMessage = () => {
    if (error?.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error?.response?.status === 404) {
      return 'The requested data was not found.';
    }
    if (error?.response?.status === 403) {
      return 'You do not have permission to access this data.';
    }
    if (error?.message?.includes('Network Error')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    return error?.message || 'Failed to load data';
  };

  return (
    <Box p={4} bg="red.50" borderRadius="md" borderWidth={1} borderColor="red.200">
      <VStack space={3} alignItems="center">
        <Icon as={AlertTriangle} size="md" color="red.500" />
        <Text fontSize="sm" color="red.700" textAlign="center">
          {getErrorMessage()}
        </Text>
        {refetch && (
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onPress={refetch}
            isLoading={isRefetching}
            leftIcon={<Icon as={RefreshCw} size="xs" />}
          >
            Retry
          </Button>
        )}
      </VStack>
    </Box>
  );
};
