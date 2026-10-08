/**
 * Модели курса «Async/await до дна». Без DOM — покрыты тестами.
 * Вход тот же, что у других стендов: init(card), act(card, s, 'действие'), goal(card, s).
 */
const clone = x => structuredClone(x);

/* =====================================================================
   Таймлайн потоков. Сценарий один и тот же: обработчик вызывает GetDataAsync,
   та отправляет запрос в сеть и ждёт ответ, потом разбирает его, обработчик показывает результат.
   Меняются три вещи: какой контекст у программы, как вызван метод и есть ли ConfigureAwait(false).
   ===================================================================== */

export const IO_TICKS = 3;
export const CTX = {
  ui: { main: 'UI-поток', loop: true, name: 'WPF / WinForms' },
  console: { main: 'Главный поток', loop: false, name: 'консоль / ASP.NET Core' },
  unity: { main: 'Главный поток Unity', loop: true, name: 'Unity' }
};

/**
 * Прогоняет сценарий по тикам и возвращает кадры. o = { ctx, call: 'sync'|'result'|'await', cfa, api }.
 * api — продолжение внутри GetDataAsync трогает объекты главного потока (контрол окна, transform в Unity).
 */
export function simulate(o) {
  const ctx = CTX[o.ctx], C1 = o.api ? (o.ctx === 'unity' ? 'transform.position = … (продолжение)' : 'label.Text = ответ (продолжение)') : 'разобрать ответ (продолжение)';
  const C2 = 'показать результат (обработчик после await)';
  const frames = [];
  let mainQ = [], poolQ = [], io = null, syncLeft = 0, syncTail = [], taskDone = false, c2Queued = false;
  let blocked = null, status = 'run', clickAt = null, note;
  const target = useCtx => (useCtx && ctx.loop ? 'main' : 'pool');
  const push = (main, pool, text) => frames.push({
    t: frames.length, main, pool, mainQ: [...mainQ], poolQ: [...poolQ], io, taskDone, status, clickAt, note: text
  });

  // тик 0: обработчик вызывает метод, тот отправляет запрос
  if (o.call === 'sync') {
    syncLeft = IO_TICKS; blocked = 'ждёт ответ сети (синхронный вызов)';
    push({ kind: 'run', label: 'обработчик → GetData(): отправить запрос' }, null, 'Обработчик вызвал обычный синхронный метод. Тот отправил запрос — и теперь поток будет стоять, пока не придёт ответ.');
  } else {
    io = IO_TICKS;
    blocked = o.call === 'result' ? 'ждёт .Result' : null;
    push({ kind: 'run', label: 'обработчик → GetDataAsync(): отправить запрос' }, null,
      'GetDataAsync выполняется синхронно до первого await, отправляет запрос и возвращает незавершённый Task. ' +
      (o.call === 'result' ? 'Обработчик сразу берёт у задачи .Result — и поток блокируется.' : 'Обработчик делает await этой задачи и возвращает управление — поток свободен.'));
  }

  // после результата даём главному потоку разобрать очередь — видно, когда до клика дошли руки
  for (let t = 1; t <= 14 && (status === 'run' || (status === 'done' && mainQ.length)); t++) {
    const said = [];
    if (t === 1 && ctx.loop) { mainQ.push('клик пользователя'); said.push('Пользователь кликнул — сообщение встало в очередь главного потока.'); }
    if (io != null) {
      io--;
      if (io === 0) {
        io = null;
        const where = target(!o.cfa);
        (where === 'main' ? mainQ : poolQ).push(C1);
        said.push(where === 'main'
          ? `Ответ пришёл. await захватил контекст (${ctx.name}), поэтому продолжение встало в очередь главного потока.`
          : o.cfa ? 'Ответ пришёл. Из-за ConfigureAwait(false) продолжение ушло в пул потоков.' : 'Ответ пришёл. Контекста нет — продолжение выполнит пул потоков.');
      }
    }
    // главный поток
    let main;
    const runMain = label => {
      main = { kind: 'run', label };
      if (label === C1) { taskDone = true; said.push('Продолжение выполнено — задача GetDataAsync завершена.'); }
      if (label === C2 || label.startsWith('показать результат')) { status = 'done'; said.push('Результат показан.'); }
      if (label === 'клик пользователя') { clickAt = t; said.push(`Клик обработан на тике ${t}.`); }
    };
    if (o.call === 'sync' && syncLeft > 0) {
      syncLeft--;
      main = { kind: 'blocked', label: blocked };
      if (syncLeft === 0) { syncTail = ['разобрать ответ', 'показать результат']; blocked = null; said.push('Ответ пришёл, поток продолжает.'); }
      else if (mainQ.includes('клик пользователя')) said.push('Клик ждёт в очереди: поток занят ожиданием, окно «не отвечает».');
    } else if (syncTail.length) {
      runMain(syncTail.shift());
    } else if (blocked && taskDone) {
      blocked = null;
      runMain('показать результат (после .Result)');
    } else if (blocked) {
      main = { kind: 'blocked', label: blocked };
    } else if (mainQ.length) {
      runMain(mainQ.shift());
    } else {
      main = { kind: 'idle', label: ctx.loop ? 'свободен, крутит очередь сообщений' : 'свободен' };
    }
    // пул
    let pool = null;
    if (poolQ.length) {
      const label = poolQ.shift();
      pool = { kind: 'run', label };
      if (label === C1) {
        if (o.api && ctx.loop) {
          status = 'error';
          said.push(o.ctx === 'unity'
            ? 'UnityException: get_transform can only be called from the main thread. Unity API можно трогать только из главного потока.'
            : 'InvalidOperationException: The calling thread cannot access this object because a different thread owns it. Контрол окна можно трогать только из UI-потока.');
        } else { taskDone = true; said.push('Продолжение выполнил поток пула — задача GetDataAsync завершена.'); }
      }
      if (label === C2) { status = 'done'; said.push('Результат показан. Готово.'); }
    }
    // обработчик с await продолжится, когда задача завершится
    if (taskDone && o.call === 'await' && !c2Queued && status === 'run') {
      c2Queued = true;
      (target(true) === 'main' ? mainQ : poolQ).push(C2);
      said.push(target(true) === 'main' ? 'Обработчик ждал через await с захватом контекста — его продолжение встало в очередь главного потока.' : 'Продолжение обработчика встало в пул.');
    }
    // взаимная блокировка: главный поток ждёт задачу, а задача ждёт главный поток
    if (status === 'run' && blocked === 'ждёт .Result' && !taskDone && io == null && !poolQ.length && !pool && mainQ.includes(C1)) {
      status = 'deadlock';
      said.push('DEADLOCK. Главный поток стоит на .Result и ждёт задачу. А задаче, чтобы завершиться, нужно выполнить продолжение — в очереди этого самого главного потока. Никто никого не дождётся.');
    }
    note = said.join(' ') || (main.kind === 'blocked' ? 'Ждём.' : 'Тик без событий.');
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
  const F = (src, mn, fields, note, extra = {}) => ({ src, mn, fields: { ...fields }, note, ...extra });
  const f = { state: -1, a: '—', b: '—', awaiter: '—' };
  const out = [F(-1, -1, f, 'Вызов SumAsync(): компилятор создал структуру-машину с полями state, a, b, awaiter и вызвал MoveNext.', { calls: 0, pauses: 0 })];
  let calls = 1, pauses = 0;
  out.push(F(0, 2, f, 'MoveNext №1. state = −1 — метод только начался, переходов нет.', { calls, pauses }));
  f.awaiter = cached ? 'TaskAwaiter (A готов)' : 'TaskAwaiter (A ещё в пути)';
  out.push(F(2, 7, f, 'Вызываем GetAAsync() и берём у задачи awaiter.', { calls, pauses }));
  if (!cached) {
    f.state = 0;
    out.push(F(2, 10, f, 'IsCompleted = false. Запоминаем, где остановились: state = 0.', { calls, pauses }));
    pauses++;
    out.push(F(2, 11, f, 'AwaitUnsafeOnCompleted подписывает MoveNext на завершение задачи, и метод возвращается. Вызывающий получил незавершённый Task, поток свободен.', { calls, pauses, suspended: true }));
    calls++;
    out.push(F(2, 4, f, 'Ответ A пришёл — MoveNext №2. switch видит state = 0 и прыгает на AfterA.', { calls, pauses }));
  } else {
    out.push(F(2, 8, f, 'IsCompleted = true: ответ уже есть. Никакой приостановки — идём дальше в этом же вызове MoveNext.', { calls, pauses }));
  }
  f.a = 2;
  out.push(F(2, 15, f, 'GetResult() отдаёт результат: a = 2.', { calls, pauses }));
  f.awaiter = cached ? 'TaskAwaiter (B готов)' : 'TaskAwaiter (B ещё в пути)';
  out.push(F(3, 16, f, 'Вызываем GetBAsync().', { calls, pauses }));
  if (!cached) {
    f.state = 1;
    out.push(F(3, 19, f, 'Снова не готово: state = 1.', { calls, pauses }));
    pauses++;
    out.push(F(3, 20, f, 'Подписываемся и возвращаемся — вторая приостановка.', { calls, pauses, suspended: true }));
    calls++;
    out.push(F(3, 5, f, 'Ответ B пришёл — MoveNext №3, прыжок на AfterB.', { calls, pauses }));
  } else {
    out.push(F(3, 17, f, 'Тоже готово — продолжаем без остановки.', { calls, pauses }));
  }
  f.b = 40;
  out.push(F(3, 24, f, 'b = 40.', { calls, pauses }));
  f.state = -2;
  out.push(F(4, 25, f, 'state = −2 — машина закончила работу.', { calls, pauses }));
  out.push(F(4, 26, f, `SetResult(42) завершает задачу. Итого: вызовов MoveNext — ${calls}, приостановок — ${pauses}.`, { calls, pauses, done: true }));
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
  { id: 'A', name: 'профиль', ms: 300 },
  { id: 'B', name: 'заказы', ms: 500 },
  { id: 'C', name: 'баланс', ms: 200 }
];

export function combine(mode, fails) {
  const bars = [];
  if (mode === 'seq') {
    let t = 0, thrown = null;
    for (const x of TASKS) {
      if (thrown) { bars.push({ ...x, start: null, end: null, state: 'skip' }); continue; }
      bars.push({ ...x, start: t, end: t + x.ms, state: fails.includes(x.id) ? 'fail' : 'ok' });
      t += x.ms;
      if (fails.includes(x.id)) thrown = x.id;
    }
    return { bars, total: t, thrown, inner: thrown ? [thrown] : [], result: thrown ? null : 'все три ответа' };
  }
  TASKS.forEach(x => bars.push({ ...x, start: 0, end: x.ms, state: fails.includes(x.id) ? 'fail' : 'ok' }));
  if (mode === 'all') {
    const failed = TASKS.filter(x => fails.includes(x.id)).map(x => x.id);
    return { bars, total: Math.max(...TASKS.map(x => x.ms)), thrown: failed[0] ?? null, inner: failed, result: failed.length ? null : 'все три ответа' };
  }
  const first = [...TASKS].sort((p, q) => p.ms - q.ms)[0];
  return { bars, total: first.ms, thrown: null, inner: [], result: `задача ${first.id}${fails.includes(first.id) ? ' (упавшая — WhenAny не бросает, исключение внутри задачи)' : ''}`, first: first.id };
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
