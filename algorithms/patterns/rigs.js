/** One rig per chapter: the demo input, its trace and how to draw it. */
import {
  twoSumTrace, moveZeroesTrace, longestUniqueTrace, binarySearchTrace, jumpTrace, coinChangeTrace,
} from './model-linear.js?v=202609241230';
import {
  dailyTempsTrace, removeNthTrace, islandsTrace, maxDepthTrace, kthLargestTrace, subsetsTrace,
} from './model-structures.js?v=202609241230';
import * as linear from './views-linear.js?v=202609241230';
import * as structures from './views-structures.js?v=202609241230';

export const PATTERN_IDS = ['hash', 'twoptr', 'window', 'binary', 'stack', 'list', 'graph', 'tree', 'heap', 'back', 'greedy', 'dp'];

const rig = (run, views) => ({ run, view: views.view, vars: views.vars });

export const RIGS = {
  hash: rig(() => ({ ...twoSumTrace([3, 8, 2, 11, 7, 5], 9), nums: [3, 8, 2, 11, 7, 5], target: 9 }), linear.hash),
  twoptr: rig(() => moveZeroesTrace([0, 1, 0, 3, 12, 0, 5]), linear.twoptr),
  window: rig(() => ({ ...longestUniqueTrace('abcbcad'), s: 'abcbcad' }), linear.slidingWindow),
  binary: rig(() => {
    const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    return { ...binarySearchTrace(a, 23), a };
  }, linear.binary),
  stack: rig(() => {
    const t = [73, 74, 75, 71, 69, 72, 76, 73];
    return { ...dailyTempsTrace(t), t };
  }, structures.stack),
  list: rig(() => ({ ...removeNthTrace([1, 2, 3, 4, 5], 2), values: [1, 2, 3, 4, 5], n: 2 }), structures.list),
  graph: rig(() => islandsTrace(['110001', '100101', '001100', '000001', '110011']), structures.graph),
  tree: rig(() => maxDepthTrace([3, [9, [4], null], [20, [15], [7, null, [8]]]]), structures.tree),
  heap: rig(() => ({ ...kthLargestTrace([4, 1, 7, 3, 8, 5, 9, 2], 3), nums: [4, 1, 7, 3, 8, 5, 9, 2], k: 3 }), structures.heap),
  back: rig(() => ({ ...subsetsTrace([1, 2, 3]), nums: [1, 2, 3] }), structures.back),
  greedy: rig(() => ({ ...jumpTrace([2, 0, 2, 0, 1, 3]), a: [2, 0, 2, 0, 1, 3] }), linear.greedy),
  dp: rig(() => ({ ...coinChangeTrace([1, 3, 4], 6), coins: [1, 3, 4] }), linear.dp),
};
