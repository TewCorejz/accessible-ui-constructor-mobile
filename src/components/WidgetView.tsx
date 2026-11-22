import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tint } from '@/lib/appearance';
import type { Look, WidgetType } from '@/lib/model';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Демонстрационное содержимое виджета. Все суммы и операции вымышленные. */
export function WidgetView({ type, look }: { type: WidgetType; look: Look }) {
  const t = look.text;
  const text = { color: look.onSurface, fontSize: t };
  const muted = { color: look.muted, fontSize: Math.round(t * 0.9) };
  const iconBg = tint(look.primary, 0.12, look.surface);
  const stacked = t >= 19;

  const heading = (icon: IconName, title: string) => (
    <View style={styles.row}>
      <Ionicons name={icon} size={Math.round(t * 1.5)} color={look.primary} />
      <Text accessibilityRole="header" style={[text, styles.bold, { fontSize: Math.round(t * 1.15) }]}>
        {title}
      </Text>
    </View>
  );

  const action = (label: string, icon?: IconName) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: look.primary, minHeight: Math.max(52, t * 3.4) },
        pressed && { opacity: 0.85 },
      ]}>
      {icon && <Ionicons name={icon} size={Math.round(t * 1.4)} color={look.onPrimary} />}
      <Text style={[styles.bold, { color: look.onPrimary, fontSize: Math.round(t * 1.15) }]}>
        {label}
      </Text>
    </Pressable>
  );

  const option = (label: string, icon: IconName, value?: string) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={({ pressed }) => [
        styles.option,
        { borderColor: tint(look.primary, 0.45, look.surface), minHeight: Math.max(52, t * 3.4) },
        pressed && { opacity: 0.8 },
      ]}>
      <Ionicons name={icon} size={Math.round(t * 1.5)} color={look.primary} />
      <Text style={[text, styles.flex]}>{label}</Text>
      {value ? <Text style={[text, styles.bold]}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={Math.round(t * 1.3)} color={look.muted} />
    </Pressable>
  );

  switch (type) {
    case 'balance':
      return (
        <View style={styles.gap}>
          {heading('wallet-outline', 'Мой баланс')}
          <Text style={[text, styles.balance, { fontSize: Math.round(t * 2.4) }]}>
            128 450<Text style={{ fontSize: Math.round(t * 1.5) }}>,00 ₽</Text>
          </Text>
          <View style={styles.between}>
            <Text style={muted}>Дебетовая карта</Text>
            <Text style={muted}>•• 4821</Text>
          </View>
        </View>
      );
    case 'qr':
      return (
        <View style={[styles.gap, styles.center]}>
          <View style={[styles.qrIcon, { backgroundColor: iconBg }]}>
            <Ionicons name="qr-code-outline" size={Math.round(t * 2.6)} color={look.primary} />
          </View>
          <Text style={[text, styles.bold, { fontSize: Math.round(t * 1.15) }]}>Оплата по QR-коду</Text>
          <Text style={muted}>Оплата без ввода реквизитов</Text>
          {action('Показать QR-код')}
        </View>
      );
    case 'history':
      return (
        <View style={styles.gap}>
          {heading('time-outline', 'История переводов')}
          {[
            { title: 'Перевод от Анны', date: 'Сегодня, 10:42', sum: '+ 5 000 ₽', income: true },
            { title: 'Оплата в магазине', date: 'Сегодня, 09:15', sum: '− 1 250 ₽', income: false },
          ].map((op) => (
            <View
              key={op.title}
              style={[styles.row, styles.operation]}
              accessible
              accessibilityLabel={`${op.title}, ${op.date}, ${op.sum}`}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: op.income ? iconBg : tint(look.onSurface, 0.08, look.surface) },
                ]}>
                <Ionicons
                  name={op.income ? 'arrow-down' : 'arrow-up'}
                  size={Math.round(t * 1.3)}
                  color={op.income ? look.primary : look.muted}
                />
              </View>
              <View style={styles.flex}>
                <Text style={[text, styles.medium]}>{op.title}</Text>
                <Text style={muted}>{op.date}</Text>
                {/* При крупном тексте сумма уходит под название, чтобы строки не дробились */}
                {stacked && (
                  <Text style={[text, styles.bold, op.income && { color: look.primary }]}>{op.sum}</Text>
                )}
              </View>
              {!stacked && (
                <Text style={[text, styles.bold, op.income && { color: look.primary }]}>{op.sum}</Text>
              )}
            </View>
          ))}
        </View>
      );
    case 'quick':
      return (
        <View style={styles.gap}>
          {heading('flash-outline', 'Быстрая оплата')}
          {option('Мобильная связь', 'phone-portrait-outline')}
          {option('Услуги ЖКХ', 'home-outline')}
        </View>
      );
    case 'studentQr':
      return (
        <View style={styles.gap}>
          {heading('school-outline', 'Мои QR-коды')}
          {option('Пропуск', 'id-card-outline')}
          {option('Студенческий', 'school-outline')}
          {option('Оплата', 'card-outline')}
        </View>
      );
    case 'subscriptions':
      return (
        <View style={styles.gap}>
          {heading('repeat-outline', 'Подписки')}
          {option('Музыка', 'musical-notes-outline', '199 ₽')}
          {option('Облако 200 ГБ', 'cloud-outline', '299 ₽')}
          <Text style={muted}>К оплате в этом месяце: 498 ₽</Text>
        </View>
      );
    case 'mobile':
      return (
        <View style={styles.gap}>
          {heading('phone-portrait-outline', 'Мобильная связь')}
          <Text style={muted}>Мой оператор · +7 999 123-45-67</Text>
          <Text style={[text, styles.balance, { fontSize: Math.round(t * 1.8) }]}>290 ₽</Text>
          <Text style={muted}>Интернет: 18 из 30 ГБ · Звонки: 240 из 500 мин.</Text>
          {action('Пополнить', 'add')}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  medium: { fontWeight: '600' },
  balance: { fontWeight: '800', letterSpacing: -0.5 },
  qrIcon: { padding: 12, borderRadius: 16 },
  action: {
    alignSelf: 'stretch',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operation: { paddingVertical: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
