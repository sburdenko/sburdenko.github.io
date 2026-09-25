/** One rig per problem: the demo input (caption), its trace and how to draw it. */
import * as A from './model-a.js?v=202609252015';
import * as B from './model-b.js?v=202609252015';
import * as C from './model-c.js?v=202609252015';
import * as VA from './views-a.js?v=202609252015';
import * as VB from './views-b.js?v=202609252015';
import * as VC from './views-c.js?v=202609252015';

export const PATTERN_IDS = ['hash', 'twoptr', 'window', 'binary', 'stack', 'list', 'graph', 'tree', 'heap', 'back', 'greedy', 'dp'];

const rig = (input, run, views) => ({ input, run, view: views.view, vars: views.vars });
const show = a => `[${a.join(', ')}]`;

const TREE = [3, [9, [4], null], [20, [15], [7, null, [8]]]];
const MIN_STACK_OPS = [['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['push', 1], ['getMin'], ['pop'], ['pop'], ['getMin']];
const FLOOD = [[1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 1, 1], [0, 1, 1, 1]];
const ORANGES = [[2, 1, 1, 0, 1], [1, 1, 0, 1, 1], [0, 1, 1, 1, 1], [0, 0, 1, 1, 2]];
const LADDER = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
const INTERVALS = [[1, 3], [2, 4], [3, 5], [1, 2], [5, 7], [4, 6]];

export const RIGS = {
  /* 01 hash map */
  twoSum: rig('nums = [3, 8, 2, 11, 7, 5], target = 9',
    () => ({ ...A.twoSumTrace([3, 8, 2, 11, 7, 5], 9), nums: [3, 8, 2, 11, 7, 5], target: 9 }), VA.twoSum),
  dup: rig('nums = [4, 7, 1, 9, 7, 3]', () => ({ ...A.containsDupTrace([4, 7, 1, 9, 7, 3]), nums: [4, 7, 1, 9, 7, 3] }), VA.dup),
  anagram: rig('["eat", "tea", "tan", "ate", "nat", "bat"]', () => {
    const strs = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
    return { ...A.groupAnagramsTrace(strs), strs };
  }, VA.anagram),
  psum: rig('nums = [1, 2, 3, −2, 2, 1], k = 3', () => ({ ...A.subarraySumTrace([1, 2, 3, -2, 2, 1], 3), nums: [1, 2, 3, -2, 2, 1], k: 3 }), VA.psum),

  /* 02 two pointers */
  moveZeroes: rig('[0, 1, 0, 3, 12, 0, 5]', () => A.moveZeroesTrace([0, 1, 0, 3, 12, 0, 5]), VA.moveZeroes),
  container: rig('h = [1, 8, 6, 2, 5, 4, 8, 3, 7]', () => ({ ...A.containerTrace([1, 8, 6, 2, 5, 4, 8, 3, 7]), h: [1, 8, 6, 2, 5, 4, 8, 3, 7] }), VA.container),
  threeSum: rig('nums = [−1, 0, 1, 2, −1, −4]', () => A.threeSumTrace([-1, 0, 1, 2, -1, -4]), VA.threeSum),
  trap: rig('h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', () => {
    const h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
    return { ...A.trapTrace(h), h };
  }, VA.trap),

  /* 03 sliding window */
  maxAvg: rig('nums = [1, 12, −5, −6, 50, 3], k = 4', () => ({ ...A.maxAverageTrace([1, 12, -5, -6, 50, 3], 4), nums: [1, 12, -5, -6, 50, 3] }), VA.maxAvg),
  longest: rig('s = "abcbcad"', () => ({ ...A.longestUniqueTrace('abcbcad'), s: 'abcbcad' }), VA.longest),
  minLen: rig('target = 7, nums = [2, 3, 1, 2, 4, 3]', () => ({ ...A.minSubArrayTrace(7, [2, 3, 1, 2, 4, 3]), nums: [2, 3, 1, 2, 4, 3], target: 7 }), VA.minLen),
  minWindow: rig('s = "ADOBECODEBANC", t = "ABC"', () => ({ ...A.minWindowTrace('ADOBECODEBANC', 'ABC'), s: 'ADOBECODEBANC', t: 'ABC' }), VA.minWindow),

  /* 04 binary search */
  bsearch: rig('a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23', () => {
    const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    return { ...A.binarySearchTrace(a, 23), a };
  }, VA.bsearch),
  rotated: rig('nums = [4, 5, 6, 7, 0, 1, 2], target = 0', () => ({ ...A.rotatedSearchTrace([4, 5, 6, 7, 0, 1, 2], 0), a: [4, 5, 6, 7, 0, 1, 2], target: 0 }), VA.rotated),
  koko: rig('piles = [3, 6, 7, 11], h = 8', () => ({ ...A.kokoTrace([3, 6, 7, 11], 8), piles: [3, 6, 7, 11], h: 8 }), VA.koko),
  median: rig('A = [1, 3, 8, 9, 15], B = [7, 11, 18, 19, 21, 25]', () => A.medianTwoTrace([1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]), VA.median),

  /* 05 stack */
  parens: rig('s = "{[()()]}"', () => ({ ...B.validParensTrace('{[()()]}'), s: '{[()()]}' }), VB.parens),
  daily: rig('t = [73, 74, 75, 71, 69, 72, 76, 73]', () => {
    const t = [73, 74, 75, 71, 69, 72, 76, 73];
    return { ...B.dailyTempsTrace(t), t };
  }, VB.daily),
  minStack: rig('push 5, push 3, push 7, getMin, pop, push 1, getMin, pop, pop, getMin',
    () => ({ ...B.minStackTrace(MIN_STACK_OPS), ops: MIN_STACK_OPS }), VB.minStack),
  histogram: rig('heights = [2, 1, 5, 6, 2, 3]', () => ({ ...B.histogramTrace([2, 1, 5, 6, 2, 3]), h: [2, 1, 5, 6, 2, 3] }), VB.histogram),

  /* 06 linked list */
  cycle: rig('0 → 1 → … → 7 → 2', () => {
    const next = [1, 2, 3, 4, 5, 6, 7, 2];
    return { ...B.cycleTrace(next), next };
  }, VB.cycle),
  removeNth: rig('1 → 2 → 3 → 4 → 5, n = 2', () => ({ ...B.removeNthTrace([1, 2, 3, 4, 5], 2), values: [1, 2, 3, 4, 5], n: 2 }), VB.removeNth),
  reverse: rig('1 → 2 → 3 → 4 → 5', () => ({ ...B.reverseListTrace([1, 2, 3, 4, 5]), values: [1, 2, 3, 4, 5] }), VB.reverse),
  reverseK: rig('1 → 2 → … → 8, k = 3', () => ({ ...B.reverseKGroupTrace([1, 2, 3, 4, 5, 6, 7, 8], 3), k: 3 }), VB.reverseK),

  /* 07 grids and graphs */
  flood: rig('image 4×4, sr = 1, sc = 1, color = 2', () => ({ ...B.floodFillTrace(FLOOD, 1, 1, 2), image: FLOOD, sr: 1, sc: 1, color: 2 }), VB.flood),
  islands: rig('grid 5×6', () => B.islandsTrace(['110001', '100101', '001100', '000001', '110011']), VB.islands),
  oranges: rig('grid 4×5', () => B.orangesTrace(ORANGES), VB.oranges),
  ladder: rig(`hit → cog, words = [${LADDER.join(', ')}]`, () => ({ ...B.wordLadderTrace('hit', 'cog', LADDER), end: 'cog' }), VB.ladder),

  /* 08 trees */
  maxDepth: rig('[3, 9, 20, 4, null, 15, 7, …, 8]', () => B.maxDepthTrace(TREE), VB.maxDepth),
  levelOrder: rig('[3, 9, 20, 4, null, 15, 7, …, 8]', () => B.levelOrderTrace(TREE), VB.levelOrder),
  validBst: rig('[5, 3, 8, 1, 6, 7, 9]', () => B.validBstTrace([5, [3, [1], [6]], [8, [7], [9]]]), VB.validBst),
  maxPath: rig('[−10, 9, 20, null, null, 15, 7]', () => B.maxPathSumTrace([-10, [9], [20, [15], [7]]]), VB.maxPath),

  /* 09 heap */
  kth: rig('k = 3, nums = [4, 1, 7, 3, 8, 5, 9, 2]', () => ({ ...C.kthLargestTrace([4, 1, 7, 3, 8, 5, 9, 2], 3), nums: [4, 1, 7, 3, 8, 5, 9, 2], k: 3 }), VC.kth),
  stones: rig('stones = [2, 7, 4, 1, 8, 1]', () => ({ ...C.lastStoneTrace([2, 7, 4, 1, 8, 1]), stones: [2, 7, 4, 1, 8, 1] }), VC.stones),
  mergeK: rig('[[1, 4, 5], [1, 3, 4], [2, 6]]', () => {
    const lists = [[1, 4, 5], [1, 3, 4], [2, 6]];
    return { ...C.mergeKTrace(lists), lists };
  }, VC.mergeK),
  medianStream: rig('stream: 5, 15, 1, 3, 8, 7, 9, 10', () => ({ ...C.medianStreamTrace([5, 15, 1, 3, 8, 7, 9, 10]), nums: [5, 15, 1, 3, 8, 7, 9, 10] }), VC.medianStream),

  /* 10 backtracking */
  subsets: rig('nums = [1, 2, 3]', () => ({ ...C.subsetsTrace([1, 2, 3]), isAnswer: n => n.leaf, gapX: 64 }), VC.subsets),
  perms: rig('nums = [1, 2, 3]', () => ({ ...C.permutationsTrace([1, 2, 3]), isAnswer: n => n.state.path.length === 3, gapX: 60 }), VC.perms),
  combSum: rig('candidates = [2, 3, 6, 7], target = 7',
    () => ({ ...C.combinationSumTrace([2, 3, 6, 7], 7), isAnswer: n => n.state.remain === 0, gapX: 50 }), VC.combSum),
  queens: rig('n = 4', () => ({ ...C.nQueensTrace(4, 1), n: 4 }), VC.queens),

  /* 11 greedy */
  jump: rig('a = [2, 0, 2, 0, 1, 3]', () => ({ ...C.jumpTrace([2, 0, 2, 0, 1, 3]), a: [2, 0, 2, 0, 1, 3] }), VC.jump),
  stock: rig('prices = [7, 1, 5, 3, 6, 4]', () => ({ ...C.stockTrace([7, 1, 5, 3, 6, 4]), prices: [7, 1, 5, 3, 6, 4] }), VC.stock),
  intervals: rig(INTERVALS.map(show).join(' '), () => C.intervalsTrace(INTERVALS), VC.intervals),
  candy: rig('ratings = [1, 2, 87, 87, 87, 2, 1]', () => ({ ...C.candyTrace([1, 2, 87, 87, 87, 2, 1]), ratings: [1, 2, 87, 87, 87, 2, 1] }), VC.candy),

  /* 12 dynamic programming */
  climb: rig('n = 6', () => C.climbTrace(6), VC.climb),
  coin: rig('coins = [1, 3, 4], amount = 6', () => ({ ...C.coinChangeTrace([1, 3, 4], 6), coins: [1, 3, 4] }), VC.coin),
  lcs: rig('a = "abcde", b = "ace"', () => ({ ...C.lcsTrace('abcde', 'ace'), a: 'abcde', b: 'ace' }), VC.lcs),
  edit: rig('a = "horse", b = "ros"', () => ({ ...C.editDistanceTrace('horse', 'ros'), a: 'horse', b: 'ros' }), VC.edit),
};
