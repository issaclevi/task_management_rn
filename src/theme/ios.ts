// src/theme/ios.ts
import { Platform } from 'react-native';

// iOS-specific design constants
export const iosDesign = {
  // Typography
  typography: {
    title1: {
      fontSize: Platform.OS === 'ios' ? 28 : 24,
      fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
      lineHeight: Platform.OS === 'ios' ? 34 : 32,
    },
    title2: {
      fontSize: Platform.OS === 'ios' ? 22 : 20,
      fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
      lineHeight: Platform.OS === 'ios' ? 28 : 26,
    },
    title3: {
      fontSize: Platform.OS === 'ios' ? 20 : 18,
      fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
      lineHeight: Platform.OS === 'ios' ? 25 : 24,
    },
    headline: {
      fontSize: Platform.OS === 'ios' ? 17 : 16,
      fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
      lineHeight: Platform.OS === 'ios' ? 22 : 20,
    },
    body: {
      fontSize: Platform.OS === 'ios' ? 17 : 16,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 22 : 20,
    },
    callout: {
      fontSize: Platform.OS === 'ios' ? 16 : 15,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 21 : 19,
    },
    subhead: {
      fontSize: Platform.OS === 'ios' ? 15 : 14,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 20 : 18,
    },
    footnote: {
      fontSize: Platform.OS === 'ios' ? 13 : 12,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 18 : 16,
    },
    caption1: {
      fontSize: Platform.OS === 'ios' ? 12 : 11,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 16 : 14,
    },
    caption2: {
      fontSize: Platform.OS === 'ios' ? 11 : 10,
      fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
      lineHeight: Platform.OS === 'ios' ? 13 : 12,
    },
  },

  // Spacing
  spacing: {
    xs: Platform.OS === 'ios' ? 4 : 4,
    sm: Platform.OS === 'ios' ? 8 : 8,
    md: Platform.OS === 'ios' ? 16 : 16,
    lg: Platform.OS === 'ios' ? 24 : 20,
    xl: Platform.OS === 'ios' ? 32 : 28,
    xxl: Platform.OS === 'ios' ? 48 : 40,
  },

  // Border radius
  borderRadius: {
    sm: Platform.OS === 'ios' ? 8 : 4,
    md: Platform.OS === 'ios' ? 12 : 8,
    lg: Platform.OS === 'ios' ? 16 : 12,
    xl: Platform.OS === 'ios' ? 20 : 16,
  },

  // Shadows
  shadows: {
    small: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    } : {
      elevation: 2,
    },
    medium: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    } : {
      elevation: 4,
    },
    large: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    } : {
      elevation: 8,
    },
  },

  // Navigation
  navigation: {
    headerHeight: Platform.OS === 'ios' ? 44 : 56,
    tabBarHeight: Platform.OS === 'ios' ? 49 : 56,
    headerTitleStyle: {
      fontSize: Platform.OS === 'ios' ? 17 : 18,
      fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
      color: '#1F2937',
    },
    headerStyle: {
      backgroundColor: '#FFFFFF',
      ...(Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      } : {
        elevation: 4,
      }),
    },
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      ...(Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      } : {
        elevation: 8,
      }),
    },
    tabBarLabelStyle: {
      fontSize: Platform.OS === 'ios' ? 11 : 12,
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
      marginTop: Platform.OS === 'ios' ? 2 : 4,
    },
  },

  // Colors
  colors: {
    primary: '#6A5AE0',
    secondary: '#0EA5E9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
    border: {
      light: '#F3F4F6',
      medium: '#E5E7EB',
      dark: '#D1D5DB',
    },
  },

  // Button styles
  button: {
    primary: {
      backgroundColor: '#6A5AE0',
      borderRadius: Platform.OS === 'ios' ? 12 : 8,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
      ...(Platform.OS === 'ios' ? {
        shadowColor: '#6A5AE0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      } : {
        elevation: 3,
      }),
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#6A5AE0',
      borderRadius: Platform.OS === 'ios' ? 12 : 8,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      paddingHorizontal: Platform.OS === 'ios' ? 20 : 16,
    },
  },

  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    padding: Platform.OS === 'ios' ? 20 : 16,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    } : {
      elevation: 4,
    }),
  },

  // Input styles
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 14,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    color: '#1F2937',
  },
};

// Helper functions
export const getIOSStyle = (style: keyof typeof iosDesign) => {
  return iosDesign[style];
};

export const getIOSSpacing = (size: keyof typeof iosDesign.spacing) => {
  return iosDesign.spacing[size];
};

export const getIOSTypography = (variant: keyof typeof iosDesign.typography) => {
  return iosDesign.typography[variant];
};

export const getIOSShadow = (size: keyof typeof iosDesign.shadows) => {
  return iosDesign.shadows[size];
};

// Safe area utilities
export const getSafeAreaStyle = (insets: { top: number; bottom: number; left: number; right: number }) => ({
  paddingTop: Platform.OS === 'ios' ? insets.top : 0,
  paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
  paddingLeft: Platform.OS === 'ios' ? insets.left : 0,
  paddingRight: Platform.OS === 'ios' ? insets.right : 0,
});

export const getTabBarHeight = (bottomInset: number) => {
  if (Platform.OS === 'ios') {
    return 49 + bottomInset;
  }
  return 56;
};

export const getHeaderHeight = (topInset: number) => {
  if (Platform.OS === 'ios') {
    return 44 + topInset;
  }
  return 56;
};

export default iosDesign;
