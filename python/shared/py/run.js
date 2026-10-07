/**
 * runProgram(source, options) → { events, out, error, lines }.
 * Each event is a frozen { kind, line, printed, mem, … } with the memory snapshot taken right after the step.
 */
import { parse } from './parser.js?v=202609271602';
import { PySyntaxError } from './lexer.js?v=202609271602';
import { Interp, StepLimit } from './interp.js?v=202609271602';
import { installBuiltins } from './builtins.js?v=202609271602';
import { installModules } from './modules.js?v=202609271602';
import { snapshot } from './snapshot.js?v=202609271602';
import { PyError, resetIds } from './objects.js?v=202609271602';
import { strOf } from './convert.js?v=202609271602';

export const MAX_STEPS = 400;

export function createInterp(options = {}) {
  const interp = new Interp(options);
  installBuiltins(interp);
  installModules(interp);
  return interp;
}

/** Runs the whole program; never throws for Python errors, they come back in `error`. */
export function runProgram(source, { inputs = [], maxSteps = MAX_STEPS, recursionLimit = 1000, files = {}, snapshots = true } = {}) {
  resetIds();
  const lines = source.split('\n');
  const events = [];
  let ast;
  try { ast = parse(source); }
  catch (e) {
    if (e instanceof PySyntaxError) return { events, out: '', lines, error: { type: e.pyName, message: e.message, line: e.line, traceback: [] }, inputsUsed: [] };
    throw e;
  }
  const interp = createInterp({ inputs, maxSteps, recursionLimit, files });
  const push = ev => {
    const mem = snapshots ? snapshot(interp) : null;
    events.push(Object.freeze({ ...ev, mem, out: interp.transcript }));
  };
  let error = null;
  try {
    const gen = interp.run(ast);
    let r = gen.next();
    while (!r.done) {
      if (r.value && r.value.kind) push(r.value);
      r = gen.next();
    }
  } catch (e) {
    if (e instanceof PyError) {
      const exc = e.exc;
      const message = messageOf(interp, exc);
      const tb = [{ name: '<module>', line: topLine(interp, e) }, ...(e.tb || [])];
      error = { type: exc.cls.name, message, line: tb.at(-1).line, traceback: tb, cause: causeOf(interp, exc) };
      push({ kind: 'error', line: tb.at(-1).line, printed: interp.stepOut.join(''), touched: [], exc: exc.cls.name, msg: message, traceback: tb });
    } else if (e instanceof StepLimit) {
      error = { type: 'StepLimit', message: `more than ${maxSteps} steps`, line: interp.curLine, traceback: [] };
    } else {
      error = { type: 'InternalError', message: String(e && e.message || e), line: interp.curLine, traceback: [], internal: true };
      if (typeof process !== 'undefined' && process.env && process.env.PY_DEBUG) console.error(e);
    }
  }
  if (!error && !events.length) push({ kind: 'end', line: 0, printed: '', touched: [] });
  return { events, out: interp.out, transcript: interp.transcript, lines, error, inputsUsed: interp.inputUsed, files: interp.files };
}

function topLine(interp, e) {
  const first = e.tb && e.tb.length ? e.tb[0] : null;
  if (!first) return interp.curLine;
  return interp.frames.length ? interp.curLine : (e.callLine ?? interp.curLine);
}

function messageOf(interp, exc) {
  try {
    const g = strOf(interp, exc);
    let r = g.next();
    while (!r.done) r = g.next();
    return r.value;
  } catch { return ''; }
}

function causeOf(interp, exc) {
  const cause = exc.dict.get('__cause__');
  if (!cause || cause.cls === undefined || !cause.cls.isException) return null;
  return { type: cause.cls.name, message: messageOf(interp, cause) };
}

/** Formats a CPython-style traceback for the console panel. */
export function formatTraceback(error) {
  if (!error) return '';
  if (error.type === 'SyntaxError') return `  File "main.py", line ${error.line}\nSyntaxError: ${error.message}`;
  const frames = error.traceback.map(f => `  File "main.py", line ${f.line}, in ${f.name}`).join('\n');
  const head = error.cause ? `${error.cause.type}: ${error.cause.message}\n\nThe above exception was the direct cause of the following exception:\n\n` : '';
  return `${head}Traceback (most recent call last):\n${frames}\n${error.type}${error.message ? ': ' + error.message : ''}`;
}
