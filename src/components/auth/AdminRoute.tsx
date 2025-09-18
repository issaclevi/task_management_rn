// src/components/auth/AdminRoute.tsx
import React from 'react';
import { Box, VStack, Text, Button, Alert } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../app/providers/AuthProvider';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  fallback
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigation = useNavigation();

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <Box flex="1" bg="gray.50" alignItems="center" justifyContent="center" p="4">
        <VStack space="4" alignItems="center">
          <Shield size={48} color="#9CA3AF" />
          <Text fontSize="lg" color="gray.500" textAlign="center">
            Authentication required
          </Text>
          <Button onPress={() => navigation.navigate('/auth/login')}>
            Go to Login
          </Button>
        </VStack>
      </Box>
    );
  }

  // Show access denied if user is not admin
  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box flex="1" bg="gray.50" p="4" safeArea>
        <VStack space="6" alignItems="center" justifyContent="center" flex="1">
          <Shield size={64} color="#EF4444" />

          <VStack space="2" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" color="red.600">
              Access Denied
            </Text>
            <Text fontSize="md" color="gray.600" textAlign="center">
              You need administrator privileges to access this page.
            </Text>
          </VStack>

          <Alert status="warning" borderRadius="md" maxWidth="400px">
            <VStack space="2" alignItems="center">
              <Text fontSize="sm" color="orange.700" textAlign="center">
                Current user: {user?.email}
              </Text>
              <Text fontSize="sm" color="orange.700" textAlign="center">
                Role: {user?.role || 'Unknown'}
              </Text>
            </VStack>
          </Alert>

          <VStack space="3" width="100%" maxWidth="300px">
            <Button
              onPress={() => navigation.goBack()}
              leftIcon={<ArrowLeft size={16} color="white" />}
              colorScheme="blue"
            >
              Go Back
            </Button>

            <Button
              onPress={() => navigation.navigate('/')}
              variant="outline"
              colorScheme="blue"
            >
              Go to Dashboard
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // User is authenticated and is admin, render children
  return <>{children}</>;
};
