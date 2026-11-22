import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WidgetView } from '@/components/WidgetView';
import { normalizeAppearance } from '@/lib/appearance';
import { resolveLook, templateConfig, templates, type Config } from '@/lib/model';
import { useStore } from '@/lib/store';
import { Button, C, Card, SectionTitle, confirmAction } from '@/ui/kit';

/** Уменьшенное превью: первые два виджета в оформлении шаблона. */
function Preview({ config }: { config: Config }) {
  const look = resolveLook(config.theme, normalizeAppearance(config.appearance));
  const small = { ...look, text: Math.min(look.text, 15) };
  return (
    <View style={styles.preview} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {config.widgets.slice(0, 2).map((w) => (
        <View key={w.id} style={[styles.previewWidget, { backgroundColor: look.surface, borderColor: look.border }]}>
          <WidgetView type={w.type} look={small} />
        </View>
      ))}
    </View>
  );
}

export default function ChooseScreen() {
  const store = useStore();
  const router = useRouter();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [previewOf, setPreviewOf] = useState<string | null>(null);

  const apply = (config: Config) => {
    store.apply(config);
    AccessibilityInfo.announceForAccessibility(`Интерфейс «${config.name}» применён.`);
    router.navigate('/');
  };

  const confirmDelete = (config: Config) =>
    confirmAction(
      'Удалить интерфейс?',
      `«${config.name}» будет удалён с этого устройства.`,
      'Удалить',
      () => store.deleteSaved(config.id),
    );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle count={store.saved.length}>Сохранённые</SectionTitle>
      {store.saved.map((config) => (
        <Card key={config.id} style={styles.savedCard}>
          <View style={styles.savedHeader}>
            <Text style={styles.cardTitle}>{config.name}</Text>
            {store.activeId === config.id && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Текущий</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>
            Виджетов: {config.widgets.length} · сохранён на этом устройстве
          </Text>
          <View style={styles.actions}>
            <Button label="Применить" icon="checkmark" onPress={() => apply(config)} style={{ flex: 1 }} />
            <Button label="Удалить" icon="trash-outline" variant="danger" onPress={() => confirmDelete(config)} />
          </View>
        </Card>
      ))}
      <Button
        label="Новый интерфейс"
        icon="add"
        variant="secondary"
        onPress={() => {
          store.newInterface();
          router.navigate('/');
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: templatesOpen }}
        accessibilityLabel={`Шаблоны, ${templates.length}`}
        onPress={() => setTemplatesOpen(!templatesOpen)}
        style={styles.disclosure}>
        <SectionTitle count={templates.length}>Шаблоны</SectionTitle>
        <Ionicons name={templatesOpen ? 'chevron-up' : 'chevron-down'} size={26} color={C.text} />
      </Pressable>
      <Text style={styles.meta}>Готовые решения для разных потребностей. Выберите и настройте под себя.</Text>

      {templatesOpen &&
        templates.map((t) => {
          const open = previewOf === t.theme;
          return (
            <Card key={t.theme} style={styles.templateCard}>
              <View style={styles.tag}>
                <Ionicons name={t.icon} size={16} color={C.green} />
                <Text style={styles.tagText}>{t.tag}</Text>
              </View>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.body}>{t.subtitle}</Text>
              {t.features.map((f) => (
                <View key={f} style={styles.feature}>
                  <Ionicons name="checkmark" size={18} color={C.green} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => setPreviewOf(open ? null : t.theme)}
                style={styles.previewToggle}>
                <Ionicons name="eye-outline" size={20} color={C.green} />
                <Text style={styles.previewToggleText}>{open ? 'Скрыть превью' : 'Показать превью'}</Text>
              </Pressable>
              {open && <Preview config={templateConfig(t.theme)} />}
              <Button
                label="Выбрать шаблон"
                icon="arrow-forward"
                variant="secondary"
                accessibilityHint={`Применит шаблон «${t.title}»`}
                onPress={() => apply(templateConfig(t.theme))}
              />
            </Card>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  savedCard: { gap: 10 },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: C.text, flexShrink: 1 },
  activeBadge: { backgroundColor: C.greenSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  activeText: { fontSize: 13, fontWeight: '600', color: C.green },
  meta: { fontSize: 15, color: C.muted, lineHeight: 21 },
  body: { fontSize: 16, color: C.text, lineHeight: 23 },
  actions: { flexDirection: 'row', gap: 10 },
  disclosure: {
    minHeight: 56,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateCard: { gap: 10 },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.greenSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { fontSize: 13, fontWeight: '600', color: C.green },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 15, color: C.text },
  previewToggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewToggleText: { fontSize: 16, fontWeight: '600', color: C.green },
  preview: { gap: 8, padding: 10, borderRadius: 14, backgroundColor: '#eef3ee' },
  previewWidget: { borderRadius: 12, borderWidth: 1, padding: 12 },
});
