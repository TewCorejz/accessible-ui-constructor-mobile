import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  Onest_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/onest';
import { Tabs } from 'expo-router/js-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider, useStore } from '@/lib/store';
import { Icon as Ionicons } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { ThemeProvider, useColors } from '@/ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function HideSplashWhenReady({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useStore();
  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsReady]);
  return null;
}

function AppTabs() {
  const C = useColors();
  return (
    <>
      <StatusBar style={C.dark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
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
          tabBarActiveTintColor: C.greenText,
          tabBarInactiveTintColor: C.muted,
          tabBarLabelStyle: { fontSize: 13, fontFamily: 'Onest_600SemiBold' },
          tabBarStyle: {
            minHeight: 64,
            paddingTop: 6,
            backgroundColor: C.card,
            borderTopColor: C.border,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Мой банк',
            tabBarAccessibilityLabel: 'Мой банк',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                color={color as string}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="choose"
          options={{
            title: 'Выбрать',
            tabBarAccessibilityLabel: 'Выбрать',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'albums' : 'albums-outline'}
                color={color as string}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="appearance"
          options={{
            title: 'Оформление',
            tabBarAccessibilityLabel: 'Оформление',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'color-palette' : 'color-palette-outline'}
                color={color as string}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  // Шрифт Onest (OFL 1.1) — как в веб-версии. Пока грузится, держим заставку.
  const [fontsLoaded, fontError] = useFonts({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    Onest_800ExtraBold,
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StoreProvider>
          <HideSplashWhenReady fontsReady={fontsLoaded || !!fontError} />
          {/* Пока шрифт не загружен, видна заставка: иначе текст измеряется системным
              шрифтом и потом обрезается. */}
          {(fontsLoaded || fontError) && <AppTabs />}
        </StoreProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
