/**
 * Модели раздела про потоки: гонка данных в count++, взаимная блокировка двух lock, пул потоков.
 * Без DOM — покрыты тестами. Вход тот же, что у models-mem.js: init(card), act(card, s, a), goal(card, s).
 */
import { rng } from '../assets/rand.js?v=202610100741';
import { tr } from './i18n.js?v=202610100741';

const clone = x => structuredClone(x);

/* =====================================================================
   Гонка данных. count++ — это три шага: прочитать, прибавить, записать.
   Человек сам решает, чей шаг следующий, — то есть играет роль планировщика ОС.
   ===================================================================== */

export const RACE_STEPS = {
  plain: ['read', 'inc', 'write'],
  lock: ['lock', 'read', 'inc', 'write', 'unlock'],
  atomic: ['atomic']
};

export const RACE_CODE = {
  read: 'tmp = count', inc: 'tmp = tmp + 1', write: 'count = tmp',
  lock: 'lock (gate) {', unlock: '}', atomic: 'Interlocked.Increment(ref count)'
};

export function raceInit(mode) {
  return { mode, count: 0, th: { A: { pc: 0, tmp: null }, B: { pc: 0, tmp: null } }, owner: null, log: [] };
}

const steps = s => RACE_STEPS[s.mode];
export const raceFinished = (s, t) => s.th[t].pc >= steps(s).length;
export const raceCan = (s, t) => !raceFinished(s, t) && !(steps(s)[s.th[t].pc] === 'lock' && s.owner && s.owner !== t);
export const raceDone = s => raceFinished(s, 'A') && raceFinished(s, 'B');

export function raceStep(s0, t) {
  if (!raceCan(s0, t)) return s0;
  const s = clone(s0), th = s.th[t], op = steps(s)[th.pc];
  let text;
  if (op === 'read') { th.tmp = s.count; text = tr({ ru: `${t} прочитал count = ${s.count} к себе в регистр.`, en: `${t} read count = ${s.count} into its register.` }); }
  if (op === 'inc') { th.tmp++; text = tr({ ru: `${t} прибавил 1 у себя в регистре: ${th.tmp}. В памяти count всё ещё ${s.count}.`, en: `${t} added 1 in its register: ${th.tmp}. In memory, count is still ${s.count}.` }); }
  if (op === 'write') {
    const lost = s.count >= th.tmp;
    s.count = th.tmp;
    text = tr({ ru: `${t} записал count = ${th.tmp}.`, en: `${t} wrote count = ${th.tmp}.` })
      + (lost ? tr({ ru: ' Это значение уже было — чужое увеличение затёрто!', en: ' That value was already there: the other thread\'s increment is overwritten!' }) : '');
  }
  if (op === 'lock') { s.owner = t; text = tr({ ru: `${t} вошёл в lock. Второй поток теперь будет ждать у входа.`, en: `${t} entered the lock. The other thread will now wait at the door.` }); }
  if (op === 'unlock') { s.owner = null; text = tr({ ru: `${t} вышел из lock.`, en: `${t} left the lock.` }); }
  if (op === 'atomic') { s.count++; th.tmp = s.count; text = tr({ ru: `${t}: Interlocked.Increment — прочитать, прибавить и записать одной неделимой операцией. count = ${s.count}.`, en: `${t}: Interlocked.Increment reads, adds and writes in one indivisible operation. count = ${s.count}.` }); }
  th.pc++;
  s.log = [...s.log, text].slice(-4);
  return s;
}

/**
 * Два потока по n раз делают count++. Планировщик отдаёт потоку кусок из 1–40 шагов и переключает —
 * как кванты времени у ОС. Потери случаются только на стыке, поэтому результат «почти правильный».
 */
export function raceRandom(mode, n, seed) {
  const r = rng(seed);
  const len = RACE_STEPS[mode].length;
  const th = [{ left: n, pc: 0, tmp: 0 }, { left: n, pc: 0, tmp: 0 }];
  let count = 0, owner = -1, cur = 0;
  const runnable = i => th[i].left > 0 && !(RACE_STEPS[mode][th[i].pc] === 'lock' && owner !== -1 && owner !== i);
  while (th[0].left > 0 || th[1].left > 0) {
    if (!runnable(cur)) cur = 1 - cur;
    let slice = 1 + Math.floor(r() * 40);
    while (slice-- > 0 && runnable(cur)) {
      const t = th[cur], op = RACE_STEPS[mode][t.pc];
      if (op === 'read') t.tmp = count;
      else if (op === 'inc') t.tmp++;
      else if (op === 'write') count = t.tmp;
      else if (op === 'lock') owner = cur;
      else if (op === 'unlock') owner = -1;
      else if (op === 'atomic') count++;
      if (++t.pc === len) { t.pc = 0; t.left--; }
    }
    cur = 1 - cur;
  }
  return count;
}

export const raceRig = {
  init: card => ({ ...raceInit(card.mode), runs: null }),
  act(card, s, a) {
    if (a === 'reset') return { ...raceInit(card.mode), runs: null };
    if (a.startsWith('step:')) return { ...raceStep(s, a.slice(5)), runs: s.runs };
    if (a === 'random') {
      const seed = (s.runs?.length ?? 0) * 7919 + 13;
      const result = raceRandom(card.mode, 1000, seed);
      return { ...s, runs: [...(s.runs ?? []), result].slice(-5) };
    }
    throw new Error(tr({ ru: `неизвестное действие ${a}`, en: `unknown action ${a}` }));
  },
  goal(card, s) {
    const g = card.goal;
    if (g === 'lost') return raceDone(s) && s.count === 1;
    if (g === 'done') return raceDone(s);
    if (g === 'random') return (s.runs?.length ?? 0) > 0;
    return false;
  }
};

/* =====================================================================
   Взаимная блокировка: два потока, два замка. Если брать их в разном порядке — можно застрять навсегда.
   ===================================================================== */

export function lockPlan(fixed) {
  return {
    A: ['lock L1', 'lock L2', 'work', 'unlock L2', 'unlock L1'],
    B: fixed ? ['lock L1', 'lock L2', 'work', 'unlock L2', 'unlock L1'] : ['lock L2', 'lock L1', 'work', 'unlock L1', 'unlock L2']
  };
}

export function lockInit(fixed) {
  return { fixed, plan: lockPlan(fixed), pc: { A: 0, B: 0 }, owner: { L1: null, L2: null }, log: [] };
}

const lockOp = (s, t) => s.plan[t][s.pc[t]];
export const lockFinished = (s, t) => s.pc[t] >= s.plan[t].length;
export function lockCan(s, t) {
  if (lockFinished(s, t)) return false;
  const [cmd, l] = lockOp(s, t).split(' ');
  return cmd !== 'lock' || s.owner[l] === null || s.owner[l] === t;
}
export function lockStatus(s) {
  if (lockFinished(s, 'A') && lockFinished(s, 'B')) return 'done';
  if (!lockCan(s, 'A') && !lockCan(s, 'B')) return 'deadlock';
  return 'run';
}

export function lockStep(s0, t) {
  if (!lockCan(s0, t)) return s0;
  const s = clone(s0);
  const [cmd, l] = lockOp(s, t).split(' ');
  let text;
  if (cmd === 'lock') { s.owner[l] = t; text = tr({ ru: `${t} захватил ${l}.`, en: `${t} acquired ${l}.` }); }
  if (cmd === 'unlock') { s.owner[l] = null; text = tr({ ru: `${t} отпустил ${l}.`, en: `${t} released ${l}.` }); }
  if (cmd === 'work') text = tr({ ru: `${t} держит оба замка и делает работу.`, en: `${t} holds both locks and does the work.` });
  s.pc[t]++;
  const st = lockStatus(s);
  if (st === 'deadlock') text += tr({ ru: ' Оба потока ждут замок, который держит другой. Это deadlock: сами они не выйдут никогда.', en: ' Each thread waits for the lock the other one holds. This is a deadlock: they will never get out on their own.' });
  s.log = [...s.log, text].slice(-4);
  return s;
}

export const lockRig = {
  init: card => lockInit(Boolean(card.fixed)),
  act(card, s, a) {
    if (a === 'reset') return lockInit(s.fixed);
    if (a === 'fix') return lockInit(!s.fixed);
    if (a.startsWith('step:')) return lockStep(s, a.slice(5));
    throw new Error(tr({ ru: `неизвестное действие ${a}`, en: `unknown action ${a}` }));
  },
  goal(card, s) {
    if (card.goal === 'deadlock') return lockStatus(s) === 'deadlock';
    if (card.goal === 'fixed') return s.fixed && lockStatus(s) === 'done';
    return false;
  }
};

/* =====================================================================
   Пул потоков. Время идёт тиками. Запрос:
     cpu   — 2 тика работы на потоке;
     block — 1 тик работы и 5 тиков блокировки (.Result ждёт сеть), поток всё это время занят;
     async — 1 тик работы, дальше сеть ждёт без потока (5 тиков), потом 1 тик продолжения.
   Если очередь стоит, а свободных потоков нет два тика подряд, пул добавляет поток.
   ===================================================================== */

export const POOL_IO = 5;

export function poolInit({ min = 4, max = 24 } = {}) {
  return { tick: 0, min, max, threads: Array.from({ length: min }, () => null), queue: [], io: [], done: [], next: 1, starve: 0, added: 0, log: [] };
}

export function poolAdd(s0, kind, n) {
  const s = clone(s0);
  for (let i = 0; i < n; i++) s.queue.push({ id: s.next++, kind, phase: 'start', enq: s.tick });
  return s;
}

function jobFor(req) {
  if (req.phase === 'cont') return { req, left: 1, cpu: 1 };
  if (req.kind === 'cpu') return { req, left: 2, cpu: 2 };
  if (req.kind === 'block') return { req, left: 1 + POOL_IO, cpu: 1 };
  return { req, left: 1, cpu: 1 };   // async: только старт, дальше поток свободен
}

export function poolTick(s0) {
  const s = clone(s0);
  // 1. ответы сети пришли — продолжения встают в очередь
  const ready = s.io.filter(x => x.at <= s.tick);
  s.io = s.io.filter(x => x.at > s.tick);
  ready.forEach(x => s.queue.push({ ...x.req, phase: 'cont' }));
  // 2. свободные потоки берут работу
  s.threads = s.threads.map(j => j ?? (s.queue.length ? jobFor(s.queue.shift()) : null));
  // 3. тик работы
  s.threads = s.threads.map(j => {
    if (!j) return null;
    const used = { ...j, left: j.left - 1, ran: (j.ran ?? 0) + 1 };
    if (used.left > 0) return used;
    if (j.req.kind === 'async' && j.req.phase === 'start') s.io.push({ req: j.req, at: s.tick + POOL_IO });
    else s.done.push({ id: j.req.id, kind: j.req.kind, wait: s.tick + 1 - j.req.enq });
    return null;
  });
  // 4. голодание: очередь стоит, свободных нет — пул добавляет поток, но не сразу
  const idle = s.threads.filter(j => !j).length;
  if (s.queue.length && !idle) {
    s.starve++;
    if (s.starve >= 2 && s.threads.length < s.max) {
      s.threads.push(null); s.added++; s.starve = 0;
      s.log = [...s.log, tr({ ru: `Тик ${s.tick + 1}: очередь стоит, все потоки заняты — пул добавил поток №${s.threads.length}.`, en: `Tick ${s.tick + 1}: the queue is stuck and all threads are busy, so the pool added thread #${s.threads.length}.` })].slice(-4);
    }
  } else s.starve = 0;
  s.tick++;
  return s;
}

export const poolBlocked = s => s.threads.filter(j => j && j.req.kind === 'block' && j.req.phase === 'start' && j.ran >= 1).length;
export const poolAvgWait = (s, kind) => {
  const d = s.done.filter(x => !kind || x.kind === kind);
  return d.length ? d.reduce((a, x) => a + x.wait, 0) / d.length : 0;
};

export const poolRig = {
  init: card => poolInit(card.pool),
  act(card, s, a) {
    const [cmd, arg, n] = a.split(':');
    if (cmd === 'reset') return poolInit(card.pool);
    if (cmd === 'add') return poolAdd(s, arg, +(n ?? 8));
    if (cmd === 'tick') { let x = s; for (let i = 0; i < +(arg ?? 1); i++) x = poolTick(x); return x; }
    throw new Error(tr({ ru: `неизвестное действие ${a}`, en: `unknown action ${a}` }));
  },
  goal(card, s) {
    const g = card.goal;
    if (g.kind === 'done') return s.done.filter(x => !g.of || x.kind === g.of).length >= g.n;
    if (g.kind === 'threads') return s.threads.length >= g.min;
    if (g.kind === 'queue') return s.queue.length >= g.min;
    return false;
  }
};
