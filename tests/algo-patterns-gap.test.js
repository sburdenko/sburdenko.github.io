/* Problems that close gaps in chapters 01, 02 and 08 of tape 06 (model-gap.js): traces against independent methods. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import * as M from '../algorithms/patterns/model-gap.js';
import { RIGS, runWithInput } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';
import { treeFromLevelOrder, levelOrderOf } from '../algorithms/patterns/inputs.js';

const next = rng(219);
const len = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
const repeat = (times, fn) => { for (let i = 0; i < times; i++) fn(i); };
const keysOf = run => new Set(run.events.map(e => e.key));

test('gap problems sit at the end of their chapters, and their texts line up', () => {
  const where = { twoptr: ['palindrome', 125], hash: ['dupWindow', 219], tree: ['invertTree', 226] };
  for (const [chapter, [id, num]] of Object.entries(where)) {
    const list = PROBLEMS[chapter], j = list.length - 1;
    assert.equal(list[j].rig, id, chapter);
    assert.equal(list[j].num, num, id);
    for (const lang of ['en', 'ru']) assert.ok(DICT[`${chapter}.p`][lang][j].task, `${id} ${lang}: texts at index ${j}`);
  }
  assert.equal(PROBLEMS.twoptr.length, 8);
  assert.equal(Object.values(PROBLEMS).flat().length, 107);
});

/* ---------- Valid Palindrome ---------- */
const cleanPalindrome = s => {
  const t = [...s].filter(c => /[A-Za-z0-9]/.test(c)).join('').toLowerCase();
  return t === [...t].reverse().join('');
};

test('Valid Palindrome: two pointers agree with cleaning and reversing, and never leave [0, n)', () => {
  const pool = 'aAbB0 ,.:!?-';
  repeat(500, round => {
    let s = Array.from({ length: len(1, 14) }, () => pool[len(0, pool.length - 1)]).join('');
    if (round % 2) { const half = s.slice(0, Math.ceil(s.length / 2)); s = half + [...half].reverse().join('').replace(/a/g, 'A'); }
    const run = M.palindromeTrace(s);
    assert.equal(run.answer, cleanPalindrome(s), JSON.stringify(s));
    for (const e of run.events) {
      assert.ok(e.l >= 0 && e.l <= s.length && e.r >= -1 && e.r < s.length, `${JSON.stringify(s)}: pointers out of range`);
      if (e.key === 'pal.ev.skipL' || e.key === 'pal.ev.skipR') assert.ok(!M.isAlnum(s[e.args[0]]), 'only noise is skipped');
      if (e.key === 'pal.ev.match' || e.key === 'pal.ev.mismatch') {
        const [l, r] = e.cmp;
        assert.ok(l <= r, 'the comparison never crosses');
        assert.equal(M.lower(s[l]) === M.lower(s[r]), e.key === 'pal.ev.match');
        if (l === r) assert.equal(e.args[4], 'self');
      }
    }
    assert.equal(run.events.at(-1).key, run.answer ? 'pal.ev.done' : 'pal.ev.mismatch');
  });
  assert.equal(M.palindromeTrace('A man, a plan, a canal: Panama').answer, true, 'LeetCode #125 example 1');
  assert.equal(M.palindromeTrace('race a car').answer, false, 'LeetCode #125 example 2');
  assert.equal(M.palindromeTrace('0P').answer, false, 'digits are not letters: 0 ≠ p');
  assert.equal(M.palindromeTrace('.,').answer, true, 'only noise: the skip loop stops on l < r');
  assert.deepEqual([...keysOf(M.palindromeTrace('.,'))], ['pal.ev.start', 'pal.ev.skipL', 'pal.ev.match', 'pal.ev.done']);
  const ex = RIGS.palindrome.run(RIGS.palindrome.example);
  for (const key of ['pal.ev.start', 'pal.ev.skipL', 'pal.ev.skipR', 'pal.ev.match', 'pal.ev.done']) assert.ok(keysOf(ex).has(key), key);
  assert.ok(ex.events.some(e => e.key === 'pal.ev.match' && e.args[4] === 'case'), 'the example shows P against p');
  assert.ok(keysOf(M.palindromeTrace('race a car')).has('pal.ev.mismatch'));
  assert.equal(runWithInput(RIGS.palindrome, { s: 'a'.repeat(41) }).error[0], 'in.err.len');
  assert.equal(runWithInput(RIGS.palindrome, { s: 'añа' }).error[0], 'in.err.chars');
  assert.equal(runWithInput(RIGS.palindrome, { s: "No 'x' in Nixon" }).run.answer, true);
});

/* ---------- Contains Duplicate II ---------- */
const nearbyBrute = (nums, k) => nums.some((x, i) => nums.some((y, j) => i < j && j - i <= k && x === y));

test('Contains Duplicate II: the window agrees with checking every pair, and never holds more than k values', () => {
  repeat(500, () => {
    const nums = Array.from({ length: len(1, 12) }, () => len(1, len(2, 8))), k = len(0, 6);
    const run = M.dupWindowTrace(nums, k);
    assert.equal(run.answer, nearbyBrute(nums, k), `${nums} k=${k}`);
    for (const e of run.events) {
      if (e.key === 'dw.ev.add') assert.ok(e.win.length <= k + 1);
      else assert.ok(e.win.length <= k, 'after eviction the window holds at most k values');
      const values = e.win.map(j => nums[j]);
      assert.equal(new Set(values).size, values.length, 'the values inside the window are distinct');
      if (e.key === 'dw.ev.evict') assert.ok(e.win.every(j => j > e.i - k && j <= e.i), 'after eviction the window is nums[i − k + 1..i]');
      if (e.key === 'dw.ev.hit') assert.ok(e.win.every(j => j >= e.i - k && j < e.i), 'the hit checks nums[i − k..i − 1]');
    }
    if (run.answer) {
      const [j, i] = run.pair;
      assert.ok(nums[i] === nums[j] && i - j <= k && i > j);
      assert.ok(!nearbyBrute(nums.slice(0, i), k), 'the first index that closes a pair');
    }
  });
  assert.equal(M.dupWindowTrace([1, 2, 3, 1], 3).answer, true, 'LeetCode #219 example 1');
  assert.equal(M.dupWindowTrace([1, 0, 1, 1], 1).answer, true, 'LeetCode #219 example 2');
  assert.equal(M.dupWindowTrace([1, 2, 3, 1, 2, 3], 2).answer, false, 'LeetCode #219 example 3');
  assert.equal(M.dupWindowTrace([5, 5], 0).answer, false, 'k = 0 is always false');
  const ex = RIGS.dupWindow.run(RIGS.dupWindow.example);
  assert.deepEqual(keysOf(ex), new Set(['dw.ev.start', 'dw.ev.add', 'dw.ev.evict', 'dw.ev.hit']));
  const keys = ex.events.map(e => e.key);
  assert.ok(keys.indexOf('dw.ev.evict') < keys.indexOf('dw.ev.hit'), 'the example evicts before it hits');
  assert.ok(ex.events.some(e => e.key === 'dw.ev.add' && e.args[2] != null), 'a value comes back after it left the window');
  assert.ok(keysOf(M.dupWindowTrace([1, 2, 3, 1, 2, 3], 2)).has('dw.ev.done'));
  assert.equal(runWithInput(RIGS.dupWindow, { nums: '1 2', k: '13' }).error[0], 'in.err.range');
});

/* ---------- Invert Binary Tree ---------- */
const mirror = s => (s ? [s[0], mirror(s[2]), mirror(s[1])] : null);

function randomSpec(depth = 0) {
  if (depth > 3 || (depth > 0 && next() < 0.35)) return null;
  return [len(-9, 20), randomSpec(depth + 1), randomSpec(depth + 1)];
}

test('Invert Binary Tree: the final links are the mirror, every node is finished once, children before parents', () => {
  repeat(300, () => {
    const spec = randomSpec();
    const run = M.invertTreeTrace(spec), last = run.events.at(-1);
    const toSpec = id => (id < 0 ? null : [run.nodes[id].v, toSpec(last.left[id]), toSpec(last.right[id])]);
    assert.deepEqual(toSpec(0), mirror(spec), JSON.stringify(levelOrderOf(spec)));
    const finished = run.events.filter(e => e.key === 'inv.ev.swap' || e.key === 'inv.ev.leaf').map(e => e.cur);
    assert.equal(new Set(finished).size, run.nodes.length, 'every node is finished exactly once');
    finished.forEach((id, k) => {
      const kids = [run.nodes[id].l, run.nodes[id].r].filter(c => c >= 0);
      for (const c of kids) assert.ok(finished.indexOf(c) < k, 'post-order: both children before the node');
    });
    for (const e of run.events) {
      if (e.key === 'inv.ev.leaf') assert.ok(run.nodes[e.cur].l < 0 && run.nodes[e.cur].r < 0);
      if (e.key === 'inv.ev.swap') assert.ok(run.nodes[e.cur].l >= 0 || run.nodes[e.cur].r >= 0);
    }
  });
  const ex = RIGS.invertTree.run(RIGS.invertTree.example);
  const lastEx = ex.events.at(-1), toSpec = id => (id < 0 ? null : [ex.nodes[id].v, toSpec(lastEx.left[id]), toSpec(lastEx.right[id])]);
  assert.deepEqual(levelOrderOf(toSpec(0)), [4, 7, 2, 9, 6, 3, 1], 'LeetCode #226 example 1');
  assert.deepEqual(keysOf(ex), new Set(['inv.ev.start', 'inv.ev.enter', 'inv.ev.leaf', 'inv.ev.swap', 'inv.ev.done']));
  assert.deepEqual([...keysOf(M.invertTreeTrace(treeFromLevelOrder([1])))], ['inv.ev.start', 'inv.ev.leaf', 'inv.ev.done']);
  assert.equal(runWithInput(RIGS.invertTree, { root: 'null' }).error[0], 'in.err.treeRoot');
});
