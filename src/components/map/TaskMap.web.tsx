// src/components/map/TaskMap.web.tsx
import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Button } from 'native-base';
import { MapPin, Navigation, Target } from 'lucide-react-native';
import { Task } from '../../libs/api';
import { useCurrentLocation } from '../../libs/location/useLocation';
import { GeofenceRegion } from '../../libs/location/locationService';

interface TaskMapProps {
  tasks?: Task[];
  geofences?: GeofenceRegion[];
  selectedTask?: Task | null;
  onTaskPress?: (task: Task) => void;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  height?: number;
}

// Web fallback component when Google Maps is not available
export const TaskMap: React.FC<TaskMapProps> = ({
  tasks = [],
  geofences = [],
  selectedTask,
  onTaskPress,
  onMapPress,
  showUserLocation = true,
  followUserLocation = false,
  height = 400
}) => {
  const { location, getCurrentLocation } = useCurrentLocation();
  const [mapCenter, setMapCenter] = useState({ lat: 37.78825, lng: -122.4324 });

  // Update map center when user location changes
  useEffect(() => {
    if (location && followUserLocation) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }, [location, followUserLocation]);

  // Set initial center based on tasks or user location
  useEffect(() => {
    if (tasks.length > 0) {
      const coordinates = tasks
        .filter(task => task.geofence_center)
        .map(task => ({
          lat: task.geofence_center!.lat,
          lng: task.geofence_center!.lng,
        }));

      if (location) {
        coordinates.push({
          lat: location.latitude,
          lng: location.longitude,
        });
      }

      if (coordinates.length > 0) {
        const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
        const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
        
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    } else if (location && !followUserLocation) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }, [tasks, location, followUserLocation]);

  const getTaskMarkerColor = (task: Task): string => {
    switch (task.status) {
      case 'NEW': return '#3B82F6';
      case 'IN_PROGRESS': return '#F59E0B';
      case 'COMPLETED': return '#10B981';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const centerOnUserLocation = async () => {
    await getCurrentLocation();
    if (location) {
      setMapCenter({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <Box style={{ height }} borderRadius="lg" overflow="hidden" bg="gray.100" position="relative">
      {/* Web Map Placeholder */}
      <Box
        flex="1"
        bg="gray.200"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <VStack space="4" alignItems="center" p="6">
          <MapPin size={48} color="#6B7280" />
          <VStack space="2" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="gray.600">
              Interactive Map
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Map view is optimized for mobile devices.
              Click on task locations below to view in Google Maps.
            </Text>
          </VStack>
        </VStack>

        {/* Current Location Indicator */}
        {location && showUserLocation && (
          <Box
            position="absolute"
            top="4"
            left="4"
            bg="blue.500"
            p="2"
            borderRadius="md"
            shadow="2"
          >
            <HStack space="2" alignItems="center">
              <Navigation size={16} color="white" />
              <Text fontSize="xs" color="white" fontWeight="medium">
                Your Location
              </Text>
            </HStack>
          </Box>
        )}

        {/* Map Controls */}
        <Box position="absolute" top="4" right="4">
          <VStack space="2">
            <Button
              size="sm"
              borderRadius="full"
              bg="white"
              shadow="2"
              onPress={centerOnUserLocation}
              leftIcon={<Navigation size={16} color="#3B82F6" />}
            >
              My Location
            </Button>
            {location && (
              <Button
                size="sm"
                borderRadius="full"
                bg="white"
                shadow="2"
                onPress={() => openInGoogleMaps(location.latitude, location.longitude)}
                leftIcon={<Target size={16} color="#10B981" />}
              >
                Open Maps
              </Button>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Task List for Web */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTopRadius="lg"
        shadow="3"
        maxHeight="200"
      >
        <VStack space="2" p="4">
          <Text fontSize="md" fontWeight="bold">
            Tasks ({tasks.length})
          </Text>
          
          <Box maxHeight="150" overflow="scroll">
            <VStack space="2">
              {tasks.map((task) => (
                <HStack
                  key={task.id}
                  space="3"
                  alignItems="center"
                  p="3"
                  bg={selectedTask?.id === task.id ? 'blue.50' : 'gray.50'}
                  borderRadius="md"
                  borderWidth={selectedTask?.id === task.id ? 1 : 0}
                  borderColor="blue.200"
                >
                  <Box
                    w="3"
                    h="3"
                    bg={getTaskMarkerColor(task)}
                    borderRadius="full"
                  />
                  
                  <VStack flex="1" space="1">
                    <Text fontSize="sm" fontWeight="medium">
                      {task.title}
                    </Text>
                    {task.geofence_center && (
                      <Text fontSize="xs" color="gray.500">
                        {task.geofence_center.lat.toFixed(4)}, {task.geofence_center.lng.toFixed(4)}
                      </Text>
                    )}
                  </VStack>
                  
                  <Badge
                    colorScheme={
                      task.status === 'COMPLETED' ? 'green' :
                      task.status === 'IN_PROGRESS' ? 'yellow' :
                      task.status === 'CANCELLED' ? 'red' : 'blue'
                    }
                    variant="solid"
                    size="sm"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                  
                  <HStack space="1">
                    <Button
                      size="xs"
                      variant="outline"
                      onPress={() => onTaskPress?.(task)}
                    >
                      View
                    </Button>
                    {task.geofence_center && (
                      <Button
                        size="xs"
                        colorScheme="blue"
                        onPress={() => openInGoogleMaps(
                          task.geofence_center!.lat,
                          task.geofence_center!.lng
                        )}
                      >
                        Maps
                      </Button>
                    )}
                  </HStack>
                </HStack>
              ))}
              
              {tasks.length === 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center" py="4">
                  No tasks to display
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Map Legend */}
      <Box position="absolute" bottom="220" left="4" bg="white" p="3" borderRadius="lg" shadow="2">
        <VStack space="2">
          <Text fontSize="sm" fontWeight="bold">
            Legend
          </Text>
          <VStack space="1">
            <HStack space="2" alignItems="center">
              <Box w="3" h="3" bg="blue.500" borderRadius="full" />
              <Text fontSize="xs">New Tasks</Text>
            </HStack>
            <HStack space="2" alignItems="center">
              <Box w="3" h="3" bg="yellow.500" borderRadius="full" />
              <Text fontSize="xs">In Progress</Text>
            </HStack>
            <HStack space="2" alignItems="center">
              <Box w="3" h="3" bg="green.500" borderRadius="full" />
              <Text fontSize="xs">Completed</Text>
            </HStack>
            <HStack space="2" alignItems="center">
              <Box w="3" h="3" bg="red.500" borderRadius="full" />
              <Text fontSize="xs">Cancelled</Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};
