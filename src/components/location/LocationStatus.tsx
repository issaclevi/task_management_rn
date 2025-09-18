import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useCurrentLocation } from '../../libs/location/useLocation';
import { locationService } from '../../libs/location/locationService';

export default function LocationStatus() {
  const { location, lastKnown } = useCurrentLocation();
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error checking permission:', error);
      setPermissionStatus('denied');
    }
  };

  const handleEnableLocation = () => {
    Alert.alert(
      'Enable Location Services',
      'To use location features, please enable location services in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const renderLocationContent = () => {
    if (permissionStatus === 'checking') {
      return <Text style={styles.statusText}>Checking location permissions...</Text>;
    }

    if (permissionStatus === 'denied') {
      return (
        <View>
          <Text style={styles.errorText}>Location access denied</Text>
          <TouchableOpacity style={styles.enableButton} onPress={handleEnableLocation}>
            <Text style={styles.enableButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (location) {
      return (
        <View>
          <Text style={styles.successText}>✅ Location Active</Text>
          <Text style={styles.coordText}>Lat: {location.latitude.toFixed(6)}</Text>
          <Text style={styles.coordText}>Lng: {location.longitude.toFixed(6)}</Text>
        </View>
      );
    }

    if (lastKnown) {
      return (
        <View>
          <Text style={styles.warningText}>📍 Last Known Location</Text>
          <Text style={styles.coordText}>Lat: {lastKnown.latitude.toFixed(6)}</Text>
          <Text style={styles.coordText}>Lng: {lastKnown.longitude.toFixed(6)}</Text>
        </View>
      );
    }

    return <Text style={styles.statusText}>Fetching location...</Text>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Status</Text>
      {renderLocationContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    margin: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  successText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  coordText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  enableButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
