import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '@/ui/Text';

import { WidgetView } from '@/components/WidgetView';
import {
  BASE_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  PRIMARY_PRESETS,
  SECONDARY_PRESETS,
  contrastRatio,
  isHexColor,
  readableOn,
} from '@/lib/appearance';
import { toExportObject } from '@/lib/configFormat';
import { resolveLook, themeDefaults } from '@/lib/model';
import { useStore } from '@/lib/store';
import { Button, C, Card, IconButton, SectionTitle, confirmAction } from '@/ui/kit';

function ColorPicker({
  title,
  hint,
  presets,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  presets: { name: string; value: string }[];
  value: string;
  onChange: (color: string) => void;
}) {
  const [custom, setCustom] = useState('');
  return (
    <Card style={styles.gap}>
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel={title}>
        {presets.map((p) => {
          const active = p.value === value.toLowerCase();
          return (
            <Pressable
              key={p.value}
              accessibilityRole="radio"
              accessibilityLabel={p.name}
              accessibilityState={{ checked: active }}
              onPress={() => onChange(p.value)}
              style={[styles.swatch, { backgroundColor: p.value }, active && styles.swatchActive]}>
              {active && <Ionicons name="checkmark" size={24} color={readableOn(p.value)} />}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.customRow}>
        <View style={[styles.customPreview, { backgroundColor: value }]} />
        <TextInput
          underlineColorAndroid="transparent"
          value={custom}
          onChangeText={(text) => {
            const next = text.startsWith('#') ? text : `#${text}`;
            setCustom(text);
            if (isHexColor(next)) onChange(next.toLowerCase());
          }}
          placeholder={`Свой: ${value}`}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={7}
          accessibilityLabel={`${title}: свой цвет в формате HEX`}
          style={styles.customInput}
        />
      </View>
    </Card>
  );
}

export default function AppearanceScreen() {
  const store = useStore();
  const { appearance, theme } = store;
  const defaults = themeDefaults(theme);
  const primary = appearance.primary ?? defaults.primary;
  const secondary = appearance.secondary ?? defaults.secondary;
  const ratio = contrastRatio(primary, secondary);
  const good = ratio >= 3;
  const look = resolveLook(theme, appearance);
  const setSize = (size: number) =>
    store.setAppearance({
      ...appearance,
      fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(size))),
    });

  const share = () =>
    Share.share({
      title: store.name,
      message: JSON.stringify(toExportObject(store.currentConfig()), null, 2),
    }).catch(() => {});

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.gap}>
        <View style={styles.rowBetween}>
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Размер основного текста
          </Text>
          <Text style={styles.sizeValue}>{appearance.fontSize} px</Text>
        </View>
        <View style={styles.sizeRow}>
          <IconButton
            icon="remove"
            label="Уменьшить текст"
            disabled={appearance.fontSize <= MIN_FONT_SIZE}
            onPress={() => setSize(appearance.fontSize - 1)}
          />
          <Slider
            style={styles.slider}
            minimumValue={MIN_FONT_SIZE}
            maximumValue={MAX_FONT_SIZE}
            step={1}
            value={appearance.fontSize}
            onValueChange={setSize}
            minimumTrackTintColor={C.green}
            maximumTrackTintColor="#c9d3cc"
            thumbTintColor={C.green}
            accessibilityLabel="Размер основного текста"
            accessibilityValue={{
              min: MIN_FONT_SIZE,
              max: MAX_FONT_SIZE,
              now: appearance.fontSize,
              text: `${appearance.fontSize} пикселей`,
            }}
          />
          <IconButton
            icon="add"
            label="Увеличить текст"
            disabled={appearance.fontSize >= MAX_FONT_SIZE}
            onPress={() => setSize(appearance.fontSize + 1)}
          />
        </View>
        <Text style={styles.hint}>
          От {MIN_FONT_SIZE} до {MAX_FONT_SIZE} px. Кнопки увеличиваются вместе с текстом.
        </Text>
      </Card>

      <ColorPicker
        title="Основной цвет"
        hint="Кнопки, иконки и акценты в виджетах."
        presets={PRIMARY_PRESETS}
        value={primary}
        onChange={(c) => store.setAppearance({ ...appearance, primary: c })}
      />
      <ColorPicker
        title="Дополнительный цвет"
        hint="Фон виджетов. Цвет текста подбирается автоматически."
        presets={SECONDARY_PRESETS}
        value={secondary}
        onChange={(c) => store.setAppearance({ ...appearance, secondary: c })}
      />

      <View
        style={[styles.contrast, good ? styles.contrastGood : styles.contrastLow]}
        accessibilityLiveRegion="polite">
        <Ionicons
          name={good ? 'checkmark-circle' : 'alert-circle'}
          size={22}
          color={good ? '#23552f' : '#7a3d00'}
        />
        <Text style={[styles.contrastText, { color: good ? '#23552f' : '#7a3d00' }]}>
          Контраст {ratio.toFixed(1)}:1 —{' '}
          {good ? 'кнопки хорошо видны на фоне.' : 'низкий: кнопки могут сливаться с фоном.'}
        </Text>
      </View>

      <SectionTitle>Как это выглядит</SectionTitle>
      <View style={[styles.sample, { backgroundColor: look.surface, borderColor: look.border }]}>
        <WidgetView type="qr" look={look} />
      </View>

      <Button
        label="Сбросить оформление"
        icon="refresh"
        variant="secondary"
        disabled={
          appearance.fontSize === BASE_FONT_SIZE && !appearance.primary && !appearance.secondary
        }
        onPress={() =>
          store.setAppearance({ fontSize: BASE_FONT_SIZE, primary: null, secondary: null })
        }
      />
      <Button
        label="Поделиться настройками"
        icon="share-outline"
        variant="secondary"
        onPress={share}
      />
      <Button
        label="Начать заново"
        icon="trash-outline"
        variant="danger"
        onPress={() =>
          confirmAction(
            'Начать заново?',
            'Удалятся все сохранённые интерфейсы и настройки на этом устройстве.',
            'Удалить всё',
            store.resetAll,
          )
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  gap: { gap: 10 },
  rowBetween: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: C.text },
  hint: { fontSize: 15, color: C.muted, lineHeight: 21 },
  sizeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: C.green,
    backgroundColor: C.greenSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slider: { flex: 1, height: 48 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: { borderWidth: 3, borderColor: '#1b1f1d' },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customPreview: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  customInput: {
    backgroundColor: C.card, // убирает системное подчёркивание поля на Android
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: C.text,
  },
  contrast: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  contrastGood: { backgroundColor: '#eef7ec' },
  contrastLow: { backgroundColor: '#fdf1e3' },
  contrastText: { flex: 1, fontSize: 15, lineHeight: 21 },
  sample: { borderRadius: 16, borderWidth: 1, padding: 16 },
});
