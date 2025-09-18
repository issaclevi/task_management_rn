// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  ScrollView,
  Alert,
  Spinner,
  Divider
} from 'native-base';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  User,
  AlertCircle
} from 'lucide-react-native';
import { useTask, useAcknowledgeTask, Task } from '../../../libs/api';
import { LocationStatus } from '../../../components/location/LocationStatus';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../app/navigation/types';
import { useCurrentLocation } from '../../../libs/location/useLocation';

export const TaskDetailScreen: React.FC = () => {

  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const { id } = route.params;
  const { location } = useCurrentLocation();
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const { data: task, isLoading, error, refetch } = useTask(id!);
  const acknowledgeMutation = useAcknowledgeTask();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={20} color="#10B981" />;
      case 'IN_PROGRESS': return <Clock size={20} color="#F59E0B" />;
      default: return <AlertCircle size={20} color="#3B82F6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getDistanceToTask = (): { distance: number; text: string } | null => {
    if (!task?.geofence_center || !location) return null;
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      task.geofence_center.lat,
      task.geofence_center.lng
    );

    const text = distance < 1000 
      ? `${Math.round(distance)}m away`
      : `${(distance / 1000).toFixed(1)}km away`;

    return { distance, text };
  };

  const isAtTaskLocation = (): boolean => {
    if (!task?.geofence_center || !location || !task.geofence_radius_m) return false;
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      task.geofence_center.lat,
      task.geofence_center.lng
    );

    return distance <= task.geofence_radius_m;
  };

  const handleAcknowledgeTask = async () => {
    if (!task) return;

    setIsAcknowledging(true);
    try {
      await acknowledgeMutation.mutateAsync({
        taskId: task.id,
        data: {
          lat: location?.latitude,
          lng: location?.longitude
        }
      });
      
      // Refetch task to get updated data
      refetch();
    } catch (error) {
      console.error('Error acknowledging task:', error);
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (isLoading) {
    return (
      <Box flex="1" bg="gray.50" alignItems="center" justifyContent="center" safeArea>
        <Spinner size="lg" />
        <Text mt="2" color="gray.500">Loading task...</Text>
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box flex="1" bg="gray.50" p="4" safeArea>
        <HStack space="3" alignItems="center" mb="4">
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            leftIcon={<ArrowLeft size={16} />}
            p="2"
          >
            Back
          </Button>
        </HStack>
        
        <Alert status="error" borderRadius="md">
          <VStack space="2">
            <Text color="red.600" fontWeight="bold">
              Failed to load task
            </Text>
            <Text color="red.600" fontSize="sm">
              The task could not be found or there was an error loading it.
            </Text>
            <Button size="sm" onPress={() => refetch()}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  const distanceInfo = getDistanceToTask();
  const atLocation = isAtTaskLocation();

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
              Task Details
            </Text>
          </HStack>

          {/* Task Info */}
          <Box bg="white" p="4" borderRadius="lg" shadow="1">
            <VStack space="4">
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex="1" space="2">
                  <Text fontSize="xl" fontWeight="bold">
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text fontSize="md" color="gray.600">
                      {task.description}
                    </Text>
                  )}
                </VStack>
                
                <Badge
                  colorScheme={getStatusColor(task.status)}
                  variant="solid"
                  ml="3"
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </HStack>

              <Divider />

              <VStack space="3">
                <HStack space="3" alignItems="center">
                  {getStatusIcon(task.status)}
                  <Text fontSize="md" fontWeight="medium">
                    Status: {task.status.replace('_', ' ')}
                  </Text>
                </HStack>

                {task.due_at && (
                  <HStack space="3" alignItems="center">
                    <Calendar size={20} color="#6B7280" />
                    <VStack>
                      <Text fontSize="md" fontWeight="medium">
                        Due Date
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(task.due_at)}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                <HStack space="3" alignItems="center">
                  <User size={20} color="#6B7280" />
                  <VStack>
                    <Text fontSize="md" fontWeight="medium">
                      Created By
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {task.created_by}
                    </Text>
                  </VStack>
                </HStack>

                <HStack space="3" alignItems="center">
                  <Clock size={20} color="#6B7280" />
                  <VStack>
                    <Text fontSize="md" fontWeight="medium">
                      Created
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(task.created_at)}
                    </Text>
                  </VStack>
                </HStack>

                {task.acknowledged_at && (
                  <HStack space="3" alignItems="center">
                    <CheckCircle size={20} color="#10B981" />
                    <VStack>
                      <Text fontSize="md" fontWeight="medium" color="green.600">
                        Acknowledged
                      </Text>
                      <Text fontSize="sm" color="green.600">
                        {formatDate(task.acknowledged_at)}
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Location Info */}
          {task.geofence_center && (
            <Box bg="white" p="4" borderRadius="lg" shadow="1">
              <VStack space="4">
                <HStack space="3" alignItems="center">
                  <MapPin size={20} color={atLocation ? "#10B981" : "#6B7280"} />
                  <Text fontSize="lg" fontWeight="semibold">
                    Task Location
                  </Text>
                  {atLocation && (
                    <Badge colorScheme="green" variant="solid">
                      At Location
                    </Badge>
                  )}
                </HStack>

                <VStack space="2">
                  <Text fontSize="sm" color="gray.600">
                    Latitude: {task.geofence_center.lat.toFixed(6)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Longitude: {task.geofence_center.lng.toFixed(6)}
                  </Text>
                  {task.geofence_radius_m && (
                    <Text fontSize="sm" color="gray.600">
                      Radius: {task.geofence_radius_m}m
                    </Text>
                  )}
                  {distanceInfo && (
                    <Text fontSize="sm" color={atLocation ? "green.600" : "gray.600"}>
                      Distance: {distanceInfo.text}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>
          )}

          {/* Current Location */}
          <LocationStatus />

          {/* Actions */}
          {task.status !== 'COMPLETED' && !task.acknowledged_at && (
            <VStack space="3">
              <Button
                onPress={handleAcknowledgeTask}
                isLoading={isAcknowledging || acknowledgeMutation.isPending}
                leftIcon={<CheckCircle size={16} color="white" />}
                size="lg"
                colorScheme="green"
                isDisabled={!atLocation}
              >
                {atLocation ? 'Acknowledge Task' : 'Move to Location to Acknowledge'}
              </Button>

              {!atLocation && task.geofence_center && (
                <Alert status="info" borderRadius="md">
                  <Text fontSize="sm" color="blue.700">
                    You need to be within {task.geofence_radius_m || 100}m of the task location to acknowledge it.
                    {distanceInfo && ` You are currently ${distanceInfo.text}.`}
                  </Text>
                </Alert>
              )}
            </VStack>
          )}

          {/* Error Display */}
          {acknowledgeMutation.error && (
            <Alert status="error" borderRadius="md">
              <Text fontSize="sm" color="red.600">
                Failed to acknowledge task. Please try again.
              </Text>
            </Alert>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
};
