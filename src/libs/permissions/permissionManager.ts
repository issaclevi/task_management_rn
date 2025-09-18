import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { OneSignal } from 'react-native-onesignal';

export interface PermissionStatus {
  location: boolean;
  notification: boolean;
}

class PermissionManager {
  async requestAllPermissions(): Promise<PermissionStatus> {
    const locationPermission = await this.requestLocationPermission();
    const notificationPermission = await this.requestNotificationPermission();

    return {
      location: locationPermission,
      notification: notificationPermission,
    };
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS location permission is handled by react-native-geolocation-service
        return true; // Will be requested when location service is used
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to assign tasks based on your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Location permission granted');
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          this.showLocationSettingsAlert();
          return false;
        } else {
          console.log('❌ Location permission denied');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      console.log('🔔 Requesting notification permission...');
      const hasPermission = await OneSignal.Notifications.requestPermission(true);
      
      if (hasPermission) {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
        this.showNotificationSettingsAlert();
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async checkPermissionStatus(): Promise<PermissionStatus> {
    const locationStatus = await this.checkLocationPermission();
    const notificationStatus = await this.checkNotificationPermission();

    return {
      location: locationStatus,
      notification: notificationStatus,
    };
  }

  private async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    }
    return true; // iOS will be checked when location service is used
  }

  private async checkNotificationPermission(): Promise<boolean> {
    try {
      const isOptedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
      return isOptedIn;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  private showLocationSettingsAlert() {
    Alert.alert(
      'Location Permission Required',
      'This app needs location access to assign tasks. Please enable location permission in your device settings.',
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

  private showNotificationSettingsAlert() {
    Alert.alert(
      'Notification Permission Required',
      'This app needs notification access to send you task updates. Please enable notifications in your device settings.',
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

  showPermissionGuide() {
    Alert.alert(
      'App Permissions',
      'This app requires the following permissions:\n\n📍 Location: To assign tasks based on your location\n🔔 Notifications: To receive task updates\n\nPlease enable these permissions for the best experience.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Grant Permissions',
          onPress: () => this.requestAllPermissions(),
        },
      ]
    );
  }
}

export const permissionManager = new PermissionManager();
