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

/* ---------- модели разделов 2–4 ---------- */
import { memRun, memReachable, memRig, gcRig, gcInit, gcCollect, gcFinalize, fileRig } from '../learn/models-mem.js';
import { raceInit, raceStep, raceCan, raceDone, raceRandom, raceRig, lockInit, lockStep, lockCan, lockStatus, lockRig, poolInit, poolAdd, poolTick, poolAvgWait, poolRig } from '../learn/models-threads.js';

test('стек и куча: структура копируется, класс — нет, ref меняет чужую переменную', () => {
  const run = kind => memRun([
    { line: 0, ops: [{ op: 'new', name: 'a', type: 'P', kind, fields: { X: 1 } }] },
    { line: 1, ops: [{ op: 'copy', to: 'b', from: 'a' }] },
    { line: 2, ops: [{ op: 'set', target: 'b', field: 'X', value: 9 }] }
  ]).at(-1).s;
  const sv = run('val'), sr = run('ref');
  assert.equal(sv.frames[0].vars[0].value.X, 1);
  assert.equal(sr.heap[0].fields.X, 9);
  assert.equal(sr.frames[0].vars[0].value, sr.frames[0].vars[1].value);
  const byRef = memRun([
    { line: 0, ops: [{ op: 'new', name: 'p', type: 'P', kind: 'val', fields: { X: 1 } }] },
    { line: 1, ops: [{ op: 'call', fn: 'M', params: [{ name: 'q', from: 'p', ref: true }] }] },
    { line: 2, ops: [{ op: 'set', target: 'q', field: 'X', value: 99 }] },
    { line: 3, ops: [{ op: 'ret' }] }
  ]).at(-1).s;
  assert.equal(byRef.frames.length, 1);
  assert.equal(byRef.frames[0].vars[0].value.X, 99);
});

test('стек и куча: упаковка копирует, строки неизменяемы, брошенный объект — мусор', () => {
  const s = memRun([
    { line: 0, ops: [{ op: 'int', name: 'n', value: 42 }, { op: 'box', name: 'o', from: 'n' }, { op: 'set', target: 'n', value: 7 }, { op: 'unbox', name: 'm', from: 'o' }] },
    { line: 1, ops: [{ op: 'str', name: 'a', text: 'кот' }, { op: 'copy', to: 'b', from: 'a' }, { op: 'concat', name: 'b', from: 'b', text: 'ик' }] },
    { line: 2, ops: [{ op: 'new', name: 'x', type: 'P', kind: 'ref', fields: {} }, { op: 'null', name: 'x' }] }
  ]).at(-1).s;
  const v = n => s.frames[0].vars.find(x => x.name === n);
  assert.equal(v('m').value, 42);
  assert.equal(s.heap.find(o => o.id === v('a').value).text, 'кот');
  assert.equal(s.heap.find(o => o.id === v('b').value).text, 'котик');
  const live = memReachable(s);
  assert.equal(s.heap.length - live.size, 1);
});

test('GC: цикл удаляется, LOH ждёт полной сборки, финализатору нужны две сборки', () => {
  let s = gcInit({ objects: [{ id: 'A', refs: ['B'] }, { id: 'B', refs: ['A'] }, { id: 'L', big: true }, { id: 'F', fin: true }], roots: [{ name: 'a', to: 'A' }] });
  s = gcRig.act({}, s, 'root:a');
  s = gcCollect(s, 0);
  assert.ok(!s.objs.A.alive && !s.objs.B.alive);
  assert.ok(s.objs.L.alive, 'LOH не собирается сборкой Gen 0');
  assert.ok(s.objs.F.alive && s.objs.F.queued && s.objs.F.gen === 1);
  s = gcCollect(gcFinalize(s), 0);
  assert.ok(s.objs.F.alive, 'после финализатора F уже в Gen 1');
  s = gcCollect(s, 2);
  assert.ok(!s.objs.F.alive && !s.objs.L.alive);
});

test('дескрипторы: второй раз файл не открыть, пока дескриптор не закрыт', () => {
  const card = {};
  let s = fileRig.init();
  s = fileRig.act(card, s, 'open');
  s = fileRig.act(card, s, 'open');
  assert.match(s.error, /being used/);
  s = fileRig.act(card, s, 'forget:fs1');
  s = fileRig.act(card, s, 'gc');
  s = fileRig.act(card, s, 'open');
  assert.ok(s.error, 'GC без финализатора дескриптор не закрывает');
  s = fileRig.act(card, s, 'fin');
  s = fileRig.act(card, s, 'open');
  assert.equal(s.opened, 2);
  assert.equal(s.error, null);
});

/** Все порядки шагов двух потоков (обход в глубину). */
function allEnds(init, can, step, done) {
  const out = [];
  const walk = s => {
    const next = ['A', 'B'].filter(t => can(s, t));
    if (!next.length) { out.push(s); return; }
    next.forEach(t => walk(step(s, t)));
  };
  walk(init);
  return out.filter(done ?? (() => true));
}

test('гонка: без синхронизации count бывает 1, с lock и Interlocked — всегда 2', () => {
  const plain = allEnds(raceInit('plain'), raceCan, raceStep).map(s => s.count);
  assert.ok(plain.includes(1) && plain.includes(2));
  for (const mode of ['lock', 'atomic']) {
    const ends = allEnds(raceInit(mode), raceCan, raceStep);
    assert.ok(ends.every(s => raceDone(s) && s.count === 2), mode);
  }
  assert.ok(raceRandom('plain', 1000, 13) < 2000);
  assert.equal(raceRandom('lock', 1000, 13), 2000);
  assert.equal(raceRandom('atomic', 1000, 13), 2000);
});

test('замки: разный порядок может зависнуть, одинаковый — никогда', () => {
  const bad = allEnds(lockInit(false), lockCan, lockStep).map(lockStatus);
  assert.ok(bad.includes('deadlock') && bad.includes('done'));
  const good = allEnds(lockInit(true), lockCan, lockStep).map(lockStatus);
  assert.ok(good.every(x => x === 'done'));
});

test('пул: блокирующие запросы раздувают пул, await обходится исходными потоками', () => {
  let b = poolAdd(poolInit(), 'block', 16), a = poolAdd(poolInit(), 'async', 16);
  for (let i = 0; i < 40; i++) { b = poolTick(b); a = poolTick(a); }
  assert.equal(b.done.length, 16);
  assert.equal(a.done.length, 16);
  assert.ok(b.threads.length > 4, 'пул добавил потоки под блокировки');
  assert.equal(a.threads.length, 4, 'с await новых потоков не нужно');
  assert.ok(poolAvgWait(a) < poolAvgWait(b));
});

// импорты всплывают, поэтому модели 3D-курса, импортированные ниже, здесь уже доступны
const RIG_MODELS = {
  memory: memRig, gc: gcRig, files: fileRig, datarace: raceRig, deadlock: lockRig, pool: poolRig,
  meshbuild: meshRig, tess: tessRig, units: unitsRig, usd: usdRig, convert: convertRig, nurbs: nurbsRig, bim: bimRig, clash: clashRig, points: pcRig,
  timeline: timelineRig, statemachine: smRig, combinators: combineRig, years: yearsRig, tfm: tfmRig,
  grid: gridRig, panels: panelRig, bind: bindRig, selectors: selRig
};

/** Можно ли нажать кнопку действия в текущем состоянии — как её покажет стенд. */
function enabled(card, s, a) {
  if (card.rig === 'memory') return a !== 'step' || s.f < s.frames.length - 1;
  if (card.rig === 'datarace' && a.startsWith('step:')) return raceCan(s, a.slice(5));
  if (card.rig === 'deadlock' && a.startsWith('step:')) return lockCan(s, a.slice(5));
  if (card.rig === 'gc' && a.startsWith('root:')) return Boolean(s.roots.find(r => r.name === a.slice(5))?.to);
  if (card.rig === 'clash' && a === 'bcf') return s.pick != null;
  if (card.rig === 'clash' && a.startsWith('pick:')) return s.ran;
  const locked = new Set(card.lock ?? []);
  if (card.rig === 'timeline' && (a === 'tick' || a === 'end')) return s.f < s.frames.length - 1;
  if (card.rig === 'timeline' && a === 'cfa') return !locked.has('cfa') && s.o.call !== 'sync';
  if (card.rig === 'timeline' && /^(ctx|call):/.test(a)) return !locked.has(a.split(':')[0]);
  if (card.rig === 'statemachine' && a === 'step') return s.f < s.frames.length - 1;
  return true;
}

test('каждый новый стенд решается своими кнопками, и цель не выполнена с самого начала', () => {
  for (const l of allLessons) l.cards.filter(c => c.t === 'rig' && RIG_MODELS[c.rig]).forEach(c => {
    const at = `${l.id}: стенд ${c.rig} «${c.task.slice(0, 40)}…»`;
    const M = RIG_MODELS[c.rig];
    assert.ok(Array.isArray(c.solve) && c.solve.length, `${at}: нет решения solve`);
    let s = M.init(c);
    assert.ok(!M.goal(c, s), `${at}: цель выполнена ещё до начала`);
    for (const a of c.solve) {
      assert.ok(enabled(c, s, a), `${at}: действие ${a} недоступно в этот момент`);
      s = M.act(c, s, a);
    }
    assert.ok(M.goal(c, s), `${at}: решение не достигает цели`);
    if (c.rig === 'memory') {
      for (const [, prog] of Object.entries(c.variants ?? { main: { code: c.code, steps: c.steps } })) {
        const lines = prog.code.split('\n').length;
        assert.ok(prog.steps.every(st => st.line < lines && st.note), `${at}: шаг указывает за пределы кода или без пояснения`);
      }
    }
  });
});

/* ---------- курс «Async/await до дна» ---------- */
import { simulate, timelineRig, smFrames, smRig, combine, combineRig } from '../learn/models-async.js';

const lastFrame = o => { const f = simulate(o); return f[f.length - 1]; };

test('таймлайн: deadlock только при .Result в контексте без ConfigureAwait(false)', () => {
  assert.equal(lastFrame({ ctx: 'ui', call: 'result', cfa: false }).status, 'deadlock');
  assert.equal(lastFrame({ ctx: 'unity', call: 'result', cfa: false }).status, 'deadlock');
  assert.equal(lastFrame({ ctx: 'ui', call: 'result', cfa: true }).status, 'done');
  assert.equal(lastFrame({ ctx: 'console', call: 'result', cfa: false }).status, 'done');
  for (const ctx of ['ui', 'console', 'unity']) assert.equal(lastFrame({ ctx, call: 'await', cfa: false }).status, 'done');
});

test('таймлайн: await отвечает на клик раньше, чем синхронный вызов', () => {
  const a = lastFrame({ ctx: 'ui', call: 'await', cfa: false }), b = lastFrame({ ctx: 'ui', call: 'sync', cfa: false });
  assert.ok(a.clickAt < b.clickAt, `await ${a.clickAt}, sync ${b.clickAt}`);
});

test('таймлайн: API главного потока после ConfigureAwait(false) падает', () => {
  assert.equal(lastFrame({ ctx: 'unity', call: 'await', cfa: true, api: true }).status, 'error');
  assert.equal(lastFrame({ ctx: 'ui', call: 'await', cfa: true, api: true }).status, 'error');
  assert.equal(lastFrame({ ctx: 'unity', call: 'await', cfa: false, api: true }).status, 'done');
});

test('машина состояний: без готовых ответов две паузы, с готовыми ни одной', () => {
  const a = smFrames(false), c = smFrames(true);
  assert.equal(a[a.length - 1].pauses, 2);
  assert.equal(c[c.length - 1].pauses, 0);
  assert.ok(a[a.length - 1].calls > c[c.length - 1].calls, 'MoveNext вызывается чаще, когда метод приостанавливается');
  let s = smRig.init({ goal: 'both' });
  while (s.f < s.frames.length - 1) s = smRig.act({}, s, 'step');
  s = smRig.act({}, s, 'cached');
  while (s.f < s.frames.length - 1) s = smRig.act({}, s, 'step');
  assert.ok(smRig.goal({ goal: 'both' }, s));
});

test('комбинаторы: по очереди — сумма, WhenAll — максимум, WhenAny — минимум', () => {
  assert.equal(combine('seq', []).total, 1000);
  assert.equal(combine('all', []).total, 500);
  assert.equal(combine('any', []).total, 200);
  assert.ok(combine('all', ['A', 'B']).inner.length === 2, 'WhenAll собирает все исключения');
});

/* ---------- курс «История .NET» ---------- */
import { stateAt, yearsRig, resolveHost, csprojLine, tfmRig, HOSTS, TFMS } from '../learn/models-history.js';

test('лента лет: срезы экосистемы по ключевым годам', () => {
  assert.equal(stateAt(2002).framework, '1.0');
  assert.equal(stateAt(2002).modern, null);
  assert.deepEqual(stateAt(2003).platforms, ['Windows']);
  assert.equal(stateAt(2012).csharp, '5.0');
  assert.equal(stateAt(2016).modern, '.NET Core 1.0');
  assert.equal(stateAt(2019).framework, '4.8');
  assert.equal(stateAt(2019).standard, '2.1');
  assert.equal(stateAt(2025).modern, '.NET 10 (LTS)');
  assert.equal(stateAt(2025).csharp, '14');
  for (let y = 2002; y <= 2026; y++) assert.ok(stateAt(y).csharp, `в ${y} году должен быть C#`);
});

test('совместимость: .NET Framework не грузит netstandard2.1, NuGet берёт самую близкую сборку', () => {
  assert.equal(resolveHost('revit24', ['ns21']).status, 'no');
  assert.equal(resolveHost('revit24', ['ns20']).status, 'ok');
  assert.equal(resolveHost('unity', ['ns21']).status, 'ok');
  assert.equal(resolveHost('unity', ['net8']).status, 'no');
  assert.equal(resolveHost('app10', ['net8', 'ns20']).tfm, 'net8');
  assert.equal(resolveHost('revit24', ['net48', 'ns20']).tfm, 'net48');
  assert.equal(resolveHost('revit25', ['net48']).status, 'warn');
  assert.equal(resolveHost('revit25', ['net10']).status, 'no', '.NET 8 не загрузит сборку для .NET 10');
  const all = Object.keys(HOSTS);
  assert.ok(all.every(h => resolveHost(h, ['ns20']).status === 'ok'), 'netstandard2.0 — максимальный охват');
  const single = Object.keys(TFMS).filter(t => all.every(h => resolveHost(h, [t]).status === 'ok'));
  assert.deepEqual(single, ['ns20'], 'единственная цель для всех хостов');
  assert.equal(csprojLine(['ns20']), '<TargetFramework>netstandard2.0</TargetFramework>');
  assert.equal(csprojLine(['ns20', 'net8']), '<TargetFrameworks>netstandard2.0;net8.0</TargetFrameworks>');
});

/* ---------- курс «Avalonia: основы» ---------- */
import { gridWidths, gridRig, arrange, panelRig, bindRig, select, selRig } from '../learn/models-avalonia.js';

test('Grid: пиксели как есть, Auto по содержимому, звёзды делят остаток', () => {
  assert.deepEqual(gridWidths(['200', '*'], 800, [0, 0]), [200, 600]);
  assert.deepEqual(gridWidths(['*', '2*', '*'], 800, [0, 0, 0]), [200, 400, 200]);
  assert.deepEqual(gridWidths(['Auto', '*'], 500, [120, 0]), [120, 380]);
  assert.deepEqual(gridWidths(['200', '200', '*'], 300, [0, 0, 0]), [200, 200, 0], 'звёздам не остаётся места — ноль, а не минус');
});

test('DockPanel: раздаёт края по порядку детей, последний заполняет остаток', () => {
  const [top, left, bottom, fill] = arrange('dock', 320, 200);
  assert.deepEqual(top, { x: 0, y: 0, w: 320, h: 36 });
  assert.equal(left.h, 200 - 36, 'меню прижато раньше статуса и дотягивается до низа');
  assert.equal(bottom.x, left.w, 'статус стоит справа от меню');
  assert.equal(fill.x + fill.w, 320);
  assert.equal(fill.y + fill.h, bottom.y);
  const wrap = arrange('wrap', 220, 200);
  assert.ok(wrap[2].y > 0, 'WrapPanel переносит то, что не влезло');
  const sh = arrange('stack-h', 220, 200);
  assert.ok(sh[3].x + sh[3].w > 220, 'горизонтальный StackPanel не переносит, а уводит за край');
});

test('привязки: без PropertyChanged экран не узнаёт об изменениях, OneWay не пишет в модель', () => {
  const run = (start, acts) => acts.reduce((s, a) => bindRig.act({}, s, a), bindRig.init({ start }));
  let s = run({ mode: 'TwoWay', notify: false }, ['type']);
  assert.equal(s.vm, s.box, 'TwoWay записал ввод в модель');
  assert.notEqual(s.label, s.vm, 'но приветствие не обновилось без уведомления');
  s = run({ mode: 'OneWay', notify: true }, ['type']);
  assert.equal(s.vm, 'Мир', 'OneWay не переносит ввод в модель');
  s = run({ mode: 'OneTime', notify: true }, ['code']);
  assert.notEqual(s.box, s.vm, 'OneTime не обновляет TextBox из модели');
  s = run({ mode: 'TwoWay', notify: true }, ['type', 'code']);
  assert.deepEqual(s.ok, ['type', 'code']);
});

test('селекторы: тип, класс, имя, потомок и прямой ребёнок', () => {
  assert.deepEqual(select('Button'), [2, 3, 5, 8]);
  assert.deepEqual(select('.primary'), [2, 8]);
  assert.deepEqual(select('#Help'), [5]);
  assert.deepEqual(select('StackPanel Button'), [2, 3, 5]);
  assert.deepEqual(select('StackPanel > Button'), [2, 3]);
  assert.deepEqual(select('Window > Button'), [8]);
  assert.deepEqual(select('Button.primary.danger'), [8]);
});

/* ---------- курс «3D-форматы» ---------- */
import { HOUSE, signedArea, overlap, meshRig, sagitta, tessInfo, tessRig, unitsRig, unitsView, usdRig, usdResolve, convertRig, FORMATS, FEATURES, nurbsError, nurbsRig, bimRig, bimFilter, clashRig, findClashes, pcRig, pcSize, PC_COUNTS } from '../learn/models-3d.js';

test('сборка меша: перекрытия отклоняются, порядок обхода задаёт сторону', () => {
  assert.ok(signedArea(HOUSE, [0, 1, 2]) > 0);
  assert.ok(signedArea(HOUSE, [0, 2, 1]) < 0);
  assert.ok(!overlap(HOUSE, [0, 1, 2], [0, 2, 4]), 'общее ребро — не пересечение');
  assert.ok(overlap(HOUSE, [0, 1, 2], [0, 1, 3]), 'треугольники ABC и ABD налезают');
  let s = meshRig.init();
  for (const a of ['v:0', 'v:1', 'v:2', 'v:0', 'v:1', 'v:3']) s = meshRig.act({}, s, a);
  assert.equal(s.tris.length, 1, 'налезающий треугольник не добавлен');
  for (const a of ['v:0', 'v:2', 'v:4', 'v:4', 'v:3', 'v:2']) s = meshRig.act({}, s, a);
  assert.ok(meshRig.goal({}, s), 'домик закрыт');
  assert.ok(!meshRig.goal({ goal: { ccw: true } }, s), 'но один треугольник смотрит изнанкой');
  s = meshRig.act({}, s, 'flip');
  assert.ok(meshRig.goal({ goal: { ccw: true } }, s));
});

test('тесселяция: ошибка падает как квадрат сегментов, STEP не растёт', () => {
  assert.ok(Math.abs(sagitta(32) / sagitta(64) - 4) < 0.05);
  assert.ok(sagitta(50) < 0.1 && sagitta(49) > 0.1);
  assert.equal(tessInfo(64).tris, 252);
  assert.equal(tessInfo(8).step, tessInfo(128).step);
  assert.ok(tessInfo(12, true).gpu > tessInfo(12, false).gpu);
});

test('единицы, USD, NURBS: правильный ответ ровно один', () => {
  const ok = Object.keys({ mm: 1, cm: 1, m: 1, in: 1 }).flatMap(u => ['Y', 'Z'].map(up => ({ unit: u, up }))).filter(s => unitsView(s).ok);
  assert.deepEqual(ok, [{ unit: 'm', up: 'Y' }]);
  let s = usdRig.init();
  assert.equal(usdResolve(s).color.value, 'walnut');
  s = usdRig.act({}, s, 'layer:shot');
  assert.equal(usdResolve(s).color.value, 'red');
  s = usdRig.act({}, s, 'swap');
  assert.equal(usdResolve(s).color.value, 'walnut', 'после перестановки сильнее set.usda');
  assert.equal(usdResolve(usdRig.act({}, usdRig.init(), 'var:bar')).legs.value, 3);
  assert.ok(nurbsError(Math.SQRT1_2) < 1e-6);
  assert.ok(nurbsError(1) > 0.05);
});

test('конвертер: таблица полная, glTF и USD хранят всё, STL — только форму', () => {
  for (const [k, f] of Object.entries(FORMATS)) {
    assert.deepEqual(Object.keys(f.caps).sort(), Object.keys(FEATURES).sort(), k);
    for (const n of Object.keys(f.notes ?? {})) assert.ok(n in FEATURES, `${k}: заметка к неизвестному свойству ${n}`);
  }
  assert.ok(Object.values(FORMATS.gltf.caps).every(v => v === 'yes'));
  assert.ok(Object.values(FORMATS.usd.caps).every(v => v === 'yes'));
  assert.equal(Object.entries(FORMATS.stl.caps).filter(([, v]) => v === 'yes').map(([k]) => k).join(), 'geometry');
});

test('BIM, коллизии и облака: числа, на которые опираются вопросы', () => {
  assert.equal(bimFilter({ type: 'IfcDoor', storey: 2 }).length, 3);
  assert.equal(bimFilter({ type: 'IfcWindow', storey: 2 }).length, 2);
  assert.deepEqual([0, 50, 150].map(t => findClashes(t).length), [2, 3, 4]);
  assert.deepEqual([findClashes(0)[0].a, findClashes(0)[0].b].sort(), ['B-12', 'D-7']);
  const fits = Object.keys({ xyz: 1, pts: 1, las: 1, laz: 1, e57: 1 }).filter(f => pcSize(f, PC_COUNTS['100M']) <= 1e9);
  assert.deepEqual(fits, ['laz']);
});
