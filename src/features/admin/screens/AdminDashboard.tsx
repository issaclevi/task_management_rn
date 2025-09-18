// src/features/admin/screens/AdminDashboard.tsx
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  Pressable,
  Badge,
  Divider
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Users, MapPin, Plus, BarChart3, Bell, Settings } from 'lucide-react-native';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useUsers } from '../../../libs/api';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress
}) => (
  <Pressable onPress={onPress} flex="1">
    <Box
      bg="white"
      p="4"
      borderRadius="lg"
      shadow="1"
      borderLeftWidth="4"
      borderLeftColor={color}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack space="1">
          <Text fontSize="sm" color="gray.500">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={color}>
            {value}
          </Text>
        </VStack>
        <Box p="2" bg={`${color}.100`} borderRadius="full">
          {icon}
        </Box>
      </HStack>
    </Box>
  </Pressable>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  badge?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onPress,
  badge
}) => (
  <Pressable onPress={onPress}>
    <Box
      bg="white"
      p="4"
      borderRadius="lg"
      shadow="1"
      mb="3"
    >
      <HStack space="3" alignItems="center">
        <Box p="2" bg="blue.100" borderRadius="full">
          {icon}
        </Box>
        <VStack flex="1" space="1">
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="md" fontWeight="semibold">
              {title}
            </Text>
            {badge && (
              <Badge colorScheme="red" variant="solid" borderRadius="full">
                {badge}
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {description}
          </Text>
        </VStack>
      </HStack>
    </Box>
  </Pressable>
);

export const AdminDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  console.log('users: ', users);
  
  // Dashboard statistics from live data
  const dashboardStats = {
    totalUsers: users.length,
    activeTasks: 0,
    completedTasks: 0,
    geofences: 0
  };

  const quickActions = [
    {
      title: 'Create New Task',
      description: 'Assign tasks to users with geofencing',
      icon: <Plus size={20} color="#3B82F6" />,
      onPress: () => navigation.navigate('CreateTask' as any),
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <Users size={20} color="#3B82F6" />,
      onPress: () => navigation.navigate('UserManagement' as any),
      badge: users.filter(u => u.role === 'USER').length.toString()
    },
    {
      title: 'Geofence Management',
      description: 'Configure location-based alerts',
      icon: <MapPin size={20} color="#3B82F6" />,
      onPress: () => console.log('Geofences - Not implemented yet'),
    },
    {
      title: 'Analytics & Reports',
      description: 'View task completion and user activity',
      icon: <BarChart3 size={20} color="#3B82F6" />,
      onPress: () => console.log('Analytics - Not implemented yet'),
    },
    {
      title: 'Notifications',
      description: 'Send push notifications to users',
      icon: <Bell size={20} color="#3B82F6" />,
      onPress: () => console.log('Notifications - Not implemented yet'),
    },
    {
      title: 'Settings',
      description: 'Configure app settings and preferences',
      icon: <Settings size={20} color="#3B82F6" />,
      onPress: () => console.log('Settings - Not implemented yet'),
    }
  ];

  return (
    <ScrollView bg="gray.50" flex="1">
      <Box p="4" safeArea>
        <VStack space="6">
          {/* Header */}
          <VStack space="2">
            <Text fontSize="2xl" fontWeight="bold">
              Admin Dashboard
            </Text>
            <Text fontSize="md" color="gray.500">
              Welcome back, {user?.email}
            </Text>
          </VStack>

          {/* Stats Cards */}
          <VStack space="3">
            <Text fontSize="lg" fontWeight="semibold">
              Overview
            </Text>

            <VStack space="3">
              <HStack space="3">
                <DashboardCard
                  title="Total Users"
                  value={isLoadingUsers ? '...' : dashboardStats.totalUsers}
                  icon={<Users size={20} color="#3B82F6" />}
                  color="blue.500"
                  onPress={() => navigation.navigate('UserManagement' as any)}
                />
                <DashboardCard
                  title="Active Tasks"
                  value={dashboardStats.activeTasks}
                  icon={<Plus size={20} color="#10B981" />}
                  color="green.500"
                  onPress={() => navigation.navigate('TaskList' as any)}
                />
              </HStack>

              <HStack space="3">
                <DashboardCard
                  title="Completed"
                  value={dashboardStats.completedTasks}
                  icon={<BarChart3 size={20} color="#F59E0B" />}
                  color="yellow.500"
                  onPress={() => console.log('Analytics - Not implemented yet')}
                />
                <DashboardCard
                  title="Geofences"
                  value={dashboardStats.geofences}
                  icon={<MapPin size={20} color="#8B5CF6" />}
                  color="purple.500"
                  onPress={() => console.log('Geofences - Not implemented yet')}
                />
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* Quick Actions */}
          <VStack space="3">
            <Text fontSize="lg" fontWeight="semibold">
              Quick Actions
            </Text>

            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onPress={action.onPress}
                badge={action.badge}
              />
            ))}
          </VStack>

          {/* Recent Activity */}
          <VStack space="3">
            <Text fontSize="lg" fontWeight="semibold">
              Recent Activity
            </Text>

            <Box bg="white" p="4" borderRadius="lg" shadow="1">
              <VStack space="3">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    Task "Delivery Route A" completed
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    2 hours ago
                  </Text>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    New user registered: john@example.com
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    4 hours ago
                  </Text>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    Geofence alert triggered for Zone B
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    6 hours ago
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};
