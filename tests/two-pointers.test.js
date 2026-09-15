import test from 'node:test';
import assert from 'node:assert/strict';
import { oppositeTrace, floydTrace, floydLinks } from '../algorithms/two-pointers/model.js';

test('opposite pointers agree with exhaustive pair search', () => {
  for (const a of [[], [2], [1, 2, 4, 7, 11, 15], [-5, -2, 0, 3, 6, 9], [1, 3, 3, 5, 8, 12]]) {
    for (let target = -10; target <= 30; target++) {
      const run = oppositeTrace(a, target);
      const exists = a.some((v, i) => a.some((w, j) => j > i && v + w === target));
      assert.equal(run.found !== null, exists);
      if (run.found) {
        const [l, r] = run.found;
        assert.ok(l < r);
        assert.equal(a[l] + a[r], target);
      }
      assert.ok(run.events.at(-1).checks <= Math.max(0, a.length - 1));
      assert.equal(run.events.at(-1).done, true);
    }
  }
});

test('Floyd locates every cycle entrance, including self loops and no cycle', () => {
  for (let count = 1; count <= 20; count++) {
    for (let entry = -1; entry < count; entry++) {
      const run = floydTrace(count, entry);
      assert.equal(run.entry, entry);
      assert.equal(run.events.at(-1).done, true);
      for (const event of run.events) {
        assert.ok(event.slow >= -1 && event.slow < count);
        assert.ok(event.fast >= -1 && event.fast < count);
      }
    }
  }
});

test('287 finds duplicate values without changing the input array', () => {
  for (const [nums, expected] of [[[1, 3, 4, 2, 2], 2], [[3, 1, 3, 4, 2], 3], [[3, 3, 3, 3, 3], 3], [[1, 1], 1]]) {
    const original = [...nums];
    assert.equal(floydLinks(nums).entry, expected);
    assert.deepEqual(nums, original);
  }
});

test('default Floyd example distinguishes the meeting from the entrance', () => {
  const run = floydTrace(8, 2);
  assert.equal(run.events.find(e => e.line === 3).slow, 6);
  assert.equal(run.entry, 2);
});
