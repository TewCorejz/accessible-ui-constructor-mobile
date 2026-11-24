import { Icon as Ionicons } from '@/ui/Icon';
import { Tabs } from 'expo-router/js-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider, useStore } from '@/lib/store';
import { C } from '@/ui/kit';
import { Text } from '@/ui/Text';

SplashScreen.preventAutoHideAsync().catch(() => {});

function HideSplashWhenReady() {
  const { ready } = useStore();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <HideSplashWhenReady />
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: C.card },
            // Заголовок дублирует подпись вкладки — растёт с системным шрифтом умеренно,
            // чтобы не обрезаться на самых крупных размерах.
            headerTitle: ({ children }) => (
              <Text
                accessibilityRole="header"
                maxFontSizeMultiplier={1.4}
                numberOfLines={1}
                style={{ fontSize: 20, fontWeight: '700', color: C.text }}>
                {children}
              </Text>
            ),
            headerShadowVisible: false,
            sceneStyle: { backgroundColor: C.bg },
            tabBarActiveTintColor: C.green,
            tabBarInactiveTintColor: C.muted,
            tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
            tabBarStyle: {
              minHeight: 64,
              paddingTop: 6,
              borderTopColor: C.border,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Мой банк',
              tabBarAccessibilityLabel: 'Мой банк',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid-outline" color={color as string} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="choose"
            options={{
              title: 'Выбрать',
              tabBarAccessibilityLabel: 'Выбрать',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="albums-outline" color={color as string} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="appearance"
            options={{
              title: 'Оформление',
              tabBarAccessibilityLabel: 'Оформление',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="color-palette-outline" color={color as string} size={size} />
              ),
            }}
          />
        </Tabs>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
