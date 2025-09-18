// src/features/maps/screens/MapScreen.tsx
import React, { useState } from 'react';
import { Alert as RNAlert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Select,
  Spinner,
  Alert,
  Switch,
  Fab
} from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Map,
  Filter,
  Navigation,
  List,
  RefreshCw,
  LocateIcon
} from 'lucide-react-native';
import { useUserTasks, Task } from '../../../libs/api/tasks';
import { useAuth } from '../../../app/providers/AuthProvider';
import TaskMapView from '../../../components/maps/TaskMapView';
import { QueryError } from '../../../components/common/ErrorBoundary';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { locationService } from '../../../libs/location/locationService';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useUserTasks(userLocation?.lat, userLocation?.lng);

  // Filter tasks based on status and completion
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesCompletion = showCompleted || task.status !== 'COMPLETED';
    const hasLocation = task.geofence_center;

    return matchesStatus && matchesCompletion && hasLocation;
  });

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

    try {
      // Request location permissions first
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        RNAlert.alert(
          'Location Permission Required',
          'Please enable location permissions to view your current location on the map.',
          [{ text: 'OK' }]
        );
        setIsGettingLocation(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          let message = 'Unable to get your current location.';
          switch (error.code) {
            case 1:
              message = 'Location access denied. Please enable location permissions in settings.';
              break;
            case 2:
              message = 'Location unavailable. Please check your GPS settings.';
              break;
            case 3:
              message = 'Location request timed out. Please try again.';
              break;
          }
          RNAlert.alert('Location Error', message);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      console.error('Error getting location:', error);
      setIsGettingLocation(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    // Navigate to task detail or handle task action
    navigation.navigate('TaskDetail' as any, { taskId: task.id });
  };

  const getTaskCounts = () => {
    const total = filteredTasks.length;
    const newTasks = filteredTasks.filter(t => t.status === 'NEW').length;
    const inProgress = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = filteredTasks.filter(t => t.status === 'COMPLETED').length;

    return { total, newTasks, inProgress, completed };
  };

  const taskCounts = getTaskCounts();

  if (isLoading) {
    return (
      <Box flex={1} bg="gray.50" style={{ paddingTop: insets.top }}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} color="gray.600">Loading map...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} bg="gray.50" style={{ paddingTop: insets.top }}>
        <Box p={4}>
          <QueryError
            error={error}
            refetch={refetch}
            isRefetching={isRefetching}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <VStack space={3} p={4} bg="white">
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Task Map
          </Text>
          <HStack space={2} alignItems="center">
            {/* <Box>
              <Badge colorScheme="blue   " rounded={'md'} variant="subtle">
                {taskCounts.total} tasks
              </Badge>
            </Box> */}
            {userLocation && (
              <Badge colorScheme="green" variant="subtle">
                <HStack space={1} alignItems="center">
                  <Icon as={LocateIcon} size="xs" />
                  <Text fontSize="xs">Located</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </HStack>

        {/* Task Summary */}
        <HStack space={4} justifyContent="space-around">
          <VStack alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {taskCounts.newTasks}
            </Text>
            <Text fontSize="xs" color="blue.600">New</Text>
          </VStack>

          <VStack alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="orange.600">
              {taskCounts.inProgress}
            </Text>
            <Text fontSize="xs" color="orange.600">In Progress</Text>
          </VStack>

          <VStack alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              {taskCounts.completed}
            </Text>
            <Text fontSize="xs" color="green.600">Completed</Text>
          </VStack>
        </HStack>

        {/* Filters */}
        <HStack space={3} alignItems="center">
          <Select
            flex={1}
            placeholder="Filter by status"
            selectedValue={statusFilter}
            onValueChange={setStatusFilter}
            bg="gray.100"
            borderWidth={0}
            borderRadius="lg"
            size="sm"
          >
            <Select.Item label="All Status" value="" />
            <Select.Item label="New" value="NEW" />
            <Select.Item label="In Progress" value="IN_PROGRESS" />
            <Select.Item label="Completed" value="COMPLETED" />
            <Select.Item label="Cancelled" value="CANCELLED" />
          </Select>

          <HStack space={2} alignItems="center">
            <Text fontSize="sm" color="gray.600">Show Completed</Text>
            <Switch
              size="sm"
              isChecked={showCompleted}
              onToggle={setShowCompleted}
            />
          </HStack>
        </HStack>
      </VStack>

      {/* No Tasks Message */}
      {filteredTasks.length === 0 ? (
        <Box flex={1} justifyContent="center" alignItems="center" p={8}>
          <Icon as={Map} size="xl" color="gray.400" mb={4} />
          <Text fontSize="lg" color="gray.500" textAlign="center" mb={2}>
            No tasks with locations found
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            Tasks with geofence locations will appear on the map
          </Text>
          <Button
            mt={4}
            variant="outline"
            size="sm"
            onPress={() => refetch()}
            isLoading={isRefetching}
            leftIcon={<Icon as={RefreshCw} size="sm" />}
          >
            Refresh
          </Button>
        </Box>
      ) : (
        /* Map View */
        <Box flex={1}>
          <TaskMapView
            tasks={filteredTasks}
            userLocation={userLocation}
            onTaskPress={handleTaskPress}
            showUserLocation={true}
          />
        </Box>
      )}

      {/* Floating Action Buttons */}
      <VStack position="absolute" bottom={4} right={4} space={2}>
        {/* Get Location Button */}
        <Button
          size="sm"
          borderRadius="full"
          bg="purple.500"
          shadow="2"
          _pressed={{ bg: 'gray.100' }}
          onPress={getCurrentLocation}
          isLoading={isGettingLocation}
        >
          <Icon as={LocateIcon} size="sm" color="white" />
        </Button>

        {/* Switch to List View */}
        {/* <Button
          size="sm"
          borderRadius="full"
          bg="white"
          shadow="2"
          _pressed={{ bg: 'gray.100' }}
          onPress={() => navigation.navigate('TaskList' as any)}
        >
          <Icon as={List} size="sm" color="gray.600" />
        </Button> */}
      </VStack>

      {/* Legend */}
      <Box position="absolute" bottom={8} left={4} bg="white" p={3} borderRadius="lg" shadow="2">
        <VStack space={2}>
          <Text fontSize="xs" fontWeight="bold" color="gray.700">Legend</Text>

          <HStack space={2} alignItems="center">
            <Box w={3} h={3} borderRadius="full" bg="blue.500" />
            <Text fontSize="xs" color="gray.600">New Tasks</Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Box w={3} h={3} borderRadius="full" bg="orange.500" />
            <Text fontSize="xs" color="gray.600">In Progress</Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Box w={3} h={3} borderRadius="full" bg="green.500" />
            <Text fontSize="xs" color="gray.600">Completed</Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Box w={3} h={3} borderRadius="full" bg="red.500" />
            <Text fontSize="xs" color="gray.600">Cancelled</Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
