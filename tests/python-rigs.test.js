import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { runProgram } from '../python/shared/py/run.js';
import { rng } from '../assets/rand.js';
import { CATALOG } from '../python/shared/catalog.js';

const hasPython = spawnSync('python3', ['--version']).status === 0;
const sourceOf = (rig, params) => (typeof rig.code === 'function' ? rig.code(params) : rig.code);
const stdinOf = (rig, params) => (rig.stdin ? (typeof rig.stdin === 'function' ? rig.stdin(params) : (params[rig.stdin] ?? [])) : []);

/** Every rig of every ready tape: the example (and a few random inputs) run under the stand and under CPython with the same output. */
for (const tape of CATALOG.filter(t => t.ready)) {
  const rigsModule = await import(`../python/${tape.dir}/${tape.id === '06' ? 'problems.js' : 'rigs.js'}`);
  const RIGS = rigsModule.RIGS;
  const QUIZZES = tape.id === '06' ? [] : (await import(`../python/${tape.dir}/quizzes.js`)).QUIZZES;
  const { DICT } = await import(`../python/${tape.dir}/i18n.js`);
  const ids = new Set(RIGS.map(r => r.id));

  test(`PY-${tape.id}: rig ids are unique and every rig has a title`, () => {
    assert.equal(ids.size, RIGS.length);
    for (const rig of RIGS) assert.ok(DICT[`rig.${rig.id}.title`], `rig.${rig.id}.title`);
    for (const q of QUIZZES) {
      assert.ok(DICT[`quiz.${q.id}.why`], `quiz.${q.id}.why`);
      if (q.rig) assert.ok(ids.has(q.rig), `quiz ${q.id} points to rig ${q.rig}`);
      if (q.kind === 'output' || q.kind === 'error') assert.ok(q.options[q.answer] !== undefined, `quiz ${q.id} answer index`);
    }
  });

  for (const rig of RIGS) {
    test(`PY-${tape.id} rig ${rig.id} runs within the step budget and matches CPython`, () => {
      const inputs = [rig.example ?? {}];
      if (rig.random) { const next = rng(7); for (let i = 0; i < 3; i++) inputs.push(rig.random(next)); }
      for (const params of inputs) {
        if (rig.check && rig.check(params)) continue;
        const src = sourceOf(rig, params), stdin = stdinOf(rig, params);
        const ours = runProgram(src, { inputs: stdin, maxSteps: rig.maxSteps ?? 400, recursionLimit: rig.recursionLimit ?? 1000, files: rig.files || {}, snapshots: params === inputs[0] });
        assert.ok(!ours.error || (ours.error.type !== 'StepLimit' && !ours.error.internal), `${rig.id}: ${ours.error && ours.error.message}`);
        assert.ok(ours.events.length > 0);
        for (const e of ours.events) assert.ok(e.line >= 0 && e.line <= src.split('\n').length, `${rig.id}: line ${e.line} out of range`);
        if (!hasPython) continue;
        const py = spawnSync('python3', ['-c', src], { input: stdin.join('\n') + '\n', encoding: 'utf8', timeout: 20000 });
        assert.equal(ours.out, py.stdout, `${rig.id} stdout differs for ${JSON.stringify(params)}`);
        const errLines = py.stderr.trim().split('\n').filter(l => !/Warning/.test(l) && !/^\s*\^/.test(l));
        assert.equal(ours.error ? ours.error.type : '', (errLines.pop() || '').split(':')[0].trim(), `${rig.id} error differs`);
      }
    });
  }

  for (const q of QUIZZES.filter(x => (x.kind === 'output' || x.kind === 'error') && x.code && !/input\(/.test(x.code))) {
    test(`PY-${tape.id} quiz ${q.id}: the marked answer is what the code really does`, () => {
      const r = runProgram(q.code, { maxSteps: 2000 });
      if (q.kind === 'output') { assert.equal(r.error, null, `${q.id}: ${r.error && r.error.message}`); assert.equal(r.out.replace(/\n$/, ''), q.options[q.answer]); }
      else assert.equal(r.error ? r.error.type : 'none', q.options[q.answer]);
    });
  }
}
