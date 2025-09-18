// src/components/tasks/TaskCard.tsx
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Pressable,
  Progress,
  Avatar
} from 'native-base';
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  User,
  Calendar,
  Navigation
} from 'lucide-react-native';
import { Task } from '../../libs/api/tasks';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  showAssignees?: boolean;
  showDistance?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  showAssignees = false,
  showDistance = false
}) => {
  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'NEW':
        return { color: 'blue', bg: 'blue.50', label: 'New', icon: Clock };
      case 'IN_PROGRESS':
        return { color: 'orange', bg: 'orange.50', label: 'In Progress', icon: Clock };
      case 'COMPLETED':
        return { color: 'green', bg: 'green.50', label: 'Completed', icon: CheckCircle2 };
      case 'CANCELLED':
        return { color: 'red', bg: 'red.50', label: 'Cancelled', icon: AlertTriangle };
      default:
        return { color: 'gray', bg: 'gray.50', label: 'Unknown', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'COMPLETED';
  const hasGeofence = task.geofence_center;
  const isWithinGeofence = task.within_geofence;

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24 && diffInHours > -24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <Pressable onPress={onPress}>
      <Box
        bg="white"
        borderRadius="xl"
        shadow="2"
        p={4}
        mb={3}
        borderWidth={hasGeofence && !isWithinGeofence ? 2 : 1}
        borderColor={
          hasGeofence && !isWithinGeofence 
            ? 'red.300' 
            : isOverdue 
              ? 'orange.300' 
              : 'gray.200'
        }
      >
        <VStack space={3}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space={1}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" numberOfLines={2}>
                {task.title}
              </Text>
              {task.description && (
                <Text fontSize="sm" color="gray.600" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
            </VStack>
            
            <Badge
              colorScheme={statusConfig.color}
              variant="subtle"
              borderRadius="full"
              px={3}
              py={1}
            >
              <HStack space={1} alignItems="center">
                <Icon as={statusConfig.icon} size="xs" color={`${statusConfig.color}.600`} />
                <Text fontSize="xs" fontWeight="bold" color={`${statusConfig.color}.600`}>
                  {statusConfig.label}
                </Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Metadata */}
          <VStack space={2}>
            {/* Due date and time info */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={2} alignItems="center" flex={1}>
                {task.due_at && (
                  <HStack space={1} alignItems="center">
                    <Icon 
                      as={Calendar} 
                      size="xs" 
                      color={isOverdue ? 'red.500' : 'gray.500'} 
                    />
                    <Text 
                      fontSize="xs" 
                      color={isOverdue ? 'red.500' : 'gray.500'}
                      fontWeight={isOverdue ? 'bold' : 'normal'}
                    >
                      {formatDate(task.due_at)}
                    </Text>
                    {isOverdue && (
                      <Badge colorScheme="red" variant="solid" size="sm">
                        Overdue
                      </Badge>
                    )}
                  </HStack>
                )}
              </HStack>

              {task.created_by_email && (
                <HStack space={1} alignItems="center">
                  <Icon as={User} size="xs" color="gray.400" />
                  <Text fontSize="xs" color="gray.500">
                    {task.created_by_email.split('@')[0]}
                  </Text>
                </HStack>
              )}
            </HStack>

            {/* Geofence and distance info */}
            {hasGeofence && (
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center" flex={1}>
                  <Icon 
                    as={MapPin} 
                    size="xs" 
                    color={isWithinGeofence ? 'green.500' : 'red.500'} 
                  />
                  <Text fontSize="xs" color="gray.600">
                    Geofenced ({task.geofence_radius_m}m radius)
                  </Text>
                  <Badge
                    colorScheme={isWithinGeofence ? 'green' : 'red'}
                    variant="subtle"
                    size="sm"
                  >
                    {isWithinGeofence ? 'Inside' : 'Outside'}
                  </Badge>
                </HStack>

                {showDistance && task.distance_meters !== undefined && (
                  <HStack space={1} alignItems="center">
                    <Icon as={Navigation} size="xs" color="blue.500" />
                    <Text fontSize="xs" color="blue.600" fontWeight="bold">
                      {formatDistance(task.distance_meters)}
                    </Text>
                  </HStack>
                )}
              </HStack>
            )}

            {/* Assignees */}
            {showAssignees && task.assignees && task.assignees.length > 0 && (
              <HStack space={2} alignItems="center">
                <Text fontSize="xs" color="gray.500">Assigned to:</Text>
                <HStack space={1}>
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    <Avatar
                      key={assignee.user_id}
                      size="xs"
                      bg={`${['blue', 'green', 'purple', 'orange'][index % 4]}.500`}
                      _text={{ fontSize: 'xs', color: 'white' }}
                    >
                      {assignee.email.charAt(0).toUpperCase()}
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <Text fontSize="xs" color="gray.500">
                      +{task.assignees.length - 3} more
                    </Text>
                  )}
                </HStack>
              </HStack>
            )}

            {/* Progress indicator for acknowledged tasks */}
            {task.acknowledged_at && task.status === 'IN_PROGRESS' && (
              <VStack space={1}>
                <HStack justifyContent="space-between">
                  <Text fontSize="xs" color="gray.500">Progress</Text>
                  <Text fontSize="xs" color="orange.600" fontWeight="bold">
                    In Progress
                  </Text>
                </HStack>
                <Progress value={50} colorScheme="orange" size="sm" />
              </VStack>
            )}
          </VStack>

          {/* Action indicators */}
          {!task.acknowledged_at && task.status === 'NEW' && (
            <Box bg="blue.50" p={2} borderRadius="md">
              <HStack space={2} alignItems="center">
                <Icon as={AlertTriangle} size="sm" color="blue.500" />
                <Text fontSize="xs" color="blue.700" fontWeight="bold">
                  Tap to acknowledge this task
                </Text>
              </HStack>
            </Box>
          )}

          {hasGeofence && !isWithinGeofence && task.status === 'NEW' && (
            <Box bg="red.50" p={2} borderRadius="md">
              <HStack space={2} alignItems="center">
                <Icon as={MapPin} size="sm" color="red.500" />
                <Text fontSize="xs" color="red.700" fontWeight="bold">
                  Move closer to the location to acknowledge
                </Text>
              </HStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
};

export default TaskCard;
