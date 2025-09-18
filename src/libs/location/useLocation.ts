import { useEffect, useState } from 'react';
import { locationService, LocationCoords } from './locationService';

export function useCurrentLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [lastKnown, setLastKnown] = useState<LocationCoords | null>(null);

  useEffect(() => {
    // Get last known location immediately
    const lastKnownLocation = locationService.getLastKnownLocation();
    if (lastKnownLocation) {
      setLastKnown(lastKnownLocation);
    }

    // Start location tracking
    locationService.startLocationTracking((coords) => {
      setLocation(coords);
      setLastKnown(coords);
    });

    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  return { location, lastKnown };
}