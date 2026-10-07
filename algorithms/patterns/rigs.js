/** Every problem's rig: editable fields, an example, a random generator and the trace to play. */
import { RIGS_A } from './rigs-a.js?v=202610071637';
import { RIGS_B } from './rigs-b.js?v=202610071637';
import { RIGS_C } from './rigs-c.js?v=202610071637';
import { parseField } from './inputs.js?v=202610071637';

export const PATTERN_IDS = ['hash', 'twoptr', 'window', 'binary', 'stack', 'list', 'graph', 'tree', 'heap', 'back', 'greedy', 'dp'];
export const RIGS = { ...RIGS_A, ...RIGS_B, ...RIGS_C };

/** A trace longer than this is too tedious to step through; the page asks for smaller input instead. */
export const MAX_STEPS = 250;

/**
 * texts: { key: string } as typed by the user. Returns { run, params } or { error: [i18nKey, ...args], field }.
 */
export function runWithInput(rig, texts) {
  const params = {};
  for (const spec of rig.fields) {
    const parsed = parseField(texts[spec.key] ?? '', spec);
    if (parsed.error) return { error: parsed.error, field: spec.key };
    params[spec.key] = parsed.value;
  }
  const crossError = rig.check(params);
  if (crossError) return { error: crossError, field: null };
  const run = rig.run(params);
  if (run.events.length > MAX_STEPS) return { error: ['in.err.tooBig', MAX_STEPS], field: null };
  return { run, params };
}
