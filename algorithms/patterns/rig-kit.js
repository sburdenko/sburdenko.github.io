/** Helpers for rig definitions: seeded random data and the rig shape itself. */
export const randInt = (next, lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
export const randInts = (next, n, lo, hi) => Array.from({ length: n }, () => randInt(next, lo, hi));
export const pick = (next, list) => list[Math.floor(next() * list.length)];

export function shuffle(next, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function distinctInts(next, n, lo, hi) {
  const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return shuffle(next, pool).slice(0, n);
}

/**
 * fields: [{ key, type, ...limits }] edited on the page; example: default params;
 * random(next): valid params; check(params): cross-field error or null; run(params): the trace plus what the view needs.
 */
export const defineRig = ({ fields, example, random, check = () => null, run }, views) =>
  ({ fields, example, random, check, run, view: views.view, vars: views.vars });
