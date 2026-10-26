/* Extras of tape 06 problems (extras.js): tricky inputs run, counters count, forks are real branches, links resolve. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import { EXTRAS, countOps } from '../algorithms/patterns/extras.js';
import { RIGS, runWithInput } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';

const rigIds = Object.values(PROBLEMS).flat().map(p => p.rig);
const LANGS = ['en', 'ru'];
const noCyrillic = (text, at) => assert.doesNotMatch(String(text), /[а-яё]/i, at);
const bilingual = (pair, at) => {
  for (const lang of LANGS) assert.ok(typeof pair?.[lang] === 'string' && pair[lang].trim(), `${at} ${lang}`);
  noCyrillic(pair.en, `${at} en`);
};

test('every problem has extras and nothing else does', () => {
  assert.deepEqual(Object.keys(EXTRAS).sort(), [...rigIds].sort());
});

test('tricky inputs are valid rig inputs with an explanation', () => {
  for (const id of rigIds) {
    const { tricky } = EXTRAS[id];
    assert.ok(tricky?.length >= 1 && tricky.length <= 3, `${id}: 1–3 tricky inputs`);
    tricky.forEach((tr, k) => {
      const result = runWithInput(RIGS[id], tr.input);
      assert.ok(!result.error, `${id} tricky ${k}: ${JSON.stringify(result.error)}`);
      bilingual(tr, `${id} tricky ${k}`);
    });
  }
});

test('the counter gives whole numbers on the example, random and tricky inputs', () => {
  const next = rng(560);
  for (const id of rigIds) {
    const rig = RIGS[id], { ops } = EXTRAS[id];
    bilingual(ops?.unit, `${id} ops unit`);
    bilingual(ops.naive, `${id} ops naive`);
    bilingual(ops.ours, `${id} ops ours`);
    const inputs = [rig.example, ...Array.from({ length: 20 }, () => rig.random(next)),
      ...EXTRAS[id].tricky.map(tr => runWithInput(rig, tr.input).params)];
    for (const params of inputs) {
      for (const side of ['naive', 'ours']) assert.ok(Number.isInteger(countOps(ops[side], params)), `${id} ${side} on ${JSON.stringify(params)}`);
    }
  }
});

test('predict forks name real event keys, and the example trace reaches every fork', () => {
  for (const id of rigIds) {
    const { predict } = EXTRAS[id], events = RIGS[id].run(RIGS[id].example).events;
    assert.ok(predict?.length >= 1, `${id}: a fork`);
    for (const group of predict) {
      bilingual(group.q, `${id} fork question`);
      const keys = Object.keys(group.keys);
      assert.ok(keys.length >= 2 && keys.length <= 4, `${id}: 2–4 branches`);
      for (const key of keys) {
        assert.ok(DICT[key], `${id}: event key ${key}`);
        bilingual(group.keys[key], `${id} branch ${key}`);
      }
      assert.ok(events.some((e, i) => i >= 1 && keys.includes(e.key)), `${id}: the example reaches ${keys.join('/')}`);
    }
  }
});

test('follow-ups and related problems', () => {
  for (const id of rigIds) {
    const { followups, related } = EXTRAS[id];
    assert.ok(followups?.length >= 2 && followups.length <= 3, `${id}: 2–3 follow-ups`);
    followups.forEach((f, k) => {
      for (const lang of LANGS) assert.ok(f[lang]?.q && f[lang]?.a, `${id} follow-up ${k} ${lang}`);
      noCyrillic(f.en.q + f.en.a, `${id} follow-up ${k} en`);
    });
    assert.ok(related?.length >= 1 && related.length <= 3, `${id}: 1–3 related`);
    for (const r of related) {
      assert.ok(rigIds.includes(r.id) && r.id !== id, `${id}: related ${r.id}`);
      bilingual(r, `${id} related ${r.id}`);
    }
  }
});
