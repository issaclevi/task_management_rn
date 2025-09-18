// src/components/ui/LoadingState.tsx
import React from 'react';
import { Box, VStack, Spinner, Text, HStack, Skeleton } from 'native-base';
import { Loader2 } from 'lucide-react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'inline';
  skeletonLines?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'lg',
  variant = 'spinner',
  skeletonLines = 3
}) => {
  if (variant === 'skeleton') {
    return (
      <VStack space="3" p="4">
        {Array.from({ length: skeletonLines }).map((_, index) => (
          <Skeleton
            key={index}
            h="4"
            borderRadius="md"
            startColor="gray.200"
            endColor="gray.300"
          />
        ))}
      </VStack>
    );
  }

  if (variant === 'inline') {
    return (
      <HStack space="2" alignItems="center" justifyContent="center" p="2">
        <Spinner size="sm" color="blue.500" />
        <Text fontSize="sm" color="gray.500">
          {message}
        </Text>
      </HStack>
    );
  }

  return (
    <Box flex="1" alignItems="center" justifyContent="center" p="6">
      <VStack space="4" alignItems="center">
        <Spinner size={size} color="blue.500" />
        <Text fontSize="md" color="gray.500" textAlign="center">
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  children
}) => {
  return (
    <Box flex="1" position="relative">
      {children}
      {isVisible && (
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
            <Text fontSize="md" color="gray.600" textAlign="center">
              {message}
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  ...props
}) => {
  return (
    <Box {...props}>
      {isLoading ? (
        <HStack space="2" alignItems="center" justifyContent="center">
          <Spinner size="sm" color="white" />
          {loadingText && (
            <Text color="white" fontSize="md">
              {loadingText}
            </Text>
          )}
        </HStack>
      ) : (
        children
      )}
    </Box>
  );
};
