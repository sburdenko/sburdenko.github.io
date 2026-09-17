import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { COMMON } from '../assets/i18n-common.js';
import { HUB } from '../assets/i18n-hub.js';
import { DICT as BFS } from '../algorithms/bfs-dfs/i18n.js';
import { DICT as UNITY } from '../unity-rendering/i18n.js';
import { PATHS, TECHNIQUES, unavailableReason, available } from '../unity-rendering/model.js';
import { DICT as URP } from '../unity-urp/i18n.js';
import { DICT as PATTERNS } from '../unity-patterns/i18n.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const jsFiles = dir => readdirSync(join(root, dir)).filter(f => f.endsWith('.js')).map(f => join(dir, f));

const PAGES = [
  { name: 'полка', dicts: [COMMON, HUB], html: ['index.html'], js: ['assets/hub.js', 'assets/i18n.js'] },
  { name: 'BFS/DFS', dicts: [COMMON, BFS], html: ['algorithms/bfs-dfs/index.html'], js: jsFiles('algorithms/bfs-dfs') },
  { name: 'батчинг', dicts: [COMMON, UNITY], html: ['unity-rendering/index.html'], js: jsFiles('unity-rendering') },
  { name: 'URP', dicts: [COMMON, URP], html: ['unity-urp/index.html'], js: jsFiles('unity-urp') },
  { name: 'паттерны', dicts: [COMMON, PATTERNS], html: ['unity-patterns/index.html'], js: jsFiles('unity-patterns') }
];

test('у каждой строки есть оба языка и один и тот же тип значения', () => {
  for (const dict of [COMMON, HUB, BFS, UNITY, URP, PATTERNS]) {
    for (const [key, value] of Object.entries(dict)) {
      assert.ok(value.en !== undefined, `${key}: нет английского варианта`);
      assert.ok(value.ru !== undefined, `${key}: нет русского варианта`);
      assert.equal(typeof value.en, typeof value.ru, `${key}: разный тип значения в en и ru`);
      if (Array.isArray(value.en)) {
        assert.ok(Array.isArray(value.ru), `${key}: ru должен быть массивом`);
        assert.equal(value.en.length, value.ru.length, `${key}: разная длина массивов`);
      }
      if (typeof value.en === 'string') {
        assert.ok(value.en.trim() && value.ru.trim(), `${key}: пустая строка`);
      }
    }
  }
});

test('каждый ключ из разметки есть в словаре страницы', () => {
  for (const page of PAGES) {
    const known = new Set(page.dicts.flatMap(d => Object.keys(d)));
    for (const file of page.html) {
      const html = read(file);
      const keys = [...html.matchAll(/data-i18n(?:-title|-aria)?="([^"]+)"/g)].map(m => m[1]);
      assert.ok(keys.length > 10, `${file}: разметка без ключей локализации`);
      for (const key of keys) assert.ok(known.has(key), `${page.name} · ${file}: нет ключа ${key}`);
    }
  }
});

test('каждый ключ, который запрашивает код, есть в словаре страницы', () => {
  for (const page of PAGES) {
    const known = new Set(page.dicts.flatMap(d => Object.keys(d)));
    for (const file of page.js) {
      const src = read(file);
      // только цельные литералы: t('key') и t('key', …). Собранные из кусков проверяются ниже.
      const keys = [...src.matchAll(/\bt\('([a-zA-Z][\w.]*)'\s*[),]/g)].map(m => m[1]);
      for (const key of keys) assert.ok(known.has(key), `${page.name} · ${file}: нет ключа ${key}`);
    }
  }
});

test('семейства ключей, которые код собирает на лету, заполнены целиком', () => {
  for (const order of ['bfs', 'dfs']) {
    assert.ok(BFS['code.' + order], `нет псевдокода ${order}`);
    assert.equal(BFS['code.' + order].en.length, 10, 'псевдокод из 10 строк');
  }
  for (const type of ['init', 'pop', 'visit', 'push', 'skip', 'dup', 'goal', 'done']) {
    assert.ok(BFS['ev.' + type], `нет описания события ${type}`);
    assert.ok(BFS['ev.tag.' + type], `нет метки события ${type}`);
  }
  for (const path of Object.keys(PATHS)) {
    assert.ok(UNITY['path.info.' + path], `нет описания пути ${path}`);
  }
  for (const key of Object.keys(TECHNIQUES)) {
    assert.ok(UNITY[unavailableReason(key, { pipe: 'birp', srp: false })] || available(key, { pipe: 'birp', srp: false }),
      `нет причины недоступности для ${key}`);
  }
});

test('английский и русский словари не перепутаны местами', () => {
  const cyrillic = /[а-яё]/i;
  for (const dict of [COMMON, HUB, BFS, UNITY, URP, PATTERNS]) {
    for (const [key, value] of Object.entries(dict)) {
      if (typeof value.en !== 'string') continue;
      assert.equal(cyrillic.test(value.en), false, `${key}: кириллица в английском варианте`);
    }
  }
});
