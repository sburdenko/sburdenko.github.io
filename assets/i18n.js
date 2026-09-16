/**
 * Локализация: словари вида { 'ключ': { en, ru } }.
 * Значение может быть строкой или функцией — тогда t('ключ', ...args) вызывает её.
 * Разметка помечается data-i18n / data-i18n-title / data-i18n-aria.
 */
import { setLocale } from './vhs.js?v=202609161617';

export const LANGS = ['en', 'ru'];
const STORE_KEY = 'tape-lang';
const LOCALES = { en: 'en-US', ru: 'ru-RU' };

const registry = new Map();
const listeners = new Set();
let lang = 'en';

export const getLang = () => lang;

export function t(key, ...args) {
  const entry = registry.get(key);
  if (!entry) return key;
  const value = entry[lang] ?? entry.en;
  return typeof value === 'function' ? value(...args) : value;
}

export function register(dict) {
  for (const key of Object.keys(dict)) registry.set(key, dict[key]);
}

/** Подписка на смену языка: вернёт функцию отписки. */
export function onLang(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function stored() {
  try { return localStorage.getItem(STORE_KEY); } catch { return null; }
}

function remember(value) {
  try { localStorage.setItem(STORE_KEY, value); } catch { /* приватный режим — просто не запоминаем */ }
}

function applyDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const value = t(el.dataset.i18n);
    if (value !== el.dataset.i18n) el.innerHTML = value;
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  root.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  const title = t('page.title');
  if (title !== 'page.title') document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && t('page.desc') !== 'page.desc') desc.content = t('page.desc');
}

export function setLang(next, { silent = false } = {}) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  remember(lang);
  setLocale(LOCALES[lang]);
  document.documentElement.lang = lang;
  applyDom();
  syncSwitch();
  if (!silent) listeners.forEach(cb => cb(lang));
}

function syncSwitch() {
  document.querySelectorAll('#langSeg button').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.l === lang ? 'true' : 'false'));
}

/** Регистрирует словарь, выбирает язык и раскладывает тексты по разметке. */
export function initI18n(dict) {
  register(dict);
  const fromQuery = new URLSearchParams(location.search).get('lang');
  const initial = LANGS.includes(fromQuery) ? fromQuery : (LANGS.includes(stored()) ? stored() : 'en');
  lang = initial;
  setLocale(LOCALES[lang]);
  document.documentElement.lang = lang;
  applyDom();

  const seg = document.querySelector('#langSeg');
  if (seg) seg.querySelectorAll('button').forEach(b => b.onclick = () => setLang(b.dataset.l));
  syncSwitch();
  return lang;
}
