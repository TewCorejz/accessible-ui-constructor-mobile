/**
 * Оформление собранного интерфейса: размер основного текста и палитра.
 * Та же модель, что в веб-версии (accessible-ui-constructor/src/appearance.ts),
 * поэтому файлы экспорта совместимы между приложениями.
 */
export type Appearance = {
  fontSize: number;
  primary: string | null;
  secondary: string | null;
};

export const BASE_FONT_SIZE = 14;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 28;

export const DEFAULT_APPEARANCE: Appearance = {
  fontSize: BASE_FONT_SIZE,
  primary: null,
  secondary: null,
};

export const PRIMARY_PRESETS = [
  { name: 'Зелёный', value: '#157838' },
  { name: 'Синий', value: '#1f5fbf' },
  { name: 'Фиолетовый', value: '#6b3fb5' },
  { name: 'Бордовый', value: '#a3243b' },
  { name: 'Оранжевый', value: '#b35400' },
  { name: 'Чёрный', value: '#1d1d1f' },
];

export const SECONDARY_PRESETS = [
  { name: 'Белый', value: '#ffffff' },
  { name: 'Кремовый', value: '#fbf6e9' },
  { name: 'Светло-серый', value: '#eef1f4' },
  { name: 'Голубой', value: '#e8f1fb' },
  { name: 'Светло-жёлтый', value: '#fff3b0' },
  { name: 'Тёмный', value: '#1e2328' },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value);
}

export function normalizeAppearance(value: unknown): Appearance {
  const a = (value ?? {}) as Partial<Appearance>;
  const size = Number(a.fontSize);
  return {
    fontSize: Number.isFinite(size)
      ? Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size)))
      : BASE_FONT_SIZE,
    primary: isHexColor(a.primary) ? a.primary.toLowerCase() : null,
    secondary: isHexColor(a.secondary) ? a.secondary.toLowerCase() : null,
  };
}

function luminance(hex: string) {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Контраст двух цветов по WCAG (от 1 до 21). */
export function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Чёрный или белый — что читается лучше на заданном фоне. */
export function readableOn(background: string) {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#1b1f1d')
    ? '#ffffff'
    : '#1b1f1d';
}

/** Полупрозрачный оттенок цвета поверх фона (для подложек иконок). */
export function tint(hex: string, amount: number, over: string) {
  const mix = (i: number) =>
    Math.round(
      parseInt(hex.slice(i, i + 2), 16) * amount + parseInt(over.slice(i, i + 2), 16) * (1 - amount),
    )
      .toString(16)
      .padStart(2, '0');
  return `#${mix(1)}${mix(3)}${mix(5)}`;
}
