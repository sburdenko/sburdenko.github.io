/**
 * Parsing and formatting of the rig input fields. Pure functions, no DOM.
 * parse(text, spec) returns { value } or { error: [i18nKey, ...args] }.
 */
const fail = (key, ...args) => ({ error: [`in.err.${key}`, ...args] });
const clean = text => String(text).replace(/[−–—]/g, '-').trim();
const tokens = text => clean(text).replace(/[[\](){}"',;|]/g, ' ').split(/\s+/).filter(Boolean);

function checkLength(list, { minLen = 0, maxLen = Infinity }) {
  return list.length < minLen || list.length > maxLen ? fail('len', minLen, maxLen) : null;
}

function parseInts(text, spec) {
  const parts = tokens(text), values = [];
  for (const part of parts) {
    if (!/^-?\d+$/.test(part)) return fail('notInt', part);
    values.push(Number(part));
  }
  const { min = -Infinity, max = Infinity } = spec;
  return checkLength(values, spec)
    || (values.some(v => v < min || v > max) ? fail('range', min, max) : null)
    || (spec.distinct && new Set(values).size !== values.length ? fail('distinct') : null)
    || { value: spec.sorted ? [...values].sort((a, b) => a - b) : values };
}

function parseInt1(text, spec) {
  const t = clean(text);
  if (!/^-?\d+$/.test(t)) return fail('notInt', t || '∅');
  const v = Number(t), { min = -Infinity, max = Infinity } = spec;
  return v < min || v > max ? fail('range', min, max) : { value: v };
}

function parseStr(text, spec) {
  const value = clean(text).replace(/^["']|["']$/g, '');
  const allowed = new RegExp(`^[${spec.chars}]*$`);
  return checkLength([...value], spec) || (!allowed.test(value) ? fail('chars', spec.charsLabel) : null) || { value };
}

function parseWords(text, spec) {
  const words = clean(text).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (spec.wordLen && words.some(w => w.length !== spec.wordLen)) return fail('wordLen', spec.wordLen);
  if (spec.maxWord && words.some(w => w.length > spec.maxWord)) return fail('wordMax', spec.maxWord);
  return checkLength(words, spec) || { value: words };
}

function parseGrid(text, spec) {
  const rows = clean(text).replace(/[[\]"',;|]/g, ' ').split(/\s+/).filter(Boolean);
  if (rows.length < 1 || rows.length > spec.maxRows) return fail('gridRows', 1, spec.maxRows);
  if (rows.some(r => !/^\d+$/.test(r))) return fail('gridDigits');
  if (rows.some(r => r.length !== rows[0].length)) return fail('gridRagged');
  if (rows[0].length > spec.maxCols) return fail('gridCols', spec.maxCols);
  const grid = rows.map(r => [...r].map(Number));
  return grid.flat().some(v => v > spec.maxDigit) ? fail('gridDigit', spec.maxDigit) : { value: grid };
}

function parseTree(text, spec) {
  const parts = tokens(text), values = [];
  for (const part of parts) {
    if (/^null$/i.test(part)) values.push(null);
    else if (/^-?\d+$/.test(part)) values.push(Number(part));
    else return fail('notInt', part);
  }
  if (!values.length || values[0] === null) return fail('treeRoot');
  const { min = -Infinity, max = Infinity } = spec;
  if (values.some(v => v !== null && (v < min || v > max))) return fail('range', min, max);
  const tree = treeFromLevelOrder(values);
  const count = s => (s ? 1 + count(s[1]) + count(s[2]) : 0);
  const depth = s => (s ? 1 + Math.max(depth(s[1]), depth(s[2])) : 0);
  if (count(tree) > spec.maxNodes || depth(tree) > spec.maxDepth) return fail('treeSize', spec.maxNodes, spec.maxDepth);
  return { value: levelOrderOf(tree) };
}

function parseLists(text, spec) {
  const groups = clean(text).split(/[|;]/).map(g => g.trim());
  if (groups.length < 1 || groups.length > spec.maxLists) return fail('lists', spec.maxLists);
  const lists = [];
  for (const group of groups) {
    const parsed = parseInts(group, { min: spec.min, max: spec.max, maxLen: spec.maxLen, sorted: true });
    if (parsed.error) return parsed;
    lists.push(parsed.value);
  }
  return { value: lists };
}

function parseIntervals(text, spec) {
  const found = [...clean(text).matchAll(/\[?\s*(-?\d+)\s*[-,:]\s*(-?\d+)\s*\]?/g)].map(m => [Number(m[1]), Number(m[2])]);
  const leftover = clean(text).replace(/\[?\s*(-?\d+)\s*[-,:]\s*(-?\d+)\s*\]?/g, '').replace(/[\s,[\]]/g, '');
  if (leftover) return fail('intervals');
  return checkLength(found, spec)
    || (found.some(([a, b]) => a < 0 || b > spec.max || a >= b) ? fail('interval', spec.max) : null)
    || { value: found };
}

function parseOps(text, spec) {
  const parts = clean(text).split(/[,\n;]+/).map(p => p.trim()).filter(Boolean), ops = [];
  let size = 0;
  for (const part of parts) {
    const push = part.match(/^push\s*\(?\s*(-?\d+)\s*\)?$/i);
    if (push) { ops.push(['push', Number(push[1])]); size++; continue; }
    if (/^pop\s*(\(\s*\))?$/i.test(part)) {
      if (!size) return fail('opsEmpty', 'pop');
      ops.push(['pop']);
      size--;
      continue;
    }
    if (/^(get)?min\s*(\(\s*\))?$/i.test(part)) {
      if (!size) return fail('opsEmpty', 'getMin');
      ops.push(['getMin']);
      continue;
    }
    return fail('op', part);
  }
  return checkLength(ops, spec) || { value: ops };
}

export const PARSERS = {
  ints: parseInts, int: parseInt1, str: parseStr, words: parseWords, grid: parseGrid,
  tree: parseTree, lists: parseLists, intervals: parseIntervals, ops: parseOps,
};

export const FORMATTERS = {
  ints: v => v.join(', '),
  int: v => String(v),
  str: v => v,
  words: v => v.join(', '),
  grid: v => v.map(r => r.join('')).join(' '),
  tree: v => v.map(x => (x === null ? 'null' : x)).join(', '),
  lists: v => v.map(l => l.join(' ')).join(' | '),
  intervals: v => v.map(([a, b]) => `${a}-${b}`).join(' '),
  ops: v => v.map(([op, x]) => (x == null ? op : `${op} ${x}`)).join(', '),
};

export const parseField = (text, spec) => PARSERS[spec.type](text, spec);
export const formatField = (value, spec) => FORMATTERS[spec.type](value);

/** LeetCode level-order array (null for a missing child) → nested spec [value, left, right]. */
export function treeFromLevelOrder(values) {
  if (!values.length || values[0] === null) return null;
  const root = { v: values[0], l: null, r: null }, queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    for (const side of ['l', 'r']) {
      if (i >= values.length) break;
      const v = values[i++];
      if (v === null) continue;
      node[side] = { v, l: null, r: null };
      queue.push(node[side]);
    }
  }
  const toSpec = n => (n ? [n.v, toSpec(n.l), toSpec(n.r)] : null);
  return toSpec(root);
}

/** Nested spec → LeetCode level-order array without trailing nulls. */
export function levelOrderOf(spec) {
  const out = [], queue = [spec];
  while (queue.length) {
    const s = queue.shift();
    out.push(s ? s[0] : null);
    if (s) queue.push(s[1] || null, s[2] || null);
  }
  while (out.length && out.at(-1) === null) out.pop();
  return out;
}
