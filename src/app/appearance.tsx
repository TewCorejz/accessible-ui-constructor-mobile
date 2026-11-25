import { Icon as Ionicons } from '@/ui/Icon';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { makeStyles, useColors, useTheme } from '@/ui/theme';
import { Stagger } from '@/ui/motion';
import { Text, TextInput } from '@/ui/Text';

import { WidgetCard } from '@/components/WidgetCard';
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
import { Button, Card, IconButton, SectionTitle, confirmAction } from '@/ui/kit';

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
  const styles = useStyles();
  const [custom, setCustom] = useState('');
  return (
    <Card style={styles.gap}>
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel={title}>
        {presets.map(({ name, value: color }) => {
          const active = color === value.toLowerCase();
          return (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityLabel={name}
              accessibilityState={{ checked: active }}
              onPress={() => onChange(color)}
              style={[styles.swatch, { backgroundColor: color }, active && styles.swatchActive]}>
              {active && <Ionicons name="checkmark" size={24} color={readableOn(color)} />}
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
  const styles = useStyles();
  const C = useColors();
  const store = useStore();
  const { appearance, theme } = store;
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const defaults = themeDefaults(theme, C.dark);
  const primary = appearance.primary ?? defaults.primary;
  const secondary = appearance.secondary ?? defaults.secondary;
  const ratio = contrastRatio(primary, secondary);
  const good = ratio >= 3;
  const look = resolveLook(theme, appearance, C.dark);
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
      <Stagger>
        <Card style={styles.gap}>
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Тема приложения
          </Text>
          <View
            style={styles.themeRow}
            accessibilityRole="radiogroup"
            accessibilityLabel="Тема приложения">
            {(
              [
                ['light', 'Светлая', 'sunny-outline'],
                ['dark', 'Тёмная', 'moon-outline'],
                ['system', 'Как в системе', 'phone-portrait-outline'],
              ] as const
            ).map(([value, label, icon]) => {
              const on = themeMode === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={label}
                  accessibilityState={{ checked: on }}
                  onPress={() => setThemeMode(value)}
                  style={({ pressed }) => [
                    styles.themeOption,
                    on && styles.themeOptionOn,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}>
                  <Ionicons name={icon} size={22} color={on ? C.greenText : C.muted} />
                  <Text style={[styles.themeOptionText, on && { color: C.greenText }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

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
              maximumTrackTintColor={C.dark ? '#3a4440' : '#c9d3cc'}
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
            color={good ? C.greenText : C.dark ? '#ffb36b' : '#7a3d00'}
          />
          <Text
            style={[
              styles.contrastText,
              { color: good ? (C.dark ? C.text : '#23552f') : C.dark ? '#ffd7b0' : '#7a3d00' },
            ]}>
            Контраст {ratio.toFixed(1)}:1 —{' '}
            {good ? 'кнопки хорошо видны на фоне.' : 'низкий: кнопки могут сливаться с фоном.'}
          </Text>
        </View>

        <SectionTitle>Как это выглядит</SectionTitle>
        <WidgetCard type="balance" look={look}>
          {(lk) => <WidgetView type="balance" look={lk} />}
        </WidgetCard>
        <WidgetCard type="qr" look={look}>
          {(lk) => <WidgetView type="qr" look={lk} />}
        </WidgetCard>

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
      </Stagger>
    </ScrollView>
  );
}

const useStyles = makeStyles((C) =>
  StyleSheet.create({
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
      borderColor: C.dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchActive: { borderWidth: 3, borderColor: C.text },
    customRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    customPreview: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
    },
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
    contrastGood: { backgroundColor: C.greenSoft },
    contrastLow: { backgroundColor: C.dark ? '#3a2a18' : '#fdf1e3' },
    contrastText: { flex: 1, fontSize: 15, lineHeight: 21 },
    themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    themeOption: {
      flexGrow: 1,
      minHeight: 56,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: C.border,
      backgroundColor: C.bg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    themeOptionOn: { borderColor: C.green, backgroundColor: C.greenSoft },
    themeOptionText: { fontSize: 15, fontWeight: '600', color: C.text },
  }),
);
