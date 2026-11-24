import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text, TextInput } from '@/ui/Text';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DraggableList } from '@/components/DraggableList';
import { WidgetView } from '@/components/WidgetView';
import { tint } from '@/lib/appearance';
import { STUDENT_TYPES, catalog, resolveLook, widgetTitle, type WidgetType } from '@/lib/model';
import { useStore } from '@/lib/store';
import { Button, C, Card, IconButton, SectionTitle } from '@/ui/kit';

export default function HomeScreen() {
  const store = useStore();
  const { widgets, theme, appearance, editing } = store;
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false);
  const look = resolveLook(theme, appearance);
  const available = catalog.filter(
    (item) => theme === 'student' || !STUDENT_TYPES.includes(item.type),
  );

  // Сообщение исчезает само, чтобы не вводить в заблуждение после других действий.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const say = (message: string) => {
    setNotice(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  const add = (type: WidgetType) => {
    store.addWidget(type);
    setCatalogOpen(false);
    say(`Виджет «${widgetTitle(type)}» добавлен в конец экрана.`);
  };

  return (
    <GestureScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!dragging}>
      <Card>
        <Text style={styles.label} nativeID="name-label">
          Название интерфейса
        </Text>
        <TextInput
          underlineColorAndroid="transparent"
          value={store.name}
          onChangeText={(text) => store.setName(text.replace(/\n/g, ' '))}
          multiline
          submitBehavior="blurAndSubmit"
          maxLength={80}
          placeholder="Например, Мой удобный банк"
          accessibilityLabelledBy="name-label"
          accessibilityLabel="Название интерфейса"
          style={styles.input}
        />
        <View style={styles.status}>
          <Ionicons
            name={store.dirty ? 'ellipse' : 'checkmark-done'}
            size={store.dirty ? 10 : 18}
            color={store.dirty ? '#b08a2e' : C.green}
          />
          <Text style={styles.statusText}>
            {store.dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
          </Text>
        </View>
      </Card>

      <View style={styles.headingRow}>
        <SectionTitle count={widgets.length}>Мой экран</SectionTitle>
        <EditToggle />
      </View>

      <View style={[styles.workspace, { backgroundColor: tint(look.primary, 0.06, '#ffffff') }]}>
        {widgets.length === 0 && (
          <Text style={styles.empty}>Пока пусто. Добавьте первый виджет кнопкой ниже.</Text>
        )}
        <DraggableList
          items={widgets}
          enabled={editing}
          onDragStateChange={setDragging}
          onMove={(from, to) => {
            const w = widgets[from];
            store.moveWidgetTo(w.id, to);
            say(`«${widgetTitle(w.type)}» — позиция ${to + 1} из ${widgets.length}.`);
          }}
          renderItem={(w, i, isDragging) => {
            const title = widgetTitle(w.type);
            const move = (direction: -1 | 1) => {
              const to = i + direction;
              if (to < 0 || to >= widgets.length) return;
              store.moveWidget(w.id, direction);
              say(`«${title}» — позиция ${to + 1} из ${widgets.length}.`);
            };
            return (
              <View
                style={[
                  styles.widget,
                  {
                    backgroundColor: look.surface,
                    borderColor: isDragging ? look.primary : look.border,
                  },
                  isDragging && styles.widgetDragging,
                ]}>
                <WidgetView type={w.type} look={look} />
                {editing && (
                  <View style={styles.controls}>
                    <View
                      style={styles.positionWrap}
                      accessible
                      accessibilityLabel={`Виджет «${title}», позиция ${i + 1} из ${widgets.length}`}
                      accessibilityHint="Проведите вверх или вниз, чтобы переставить"
                      accessibilityActions={[
                        { name: 'increment', label: 'Поднять выше' },
                        { name: 'decrement', label: 'Опустить ниже' },
                      ]}
                      onAccessibilityAction={(e) =>
                        move(e.nativeEvent.actionName === 'increment' ? -1 : 1)
                      }>
                      <Ionicons name="reorder-three" size={24} color={look.muted} />
                      <Text style={[styles.position, { color: look.muted }]}>
                        {i + 1} из {widgets.length}
                      </Text>
                    </View>
                    <IconButton
                      icon="arrow-up"
                      label={`Поднять виджет «${title}» выше`}
                      disabled={i === 0}
                      color={look.onSurface}
                      onPress={() => move(-1)}
                    />
                    <IconButton
                      icon="arrow-down"
                      label={`Опустить виджет «${title}» ниже`}
                      disabled={i === widgets.length - 1}
                      color={look.onSurface}
                      onPress={() => move(1)}
                    />
                    <IconButton
                      icon="trash-outline"
                      label={`Удалить виджет «${title}»`}
                      color={look.onSurface === '#ffffff' ? '#ff9aa9' : C.danger}
                      onPress={() => {
                        store.removeWidget(w.id);
                        say(`Виджет «${title}» удалён.`);
                      }}
                    />
                  </View>
                )}
              </View>
            );
          }}
        />
        {editing && widgets.length > 1 && (
          <Text style={[styles.dragHint, { color: C.muted }]}>
            Удерживайте виджет и перетащите, чтобы переставить. Или используйте стрелки.
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Добавить виджет"
          accessibilityHint="Откроет список доступных виджетов"
          onPress={() => setCatalogOpen(true)}
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="add" size={26} color={C.green} />
          <Text style={styles.addText}>Добавить виджет</Text>
        </Pressable>
      </View>

      {notice ? (
        <Text style={styles.notice} accessibilityLiveRegion="polite">
          {notice}
        </Text>
      ) : null}

      <Button
        label="Сохранить"
        icon="checkmark"
        onPress={() =>
          store.save()
            ? say('Интерфейс сохранён. Он доступен во вкладке «Выбрать».')
            : say('Введите название интерфейса.')
        }
      />

      <Modal
        visible={catalogOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCatalogOpen(false)}>
        <View style={styles.backdrop}>
          <SafeAreaView
            edges={['bottom']}
            style={styles.sheet}
            // VoiceOver не уходит за пределы панели; жест «Z» (Escape) закрывает её.
            accessibilityViewIsModal
            onAccessibilityEscape={() => setCatalogOpen(false)}>
            <View style={styles.sheetHeader}>
              <SectionTitle count={available.length}>Добавить виджет</SectionTitle>
              <IconButton
                icon="close"
                label="Закрыть список виджетов"
                onPress={() => setCatalogOpen(false)}
              />
            </View>
            <Text style={styles.sheetHint}>Нажмите на виджет, чтобы добавить его на экран.</Text>
            <ScrollView contentContainerStyle={styles.catalog}>
              {available.map((item) => (
                <Pressable
                  key={item.type}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.description}`}
                  accessibilityHint="Добавит виджет на экран"
                  onPress={() => add(item.type)}
                  style={({ pressed }) => [
                    styles.catalogItem,
                    pressed && { backgroundColor: C.greenSoft },
                  ]}>
                  <View style={styles.catalogIcon}>
                    <Ionicons name={item.icon} size={26} color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catalogTitle}>{item.title}</Text>
                    <Text style={styles.catalogDesc}>{item.description}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={28} color={C.green} />
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </GestureScrollView>
  );
}

function EditToggle() {
  const { editing, setEditing } = useStore();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Режим расстановки"
      accessibilityState={{ checked: editing }}
      onPress={() => setEditing(!editing)}
      style={[styles.toggle, editing && styles.toggleOn]}>
      <Ionicons
        name={editing ? 'construct' : 'eye-outline'}
        size={18}
        color={editing ? C.green : C.muted}
      />
      <Text style={[styles.toggleText, editing && { color: C.green }]}>
        {editing ? 'Расстановка' : 'Просмотр'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18, paddingBottom: 32 },
  label: { fontSize: 16, fontWeight: '600', color: C.text },
  input: {
    backgroundColor: C.card, // убирает системное подчёркивание поля на Android
    marginTop: 10,
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    color: C.text,
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statusText: { fontSize: 14, color: C.muted },
  headingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  workspace: {
    borderRadius: 20,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  widget: { borderRadius: 16, borderWidth: 1, padding: 16 },
  widgetDragging: { borderWidth: 2 },
  positionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 'auto',
    minHeight: 48,
  },
  dragHint: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  position: { fontSize: 14 },
  empty: { fontSize: 16, color: C.muted, textAlign: 'center', padding: 16 },
  addButton: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9cc3a2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addText: { fontSize: 17, fontWeight: '600', color: C.green },
  notice: {
    fontSize: 15,
    color: C.text,
    backgroundColor: C.greenSoft,
    padding: 12,
    borderRadius: 12,
  },
  toggle: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  toggleOn: { backgroundColor: C.greenSoft, borderColor: '#b7d8bc' },
  toggleText: { fontSize: 15, fontWeight: '600', color: C.muted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetHint: { fontSize: 15, color: C.muted, marginTop: 4, marginBottom: 12 },
  catalog: { gap: 10, paddingBottom: 12 },
  catalogItem: {
    minHeight: 72,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  catalogIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogTitle: { fontSize: 17, fontWeight: '600', color: C.text },
  catalogDesc: { fontSize: 14, color: C.muted, marginTop: 2 },
});
