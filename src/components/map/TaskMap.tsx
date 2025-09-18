// src/components/map/TaskMap.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Box, VStack, Text, Badge, Button } from 'native-base';
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

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const { width } = Dimensions.get('window');

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
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Update map region when user location changes
  useEffect(() => {
    if (location && followUserLocation) {
      setMapRegion(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location, followUserLocation]);

  // Set initial region based on tasks or user location
  useEffect(() => {
    if (tasks.length > 0) {
      // Calculate bounds for all tasks
      const coordinates = tasks
        .filter(task => task.geofence_center)
        .map(task => ({
          latitude: task.geofence_center!.lat,
          longitude: task.geofence_center!.lng,
        }));

      if (location) {
        coordinates.push({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      if (coordinates.length > 0) {
        const minLat = Math.min(...coordinates.map(c => c.latitude));
        const maxLat = Math.max(...coordinates.map(c => c.latitude));
        const minLng = Math.min(...coordinates.map(c => c.longitude));
        const maxLng = Math.max(...coordinates.map(c => c.longitude));

        const latDelta = (maxLat - minLat) * 1.5 || 0.01;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

        setMapRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        });
      }
    } else if (location && !followUserLocation) {
      setMapRegion(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [tasks, location, followUserLocation]);

  const getTaskMarkerColor = (task: Task): string => {
    switch (task.status) {
      case 'NEW': return '#3B82F6'; // blue
      case 'IN_PROGRESS': return '#F59E0B'; // yellow
      case 'COMPLETED': return '#10B981'; // green
      case 'CANCELLED': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getGeofenceColor = (region: GeofenceRegion): string => {
    // Different colors for different geofences
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
    const hash = region.identifier.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const centerOnUserLocation = async () => {
    await getCurrentLocation();
    if (location) {
      setMapRegion(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }));
    }
  };

  return (
    <Box style={{ height }} borderRadius="lg" overflow="hidden">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onPress={(event) => {
          if (onMapPress) {
            onMapPress(event.nativeEvent.coordinate);
          }
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* Task Markers */}
        {tasks.map((task) => {
          if (!task.geofence_center) return null;

          return (
            <Marker
              key={task.id}
              coordinate={{
                latitude: task.geofence_center.lat,
                longitude: task.geofence_center.lng,
              }}
              pinColor={getTaskMarkerColor(task)}
              onPress={() => onTaskPress?.(task)}
            >
              <Callout>
                <VStack space="2" width="200">
                  <Text fontSize="md" fontWeight="bold">
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text fontSize="sm" color="gray.600">
                      {task.description}
                    </Text>
                  )}
                  <Badge
                    colorScheme={
                      task.status === 'COMPLETED' ? 'green' :
                      task.status === 'IN_PROGRESS' ? 'yellow' :
                      task.status === 'CANCELLED' ? 'red' : 'blue'
                    }
                    variant="solid"
                    alignSelf="flex-start"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </VStack>
              </Callout>
            </Marker>
          );
        })}

        {/* Task Geofences */}
        {tasks.map((task) => {
          if (!task.geofence_center || !task.geofence_radius_m) return null;

          return (
            <Circle
              key={`task-geofence-${task.id}`}
              center={{
                latitude: task.geofence_center.lat,
                longitude: task.geofence_center.lng,
              }}
              radius={task.geofence_radius_m}
              strokeColor={getTaskMarkerColor(task)}
              strokeWidth={2}
              fillColor={`${getTaskMarkerColor(task)}20`}
            />
          );
        })}

        {/* Standalone Geofences */}
        {geofences.map((region) => (
          <React.Fragment key={region.identifier}>
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              pinColor={getGeofenceColor(region)}
            >
              <Callout>
                <VStack space="2" width="200">
                  <Text fontSize="md" fontWeight="bold">
                    {region.identifier}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Radius: {region.radius}m
                  </Text>
                  <VStack space="1">
                    {region.notifyOnEnter && (
                      <Badge colorScheme="blue" variant="outline" size="sm">
                        Enter Alert
                      </Badge>
                    )}
                    {region.notifyOnExit && (
                      <Badge colorScheme="orange" variant="outline" size="sm">
                        Exit Alert
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              </Callout>
            </Marker>
            
            <Circle
              center={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              radius={region.radius}
              strokeColor={getGeofenceColor(region)}
              strokeWidth={2}
              fillColor={`${getGeofenceColor(region)}20`}
            />
          </React.Fragment>
        ))}

        {/* Selected Task Highlight */}
        {selectedTask?.geofence_center && (
          <Circle
            center={{
              latitude: selectedTask.geofence_center.lat,
              longitude: selectedTask.geofence_center.lng,
            }}
            radius={(selectedTask.geofence_radius_m || 100) + 50}
            strokeColor="#FF6B6B"
            strokeWidth={3}
            fillColor="transparent"
          />
        )}
      </MapView>

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
        </VStack>
      </Box>

      {/* Map Legend */}
      <Box position="absolute" bottom="4" left="4" bg="white" p="3" borderRadius="lg" shadow="2">
        <VStack space="2">
          <Text fontSize="sm" fontWeight="bold">
            Legend
          </Text>
          <VStack space="1">
            <Text fontSize="xs" color="blue.600">
              🔵 New Tasks
            </Text>
            <Text fontSize="xs" color="yellow.600">
              🟡 In Progress
            </Text>
            <Text fontSize="xs" color="green.600">
              🟢 Completed
            </Text>
            <Text fontSize="xs" color="red.600">
              🔴 Cancelled
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};
