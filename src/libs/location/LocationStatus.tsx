import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCurrentLocation } from './useLocation';

export default function LocationStatus() {
  const { location, lastKnown } = useCurrentLocation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Status</Text>
      {location ? (
        <>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </>
      ) : lastKnown ? (
        <>
          <Text>Last Known Latitude: {lastKnown.latitude}</Text>
          <Text>Last Known Longitude: {lastKnown.longitude}</Text>
        </>
      ) : (
        <Text>Fetching location...</Text>
      )}
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
});