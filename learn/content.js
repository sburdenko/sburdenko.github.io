/**
 * Загрузчик курсов из данных (content/). Урок хранится в трёх частях:
 *   content/<курс>/lessons/<id>.json     — структура: типы карточек, ответы, решения стендов, код;
 *                                          на месте переводимых строк стоит метка HOLE («⟦⟧»)
 *   content/<курс>/i18n/<язык>/<id>.json — только строки: { "cards/3/q": "…" }, путь внутри структуры
 *   content/<курс>/course.json (+ i18n/<язык>/course.json) — разделы и список уроков
 *   content/<курс>/bundle.<язык>.json    — всё вместе для одного языка, собирается скриптом (сайт грузит его)
 * Один и тот же JSON читают сайт, тесты и (позже) мобильный клиент. Если строки на нужном языке
 * нет, берётся английская, потом русская. Пути в строках — через «/»; числа — индексы массивов.
 */

const inNode = typeof document === 'undefined';
/** Метка ?v= из адреса этого модуля: сайт грузит его с версией, значит и JSON тоже. */
const STAMP = inNode ? '' : new URL(import.meta.url).search;

/** Метка «здесь текст из i18n». Настоящий null в данных остаётся null, поэтому метка — не null. */
export const HOLE = '⟦⟧';

/** Порядок запасных языков: сначала нужный, потом английский, потом русский (язык-источник). */
export const FALLBACKS = ['en', 'ru'];

export async function readJson(rel) {
  const url = new URL(`../content/${rel}`, import.meta.url);
  if (inNode) {
    const { readFile } = await import('node:fs/promises');
    return JSON.parse(await readFile(url, 'utf8'));
  }
  url.search = STAMP;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`content/${rel}: ${res.status}`);
  return res.json();
}

/** Записывает строку по пути «cards/3/options/1» в уже готовую структуру. */
export function setPath(root, path, value) {
  const keys = path.split('/');
  let node = root;
  for (let i = 0; i < keys.length - 1; i++) {
    node = node?.[keys[i]];
    if (node == null || typeof node !== 'object') throw new Error(`нет пути ${path}`);
  }
  const last = keys[keys.length - 1];
  if (!(last in node)) throw new Error(`нет пути ${path}`);
  node[last] = value;
}

/** Структура + строки (запасные языки уже подмешаны) → готовый объект урока или курса. */
export function fill(skeleton, strings) {
  const out = structuredClone(skeleton);
  for (const [path, value] of Object.entries(strings)) setPath(out, path, value);
  return out;
}

/** Строки на языке lang поверх запасных: ru ← en ← lang. */
async function stringsFor(course, name, lang) {
  const order = [...new Set([lang, ...FALLBACKS])].reverse();
  const merged = {};
  for (const l of order) {
    try { Object.assign(merged, await readJson(`${course}/i18n/${l}/${name}.json`)); }
    catch (e) { if (l === 'ru') throw e; }   // русский — язык-источник, он обязан быть; остальные необязательны
  }
  return merged;
}

/** @returns {Promise<import('./types.d.ts').Lesson>} */
export async function loadLesson(course, id, lang) {
  const [skeleton, strings] = await Promise.all([readJson(`${course}/lessons/${id}.json`), stringsFor(course, id, lang)]);
  return fill(skeleton, strings);
}

/**
 * Курс целиком из исходных файлов: разделы из course.json и все их уроки на языке lang.
 * @returns {Promise<import('./types.d.ts').Course>}
 */
export async function loadCourseFromSource(course, lang) {
  const [skeleton, strings] = await Promise.all([readJson(`${course}/course.json`), stringsFor(course, 'course', lang)]);
  const head = fill(skeleton, strings);
  await Promise.all(head.units.map(async u => {
    if (u.soon) return;
    u.lessons = await Promise.all(u.lessons.map(id => loadLesson(course, id, lang)));
  }));
  return head;
}

/** Запись для реестра курсов: load.ru() и load.en() возвращают { default: курс }, как модули. */
export function jsonCourse(course, langs = ['ru', 'en']) {
  return Object.fromEntries(langs.map(lang => [lang, async () => ({ default: await loadCourse(course, lang) })]));
}

/**
 * Курс для сайта и мобильных клиентов: один файл на язык (bundle.<язык>.json), собранный из исходников
 * командой tools/content-bundle.mjs. Языка нет — берётся английский, потом русский. В node (тесты,
 * инструменты) читаются исходные файлы: так проверка не зависит от того, свежий ли bundle.
 */
export async function loadCourse(course, lang) {
  if (inNode) return loadCourseFromSource(course, lang);
  for (const l of [...new Set([lang, ...FALLBACKS])]) {
    try { return await readJson(`${course}/bundle.${l}.json`); } catch { /* пробуем следующий язык */ }
  }
  throw new Error(`content/${course}: нет bundle ни для ${lang}, ни для запасных языков`);
}
