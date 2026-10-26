/** Every problem's rig: editable fields, an example, a random generator and the trace to play. */
import { RIGS_A } from './rigs-a.js?v=202610261057';
import { RIGS_B } from './rigs-b.js?v=202610261057';
import { RIGS_C } from './rigs-c.js?v=202610261057';
import { RIGS_D } from './rigs-d.js?v=202610261057';
import { RIGS_E } from './rigs-e.js?v=202610261057';
import { RIGS_F } from './rigs-f.js?v=202610261057';
import { RIGS_GAMES } from './rigs-games.js?v=202610261057';
import { parseField } from './inputs.js?v=202610261057';
import { RIGS_H } from './rigs-h.js?v=202610261057';
import { RIGS_ARR } from './rigs-arr.js?v=202610261057';

export const PATTERN_IDS = ['hash', 'twoptr', 'matrix', 'window', 'binary', 'stack', 'list', 'tree', 'graph', 'heap', 'paths', 'back', 'greedy', 'dp', 'bits', 'games', 'design'];
export const RIGS = { ...RIGS_A, ...RIGS_B, ...RIGS_C, ...RIGS_D, ...RIGS_E, ...RIGS_F, ...RIGS_GAMES, ...RIGS_H };

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

Object.assign(RIGS, RIGS_ARR);
/* Rigs of the problems added to existing chapters (rigs-bg.js). */
import { RIGS_BG } from './rigs-bg.js?v=202610261057';
Object.assign(RIGS, RIGS_BG);
