// src/components/common/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Box, VStack, HStack, Skeleton } from 'native-base';

interface SkeletonLoaderProps {
  variant?: 'task-card' | 'task-list' | 'stats' | 'user-list' | 'map' | 'custom';
  count?: number;
  animated?: boolean;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'task-card',
  count = 1,
  animated = true,
  children
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const opacity = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      })
    : 0.5;

  const renderTaskCardSkeleton = () => (
    <Box
      bg="white"
      borderRadius="xl"
      shadow="2"
      p={4}
      mb={3}
      borderWidth={1}
      borderColor="gray.200"
    >
      <VStack space={3}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex={1} space={2}>
            <Skeleton h="5" w="80%" borderRadius="md" />
            <Skeleton h="4" w="60%" borderRadius="md" />
          </VStack>
          <Skeleton h="6" w="16" borderRadius="full" />
        </HStack>

        {/* Metadata */}
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center" flex={1}>
              <Skeleton h="4" w="4" borderRadius="full" />
              <Skeleton h="3" w="20" borderRadius="md" />
            </HStack>
            <HStack space={1} alignItems="center">
              <Skeleton h="4" w="4" borderRadius="full" />
              <Skeleton h="3" w="16" borderRadius="md" />
            </HStack>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center" flex={1}>
              <Skeleton h="4" w="4" borderRadius="full" />
              <Skeleton h="3" w="24" borderRadius="md" />
              <Skeleton h="5" w="12" borderRadius="full" />
            </HStack>
            <HStack space={1} alignItems="center">
              <Skeleton h="4" w="4" borderRadius="full" />
              <Skeleton h="3" w="10" borderRadius="md" />
            </HStack>
          </HStack>
        </VStack>

        {/* Action indicator */}
        <Skeleton h="8" w="full" borderRadius="md" />
      </VStack>
    </Box>
  );

  const renderTaskListSkeleton = () => (
    <VStack space={4}>
      {/* Header */}
      <VStack space={3}>
        <Skeleton h="8" w="40%" borderRadius="md" />
        <HStack space={2}>
          <Skeleton h="10" flex={1} borderRadius="lg" />
          <Skeleton h="10" w="20" borderRadius="lg" />
        </HStack>
        <HStack space={3}>
          <Skeleton h="10" flex={1} borderRadius="lg" />
          <Skeleton h="10" flex={1} borderRadius="lg" />
        </HStack>
      </VStack>

      {/* Task cards */}
      <VStack space={3}>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index}>{renderTaskCardSkeleton()}</Box>
        ))}
      </VStack>
    </VStack>
  );

  const renderStatsSkeleton = () => (
    <HStack space={3} justifyContent="space-around">
      {Array.from({ length: 5}).map((_, index) => (
        <Box key={index} bg="gray.50" p={3} borderRadius="lg" minW="16" alignItems="center">
          <Skeleton h="6" w="6" borderRadius="full" mb={2} />
          <Skeleton h="6" w="8" borderRadius="md" mb={1} />
          <Skeleton h="3" w="12" borderRadius="md" />
        </Box>
      ))}
    </HStack>
  );

  const renderUserListSkeleton = () => (
    <VStack space={3}>
      {Array.from({ length: count }).map((_, index) => (
        <HStack key={index} space={3} alignItems="center" p={3} bg="white" borderRadius="lg">
          <Skeleton h="12" w="12" borderRadius="full" />
          <VStack flex={1} space={1}>
            <Skeleton h="4" w="60%" borderRadius="md" />
            <Skeleton h="3" w="40%" borderRadius="md" />
          </VStack>
          <Skeleton h="6" w="16" borderRadius="full" />
        </HStack>
      ))}
    </VStack>
  );

  const renderMapSkeleton = () => (
    <Box flex={1} bg="gray.100" position="relative">
      {/* Map placeholder */}
      <Box flex={1} bg="gray.200" />
      
      {/* Controls skeleton */}
      <VStack position="absolute" top={4} right={4} space={2}>
        <Skeleton h="10" w="10" borderRadius="full" />
      </VStack>
      
      {/* Legend skeleton */}
      <Box position="absolute" bottom={4} left={4} bg="white" p={3} borderRadius="lg">
        <VStack space={2}>
          <Skeleton h="4" w="16" borderRadius="md" />
          {Array.from({ length: 4 }).map((_, index) => (
            <HStack key={index} space={2} alignItems="center">
              <Skeleton h="3" w="3" borderRadius="full" />
              <Skeleton h="3" w="20" borderRadius="md" />
            </HStack>
          ))}
        </VStack>
      </Box>
      
      {/* FAB skeleton */}
      <VStack position="absolute" bottom={4} right={4} space={2}>
        <Skeleton h="12" w="12" borderRadius="full" />
        <Skeleton h="12" w="12" borderRadius="full" />
      </VStack>
    </Box>
  );

  const renderCustomSkeleton = () => children;

  const renderSkeleton = () => {
    switch (variant) {
      case 'task-card':
        return Array.from({ length: count }).map((_, index) => (
          <Box key={index}>{renderTaskCardSkeleton()}</Box>
        ));
      case 'task-list':
        return renderTaskListSkeleton();
      case 'stats':
        return renderStatsSkeleton();
      case 'user-list':
        return renderUserListSkeleton();
      case 'map':
        return renderMapSkeleton();
      case 'custom':
        return renderCustomSkeleton();
      default:
        return renderTaskCardSkeleton();
    }
  };

  if (animated) {
    return (
      <Animated.View style={{ opacity }}>
        {renderSkeleton()}
      </Animated.View>
    );
  }

  return <>{renderSkeleton()}</>;
};

// Specific skeleton components for common use cases
export const TaskCardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <SkeletonLoader variant="task-card" count={count} />
);

export const TaskListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <SkeletonLoader variant="task-list" count={count} />
);

export const StatsSkeleton: React.FC = () => (
  <SkeletonLoader variant="stats" />
);

export const UserListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <SkeletonLoader variant="user-list" count={count} />
);

export const MapSkeleton: React.FC = () => (
  <SkeletonLoader variant="map" />
);

// Loading states for different screens
export const TaskScreenSkeleton: React.FC = () => (
  <Box flex={1} bg="gray.50" p={4}>
    <VStack space={4}>
      {/* Header skeleton */}
      <VStack space={3}>
        <Skeleton h="8" w="40%" borderRadius="md" />
        <StatsSkeleton />
      </VStack>
      
      {/* Search and filters skeleton */}
      <VStack space={3}>
        <Skeleton h="10" w="full" borderRadius="lg" />
        <HStack space={3}>
          <Skeleton h="10" flex={1} borderRadius="lg" />
          <Skeleton h="10" w="20" borderRadius="lg" />
        </HStack>
      </VStack>
      
      {/* Task cards skeleton */}
      <TaskCardSkeleton count={3} />
    </VStack>
  </Box>
);

export const AdminDashboardSkeleton: React.FC = () => (
  <Box flex={1} bg="gray.50" p={4}>
    <VStack space={4}>
      {/* Header */}
      <Skeleton h="8" w="50%" borderRadius="md" />
      
      {/* Stats */}
      <StatsSkeleton />
      
      {/* Filters */}
      <VStack space={3}>
        <Skeleton h="10" w="full" borderRadius="lg" />
        <HStack space={3}>
          <Skeleton h="10" flex={1} borderRadius="lg" />
          <Skeleton h="10" flex={1} borderRadius="lg" />
        </HStack>
      </VStack>
      
      {/* Task management cards */}
      <VStack space={3}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} position="relative">
            {renderTaskCardSkeleton()}
            {/* Admin action buttons */}
            <HStack position="absolute" top={2} right={2} space={1}>
              <Skeleton h="6" w="6" borderRadius="md" />
              <Skeleton h="6" w="6" borderRadius="md" />
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  </Box>
);

export default SkeletonLoader;
