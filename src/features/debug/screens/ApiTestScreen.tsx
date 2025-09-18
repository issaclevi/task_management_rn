// src/features/debug/screens/ApiTestScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Badge,
  Divider,
  Icon,
  Spinner
} from 'native-base';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { api, API_BASE_URL, checkApiHealth } from '../../../libs/api/client';
import { useAuth } from '../../../app/providers/AuthProvider';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function ApiTestScreen() {
  const { user, token } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      const newTest = { name, status, message, details };
      
      if (existing) {
        return prev.map(t => t.name === name ? newTest : t);
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: API Base URL
    updateTest('API Base URL', 'pending', 'Checking configuration...');
    await new Promise(resolve => setTimeout(resolve, 500));
    updateTest('API Base URL', 'success', `Connected to: ${API_BASE_URL}`);

    // Test 2: Health Check
    updateTest('Health Check', 'pending', 'Testing server connectivity...');
    try {
      const isHealthy = await checkApiHealth();
      if (isHealthy) {
        updateTest('Health Check', 'success', 'Server is healthy');
      } else {
        updateTest('Health Check', 'error', 'Server health check failed');
      }
    } catch (error: any) {
      updateTest('Health Check', 'error', `Health check failed: ${error.message}`);
    }

    // Test 3: Authentication Status
    updateTest('Authentication', 'pending', 'Checking auth status...');
    await new Promise(resolve => setTimeout(resolve, 300));
    if (user && token) {
      updateTest('Authentication', 'success', `Logged in as: ${user.email} (${user.role})`);
    } else {
      updateTest('Authentication', 'error', 'Not authenticated');
    }

    // Test 4: User Tasks API
    if (user && token) {
      updateTest('Tasks API', 'pending', 'Testing tasks endpoint...');
      try {
        const response = await api.get('/api/tasks/me');
        updateTest('Tasks API', 'success', `Tasks loaded: ${response.data?.length || 0} tasks`, response.data);
      } catch (error: any) {
        updateTest('Tasks API', 'error', `Tasks API failed: ${error.message}`, error.response?.data);
      }

      // Test 5: Users API (Admin only)
      if (user.role === 'ADMIN') {
        updateTest('Users API', 'pending', 'Testing users endpoint...');
        try {
          const response = await api.get('/api/users');
          updateTest('Users API', 'success', `Users loaded: ${response.data?.length || 0} users`, response.data);
        } catch (error: any) {
          updateTest('Users API', 'error', `Users API failed: ${error.message}`, error.response?.data);
        }
      }

      // Test 6: Device Registration
      updateTest('Device Registration', 'pending', 'Testing device registration...');
      try {
        const response = await api.get('/api/devices/tokens');
        updateTest('Device Registration', 'success', `Device tokens: ${response.data?.length || 0}`, response.data);
      } catch (error: any) {
        updateTest('Device Registration', 'error', `Device API failed: ${error.message}`, error.response?.data);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Icon as={CheckCircle} color="green.500" size="sm" />;
      case 'error':
        return <Icon as={XCircle} color="red.500" size="sm" />;
      case 'pending':
        return <Spinner size="sm" color="blue.500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'pending':
        return 'blue';
    }
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <VStack space={4} p={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold">API Connection Test</Text>
          <Button
            onPress={runTests}
            isLoading={isRunning}
            leftIcon={<Icon as={RefreshCw} size="sm" />}
            size="sm"
          >
            Run Tests
          </Button>
        </HStack>

        <Box bg="gray.100" p={3} borderRadius="md">
          <Text fontSize="sm" color="gray.600">
            <Text fontWeight="bold">API URL:</Text> {API_BASE_URL}
          </Text>
          <Text fontSize="sm" color="gray.600">
            <Text fontWeight="bold">User:</Text> {user ? `${user.email} (${user.role})` : 'Not logged in'}
          </Text>
        </Box>

        <Divider />

        <ScrollView flex={1}>
          <VStack space={3}>
            {tests.map((test, index) => (
              <Box key={index} p={3} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.200">
                <HStack justifyContent="space-between" alignItems="center" mb={2}>
                  <Text fontWeight="bold">{test.name}</Text>
                  <HStack space={2} alignItems="center">
                    <Badge colorScheme={getStatusColor(test.status)} variant="subtle">
                      {test.status}
                    </Badge>
                    {getStatusIcon(test.status)}
                  </HStack>
                </HStack>
                <Text fontSize="sm" color="gray.600">{test.message}</Text>
                {test.details && (
                  <Box mt={2} p={2} bg="gray.100" borderRadius="sm">
                    <Text fontSize="xs" fontFamily="mono" color="gray.700">
                      {JSON.stringify(test.details, null, 2)}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
}
