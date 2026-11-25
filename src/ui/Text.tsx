import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useColors } from './theme';

/**
 * Текст учитывает системный размер шрифта (Dynamic Type / «Размер шрифта» Android),
 * но не больше чем в 2 раза — этого требует WCAG 1.4.4, а при самых крупных
 * системных размерах (до ×3,1) экран перестаёт помещаться. Крупнее — через
 * «Оформление» в самом приложении.
 */
export const MAX_FONT_SCALE = 2;

/**
 * Шрифт Onest: у каждого начертания своё имя, а fontWeight с подключёнными
 * шрифтами на Android не работает — поэтому подбираем начертание по весу.
 */
const FAMILY: Record<string, string> = {
  '100': 'Onest_400Regular',
  '200': 'Onest_400Regular',
  '300': 'Onest_400Regular',
  '400': 'Onest_400Regular',
  normal: 'Onest_400Regular',
  '500': 'Onest_500Medium',
  '600': 'Onest_600SemiBold',
  '700': 'Onest_700Bold',
  bold: 'Onest_700Bold',
  '800': 'Onest_800ExtraBold',
  '900': 'Onest_800ExtraBold',
};

function withFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return style;
  const fontFamily = FAMILY[String(flat.fontWeight ?? '400')] ?? FAMILY['400'];
  return [style, { fontFamily, fontWeight: undefined }];
}

export function Text({ style, ...props }: TextProps) {
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} style={withFont(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  // Цвета берём из темы приложения: системные подсказка и клавиатура следуют теме
  // телефона и теряются, если тема в приложении выбрана вручную.
  const C = useColors();
  return (
    <RNTextInput
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      placeholderTextColor={C.muted}
      keyboardAppearance={C.dark ? 'dark' : 'light'}
      selectionColor={C.green}
      {...props}
      style={withFont([{ color: C.text }, style])}
    />
  );
}
