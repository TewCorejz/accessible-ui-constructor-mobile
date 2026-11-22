import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { StoreProvider, useStore } from '@/lib/store';
import { C } from '@/ui/kit';

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
    <StoreProvider>
      <HideSplashWhenReady />
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: C.card },
          headerTitleStyle: { fontSize: 20, fontWeight: '700', color: C.text },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: C.bg },
          tabBarActiveTintColor: C.green,
          tabBarInactiveTintColor: C.muted,
          tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
          tabBarStyle: { minHeight: 64, paddingTop: 6, borderTopColor: C.border },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Мой банк',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color as string} size={size} />,
          }}
        />
        <Tabs.Screen
          name="choose"
          options={{
            title: 'Выбрать',
            tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color as string} size={size} />,
          }}
        />
        <Tabs.Screen
          name="appearance"
          options={{
            title: 'Оформление',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="color-palette-outline" color={color as string} size={size} />
            ),
          }}
        />
      </Tabs>
    </StoreProvider>
  );
}
