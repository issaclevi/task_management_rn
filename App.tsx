import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { LoadingProvider } from './src/app/providers/LoadingProvider';
import RootNavigator from './src/app/navigation/RootNavigator';
import { navigationRef } from './src/app/navigation/navigationService';
import { oneSignalService } from './src/libs/push/oneSignalService';
import { theme } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Set navigation reference for OneSignal
    oneSignalService.setNavigationRef(navigationRef);
  }, []);

  return (
    <SafeAreaProvider>
      <NativeBaseProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            <AuthProvider>
              <NavigationContainer ref={navigationRef}>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={Platform.OS === 'ios' ? 'transparent' : '#FFFFFF'}
                  translucent={Platform.OS === 'ios'}
                />
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </LoadingProvider>
        </QueryClientProvider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}

export default App;