import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { Look, WidgetType } from '@/lib/model';
import { useColors } from '@/ui/theme';

/**
 * Карточка виджета в стиле «Классика»: скругление 20, мягкая тень.
 * Карта баланса — зелёный градиент с белым текстом (если пользователь не выбрал свой фон).
 * children получает оформление для содержимого карточки.
 */
export function WidgetCard({
  type,
  look,
  style,
  highlight,
  children,
}: {
  type: WidgetType;
  look: Look;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
  children: (look: Look) => ReactNode;
}) {
  const C = useColors();
  const base: ViewStyle = {
    borderRadius: 20,
    padding: 16,
    borderWidth: highlight ? 2 : 1,
    borderColor: highlight ? look.primary : C.dark ? look.border : 'transparent',
    shadowColor: '#14402a',
    shadowOpacity: C.dark ? 0 : 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: C.dark ? 0 : 2,
  };

  if (type === 'balance' && look.balanceGradient) {
    const onCard: Look = {
      ...look,
      primary: '#ffffff',
      onPrimary: '#127a3d',
      surface: look.balanceGradient[1],
      onSurface: '#ffffff',
      muted: 'rgba(255,255,255,0.88)',
      border: 'rgba(255,255,255,0.3)',
    };
    return (
      <LinearGradient
        colors={look.balanceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[base, { borderColor: highlight ? '#ffffff' : 'transparent' }, style]}>
        {children(onCard)}
      </LinearGradient>
    );
  }
  return <View style={[base, { backgroundColor: look.surface }, style]}>{children(look)}</View>;
}
