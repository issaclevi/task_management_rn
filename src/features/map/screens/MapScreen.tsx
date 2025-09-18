// src/features/map/screens/MapScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Modal,
  Badge,
  ScrollView,
  Switch,
  Divider
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Map, Filter, Eye, EyeOff, Settings } from 'lucide-react-native';
import { TaskMap } from '../../../components/map/TaskMap';
import { useUserTasks, Task } from '../../../libs/api';
import { useCurrentLocation, useGeofencing } from '../../../libs/location/useLocation';
import { LocationStatus } from '../../../components/location/LocationStatus';

interface MapFilters {
  showNewTasks: boolean;
  showInProgressTasks: boolean;
  showCompletedTasks: boolean;
  showCancelledTasks: boolean;
  showGeofences: boolean;
  showUserLocation: boolean;
  followUserLocation: boolean;
}

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { location } = useCurrentLocation();
  const { regions: geofences } = useGeofencing();

  const {
    data: allTasks = [],
    isLoading,
    error,
    refetch
  } = useUserTasks(location?.latitude, location?.longitude);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const [filters, setFilters] = useState<MapFilters>({
    showNewTasks: true,
    showInProgressTasks: true,
    showCompletedTasks: true,
    showCancelledTasks: false,
    showGeofences: true,
    showUserLocation: true,
    followUserLocation: false,
  });

  // Filter tasks based on current filters
  const filteredTasks = allTasks.filter(task => {
    switch (task.status) {
      case 'NEW': return filters.showNewTasks;
      case 'IN_PROGRESS': return filters.showInProgressTasks;
      case 'COMPLETED': return filters.showCompletedTasks;
      case 'CANCELLED': return filters.showCancelledTasks;
      default: return true;
    }
  });

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    console.log('Map pressed at:', coordinate);
    // Could be used for adding new geofences or tasks
  };

  const updateFilter = (key: keyof MapFilters, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
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

  if (error) {
    return (
      <Box flex="1" bg="gray.50" p="4" safeArea>
        <Text color="red.600" textAlign="center">
          Failed to load map data. Please try again.
        </Text>
        <Button mt="4" onPress={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box flex="1" bg="gray.50" safeArea>
      <VStack flex="1" space="4">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" px="4" pt="4">
          <HStack space="2" alignItems="center">
            <Map size={24} color="#3B82F6" />
            <Text fontSize="xl" fontWeight="bold">
              Task Map
            </Text>
          </HStack>

          <HStack space="2">
            <Button
              size="sm"
              variant="outline"
              onPress={() => setIsFiltersModalOpen(true)}
              leftIcon={<Filter size={16} />}
            >
              Filters
            </Button>
          </HStack>
        </HStack>

        {/* Location Status */}
        <Box px="4">
          <LocationStatus compact />
        </Box>

        {/* Map */}
        <Box flex="1" mx="4">
          <TaskMap
            tasks={filteredTasks}
            geofences={filters.showGeofences ? geofences : []}
            selectedTask={selectedTask}
            onTaskPress={handleTaskPress}
            onMapPress={handleMapPress}
            showUserLocation={filters.showUserLocation}
            followUserLocation={filters.followUserLocation}
            height={undefined} // Will use flex: 1
          />
        </Box>

        {/* Quick Stats */}
        <Box px="4" pb="4">
          <HStack space="4" justifyContent="space-around">
            <VStack alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                {allTasks.filter(t => t.status === 'NEW').length}
              </Text>
              <Text fontSize="xs" color="gray.500">New</Text>
            </VStack>

            <VStack alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="yellow.500">
                {allTasks.filter(t => t.status === 'IN_PROGRESS').length}
              </Text>
              <Text fontSize="xs" color="gray.500">Active</Text>
            </VStack>

            <VStack alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                {allTasks.filter(t => t.status === 'COMPLETED').length}
              </Text>
              <Text fontSize="xs" color="gray.500">Done</Text>
            </VStack>

            <VStack alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="purple.500">
                {geofences.length}
              </Text>
              <Text fontSize="xs" color="gray.500">Geofences</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>

      {/* Task Detail Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body>
            {selectedTask && (
              <VStack space="3">
                <VStack space="2">
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedTask.title}
                  </Text>
                  {selectedTask.description && (
                    <Text fontSize="md" color="gray.600">
                      {selectedTask.description}
                    </Text>
                  )}
                </VStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">Status:</Text>
                  <Badge
                    colorScheme={getStatusColor(selectedTask.status)}
                    variant="solid"
                  >
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </HStack>

                {selectedTask.due_at && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color="gray.500">Due:</Text>
                    <Text fontSize="sm">
                      {formatDate(selectedTask.due_at)}
                    </Text>
                  </HStack>
                )}

                {selectedTask.geofence_center && (
                  <VStack space="1">
                    <Text fontSize="sm" color="gray.500">Location:</Text>
                    <Text fontSize="xs" color="gray.600">
                      {selectedTask.geofence_center.lat.toFixed(6)}, {selectedTask.geofence_center.lng.toFixed(6)}
                    </Text>
                    {selectedTask.geofence_radius_m && (
                      <Text fontSize="xs" color="gray.600">
                        Radius: {selectedTask.geofence_radius_m}m
                      </Text>
                    )}
                  </VStack>
                )}
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space="2">
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setIsTaskModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onPress={() => {
                  setIsTaskModalOpen(false);
                  if (selectedTask) {
                    navigation.navigate(`/tasks/${selectedTask.id}` as any);
                  }
                }}
              >
                View Details
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Filters Modal */}
      <Modal isOpen={isFiltersModalOpen} onClose={() => setIsFiltersModalOpen(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Map Filters</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <VStack space="4">
                <VStack space="3">
                  <Text fontSize="md" fontWeight="semibold">Task Status</Text>

                  {[
                    { key: 'showNewTasks' as const, label: 'New Tasks', color: 'blue' },
                    { key: 'showInProgressTasks' as const, label: 'In Progress', color: 'yellow' },
                    { key: 'showCompletedTasks' as const, label: 'Completed', color: 'green' },
                    { key: 'showCancelledTasks' as const, label: 'Cancelled', color: 'red' },
                  ].map(({ key, label, color }) => (
                    <HStack key={key} justifyContent="space-between" alignItems="center">
                      <HStack space="2" alignItems="center">
                        <Box w="3" h="3" bg={`${color}.500`} borderRadius="full" />
                        <Text fontSize="sm">{label}</Text>
                      </HStack>
                      <Switch
                        isChecked={filters[key]}
                        onToggle={(value) => updateFilter(key, value)}
                        colorScheme={color}
                      />
                    </HStack>
                  ))}
                </VStack>

                <Divider />

                <VStack space="3">
                  <Text fontSize="md" fontWeight="semibold">Display Options</Text>

                  {[
                    { key: 'showGeofences' as const, label: 'Show Geofences' },
                    { key: 'showUserLocation' as const, label: 'Show My Location' },
                    { key: 'followUserLocation' as const, label: 'Follow My Location' },
                  ].map(({ key, label }) => (
                    <HStack key={key} justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">{label}</Text>
                      <Switch
                        isChecked={filters[key]}
                        onToggle={(value) => updateFilter(key, value)}
                        colorScheme="blue"
                      />
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onPress={() => setIsFiltersModalOpen(false)}
              colorScheme="blue"
            >
              Done
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};
