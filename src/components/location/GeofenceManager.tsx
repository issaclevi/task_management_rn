// src/components/location/GeofenceManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  Modal,
  IconButton,
  FlatList,
  Badge,
  Spinner
} from 'native-base';
import { MapPin, Plus, Trash2, AlertCircle } from 'lucide-react-native';
import { useGeofencing, useCurrentLocation, useDistanceCalculation } from '../../libs/location/useLocation';
import { GeofenceRegion } from '../../libs/location/locationService';

interface GeofenceManagerProps {
  taskId?: string;
  onGeofenceAdded?: (region: GeofenceRegion) => void;
  onGeofenceRemoved?: (identifier: string) => void;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  taskId,
  onGeofenceAdded,
  onGeofenceRemoved
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRegion, setNewRegion] = useState({
    identifier: '',
    latitude: '',
    longitude: '',
    radius: '100',
    notifyOnEnter: true,
    notifyOnExit: true
  });

  const { location, getCurrentLocation } = useCurrentLocation();
  const {
    regions,
    events,
    isLoadingRegions,
    addRegion,
    removeRegion,
    isAddingRegion,
    isRemovingRegion
  } = useGeofencing();
  const { calculateDistance, formatDistance } = useDistanceCalculation();

  // Auto-fill current location when modal opens
  useEffect(() => {
    if (isModalOpen && location) {
      setNewRegion(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        identifier: taskId ? `task_${taskId}_geofence` : `geofence_${Date.now()}`
      }));
    }
  }, [isModalOpen, location, taskId]);

  const handleAddGeofence = async () => {
    try {
      const region: GeofenceRegion = {
        identifier: newRegion.identifier,
        latitude: parseFloat(newRegion.latitude),
        longitude: parseFloat(newRegion.longitude),
        radius: parseFloat(newRegion.radius),
        notifyOnEnter: newRegion.notifyOnEnter,
        notifyOnExit: newRegion.notifyOnExit
      };

      await addRegion(region);
      onGeofenceAdded?.(region);
      setIsModalOpen(false);
      setNewRegion({
        identifier: '',
        latitude: '',
        longitude: '',
        radius: '100',
        notifyOnEnter: true,
        notifyOnExit: true
      });
    } catch (error) {
      console.error('Error adding geofence:', error);
    }
  };

  const handleRemoveGeofence = async (identifier: string) => {
    try {
      await removeRegion(identifier);
      onGeofenceRemoved?.(identifier);
    } catch (error) {
      console.error('Error removing geofence:', error);
    }
  };

  const getDistanceToRegion = (region: GeofenceRegion): string | null => {
    if (!location) return null;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      region.latitude,
      region.longitude
    );

    return formatDistance(distance);
  };

  const isInsideRegion = (region: GeofenceRegion): boolean => {
    if (!location) return false;

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      region.latitude,
      region.longitude
    );

    return distance <= region.radius;
  };

  const renderGeofenceItem = ({ item: region }: { item: GeofenceRegion }) => {
    const distance = getDistanceToRegion(region);
    const isInside = isInsideRegion(region);

    return (
      <Box
        bg="white"
        p="4"
        borderRadius="lg"
        shadow="1"
        mb="2"
        borderWidth="1"
        borderColor={isInside ? "green.200" : "gray.200"}
      >
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex="1" space="2">
            <HStack alignItems="center" space="2">
              <MapPin size={16} color="#6B7280" />
              <Text fontWeight="bold" fontSize="md">
                {region.identifier}
              </Text>
              {isInside && (
                <Badge colorScheme="green" variant="solid">
                  Inside
                </Badge>
              )}
            </HStack>

            <Text fontSize="sm" color="gray.600">
              Lat: {region.latitude.toFixed(6)}, Lng: {region.longitude.toFixed(6)}
            </Text>

            <Text fontSize="sm" color="gray.600">
              Radius: {formatDistance(region.radius)}
              {distance && ` • Distance: ${distance}`}
            </Text>

            <HStack space="4">
              {region.notifyOnEnter && (
                <Badge colorScheme="blue" variant="outline">
                  Enter Alert
                </Badge>
              )}
              {region.notifyOnExit && (
                <Badge colorScheme="orange" variant="outline">
                  Exit Alert
                </Badge>
              )}
            </HStack>
          </VStack>

          <IconButton
            icon={<Trash2 size={16} color="#EF4444" />}
            onPress={() => handleRemoveGeofence(region.identifier)}
            isLoading={isRemovingRegion}
            variant="ghost"
            colorScheme="red"
          />
        </HStack>
      </Box>
    );
  };

  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="center" mb="4">
        <Text fontSize="lg" fontWeight="bold">
          Geofences ({regions.length})
        </Text>
        <Button
          leftIcon={<Plus size={16} color="white" />}
          onPress={() => setIsModalOpen(true)}
          size="sm"
          colorScheme="blue"
        >
          Add Geofence
        </Button>
      </HStack>

      {isLoadingRegions ? (
        <Box alignItems="center" py="4">
          <Spinner size="lg" />
          <Text mt="2" color="gray.500">Loading geofences...</Text>
        </Box>
      ) : regions.length === 0 ? (
        <Box
          bg="gray.50"
          p="6"
          borderRadius="lg"
          alignItems="center"
        >
          <MapPin size={32} color="#9CA3AF" />
          <Text mt="2" color="gray.500" textAlign="center">
            No geofences configured
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center" mt="1">
            Add a geofence to get location-based notifications
          </Text>
        </Box>
      ) : (
        <FlatList
          data={regions}
          renderItem={renderGeofenceItem}
          keyExtractor={(item) => item.identifier}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Geofence Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Add Geofence</Modal.Header>
          <Modal.Body>
            <VStack space="4">
              <FormControl>
                <FormControl.Label>Identifier</FormControl.Label>
                <Input
                  value={newRegion.identifier}
                  onChangeText={(text) => setNewRegion(prev => ({ ...prev, identifier: text }))}
                  placeholder="Enter geofence name"
                />
              </FormControl>

              <HStack space="2">
                <Button
                  flex="1"
                  variant="outline"
                  onPress={getCurrentLocation}
                  leftIcon={<MapPin size={16} />}
                >
                  Use Current Location
                </Button>
              </HStack>

              <HStack space="2">
                <FormControl flex="1">
                  <FormControl.Label>Latitude</FormControl.Label>
                  <Input
                    value={newRegion.latitude}
                    onChangeText={(text) => setNewRegion(prev => ({ ...prev, latitude: text }))}
                    placeholder="0.000000"
                    keyboardType="numeric"
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormControl.Label>Longitude</FormControl.Label>
                  <Input
                    value={newRegion.longitude}
                    onChangeText={(text) => setNewRegion(prev => ({ ...prev, longitude: text }))}
                    placeholder="0.000000"
                    keyboardType="numeric"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormControl.Label>Radius (meters)</FormControl.Label>
                <Input
                  value={newRegion.radius}
                  onChangeText={(text) => setNewRegion(prev => ({ ...prev, radius: text }))}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </FormControl>

              <VStack space="2">
                <Text fontWeight="bold">Notifications</Text>
                <HStack justifyContent="space-between">
                  <Text>Notify on Enter</Text>
                  <Button
                    size="sm"
                    variant={newRegion.notifyOnEnter ? "solid" : "outline"}
                    onPress={() => setNewRegion(prev => ({ ...prev, notifyOnEnter: !prev.notifyOnEnter }))}
                  >
                    {newRegion.notifyOnEnter ? "ON" : "OFF"}
                  </Button>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Notify on Exit</Text>
                  <Button
                    size="sm"
                    variant={newRegion.notifyOnExit ? "solid" : "outline"}
                    onPress={() => setNewRegion(prev => ({ ...prev, notifyOnExit: !prev.notifyOnExit }))}
                  >
                    {newRegion.notifyOnExit ? "ON" : "OFF"}
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space="2">
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddGeofence}
                isLoading={isAddingRegion}
                isDisabled={
                  !newRegion.identifier ||
                  !newRegion.latitude ||
                  !newRegion.longitude ||
                  !newRegion.radius
                }
              >
                Add Geofence
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};
