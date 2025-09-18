# OneSignal Setup Guide

This guide will help you configure OneSignal for push notifications in your React Native CLI app.

## Prerequisites

1. Create a OneSignal account at [https://onesignal.com](https://onesignal.com)
2. Create a new OneSignal app for your project

## Configuration Steps

### 1. Get Your OneSignal App ID

1. Go to your OneSignal dashboard
2. Select your app
3. Go to Settings > Keys & IDs
4. Copy your "OneSignal App ID"

### 2. Configure Android

#### 2.1 Update OneSignal Config
1. Open `android/app/src/main/res/values/onesignal_config.xml`
2. Replace `YOUR_ONESIGNAL_APP_ID` with your actual OneSignal App ID
3. Replace `YOUR_GOOGLE_PROJECT_NUMBER` with your Firebase project number

#### 2.2 Add Google Services (if not already added)
1. Download `google-services.json` from your Firebase console
2. Place it in `android/app/` directory
3. Add to `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### 2.3 Update build.gradle files
Add to `android/build.gradle` (project level):
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

### 3. Configure iOS

#### 3.1 Add Capabilities
1. Open your project in Xcode
2. Select your target
3. Go to "Signing & Capabilities"
4. Add "Push Notifications" capability
5. Add "Background Modes" capability and enable "Background processing" and "Remote notifications"

#### 3.2 Upload APNs Certificate
1. Generate APNs certificate in Apple Developer Console
2. Upload it to OneSignal dashboard under Settings > Platforms > Apple iOS (APNs)

### 4. Update App Configuration

#### 4.1 Update AuthProvider
In `src/app/providers/AuthProvider.tsx`, replace `YOUR_ONESIGNAL_APP_ID` with your actual App ID:

```typescript
await oneSignalService.initialize('YOUR_ACTUAL_ONESIGNAL_APP_ID');
```

### 5. Test Push Notifications

1. Build and run your app on a physical device
2. Grant notification permissions when prompted
3. Go to OneSignal dashboard > Messages > New Push
4. Send a test notification to verify everything works

## Important Notes

- Push notifications only work on physical devices, not simulators
- Make sure to test on both iOS and Android
- Background location permissions are required for geofencing features
- OneSignal automatically handles notification display and click events

## Troubleshooting

### Android Issues
- Ensure `google-services.json` is in the correct location
- Check that Google Services plugin is applied
- Verify Firebase project number matches OneSignal config

### iOS Issues
- Ensure APNs certificate is valid and uploaded to OneSignal
- Check that Push Notifications capability is enabled
- Verify provisioning profile includes push notification entitlements

### General Issues
- Check OneSignal dashboard for delivery status
- Verify App ID is correct in both config files and code
- Ensure device has internet connection and notifications enabled

## Additional Resources

- [OneSignal React Native SDK Documentation](https://documentation.onesignal.com/docs/react-native-sdk-setup)
- [OneSignal Dashboard](https://app.onesignal.com)
- [Firebase Console](https://console.firebase.google.com)
- [Apple Developer Console](https://developer.apple.com)
