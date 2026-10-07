import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runProgram } from '../python/shared/py/run.js';

const here = dirname(fileURLToPath(import.meta.url));
const corpus = join(here, 'python-corpus');
const hasPython = spawnSync('python3', ['--version']).status === 0;

/** Every corpus file runs through the interpreter and, when python3 is installed, through CPython too. */
for (const file of readdirSync(corpus).filter(f => f.endsWith('.py')).sort()) {
  const src = readFileSync(join(corpus, file), 'utf8');
  const inputs = (src.match(/^# input: (.*)$/m) || [, ''])[1].split('|').filter(Boolean);
  test(`corpus ${file} matches CPython`, { skip: hasPython ? false : 'python3 is not installed' }, () => {
    const ours = runProgram(src, { inputs, maxSteps: 200000, snapshots: false });
    assert.ok(!ours.error || !ours.error.internal, `internal error: ${ours.error && ours.error.message}`);
    const py = spawnSync('python3', ['-c', src], { input: inputs.join('\n') + '\n', encoding: 'utf8', timeout: 20000 });
    assert.equal(ours.out, py.stdout);
    const errLines = py.stderr.trim().split('\n').filter(l => !/Warning/.test(l) && !/^\s*\^/.test(l));
    const expectedError = (errLines.pop() || '').split(':')[0].trim();
    assert.equal(ours.error ? ours.error.type : '', expectedError);
  });
}

test('events carry frozen memory snapshots with consistent references', () => {
  const r = runProgram('a = [1, 2]\nb = a\ndef add(x):\n    x.append(3)\n    return len(x)\nn = add(b)\nprint(a, n)\n');
  assert.equal(r.error, null);
  assert.equal(r.out, '[1, 2, 3] 3\n');
  assert.deepEqual(r.events.map(e => e.kind), ['assign', 'assign', 'def', 'call', 'expr', 'return', 'assign', 'expr']);
  for (const e of r.events) {
    assert.ok(Object.isFrozen(e) && Object.isFrozen(e.mem), 'event and snapshot are frozen');
    for (const f of e.mem.frames) for (const [, id] of f.vars) assert.ok(e.mem.objects[id], `name points to a known object (${id})`);
    for (const o of Object.values(e.mem.objects)) for (const id of o.items || []) assert.ok(e.mem.objects[id], 'container item is a known object');
  }
  const call = r.events[3];
  assert.equal(call.mem.frames.length, 2);
  assert.equal(call.mem.frames[1].name, 'add');
  const [, aId] = r.events[0].mem.frames[0].vars.find(([k]) => k === 'a');
  const [, bId] = r.events[1].mem.frames[0].vars.find(([k]) => k === 'b');
  assert.equal(aId, bId, 'b = a binds the same object');
  assert.deepEqual(r.events[4].touched, [{ id: aId, key: 2, op: 'write' }]);
});

test('errors come back as data with a traceback, never as exceptions', () => {
  const r = runProgram('def f(x):\n    return 10 / x\nprint("before")\nf(0)\nprint("after")\n');
  assert.equal(r.out, 'before\n');
  assert.equal(r.error.type, 'ZeroDivisionError');
  assert.equal(r.error.message, 'division by zero');
  assert.deepEqual(r.error.traceback.map(t => [t.name, t.line]), [['<module>', 4], ['f', 2]]);
  assert.equal(r.events.at(-1).kind, 'error');
  const syntax = runProgram('print("a"\nx = 1\n');
  assert.equal(syntax.error.type, 'SyntaxError');
  const limit = runProgram('while True:\n    pass\n', { maxSteps: 50 });
  assert.equal(limit.error.type, 'StepLimit');
});

test('input() lines are consumed in order and echoed only to the transcript', () => {
  const r = runProgram('name = input("Name? ")\nprint("Hi", name)\n', { inputs: ['Varvara'] });
  assert.equal(r.out, 'Name? Hi Varvara\n');
  assert.equal(r.transcript, 'Name? Varvara\nHi Varvara\n');
  assert.deepEqual(r.inputsUsed, ['Varvara']);
});

test('small ints are shared objects, large ones are not, like CPython', () => {
  const r = runProgram('a = 5\nb = 5\nc = 1000\nd = 1000\nprint(a is b, c is d)\n');
  assert.equal(r.out, 'True False\n');
});

test('the memory picture follows a rebinding', () => {
  const r = runProgram('a = 5\nb = a\na = 6\n');
  const last = r.events.at(-1).mem;
  const vars = Object.fromEntries(last.frames[0].vars);
  assert.notEqual(vars.a, vars.b);
  assert.equal(last.objects[vars.a].value, '6');
  assert.equal(last.objects[vars.b].value, '5');
});
