// src/components/common/SafeAreaWrapper.tsx
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: edges.includes('top') ? (Platform.OS === 'ios' ? insets.top : 0) : 0,
    paddingBottom: edges.includes('bottom') ? (Platform.OS === 'ios' ? insets.bottom : 0) : 0,
    paddingLeft: edges.includes('left') ? (Platform.OS === 'ios' ? insets.left : 0) : 0,
    paddingRight: edges.includes('right') ? (Platform.OS === 'ios' ? insets.right : 0) : 0,
  };

  const statusBarBg = statusBarBackgroundColor || (Platform.OS === 'ios' ? 'transparent' : backgroundColor);

  return (
    <Box flex={1} bg={backgroundColor} style={[paddingStyle, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBg}
        translucent={Platform.OS === 'ios'}
      />
      {children}
    </Box>
  );
};

export default SafeAreaWrapper;
