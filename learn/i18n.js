/**
 * Язык платформы Bathys. Один язык на всю загрузку страницы: смена языка в профиле
 * сохраняет выбор и перезагружает страницу. Ключ хранения общий с полкой кассет.
 *
 * tr({ ru, en }) — выбрать строку на текущем языке. Вызывать во время работы
 * (в функциях), а не при загрузке модуля: тесты переключают язык через useLang.
 */
export const LANGS = ['ru', 'en'];
export const LANG_NAMES = { ru: 'Русский', en: 'English' };
const STORE_KEY = 'tape-lang';

function detect() {
  // без браузера (тесты в node) — русский: navigator.language там en-US
  if (typeof location === 'undefined') return 'ru';
  try {
    const q = new URLSearchParams(globalThis.location?.search ?? '').get('lang');
    if (LANGS.includes(q)) return q;
    const saved = globalThis.localStorage?.getItem(STORE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* приватный режим или node */ }
  return 'en';   // по умолчанию английский; русский — выбором в профиле или ссылкой ?lang=ru
}

// Язык живёт в globalThis: модуль может загрузиться дважды (с ?v= в адресе и без),
// и у всех копий должен быть один язык.
const KEY = '__bathysLang';
globalThis[KEY] ??= detect();

export const getLang = () => globalThis[KEY];

/** Сменить язык без перезагрузки — для тестов. */
export function useLang(next) {
  if (LANGS.includes(next)) globalThis[KEY] = next;
  return globalThis[KEY];
}

/** Сохранить выбор и перезагрузить страницу на новом языке. */
export function switchLang(next) {
  if (!LANGS.includes(next) || next === getLang()) return;
  try { localStorage.setItem(STORE_KEY, next); } catch { /* не запомним — ничего страшного */ }
  location.reload();
}

/** Строка на текущем языке. Принимает { ru, en } или готовую строку. */
export function tr(o) {
  if (o && typeof o === 'object' && !Array.isArray(o) && ('ru' in o || 'en' in o)) return o[getLang()] ?? o.ru;
  return o;
}

/** Склонение числительных: plural(n, ['урок', 'урока', 'уроков'], ['lesson', 'lessons']). */
export function plural(n, ru, en) {
  if (getLang() === 'en') return n === 1 ? en[0] : en[1];
  const m10 = n % 10, m100 = n % 100;
  return ru[m10 === 1 && m100 !== 11 ? 0 : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 1 : 2];
}
