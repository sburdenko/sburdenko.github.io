/**
 * Строки интерфейса Bathys. Тексты лежат в данных: content/ui/<язык>.json, плоские пары
 * «ключ → строка» (там же тексты каталога: course.<id>.title, group.<id>.blurb).
 * t('key', { n: 3 }) подставляет {n}; нет строки на языке — берётся английская, потом русская.
 * Модуль дожидается загрузки строк (top-level await), так что t() можно звать сразу.
 */
import { getLang, LANGS } from './i18n.js?v=202610131220';
import { readJson } from './content.js?v=202610131220';

const FALLBACKS = ['en', 'ru'];
const need = [...new Set([...FALLBACKS, ...LANGS, getLang()])];
const S = {};   // { язык: { ключ: строка } }
await Promise.all(need.map(async l => {
  try { S[l] = await readJson(`ui/${l}.json`); }
  catch (e) { if (FALLBACKS.includes(l)) throw e; /* языка без перевода интерфейса может не быть */ }
}));

const pick = key => {
  for (const l of [getLang(), ...FALLBACKS]) if (S[l]?.[key] != null) return S[l][key];
  return undefined;
};

/** Строка интерфейса на текущем языке. */
export function t(key, vars = {}) {
  const s = pick(key);
  if (s == null) return key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Строка на всех загруженных языках: { ru, en } — для tr(). Так в реестре курсов лежат названия. */
export const bi = key => Object.fromEntries(Object.keys(S).map(l => [l, S[l][key] ?? pick(key) ?? key]));

/** Для тестов: все ключи и языки. */
export const UI_STRINGS = Object.fromEntries(Object.keys(S.ru).map(k => [k, Object.fromEntries(Object.keys(S).map(l => [l, S[l][k]]))]));
