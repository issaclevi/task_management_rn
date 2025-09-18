import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../providers/AuthProvider';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../../features/auth/screens/Login';
import HomeScreen from '../../features/home/screens/HomeScreen';
import TaskListScreen from '../../features/tasks/screens/TaskListScreen';
import MapScreen from '../../features/maps/screens/MapScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import TaskManagementScreen from '../../features/admin/screens/TaskManagementScreen';
import NotificationListScreen from '../../features/notifications/screens/NotificationListScreen';
import NotificationBell from '../../components/notifications/NotificationBell';
import SimpleTabBar from '../../components/navigation/SimpleTabBar';

import { ClipboardList, User2, Home, Map, Settings } from 'lucide-react-native';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppTabs() {
  const { user } = useAuth();

  return (
    <Tabs.Navigator
      tabBar={(props) => <SimpleTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerRight: () => <NotificationBell />,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          ...(Platform.OS === 'android' && { elevation: 4 }),
        },
        headerTitleStyle: {
          fontSize: Platform.OS === 'ios' ? 17 : 18,
          fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
          color: '#1F2937',
        },
        tabBarActiveTintColor: '#6A5AE0',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, focused }) => {
          const iconSize = Platform.OS === 'ios' ? (focused ? 26 : 24) : (focused ? 26 : 24);
          const stroke = focused ? 2.5 : 2;
          switch (route.name) {
            case 'Home':
              return <Home color={color} size={iconSize} strokeWidth={stroke} />;
            case 'Tasks':
              return <ClipboardList color={color} size={iconSize} strokeWidth={stroke} />;
            case 'Map':
              return <Map color={color} size={iconSize} strokeWidth={stroke} />;
            case 'Admin':
              return <Settings color={color} size={iconSize} strokeWidth={stroke} />;
            case 'Profile':
              return <User2 color={color} size={iconSize} strokeWidth={stroke} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Tasks" component={TaskListScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      {user?.role === 'ADMIN' && (
        <Tabs.Screen
          name="Admin"
          component={TaskManagementScreen}
          options={{ headerShown: false }}
        />
      )}
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top
      }}>
        <ActivityIndicator size="large" color="#6A5AE0" />
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' }
      }}
    >
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="Main" component={AppTabs} />
          <RootStack.Screen
            name="NotificationList"
            component={NotificationListScreen}
            options={{
              headerShown: true,
              title: 'Notifications',
              presentation: Platform.OS === 'ios' ? 'modal' : 'card',
              headerStyle: {
                backgroundColor: '#FFFFFF',
                ...(Platform.OS === 'android' && { elevation: 4 }),
              },
              headerTitleStyle: {
                fontSize: Platform.OS === 'ios' ? 17 : 18,
                fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
                color: '#1F2937',
              },
              headerTintColor: '#6A5AE0',
            }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
