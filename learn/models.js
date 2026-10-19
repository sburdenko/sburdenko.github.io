/**
 * Модели стендов для уроков. Без DOM — покрыты тестами.
 *
 * Это учебные модели: IL-машина честно исполняет маленькое подмножество CIL,
 * JIT-модель повторяет логику заглушек и многоуровневой компиляции, а гонка старта
 * показывает соотношения в условных единицах, это не бенчмарк.
 */

/* ---------- стековая машина CIL ---------- */

import { tr } from './i18n.js?v=202610191154';
import { t as tl, bi } from './ui.js?v=202610191154';

const BIN = {
  add: [(a, b) => a + b, '+'],
  sub: [(a, b) => a - b, '−'],
  mul: [(a, b) => a * b, '×'],
  div: [(a, b) => Math.trunc(a / b), '÷']
};

/** Разбирает строку IL: "ldarg.1", "ldc.i4 5", "ldc.i4.s 10", "ldc.i4.2". */
export function parseOp(line) {
  const [op, arg] = line.trim().split(/\s+/);
  let m;
  if ((m = /^ldarg\.([0-3])$/.exec(op))) return { op: 'ldarg', n: +m[1] };
  if (op === 'ldarg' || op === 'ldarg.s') return { op: 'ldarg', n: +arg };
  if ((m = /^ldc\.i4\.([0-8])$/.exec(op))) return { op: 'ldc', n: +m[1] };
  if (op === 'ldc.i4.m1') return { op: 'ldc', n: -1 };
  if (op === 'ldc.i4' || op === 'ldc.i4.s') return { op: 'ldc', n: +arg };
  if (op in BIN || op === 'dup' || op === 'pop' || op === 'ret' || op === 'nop') return { op };
  return { op: 'bad', text: op };
}

/**
 * Исполняет программу по шагам. args — [{ name, value }].
 * Возвращает кадры: кадр 0 — до запуска, дальше по одному на инструкцию.
 */
export function runIL(program, args = []) {
  /** @type {{ pc?: number, stack: any[], note: string, error?: any, ret?: any }[]} */
  const frames = [{ pc: -1, stack: [], note: tl('m.core.runIL.1') }];
  const stack = [];
  const push = (stackNow, note, extra = {}) => frames.push({ stack: [...stackNow], note, ...extra });
  for (let pc = 0; pc < program.length; pc++) {
    const ins = parseOp(program[pc]);
    const fail = note => { push(stack, note, { pc, error: true }); return { frames, error: note }; };
    if (ins.op === 'ldarg') {
      const a = args[ins.n];
      if (!a) return fail(tl('m.core.runIL.2', { n: ins.n }));
      stack.push(a.value);
      push(stack, tl('m.core.runIL.3', { name: a.name, value: a.value }), { pc });
    } else if (ins.op === 'ldc') {
      stack.push(ins.n);
      push(stack, tl('m.core.runIL.4', { n: ins.n }), { pc });
    } else if (ins.op in BIN) {
      if (stack.length < 2) return fail(tl('m.core.runIL.5', { op: ins.op, length: stack.length }));
      const b = stack.pop(), a = stack.pop();
      if (ins.op === 'div' && b === 0) return fail(tl('m.core.runIL.6'));
      const [f, sign] = BIN[ins.op];
      stack.push(f(a, b));
      push(stack, tl('m.core.runIL.7', { op: ins.op, a, b, sign, v1: stack.at(-1) }), { pc });
    } else if (ins.op === 'dup') {
      if (!stack.length) return fail(tl('m.core.runIL.8'));
      stack.push(stack.at(-1));
      push(stack, tl('m.core.runIL.9', { v1: stack.at(-1) }), { pc });
    } else if (ins.op === 'pop') {
      if (!stack.length) return fail(tl('m.core.runIL.10'));
      const v = stack.pop();
      push(stack, tl('m.core.runIL.11', { v1: v }), { pc });
    } else if (ins.op === 'nop') {
      push(stack, tl('m.core.runIL.12'), { pc });
    } else if (ins.op === 'ret') {
      if (stack.length !== 1) return fail(tl('m.core.runIL.13', { length: stack.length }));
      push(stack, tl('m.core.runIL.14', { v1: stack[0] }), { pc, ret: stack[0] });
      return { frames, ret: stack[0] };
    } else {
      return fail(tl('m.core.runIL.15', { text: ins.text }));
    }
  }
  const note = tl('m.core.runIL.16');
  frames.push({ pc: program.length - 1, stack: [...stack], note, error: true });
  return { frames, error: note };
}

/* ---------- JIT: заглушки и многоуровневая компиляция ---------- */

/**
 * methods — [{ name, calls?: [имена методов, которые он вызывает] }].
 * Состояние метода: stub (только заглушка) → native (машинный код).
 * При tiered: stub → tier0 (быстрый код) → tier1 (оптимизированный) после threshold вызовов.
 */
export function jitInit(methods, { tiered = false, threshold = 30 } = {}) {
  const m = {};
  for (const x of methods) m[x.name] = { calls: 0, jits: 0, state: 'stub', deps: x.calls ?? [] };
  return { m, order: methods.map(x => x.name), tiered, threshold, jits: 0, log: [] };
}

export const compiledCount = s => s.order.filter(n => s.m[n].state !== 'stub').length;

function callOnce(s, name, depth, log) {
  const x = s.m[name];
  x.calls++;
  if (x.state === 'stub') {
    x.jits++; s.jits++;
    x.state = s.tiered ? 'tier0' : 'native';
    log.push({ name, kind: 'jit', text: s.tiered
      ? tl('m.core.callOnce.1', { name })
      : tl('m.core.callOnce.2', { name }) });
  } else if (s.tiered && x.state === 'tier0' && x.calls >= s.threshold) {
    x.jits++; s.jits++;
    x.state = 'tier1';
    log.push({ name, kind: 'tier1', text: tl('m.core.callOnce.3', { name, threshold: s.threshold }) });
  } else if (depth === 0) {
    log.push({ name, kind: 'fast', text: tl('m.core.callOnce.4', { name }) });
  }
  for (const d of x.deps) callOnce(s, d, depth + 1, log);
}

/** Вызывает метод times раз (вместе со всеми методами, которые он вызывает). Не мутирует s. */
export function jitCall(s, name, times = 1) {
  const n = structuredClone(s);
  const log = [];
  for (let i = 0; i < times; i++) callOnce(n, name, 0, log);
  // повторы «сразу в машинный код» схлопываем в одну строку
  const fast = log.filter(e => e.kind === 'fast').length;
  const kept = log.filter(e => e.kind !== 'fast');
  if (fast) kept.push({ name, kind: 'fast', text: fast > 1
    ? tl('m.core.jitCall.1', { name, fast })
    : tl('m.core.jitCall.2', { name }) });
  n.log = [...s.log, ...kept].slice(-8);
  return n;
}

/* ---------- гонка старта: JIT / ReadyToRun / Native AOT ---------- */

/** Длины фаз в условных единицах: соотношения правдоподобные, абсолютные значения — нет. Тексты — { ru, en }, стенд берёт их через tr(). */
export const RACE = [
  { id: 'jit', name: bi('m.core.RACE.1'), phases: [['host', 30], ['jit', 55], ['run', 10]],
    traits: [bi('m.core.RACE.2'), bi('m.core.RACE.3'), bi('m.core.RACE.4')] },
  { id: 'r2r', name: 'ReadyToRun', phases: [['host', 30], ['jit', 12], ['run', 10]],
    traits: [bi('m.core.RACE.5'), bi('m.core.RACE.6'), bi('m.core.RACE.7')] },
  { id: 'aot', name: 'Native AOT', phases: [['host', 4], ['run', 10]],
    traits: [bi('m.core.RACE.8'), bi('m.core.RACE.9'), bi('m.core.RACE.10')] }
];

export const raceTotal = lane => lane.phases.reduce((s, [, len]) => s + len, 0);
export const raceWinner = () => RACE.reduce((a, b) => (raceTotal(b) < raceTotal(a) ? b : a)).id;
