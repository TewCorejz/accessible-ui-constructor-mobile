import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

/**
 * Цвета приложения. Две темы — решение команды (25.11.2026):
 * «Классика» (светлая) и «Тёмная». Макеты: accessible-ui-constructor/docs/design/mockups.
 */
export type Palette = {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  green: string;
  /** Текст и иконки на зелёной кнопке */
  onGreen: string;
  greenSoft: string;
  greenText: string;
  danger: string;
  dangerSoft: string;
  shadow: string;
  backdrop: string;
};

export const LIGHT: Palette = {
  dark: false,
  bg: '#f2f4f3',
  card: '#ffffff',
  text: '#18211c',
  muted: '#55625a',
  border: '#e3e7e5',
  green: '#178544', // белый текст 4.7:1
  onGreen: '#ffffff',
  greenSoft: '#e5f4ea',
  greenText: '#127a3d',
  danger: '#a3243b',
  dangerSoft: '#fbecee',
  shadow: 'rgba(20, 60, 40, 0.08)',
  backdrop: 'rgba(10, 20, 15, 0.38)',
};

export const DARK: Palette = {
  dark: true,
  bg: '#111513',
  card: '#1b211e',
  text: '#eef3f0',
  muted: '#a3b0a8',
  border: '#29312d',
  green: '#3ccf7d', // тёмный текст на мятной кнопке
  onGreen: '#08210f',
  greenSoft: '#1f3a2a',
  greenText: '#5fe096',
  danger: '#ff8a9b',
  dangerSoft: '#3a1f24',
  shadow: 'rgba(0, 0, 0, 0)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
};

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'accessible-ui-constructor-mobile:theme';

type Ctx = { colors: Palette; mode: ThemeMode; setMode: (m: ThemeMode) => void };
const ThemeContext = createContext<Ctx>({ colors: LIGHT, mode: 'system', setMode: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
    return {
      colors: dark ? DARK : LIGHT,
      mode,
      setMode: (m) => {
        setModeState(m);
        (m === 'system' ? AsyncStorage.removeItem(KEY) : AsyncStorage.setItem(KEY, m)).catch(
          () => {},
        );
      },
    };
  }, [mode, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;

/** Стили, зависящие от темы: const useStyles = makeStyles((C) => StyleSheet.create({ ... })). */
export function makeStyles<T>(factory: (C: Palette) => T) {
  const cache = new WeakMap<Palette, T>();
  return function useStyles(): T {
    const C = useColors();
    let styles = cache.get(C);
    if (!styles) {
      styles = factory(C);
      cache.set(C, styles);
    }
    return styles;
  };
}
