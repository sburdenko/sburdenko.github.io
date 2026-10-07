import test from 'node:test';
import assert from 'node:assert/strict';

import * as E from '../learn/engine.js';
import * as P from '../learn/progress.js';
import { runIL, jitInit, jitCall, compiledCount, RACE, raceWinner } from '../learn/models.js';
import { COURSES, findCourse, lessonsOf } from '../learn/courses.js';

const lesson = cards => ({ id: 't', cards });
const choice = { t: 'choice', q: '?', options: ['a', 'b', 'c'], answer: 1, explain: '.' };

/* ---------- движок ---------- */

test('check понимает ответ каждого типа карточки', () => {
  assert.equal(E.check(choice, 1), true);
  assert.equal(E.check(choice, 0), false);
  assert.equal(E.check({ t: 'multi', answer: [0, 2] }, [2, 0]), true);
  assert.equal(E.check({ t: 'multi', answer: [0, 2] }, [0]), false);
  assert.equal(E.check({ t: 'multi', answer: [0, 2] }, [0, 1, 2]), false);
  assert.equal(E.check({ t: 'order', items: ['x', 'y', 'z'] }, [0, 1, 2]), true);
  assert.equal(E.check({ t: 'order', items: ['x', 'y', 'z'] }, [1, 0, 2]), false);
  assert.equal(E.check({ t: 'blanks', answer: ['a', 'b'] }, ['a', 'b']), true);
  assert.equal(E.check({ t: 'blanks', answer: ['a', 'b'] }, ['b', 'a']), false);
  assert.equal(E.check({ t: 'tapline', answer: 3 }, 3), true);
  assert.equal(E.check({ t: 'learn' }), true);
});

test('ошибка ставит карточку в конец очереди, урок кончается после верного ответа', () => {
  const L = lesson([{ t: 'learn' }, choice, { t: 'learn' }]);
  const s = E.start(L);
  E.answer(s, L, true); E.next(s);                 // learn
  assert.equal(E.current(s, L), choice);
  E.answer(s, L, false); E.next(s);                // ошибка → повтор в конце
  E.answer(s, L, true); E.next(s);                 // learn
  assert.equal(s.done, false);
  assert.equal(E.current(s, L), choice);
  assert.equal(E.progress(s), 2 / 3);
  E.answer(s, L, true); E.next(s);
  assert.equal(s.done, true);
  assert.equal(E.progress(s), 1);
  const r = E.result(s);
  assert.equal(r.mistakes, 1);
  assert.equal(r.stars, 2);
  assert.equal(r.accuracy, 0);
  assert.equal(r.xp, 10);
});

test('match с ошибкой засчитывается как ошибка, но не повторяется', () => {
  const L = lesson([{ t: 'match', pairs: [] }]);
  const s = E.start(L);
  E.answer(s, L, false); E.next(s);
  assert.equal(s.done, true);
  assert.equal(E.result(s).stars, 2);
});

test('урок без ошибок даёт три звезды и бонус', () => {
  const L = lesson([choice, choice, { t: 'learn' }]);
  const s = E.start(L);
  while (!s.done) { E.answer(s, L, true); E.next(s); }
  assert.deepEqual(E.result(s, 1000), { mistakes: 0, accuracy: 100, stars: 3, xp: 10 + 2 + 5, ms: 1000 });
});

test('scramble никогда не отдаёт уже решённый порядок', () => {
  for (let n = 2; n <= 6; n++) for (let seed = 0; seed < 200; seed++) {
    const out = E.scramble(n, seed);
    assert.deepEqual([...out].sort(), [...Array(n).keys()]);
    assert.ok(out.some((v, i) => v !== i));
  }
});

/* ---------- прогресс ---------- */

test('серия растёт по дням подряд и сгорает после пропуска', () => {
  let st = { days: 0, last: null };
  st = P.bumpStreak(st, '2026-10-06'); assert.deepEqual(st, { days: 1, last: '2026-10-06' });
  st = P.bumpStreak(st, '2026-10-06'); assert.equal(st.days, 1);
  st = P.bumpStreak(st, '2026-10-07'); assert.equal(st.days, 2);
  st = P.bumpStreak(st, '2026-11-01'); assert.equal(st.days, 1);
  assert.equal(P.bumpStreak({ days: 4, last: '2026-12-31' }, '2027-01-01').days, 5);
  assert.equal(P.liveStreak({ days: 4, last: '2026-10-06' }, '2026-10-07'), 4);
  assert.equal(P.liveStreak({ days: 4, last: '2026-10-05' }, '2026-10-07'), 0);
});

test('record копит очки и хранит лучшие звёзды', () => {
  let s = P.empty();
  s = P.record(s, 'a', { xp: 20, stars: 3 }, '2026-10-07');
  s = P.record(s, 'a', { xp: 11, stars: 1 }, '2026-10-07');
  assert.equal(s.xp, 31);
  assert.equal(s.lessons.a.stars, 3);
  assert.equal(s.lessons.a.runs, 2);
  assert.ok(P.isOpen(s, ['a', 'b', 'c'], 1));
  assert.ok(!P.isOpen(s, ['a', 'b', 'c'], 2));
});

test('повреждённое сохранение не роняет страницу', () => {
  assert.deepEqual(P.parse('{oops'), P.empty());
  assert.deepEqual(P.parse('{"v":2}'), P.empty());
  assert.equal(P.parse(JSON.stringify({ v: 1, xp: 5, lessons: {} })).streak.days, 0);
});

/* ---------- модели стендов ---------- */

test('IL-машина исполняет сложение, выражение и ловит провал стека', () => {
  const add = runIL(['ldarg.0', 'ldarg.1', 'add', 'ret'], [{ name: 'a', value: 40 }, { name: 'b', value: 2 }]);
  assert.equal(add.ret, 42);
  assert.equal(add.frames.length, 5);
  assert.deepEqual(add.frames[2].stack, [40, 2]);
  assert.equal(runIL(['ldarg.0', 'ldarg.1', 'mul', 'ldarg.2', 'add', 'ret'], [{ name: 'a', value: 5 }, { name: 'b', value: 8 }, { name: 'c', value: 2 }]).ret, 42);
  assert.equal(runIL(['ldc.i4.s 10', 'ldc.i4.2', 'sub', 'ret']).ret, 8);
  const broken = runIL(['ldarg.0', 'add', 'ret'], [{ name: 'a', value: 40 }]);
  assert.match(broken.error, /underflow/);
  assert.equal(broken.frames.at(-1).pc, 1);
  assert.ok(runIL(['ldc.i4.1', 'ldc.i4.2', 'ret']).error);
  assert.ok(runIL(['ldc.i4.1']).error);
  assert.ok(runIL(['frobnicate']).error);
});

test('JIT компилирует метод один раз и не трогает невызванные', () => {
  const prog = [{ name: 'Main', calls: ['Add', 'Log'] }, { name: 'Add' }, { name: 'Log' }, { name: 'Unused' }];
  let s = jitInit(prog);
  s = jitCall(s, 'Add', 1000);
  assert.equal(s.m.Add.jits, 1);
  assert.equal(s.m.Add.calls, 1000);
  s = jitCall(jitInit(prog), 'Main');
  assert.equal(compiledCount(s), 3);
  assert.equal(s.m.Unused.state, 'stub');
  assert.ok(s.log.length <= 8);
});

test('многоуровневый JIT перекомпилирует горячий метод ровно один раз', () => {
  let s = jitInit([{ name: 'Add' }], { tiered: true });
  s = jitCall(s, 'Add', 29);
  assert.equal(s.m.Add.state, 'tier0');
  s = jitCall(s, 'Add', 1);
  assert.equal(s.m.Add.state, 'tier1');
  s = jitCall(s, 'Add', 970);
  assert.equal(s.m.Add.jits, 2);
});

test('в гонке старта первым приходит Native AOT, и только у него нет JIT', () => {
  assert.equal(raceWinner(), 'aot');
  assert.ok(RACE.find(l => l.id === 'aot').phases.every(([k]) => k !== 'jit'));
});

/* ---------- контент ---------- */

const courses = COURSES.filter(c => c.course).map(c => findCourse(c.id));
const allLessons = courses.flatMap(lessonsOf);

/** Верный ответ в том виде, в каком его отдаёт рендер карточки. */
function rightInput(card) {
  switch (card.t) {
    case 'choice': case 'tapline': return card.answer;
    case 'multi': return [...card.answer];
    case 'order': return card.items.map((_, i) => i);
    case 'blanks': return [...card.answer];
    default: return undefined;
  }
}

test('у курсов уникальные id уроков и разумная длина уроков', () => {
  const ids = allLessons.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(allLessons.length >= 9);
  for (const l of allLessons) {
    assert.ok(l.title && l.sub && l.minutes > 0, `${l.id}: нет названия, подзаголовка или времени`);
    assert.ok(l.cards.length >= 8 && l.cards.length <= 14, `${l.id}: ${l.cards.length} карточек`);
    assert.ok(l.cards.filter(c => E.GRADED.has(c.t) || c.t === 'match').length >= 4, `${l.id}: мало заданий`);
  }
});

test('каждая карточка корректна, а верный ответ проходит её же проверку', () => {
  for (const l of allLessons) l.cards.forEach((c, i) => {
    const at = `${l.id} #${i + 1} (${c.t})`;
    assert.ok(E.TYPES.has(c.t), `${at}: неизвестный тип`);
    if (E.GRADED.has(c.t)) {
      assert.ok(c.q, `${at}: нет вопроса`);
      assert.ok(E.check(c, rightInput(c)), `${at}: верный ответ не проходит проверку`);
    }
    if (c.t === 'learn') assert.ok(c.title && c.body, `${at}: нет заголовка или текста`);
    if (c.t === 'choice') {
      assert.ok(c.options.length >= 2 && c.options.length <= 4, `${at}: вариантов должно быть 2–4`);
      assert.ok(c.answer >= 0 && c.answer < c.options.length, `${at}: ответ вне вариантов`);
      assert.equal(new Set(c.options).size, c.options.length, `${at}: повторяются варианты`);
      assert.ok(c.explain, `${at}: нет объяснения`);
      for (const k of Object.keys(c.wrong ?? {})) assert.ok(+k !== c.answer && c.options[k], `${at}: пояснение к несуществующему или верному варианту ${k}`);
    }
    if (c.t === 'multi') {
      assert.ok(c.answer.length >= 1 && c.answer.length < c.options.length, `${at}: всё верно или ничего не верно`);
      assert.ok(c.answer.every(a => c.options[a]), `${at}: ответ вне вариантов`);
      assert.ok(c.explain, `${at}: нет объяснения`);
    }
    if (c.t === 'order') assert.ok(c.items.length >= 3, `${at}: меньше трёх шагов`);
    if (c.t === 'tapline') assert.ok(c.answer < c.code.split('\n').length, `${at}: ответ за пределами кода`);
    if (c.t === 'blanks') {
      assert.equal(E.blankCount(c.code), c.answer.length, `${at}: пропусков не столько, сколько ответов`);
      const pool = [...c.tiles];
      for (const a of c.answer) {
        const k = pool.indexOf(a);
        assert.ok(k >= 0, `${at}: для ответа ${a} не хватает плитки`);
        pool.splice(k, 1);
      }
      assert.ok(pool.length >= 1, `${at}: нет лишних плиток — задание решается без мысли`);
    }
    if (c.t === 'match') {
      assert.ok(c.pairs.length >= 3, `${at}: меньше трёх пар`);
      assert.equal(new Set(c.pairs.map(p => p[0])).size, c.pairs.length, `${at}: повторяется левая часть`);
      assert.equal(new Set(c.pairs.map(p => p[1])).size, c.pairs.length, `${at}: повторяется правая часть`);
    }
  });
});

test('задание каждого стенда выполнимо', () => {
  for (const l of allLessons) l.cards.filter(c => c.t === 'rig').forEach(c => {
    const at = `${l.id}: стенд ${c.rig}`;
    assert.ok(c.task, `${at}: нет задания`);
    if (c.rig === 'stack') {
      const run = runIL(c.program, c.args);
      assert.ok(c.goal === 'error' ? run.error : run.ret !== undefined, `${at}: цель «${c.goal}» недостижима`);
    }
    if (c.rig === 'jit') {
      let s = jitInit(c.methods, { tiered: c.tiered });
      for (let k = 0; k < 100; k++) s = jitCall(s, c.goal.name);
      const m = s.m[c.goal.name];
      assert.ok(c.goal.kind === 'calls' ? m.calls >= c.goal.min : m.state === c.goal.state, `${at}: цель недостижима`);
    }
  });
});
