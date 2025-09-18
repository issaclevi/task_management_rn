import React from 'react';
import {
    Box, VStack, HStack, Heading, Text, Pressable, Icon,
    Badge, FlatList, Avatar
} from 'native-base';
import { RefreshControl, Platform } from 'react-native';
import {
    Bell, Calendar, Users, CheckCircle2, Clock, AlertCircle, Plus
} from 'lucide-react-native';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useUserTasks, Task } from '../../../libs/api/tasks';
import { useUsers } from '../../../libs/api/users';

import { EmptyState, LoadingState } from '../../../components/ui';
import { QueryError } from '../../../components/common/ErrorBoundary';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';

/* -------------------- Small components -------------------- */
function StatusBadge({ status }: { status: string }) {
    const map = {
        NEW: { bg: '#F3E8FF', color: '#9333EA', label: 'New' },
        IN_PROGRESS: { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
        COMPLETED: { bg: '#EAFBEA', color: '#10B981', label: 'Completed' },
        CANCELLED: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
    } as const;
    const s = map[status as keyof typeof map] || map.NEW;
    return (
        <Badge rounded="sm" bg={s.bg} _text={{ color: s.color, fontWeight: 'bold', fontSize: 'xs' }}>
            {s.label}
        </Badge>
    );
}



function TaskCard({ task }: { task: Task }) {
    const navigation = useNavigation();
    const dueDate = task.due_at ? new Date(task.due_at) : null;

    return (
        <Pressable onPress={() => navigation.navigate('Tasks' as never)}>
            <Box
                borderRadius="lg"
                bg="white"
                shadow="2"
                p={4}
                mb={4}
                mx={4}
                borderLeftWidth="4"
                borderLeftColor="blue.500"
            >
                <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1} space={1}>
                        <Heading size="sm" color="gray.800" numberOfLines={1}>
                            {task.title}
                        </Heading>
                        {task.description && (
                            <Text fontSize="xs" color="gray.600" numberOfLines={2}>
                                {task.description}
                            </Text>
                        )}
                    </VStack>

                    {/* Status Badge */}
                    <StatusBadge status={task.status} />
                </HStack>

                {/* Footer row with icons */}
                <HStack mt={3} space={4} alignItems="center">
                    <HStack space={1} alignItems="center">
                        <Calendar size={14} color="#6B7280" />
                        <Text fontSize="xs" color="gray.500">
                            {dueDate
                                ? `${dueDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}, ${dueDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`
                                : "No due date"}
                        </Text>
                    </HStack>
                </HStack>
            </Box>
        </Pressable>
    );
}

function OverviewTile({ label, count, icon, bg, tint }: {
    label: string;
    count: number;
    icon: any;
    bg: string;
    tint: string;
}) {
    return (
        <Box bg={bg} borderRadius="xl" p="4">
            <HStack alignItems="center" justifyContent="space-between" space={2}>
                <Icon as={icon} color={tint} />
                <Text color="muted.500" fontSize="xs">{count} tasks</Text>
            </HStack>
            <Heading mt="3" size="sm" color="muted.900">{label}</Heading>
        </Box>
    );
}

/* -------------------- Screen -------------------- */
export default function HomeScreen() {

    const navigation = useNavigation();
    const { user } = useAuth();
    const { data: tasks = [], isLoading, error, refetch, isRefetching } = useUserTasks();

    const { data: users = [] } = useUsers();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    // Calculate task statistics
    const taskStats = React.useMemo(() => {
        if (!Array.isArray(tasks)) {
            return { newTasks: 0, inProgress: 0, completed: 0, overdue: 0 };
        }

        const newTasks = tasks.filter((t: Task) => t.status === 'NEW').length;
        const inProgress = tasks.filter((t: Task) => t.status === 'IN_PROGRESS').length;
        const completed = tasks.filter((t: Task) => t.status === 'COMPLETED').length;
        const overdue = tasks.filter((t: Task) => {
            if (!t.due_at) return false;
            return new Date(t.due_at) < new Date() && t.status !== 'COMPLETED';
        }).length;

        return { newTasks, inProgress, completed, overdue };
    }, [tasks]);

    const recentTasks = Array.isArray(tasks) ? tasks : [];

    if (isLoading) {
        return (
            <ScreenWrapper>
                <LoadingState message="Loading dashboard..." />
            </ScreenWrapper>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <ScreenWrapper>
                <Box p={4}>
                    <QueryError
                        error={error}
                        refetch={refetch}
                        isRefetching={isRefetching}
                    />
                </Box>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            scrollable={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 24 : 16 }}
        >
            {/* Header */}
            <HStack px="4" pt="2" pb="3" alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space="3">
                    <Avatar size="md" bg="primary.500" _text={{ color: 'white' }}>
                        {user?.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <VStack>
                        <Text color="muted.500">Welcome back</Text>
                        <Text fontSize="sm" fontWeight="medium">{user?.email || 'User'}</Text>
                    </VStack>
                </HStack>
                <Pressable onPress={() => navigation.navigate('NotificationList' as never)}>
                    <Icon as={Bell} size="lg" color="muted.700" />
                </Pressable>
            </HStack>

            {/* Overview */}
            <HStack px="4" mt="6" mb="2" alignItems="center" justifyContent="space-between">
                <Heading size="sm">Overview</Heading>
                {user?.role === 'ADMIN' && (
                    <Pressable onPress={() => navigation.navigate('Admin' as never)}>
                        <Text color="#6A5AE0">Admin Panel</Text>
                    </Pressable>
                )}
            </HStack>

            <VStack px="4" space="3">
                <HStack space="3">
                    <Box flex={1}>
                        <OverviewTile
                            label="New Tasks"
                            count={taskStats.newTasks}
                            icon={Clock}
                            bg="#E0F2FE"
                            tint="#0284C7"
                        />
                    </Box>
                    <Box flex={1}>
                        <OverviewTile
                            label="In Progress"
                            count={taskStats.inProgress}
                            icon={Users}
                            bg="#FEF3C7"
                            tint="#D97706"
                        />
                    </Box>
                </HStack>
                <HStack space="3">
                    <Box flex={1}>
                        <OverviewTile
                            label="Completed"
                            count={taskStats.completed}
                            icon={CheckCircle2}
                            bg="#EAFBEA"
                            tint="#10B981"
                        />
                    </Box>
                    <Box flex={1}>
                        <OverviewTile
                            label="Overdue"
                            count={taskStats.overdue}
                            icon={AlertCircle}
                            bg="#FEE2E2"
                            tint="#DC2626"
                        />
                    </Box>
                </HStack>
            </VStack>

            <HStack px="4" mb="2" mt="6" alignItems="center" overflow={"hidden"} justifyContent="space-between">
                <Heading size="sm">Recent Tasks</Heading>
                <Pressable onPress={() => navigation.navigate('Tasks' as never)}>
                    <Text color="#6A5AE0">View All</Text>
                </Pressable>
            </HStack>

            {recentTasks.length > 0 ? (
                <FlatList
                    data={recentTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TaskCard task={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                />

            ) : (
                <Box px="4">
                    <EmptyState
                        title="No tasks yet"
                        icon={<Calendar size={32} color="#9CA3AF" />}
                    />
                </Box>
            )}


            {/* Quick Actions */}
            {user?.role === 'ADMIN' && (
                <>
                    <HStack px="4" mt="6" mb="2" alignItems="center" justifyContent="space-between">
                        <Heading size="sm">Quick Actions</Heading>
                    </HStack>

                    <VStack px="4" space="3">
                        <Pressable onPress={() => navigation.navigate('Admin' as never)}>
                            <Box bg="primary.50" borderRadius="xl" p="4">
                                <HStack alignItems="center" space="3">
                                    <Icon as={Plus} color="primary.500" />
                                    <Text fontWeight="medium" color="primary.500">Create New Task</Text>
                                </HStack>
                            </Box>
                        </Pressable>
                    </VStack>
                </>
            )}
        </ScreenWrapper>
    );
}
