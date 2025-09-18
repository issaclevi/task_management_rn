// src/libs/push/oneSignalService.ts
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import Config from 'react-native-config';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android';
}

class OneSignalService {
  private isInitialized = false;
  private appId: string = `${Config.ONESIGNAL_APP_ID}`;
  private navigationRef: any = null;

  // Initialize OneSignal
  async initialize(appId: string): Promise<void> {
    try {
      console.log('Initializing OneSignal with App ID:', appId);
      OneSignal.initialize(appId);

      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      const hasPermission = await OneSignal.Notifications.requestPermission(true);

      OneSignal.Notifications.addEventListener('click', (event) => {
        const { additionalData } = event.notification;

        if (additionalData && (additionalData as any)?.type) {
          const { type, taskId } = additionalData as any;

          this.handleNotificationNavigation(type, taskId);
        }
      });

      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        event.getNotification().display();
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isInitialized = true;
      console.log('OneSignal initialized successfully');

      const initialToken = await this.getPushToken();
      if (initialToken) {
        console.log('Initial OneSignal token available:', initialToken);
      } else {
        console.log('⚠️ OneSignal token not immediately available, will retry later');
      }
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      throw error;
    }
  }

  // Get push token
  async getPushToken(userId?: string): Promise<PushToken | null> {
    try {
      if (!this.isInitialized) {
        console.log('OneSignal not initialized yet');
        return null;
      }

      const onesignalId = await OneSignal.User.getOnesignalId();
      const pushSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
      const isOptedIn = await OneSignal.User.pushSubscription.getOptedInAsync();

      if (pushSubscriptionId && isOptedIn) {

        const token: PushToken = {
          token: pushSubscriptionId,
          platform: Platform.OS as 'ios' | 'android',
        };

        await AsyncStorage.setItem('push_token', JSON.stringify(token));

        if (userId) {
          try {
            console.log('Registering OneSignal token with backend:', token.token);
            const response = await api.post('/api/devices/register', {
              token: token.token,
              platform: token.platform,
            });
            console.log('Token registration response:', response.data);
          } catch (err) {
            console.error('Failed saving token to DB:', err);
          }
        } else {
          console.warn('⚠️ No userId provided, token only saved locally');
        }

        return token;
      }

      console.warn('⚠️ No valid push subscription ID found or user not opted in');
      return null;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Unregister push token
  async unregisterPushToken(): Promise<void> {
    try {
      const storedToken = await this.getStoredPushToken();

      if (storedToken) {
        await api.delete('/api/devices/unregister', {
          data: { token: storedToken.token }
        });
      }
      await AsyncStorage.removeItem('push_token');

      console.log('Push token unregistered');
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      Alert.alert(title, body, [{ text: 'OK' }]);

      console.log('Local notification sent:', { title, body, data });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: { seconds: number },
    data?: Record<string, any>
  ): Promise<void> {
    try {
      console.log('Scheduled notification (would be handled by backend):', {
        title,
        body,
        trigger,
        data,
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async setUserTags(tags: Record<string, string>): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      OneSignal.User.addTags(tags);
      console.log('User tags set:', tags);
    } catch (error) {
      console.error('Error setting user tags:', error);
    }
  }

  // Remove user tags
  async removeUserTags(tagKeys: string[]): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      OneSignal.User.removeTags(tagKeys);
      console.log('User tags removed:', tagKeys);
    } catch (error) {
      console.error('Error removing user tags:', error);
    }
  }

  // Register device token with backend (only if subscribed)
  async registerDeviceToken(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('OneSignal not initialized, skipping token registration');
        return;
      }

      const onesignalId = await OneSignal.User.getOnesignalId();
      const pushSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
      const isOptedIn = await OneSignal.User.pushSubscription.getOptedInAsync();

      console.log('🔔 OneSignal IDs for registration:', { onesignalId, pushSubscriptionId, isOptedIn });

      if (!pushSubscriptionId) {
        console.log('No push subscription ID available, skipping token registration');
        return;
      }

      if (!isOptedIn) {
        console.log('User not subscribed to notifications, skipping token registration');
        return;
      }

      console.log('Registering OneSignal token for user:', userId, 'with push subscription ID:', pushSubscriptionId);

      // Register with backend
      const response = await api.post('/api/devices/register', {
        token: pushSubscriptionId, // Use push subscription ID, not user ID
        platform: Platform.OS as 'ios' | 'android',
      });

      if (response.data.success) {
        console.log('Device token registered successfully');
        await AsyncStorage.setItem('onesignal_registered', 'true');
      } else {
        console.error('Failed to register device token:', response.data.message);
      }
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  }

  async setExternalUserId(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      OneSignal.login(userId);
      console.log('External user ID set:', userId);
      await this.registerDeviceToken(userId);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  // Remove external user ID
  async removeExternalUserId(): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      OneSignal.logout();
      console.log('External user ID removed');
    } catch (error) {
      console.error('Error removing external user ID:', error);
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      const permission = await OneSignal.Notifications.getPermissionAsync();
      return permission;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Get stored push token
  async getStoredPushToken(): Promise<PushToken | null> {
    try {
      const tokenJson = await AsyncStorage.getItem('push_token');
      return tokenJson ? JSON.parse(tokenJson) : null;
    } catch (error) {
      console.error('Error getting stored push token:', error);
      return null;
    }
  }

  // Set navigation reference for handling notification clicks
  setNavigationRef(navigationRef: any) {
    this.navigationRef = navigationRef;
  }

  // Handle notification navigation
  private handleNotificationNavigation(type: string, taskId?: string) {
    if (!this.navigationRef) {
      console.warn('Navigation ref not set, cannot navigate from notification');
      return;
    }

    try {
      switch (type) {
        case 'TASK_ASSIGNED':
          if (taskId) {
            this.navigationRef.navigate('TaskDetail', { taskId });
          } else {
            this.navigationRef.navigate('TaskList');
          }
          break;
        case 'TASK_REMINDER':
          if (taskId) {
            this.navigationRef.navigate('TaskDetail', { taskId });
          } else {
            this.navigationRef.navigate('TaskList');
          }
          break;
        case 'GEOFENCE_ALERT':
          this.navigationRef.navigate('TaskList');
          break;
        case 'TASK_UPDATED':
          if (taskId) {
            this.navigationRef.navigate('TaskDetail', { taskId });
          } else {
            this.navigationRef.navigate('TaskList');
          }
          break;
        default:
          this.navigationRef.navigate('NotificationList');
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  }
}

export const oneSignalService = new OneSignalService();

export const unregisterPushToken = () => oneSignalService.unregisterPushToken();
export const sendLocalNotification = (title: string, body: string, data?: Record<string, any>) =>
  oneSignalService.sendLocalNotification(title, body, data);
export const scheduleLocalNotification = (
  title: string,
  body: string,
  trigger: { seconds: number },
  data?: Record<string, any>
) => oneSignalService.scheduleLocalNotification(title, body, trigger, data);
export const getPushToken = () => oneSignalService.getPushToken();
