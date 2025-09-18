// src/libs/api/index.ts
// Export API client
export { api, API_BASE_URL, checkApiHealth } from './client';

// Export auth hooks and types
export {
  useLogin,
  useRegister,
  useProfile,
  useLogout,
  useRefreshToken,
  authApi
} from './auth';

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest
} from './auth';

// Export task hooks and types
export {
  useUserTasks,
  useTask,
  useCreateTask,
  useAcknowledgeTask,
  useUpdateTask,
  useDeleteTask,
  tasksApi
} from './tasks';

export type {
  Task,
  CreateTaskRequest,
  AcknowledgeTaskRequest
} from './tasks';

// Export user hooks and types
export {
  useUsers,
  useUser,
  useUpdateUser,
  useDeleteUser,
  useDeviceTokens,
  useRegisterDevice,
  useUnregisterDevice,
  usersApi,
  devicesApi
} from './users';

export type {
  User,
  DeviceToken,
  RegisterDeviceRequest
} from './users';
