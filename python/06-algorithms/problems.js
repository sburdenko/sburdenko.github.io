/** All PY-06 problems in tape order. */
import { PROBLEMS_A } from './problems-a.js?v=202610071708';
import { PROBLEMS_B } from './problems-b.js?v=202610071708';

export const PROBLEMS = [...PROBLEMS_A, ...PROBLEMS_B].sort((a, b) => a.num - b.num);
export const RIGS = PROBLEMS.map(p => p.rig);
