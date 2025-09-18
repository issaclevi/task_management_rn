import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

class LocationService {
  private watchId: number | null = null;
  private lastLocation: LocationCoords | null = null;

  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'denied' || auth === 'disabled') {
          this.showLocationSettingsAlert();
          return false;
        }
        return auth === 'granted';
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to assign tasks.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.DENIED || granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          this.showLocationSettingsAlert();
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      this.showLocationSettingsAlert();
      return false;
    }
  }

  private showLocationSettingsAlert() {
    Alert.alert(
      'Location Access Required',
      'This app needs location access to assign tasks. Please enable location services in your device settings.',
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
  }

  async startLocationTracking(callback: (coords: LocationCoords) => void) {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      console.warn('❌ Location permission denied');
      return;
    }

    try {
      // First try to get current position to test if location services work
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.lastLocation = coords;
          callback(coords);

          // If getCurrentPosition works, start watching
          this.startWatchingPosition(callback);
        },
        (error) => {
          console.warn('⚠️ getCurrentPosition error:', error);
          this.handleLocationError(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.showLocationServicesAlert();
    }
  }

  private startWatchingPosition(callback: (coords: LocationCoords) => void) {
    try {
      this.watchId = Geolocation.watchPosition(
        (position: GeoPosition) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.lastLocation = coords;
          callback(coords);
        },
        (error) => {
          console.warn('⚠️ watchPosition error:', error);
          this.handleLocationError(error);
        },
        {
          enableHighAccuracy: false,
          distanceFilter: 10,
          interval: 10000,
          fastestInterval: 5000,
        },
      );
    } catch (error) {
      console.error('Error in watchPosition:', error);
      this.showLocationServicesAlert();
    }
  }

  private handleLocationError(error: any) {
    console.log('Location error details:', {
      code: error.code,
      message: error.message,
      PERMISSION_DENIED: error.PERMISSION_DENIED,
      POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
      TIMEOUT: error.TIMEOUT,
    });

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        this.showLocationSettingsAlert();
        break;
      case 2: // POSITION_UNAVAILABLE
        this.showLocationServicesAlert();
        break;
      case 3: // TIMEOUT
        console.warn('Location timeout - will retry');
        break;
      default:
        this.showLocationServicesAlert();
        break;
    }
  }

  private showLocationServicesAlert() {
    Alert.alert(
      'Location Services Required',
      'Please enable location services and ensure Google Play Services is updated.',
      [
        {
          text: 'OK',
          style: 'default',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'android') {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownLocation() {
    return this.lastLocation;
  }
}

export const locationService = new LocationService();
