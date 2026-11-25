/**
 * Формат файла конфигурации — общий с веб-версией.
 * Описание: https://github.com/TewCorejz/accessible-ui-constructor/blob/main/docs/config-format.md
 * Схема:    https://github.com/TewCorejz/accessible-ui-constructor/blob/main/schema/interface-config.schema.json
 */
import YAML from 'yaml';

import { MAX_FONT_SIZE, MIN_FONT_SIZE, isHexColor, type Appearance } from './appearance';
import type { Config, ThemeName, Widget, WidgetType } from './model';

export const FORMAT_VERSION = 1;
export const SCHEMA_URL =
  'https://raw.githubusercontent.com/TewCorejz/accessible-ui-constructor/main/schema/interface-config.schema.json';

const THEMES: ThemeName[] = ['default', 'senior', 'focus', 'contrast', 'student'];
const TYPES: WidgetType[] = [
  'balance',
  'qr',
  'history',
  'quick',
  'studentQr',
  'subscriptions',
  'mobile',
];

/** Объект для экспорта / «Поделиться» — ровно те поля, что описаны в схеме. */
export function toExportObject(config: Config) {
  return {
    $schema: SCHEMA_URL,
    formatVersion: FORMAT_VERSION,
    name: config.name,
    theme: config.theme,
    ...(config.appearance ? { appearance: config.appearance } : {}),
    widgets: config.widgets.map((w) => ({
      id: w.id,
      type: w.type,
      wide: w.wide,
      ...(!w.wide && w.column ? { column: w.column } : {}),
    })),
  };
}

const unescapeXml = (text: string) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

function attrs(tag: string) {
  const result: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) result[m[1]] = unescapeXml(m[2]);
  return result;
}

/** Разбор XML-варианта формата (в React Native нет DOMParser). */
function parseXml(text: string): unknown {
  const root = text.match(/<interface\b([^>]*)>([\s\S]*?)<\/interface>/);
  if (!root) throw new Error('В XML-файле нет элемента <interface>.');
  const [, rootAttrs, body] = root;
  const version = attrs(rootAttrs).formatVersion;
  const name = body.match(/<name>([\s\S]*?)<\/name>/)?.[1];
  const theme = body.match(/<theme>([\s\S]*?)<\/theme>/)?.[1];
  const appearanceTag = body.match(/<appearance\b([^>]*)\/?>/)?.[1];
  const a = appearanceTag ? attrs(appearanceTag) : null;
  return {
    ...(version !== undefined ? { formatVersion: Number(version) } : {}),
    name: name !== undefined ? unescapeXml(name.trim()) : undefined,
    theme: theme?.trim(),
    ...(a
      ? {
          appearance: {
            fontSize: Number(a.fontSize),
            primary: a.primary ?? null,
            secondary: a.secondary ?? null,
          },
        }
      : {}),
    widgets: [...body.matchAll(/<widget\b([^>]*)\/?>/g)].map((m) => {
      const w = attrs(m[1]);
      return {
        id: w.id,
        type: w.type,
        wide: w.wide === 'true',
        ...(w.column !== undefined ? { column: Number(w.column) } : {}),
      };
    }),
  };
}

/** Читает JSON, YAML или XML в обычный объект (без проверки). */
export async function parseFile(fileName: string, text: string): Promise<unknown> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.xml')) return parseXml(text);
  if (lower.endsWith('.json')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Некорректный JSON-файл.');
    }
  }
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    try {
      return YAML.parse(text);
    } catch {
      throw new Error('Некорректный YAML-файл.');
    }
  }
  throw new Error('Поддерживаются файлы .json, .yaml и .xml.');
}

export type ValidationResult = { ok: true; config: Config } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Проверка по правилам схемы. Те же правила и сообщения, что в веб-версии. */
export function validateConfig(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(data)) return { ok: false, errors: ['Файл не содержит конфигурацию интерфейса.'] };

  const version = data.formatVersion ?? FORMAT_VERSION;
  if (version !== FORMAT_VERSION)
    errors.push(
      typeof version === 'number' && version > FORMAT_VERSION
        ? `Файл создан более новой версией конструктора (формат ${version}). Обновите приложение.`
        : `Неизвестная версия формата: ${String(version)}.`,
    );

  const name = data.name;
  if (typeof name !== 'string' || !name.trim()) errors.push('Не указано название интерфейса.');
  else if (name.length > 80) errors.push('Название длиннее 80 символов.');

  const theme = data.theme ?? 'default';
  if (!THEMES.includes(theme as ThemeName)) errors.push(`Неизвестный шаблон «${String(theme)}».`);

  let appearance: Appearance | undefined;
  if (data.appearance !== undefined && data.appearance !== null) {
    const a = data.appearance;
    if (!isObject(a)) errors.push('Блок оформления (appearance) повреждён.');
    else {
      const size = a.fontSize;
      if (
        !Number.isInteger(size) ||
        (size as number) < MIN_FONT_SIZE ||
        (size as number) > MAX_FONT_SIZE
      )
        errors.push(
          `Размер текста должен быть целым числом от ${MIN_FONT_SIZE} до ${MAX_FONT_SIZE}.`,
        );
      for (const key of ['primary', 'secondary'] as const) {
        const v = a[key];
        if (v !== undefined && v !== null && !isHexColor(v))
          errors.push(`Цвет ${key} должен быть в формате #RRGGBB.`);
      }
      appearance = {
        fontSize: size as number,
        primary: isHexColor(a.primary) ? a.primary.toLowerCase() : null,
        secondary: isHexColor(a.secondary) ? a.secondary.toLowerCase() : null,
      };
    }
  }

  const widgets: Widget[] = [];
  if (!Array.isArray(data.widgets)) errors.push('Нет списка виджетов (widgets).');
  else if (data.widgets.length > 30) errors.push('Виджетов больше 30.');
  else
    data.widgets.forEach((raw, i) => {
      const n = i + 1;
      if (!isObject(raw)) return errors.push(`Виджет ${n} повреждён.`);
      if (!TYPES.includes(raw.type as WidgetType))
        return errors.push(`Виджет ${n}: неизвестный тип «${String(raw.type)}».`);
      if (typeof raw.wide !== 'boolean')
        return errors.push(`Виджет ${n}: не указана ширина (wide).`);
      if (raw.column !== undefined && raw.column !== 1 && raw.column !== 2)
        return errors.push(`Виджет ${n}: колонка должна быть 1 или 2.`);
      widgets.push({
        id: `import-${Date.now()}-${n}`,
        type: raw.type as WidgetType,
        wide: raw.wide,
        ...(raw.column && !raw.wide ? { column: raw.column as 1 | 2 } : {}),
      });
    });

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    config: {
      id: `import-${Date.now()}`,
      name: (name as string).trim().slice(0, 80),
      theme: theme as ThemeName,
      appearance,
      widgets,
    },
  };
}
