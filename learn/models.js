/**
 * Модели стендов для уроков. Без DOM — покрыты тестами.
 *
 * Это учебные модели: IL-машина честно исполняет маленькое подмножество CIL,
 * JIT-модель повторяет логику заглушек и многоуровневой компиляции, а гонка старта
 * показывает соотношения в условных единицах, это не бенчмарк.
 */

/* ---------- стековая машина CIL ---------- */

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
  const frames = [{ pc: -1, stack: [], note: 'Машина готова. Стек пуст.' }];
  const stack = [];
  const push = (stackNow, note, extra = {}) => frames.push({ stack: [...stackNow], note, ...extra });
  for (let pc = 0; pc < program.length; pc++) {
    const ins = parseOp(program[pc]);
    const fail = note => { push(stack, note, { pc, error: true }); return { frames, error: note }; };
    if (ins.op === 'ldarg') {
      const a = args[ins.n];
      if (!a) return fail(`У метода нет аргумента №${ins.n}.`);
      stack.push(a.value);
      push(stack, `Кладём на стек аргумент ${a.name} = ${a.value}.`, { pc });
    } else if (ins.op === 'ldc') {
      stack.push(ins.n);
      push(stack, `Кладём на стек число ${ins.n}.`, { pc });
    } else if (ins.op in BIN) {
      if (stack.length < 2) return fail(`${ins.op} нужно два числа, а на стеке ${stack.length}. Стек «провалился» — stack underflow.`);
      const b = stack.pop(), a = stack.pop();
      if (ins.op === 'div' && b === 0) return fail('Деление на ноль — DivideByZeroException.');
      const [f, sign] = BIN[ins.op];
      stack.push(f(a, b));
      push(stack, `${ins.op}: снимаем ${a} и ${b}, кладём ${a} ${sign} ${b} = ${stack.at(-1)}.`, { pc });
    } else if (ins.op === 'dup') {
      if (!stack.length) return fail('dup: копировать нечего, стек пуст.');
      stack.push(stack.at(-1));
      push(stack, `dup: копируем вершину, теперь там два раза ${stack.at(-1)}.`, { pc });
    } else if (ins.op === 'pop') {
      if (!stack.length) return fail('pop: снимать нечего, стек пуст.');
      const v = stack.pop();
      push(stack, `pop: выбрасываем ${v}.`, { pc });
    } else if (ins.op === 'nop') {
      push(stack, 'nop: ничего не делаем.', { pc });
    } else if (ins.op === 'ret') {
      if (stack.length !== 1) return fail(`ret: на стеке должно остаться ровно одно значение, а их ${stack.length}.`);
      push(stack, `ret: метод возвращает ${stack[0]}.`, { pc, ret: stack[0] });
      return { frames, ret: stack[0] };
    } else {
      return fail(`Машина не знает инструкцию «${ins.text}».`);
    }
  }
  const note = 'Программа кончилась без ret.';
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
      ? `${name}: первый вызов → заглушка зовёт JIT → быстрый код Tier 0.`
      : `${name}: первый вызов → заглушка зовёт JIT → машинный код готов, заглушка теперь ведёт прямо в него.` });
  } else if (s.tiered && x.state === 'tier0' && x.calls >= s.threshold) {
    x.jits++; s.jits++;
    x.state = 'tier1';
    log.push({ name, kind: 'tier1', text: `${name}: ${s.threshold}-й вызов — метод «горячий», JIT в фоне собирает оптимизированный Tier 1.` });
  } else if (depth === 0) {
    log.push({ name, kind: 'fast', text: `${name}: сразу в машинный код, JIT не нужен.` });
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
  if (fast) kept.push({ name, kind: 'fast', text: fast > 1 ? `${name}: ещё ${fast} вызовов сразу в машинный код.` : `${name}: сразу в машинный код, JIT не нужен.` });
  n.log = [...s.log, ...kept].slice(-8);
  return n;
}

/* ---------- гонка старта: JIT / ReadyToRun / Native AOT ---------- */

/** Длины фаз в условных единицах: соотношения правдоподобные, абсолютные значения — нет. */
export const RACE = [
  { id: 'jit', name: 'Обычный (JIT)', phases: [['host', 30], ['jit', 55], ['run', 10]],
    traits: ['маленький .dll', 'нужен установленный .NET', 'JIT компилирует при каждом запуске'] },
  { id: 'r2r', name: 'ReadyToRun', phases: [['host', 30], ['jit', 12], ['run', 10]],
    traits: ['файл крупнее: внутри и готовый код, и IL', 'нужен установленный .NET', 'JIT почти не работает на старте'] },
  { id: 'aot', name: 'Native AOT', phases: [['host', 4], ['run', 10]],
    traits: ['один нативный файл', '.NET ставить не нужно', 'JIT нет вообще, но нельзя грузить код на лету'] }
];

export const raceTotal = lane => lane.phases.reduce((s, [, len]) => s + len, 0);
export const raceWinner = () => RACE.reduce((a, b) => (raceTotal(b) < raceTotal(a) ? b : a)).id;
