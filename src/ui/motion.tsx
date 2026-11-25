import { Children, isValidElement, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

/**
 * Анимации пака «Плавный» (выбор команды). Демо: accessible-ui-constructor/docs/design/animations/2-smooth.mp4
 * При системной настройке «Уменьшить движение» Reanimated их не проигрывает (ReduceMotion.System).
 */
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Вход блока экрана: поднимается и проявляется, блоки — по очереди. */
export const enterUp = (index = 0) =>
  FadeInDown.duration(450)
    .delay(Math.min(index, 6) * 70)
    .easing(EASE)
    .withInitialValues({ transform: [{ translateY: 18 }] })
    .reduceMotion(ReduceMotion.System);

/** Перестановка и изменение размеров соседних элементов. */
export const reflow = LinearTransition.duration(320).easing(EASE).reduceMotion(ReduceMotion.System);

export const fadeIn = FadeIn.duration(250).reduceMotion(ReduceMotion.System);
export const fadeOut = FadeOut.duration(200).reduceMotion(ReduceMotion.System);

/** Обёртка для блоков экрана. */
export function Appear({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Animated.View entering={enterUp(index)} layout={reflow} style={style}>
      {children}
    </Animated.View>
  );
}

/**
 * Оборачивает каждый блок экрана в Appear: блоки появляются по очереди.
 * Ключи берутся из позиции в разметке, поэтому блоки не пересоздаются при обновлениях.
 */
export function Stagger({ children }: { children: ReactNode }) {
  return (
    <>
      {Children.toArray(children).map((child, i) =>
        isValidElement(child) ? (
          <Appear key={child.key ?? i} index={i}>
            {child}
          </Appear>
        ) : (
          child
        ),
      )}
    </>
  );
}
