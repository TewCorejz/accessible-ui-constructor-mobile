import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

/**
 * Текст учитывает системный размер шрифта (Dynamic Type / «Размер шрифта» Android),
 * но не больше чем в 2 раза — этого требует WCAG 1.4.4, а при самых крупных
 * системных размерах (до ×3,1) экран перестаёт помещаться. Крупнее — через
 * «Оформление» в самом приложении.
 */
export const MAX_FONT_SCALE = 2;

export function Text(props: TextProps) {
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;
}

export function TextInput(props: TextInputProps) {
  return <RNTextInput maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;
}
