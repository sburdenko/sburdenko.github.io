/* Карточки write: требования проверяются по коду без комментариев, образец их выполняет, заготовка — нет. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCourseFromSource } from '../learn/content.js';
import { check, writeResults, stripComments } from '../learn/engine.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const courses = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(root, d.name, 'course.json'))).map(d => d.name);

test('требования write: регулярные выражения по коду без комментариев, not переворачивает результат', () => {
  const card = { t: 'write', checks: [{ label: 'a', re: 'Schedule\\(' }, { label: 'b', re: 'Complete\\(\\)', not: true }] };
  assert.deepEqual(writeResults(card, 'var h = job.Schedule();'), [true, true]);
  assert.deepEqual(writeResults(card, 'var h = job.Schedule(); h.Complete();'), [true, false]);
  assert.deepEqual(writeResults(card, '// job.Schedule();\n/* h.Complete(); */'), [false, true]);
  assert.equal(stripComments('a // b\nc /* d\ne */ f'), 'a \nc  f');
  assert.equal(check(card, 'job.Schedule();'), true);
  assert.equal(check(card, 'job.Schedule(); x.Complete();'), false);
});

for (const id of courses) {
  test(`content/${id}: образец каждой карточки write выполняет все требования, заготовка — не все`, async () => {
    const bad = [];
    for (const lang of ['ru', 'en']) {
      const course = await loadCourseFromSource(id, lang);
      for (const u of course.units) for (const l of u.lessons ?? []) for (const [i, card] of l.cards.entries()) {
        if (card.t !== 'write') continue;
        const at = `${l.id} #${i + 1} (${lang})`;
        for (const c of card.checks) {
          try { new RegExp(c.re, c.flags ?? 'm'); } catch (e) { bad.push(`${at}: «${c.label}» — регулярное выражение не собирается: ${e.message}`); }
        }
        const sol = writeResults(card, card.solution);
        sol.forEach((ok, k) => { if (!ok) bad.push(`${at}: образец не выполняет «${card.checks[k].label}»`); });
        if (writeResults(card, card.starter).every(Boolean)) bad.push(`${at}: заготовка уже выполняет все требования`);
      }
    }
    assert.deepEqual(bad, [], bad.slice(0, 10).join('\n'));
  });
}
