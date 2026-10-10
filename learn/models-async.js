/**
 * Модели курса «Async/await до дна». Без DOM — покрыты тестами.
 * Вход тот же, что у других стендов: init(card), act(card, s, 'действие'), goal(card, s).
 */
import { tr } from './i18n.js?v=202610101018';

const clone = x => structuredClone(x);

/* =====================================================================
   Таймлайн потоков. Сценарий один и тот же: обработчик вызывает GetDataAsync,
   та отправляет запрос в сеть и ждёт ответ, потом разбирает его, обработчик показывает результат.
   Меняются три вещи: какой контекст у программы, как вызван метод и есть ли ConfigureAwait(false).
   ===================================================================== */

export const IO_TICKS = 3;
export const CTX = {
  ui: { main: { ru: 'UI-поток', en: 'UI thread' }, loop: true, name: 'WPF / WinForms' },
  console: { main: { ru: 'Главный поток', en: 'Main thread' }, loop: false, name: { ru: 'консоль / ASP.NET Core', en: 'console / ASP.NET Core' } },
  unity: { main: { ru: 'Главный поток Unity', en: 'Unity main thread' }, loop: true, name: 'Unity' }
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
    ? (o.ctx === 'unity' ? tr({ ru: 'transform.position = … (продолжение)', en: 'transform.position = … (continuation)' }) : tr({ ru: 'label.Text = ответ (продолжение)', en: 'label.Text = response (continuation)' }))
    : tr({ ru: 'разобрать ответ (продолжение)', en: 'parse response (continuation)' });
  const C2 = tr({ ru: 'показать результат (обработчик после await)', en: 'show result (handler after await)' });
  const CLICK = tr({ ru: 'клик пользователя', en: 'user click' });
  const PARSE = tr({ ru: 'разобрать ответ', en: 'parse response' });
  const SHOW = tr({ ru: 'показать результат', en: 'show result' });
  const SHOW_RESULT = tr({ ru: 'показать результат (после .Result)', en: 'show result (after .Result)' });
  const WAIT_RESULT = tr({ ru: 'ждёт .Result', en: 'waiting on .Result' });
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
    syncLeft = IO_TICKS; blocked = tr({ ru: 'ждёт ответ сети (синхронный вызов)', en: 'waiting for the network (synchronous call)' });
    push({ kind: 'run', label: tr({ ru: 'обработчик → GetData(): отправить запрос', en: 'handler → GetData(): send request' }) }, null,
      tr({ ru: 'Обработчик вызвал обычный синхронный метод. Тот отправил запрос — и теперь поток будет стоять, пока не придёт ответ.', en: 'The handler called a plain synchronous method. It sent the request, and now the thread will sit idle until the response arrives.' }));
  } else {
    io = IO_TICKS;
    blocked = o.call === 'result' ? WAIT_RESULT : null;
    push({ kind: 'run', label: tr({ ru: 'обработчик → GetDataAsync(): отправить запрос', en: 'handler → GetDataAsync(): send request' }) }, null,
      tr({ ru: 'GetDataAsync выполняется синхронно до первого await, отправляет запрос и возвращает незавершённый Task. ', en: 'GetDataAsync runs synchronously up to the first await, sends the request and returns an unfinished Task. ' }) +
      (o.call === 'result'
        ? tr({ ru: 'Обработчик сразу берёт у задачи .Result — и поток блокируется.', en: 'The handler immediately reads the task\'s .Result, and the thread blocks.' })
        : tr({ ru: 'Обработчик делает await этой задачи и возвращает управление — поток свободен.', en: 'The handler awaits that task and returns control, so the thread is free.' })));
  }

  // после результата даём главному потоку разобрать очередь — видно, когда до клика дошли руки
  for (let t = 1; t <= 14 && (status === 'run' || (status === 'done' && mainQ.length)); t++) {
    const said = [];
    if (t === 1 && ctx.loop) { mainQ.push(CLICK); said.push(tr({ ru: 'Пользователь кликнул — сообщение встало в очередь главного потока.', en: 'The user clicked: the message went into the main thread\'s queue.' })); }
    if (io != null) {
      io--;
      if (io === 0) {
        io = null;
        const where = target(!o.cfa);
        (where === 'main' ? mainQ : poolQ).push(C1);
        said.push(where === 'main'
          ? tr({ ru: `Ответ пришёл. await захватил контекст (${ctxName}), поэтому продолжение встало в очередь главного потока.`, en: `The response arrived. await captured the context (${ctxName}), so the continuation went into the main thread's queue.` })
          : o.cfa
            ? tr({ ru: 'Ответ пришёл. Из-за ConfigureAwait(false) продолжение ушло в пул потоков.', en: 'The response arrived. Because of ConfigureAwait(false), the continuation went to the thread pool.' })
            : tr({ ru: 'Ответ пришёл. Контекста нет — продолжение выполнит пул потоков.', en: 'The response arrived. There is no context, so the thread pool runs the continuation.' }));
      }
    }
    // главный поток
    let main;
    const runMain = label => {
      main = lane('run', label);
      if (label === C1) { taskDone = true; said.push(tr({ ru: 'Продолжение выполнено — задача GetDataAsync завершена.', en: 'The continuation ran, so the GetDataAsync task is complete.' })); }
      if (label === C2 || label === SHOW || label === SHOW_RESULT) { status = 'done'; said.push(tr({ ru: 'Результат показан.', en: 'The result is shown.' })); }
      if (label === CLICK) { clickAt = t; said.push(tr({ ru: `Клик обработан на тике ${t}.`, en: `The click was handled on tick ${t}.` })); }
    };
    if (o.call === 'sync' && syncLeft > 0) {
      syncLeft--;
      main = { kind: 'blocked', label: blocked };
      if (syncLeft === 0) { syncTail = [PARSE, SHOW]; blocked = null; said.push(tr({ ru: 'Ответ пришёл, поток продолжает.', en: 'The response arrived, and the thread carries on.' })); }
      else if (mainQ.includes(CLICK)) said.push(tr({ ru: 'Клик ждёт в очереди: поток занят ожиданием, окно «не отвечает».', en: 'The click waits in the queue: the thread is busy waiting, and the window is "Not Responding".' }));
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
      main = { kind: 'idle', label: ctx.loop ? tr({ ru: 'свободен, крутит очередь сообщений', en: 'free, pumping the message queue' }) : tr({ ru: 'свободен', en: 'free' }) };
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
            ? tr({ ru: 'UnityException: get_transform can only be called from the main thread. Unity API можно трогать только из главного потока.', en: 'UnityException: get_transform can only be called from the main thread. The Unity API may only be touched from the main thread.' })
            : tr({ ru: 'InvalidOperationException: The calling thread cannot access this object because a different thread owns it. Контрол окна можно трогать только из UI-потока.', en: 'InvalidOperationException: The calling thread cannot access this object because a different thread owns it. Window controls may only be touched from the UI thread.' }));
        } else { taskDone = true; said.push(tr({ ru: 'Продолжение выполнил поток пула — задача GetDataAsync завершена.', en: 'A pool thread ran the continuation, so the GetDataAsync task is complete.' })); }
      }
      if (label === C2) { status = 'done'; said.push(tr({ ru: 'Результат показан. Готово.', en: 'The result is shown. Done.' })); }
    }
    // обработчик с await продолжится, когда задача завершится
    if (taskDone && o.call === 'await' && !c2Queued && status === 'run') {
      c2Queued = true;
      (target(true) === 'main' ? mainQ : poolQ).push(C2);
      said.push(target(true) === 'main'
        ? tr({ ru: 'Обработчик ждал через await с захватом контекста — его продолжение встало в очередь главного потока.', en: 'The handler was awaiting with the context captured, so its continuation went into the main thread\'s queue.' })
        : tr({ ru: 'Продолжение обработчика встало в пул.', en: 'The handler\'s continuation went to the pool.' }));
    }
    // взаимная блокировка: главный поток ждёт задачу, а задача ждёт главный поток
    if (status === 'run' && blocked === WAIT_RESULT && !taskDone && io == null && !poolQ.length && !pool && mainQ.includes(C1)) {
      status = 'deadlock';
      said.push(tr({ ru: 'DEADLOCK. Главный поток стоит на .Result и ждёт задачу. А задаче, чтобы завершиться, нужно выполнить продолжение — в очереди этого самого главного потока. Никто никого не дождётся.', en: 'DEADLOCK. The main thread is stuck on .Result, waiting for the task. But to finish, the task has to run its continuation, which sits in the queue of that very main thread. Neither will ever get what it is waiting for.' }));
    }
    note = said.join(' ') || (main.kind === 'blocked' ? tr({ ru: 'Ждём.', en: 'Waiting.' }) : tr({ ru: 'Тик без событий.', en: 'Nothing happens this tick.' }));
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
  const f = { state: -1, a: '—', b: '—', awaiter: '—' };
  const out = [F(-1, -1, f, { ru: 'Вызов SumAsync(): компилятор создал структуру-машину с полями state, a, b, awaiter и вызвал MoveNext.', en: 'Calling SumAsync(): the compiler created a state machine struct with fields state, a, b, awaiter and called MoveNext.' }, { calls: 0, pauses: 0 })];
  let calls = 1, pauses = 0;
  out.push(F(0, 2, f, { ru: 'MoveNext №1. state = −1 — метод только начался, переходов нет.', en: 'MoveNext #1. state = −1: the method has just started, no jumps.' }, { calls, pauses }));
  f.awaiter = cached ? tr({ ru: 'TaskAwaiter (A готов)', en: 'TaskAwaiter (A ready)' }) : tr({ ru: 'TaskAwaiter (A ещё в пути)', en: 'TaskAwaiter (A still on its way)' });
  out.push(F(2, 7, f, { ru: 'Вызываем GetAAsync() и берём у задачи awaiter.', en: 'Call GetAAsync() and get the task\'s awaiter.' }, { calls, pauses }));
  if (!cached) {
    f.state = 0;
    out.push(F(2, 10, f, { ru: 'IsCompleted = false. Запоминаем, где остановились: state = 0.', en: 'IsCompleted = false. Remember where we stopped: state = 0.' }, { calls, pauses }));
    pauses++;
    out.push(F(2, 11, f, { ru: 'AwaitUnsafeOnCompleted подписывает MoveNext на завершение задачи, и метод возвращается. Вызывающий получил незавершённый Task, поток свободен.', en: 'AwaitUnsafeOnCompleted subscribes MoveNext to the task\'s completion, and the method returns. The caller gets an unfinished Task, and the thread is free.' }, { calls, pauses, suspended: true }));
    calls++;
    out.push(F(2, 4, f, { ru: 'Ответ A пришёл — MoveNext №2. switch видит state = 0 и прыгает на AfterA.', en: 'Response A arrived: MoveNext #2. The switch sees state = 0 and jumps to AfterA.' }, { calls, pauses }));
  } else {
    out.push(F(2, 8, f, { ru: 'IsCompleted = true: ответ уже есть. Никакой приостановки — идём дальше в этом же вызове MoveNext.', en: 'IsCompleted = true: the response is already here. No suspension, we keep going in the same MoveNext call.' }, { calls, pauses }));
  }
  f.a = 2;
  out.push(F(2, 15, f, { ru: 'GetResult() отдаёт результат: a = 2.', en: 'GetResult() returns the result: a = 2.' }, { calls, pauses }));
  f.awaiter = cached ? tr({ ru: 'TaskAwaiter (B готов)', en: 'TaskAwaiter (B ready)' }) : tr({ ru: 'TaskAwaiter (B ещё в пути)', en: 'TaskAwaiter (B still on its way)' });
  out.push(F(3, 16, f, { ru: 'Вызываем GetBAsync().', en: 'Call GetBAsync().' }, { calls, pauses }));
  if (!cached) {
    f.state = 1;
    out.push(F(3, 19, f, { ru: 'Снова не готово: state = 1.', en: 'Not ready again: state = 1.' }, { calls, pauses }));
    pauses++;
    out.push(F(3, 20, f, { ru: 'Подписываемся и возвращаемся — вторая приостановка.', en: 'Subscribe and return: the second suspension.' }, { calls, pauses, suspended: true }));
    calls++;
    out.push(F(3, 5, f, { ru: 'Ответ B пришёл — MoveNext №3, прыжок на AfterB.', en: 'Response B arrived: MoveNext #3, jump to AfterB.' }, { calls, pauses }));
  } else {
    out.push(F(3, 17, f, { ru: 'Тоже готово — продолжаем без остановки.', en: 'Also ready, so we continue without stopping.' }, { calls, pauses }));
  }
  f.b = 40;
  out.push(F(3, 24, f, 'b = 40.', { calls, pauses }));
  f.state = -2;
  out.push(F(4, 25, f, { ru: 'state = −2 — машина закончила работу.', en: 'state = −2: the machine has finished.' }, { calls, pauses }));
  out.push(F(4, 26, f, { ru: `SetResult(42) завершает задачу. Итого: вызовов MoveNext — ${calls}, приостановок — ${pauses}.`, en: `SetResult(42) completes the task. In total: MoveNext calls: ${calls}, suspensions: ${pauses}.` }, { calls, pauses, done: true }));
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
  { id: 'A', name: { ru: 'профиль', en: 'profile' }, ms: 300 },
  { id: 'B', name: { ru: 'заказы', en: 'orders' }, ms: 500 },
  { id: 'C', name: { ru: 'баланс', en: 'balance' }, ms: 200 }
];

/** Названия задач в барах и текст результата приходят уже на текущем языке. */
export function combine(mode, fails) {
  const bars = [], ALL = tr({ ru: 'все три ответа', en: 'all three responses' });
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
  return { bars, total: first.ms, thrown: null, inner: [], result: tr({ ru: 'задача ', en: 'task ' }) + first.id + (fails.includes(first.id) ? tr({ ru: ' (упавшая — WhenAny не бросает, исключение внутри задачи)', en: ' (a failed one: WhenAny doesn\'t throw, the exception stays inside the task)' }) : ''), first: first.id };
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
