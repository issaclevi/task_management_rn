// src/theme/index.ts
import { extendTheme } from 'native-base';
import { Platform } from 'react-native';

// Custom color palette
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Typography configuration
const fonts = {
  heading: Platform.OS === 'ios' ? 'System' : 'Roboto',
  body: Platform.OS === 'ios' ? 'System' : 'Roboto',
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};

const fontSizes = {
  '2xs': Platform.OS === 'ios' ? 11 : 10,
  xs: Platform.OS === 'ios' ? 12 : 12,
  sm: Platform.OS === 'ios' ? 15 : 14,
  md: Platform.OS === 'ios' ? 17 : 16,
  lg: Platform.OS === 'ios' ? 20 : 18,
  xl: Platform.OS === 'ios' ? 22 : 20,
  '2xl': Platform.OS === 'ios' ? 28 : 24,
  '3xl': Platform.OS === 'ios' ? 34 : 30,
  '4xl': Platform.OS === 'ios' ? 41 : 36,
  '5xl': Platform.OS === 'ios' ? 48 : 48,
  '6xl': Platform.OS === 'ios' ? 60 : 60,
  '7xl': Platform.OS === 'ios' ? 72 : 72,
  '8xl': Platform.OS === 'ios' ? 96 : 96,
  '9xl': Platform.OS === 'ios' ? 128 : 128,
};

const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: Platform.OS === 'ios' ? 500 : 500,
  semibold: Platform.OS === 'ios' ? 600 : 600,
  bold: Platform.OS === 'ios' ? 700 : 700,
  extrabold: 800,
  black: 900,
};

// Spacing configuration
const space = {
  px: '1px',
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Border radius configuration
const radii = {
  none: 0,
  sm: Platform.OS === 'ios' ? 6 : 4,
  base: Platform.OS === 'ios' ? 8 : 6,
  md: Platform.OS === 'ios' ? 10 : 8,
  lg: Platform.OS === 'ios' ? 12 : 10,
  xl: Platform.OS === 'ios' ? 16 : 12,
  '2xl': Platform.OS === 'ios' ? 20 : 16,
  '3xl': Platform.OS === 'ios' ? 28 : 24,
  full: 9999,
};

// Shadow configuration
const shadows = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 5,
  },
};

// Component configurations
const components = {
  Button: {
    baseStyle: {
      borderRadius: Platform.OS === 'ios' ? 'xl' : 'lg',
      _text: {
        fontWeight: Platform.OS === 'ios' ? '600' : 'semibold',
        fontSize: Platform.OS === 'ios' ? 'md' : 'sm',
      },
    },
    variants: {
      solid: {
        bg: 'primary.500',
        _pressed: {
          bg: 'primary.600',
          transform: Platform.OS === 'ios' ? [{ scale: 0.98 }] : [],
        },
        _text: {
          color: 'white',
        },
        ...(Platform.OS === 'ios' && {
          shadow: 2,
        }),
      },
      outline: {
        borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
        borderColor: 'primary.500',
        bg: 'transparent',
        _pressed: {
          bg: 'primary.50',
          transform: Platform.OS === 'ios' ? [{ scale: 0.98 }] : [],
        },
        _text: {
          color: 'primary.500',
        },
      },
      ghost: {
        bg: 'transparent',
        _pressed: {
          bg: 'primary.50',
          transform: Platform.OS === 'ios' ? [{ scale: 0.98 }] : [],
        },
        _text: {
          color: 'primary.500',
        },
      },
    },
    sizes: {
      sm: {
        px: Platform.OS === 'ios' ? 4 : 3,
        py: Platform.OS === 'ios' ? 3 : 2,
        _text: {
          fontSize: Platform.OS === 'ios' ? 'sm' : 'xs',
        },
      },
      md: {
        px: Platform.OS === 'ios' ? 6 : 4,
        py: Platform.OS === 'ios' ? 4 : 3,
        _text: {
          fontSize: Platform.OS === 'ios' ? 'md' : 'sm',
        },
      },
      lg: {
        px: Platform.OS === 'ios' ? 8 : 6,
        py: Platform.OS === 'ios' ? 5 : 4,
        _text: {
          fontSize: Platform.OS === 'ios' ? 'lg' : 'md',
        },
      },
    },
  },
  Input: {
    baseStyle: {
      borderRadius: Platform.OS === 'ios' ? 'xl' : 'lg',
      borderWidth: Platform.OS === 'ios' ? 1 : 1,
      borderColor: 'gray.300',
      bg: Platform.OS === 'ios' ? 'gray.50' : 'white',
      px: Platform.OS === 'ios' ? 5 : 4,
      py: Platform.OS === 'ios' ? 4 : 3,
      fontSize: Platform.OS === 'ios' ? 'md' : 'sm',
      _focus: {
        borderColor: 'primary.500',
        bg: 'white',
        ...(Platform.OS === 'ios' && {
          shadow: 1,
        }),
      },
    },
  },
  Card: {
    baseStyle: {
      bg: 'white',
      borderRadius: Platform.OS === 'ios' ? '2xl' : 'lg',
      shadow: Platform.OS === 'ios' ? 2 : 1,
      p: Platform.OS === 'ios' ? 5 : 4,
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2,
      py: 1,
      _text: {
        fontSize: 'xs',
        fontWeight: 'semibold',
      },
    },
  },
};

// Main theme configuration
export const theme = extendTheme({
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space,
  radii,
  shadows,
  components,
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
});

// Theme utilities
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: any = colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) break;
  }

  return value || colorPath;
};

export const getSpacing = (size: keyof typeof space) => {
  return space[size] || size;
};

export const getFontSize = (size: keyof typeof fontSizes) => {
  return fontSizes[size] || size;
};

export const getBorderRadius = (size: keyof typeof radii) => {
  return radii[size] || size;
};

export default theme;
