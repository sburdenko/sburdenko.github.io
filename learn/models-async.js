/**
 * Модели курса «Async/await до дна». Без DOM — покрыты тестами.
 * Вход тот же, что у других стендов: init(card), act(card, s, 'действие'), goal(card, s).
 */
import { tr } from './i18n.js?v=202610261308';
import { t as tl, bi } from './ui.js?v=202610261308';

const clone = x => structuredClone(x);

/* =====================================================================
   Таймлайн потоков. Сценарий один и тот же: обработчик вызывает GetDataAsync,
   та отправляет запрос в сеть и ждёт ответ, потом разбирает его, обработчик показывает результат.
   Меняются три вещи: какой контекст у программы, как вызван метод и есть ли ConfigureAwait(false).
   ===================================================================== */

export const IO_TICKS = 3;
export const CTX = {
  ui: { main: bi('m.async.CTX.1'), loop: true, name: 'WPF / WinForms' },
  console: { main: bi('m.async.CTX.2'), loop: false, name: bi('m.async.CTX.3') },
  unity: { main: bi('m.async.CTX.4'), loop: true, name: 'Unity' }
};

/**
 * Прогоняет сценарий по тикам и возвращает кадры. o = { ctx, call: 'sync'|'result'|'await', cfa, api }.
 * api — продолжение внутри GetDataAsync трогает объекты главного потока (контрол окна, transform в Unity).
 * Тексты переводятся при вызове; задачи в очереди помечены видом (mainQKind: 'click' | 'cont'),
 * а продолжения на дорожках — флагом cont, чтобы стенд не разбирал текст.
 */
export function simulate(o) {
  const ctx = CTX[o.ctx], ctxName = tr(ctx.name);
  const C1 = o.api
    ? (o.ctx === 'unity' ? tl('m.async.simulate.1') : tl('m.async.simulate.2'))
    : tl('m.async.simulate.3');
  const C2 = tl('m.async.simulate.4');
  const CLICK = tl('m.async.simulate.5');
  const PARSE = tl('m.async.simulate.6');
  const SHOW = tl('m.async.simulate.7');
  const SHOW_RESULT = tl('m.async.simulate.8');
  const WAIT_RESULT = tl('m.async.simulate.9');
  const frames = [];
  let mainQ = [], poolQ = [], io = null, syncLeft = 0, syncTail = [], taskDone = false, c2Queued = false;
  let blocked = null, status = 'run', clickAt = null, note;
  const target = useCtx => (useCtx && ctx.loop ? 'main' : 'pool');
  const lane = (kind, label) => (label === C1 || label === C2 ? { kind, label, cont: true } : { kind, label });
  const push = (main, pool, text) => frames.push({
    t: frames.length, main, pool, mainQ: [...mainQ], mainQKind: mainQ.map(x => (x === CLICK ? 'click' : 'cont')),
    poolQ: [...poolQ], io, taskDone, status, clickAt, note: text
  });

  // тик 0: обработчик вызывает метод, тот отправляет запрос
  if (o.call === 'sync') {
    syncLeft = IO_TICKS; blocked = tl('m.async.simulate.10');
    push({ kind: 'run', label: tl('m.async.simulate.11') }, null,
      tl('m.async.simulate.12'));
  } else {
    io = IO_TICKS;
    blocked = o.call === 'result' ? WAIT_RESULT : null;
    push({ kind: 'run', label: tl('m.async.simulate.13') }, null,
      tl('m.async.simulate.14') +
      (o.call === 'result'
        ? tl('m.async.simulate.15')
        : tl('m.async.simulate.16')));
  }

  // после результата даём главному потоку разобрать очередь — видно, когда до клика дошли руки
  for (let t = 1; t <= 14 && (status === 'run' || (status === 'done' && mainQ.length)); t++) {
    const said = [];
    if (t === 1 && ctx.loop) { mainQ.push(CLICK); said.push(tl('m.async.simulate.17')); }
    if (io != null) {
      io--;
      if (io === 0) {
        io = null;
        const where = target(!o.cfa);
        (where === 'main' ? mainQ : poolQ).push(C1);
        said.push(where === 'main'
          ? tl('m.async.simulate.18', { ctxName })
          : o.cfa
            ? tl('m.async.simulate.19')
            : tl('m.async.simulate.20'));
      }
    }
    // главный поток
    let main;
    const runMain = label => {
      main = lane('run', label);
      if (label === C1) { taskDone = true; said.push(tl('m.async.simulate.21')); }
      if (label === C2 || label === SHOW || label === SHOW_RESULT) { status = 'done'; said.push(tl('m.async.simulate.22')); }
      if (label === CLICK) { clickAt = t; said.push(tl('m.async.simulate.23', { t })); }
    };
    if (o.call === 'sync' && syncLeft > 0) {
      syncLeft--;
      main = { kind: 'blocked', label: blocked };
      if (syncLeft === 0) { syncTail = [PARSE, SHOW]; blocked = null; said.push(tl('m.async.simulate.24')); }
      else if (mainQ.includes(CLICK)) said.push(tl('m.async.simulate.25'));
    } else if (syncTail.length) {
      runMain(syncTail.shift());
    } else if (blocked && taskDone) {
      blocked = null;
      runMain(SHOW_RESULT);
    } else if (blocked) {
      main = { kind: 'blocked', label: blocked };
    } else if (mainQ.length) {
      runMain(mainQ.shift());
    } else {
      main = { kind: 'idle', label: ctx.loop ? tl('m.async.simulate.26') : tl('m.async.simulate.27') };
    }
    // пул
    let pool = null;
    if (poolQ.length) {
      const label = poolQ.shift();
      pool = lane('run', label);
      if (label === C1) {
        if (o.api && ctx.loop) {
          status = 'error';
          said.push(o.ctx === 'unity'
            ? tl('m.async.simulate.28')
            : tl('m.async.simulate.29'));
        } else { taskDone = true; said.push(tl('m.async.simulate.30')); }
      }
      if (label === C2) { status = 'done'; said.push(tl('m.async.simulate.31')); }
    }
    // обработчик с await продолжится, когда задача завершится
    if (taskDone && o.call === 'await' && !c2Queued && status === 'run') {
      c2Queued = true;
      (target(true) === 'main' ? mainQ : poolQ).push(C2);
      said.push(target(true) === 'main'
        ? tl('m.async.simulate.32')
        : tl('m.async.simulate.33'));
    }
    // взаимная блокировка: главный поток ждёт задачу, а задача ждёт главный поток
    if (status === 'run' && blocked === WAIT_RESULT && !taskDone && io == null && !poolQ.length && !pool && mainQ.includes(C1)) {
      status = 'deadlock';
      said.push(tl('m.async.simulate.34'));
    }
    note = said.join(' ') || (main.kind === 'blocked' ? tl('m.async.simulate.35') : tl('m.async.simulate.36'));
    push(main, pool, note);
  }
  return frames;
}

export const FIELDS = ['ctx', 'call', 'cfa'];
const DEFAULT = { ctx: 'ui', call: 'result', cfa: false };

export const timelineRig = {
  init(card) {
    const o = { ...DEFAULT, ...(card.start ?? {}), api: Boolean(card.api) };
    return { o, f: 0, frames: simulate(o), reached: [] };
  },
  act(card, s0, a) {
    const s = clone(s0), [k, v] = a.split(':');
    const rerun = () => { s.frames = simulate(s.o); s.f = 0; };
    if (k === 'reset') return timelineRig.init(card);
    if (k === 'tick') s.f = Math.min(s.f + 1, s.frames.length - 1);
    else if (k === 'end') s.f = s.frames.length - 1;
    else if (k === 'restart') s.f = 0;
    else if (k === 'ctx' && v in CTX) { s.o.ctx = v; rerun(); }
    else if (k === 'call' && ['sync', 'result', 'await'].includes(v)) { s.o.call = v; rerun(); }
    else if (k === 'cfa') { s.o.cfa = !s.o.cfa; rerun(); }
    else throw new Error(`неизвестное действие ${a}`);
    const fr = s.frames[s.f];
    if (fr.status !== 'run') s.reached.push({ ...s.o, status: fr.status, clickAt: fr.clickAt });
    return s;
  },
  goal(card, s) {
    const g = card.goal;
    return s.reached.some(r => r.status === g.status
      && FIELDS.every(k => g[k] === undefined || g[k] === r[k])
      && (g.clickBy === undefined || (r.clickAt != null && r.clickAt <= g.clickBy)));
  }
};

/* =====================================================================
   Машина состояний: async-метод и то, во что его превращает компилятор (упрощённо).
   ===================================================================== */

export const SM_SOURCE = 'async Task<int> SumAsync()\n{\n    int a = await GetAAsync();\n    int b = await GetBAsync();\n    return a + b;\n}';
export const SM_MOVENEXT = 'void MoveNext()\n{\n    switch (state)\n    {\n        case 0: goto AfterA;\n        case 1: goto AfterB;\n    }\n    awaiter = GetAAsync().GetAwaiter();\n    if (!awaiter.IsCompleted)\n    {\n        state = 0;\n        builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);\n        return;\n    }\nAfterA:\n    a = awaiter.GetResult();\n    awaiter = GetBAsync().GetAwaiter();\n    if (!awaiter.IsCompleted)\n    {\n        state = 1;\n        builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);\n        return;\n    }\nAfterB:\n    b = awaiter.GetResult();\n    state = -2;\n    builder.SetResult(a + b);\n}';

/** Кадры: строка исходника, строка MoveNext, поля машины, пояснение. */
export function smFrames(cached) {
  const F = (src, mn, fields, note, extra = {}) => ({ src, mn, fields: { ...fields }, note: tr(note), ...extra });
  /** @type {Record<string, string | number>} */
  const f = { state: -1, a: '—', b: '—', awaiter: '—' };
  const out = [F(-1, -1, f, bi('m.async.smFrames.1'), { calls: 0, pauses: 0 })];
  let calls = 1, pauses = 0;
  out.push(F(0, 2, f, bi('m.async.smFrames.2'), { calls, pauses }));
  f.awaiter = cached ? tl('m.async.smFrames.3') : tl('m.async.smFrames.4');
  out.push(F(2, 7, f, bi('m.async.smFrames.5'), { calls, pauses }));
  if (!cached) {
    f.state = 0;
    out.push(F(2, 10, f, bi('m.async.smFrames.6'), { calls, pauses }));
    pauses++;
    out.push(F(2, 11, f, bi('m.async.smFrames.7'), { calls, pauses, suspended: true }));
    calls++;
    out.push(F(2, 4, f, bi('m.async.smFrames.8'), { calls, pauses }));
  } else {
    out.push(F(2, 8, f, bi('m.async.smFrames.9'), { calls, pauses }));
  }
  f.a = 2;
  out.push(F(2, 15, f, bi('m.async.smFrames.10'), { calls, pauses }));
  f.awaiter = cached ? tl('m.async.smFrames.11') : tl('m.async.smFrames.12');
  out.push(F(3, 16, f, bi('m.async.smFrames.13'), { calls, pauses }));
  if (!cached) {
    f.state = 1;
    out.push(F(3, 19, f, bi('m.async.smFrames.14'), { calls, pauses }));
    pauses++;
    out.push(F(3, 20, f, bi('m.async.smFrames.15'), { calls, pauses, suspended: true }));
    calls++;
    out.push(F(3, 5, f, bi('m.async.smFrames.16'), { calls, pauses }));
  } else {
    out.push(F(3, 17, f, bi('m.async.smFrames.17'), { calls, pauses }));
  }
  f.b = 40;
  out.push(F(3, 24, f, 'b = 40.', { calls, pauses }));
  f.state = -2;
  out.push(F(4, 25, f, bi('m.async.smFrames.18'), { calls, pauses }));
  out.push(F(4, 26, f, bi('m.async.smFrames.19', { calls, pauses }), { calls, pauses, done: true }));
  return out;
}

export const smRig = {
  init: card => ({ cached: Boolean(card.cached), f: 0, frames: smFrames(Boolean(card.cached)), finished: [] }),
  act(card, s0, a) {
    const s = { ...s0, finished: [...s0.finished] };
    if (a === 'step' && s.f < s.frames.length - 1) s.f++;
    else if (a === 'reset') s.f = 0;
    else if (a === 'cached') { s.cached = !s.cached; s.frames = smFrames(s.cached); s.f = 0; }
    const key = s.cached ? 'cached' : 'async';
    if (s.frames[s.f].done && !s.finished.includes(key)) s.finished.push(key);
    return s;
  },
  goal(card, s) {
    if (card.goal === 'both') return s.finished.includes('cached') && s.finished.includes('async');
    return s.finished.includes(card.goal);
  }
};

/* =====================================================================
   Комбинаторы задач: последовательный await, Task.WhenAll и Task.WhenAny.
   ===================================================================== */

export const TASKS = [
  { id: 'A', name: bi('m.async.TASKS.1'), ms: 300 },
  { id: 'B', name: bi('m.async.TASKS.2'), ms: 500 },
  { id: 'C', name: bi('m.async.TASKS.3'), ms: 200 }
];

/** Названия задач в барах и текст результата приходят уже на текущем языке. */
export function combine(mode, fails) {
  const bars = [], ALL = tl('m.async.combine.1');
  if (mode === 'seq') {
    let t = 0, thrown = null;
    for (const x of TASKS) {
      if (thrown) { bars.push({ ...x, name: tr(x.name), start: null, end: null, state: 'skip' }); continue; }
      bars.push({ ...x, name: tr(x.name), start: t, end: t + x.ms, state: fails.includes(x.id) ? 'fail' : 'ok' });
      t += x.ms;
      if (fails.includes(x.id)) thrown = x.id;
    }
    return { bars, total: t, thrown, inner: thrown ? [thrown] : [], result: thrown ? null : ALL };
  }
  TASKS.forEach(x => bars.push({ ...x, name: tr(x.name), start: 0, end: x.ms, state: fails.includes(x.id) ? 'fail' : 'ok' }));
  if (mode === 'all') {
    const failed = TASKS.filter(x => fails.includes(x.id)).map(x => x.id);
    return { bars, total: Math.max(...TASKS.map(x => x.ms)), thrown: failed[0] ?? null, inner: failed, result: failed.length ? null : ALL };
  }
  const first = [...TASKS].sort((p, q) => p.ms - q.ms)[0];
  return { bars, total: first.ms, thrown: null, inner: [], result: tl('m.async.combine.2') + first.id + (fails.includes(first.id) ? tl('m.async.combine.3') : ''), first: first.id };
}

export const combineRig = {
  init: () => ({ mode: 'seq', fails: [], seen: [] }),
  act(card, s0, a) {
    const s = { ...s0, fails: [...s0.fails], seen: [...s0.seen] }, [k, v] = a.split(':');
    if (k === 'reset') return combineRig.init();
    if (k === 'mode' && ['seq', 'all', 'any'].includes(v)) s.mode = v;
    else if (k === 'fail' && TASKS.some(x => x.id === v)) s.fails = s.fails.includes(v) ? s.fails.filter(x => x !== v) : [...s.fails, v];
    else throw new Error(`неизвестное действие ${a}`);
    s.seen.push(`${s.mode}:${s.fails.length}`);
    return s;
  },
  goal(card, s) {
    const g = card.goal, r = combine(s.mode, s.fails);
    if (g.kind === 'time') return s.mode === g.mode && r.total <= g.max;
    if (g.kind === 'inner') return s.mode === 'all' && r.inner.length >= g.n;
    if (g.kind === 'skip') return s.mode === 'seq' && r.bars.some(b => b.state === 'skip');
    return false;
  }
};
