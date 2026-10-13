/**
 * Переводит курс из модулей learn/<курс>/course.js + course.en.js в данные content/<курс>/.
 *   node tools/content-convert.mjs <папка курса в learn/> [--keep]
 * Проверяет, что обратная сборка даёт те же объекты, что были в модулях (русский и английский).
 * После успеха удаляет старые модули курса, если не указан --keep.
 *
 * Правило: строка, которая в русской и английской версии разная, уходит в i18n/<язык>/<урок>.json,
 * а на её месте в структуре остаётся метка HOLE. Одинаковые строки (код, имена типов) остаются в структуре.
 * Исключение — поля с обычным текстом (TEXT_KEYS): они переводимы всегда, даже если совпали.
 */
import { mkdirSync, writeFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { loadCourse, HOLE } from '../learn/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_KEYS = new Set(['title', 'sub', 'body', 'deep', 'explain', 'q', 'task', 'note', 'blurb']);

/** Раскладывает пару (ru, en) на общую структуру и две таблицы строк. Ошибки собирает в errors. */
export function split(ru, en) {
  const strings = { ru: {}, en: {} }, errors = [];
  const walk = (a, b, path, key) => {
    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) {
      errors.push(`${path}: разные типы`); return a;
    }
    if (typeof a === 'string') {
      if (a === b && !TEXT_KEYS.has(key)) return a;
      strings.ru[path] = a; strings.en[path] = b;
      return HOLE;
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length) { errors.push(`${path}: длины ${a.length} и ${b.length}`); return a; }
      return a.map((x, i) => walk(x, b[i], path ? `${path}/${i}` : String(i), key));
    }
    if (a && typeof a === 'object') {
      const ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length || ka.some(k => !(k in b))) { errors.push(`${path}: разные ключи (${ka.filter(k => !(k in b))} / ${kb.filter(k => !(k in a))})`); return a; }
      return Object.fromEntries(ka.map(k => [k, walk(a[k], b[k], path ? `${path}/${k}` : k, k)]));
    }
    if (a !== b) errors.push(`${path}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
    return a;
  };
  const skeleton = walk(ru, en, '', '');
  return { skeleton, strings, errors };
}

/** JSON с отступами, но массивы из простых значений — в одну строку: структура остаётся компактной. */
function pretty(v, ind = '') {
  const simple = x => x === null || typeof x !== 'object';
  if (Array.isArray(v)) {
    if (v.every(simple)) return '[' + v.map(x => JSON.stringify(x)).join(', ') + ']';
    return '[\n' + v.map(x => ind + ' ' + pretty(x, ind + ' ')).join(',\n') + '\n' + ind + ']';
  }
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    return '{\n' + ks.map(k => `${ind} ${JSON.stringify(k)}: ${pretty(v[k], ind + ' ')}`).join(',\n') + '\n' + ind + '}';
  }
  return JSON.stringify(v);
}

const write = (file, data) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pretty(data) + '\n');
};

/** Записывает один объект (урок или шапку курса) в content/<курс>/. */
export function emit(courseId, name, ru, en, lessonDir = 'lessons') {
  const { skeleton, strings, errors } = split(ru, en);
  if (errors.length) throw new Error(`${courseId}/${name}:\n  ` + errors.slice(0, 12).join('\n  '));
  const base = join(root, 'content', courseId);
  write(name === 'course' ? join(base, 'course.json') : join(base, lessonDir, `${name}.json`), skeleton);
  for (const lang of ['ru', 'en']) write(join(base, 'i18n', lang, `${name}.json`), strings[lang]);
}

const norm = x => JSON.parse(JSON.stringify(x));

async function main() {
  const dir = process.argv[2], keep = process.argv.includes('--keep');
  if (!dir) { console.error('usage: node tools/content-convert.mjs <папка курса> [--keep]'); process.exit(1); }
  const open = f => import(pathToFileURL(join(root, 'learn', dir, f)).href);
  const ruMod = (await open('course.js')).default, enMod = (await open('course.en.js')).default;
  const id = ruMod.id;
  assert.equal(enMod.id, id);
  const byId = course => Object.fromEntries(course.units.flatMap(u => (u.lessons ?? []).map(l => [l.id, l])));
  const ruL = byId(ruMod), enL = byId(enMod);
  for (const lid of Object.keys(ruL)) {
    assert.ok(enL[lid], `${lid}: нет английского урока`);
    emit(id, lid, ruL[lid], enL[lid]);
  }
  const head = c => ({ ...c, units: c.units.map(u => (u.lessons ? { ...u, lessons: u.lessons.map(l => l.id) } : u)) });
  emit(id, 'course', head(ruMod), head(enMod));

  // обратная сборка должна дать ровно то, что было
  for (const [lang, orig] of [['ru', ruMod], ['en', enMod]]) {
    const back = await loadCourse(id, lang);
    assert.deepEqual(norm(back), norm(orig), `${id}/${lang}: сборка не совпала с оригиналом`);
  }
  console.log(`content/${id}: ${Object.keys(ruL).length} уроков, сборка совпала с оригиналом на ru и en`);

  if (!keep) {
    for (const f of readdirSync(join(root, 'learn', dir), { recursive: true })) {
      const full = join(root, 'learn', dir, String(f));
      if (/\.js$/.test(String(f)) && existsSync(full)) rmSync(full);
    }
    console.log(`старые модули learn/${dir}/*.js удалены (они остаются в истории git)`);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
