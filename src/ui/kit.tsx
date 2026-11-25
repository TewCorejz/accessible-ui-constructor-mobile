import { Icon as Ionicons } from '@/ui/Icon';
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

import { makeStyles, useColors, type Palette } from '@/ui/theme';
import { Text } from '@/ui/Text';

/** Цвета приложения — src/ui/theme.tsx (useColors). */
export const MIN_TOUCH = 48;

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled,
  accessibilityHint,
  accessibilityLabel,
  style,
}: {
  label: string;
  /** Если на экране несколько одинаковых кнопок — уточнение для скринридера. */
  accessibilityLabel?: string;
  icon?: IconName;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  const C = useColors();
  const v = variants(C)[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.45 },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={22} color={v.fg} />}
      <Text style={[styles.buttonText, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const variants = (C: Palette) => ({
  primary: { bg: C.green, border: C.green, fg: C.onGreen },
  secondary: { bg: C.card, border: C.border, fg: C.text },
  danger: { bg: C.dangerSoft, border: C.dark ? '#5a2a33' : '#f0c6cd', fg: C.danger },
});

export function IconButton({
  icon,
  label,
  onPress,
  disabled,
  color,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const styles = useStyles();
  const C = useColors();
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
        pressed && { opacity: 0.75, transform: [{ scale: 0.92 }] },
        disabled && { opacity: 0.35 },
      ]}>
      <Ionicons name={icon} size={24} color={color ?? C.text} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, count }: { children: string; count?: number }) {
  const styles = useStyles();
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

const useStyles = makeStyles((C) =>
  StyleSheet.create({
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
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.dark ? C.border : 'transparent',
      padding: 18,
      shadowColor: '#14402a',
      shadowOpacity: C.dark ? 0 : 0.07,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: C.dark ? 0 : 2,
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
      backgroundColor: C.dark ? '#252d29' : '#e9eeea',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: { fontSize: 14, fontWeight: '600', color: C.muted },
  }),
);

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
