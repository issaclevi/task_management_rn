import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { appTheme } from '../../ui/theme';
export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) =>
  <NativeBaseProvider theme={appTheme}>{children}</NativeBaseProvider>;
