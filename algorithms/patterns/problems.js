/** Language-neutral problem metadata. Texts about the problems live in the i18n files. */
import { PROBLEMS_A } from './problems-a.js?v=202609252015';
import { PROBLEMS_B } from './problems-b.js?v=202609252015';
import { PROBLEMS_C } from './problems-c.js?v=202609252015';

export const NAMES = {
  hash: 'HashMap / HashSet', twoptr: 'Two Pointers', window: 'Sliding Window', binary: 'Binary Search',
  stack: 'Stack / Monotonic Stack', list: 'Linked List · Fast & Slow', graph: 'DFS / BFS', tree: 'Trees',
  heap: 'Heap / PriorityQueue', back: 'Backtracking', greedy: 'Greedy', dp: 'Dynamic Programming',
};

export const PROBLEMS = { ...PROBLEMS_A, ...PROBLEMS_B, ...PROBLEMS_C };
