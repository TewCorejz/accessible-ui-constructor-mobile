import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const GAP = 12;
const LONG_PRESS_MS = 300;

type Props<T extends { id: string }> = {
  items: T[];
  enabled: boolean;
  renderItem: (item: T, index: number, dragging: boolean) => ReactNode;
  /** Вызывается после того, как пользователь отпустил виджет на новом месте. */
  onMove: (from: number, to: number) => void;
  /** Начало и конец перетаскивания — чтобы родитель отключил прокрутку. */
  onDragStateChange?: (dragging: boolean) => void;
};

/** Позиция, на которую встанет перетаскиваемый элемент (вычисляется в UI-потоке). */
function targetIndex(active: number, dy: number, heights: number[]) {
  'worklet';
  if (active < 0) return -1;
  let top = 0;
  for (let i = 0; i < active; i++) top += heights[i] + GAP;
  const center = top + heights[active] / 2 + dy;
  let offset = 0;
  for (let i = 0; i < heights.length; i++) {
    const end = offset + heights[i] + GAP;
    if (center < end || i === heights.length - 1) return i;
    offset = end;
  }
  return heights.length - 1;
}

function Row({
  index,
  active,
  dy,
  heights,
  enabled,
  onLayout,
  onStart,
  onEnd,
  children,
}: {
  index: number;
  active: SharedValue<number>;
  dy: SharedValue<number>;
  heights: SharedValue<number[]>;
  enabled: boolean;
  onLayout: (index: number, height: number) => void;
  onStart: (index: number) => void;
  onEnd: (from: number, to: number) => void;
  children: ReactNode;
}) {
  const pan = usePanGesture({
    enabled,
    activateAfterLongPress: LONG_PRESS_MS,
    onActivate: () => {
      'worklet';
      active.set(index);
      dy.set(0);
      runOnJS(onStart)(index);
    },
    onUpdate: (e) => {
      'worklet';
      dy.set(e.translationY);
    },
    onFinalize: () => {
      'worklet';
      if (active.get() !== index) return;
      const to = targetIndex(index, dy.get(), heights.get());
      active.set(-1);
      dy.set(0);
      runOnJS(onEnd)(index, to);
    },
  });

  const style = useAnimatedStyle(() => {
    const a = active.get();
    if (a === index) {
      return {
        zIndex: 10,
        transform: [{ translateY: dy.get() }, { scale: 1.02 }],
        shadowOpacity: 0.25,
        elevation: 8,
      };
    }
    if (a < 0)
      return {
        zIndex: 0,
        transform: [{ translateY: 0 }, { scale: 1 }],
        shadowOpacity: 0,
        elevation: 0,
      };
    // Остальные виджеты расступаются, показывая место, куда встанет перетаскиваемый.
    const t = targetIndex(a, dy.get(), heights.get());
    const shift = heights.get()[a] + GAP;
    let y = 0;
    if (a < index && index <= t) y = -shift;
    else if (t <= index && index < a) y = shift;
    return {
      zIndex: 0,
      transform: [{ translateY: withTiming(y, { duration: 150 }) }, { scale: 1 }],
      shadowOpacity: 0,
      elevation: 0,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(e: LayoutChangeEvent) => onLayout(index, e.nativeEvent.layout.height)}
        style={[
          {
            shadowColor: '#000',
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
          style,
        ]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Список виджетов, которые можно переставлять долгим нажатием и перетаскиванием.
 * Кнопки «выше» / «ниже» и действия скринридера остаются — перетаскивание лишь
 * дополнительный способ.
 */
export function DraggableList<T extends { id: string }>({
  items,
  enabled,
  renderItem,
  onMove,
  onDragStateChange,
}: Props<T>) {
  const active = useSharedValue(-1);
  const dy = useSharedValue(0);
  const heights = useSharedValue<number[]>([]);
  const sizes = useRef<number[]>([]);
  const [draggingIndex, setDraggingIndex] = useState(-1);

  const onLayout = useCallback(
    (index: number, height: number) => {
      sizes.current[index] = height;
      sizes.current.length = items.length;
      heights.set([...sizes.current]);
    },
    [items.length, heights],
  );

  const onStart = useCallback(
    (index: number) => {
      setDraggingIndex(index);
      onDragStateChange?.(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    },
    [onDragStateChange],
  );

  const onEnd = useCallback(
    (from: number, to: number) => {
      setDraggingIndex(-1);
      onDragStateChange?.(false);
      if (to >= 0 && to !== from) {
        Haptics.selectionAsync().catch(() => {});
        onMove(from, to);
      }
    },
    [onDragStateChange, onMove],
  );

  return (
    <View style={{ gap: GAP }}>
      {items.map((item, index) => (
        <Row
          key={item.id}
          index={index}
          active={active}
          dy={dy}
          heights={heights}
          enabled={enabled}
          onLayout={onLayout}
          onStart={onStart}
          onEnd={onEnd}>
          {renderItem(item, index, draggingIndex === index)}
        </Row>
      ))}
    </View>
  );
}
