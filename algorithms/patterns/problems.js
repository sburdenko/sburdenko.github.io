/** Language-neutral problem metadata. Texts about the problems live in the i18n files. */
import { PROBLEMS_A } from './problems-a.js?v=202610201331';
import { PROBLEMS_B } from './problems-b.js?v=202610201331';
import { PROBLEMS_C } from './problems-c.js?v=202610201331';
import { PROBLEMS_D } from './problems-d.js?v=202610201331';
import { PROBLEMS_E } from './problems-e.js?v=202610201331';
import { PROBLEMS_F } from './problems-f.js?v=202610201331';
import { PROBLEMS_GAMES } from './problems-games.js?v=202610201331';
import { PROBLEMS_H } from './problems-h.js?v=202610201331';
import { PROBLEMS_ARR } from './problems-arr.js?v=202610201331';

export const NAMES = {
  hash: 'HashMap / HashSet', twoptr: 'Two Pointers', window: 'Sliding Window', binary: 'Binary Search',
  stack: 'Stack / Monotonic Stack', list: 'Linked List · Fast & Slow', graph: 'DFS / BFS', tree: 'Trees',
  heap: 'Heap / PriorityQueue', back: 'Backtracking', greedy: 'Greedy', dp: 'Dynamic Programming',
  matrix: 'Arrays & Matrices', paths: 'Shortest Paths · Dijkstra',
  bits: 'Bit Manipulation',
  games: 'Games · Paths & Space',
  design: 'Data Structure Design',
};

export const PROBLEMS = { ...PROBLEMS_A, ...PROBLEMS_B, ...PROBLEMS_C, ...PROBLEMS_D, ...PROBLEMS_E, ...PROBLEMS_F, ...PROBLEMS_GAMES, ...PROBLEMS_H };

/* Problems that joined existing chapters later go after the chapter's own ones, so the {chapter}.p texts stay index-aligned. */
for (const [id, list] of Object.entries(PROBLEMS_ARR)) PROBLEMS[id] = [...PROBLEMS[id], ...list];
/* Problems added to existing chapters (problems-bg.js): appended to the end of each chapter's list. */
import { PROBLEMS_BG } from './problems-bg.js?v=202610201331';
for (const [id, list] of Object.entries(PROBLEMS_BG)) PROBLEMS[id] = [...PROBLEMS[id], ...list];
