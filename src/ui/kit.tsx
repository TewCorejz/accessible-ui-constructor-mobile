import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/ui/Text';

/** Цвета самого приложения (не путать с оформлением собранного интерфейса). */
export const C = {
  bg: '#f4f7f5',
  card: '#ffffff',
  text: '#1f2a25',
  muted: '#55625a',
  border: '#dde5df',
  green: '#157838',
  greenSoft: '#e6f3e7',
  danger: '#a3243b',
  dangerSoft: '#fbecee',
};

export const MIN_TOUCH = 48;

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled,
  accessibilityHint,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.45 },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={22} color={v.fg} />}
      <Text style={[styles.buttonText, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const variants = {
  primary: { bg: C.green, border: C.green, fg: '#ffffff' },
  secondary: { bg: C.card, border: C.border, fg: C.text },
  danger: { bg: C.dangerSoft, border: '#f0c6cd', fg: C.danger },
};

export function IconButton({
  icon,
  label,
  onPress,
  disabled,
  color = C.text,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.35 },
      ]}>
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, count }: { children: string; count?: number }) {
  return (
    <View style={styles.sectionTitle}>
      <Text accessibilityRole="header" style={styles.sectionTitleText}>
        {children}
      </Text>
      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  iconButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  sectionTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  sectionTitleText: { fontSize: 22, fontWeight: '700', color: C.text },
  badge: {
    backgroundColor: '#e9eeea',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 14, fontWeight: '600', color: C.muted },
});

/** Подтверждение действия: системный диалог на телефоне, window.confirm в веб-превью. */
export function confirmAction(
  title: string,
  message: string,
  actionLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: actionLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
