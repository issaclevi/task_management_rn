// src/config/index.ts
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface AppConfig {
  // App Information
  appName: string;
  appVersion: string;
  appVariant: 'dev' | 'prod';
  appScheme: string;

  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // Firebase Configuration
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };

  // Push Notifications
  fcm: {
    serverKey: string;
    senderId: string;
  };

  // Maps Configuration
  googleMapsApiKey: string;

  // Analytics
  analytics: {
    enabled: boolean;
    sentryDsn?: string;
  };

  // Debug Configuration
  debug: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // Feature Flags
  features: {
    geofencing: boolean;
    pushNotifications: boolean;
    offlineMode: boolean;
    analytics: boolean;
  };
}

// Get configuration for React Native CLI
const getConfig = (): AppConfig => {
  // For React Native CLI, we'll use environment variables and DeviceInfo
  const appName = 'TaskApp';
  const appVersion = DeviceInfo.getVersion();

  // Default configuration
  const defaultConfig: AppConfig = {
    appName: appName,
    appVersion: appVersion,
    appVariant: __DEV__ ? 'dev' : 'prod',
    appScheme: 'taskapp',

    apiBaseUrl: 'http://localhost:4000',
    apiTimeout: 10000,

    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
    },

    fcm: {
      serverKey: process.env.FCM_SERVER_KEY || '',
      senderId: process.env.FCM_SENDER_ID || '',
    },

    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

    analytics: {
      enabled: process.env.ANALYTICS_ENABLED === 'true',
      sentryDsn: process.env.SENTRY_DSN,
    },

    debug: {
      enabled: __DEV__,
      logLevel: 'debug',
    },

    features: {
      geofencing: true,
      pushNotifications: true,
      offlineMode: true,
      analytics: false,
    },
  };

  // For React Native CLI, use environment variables directly
  return {
    ...defaultConfig,
    apiBaseUrl: process.env.API_BASE_URL || defaultConfig.apiBaseUrl,
    apiTimeout: process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT, 10) : defaultConfig.apiTimeout,

    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || defaultConfig.firebase.projectId,
      apiKey: process.env.FIREBASE_API_KEY || defaultConfig.firebase.apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || defaultConfig.firebase.authDomain,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultConfig.firebase.storageBucket,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || defaultConfig.firebase.messagingSenderId,
      appId: process.env.FIREBASE_APP_ID || defaultConfig.firebase.appId,
    },

    fcm: {
      serverKey: process.env.FCM_SERVER_KEY || defaultConfig.fcm.serverKey,
      senderId: process.env.FCM_SENDER_ID || defaultConfig.fcm.senderId,
    },

    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || defaultConfig.googleMapsApiKey,

    analytics: {
      enabled: process.env.ANALYTICS_ENABLED === 'true' || defaultConfig.analytics.enabled,
      sentryDsn: process.env.SENTRY_DSN || defaultConfig.analytics.sentryDsn,
    },

    debug: {
      enabled: process.env.DEBUG_MODE === 'true' || defaultConfig.debug.enabled,
      logLevel: (process.env.LOG_LEVEL as AppConfig['debug']['logLevel']) || defaultConfig.debug.logLevel,
    },

    features: {
      geofencing: process.env.ENABLE_GEOFENCING !== 'false',
      pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
      offlineMode: process.env.ENABLE_OFFLINE_MODE !== 'false',
      analytics: process.env.ENABLE_ANALYTICS === 'true',
    },
  };
};

// Export the configuration
export const config = getConfig();

// Helper functions
export const isDevelopment = () => config.appVariant === 'dev';
export const isProduction = () => config.appVariant === 'prod';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

// Debug helpers
export const shouldLog = (level: AppConfig['debug']['logLevel']): boolean => {
  if (!config.debug.enabled) return false;

  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.debug.logLevel);
  const requestedLevelIndex = levels.indexOf(level);

  return requestedLevelIndex >= currentLevelIndex;
};

// API helpers
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Environment-specific configurations
export const getFirebaseConfig = () => ({
  projectId: config.firebase.projectId,
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
});

// Validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.apiBaseUrl) {
    errors.push('API_BASE_URL is required');
  }

  if (!config.firebase.projectId) {
    errors.push('FIREBASE_PROJECT_ID is required');
  }

  if (!config.firebase.apiKey) {
    errors.push('FIREBASE_API_KEY is required');
  }

  if (config.features.pushNotifications && !config.fcm.senderId) {
    errors.push('FCM_SENDER_ID is required when push notifications are enabled');
  }

  if (config.features.analytics && config.analytics.enabled && !config.analytics.sentryDsn) {
    errors.push('SENTRY_DSN is required when analytics are enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Log configuration on startup (development only)
if (isDevelopment() && shouldLog('debug')) {
  console.log('App Configuration:', {
    appName: config.appName,
    appVersion: config.appVersion,
    appVariant: config.appVariant,
    apiBaseUrl: config.apiBaseUrl,
    features: config.features,
    debug: config.debug,
  });

  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('Configuration validation errors:', validation.errors);
  }
}

export default config;
