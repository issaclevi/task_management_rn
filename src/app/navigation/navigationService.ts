import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigationService = {
  navigate(name: string, params?: any) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as never, params as never);
    }
  },

  goBack() {
    if (navigationRef.isReady()) {
      navigationRef.goBack();
    }
  },

  reset(state: any) {
    if (navigationRef.isReady()) {
      navigationRef.reset(state);
    }
  },

  getCurrentRoute() {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },
};
