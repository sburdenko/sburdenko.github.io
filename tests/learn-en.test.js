/**
 * Английские версии уроков: та же структура, что у русских, те же ответы и решения стендов,
 * ни одной кириллической буквы. Один курс: COURSE=dotnet node --test tests/learn-en.test.js
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../learn/engine.js';
import { COURSES, lessonsOf } from '../learn/courses.js';

const only = process.env.COURSE;
const CYR = /[А-Яа-яЁё]/;

/** Поля, которые обязаны совпадать буквально: от них зависят проверка ответа и логика стендов. */
const SAME = ['t', 'rig', 'answer', 'solve', 'goal', 'start', 'lock', 'ops', 'sig', 'hosts', 'api', 'adds', 'content', 'methods', 'tiered', 'program', 'args', 'boss', 'minutes', 'lang', 'width', 'from', 'asset'];

function rightInput(card) {
  switch (card.t) {
    case 'choice': case 'tapline': return card.answer;
    case 'multi': return [...card.answer];
    case 'order': return card.items.map((_, i) => i);
    case 'blanks': return [...card.answer];
    default: return undefined;
  }
}

/** Пути в объекте, где встречается кириллица. */
function cyrillicPaths(v, path = '') {
  if (typeof v === 'string') return CYR.test(v) ? [`${path}: «${v.slice(0, 50)}»`] : [];
  if (Array.isArray(v)) return v.flatMap((x, i) => cyrillicPaths(x, `${path}[${i}]`));
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => cyrillicPaths(x, path ? `${path}.${k}` : k));
  return [];
}

for (const c of COURSES.filter(c => c.load && (!only || c.id === only))) {
  test(`английская версия курса ${c.id} совпадает с русской по структуре`, async () => {
    const ru = (await c.load.ru()).default;
    let en;
    try { en = (await c.load.en()).default; } catch (e) { assert.fail(`${c.id}: нет course.en.js (${e.message})`); }
    assert.equal(en.id, ru.id);
    assert.ok(en.title && !CYR.test(en.title), `${c.id}: название курса`);
    assert.equal(en.units.length, ru.units.length, `${c.id}: число разделов`);
    en.units.forEach((u, ui) => {
      const r = ru.units[ui];
      assert.equal(u.id, r.id);
      assert.equal(Boolean(u.soon), Boolean(r.soon), `${c.id}/${u.id}: soon`);
      assert.ok(u.title && u.blurb, `${c.id}/${u.id}: нет названия или описания раздела`);
      assert.deepEqual(cyrillicPaths({ title: u.title, blurb: u.blurb }), [], `${c.id}/${u.id}: кириллица`);
      if (r.soon) return;
      assert.deepEqual(u.lessons.map(l => l.id), r.lessons.map(l => l.id), `${c.id}/${u.id}: уроки`);
    });
    const ruLessons = lessonsOf(ru), enLessons = lessonsOf(en);
    enLessons.forEach((l, li) => {
      const r = ruLessons[li];
      const at0 = l.id;
      assert.ok(l.title && l.sub, `${at0}: нет названия или подзаголовка`);
      assert.deepEqual(cyrillicPaths(l), [], `${at0}: осталась кириллица`);
      assert.equal(l.cards.length, r.cards.length, `${at0}: число карточек`);
      l.cards.forEach((card, i) => {
        const rc = r.cards[i], at = `${at0} #${i + 1} (${rc.t})`;
        for (const k of SAME) assert.deepEqual(card[k], rc[k], `${at}: поле ${k} должно совпадать с русским`);
        for (const k of ['options', 'items', 'pairs', 'tiles', 'labels']) {
          if (rc[k]) assert.equal(card[k]?.length, rc[k].length, `${at}: длина ${k}`);
        }
        if (rc.code) assert.equal(card.code.split('\n').length, rc.code.split('\n').length, `${at}: в коде другое число строк`);
        if (rc.t === 'rig' && rc.options) assert.deepEqual(card.options, rc.options, `${at}: options стенда — это код, их не переводят`);
        if (rc.bugs) assert.deepEqual(card.bugs.map(b => b.lines), rc.bugs.map(b => b.lines), `${at}: строки багов должны совпадать с русскими`);
        if (rc.steps) assert.equal(card.steps.length, rc.steps.length, `${at}: шаги стенда`);
        if (Array.isArray(rc.variants)) assert.deepEqual(card.variants, rc.variants, `${at}: variants`);
        else if (rc.variants && typeof rc.variants === 'object') assert.deepEqual(Object.keys(card.variants), Object.keys(rc.variants), `${at}: варианты`);
        if (E.GRADED.has(card.t)) {
          assert.ok(card.q, `${at}: нет вопроса`);
          assert.ok(E.check(card, rightInput(card)), `${at}: верный ответ не проходит проверку`);
        }
        if (card.t === 'choice' || card.t === 'multi') {
          assert.ok(card.explain, `${at}: нет объяснения`);
          assert.equal(new Set(card.options).size, card.options.length, `${at}: повторяются варианты`);
        }
        if (card.t === 'learn') assert.ok(card.title && card.body, `${at}: нет заголовка или текста`);
        if (card.t === 'rig') assert.ok(card.task, `${at}: нет задания`);
        if (card.t === 'blanks') {
          assert.equal(E.blankCount(card.code), card.answer.length, `${at}: пропуски`);
          const pool = [...card.tiles];
          for (const a of card.answer) { const k = pool.indexOf(a); assert.ok(k >= 0, `${at}: нет плитки ${a}`); pool.splice(k, 1); }
        }
        if (card.t === 'match') {
          assert.equal(new Set(card.pairs.map(p => p[0])).size, card.pairs.length, `${at}: повторяется левая часть`);
          assert.equal(new Set(card.pairs.map(p => p[1])).size, card.pairs.length, `${at}: повторяется правая часть`);
        }
      });
    });
  });
}
