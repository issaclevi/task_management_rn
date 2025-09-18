// src/components/ui/ResponsiveLayout.tsx
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Box, VStack, HStack, ScrollView } from 'native-base';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  spacing?: number;
}

export const ResponsiveContainer: React.FC<ResponsiveLayoutProps> = ({
  children,
  maxWidth = 1200,
  padding = 4,
  spacing = 4
}) => {
  const { width } = useWindowDimensions();
  
  return (
    <Box
      flex="1"
      alignItems="center"
      bg="gray.50"
    >
      <Box
        width="100%"
        maxWidth={Math.min(width, maxWidth)}
        px={padding}
        py={spacing}
      >
        {children}
      </Box>
    </Box>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
  minItemWidth?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 2,
  spacing = 4,
  minItemWidth = 200
}) => {
  const { width } = useWindowDimensions();
  
  // Calculate optimal number of columns based on screen width
  const calculatedColumns = Math.max(1, Math.floor(width / minItemWidth));
  const finalColumns = Math.min(columns, calculatedColumns);
  
  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  
  for (let i = 0; i < childrenArray.length; i += finalColumns) {
    rows.push(childrenArray.slice(i, i + finalColumns));
  }
  
  return (
    <VStack space={spacing}>
      {rows.map((row, rowIndex) => (
        <HStack key={rowIndex} space={spacing} flex="1">
          {row.map((child, colIndex) => (
            <Box key={colIndex} flex="1">
              {child}
            </Box>
          ))}
          {/* Fill remaining columns with empty boxes */}
          {row.length < finalColumns &&
            Array.from({ length: finalColumns - row.length }).map((_, index) => (
              <Box key={`empty-${index}`} flex="1" />
            ))}
        </HStack>
      ))}
    </VStack>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  breakpoint?: number;
  spacing?: number;
  alignItems?: string;
  justifyContent?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'responsive',
  breakpoint = 768,
  spacing = 4,
  alignItems = 'stretch',
  justifyContent = 'flex-start'
}) => {
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width >= breakpoint;
  const stackDirection = direction === 'responsive' 
    ? (isLargeScreen ? 'row' : 'column')
    : direction;
  
  if (stackDirection === 'row') {
    return (
      <HStack 
        space={spacing} 
        alignItems={alignItems as any}
        justifyContent={justifyContent as any}
        flex="1"
      >
        {children}
      </HStack>
    );
  }
  
  return (
    <VStack 
      space={spacing} 
      alignItems={alignItems as any}
      justifyContent={justifyContent as any}
      flex="1"
    >
      {children}
    </VStack>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: number;
  shadow?: string;
  borderRadius?: string;
  bg?: string;
  minHeight?: number;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = 4,
  shadow = "1",
  borderRadius = "lg",
  bg = "white",
  minHeight
}) => {
  const { width } = useWindowDimensions();
  
  // Adjust padding based on screen size
  const responsivePadding = width < 768 ? Math.max(2, padding - 1) : padding;
  
  return (
    <Box
      bg={bg}
      p={responsivePadding}
      borderRadius={borderRadius}
      shadow={shadow}
      minHeight={minHeight}
      width="100%"
    >
      {children}
    </Box>
  );
};

interface ResponsiveScrollViewProps {
  children: React.ReactNode;
  horizontal?: boolean;
  showsScrollIndicator?: boolean;
  contentContainerStyle?: any;
}

export const ResponsiveScrollView: React.FC<ResponsiveScrollViewProps> = ({
  children,
  horizontal = false,
  showsScrollIndicator = false,
  contentContainerStyle
}) => {
  const { width } = useWindowDimensions();
  
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal && showsScrollIndicator}
      showsVerticalScrollIndicator={!horizontal && showsScrollIndicator}
      contentContainerStyle={{
        flexGrow: 1,
        padding: width < 768 ? 12 : 16,
        ...contentContainerStyle
      }}
    >
      {children}
    </ScrollView>
  );
};

interface BreakpointProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
}

export const Breakpoint: React.FC<BreakpointProps> = ({
  children,
  minWidth = 0,
  maxWidth = Infinity
}) => {
  const { width } = useWindowDimensions();
  
  if (width >= minWidth && width <= maxWidth) {
    return <>{children}</>;
  }
  
  return null;
};

// Utility hook for responsive values
export const useResponsiveValue = <T,>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
  defaultValue: T
): T => {
  const { width } = useWindowDimensions();
  
  if (width >= 1200 && values.xl !== undefined) return values.xl;
  if (width >= 992 && values.lg !== undefined) return values.lg;
  if (width >= 768 && values.md !== undefined) return values.md;
  if (width >= 576 && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  return defaultValue;
};

// Utility hook for screen size detection
export const useScreenSize = () => {
  const { width, height } = useWindowDimensions();
  
  return {
    width,
    height,
    isXs: width < 576,
    isSm: width >= 576 && width < 768,
    isMd: width >= 768 && width < 992,
    isLg: width >= 992 && width < 1200,
    isXl: width >= 1200,
    isTablet: width >= 768,
    isDesktop: width >= 992,
    isPortrait: height > width,
    isLandscape: width > height
  };
};
