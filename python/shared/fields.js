/** Editable rig inputs: the parsers of tape 06 plus free text, floats and stdin lines. Pure. */
import { PARSERS, FORMATTERS } from '../../algorithms/patterns/inputs.js?v=202610071637';

const fail = (key, ...args) => ({ error: [`in.err.${key}`, ...args] });

function parseText(text, spec) {
  const value = String(text).replace(/^["']|["']$/g, '');
  const { minLen = 0, maxLen = 40 } = spec;
  if ([...value].length < minLen || [...value].length > maxLen) return fail('len', minLen, maxLen);
  if (spec.chars && !new RegExp(`^[${spec.chars}]*$`).test(value)) return fail('chars', spec.charsLabel || spec.chars);
  return { value };
}

function parseFloat1(text, spec) {
  const t = String(text).trim().replace(/[−–—]/g, '-').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return fail('notNum', t || '∅');
  const v = Number(t), { min = -Infinity, max = Infinity } = spec;
  return v < min || v > max ? fail('range', min, max) : { value: v };
}

function parseLines(text, spec) {
  const lines = String(text).split('|').map(l => l.trim()).filter(l => l.length);
  const { minLen = 0, maxLen = 10 } = spec;
  if (lines.length < minLen || lines.length > maxLen) return fail('len', minLen, maxLen);
  return { value: lines };
}

function parseWordsAny(text, spec) {
  const words = String(text).replace(/[[\]"',;]/g, ' ').split(/\s+/).filter(Boolean);
  const { minLen = 0, maxLen = 12, maxWord = 12 } = spec;
  if (words.length < minLen || words.length > maxLen) return fail('len', minLen, maxLen);
  if (words.some(w => [...w].length > maxWord)) return fail('wordMax', maxWord);
  return { value: words };
}

const ALL = {
  ...PARSERS,
  text: parseText,
  float: parseFloat1,
  lines: parseLines,
  wordsAny: parseWordsAny,
};
const FMT = {
  ...FORMATTERS,
  text: v => v,
  float: v => String(v),
  lines: v => v.join(' | '),
  wordsAny: v => v.join(' '),
};

export const parseField = (text, spec) => ALL[spec.type](text, spec);
export const formatField = (value, spec) => FMT[spec.type](value);

export const FIELD_ERRORS = {
  'in.err.notNum': { en: t => `“${t}” is not a number.`, ru: t => `«${t}» — не число.` },
};
