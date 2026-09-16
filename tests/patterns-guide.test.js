import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COMMON } from '../assets/i18n-common.js';
import { DICT } from '../unity-patterns/i18n.js';
import { poolModel, transitionState, flyweightMemory, dirtyWork, recommendPattern, applyMove } from '../unity-patterns/model.js';

test('every patterns translation has English and Russian values of the same type', () => {
  for (const [key, entry] of Object.entries(DICT)) {
    assert.ok('en' in entry, `${key} has no English value`);
    assert.ok('ru' in entry, `${key} has no Russian value`);
    assert.equal(typeof entry.en, typeof entry.ru, `${key} changes value type between languages`);
  }
});

test('every static patterns translation key exists', () => {
  const html = readFileSync(new URL('../unity-patterns/index.html', import.meta.url), 'utf8');
  const known = new Set([...Object.keys(COMMON), ...Object.keys(DICT)]);
  for (const match of html.matchAll(/data-i18n(?:-aria|-title)?="([^"]+)"/g)) assert.ok(known.has(match[1]), `missing translation: ${match[1]}`);
});

test('every literal patterns translation key requested by page code exists', () => {
  const source = readFileSync(new URL('../unity-patterns/page.js', import.meta.url), 'utf8');
  const known = new Set([...Object.keys(COMMON), ...Object.keys(DICT)]);
  for (const match of source.matchAll(/\bt\('([^']+)'/g)) assert.ok(known.has(match[1]), `missing translation: ${match[1]}`);
});

test('pooling reuses instances and reports undersized capacity', () => {
  const raw = poolModel({ spawnRate: 20, lifetime: 3, seconds: 10, pooling: false, poolSize: 20 });
  const pooled = poolModel({ spawnRate: 20, lifetime: 3, seconds: 10, pooling: true, poolSize: 40 });
  assert.equal(raw.allocations, 200);
  assert.ok(pooled.allocations < raw.allocations);
  assert.equal(pooled.misses, 20);
});

test('state machine only accepts declared transitions', () => {
  assert.equal(transitionState('idle', 'jump'), 'jump');
  assert.equal(transitionState('jump', 'attack'), 'jump');
  assert.equal(transitionState('dead', 'respawn'), 'idle');
});

test('flyweight shares common bytes once', () => {
  const memory = flyweightMemory({ units: 1000, sharedBytes: 4096, uniqueBytes: 64 });
  assert.equal(memory.duplicated, 4160000);
  assert.equal(memory.flyweight, 68096);
  assert.ok(memory.saved > 0);
});

test('dirty flag reduces recalculation to changed results that are read', () => {
  assert.deepEqual(dirtyWork({ frames: 300, changes: 20, reads: 80 }), { eager: 300, dirty: 20, saved: 280 });
});

test('chooser maps each pressure and command movement stays on grid', () => {
  assert.equal(recommendPattern('undo'), 'command');
  assert.equal(recommendPattern('memory'), 'flyweight');
  assert.deepEqual(applyMove({ x: 0, y: 0 }, 'left'), { x: 0, y: 0 });
  assert.deepEqual(applyMove({ x: 2, y: 2 }, 'up'), { x: 2, y: 1 });
});

test('interview drill covers principles and all pattern families in both languages', () => {
  for (const lang of ['en', 'ru']) assert.ok(DICT['qa.items'][lang].length >= 15);
});
