// src/features/admin/screens/TaskManagementScreen.tsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  ScrollView,
  RefreshControl,
  Select,
  Icon,
  Fab,
  Badge,
  Spinner,
  Modal,
  FormControl,
  TextArea,
  Switch,
  Alert
} from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react-native';
import { 
  useAllTasks, 
  useTaskStats, 
  useCreateTask, 
  useUpdateTaskStatus, 
  useDeleteTask,
  Task 
} from '../../../libs/api/tasks';
import { useUsers } from '../../../libs/api/users';
import { useAuth } from '../../../app/providers/AuthProvider';
import TaskCard from '../../../components/tasks/TaskCard';
import { QueryError } from '../../../components/common/ErrorBoundary';

export default function TaskManagementScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // API hooks
  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError, 
    refetch: refetchTasks,
    isRefetching: tasksRefetching 
  } = useAllTasks({
    page,
    limit: 20,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    assigneeId: assigneeFilter || undefined
  });

  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useTaskStats();

  const { data: users = [] } = useUsers();

  const createTaskMutation = useCreateTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  // Create task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueAt: '',
    assigneeIds: [] as string[],
    hasGeofence: false,
    geofence: {
      lat: 0,
      lng: 0,
      radiusM: 100
    }
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || newTask.assigneeIds.length === 0) {
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        title: newTask.title,
        description: newTask.description || undefined,
        dueAt: newTask.dueAt || undefined,
        geofence: newTask.hasGeofence ? newTask.geofence : null,
        assigneeIds: newTask.assigneeIds
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueAt: '',
        assigneeIds: [],
        hasGeofence: false,
        geofence: { lat: 0, lng: 0, radiusM: 100 }
      });
      setShowCreateModal(false);
      refetchTasks();
      refetchStats();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ taskId, status });
      refetchTasks();
      refetchStats();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      refetchTasks();
      refetchStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    await Promise.all([refetchTasks(), refetchStats()]);
  }, [refetchTasks, refetchStats]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p={4}>
        <Alert status="error">
          <Alert.Icon />
          <Text>Access denied. Admin privileges required.</Text>
        </Alert>
      </Box>
    );
  }

  if (tasksLoading || statsLoading) {
    return (
      <Box flex={1} bg="gray.50" style={{ paddingTop: insets.top }}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} color="gray.600">Loading task management...</Text>
        </Box>
      </Box>
    );
  }

  if (tasksError) {
    return (
      <Box flex={1} bg="gray.50" style={{ paddingTop: insets.top }}>
        <Box p={4}>
          <QueryError 
            error={tasksError} 
            refetch={refetchTasks} 
            isRefetching={tasksRefetching}
          />
        </Box>
      </Box>
    );
  }

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination;

  return (
    <Box flex={1} bg="gray.50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <VStack space={4} p={4} bg="white" shadow="1">
        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          Task Management
        </Text>

        {/* Stats Cards */}
        {stats && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={3}>
              <Box bg="blue.50" p={3} borderRadius="lg" minW="100">
                <VStack alignItems="center">
                  <Icon as={Clock} color="blue.500" size="sm" />
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    {stats.new_tasks}
                  </Text>
                  <Text fontSize="xs" color="blue.600">New</Text>
                </VStack>
              </Box>
              
              <Box bg="orange.50" p={3} borderRadius="lg" minW="100">
                <VStack alignItems="center">
                  <Icon as={Clock} color="orange.500" size="sm" />
                  <Text fontSize="lg" fontWeight="bold" color="orange.600">
                    {stats.in_progress_tasks}
                  </Text>
                  <Text fontSize="xs" color="orange.600">In Progress</Text>
                </VStack>
              </Box>
              
              <Box bg="green.50" p={3} borderRadius="lg" minW="100">
                <VStack alignItems="center">
                  <Icon as={CheckCircle2} color="green.500" size="sm" />
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {stats.completed_tasks}
                  </Text>
                  <Text fontSize="xs" color="green.600">Completed</Text>
                </VStack>
              </Box>
              
              <Box bg="red.50" p={3} borderRadius="lg" minW="100">
                <VStack alignItems="center">
                  <Icon as={AlertTriangle} color="red.500" size="sm" />
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    {stats.overdue_tasks}
                  </Text>
                  <Text fontSize="xs" color="red.600">Overdue</Text>
                </VStack>
              </Box>
              
              <Box bg="purple.50" p={3} borderRadius="lg" minW="100">
                <VStack alignItems="center">
                  <Icon as={MapPin} color="purple.500" size="sm" />
                  <Text fontSize="lg" fontWeight="bold" color="purple.600">
                    {stats.geofenced_tasks}
                  </Text>
                  <Text fontSize="xs" color="purple.600">Geofenced</Text>
                </VStack>
              </Box>
            </HStack>
          </ScrollView>
        )}

        {/* Search and Filters */}
        <VStack space={3}>
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            InputLeftElement={<Icon as={Search} size="sm" ml={3} color="gray.400" />}
            bg="gray.100"
            borderWidth={0}
            borderRadius="lg"
          />
          
          <HStack space={3}>
            <Select
              flex={1}
              placeholder="Status"
              selectedValue={statusFilter}
              onValueChange={setStatusFilter}
              bg="gray.100"
              borderWidth={0}
              borderRadius="lg"
            >
              <Select.Item label="All Status" value="" />
              <Select.Item label="New" value="NEW" />
              <Select.Item label="In Progress" value="IN_PROGRESS" />
              <Select.Item label="Completed" value="COMPLETED" />
              <Select.Item label="Cancelled" value="CANCELLED" />
            </Select>
            
            <Select
              flex={1}
              placeholder="Assignee"
              selectedValue={assigneeFilter}
              onValueChange={setAssigneeFilter}
              bg="gray.100"
              borderWidth={0}
              borderRadius="lg"
            >
              <Select.Item label="All Users" value="" />
              {users.map(user => (
                <Select.Item 
                  key={user.id} 
                  label={user.email} 
                  value={user.id} 
                />
              ))}
            </Select>
          </HStack>
        </VStack>
      </VStack>

      {/* Task List */}
      <ScrollView
        flex={1}
        p={4}
        refreshControl={
          <RefreshControl refreshing={tasksRefetching} onRefresh={onRefresh} />
        }
      >
        {tasks.length === 0 ? (
          <Box flex={1} justifyContent="center" alignItems="center" py={20}>
            <Icon as={CheckCircle2} size="xl" color="gray.400" mb={4} />
            <Text fontSize="lg" color="gray.500" textAlign="center">
              No tasks found
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center" mt={2}>
              Create your first task to get started
            </Text>
          </Box>
        ) : (
          <VStack space={3}>
            {tasks.map(task => (
              <Box key={task.id} position="relative">
                <TaskCard
                  task={task}
                  showAssignees={true}
                  showDistance={false}
                />
                
                {/* Admin Actions */}
                <HStack 
                  position="absolute" 
                  top={2} 
                  right={2} 
                  space={1}
                >
                  <Button
                    size="xs"
                    variant="ghost"
                    onPress={() => {
                      // Edit task functionality
                      console.log('Edit task:', task.id);
                    }}
                  >
                    <Icon as={Edit} size="xs" color="blue.500" />
                  </Button>
                  
                  <Button
                    size="xs"
                    variant="ghost"
                    onPress={() => handleDeleteTask(task.id)}
                    isLoading={deleteTaskMutation.isLoading}
                  >
                    <Icon as={Trash2} size="xs" color="red.500" />
                  </Button>
                </HStack>
              </Box>
            ))}
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <HStack justifyContent="space-between" alignItems="center" mt={4}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  isDisabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                
                <Text fontSize="sm" color="gray.600">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setPage(p => p + 1)}
                  isDisabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        )}
      </ScrollView>

      {/* Create Task FAB */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon as={Plus} size="sm" color="white" />}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="full">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Create New Task</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label>Title</FormControl.Label>
                <Input
                  value={newTask.title}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                  placeholder="Enter task title"
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Description</FormControl.Label>
                <TextArea
                  value={newTask.description}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
                  placeholder="Enter task description"
                  h={20}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Due Date</FormControl.Label>
                <Input
                  value={newTask.dueAt}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, dueAt: text }))}
                  placeholder="YYYY-MM-DD HH:MM:SS"
                />
              </FormControl>

              <FormControl isRequired>
                <FormControl.Label>Assignees</FormControl.Label>
                <Select
                  selectedValue=""
                  placeholder="Select users to assign"
                  onValueChange={(userId) => {
                    if (userId && !newTask.assigneeIds.includes(userId)) {
                      setNewTask(prev => ({
                        ...prev,
                        assigneeIds: [...prev.assigneeIds, userId]
                      }));
                    }
                  }}
                >
                  {users.filter(u => !newTask.assigneeIds.includes(u.id)).map(user => (
                    <Select.Item key={user.id} label={user.email} value={user.id} />
                  ))}
                </Select>
                
                {newTask.assigneeIds.length > 0 && (
                  <VStack space={1} mt={2}>
                    {newTask.assigneeIds.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <HStack key={userId} justifyContent="space-between" alignItems="center">
                          <Text fontSize="sm">{user?.email}</Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onPress={() => {
                              setNewTask(prev => ({
                                ...prev,
                                assigneeIds: prev.assigneeIds.filter(id => id !== userId)
                              }));
                            }}
                          >
                            Remove
                          </Button>
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </FormControl>

              <FormControl>
                <HStack justifyContent="space-between" alignItems="center">
                  <FormControl.Label>Add Geofence</FormControl.Label>
                  <Switch
                    isChecked={newTask.hasGeofence}
                    onToggle={(value) => setNewTask(prev => ({ ...prev, hasGeofence: value }))}
                  />
                </HStack>
              </FormControl>

              {newTask.hasGeofence && (
                <VStack space={3}>
                  <HStack space={3}>
                    <FormControl flex={1}>
                      <FormControl.Label>Latitude</FormControl.Label>
                      <Input
                        value={newTask.geofence.lat.toString()}
                        onChangeText={(text) => setNewTask(prev => ({
                          ...prev,
                          geofence: { ...prev.geofence, lat: parseFloat(text) || 0 }
                        }))}
                        placeholder="0.0"
                        keyboardType="numeric"
                      />
                    </FormControl>
                    
                    <FormControl flex={1}>
                      <FormControl.Label>Longitude</FormControl.Label>
                      <Input
                        value={newTask.geofence.lng.toString()}
                        onChangeText={(text) => setNewTask(prev => ({
                          ...prev,
                          geofence: { ...prev.geofence, lng: parseFloat(text) || 0 }
                        }))}
                        placeholder="0.0"
                        keyboardType="numeric"
                      />
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormControl.Label>Radius (meters)</FormControl.Label>
                    <Input
                      value={newTask.geofence.radiusM.toString()}
                      onChangeText={(text) => setNewTask(prev => ({
                        ...prev,
                        geofence: { ...prev.geofence, radiusM: parseInt(text) || 100 }
                      }))}
                      placeholder="100"
                      keyboardType="numeric"
                    />
                  </FormControl>
                </VStack>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onPress={handleCreateTask}
                isLoading={createTaskMutation.isLoading}
                isDisabled={!newTask.title.trim() || newTask.assigneeIds.length === 0}
              >
                Create Task
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}
