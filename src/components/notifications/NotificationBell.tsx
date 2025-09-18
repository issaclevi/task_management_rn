import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, Badge } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useUnreadNotificationCount } from '../../libs/api/notifications';

interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 'md',
  color = '#374151',
  onPress,
}) => {
  const navigation = useNavigation();
  const { data: unreadData } = useUnreadNotificationCount();

  const unreadCount = unreadData?.unreadCount || 0;

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  const badgeSizes = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  } as const;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('NotificationList' as any);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Box position="relative">
        {/* Bell Icon */}
        <Box p="2">
          <Text fontSize={iconSizes[size]} color={color}>
            🔔
          </Text>
        </Box>

        {/* Badge */}
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            bg="red.500"
            rounded="full"
            minW="5"
            h="5"
            alignItems="center"
            justifyContent="center"
            _text={{
              color: 'white',
              fontSize: badgeSizes[size],
              fontWeight: 'bold',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Badge>
        )}
      </Box>
    </Pressable>
  );
};

export default NotificationBell;
