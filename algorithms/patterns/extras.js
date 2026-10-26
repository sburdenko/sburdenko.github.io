/**
 * Extras per problem, keyed by rig id: tricky inputs, an operation counter (naive vs ours), predict-the-step forks,
 * interviewer follow-ups and related problems. Shape: see extras-a.js.
 */
import { EX_A } from './extras-a.js?v=202610262121';
import { EX_B } from './extras-b.js?v=202610262121';
import { EX_C } from './extras-c.js?v=202610262121';
import { EX_D } from './extras-d.js?v=202610262121';

export const EXTRAS = { ...EX_A, ...EX_B, ...EX_C, ...EX_D };

/**
 * A predict group asks before an event. Either its options are event keys (the next event's key is the answer), or it
 * names the events it asks before in `on` and `branch(event)` returns the option the event took (a key of `keys`).
 */
export const forkOf = (extra, event) =>
  (event ? extra?.predict?.find(group => (group.on ? [group.on].flat().includes(event.key) : event.key in group.keys)) : undefined);

/** The option an event took at its fork. */
export const answerOf = (group, event) => (group.on ? String(group.branch(event)) : event.key);

/** Operation count of one side of the counter, or null when the function fails on odd input. */
export function countOps(side, params) {
  try {
    const n = side.count(params);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  } catch {
    return null;
  }
}
