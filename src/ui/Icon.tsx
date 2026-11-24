import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

/**
 * Иконка — всегда декоративная: смысл передаёт подпись кнопки или текст рядом.
 * Иконки нарисованы шрифтом, поэтому без этого TalkBack и VoiceOver читают их
 * как отдельный текст (например, «, Мой банк»).
 */
export function Icon(props: ComponentProps<typeof Ionicons>) {
  return (
    <Ionicons
      {...props}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      aria-hidden
    />
  );
}
