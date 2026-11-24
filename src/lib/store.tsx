import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_APPEARANCE, normalizeAppearance, type Appearance } from './appearance';
import {
  catalog,
  initialSaved,
  initialWidgets,
  type Config,
  type ThemeName,
  type Widget,
  type WidgetType,
} from './model';

const STORAGE_KEY = 'accessible-ui-constructor-mobile:v1';
const THEMES: ThemeName[] = ['default', 'senior', 'focus', 'contrast', 'student'];
const TYPES = catalog.map((item) => item.type);

type State = {
  name: string;
  widgets: Widget[];
  theme: ThemeName;
  appearance: Appearance;
  activeId: string | null;
  dirty: boolean;
  saved: Config[];
};

const initialState: State = {
  name: 'Мой удобный банк',
  widgets: initialWidgets,
  theme: 'default',
  appearance: DEFAULT_APPEARANCE,
  activeId: null,
  dirty: true,
  saved: initialSaved,
};

function cleanWidgets(value: unknown): Widget[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const widgets: Widget[] = [];
  for (const [i, raw] of value.entries()) {
    const w = raw as Partial<Widget>;
    if (!w || !TYPES.includes(w.type as WidgetType)) return null;
    // На телефоне все виджеты показываются во всю ширину, но ширина и колонка
    // сохраняются — чтобы при переносе обратно на компьютер раскладка не потерялась.
    widgets.push({
      id: typeof w.id === 'string' && w.id ? w.id : `w-${i}-${Date.now()}`,
      type: w.type as WidgetType,
      wide: typeof w.wide === 'boolean' ? w.wide : true,
      ...(w.column === 1 || w.column === 2 ? { column: w.column } : {}),
    });
  }
  return widgets;
}

/** Разбирает конфигурацию из файла или хранилища. Тот же формат, что у веб-версии. */
export function parseConfig(value: unknown, id = `import-${Date.now()}`): Config | null {
  const c = value as Partial<Config>;
  if (!c || typeof c.name !== 'string' || !c.name.trim()) return null;
  const widgets = cleanWidgets(c.widgets);
  if (!widgets) return null;
  return {
    id: typeof c.id === 'string' && c.id ? c.id : id,
    name: c.name.slice(0, 80),
    widgets,
    theme: THEMES.includes(c.theme as ThemeName) ? (c.theme as ThemeName) : 'default',
    appearance: normalizeAppearance(c.appearance),
  };
}

function restore(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<State>;
    const widgets = cleanWidgets(s.widgets);
    if (!widgets || typeof s.name !== 'string' || !Array.isArray(s.saved)) return null;
    return {
      name: s.name,
      widgets,
      theme: THEMES.includes(s.theme as ThemeName) ? (s.theme as ThemeName) : 'default',
      appearance: normalizeAppearance(s.appearance),
      activeId: typeof s.activeId === 'string' ? s.activeId : null,
      dirty: Boolean(s.dirty),
      saved: s.saved.map((c) => parseConfig(c)).filter((c): c is Config => c !== null),
    };
  } catch {
    return null;
  }
}

type Store = State & {
  ready: boolean;
  /** Режим расстановки виджетов (не сохраняется между запусками). */
  editing: boolean;
  setEditing: (editing: boolean) => void;
  setName: (name: string) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, direction: -1 | 1) => void;
  setAppearance: (appearance: Appearance) => void;
  save: () => boolean;
  apply: (config: Config) => void;
  /** Добавить импортированный интерфейс в «Сохранённые» и сразу применить. */
  importConfig: (config: Config) => void;
  deleteSaved: (id: string) => void;
  newInterface: () => void;
  resetAll: () => void;
  currentConfig: () => Config;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(true);
  const loaded = useRef(false);

  // Загружаем сохранённое состояние один раз при запуске.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const restored = restore(raw);
        if (restored) setState(restored);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Сохраняем каждое изменение. Ошибки хранилища не ломают приложение.
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const update = useCallback(
    (patch: Partial<State> | ((s: State) => Partial<State>)) =>
      setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })),
    [],
  );

  const store = useMemo<Store>(
    () => ({
      ...state,
      ready,
      editing,
      setEditing,
      setName: (name) => update({ name, dirty: true }),
      addWidget: (type) =>
        update((s) => ({
          widgets: [...s.widgets, { id: `${type}-${Date.now()}`, type, wide: true }],
          dirty: true,
        })),
      removeWidget: (id) =>
        update((s) => ({ widgets: s.widgets.filter((w) => w.id !== id), dirty: true })),
      moveWidget: (id, direction) =>
        update((s) => {
          const i = s.widgets.findIndex((w) => w.id === id);
          const j = i + direction;
          if (i < 0 || j < 0 || j >= s.widgets.length) return {};
          const widgets = [...s.widgets];
          [widgets[i], widgets[j]] = [widgets[j], widgets[i]];
          return { widgets, dirty: true };
        }),
      setAppearance: (appearance) => update({ appearance, dirty: true }),
      save: () => {
        if (!state.name.trim()) return false;
        const config: Config = {
          id: state.activeId ?? `saved-${Date.now()}`,
          name: state.name.trim(),
          widgets: state.widgets,
          theme: state.theme,
          appearance: state.appearance,
        };
        update((s) => ({
          saved: s.saved.some((c) => c.id === config.id)
            ? s.saved.map((c) => (c.id === config.id ? config : c))
            : [...s.saved, config],
          activeId: config.id,
          dirty: false,
        }));
        return true;
      },
      apply: (config) =>
        update((s) => ({
          name: config.name,
          widgets: config.widgets,
          theme: config.theme,
          appearance: normalizeAppearance(config.appearance ?? DEFAULT_APPEARANCE),
          activeId: s.saved.some((c) => c.id === config.id) ? config.id : null,
          dirty: false,
        })),
      importConfig: (config) => {
        const saved: Config = { ...config, id: `saved-${Date.now()}` };
        update((s) => ({
          saved: [...s.saved, saved],
          name: saved.name,
          widgets: saved.widgets,
          theme: saved.theme,
          appearance: normalizeAppearance(saved.appearance ?? DEFAULT_APPEARANCE),
          activeId: saved.id,
          dirty: false,
        }));
      },
      deleteSaved: (id) =>
        update((s) => ({
          saved: s.saved.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      newInterface: () =>
        update({
          name: 'Новый интерфейс',
          widgets: [],
          theme: 'default',
          appearance: DEFAULT_APPEARANCE,
          activeId: null,
          dirty: true,
        }),
      resetAll: () => {
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
        setState(initialState);
      },
      currentConfig: () => ({
        id: state.activeId ?? 'current',
        name: state.name,
        widgets: state.widgets,
        theme: state.theme,
        appearance: state.appearance,
      }),
    }),
    [state, ready, editing, update],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
