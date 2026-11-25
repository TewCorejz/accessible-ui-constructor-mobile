import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import { BASE_FONT_SIZE, readableOn, type Appearance } from './appearance';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type WidgetType =
  'balance' | 'qr' | 'history' | 'quick' | 'studentQr' | 'subscriptions' | 'mobile';

export type Widget = { id: string; type: WidgetType; wide: boolean; column?: 1 | 2 };

export type ThemeName = 'default' | 'senior' | 'focus' | 'contrast' | 'student';

export type Config = {
  id: string;
  name: string;
  widgets: Widget[];
  theme: ThemeName;
  appearance?: Appearance;
};

export const STUDENT_TYPES: WidgetType[] = ['studentQr', 'subscriptions', 'mobile'];

export const catalog: {
  type: WidgetType;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    type: 'qr',
    title: 'Оплата по QR-коду',
    description: 'Платежи одним сканированием',
    icon: 'qr-code-outline',
  },
  {
    type: 'history',
    title: 'История переводов',
    description: 'Все операции под рукой',
    icon: 'time-outline',
  },
  {
    type: 'balance',
    title: 'Баланс',
    description: 'Средства на ваших счетах',
    icon: 'wallet-outline',
  },
  {
    type: 'quick',
    title: 'Быстрая оплата',
    description: 'Важные платежи в один шаг',
    icon: 'flash-outline',
  },
  {
    type: 'studentQr',
    title: 'Мои QR-коды',
    description: 'Пропуск, студенческий и оплата',
    icon: 'school-outline',
  },
  {
    type: 'subscriptions',
    title: 'Подписки',
    description: 'Музыка, облако и учёба',
    icon: 'repeat-outline',
  },
  {
    type: 'mobile',
    title: 'Мобильная связь',
    description: 'Тариф и баланс сим-карты',
    icon: 'phone-portrait-outline',
  },
];

export const widgetTitle = (type: WidgetType) =>
  catalog.find((item) => item.type === type)?.title ?? 'Виджет';

export const templates: {
  theme: ThemeName;
  title: string;
  subtitle: string;
  tag: string;
  icon: IconName;
  types: WidgetType[];
  features: string[];
}[] = [
  {
    theme: 'senior',
    title: 'Крупный текст',
    subtitle: 'Баланс и быстрая оплата с крупным текстом и большими кнопками.',
    tag: 'Просто и крупно',
    icon: 'accessibility-outline',
    types: ['balance', 'quick'],
    features: ['Основной текст 24 px', 'Кнопки от 64 px', '2 виджета'],
  },
  {
    theme: 'focus',
    title: 'Фокус',
    subtitle: 'Оплата мобильной связи сразу, без поиска среди других виджетов.',
    tag: 'Без отвлечений',
    icon: 'sparkles-outline',
    types: ['quick'],
    features: ['Один виджет', 'Одна основная кнопка', 'Без анимаций'],
  },
  {
    theme: 'contrast',
    title: 'Высокий контраст',
    subtitle: 'Крупный баланс и оплата по QR-коду в жёлто-чёрной палитре.',
    tag: 'Чёткие границы',
    icon: 'eye-outline',
    types: ['balance', 'qr'],
    features: ['Основной текст 24 px', 'Жёлтый / чёрный', 'Кнопки от 64 px'],
  },
  {
    theme: 'student',
    title: 'Студент',
    subtitle: 'Для учёбы и жизни в кампусе: документы, подписки и связь в одном месте.',
    tag: 'Кампус под рукой',
    icon: 'school-outline',
    types: ['studentQr', 'subscriptions', 'mobile'],
    features: ['3 QR-кода в одном виджете', 'Оплата подписок', 'Тариф и баланс сим-карты'],
  },
];

/** Базовые цвета и размер текста каждого шаблона. */
const themeBase: Record<ThemeName, { primary: string; surface: string; scale: number }> = {
  default: { primary: '#178544', surface: '#ffffff', scale: 1 },
  senior: { primary: '#178544', surface: '#ffffff', scale: 24 / 16 },
  focus: { primary: '#4b4f6b', surface: '#ffffff', scale: 1.25 },
  contrast: { primary: '#12150f', surface: '#ffe784', scale: 24 / 16 },
  student: { primary: '#178544', surface: '#ffffff', scale: 1 },
};

/** Цвета шаблонов в тёмной теме приложения. «Высокий контраст» остаётся жёлто-чёрным. */
const darkBase: Partial<Record<ThemeName, { primary: string; surface: string }>> = {
  default: { primary: '#3ccf7d', surface: '#1b211e' },
  senior: { primary: '#3ccf7d', surface: '#1b211e' },
  focus: { primary: '#a9b0e0', surface: '#1b211e' },
  student: { primary: '#3ccf7d', surface: '#1b211e' },
};

const baseColors = (theme: ThemeName, dark: boolean) =>
  (dark && darkBase[theme]) || themeBase[theme];

export const themeDefaults = (theme: ThemeName, dark = false) => ({
  primary: baseColors(theme, dark).primary,
  secondary: baseColors(theme, dark).surface,
});

/** Итоговые цвета и размеры, по которым рисуются виджеты. */
export type Look = {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;
  muted: string;
  border: string;
  /** Размер основного текста в виджетах, px. */
  text: number;
  /** Карта баланса — зелёный градиент «Классики» (если пользователь не выбрал свой фон). */
  balanceGradient: [string, string, string] | null;
};

export function resolveLook(theme: ThemeName, appearance: Appearance, appDark = false): Look {
  const base = themeBase[theme];
  const colors = baseColors(theme, appDark);
  const primary = appearance.primary ?? colors.primary;
  const surface = appearance.secondary ?? colors.surface;
  const onSurface = readableOn(surface);
  const dark = onSurface === '#ffffff';
  return {
    primary,
    onPrimary: readableOn(primary),
    surface,
    onSurface,
    muted: dark ? '#c9d1cc' : theme === 'contrast' ? '#12150f' : '#5f6b64',
    border: dark ? '#3a4148' : theme === 'contrast' ? '#12150f' : '#dfe6dc',
    text: Math.round(BASE_FONT_SIZE * base.scale * (appearance.fontSize / BASE_FONT_SIZE)),
    balanceGradient:
      theme === 'contrast' || appearance.secondary
        ? null
        : appDark
          ? ['#1e6b45', '#145136', '#0f3a2c']
          : ['#178544', '#127a45', '#0d6a4f'], // белый текст не ниже 4.5:1
  };
}

export const initialWidgets: Widget[] = [
  { id: 'balance-1', type: 'balance', wide: true },
  { id: 'qr-1', type: 'qr', wide: true },
  { id: 'history-1', type: 'history', wide: true },
];

export const initialSaved: Config[] = [
  { id: 'one', name: 'Интерфейс 1', widgets: initialWidgets, theme: 'default' },
  {
    id: 'two',
    name: 'Интерфейс 2',
    widgets: [
      { id: 'b2', type: 'balance', wide: true },
      { id: 'q2', type: 'quick', wide: true },
    ],
    theme: 'default',
  },
];

export const templateConfig = (theme: ThemeName): Config => {
  const t = templates.find((item) => item.theme === theme)!;
  return {
    id: `template-${theme}`,
    name: t.title,
    theme,
    widgets: t.types.map((type, i) => ({ id: `${theme}-${i}-${Date.now()}`, type, wide: true })),
  };
};
