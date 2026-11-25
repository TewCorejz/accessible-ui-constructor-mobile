import { LinearGradient } from 'expo-linear-gradient';
import { Children, isValidElement, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useColors } from './theme';

/**
 * Анимации пака «Живой» (выбор команды). Демо: accessible-ui-constructor/docs/design/animations/4-lively.mp4
 * Основа — сдвиг и проявление; сверху скелет при открытии, счётчик баланса, блик по карте
 * и подсветка нового виджета. При системной настройке «Уменьшить движение» ничего не
 * проигрывается: у Reanimated — ReduceMotion.System, у остального — useReducedMotion().
 */
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Новый виджет выезжает справа. */
export const enterRight = FadeInRight.duration(480)
  .easing(EASE)
  .withInitialValues({ transform: [{ translateX: 60 }] })
  .reduceMotion(ReduceMotion.System);

/** Перестановка и изменение размеров соседних элементов. */
export const reflow = LinearTransition.duration(320).easing(EASE).reduceMotion(ReduceMotion.System);

export const fadeIn = FadeIn.duration(250).reduceMotion(ReduceMotion.System);
export const fadeOut = FadeOut.duration(200).reduceMotion(ReduceMotion.System);

/** Вход блока экрана: поднимается на 12 pt и проявляется, блоки — по очереди (шаг 60 мс). */
export function Appear({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  // Обычная анимация, а не entering: на Android entering первого блока при первом
  // показе вкладки иногда не запускается, и блок остаётся невидимым (opacity 0).
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    progress.set(
      withDelay(Math.min(index, 6) * 60, withTiming(1, { duration: 420, easing: EASE })),
    );
  }, [index, reduced, progress]);
  const enter = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * 12 }],
  }));
  return (
    <Animated.View layout={reflow} style={[style, enter]}>
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

/** true первые ~0,9 с после открытия экрана — пока на виджетах мерцает скелет. */
export function useLoadingSkeleton(ms = 900) {
  const reduced = useReducedMotion();
  const [loading, setLoading] = useState(!reduced);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(timer);
  }, [loading, ms]);
  return loading;
}

const shine = (light: boolean) =>
  [
    'rgba(255,255,255,0)',
    light ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.08)',
    'rgba(255,255,255,0)',
  ] as const;

/** Блик, который один раз (или по кругу) пробегает по родителю слева направо. */
function Shine({
  colors,
  delay = 0,
  duration = 900,
  loop = false,
}: {
  colors: readonly [string, string, string];
  delay?: number;
  duration?: number;
  loop?: boolean;
}) {
  const [width, setWidth] = useState(0);
  // 0 — блик за левым краем, 1 — за правым.
  const x = useSharedValue(0);
  useEffect(() => {
    if (!width) return;
    const run = withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
    x.set(withDelay(delay, loop ? withRepeat(run, -1) : run));
  }, [width, delay, duration, loop, x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: (x.get() * 1.4 - 0.4) * width }],
  }));
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 20 }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: '40%' }, style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Блик по карте баланса. */
export function Sheen({ delay = 350 }: { delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <Shine
      delay={delay}
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
    />
  );
}

/** Скелет поверх карточки: серые полосы с мерцанием, потом растворяется. */
export function Skeleton() {
  const C = useColors();
  const bar = C.dark ? '#29312d' : '#e8eeea';
  return (
    <Animated.View
      exiting={FadeOut.duration(250).reduceMotion(ReduceMotion.System)}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[StyleSheet.absoluteFill, skeleton.box, { backgroundColor: C.card }]}>
      <View style={[skeleton.bar, { width: '38%', height: 12, backgroundColor: bar }]} />
      <View style={[skeleton.bar, { width: '62%', height: 26, backgroundColor: bar }]} />
      <View style={[skeleton.bar, { width: '30%', height: 12, backgroundColor: bar }]} />
      <Shine colors={shine(!C.dark)} loop />
    </Animated.View>
  );
}

const skeleton = StyleSheet.create({
  box: { borderRadius: 20, padding: 18, gap: 14, zIndex: 5 },
  bar: { borderRadius: 6 },
});

/** Рамка вокруг только что добавленного виджета: загорается и гаснет за 1,5 с. */
export function NewRing() {
  const C = useColors();
  const reduced = useReducedMotion();
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(
      withDelay(
        400,
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(600, withTiming(0, { duration: 600 })),
        ),
      ),
    );
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.get() }));
  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { margin: -5, borderRadius: 25, borderWidth: 3, borderColor: C.green },
        style,
      ]}
    />
  );
}

const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;

/**
 * Сумма досчитывается от нуля. Скринридер получает итоговое значение
 * через accessibilityLabel и не слышит промежуточные числа.
 */
export function useCountUp(value: number, duration = 900, delay = 250) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = Date.now() + delay;
    const tick = () => {
      const p = Math.min(1, Math.max(0, (Date.now() - start) / duration));
      setShown(Math.round(value * easeOutCubic(p)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, delay, reduced]);
  return reduced ? value : shown;
}

/** Число с пробелами между разрядами, как в рублях: 128 450. */
export const groupDigits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
