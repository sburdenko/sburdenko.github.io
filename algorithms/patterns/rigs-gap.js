/** Editable rigs for the problems in model-gap.js; the chapters they belong to are listed in problems-gap.js. */
import * as M from './model-gap.js?v=202610261206';
import * as V from './views-gap.js?v=202610261206';
import { treeFromLevelOrder, levelOrderOf } from './inputs.js?v=202610261206';
import { defineRig, randInt, randInts, pick, shuffle } from './rig-kit.js?v=202610261206';

const PHRASES = [
  'A man, a plan, a canal: Panama', 'race a car', 'Was it a car or a cat I saw?', "No 'x' in Nixon", '0P',
  "Madam, I'm Adam", 'Step on no pets!', 'Never odd or even', 'No lemon, no melon', 'ab_a', '.,', 'Taco cat?!', 'abc-cBA',
];
const PUNCT = [' ', ',', '.', '!', '?', ':', '-', "'"];

/** A palindrome of letters and digits with random case and punctuation, sometimes broken by one character. */
function randomPhrase(next) {
  const half = Array.from({ length: randInt(next, 2, 6) }, () => pick(next, [...'abcdefghijklmnoprstuvwxyz0123456789']));
  const core = [...half, ...(next() < 0.5 ? [pick(next, [...'aeiou'])] : []), ...[...half].reverse()];
  if (next() < 0.4) core[randInt(next, 0, core.length - 1)] = pick(next, [...'qxz7']);
  let out = '';
  for (const c of core) {
    if (next() < 0.3) out += pick(next, PUNCT);
    out += next() < 0.3 ? c.toUpperCase() : c;
  }
  if (next() < 0.4) out += pick(next, ['!', '?', '.', ' .']);
  return out.trim().replace(/^['"]+|['"]+$/g, '') || 'a';
}

function randomTree(next, depth = 0) {
  if (depth > 3 || (depth > 0 && next() < 0.3)) return null;
  return [randInt(next, 1, 20), randomTree(next, depth + 1), randomTree(next, depth + 1)];
}

export const RIGS_GAP = {
  palindrome: defineRig({
    fields: [{ key: 's', type: 'str', chars: ' -~', charsLabel: 'ASCII 32–126', minLen: 1, maxLen: 40 }],
    example: { s: 'A man, a plan, a canal: Panama' },
    random: next => ({ s: next() < 0.35 ? pick(next, PHRASES) : randomPhrase(next) }),
    run: p => ({ ...M.palindromeTrace(p.s), chars: [...p.s] }),
  }, V.palindrome),
  dupWindow: defineRig({
    fields: [
      { key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: -99, max: 99 },
      { key: 'k', type: 'int', min: 0, max: 12 },
    ],
    example: { nums: [1, 2, 3, 1, 4, 1], k: 2 },
    random: next => {
      const nums = randInts(next, randInt(next, 5, 10), 1, randInt(next, 4, 7));
      return { nums: next() < 0.2 ? shuffle(next, nums) : nums, k: randInt(next, 1, 4) };
    },
    run: p => ({ ...M.dupWindowTrace(p.nums, p.k), nums: p.nums, k: p.k }),
  }, V.dupWindow),
  invertTree: defineRig({
    fields: [{ key: 'root', type: 'tree', maxNodes: 15, maxDepth: 4, min: -99, max: 99 }],
    example: { root: [4, 2, 7, 1, 3, 6, 9] },
    random: next => ({ root: levelOrderOf(randomTree(next)) }),
    run: p => M.invertTreeTrace(treeFromLevelOrder(p.root)),
  }, V.invertTree),
};
