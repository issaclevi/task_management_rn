// src/features/admin/screens/UserManagementScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FlatList,
  Badge,
  IconButton,
  Modal,
  FormControl,
  Select,
  CheckIcon,
  Alert,
  Spinner,
  Pressable
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Users, Search, Plus, Edit, Trash2, ArrowLeft, Mail, Shield } from 'lucide-react-native';
import { useUsers, useUpdateUser, useDeleteUser, User } from '../../../libs/api';

interface UserItemProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onEdit, onDelete }) => {
  return (
    <Box
      bg="white"
      p="4"
      borderRadius="lg"
      shadow="1"
      mb="3"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack flex="1" space="2">
          <HStack alignItems="center" space="2">
            <Mail size={16} color="#6B7280" />
            <Text fontSize="md" fontWeight="semibold" flex="1">
              {user.email}
            </Text>
            <Badge
              colorScheme={user.role === 'ADMIN' ? 'purple' : 'blue'}
              variant="solid"
            >
              {user.role}
            </Badge>
          </HStack>

          <Text fontSize="sm" color="gray.500">
            Created: {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </VStack>

        <HStack space="2">
          <IconButton
            icon={<Edit size={16} color="#3B82F6" />}
            onPress={() => onEdit(user)}
            variant="ghost"
            colorScheme="blue"
            size="sm"
          />
          <IconButton
            icon={<Trash2 size={16} color="#EF4444" />}
            onPress={() => onDelete(user.id)}
            variant="ghost"
            colorScheme="red"
            size="sm"
          />
        </HStack>
      </HStack>
    </Box>
  );
};

export const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: users = [], isLoading, error } = useUsers();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    email: '',
    role: 'USER' as 'ADMIN' | 'USER'
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data: {
          email: editForm.email,
          role: editForm.role
        }
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <UserItem
      user={item}
      onEdit={handleEditUser}
      onDelete={handleDeleteUser}
    />
  );

  if (error) {
    return (
      <Box flex="1" bg="gray.50" p="4" safeArea>
        <Alert status="error" borderRadius="md">
          <Text color="red.600">
            Failed to load users. Please try again.
          </Text>
        </Alert>
      </Box>
    );
  }

  return (
    <Box flex="1" bg="gray.50" safeArea>
      <VStack flex="1" space="4" p="4">
        {/* Header */}
        <HStack space="3" alignItems="center">
          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
            leftIcon={<ArrowLeft size={16} />}
            p="2"
          >
            Back
          </Button>
          <Text fontSize="xl" fontWeight="bold" flex="1">
            User Management
          </Text>
        </HStack>

        {/* Search and Stats */}
        <VStack space="3">
          <HStack space="3" alignItems="center">
            <Box flex="1" position="relative">
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search users by email..."
                leftElement={<Search size={16} color="#6B7280" style={{ marginLeft: 12 }} />}
              />
            </Box>
          </HStack>

          {/* Stats */}
          <HStack space="4" justifyContent="space-around">
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {users.length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Total Users
              </Text>
            </VStack>

            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {users.filter(u => u.role === 'ADMIN').length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Admins
              </Text>
            </VStack>

            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {users.filter(u => u.role === 'USER').length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Regular Users
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Users List */}
        {isLoading ? (
          <Box flex="1" alignItems="center" justifyContent="center">
            <Spinner size="lg" />
            <Text mt="2" color="gray.500">Loading users...</Text>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box
            flex="1"
            alignItems="center"
            justifyContent="center"
            bg="white"
            borderRadius="lg"
            p="6"
          >
            <Users size={48} color="#9CA3AF" />
            <Text mt="4" fontSize="lg" color="gray.500" textAlign="center">
              {searchQuery ? 'No users found' : 'No users available'}
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center" mt="1">
              {searchQuery ? 'Try adjusting your search' : 'Users will appear here when they register'}
            </Text>
          </Box>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            flex="1"
          />
        )}

        {/* Edit User Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Edit User</Modal.Header>
            <Modal.Body>
              <VStack space="4">
                <FormControl>
                  <FormControl.Label>Email</FormControl.Label>
                  <Input
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder="Enter email"
                    isDisabled
                  />
                  <FormControl.HelperText>
                    Email cannot be changed
                  </FormControl.HelperText>
                </FormControl>

                <FormControl>
                  <FormControl.Label>Role</FormControl.Label>
                  <Select
                    selectedValue={editForm.role}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as 'ADMIN' | 'USER' }))}
                    _selectedItem={{
                      bg: "blue.500",
                      endIcon: <CheckIcon size="5" />
                    }}
                  >
                    <Select.Item label="User" value="USER" />
                    <Select.Item label="Admin" value="ADMIN" />
                  </Select>
                </FormControl>
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space="2">
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleUpdateUser}
                  isLoading={updateUserMutation.isPending}
                >
                  Update User
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </VStack>
    </Box>
  );
};
