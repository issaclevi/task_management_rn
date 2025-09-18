import React from 'react';
import {
  Box, VStack, HStack, Heading, Text, Avatar, Button, Pressable,
  Icon, Divider, Modal
} from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight, Heart, Download, Globe, MapPin, Monitor,
  SlidersHorizontal, CreditCard, Trash2, Clock3, LogOut, Camera, Settings, Bell
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../app/providers/AuthProvider';
import NotificationTestScreen from '../../debug/screens/NotificationTestScreen';

type RowProps = {
  icon: any; label: string; right?: React.ReactNode; danger?: boolean; onPress?: () => void;
};
const Row = ({ icon: LucideIcon, label, right, danger, onPress }: RowProps) => (
  <Pressable onPress={onPress}>
    <HStack px="4" py="3.5" alignItems="center" justifyContent="space-between">
      <HStack space="3" alignItems="center">
        <Icon as={LucideIcon} size="sm" color={danger ? 'red.500' : 'muted.700'} />
        <Text fontSize="md" color={danger ? 'red.600' : 'muted.800'}>{label}</Text>
      </HStack>
      {right ?? <Icon as={ChevronRight} size="sm" color="muted.400" />}
    </HStack>
  </Pressable>
);

export default function ProfileScreen() {

  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showNotificationTest, setShowNotificationTest] = React.useState(false);

  return (
    <Box flex={1} bg="white" style={{ paddingTop: insets.top }}>
      {/* top bar */}
      <HStack px="4" py="3" alignItems="center" justifyContent="space-between">
        <Heading size="md">My Profile</Heading>
        <Pressable onPress={() => {/* open settings */ }}>
          <Icon as={Settings} size="lg" color="muted.700" />
        </Pressable>
      </HStack>

      {/* card */}
      <VStack px="4" space="4">
        <Box bg="white" borderRadius="2xl" p="4">
          <HStack alignItems="center" justifyContent="space-between">
            <HStack space="3" alignItems="center">
              <Box>
                <Avatar size="lg" source={{ uri: 'https://i.pravatar.cc/160?img=3' }} />
                {/* camera badge */}
                <Box position="absolute" right={-2} bottom={-2} bg="white" rounded="full" p="1" shadow="2">
                  <Icon as={Camera} size="xs" color="muted.700" />
                </Box>
              </Box>
              <VStack>
                <Heading size="sm">{user?.email?.split('@')[0] || 'User'}</Heading>
                <Text color="muted.500" fontSize="xs">{user?.email || 'user@example.com'}</Text>
                <Text color="blue.500" fontSize="xs" fontWeight="bold">{user?.role || 'USER'}</Text>
              </VStack>
            </HStack>
          </HStack>
        </Box>

        {/* settings list */}
        <Box bg="white" borderRadius="2xl" overflow="hidden">
          <Row icon={Bell} label="Test Notifications" onPress={() => setShowNotificationTest(true)} />
          <Divider />
          <Row icon={Heart} label="Favourites" onPress={() => { }} />
          <Divider />
          <Row icon={Globe} label="Language" onPress={() => { }} />
          <Divider />
          <Row icon={MapPin} label="Location" onPress={() => { }} />
          <Divider />
          <Row icon={SlidersHorizontal} label="Feed preference" onPress={() => { }} />
          <Divider />
          <Row icon={Trash2} label="Clear Cache" onPress={() => { }} />
          <Divider />
          <Row icon={Clock3} label="Clear history" onPress={() => { }} />
          <Divider />
          <Row icon={LogOut} label="Log Out" danger onPress={() => {signOut()}} />
        </Box>

        <Text textAlign="center" color="muted.400" mt="2" mb="4">
          App version 0.0.1
        </Text>
      </VStack>

      {/* Notification Test Modal */}
      <Modal isOpen={showNotificationTest} onClose={() => setShowNotificationTest(false)} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Notification Test</Modal.Header>
          <Modal.Body p={0}>
            <NotificationTestScreen />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
}
