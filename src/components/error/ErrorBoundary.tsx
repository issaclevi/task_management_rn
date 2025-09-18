// src/components/error/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, VStack, Text, Button, Alert, HStack } from 'native-base';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react-native';
import { config, isDevelopment } from '../../config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log error to external service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys?.[index] !== key
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, you would send this to your error tracking service
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
        appVersion: config.appVersion,
        environment: config.appVariant,
      };

      // Example: Send to your error tracking service
      if (config.analytics.enabled && config.analytics.sentryDsn) {
        // Sentry.captureException(error, { extra: errorData });
        console.log('Error logged to service:', errorData);
      }

      // Store locally for debugging
      if (isDevelopment()) {
        localStorage.setItem('lastError', JSON.stringify(errorData));
      }
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private getCurrentUserId = (): string | null => {
    try {
      // Get user ID from your auth context or storage
      return localStorage.getItem('userId');
    } catch {
      return null;
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    const subject = encodeURIComponent('Bug Report: Application Error');
    const body = encodeURIComponent(`
Error Details:
${JSON.stringify(errorReport, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Box flex="1" bg="gray.50" safeArea>
          <VStack flex="1" space="6" alignItems="center" justifyContent="center" p="6">
            {/* Error Icon */}
            <Box p="6" bg="red.100" borderRadius="full">
              <AlertTriangle size={48} color="#EF4444" />
            </Box>

            {/* Error Message */}
            <VStack space="3" alignItems="center" maxWidth="400">
              <Text fontSize="xl" fontWeight="bold" color="red.600" textAlign="center">
                Oops! Something went wrong
              </Text>
              
              <Text fontSize="md" color="gray.600" textAlign="center">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </Text>

              {isDevelopment() && error && (
                <Alert status="error" borderRadius="md" mt="4">
                  <VStack space="2" flex="1">
                    <Text fontSize="sm" fontWeight="bold" color="red.600">
                      Error Details (Development Mode):
                    </Text>
                    <Text fontSize="xs" color="red.600" fontFamily="mono">
                      {error.message}
                    </Text>
                    {error.stack && (
                      <Text fontSize="xs" color="red.500" fontFamily="mono" numberOfLines={5}>
                        {error.stack}
                      </Text>
                    )}
                  </VStack>
                </Alert>
              )}
            </VStack>

            {/* Action Buttons */}
            <VStack space="3" width="100%" maxWidth="300">
              <Button
                onPress={this.handleRetry}
                colorScheme="blue"
                leftIcon={<RefreshCw size={16} />}
                size="lg"
              >
                Try Again
              </Button>

              <HStack space="3">
                <Button
                  flex="1"
                  onPress={this.handleGoHome}
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<Home size={16} />}
                >
                  Go Home
                </Button>

                <Button
                  flex="1"
                  onPress={this.handleReload}
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={<RefreshCw size={16} />}
                >
                  Reload
                </Button>
              </HStack>

              <Button
                onPress={this.handleReportBug}
                variant="ghost"
                colorScheme="gray"
                leftIcon={<Bug size={16} />}
                size="sm"
              >
                Report Bug
              </Button>
            </VStack>

            {/* Additional Info */}
            <VStack space="2" alignItems="center">
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Error ID: {this.state.eventId || 'N/A'}
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                App Version: {config.appVersion}
              </Text>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error('Manual error report:', error, context);
    
    // Log to error service
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      if (config.analytics.enabled && config.analytics.sentryDsn) {
        // Sentry.captureException(error, { extra: errorData });
        console.log('Manual error logged:', errorData);
      }
    } catch (loggingError) {
      console.error('Failed to log manual error:', loggingError);
    }
  };

  return { reportError };
};
