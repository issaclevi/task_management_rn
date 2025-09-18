// src/components/navigation/CustomTabBar.tsx
import React from 'react';
import { Platform, Pressable, View, Text as RNText, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 56;
  const tabBarPaddingBottom = Platform.OS === 'ios' ? insets.bottom : 8;

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          } : {
            elevation: 8,
          }),
        }
      ]}
    >
      <HStack flex={1} alignItems="center" justifyContent="space-around">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused ? '#6A5AE0' : '#9CA3AF';
          const textColor = isFocused ? '#6A5AE0' : '#9CA3AF';

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
              }}
            >
              <VStack alignItems="center" space={1}>
                {options.tabBarIcon && (
                  <Box>
                    {options.tabBarIcon({
                      focused: isFocused,
                      color: iconColor,
                      size: Platform.OS === 'ios' ? (isFocused ? 26 : 24) : 24,
                    })}
                  </Box>
                )}
                <Text
                  fontSize={Platform.OS === 'ios' ? 11 : 12}
                  fontWeight={Platform.OS === 'ios' ? '500' : '600'}
                  color={textColor}
                  numberOfLines={1}
                >
                  {typeof label === 'string' ? label : route.name}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};

export default CustomTabBar;
