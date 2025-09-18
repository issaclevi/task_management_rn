// src/components/common/ScreenWrapper.tsx
import React from 'react';
import { Platform, StatusBar, ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  scrollable?: boolean;
  refreshControl?: React.ReactElement;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
  safeArea?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  scrollable = false,
  refreshControl,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  safeArea = true,
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle = safeArea ? {
    paddingTop: edges.includes('top') ? (Platform.OS === 'ios' ? insets.top : 0) : 0,
    paddingBottom: edges.includes('bottom') ? (Platform.OS === 'ios' ? insets.bottom : 0) : 0,
    paddingLeft: edges.includes('left') ? (Platform.OS === 'ios' ? insets.left : 0) : 0,
    paddingRight: edges.includes('right') ? (Platform.OS === 'ios' ? insets.right : 0) : 0,
  } : {};

  const statusBarBg = statusBarBackgroundColor || (Platform.OS === 'ios' ? 'transparent' : backgroundColor);

  const content = (
    <View style={styles.content}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBg}
        translucent={Platform.OS === 'ios'}
      />
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={refreshControl}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingBottom: Platform.OS === 'ios' ? 16 : 8,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={Platform.OS === 'ios'}
        >
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, paddingStyle, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default ScreenWrapper;
