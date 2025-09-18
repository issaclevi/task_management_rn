// src/features/admin/screens/CreateTaskScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TextArea,
  FormControl,
  ScrollView,
  Switch,
  Select,
  CheckIcon,
  Alert,
  Spinner
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Calendar, Users, Save, ArrowLeft } from 'lucide-react-native';
import { useCreateTask, useUsers } from '../../../libs/api';
import { GeofenceManager } from '../../../components/location/GeofenceManager';
import { LocationStatus } from '../../../components/location/LocationStatus';
import { GeofenceRegion } from '../../../libs/location/locationService';

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  assigneeIds: string[];
  hasGeofence: boolean;
  geofence: {
    lat: number;
    lng: number;
    radiusM: number;
  } | null;
}

export const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const createTaskMutation = useCreateTask();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    assigneeIds: [],
    hasGeofence: false,
    geofence: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (formData.assigneeIds.length === 0) {
      newErrors.assigneeIds = 'At least one assignee is required';
    }

    if (formData.hasGeofence && !formData.geofence) {
      newErrors.geofence = 'Geofence location is required when geofencing is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createTaskMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        dueAt: formData.dueDate || undefined,
        assigneeIds: formData.assigneeIds,
        geofence: formData.hasGeofence ? formData.geofence : null
      });

      // Navigate back on success
      navigation.goBack();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleGeofenceAdded = (region: GeofenceRegion) => {
    setFormData(prev => ({
      ...prev,
      geofence: {
        lat: region.latitude,
        lng: region.longitude,
        radiusM: region.radius
      }
    }));
  };

  const handleAssigneeToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  const userOptions = users.filter(user => user.role === 'USER');

  return (
    <ScrollView bg="gray.50" flex="1">
      <Box p="4" safeArea>
        <VStack space="6">
          {/* Header */}
          <HStack space="3" alignItems="center">
            <Button
              variant="ghost"
              onPress={() => navigation.goBack()}
              leftIcon={<ArrowLeft size={16} />}
              p="2"
            >
              Back
            </Button>
            <Text fontSize="xl" fontWeight="bold" flex="1">
              Create New Task
            </Text>
          </HStack>

          {/* Task Details Form */}
          <Box bg="white" p="4" borderRadius="lg" shadow="1">
            <VStack space="4">
              <Text fontSize="lg" fontWeight="semibold">
                Task Details
              </Text>

              <FormControl isInvalid={!!errors.title}>
                <FormControl.Label>Task Title</FormControl.Label>
                <Input
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholder="Enter task title"
                />
                <FormControl.ErrorMessage>
                  {errors.title}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormControl.Label>Description</FormControl.Label>
                <TextArea
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Enter task description"
                  h="20"
                  autoCompleteType=""
                />
                <FormControl.ErrorMessage>
                  {errors.description}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl>
                <FormControl.Label>Due Date (Optional)</FormControl.Label>
                <Input
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
                  placeholder="YYYY-MM-DD HH:MM"
                  leftElement={<Calendar size={16} color="#6B7280" style={{ marginLeft: 12 }} />}
                />
                <FormControl.HelperText>
                  Format: YYYY-MM-DD HH:MM (e.g., 2024-12-25 14:30)
                </FormControl.HelperText>
              </FormControl>
            </VStack>
          </Box>

          {/* Assignees */}
          <Box bg="white" p="4" borderRadius="lg" shadow="1">
            <VStack space="4">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="semibold">
                  Assign to Users
                </Text>
                <Users size={20} color="#6B7280" />
              </HStack>

              {isLoadingUsers ? (
                <Box alignItems="center" py="4">
                  <Spinner size="lg" />
                  <Text mt="2" color="gray.500">Loading users...</Text>
                </Box>
              ) : userOptions.length === 0 ? (
                <Box
                  bg="gray.50"
                  p="4"
                  borderRadius="md"
                  alignItems="center"
                >
                  <Users size={32} color="#9CA3AF" />
                  <Text mt="2" color="gray.500" textAlign="center">
                    No users available
                  </Text>
                </Box>
              ) : (
                <VStack space="2">
                  {userOptions.map((user) => (
                    <HStack
                      key={user.id}
                      justifyContent="space-between"
                      alignItems="center"
                      p="3"
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <Text fontSize="md">
                        {user.email}
                      </Text>
                      <Switch
                        isChecked={formData.assigneeIds.includes(user.id)}
                        onToggle={() => handleAssigneeToggle(user.id)}
                        colorScheme="blue"
                      />
                    </HStack>
                  ))}
                </VStack>
              )}

              {errors.assigneeIds && (
                <Alert status="error" borderRadius="md">
                  <Text fontSize="sm" color="red.600">
                    {errors.assigneeIds}
                  </Text>
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Geofencing */}
          <Box bg="white" p="4" borderRadius="lg" shadow="1">
            <VStack space="4">
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="lg" fontWeight="semibold">
                    Geofencing
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Enable location-based notifications
                  </Text>
                </VStack>
                <Switch
                  isChecked={formData.hasGeofence}
                  onToggle={(value) => setFormData(prev => ({
                    ...prev,
                    hasGeofence: value,
                    geofence: value ? prev.geofence : null
                  }))}
                  colorScheme="blue"
                />
              </HStack>

              {formData.hasGeofence && (
                <VStack space="4">
                  <LocationStatus compact />

                  <GeofenceManager
                    taskId="new_task"
                    onGeofenceAdded={handleGeofenceAdded}
                  />

                  {formData.geofence && (
                    <Box bg="green.50" p="3" borderRadius="md">
                      <HStack space="2" alignItems="center">
                        <MapPin size={16} color="#10B981" />
                        <VStack>
                          <Text fontSize="sm" fontWeight="medium" color="green.700">
                            Geofence Location Set
                          </Text>
                          <Text fontSize="xs" color="green.600">
                            Lat: {formData.geofence.lat.toFixed(6)},
                            Lng: {formData.geofence.lng.toFixed(6)},
                            Radius: {formData.geofence.radiusM}m
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  {errors.geofence && (
                    <Alert status="error" borderRadius="md">
                      <Text fontSize="sm" color="red.600">
                        {errors.geofence}
                      </Text>
                    </Alert>
                  )}
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            isLoading={createTaskMutation.isPending}
            leftIcon={<Save size={16} color="white" />}
            size="lg"
            colorScheme="blue"
          >
            Create Task
          </Button>

          {/* Error Display */}
          {createTaskMutation.error && (
            <Alert status="error" borderRadius="md">
              <Text fontSize="sm" color="red.600">
                Failed to create task. Please try again.
              </Text>
            </Alert>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
};
