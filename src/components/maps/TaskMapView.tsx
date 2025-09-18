// src/components/maps/TaskMapView.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Modal,
  Spinner,
  Alert
} from 'native-base';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform, Dimensions, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  MapPin,
  Navigation,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react-native';
import { Task } from '../../libs/api/tasks';

interface TaskMapViewProps {
  tasks: Task[];
  userLocation?: { lat: number; lng: number } | null;
  onTaskPress?: (task: Task) => void;
  showUserLocation?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const { width, height } = Dimensions.get('window');

export const TaskMapView: React.FC<TaskMapViewProps> = ({
  tasks,
  userLocation,
  onTaskPress,
  showUserLocation = true,
  initialRegion
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    userLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Default region (San Francisco)
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getTaskMarkerColor = (task: Task) => {
    switch (task.status) {
      case 'NEW':
        return '#3B82F6'; // Blue
      case 'IN_PROGRESS':
        return '#F59E0B'; // Orange
      case 'COMPLETED':
        return '#10B981'; // Green
      case 'CANCELLED':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getTaskIcon = (task: Task) => {
    switch (task.status) {
      case 'NEW':
        return Clock;
      case 'IN_PROGRESS':
        return Clock;
      case 'COMPLETED':
        return CheckCircle2;
      case 'CANCELLED':
        return AlertTriangle;
      default:
        return MapPin;
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to show your position on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Location permission denied');
      setIsGettingLocation(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(error.message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  useEffect(() => {
    if (!currentLocation && showUserLocation) {
      getCurrentLocation();
    }
  }, [showUserLocation]);

  const calculateRegion = () => {
    if (initialRegion) {
      return initialRegion;
    }

    // If we have tasks with locations, calculate bounds
    const tasksWithLocation = tasks.filter(task => task.geofence_center);
    
    if (tasksWithLocation.length === 0) {
      // If no tasks with location, center on user location or default
      if (currentLocation) {
        return {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
      return defaultRegion;
    }

    // Calculate bounds for all task locations
    const lats = tasksWithLocation.map(task => task.geofence_center!.lat);
    const lngs = tasksWithLocation.map(task => task.geofence_center!.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2; // Add 20% padding
    const deltaLng = (maxLng - minLng) * 1.2;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const isWithinGeofence = (task: Task) => {
    if (!task.geofence_center || !currentLocation || !task.geofence_radius_m) {
      return false;
    }

    const distance = getDistance(
      currentLocation.lat,
      currentLocation.lng,
      task.geofence_center.lat,
      task.geofence_center.lng
    );

    return distance <= task.geofence_radius_m;
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  return (
    <Box flex={1}>
      {/* Location Error Alert */}
      {locationError && (
        <Alert status="warning" position="absolute" top={2} left={2} right={2} zIndex={1000}>
          <Alert.Icon />
          <Text fontSize="sm">Location: {locationError}</Text>
        </Alert>
      )}

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={calculateRegion()}
        showsUserLocation={showUserLocation && !!currentLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        toolbarEnabled={false}
      >
        {/* Task Markers */}
        {tasks
          .filter(task => task.geofence_center)
          .map(task => (
            <React.Fragment key={task.id}>
              {/* Task Marker */}
              <Marker
                coordinate={{
                  latitude: task.geofence_center!.lat,
                  longitude: task.geofence_center!.lng,
                }}
                title={task.title}
                description={task.description || 'No description'}
                pinColor={getTaskMarkerColor(task)}
                onPress={() => {
                  setSelectedTask(task);
                  onTaskPress?.(task);
                }}
              />
              
              {/* Geofence Circle */}
              {task.geofence_radius_m && (
                <Circle
                  center={{
                    latitude: task.geofence_center!.lat,
                    longitude: task.geofence_center!.lng,
                  }}
                  radius={task.geofence_radius_m}
                  strokeColor={getTaskMarkerColor(task)}
                  strokeWidth={2}
                  fillColor={`${getTaskMarkerColor(task)}20`} // 20% opacity
                />
              )}
            </React.Fragment>
          ))}

        {/* User Location Marker */}
        {currentLocation && showUserLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            title="Your Location"
            pinColor="#007AFF"
          />
        )}
      </MapView>

      {/* Controls */}
      <VStack position="absolute" top={4} right={4} space={2}>
        <Button
          size="sm"
          variant="solid"
          bg="white"
          _pressed={{ bg: 'gray.100' }}
          onPress={getCurrentLocation}
          isLoading={isGettingLocation}
        >
          <Icon as={Navigation} size="sm" color="blue.500" />
        </Button>
      </VStack>

      {/* Task Details Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Task Details</Modal.Header>
          <Modal.Body>
            {selectedTask && (
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedTask.title}
                  </Text>
                  {selectedTask.description && (
                    <Text fontSize="sm" color="gray.600">
                      {selectedTask.description}
                    </Text>
                  )}
                </VStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">Status:</Text>
                  <Badge colorScheme={
                    selectedTask.status === 'NEW' ? 'blue' :
                    selectedTask.status === 'IN_PROGRESS' ? 'orange' :
                    selectedTask.status === 'COMPLETED' ? 'green' : 'red'
                  }>
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </HStack>

                {selectedTask.geofence_center && (
                  <VStack space={2}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                      Location Details:
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="gray.500">Geofence Radius:</Text>
                      <Text fontSize="sm">{selectedTask.geofence_radius_m}m</Text>
                    </HStack>
                    
                    {currentLocation && (
                      <>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.500">Distance:</Text>
                          <Text fontSize="sm">
                            {formatDistance(getDistance(
                              currentLocation.lat,
                              currentLocation.lng,
                              selectedTask.geofence_center.lat,
                              selectedTask.geofence_center.lng
                            ))}
                          </Text>
                        </HStack>
                        
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="gray.500">Within Geofence:</Text>
                          <Badge colorScheme={isWithinGeofence(selectedTask) ? 'green' : 'red'}>
                            {isWithinGeofence(selectedTask) ? 'Yes' : 'No'}
                          </Badge>
                        </HStack>
                      </>
                    )}
                  </VStack>
                )}

                {selectedTask.due_at && (
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.500">Due Date:</Text>
                    <Text fontSize="sm">
                      {new Date(selectedTask.due_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                )}
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setSelectedTask(null)}
              >
                Close
              </Button>
              {selectedTask && onTaskPress && (
                <Button onPress={() => onTaskPress(selectedTask)}>
                  View Task
                </Button>
              )}
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default TaskMapView;
