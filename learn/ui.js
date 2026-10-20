/**
 * Строки интерфейса Bathys. Тексты лежат в данных: content/ui/<язык>.json, плоские пары
 * «ключ → строка» (там же тексты каталога: course.<id>.title, group.<id>.blurb), и
 * content/rigs/<язык>.json — подписи и объяснения стендов (ключи m.<модуль>.… и r.<модуль>.…).
 * t('key', { n: 3 }) подставляет {n}; нет строки на языке — берётся английская, потом русская.
 * Модуль дожидается загрузки строк (top-level await), так что t() можно звать сразу.
 */
import { getLang, LANGS } from './i18n.js?v=202610201333';
import { readJson } from './content.js?v=202610201333';

const FALLBACKS = ['en', 'ru'];
const need = [...new Set([...FALLBACKS, ...LANGS, getLang()])];
const S = {};   // { язык: { ключ: строка } }
await Promise.all(need.map(async l => {
  // ui/<язык>.json — интерфейс и каталог, rigs/<язык>.json — подписи и объяснения стендов
  const parts = await Promise.all([`ui/${l}.json`, `rigs/${l}.json`].map(f => readJson(f).catch(e => { if (FALLBACKS.includes(l)) throw e; return null; })));
  if (parts.some(Boolean)) S[l] = Object.assign({}, ...parts.filter(Boolean));
}));

const pick = key => {
  for (const l of [getLang(), ...FALLBACKS]) if (S[l]?.[key] != null) return S[l][key];
  return undefined;
};

const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));

/** Строка интерфейса на текущем языке. */
export function t(key, vars = {}) {
  const s = pick(key);
  return s == null ? key : fmt(s, vars);
}

/** Строка в языке lang: сам язык, потом английский, потом русский. */
const inLang = (l, key) => S[l]?.[key] ?? S.en?.[key] ?? S.ru?.[key];

/**
 * Строка на всех загруженных языках: { ru, en, … } — для tr(), когда текст хранится в данных
 * (названия в реестре курсов, подписи объектов стендов). vars подставляются в {имя}.
 */
/** @returns {{ ru: string, en: string, [lang: string]: string }} */
export const bi = (key, vars = {}) => /** @type {any} */ (Object.fromEntries(Object.keys(S).map(l => [l, fmt(inLang(l, key) ?? key, vars)])));

/**
 * Число со словом в нужной форме: формы лежат в строке через «|». Русский — три формы
 * (1 урок, 2 урока, 5 уроков), английский и прочие — две (1 lesson, 2 lessons).
 */
export function tp(key, n) {
  const forms = (pick(key) ?? key).split('|');
  if (forms.length === 3) {
    const m10 = n % 10, m100 = n % 100;
    return forms[m10 === 1 && m100 !== 11 ? 0 : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 1 : 2];
  }
  return forms[n === 1 ? 0 : forms.length - 1];
}

/** Для тестов: все ключи и языки. */
export const UI_STRINGS = Object.fromEntries(Object.keys(S.ru).map(k => [k, Object.fromEntries(Object.keys(S).map(l => [l, S[l][k]]))]));
