/* Full statements of tape 06 problems (statements.js): every problem has one, and its example is the rig's own. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { STATEMENTS } from '../algorithms/patterns/statements.js';
import { RIGS } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { formatField } from '../algorithms/patterns/inputs.js';

const rigIds = Object.values(PROBLEMS).flat().map(p => p.rig);
const digits = s => String(s).replace(/[A-Za-z_]\w*/g, '').replace(/\D/g, '');
const letters = s => String(s).replace(/[^A-Za-z]/g, '');
const WORDY = new Set(['words', 'str']);

test('every problem has a statement and nothing else does', () => {
  assert.deepEqual(Object.keys(STATEMENTS).sort(), [...rigIds].sort());
});

test('statements are filled in both languages, en without Cyrillic', () => {
  for (const id of rigIds) {
    const st = STATEMENTS[id];
    assert.ok(st.ex?.in && st.ex?.out, `${id}: example`);
    for (const lang of ['en', 'ru']) {
      assert.ok(st[lang]?.text?.length > 40, `${id} ${lang}: text`);
      const fact = String(st[lang].fact ?? '').replace(/<[^>]+>/g, '');
      assert.ok(fact.length >= 60 && fact.length <= 240, `${id} ${lang}: fact of ${fact.length} characters`);
      assert.equal(Boolean(st[lang].limits), Boolean(st[lang === 'en' ? 'ru' : 'en'].limits), `${id}: limits in both languages`);
      assert.equal(Boolean(st[lang].note), Boolean(st[lang === 'en' ? 'ru' : 'en'].note), `${id}: note in both languages`);
    }
    assert.doesNotMatch(Object.values(st.en).join(' '), /[а-яё]/i, `${id} en`);
    assert.doesNotMatch(st.ex.in + st.ex.out, /[а-яё]/i, `${id} example`);
  }
});

test("a statement's example is the rig's example", () => {
  for (const id of rigIds) {
    const rig = RIGS[id], ex = STATEMENTS[id].ex.in;
    const fields = rig.fields.filter(f => f.type !== 'choice');
    assert.equal(digits(ex), digits(fields.map(f => formatField(rig.example[f.key], f)).join(' ')), `${id}: numbers of ${ex}`);
    for (const f of fields.filter(f => WORDY.has(f.type))) {
      for (const word of formatField(rig.example[f.key], f).split(/[\s,]+/).filter(Boolean)) assert.ok(ex.includes(word), `${id}: ${word} in ${ex}`);
    }
    for (const f of fields.filter(f => f.type === 'board')) assert.ok(letters(ex).includes(letters(formatField(rig.example[f.key], f))), `${id}: board in ${ex}`);
  }
});
