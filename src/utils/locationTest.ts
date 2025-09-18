import { locationService } from '../libs/location/locationService';

export const testLocationService = async () => {
  console.log('🧪 Testing Location Service...');
  
  try {
    // Test permission request
    const hasPermission = await locationService.requestLocationPermission();
    console.log('📍 Permission granted:', hasPermission);
    
    if (hasPermission) {
      // Test location tracking
      locationService.startLocationTracking((coords) => {
        console.log('📍 Location received:', coords);
      });
      
      // Test last known location
      setTimeout(() => {
        const lastKnown = locationService.getLastKnownLocation();
        console.log('📍 Last known location:', lastKnown);
        
        // Stop tracking after test
        locationService.stopLocationTracking();
        console.log('✅ Location test completed');
      }, 5000);
    } else {
      console.log('❌ Location permission denied');
    }
  } catch (error) {
    console.error('❌ Location test failed:', error);
  }
};
