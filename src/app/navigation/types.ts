// src/app/navigation/types.ts
export type AuthStackParamList = { Login: undefined };

export type AppTabsParamList = {
  Home: undefined;
  Tasks: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Main: undefined;
  TaskModal: { taskId?: string };
};
