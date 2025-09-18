// src/features/tasks/screens/TaskListScreen.tsx
import React, { useState } from 'react';
import { RefreshControl, FlatList, Platform } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Pressable,
  Spinner,
  Alert
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import {
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react-native';
import { useUserTasks, Task } from '../../../libs/api';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress, userLocation }) => {
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
      case 'COMPLETED': return <CheckCircle size={16} color="#10B981" />;
      case 'IN_PROGRESS': return <Clock size={16} color="#F59E0B" />;
      default: return <AlertCircle size={16} color="#3B82F6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
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

  const getDistanceText = () => {
    if (!task.geofence_center || !userLocation) return null;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      task.geofence_center.lat,
      task.geofence_center.lng
    );

    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  const isNearLocation = () => {
    if (!task.geofence_center || !userLocation || !task.geofence_radius_m) return false;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      task.geofence_center.lat,
      task.geofence_center.lng
    );

    return distance <= task.geofence_radius_m;
  };

  return (
    <Pressable onPress={onPress}>
      <Box
        bg="white"
        p="4"
        borderRadius="lg"
        shadow="1"
        mb="3"
        borderLeftWidth="4"
        borderLeftColor={`${getStatusColor(task.status)}.500`}
      >
        <VStack space="3">
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex="1" space="1">
              <Text fontSize="md" fontWeight="bold" numberOfLines={2}>
                {task.title}
              </Text>
              {task.description && (
                <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
            </VStack>

            <Badge
              colorScheme={getStatusColor(task.status)}
              variant="solid" rounded={'sm'}
              ml="2"
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="4" alignItems="center" flex="1">
              {getStatusIcon(task.status)}

              {task.due_at && (
                <HStack space="1" alignItems="center">
                  <Calendar size={14} color="#6B7280" />
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(task.due_at)}
                  </Text>
                </HStack>
              )}

              {/* {task.geofence_center && (
                <HStack space="1" alignItems="center">
                  <MapPin size={14} color={isNearLocation() ? "#10B981" : "#6B7280"} />
                  <Text
                    fontSize="xs"
                    color={isNearLocation() ? "green.600" : "gray.500"}
                  >
                    {getDistanceText() || 'Location set'}
                  </Text>
                </HStack>
              )} */}
            </HStack>

            {isNearLocation() && task.status !== 'COMPLETED' && (
              <Badge colorScheme="green" variant="outline" size="sm">
                At Location
              </Badge>
            )}
          </HStack>

          {task.acknowledged_at && (
            <HStack space="1" alignItems="center">
              <CheckCircle size={12} color="#10B981" />
              <Text fontSize="xs" color="green.600">
                Acknowledged {formatDate(task.acknowledged_at)}
              </Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
};

export const TaskListScreen: React.FC = () => {
  const navigation = useNavigation();
  // const { location } = useCurrentLocation();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useUserTasks();

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return task.status === 'NEW' || task.status === 'IN_PROGRESS';
      case 'completed':
        return task.status === 'COMPLETED';
      default:
        return true;
    }
  });

  const getFilterCount = (filterType: 'all' | 'active' | 'completed') => {
    switch (filterType) {
      case 'active':
        return tasks.filter(t => t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
      case 'completed':
        return tasks.filter(t => t.status === 'COMPLETED').length;
      default:
        return tasks.length;
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => navigation.navigate('TaskDetail' as any, { taskId: item.id })}
    // userLocation={location}
    />
  );

  if (error) {
    return (
      <Box flex="1" bg="gray.50" p="4" safeArea>
        <Alert status="error" borderRadius="md">
          <VStack space="2">
            <Text color="red.600" fontWeight="bold">
              Failed to load tasks
            </Text>
            <Text color="red.600" fontSize="sm">
              Please check your connection and try again.
            </Text>
            <Button size="sm" onPress={() => refetch()}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box flex="1" bg="gray.50" safeArea>
      <VStack flex="1" space="4" p="4">
        {/* Header */}
        <VStack space="3">
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="2xl" fontWeight="bold">
              My Tasks
            </Text>
          </HStack>

          {/* <LocationStatus /> */}
        </VStack>

        {/* Filter Tabs */}
        {/* <HStack space="2" justifyContent="space-around">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <Button
              key={filterType}
              flex="1"
              variant={filter === filterType ? 'solid' : 'outline'}
              colorScheme="blue"
              size="sm"
              onPress={() => setFilter(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({getFilterCount(filterType)})
            </Button>
          ))}
        </HStack> */}

        {/* Tasks List */}
        {isLoading ? (
          <Box flex="1" alignItems="center" justifyContent="center">
            <Spinner size="lg" />
            <Text mt="2" color="gray.500">Loading tasks...</Text>
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box
            flex="1"
            alignItems="center"
            justifyContent="center"
            bg="white"
            borderRadius="lg"
            p="6"
          >
            <AlertCircle size={48} color="#9CA3AF" />
            <Text mt="4" fontSize="lg" color="gray.500" textAlign="center">
              {filter === 'active' ? 'No active tasks' :
                filter === 'completed' ? 'No completed tasks' : 'No tasks assigned'}
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center" mt="1">
              {filter === 'active' ? 'New tasks will appear here when assigned' :
                filter === 'completed' ? 'Completed tasks will appear here' :
                  'Tasks assigned to you will appear here'}
            </Text>
          </Box>
        ) : (
          <Box flex="1">
            <FlatList
              data={filteredTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor="#3B82F6"
                />
              }
              style={{ flex: 1 }}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TaskListScreen;
