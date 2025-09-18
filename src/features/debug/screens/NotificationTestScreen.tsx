// src/features/debug/screens/NotificationTestScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TextArea,
  ScrollView,
  Badge,
  Divider,
  Icon,
  Alert,
  FormControl,
  Switch
} from 'native-base';
import { Send, Bell, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { api } from '../../../libs/api/client';
import { useAuth } from '../../../app/providers/AuthProvider';
import { oneSignalService } from '../../../libs/push/oneSignalService';

interface NotificationResult {
  id: string;
  title: string;
  message: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  details?: any;
}

export default function NotificationTestScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test notification from the app!');
  const [customData, setCustomData] = useState('{"type": "test", "source": "app"}');
  const [targetUserId, setTargetUserId] = useState('');
  const [sendToSelf, setSendToSelf] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<NotificationResult[]>([]);

  const addResult = (result: Omit<NotificationResult, 'id' | 'timestamp'>) => {
    const newResult: NotificationResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setResults(prev => [newResult, ...prev]);
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      addResult({
        title: 'Validation Error',
        message: 'Title and message are required',
        status: 'error'
      });
      return;
    }

    setIsLoading(true);
    addResult({
      title: title,
      message: 'Sending notification...',
      status: 'pending'
    });

    try {
      let data = {};
      if (customData.trim()) {
        try {
          data = JSON.parse(customData);
        } catch (e) {
          throw new Error('Invalid JSON in custom data');
        }
      }

      const payload = {
        title,
        message,
        data,
        ...(sendToSelf ? {} : { target_user_id: targetUserId })
      };

      const response = await api.post('/api/devices/send-notification', payload);

      addResult({
        title: title,
        message: `Notification sent successfully to ${response.data.sentTo} device(s)`,
        status: 'success',
        details: response.data
      });

    } catch (error: any) {
      console.error('Failed to send notification:', error);
      addResult({
        title: title,
        message: error.response?.data?.error || error.message || 'Failed to send notification',
        status: 'error',
        details: error.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendLocalNotification = async () => {
    try {
      await oneSignalService.sendLocalNotification(
        title || 'Test Local Notification',
        message || 'This is a local test notification'
      );
      
      addResult({
        title: title || 'Local Notification',
        message: 'Local notification sent successfully',
        status: 'success'
      });
    } catch (error: any) {
      addResult({
        title: 'Local Notification Error',
        message: error.message || 'Failed to send local notification',
        status: 'error'
      });
    }
  };

  const checkDeviceTokens = async () => {
    try {
      const response = await api.get('/api/devices/tokens');
      addResult({
        title: 'Device Tokens',
        message: `Found ${response.data.length} registered device token(s)`,
        status: 'success',
        details: response.data
      });
    } catch (error: any) {
      addResult({
        title: 'Device Tokens Error',
        message: error.response?.data?.error || 'Failed to fetch device tokens',
        status: 'error'
      });
    }
  };

  const getStatusIcon = (status: NotificationResult['status']) => {
    switch (status) {
      case 'success':
        return <Icon as={CheckCircle} color="green.500" size="sm" />;
      case 'error':
        return <Icon as={XCircle} color="red.500" size="sm" />;
      case 'pending':
        return <Icon as={AlertTriangle} color="orange.500" size="sm" />;
    }
  };

  const getStatusColor = (status: NotificationResult['status']) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'pending':
        return 'orange';
    }
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView>
        <VStack space={4} p={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold">Notification Test</Text>
            <Icon as={Bell} size="lg" color="blue.500" />
          </HStack>

          <Box bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              <Text fontWeight="bold">User:</Text> {user?.email} ({user?.role})
            </Text>
          </Box>

          {/* Notification Form */}
          <VStack space={3}>
            <FormControl>
              <FormControl.Label>Title</FormControl.Label>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Enter notification title"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Message</FormControl.Label>
              <TextArea
                value={message}
                onChangeText={setMessage}
                placeholder="Enter notification message"
                h={20}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Custom Data (JSON)</FormControl.Label>
              <TextArea
                value={customData}
                onChangeText={setCustomData}
                placeholder='{"key": "value"}'
                h={16}
                fontFamily="mono"
                fontSize="sm"
              />
            </FormControl>

            <FormControl>
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Send to myself</Text>
                <Switch
                  isChecked={sendToSelf}
                  onToggle={setSendToSelf}
                />
              </HStack>
            </FormControl>

            {!sendToSelf && (
              <FormControl>
                <FormControl.Label>Target User ID</FormControl.Label>
                <Input
                  value={targetUserId}
                  onChangeText={setTargetUserId}
                  placeholder="Enter user ID to send notification to"
                />
              </FormControl>
            )}
          </VStack>

          {/* Action Buttons */}
          <VStack space={3}>
            <Button
              onPress={sendNotification}
              isLoading={isLoading}
              leftIcon={<Icon as={Send} size="sm" />}
              colorScheme="blue"
            >
              Send Push Notification
            </Button>

            <HStack space={3}>
              <Button
                flex={1}
                variant="outline"
                onPress={sendLocalNotification}
                leftIcon={<Icon as={Bell} size="sm" />}
              >
                Send Local
              </Button>
              <Button
                flex={1}
                variant="outline"
                onPress={checkDeviceTokens}
                colorScheme="green"
              >
                Check Tokens
              </Button>
            </HStack>
          </VStack>

          <Divider />

          {/* Results */}
          <Text fontSize="lg" fontWeight="bold">Test Results</Text>
          
          {results.length === 0 ? (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text color="gray.500" textAlign="center">
                No test results yet. Send a notification to see results here.
              </Text>
            </Box>
          ) : (
            <VStack space={3}>
              {results.map((result) => (
                <Box key={result.id} p={3} bg="gray.50" borderRadius="md" borderWidth={1} borderColor="gray.200">
                  <HStack justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold" flex={1}>{result.title}</Text>
                    <HStack space={2} alignItems="center">
                      <Badge colorScheme={getStatusColor(result.status)} variant="subtle">
                        {result.status}
                      </Badge>
                      {getStatusIcon(result.status)}
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={1}>{result.message}</Text>
                  <Text fontSize="xs" color="gray.400">
                    {result.timestamp.toLocaleTimeString()}
                  </Text>
                  {result.details && (
                    <Box mt={2} p={2} bg="gray.100" borderRadius="sm">
                      <Text fontSize="xs" fontFamily="mono" color="gray.700">
                        {JSON.stringify(result.details, null, 2)}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
