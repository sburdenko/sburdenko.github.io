/**
 * Модели стендов для уроков. Без DOM — покрыты тестами.
 *
 * Это учебные модели: IL-машина честно исполняет маленькое подмножество CIL,
 * JIT-модель повторяет логику заглушек и многоуровневой компиляции, а гонка старта
 * показывает соотношения в условных единицах, это не бенчмарк.
 */

/* ---------- стековая машина CIL ---------- */

import { tr } from './i18n.js?v=202610092124';

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
  const frames = [{ pc: -1, stack: [], note: tr({ ru: 'Машина готова. Стек пуст.', en: 'The machine is ready. The stack is empty.' }) }];
  const stack = [];
  const push = (stackNow, note, extra = {}) => frames.push({ stack: [...stackNow], note, ...extra });
  for (let pc = 0; pc < program.length; pc++) {
    const ins = parseOp(program[pc]);
    const fail = note => { push(stack, note, { pc, error: true }); return { frames, error: note }; };
    if (ins.op === 'ldarg') {
      const a = args[ins.n];
      if (!a) return fail(tr({ ru: `У метода нет аргумента №${ins.n}.`, en: `The method has no argument #${ins.n}.` }));
      stack.push(a.value);
      push(stack, tr({ ru: `Кладём на стек аргумент ${a.name} = ${a.value}.`, en: `Push argument ${a.name} = ${a.value} onto the stack.` }), { pc });
    } else if (ins.op === 'ldc') {
      stack.push(ins.n);
      push(stack, tr({ ru: `Кладём на стек число ${ins.n}.`, en: `Push the number ${ins.n} onto the stack.` }), { pc });
    } else if (ins.op in BIN) {
      if (stack.length < 2) return fail(tr({ ru: `${ins.op} нужно два числа, а на стеке ${stack.length}. Стек «провалился» — stack underflow.`, en: `${ins.op} needs two numbers, but the stack holds ${stack.length}. Stack underflow.` }));
      const b = stack.pop(), a = stack.pop();
      if (ins.op === 'div' && b === 0) return fail(tr({ ru: 'Деление на ноль — DivideByZeroException.', en: 'Division by zero: DivideByZeroException.' }));
      const [f, sign] = BIN[ins.op];
      stack.push(f(a, b));
      push(stack, tr({ ru: `${ins.op}: снимаем ${a} и ${b}, кладём ${a} ${sign} ${b} = ${stack.at(-1)}.`, en: `${ins.op}: pop ${a} and ${b}, push ${a} ${sign} ${b} = ${stack.at(-1)}.` }), { pc });
    } else if (ins.op === 'dup') {
      if (!stack.length) return fail(tr({ ru: 'dup: копировать нечего, стек пуст.', en: 'dup: nothing to copy, the stack is empty.' }));
      stack.push(stack.at(-1));
      push(stack, tr({ ru: `dup: копируем вершину, теперь там два раза ${stack.at(-1)}.`, en: `dup: copy the top, now ${stack.at(-1)} is there twice.` }), { pc });
    } else if (ins.op === 'pop') {
      if (!stack.length) return fail(tr({ ru: 'pop: снимать нечего, стек пуст.', en: 'pop: nothing to pop, the stack is empty.' }));
      const v = stack.pop();
      push(stack, tr({ ru: `pop: выбрасываем ${v}.`, en: `pop: discard ${v}.` }), { pc });
    } else if (ins.op === 'nop') {
      push(stack, tr({ ru: 'nop: ничего не делаем.', en: 'nop: do nothing.' }), { pc });
    } else if (ins.op === 'ret') {
      if (stack.length !== 1) return fail(tr({ ru: `ret: на стеке должно остаться ровно одно значение, а их ${stack.length}.`, en: `ret: exactly one value must be left on the stack, but there are ${stack.length}.` }));
      push(stack, tr({ ru: `ret: метод возвращает ${stack[0]}.`, en: `ret: the method returns ${stack[0]}.` }), { pc, ret: stack[0] });
      return { frames, ret: stack[0] };
    } else {
      return fail(tr({ ru: `Машина не знает инструкцию «${ins.text}».`, en: `The machine doesn't know the instruction "${ins.text}".` }));
    }
  }
  const note = tr({ ru: 'Программа кончилась без ret.', en: 'The program ended without ret.' });
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
      ? tr({ ru: `${name}: первый вызов → заглушка зовёт JIT → быстрый код Tier 0.`, en: `${name}: first call → the stub calls the JIT → quick Tier 0 code.` })
      : tr({ ru: `${name}: первый вызов → заглушка зовёт JIT → машинный код готов, заглушка теперь ведёт прямо в него.`, en: `${name}: first call → the stub calls the JIT → machine code is ready, and the stub now jumps straight to it.` }) });
  } else if (s.tiered && x.state === 'tier0' && x.calls >= s.threshold) {
    x.jits++; s.jits++;
    x.state = 'tier1';
    log.push({ name, kind: 'tier1', text: tr({ ru: `${name}: ${s.threshold}-й вызов — метод «горячий», JIT в фоне собирает оптимизированный Tier 1.`, en: `${name}: call #${s.threshold}, the method is "hot", so the JIT builds optimized Tier 1 code in the background.` }) });
  } else if (depth === 0) {
    log.push({ name, kind: 'fast', text: tr({ ru: `${name}: сразу в машинный код, JIT не нужен.`, en: `${name}: straight into machine code, no JIT needed.` }) });
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
    ? tr({ ru: `${name}: ещё ${fast} вызовов сразу в машинный код.`, en: `${name}: ${fast} more calls straight into machine code.` })
    : tr({ ru: `${name}: сразу в машинный код, JIT не нужен.`, en: `${name}: straight into machine code, no JIT needed.` }) });
  n.log = [...s.log, ...kept].slice(-8);
  return n;
}

/* ---------- гонка старта: JIT / ReadyToRun / Native AOT ---------- */

/** Длины фаз в условных единицах: соотношения правдоподобные, абсолютные значения — нет. Тексты — { ru, en }, стенд берёт их через tr(). */
export const RACE = [
  { id: 'jit', name: { ru: 'Обычный (JIT)', en: 'Regular (JIT)' }, phases: [['host', 30], ['jit', 55], ['run', 10]],
    traits: [{ ru: 'маленький .dll', en: 'small .dll' }, { ru: 'нужен установленный .NET', en: 'needs .NET installed' }, { ru: 'JIT компилирует при каждом запуске', en: 'the JIT compiles on every launch' }] },
  { id: 'r2r', name: 'ReadyToRun', phases: [['host', 30], ['jit', 12], ['run', 10]],
    traits: [{ ru: 'файл крупнее: внутри и готовый код, и IL', en: 'bigger file: holds both precompiled code and IL' }, { ru: 'нужен установленный .NET', en: 'needs .NET installed' }, { ru: 'JIT почти не работает на старте', en: 'the JIT barely runs at startup' }] },
  { id: 'aot', name: 'Native AOT', phases: [['host', 4], ['run', 10]],
    traits: [{ ru: 'один нативный файл', en: 'a single native file' }, { ru: '.NET ставить не нужно', en: 'no need to install .NET' }, { ru: 'JIT нет вообще, но нельзя грузить код на лету', en: 'no JIT at all, but you can\'t load code on the fly' }] }
];

export const raceTotal = lane => lane.phases.reduce((s, [, len]) => s + len, 0);
export const raceWinner = () => RACE.reduce((a, b) => (raceTotal(b) < raceTotal(a) ? b : a)).id;
