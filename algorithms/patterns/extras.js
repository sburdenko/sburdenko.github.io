/**
 * Extras per problem, keyed by rig id: tricky inputs, an operation counter (naive vs ours), predict-the-step forks,
 * interviewer follow-ups and related problems. Shape: see extras-a.js.
 */
import { EX_A } from './extras-a.js?v=202610262045';
import { EX_B } from './extras-b.js?v=202610262045';
import { EX_C } from './extras-c.js?v=202610262045';
import { EX_D } from './extras-d.js?v=202610262045';

export const EXTRAS = { ...EX_A, ...EX_B, ...EX_C, ...EX_D };

/** The predict group that asks before this event, if any. */
export const forkOf = (extra, event) => (event ? extra?.predict?.find(group => event.key in group.keys) : undefined);

/** Operation count of one side of the counter, or null when the function fails on odd input. */
export function countOps(side, params) {
  try {
    const n = side.count(params);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  } catch {
    return null;
  }
}
