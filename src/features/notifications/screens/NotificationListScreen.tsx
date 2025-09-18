import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  FlatList,
  Pressable,
  Badge,
  Spinner,
  Button,
  useToast,
  Divider,
  Center,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  useUserNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  Notification,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
} from '../../../libs/api/notifications';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress, onMarkRead }) => {
  const handlePress = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onPress(notification);
  };

  return (
    <Pressable onPress={handlePress}>
      <Box
        bg={notification.isRead ? 'gray.50' : 'white'}
        p="4"
        borderLeftWidth={notification.isRead ? 0 : 3}
        borderLeftColor="blue.500"
      >
        <HStack space="3" alignItems="flex-start">
          {/* Notification Icon */}
          <Box
            bg={notification.isRead ? 'gray.100' : 'blue.100'}
            p="2"
            borderRadius="full"
            minW="10"
            alignItems="center"
          >
            <Text fontSize="lg">{getNotificationIcon(notification)}</Text>
          </Box>

          {/* Content */}
          <VStack flex="1" space="1">
            <HStack justifyContent="space-between" alignItems="flex-start">
              <Text
                fontSize="md"
                fontWeight={notification.isRead ? 'normal' : 'bold'}
                color={notification.isRead ? 'gray.600' : 'gray.900'}
                flex="1"
                numberOfLines={2}
              >
                {notification.title}
              </Text>
              <Text fontSize="xs" color="gray.500" ml="2">
                {formatNotificationTime(notification.createdAt)}
              </Text>
            </HStack>

            <Text
              fontSize="sm"
              color="gray.600"
              numberOfLines={2}
            >
              {notification.body}
            </Text>

            {/* Task Info */}
            {notification.task && (
              <HStack space="2" alignItems="center" mt="1">
                <Badge
                  colorScheme={
                    notification.task.status === 'NEW' ? 'blue' :
                    notification.task.status === 'IN_PROGRESS' ? 'orange' :
                    notification.task.status === 'COMPLETED' ? 'green' : 'gray'
                  }
                  variant="subtle"
                  rounded="sm"
                >
                  {notification.task.status}
                </Badge>
                <Text fontSize="xs" color="gray.500" flex="1" numberOfLines={1}>
                  {notification.task.title}
                </Text>
              </HStack>
            )}

            {/* Unread indicator */}
            {!notification.isRead && (
              <HStack justifyContent="flex-end" mt="1">
                <Box w="2" h="2" bg="blue.500" borderRadius="full" />
              </HStack>
            )}
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
};

const NotificationListScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const { user } = useAuth();

  const {
    data: notificationData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useUserNotifications(user?.id || '', 1, 50);

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (notification.task) {
      // Navigate to task detail
      navigation.navigate('TaskDetail' as any, { taskId: notification.task.id });
    } else if (notification.data?.type === 'TASK_ASSIGNED') {
      // Navigate to task list
      navigation.navigate('TaskList' as any);
    }
  }, [navigation]);

  const handleMarkRead = useCallback((notificationId: string) => {
    markReadMutation.mutate(notificationId);
  }, [markReadMutation]);

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.show({
          title: 'Success',
          description: `${data.markedCount} notifications marked as read`,
          status: 'success',
        });
      },
      onError: () => {
        toast.show({
          title: 'Error',
          description: 'Failed to mark notifications as read',
          status: 'error',
        });
      },
    });
  }, [markAllReadMutation, toast]);

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkRead={handleMarkRead}
    />
  );

  const renderSeparator = () => <Divider />;

  const renderEmpty = () => (
    <Center flex="1" py="8">
      <Text fontSize="lg" color="gray.500" textAlign="center">
        🔔
      </Text>
      <Text fontSize="md" color="gray.500" textAlign="center" mt="2">
        No notifications yet
      </Text>
      <Text fontSize="sm" color="gray.400" textAlign="center" mt="1">
        You'll see task updates and alerts here
      </Text>
    </Center>
  );

  if (isLoading) {
    return (
      <Box flex="1" bg="gray.50" safeArea>
        <Center flex="1">
          <Spinner size="lg" />
          <Text mt="4" color="gray.500">Loading notifications...</Text>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex="1" bg="gray.50" safeArea>
        <Center flex="1" px="4">
          <Text fontSize="lg" color="red.500" textAlign="center">
            Failed to load notifications
          </Text>
          <Button mt="4" onPress={() => refetch()}>
            Try Again
          </Button>
        </Center>
      </Box>
    );
  }

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  return (
    <Box flex="1" bg="gray.50" safeArea>
      {/* Header */}
      <Box bg="white" px="4" py="3" shadow="1">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text fontSize="xl" fontWeight="bold">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text fontSize="sm" color="gray.500">
                {unreadCount} unread
              </Text>
            )}
          </VStack>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onPress={handleMarkAllRead}
              isLoading={markAllReadMutation.isPending}
            >
              Mark All Read
            </Button>
          )}
        </HStack>
      </Box>

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default NotificationListScreen;
