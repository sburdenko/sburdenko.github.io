/**
 * Tokenizer for the Python subset the stand executes. Produces INDENT/DEDENT/NEWLINE like CPython,
 * ignores newlines inside brackets and keeps the line of every token for the stepper.
 */
export class PySyntaxError extends Error {
  constructor(message, line) { super(message); this.line = line; this.pyName = 'SyntaxError'; }
}

const KEYWORDS = new Set(('False None True and as assert break class continue def del elif else except finally for from '
  + 'global if import in is lambda nonlocal not or pass raise return try while with yield').split(' '));
const SOFT = new Set(['match', 'case']);

const OPS = ['**=', '//=', '>>=', '<<=', '...', '->', '**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  ':=', '<<', '>>', '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', '[', ']', '{', '}', ',', ':', '.', ';', '@', '&', '|', '^', '~'];

const isIdStart = c => /[A-Za-z_À-￿]/.test(c);
const isIdChar = c => /[\wÀ-￿]/.test(c);
const isDigit = c => c >= '0' && c <= '9';

const ESCAPES = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"', 0: '\0', a: '\x07', b: '\b', f: '\f', v: '\v' };

export function tokenize(source) {
  const src = source.replace(/\r\n?/g, '\n');
  const tokens = [];
  const indents = [0];
  let i = 0, line = 1, depth = 0, atLineStart = true;
  const push = (type, value, extra = {}) => tokens.push({ type, value, line, ...extra });
  const error = msg => { throw new PySyntaxError(msg, line); };

  while (i < src.length) {
    if (atLineStart && depth === 0) {
      let col = 0, j = i;
      while (j < src.length && (src[j] === ' ' || src[j] === '\t')) { col += src[j] === '\t' ? 8 - (col % 8) : 1; j++; }
      if (j >= src.length || src[j] === '\n' || src[j] === '#') {
        i = j;
        if (i < src.length && src[i] === '#') while (i < src.length && src[i] !== '\n') i++;
        if (i < src.length) { i++; line++; }
        continue;
      }
      i = j;
      atLineStart = false;
      if (col > indents.at(-1)) { indents.push(col); push('INDENT', col); }
      else {
        while (col < indents.at(-1)) { indents.pop(); push('DEDENT', col); }
        if (col !== indents.at(-1)) error('unindent does not match any outer indentation level');
      }
    }
    const c = src[i];
    if (c === '\n') {
      if (depth === 0) push('NEWLINE', '\n');
      i++; line++; atLineStart = depth === 0;
      continue;
    }
    if (c === ' ' || c === '\t') { i++; continue; }
    if (c === '\\' && src[i + 1] === '\n') { i += 2; line++; continue; }
    if (c === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }

    const prefix = src.slice(i, i + 2).match(/^(rb|br|fr|rf|[rbfu])?['"]/i);
    if (prefix && (prefix[1] === undefined || /^[a-z]+$/i.test(prefix[1]))) {
      const pre = (prefix[1] || '').toLowerCase();
      const start = i + pre.length;
      const quote = src.startsWith(src[start].repeat(3), start) ? src[start].repeat(3) : src[start];
      const startLine = line;
      let j = start + quote.length, raw = '';
      for (;;) {
        if (j >= src.length) throw new PySyntaxError('unterminated string literal', startLine);
        if (src.startsWith(quote, j)) break;
        if (src[j] === '\n') { if (quote.length === 1) throw new PySyntaxError('unterminated string literal', startLine); line++; }
        if (src[j] === '\\' && !pre.includes('r')) {
          const n = src[j + 1];
          if (n === '\n') { j += 2; line++; continue; }
          if (n === 'x') { raw += String.fromCharCode(parseInt(src.slice(j + 2, j + 4), 16)); j += 4; continue; }
          if (n === 'u') { raw += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16)); j += 6; continue; }
          if (n === 'U') { raw += String.fromCodePoint(parseInt(src.slice(j + 2, j + 10), 16)); j += 10; continue; }
          if (n === 'N') { throw new PySyntaxError('\\N escapes are not supported here', line); }
          if (n in ESCAPES) { raw += ESCAPES[n]; j += 2; continue; }
          raw += '\\' + n; j += 2; continue;
        }
        if (src[j] === '\\' && pre.includes('r')) { raw += src[j] + (src[j + 1] ?? ''); j += 2; continue; }
        raw += src[j++];
      }
      i = j + quote.length;
      if (pre.includes('f')) tokens.push({ type: 'FSTRING', value: raw, line: startLine, raw: pre.includes('r') });
      else if (pre.includes('b')) tokens.push({ type: 'BYTES', value: raw, line: startLine });
      else tokens.push({ type: 'STRING', value: raw, line: startLine });
      continue;
    }

    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] ?? ''))) {
      const m = src.slice(i).match(/^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][+-]?\d+)?|\d[\d_]*\.(?:\d[\d_]*)?(?:[eE][+-]?\d+)?)/);
      if (!m) error('invalid number');
      let text = m[0].replace(/_/g, '');
      if (/^\d[\d_]*\.$/.test(m[0]) && src[i + m[0].length] === '.') text = text.slice(0, -1);
      i += text === m[0].replace(/_/g, '') ? m[0].length : m[0].length - 1;
      if (/^0[xX]/.test(text)) push('INT', BigInt(text));
      else if (/^0[bB]/.test(text)) push('INT', BigInt(text));
      else if (/^0[oO]/.test(text)) push('INT', BigInt(text));
      else if (/[.eE]/.test(text)) push('FLOAT', Number(text));
      else push('INT', BigInt(text));
      if (isIdStart(src[i] ?? ' ')) error('invalid decimal literal');
      continue;
    }

    if (isIdStart(c)) {
      let j = i;
      while (j < src.length && isIdChar(src[j])) j++;
      const word = src.slice(i, j);
      i = j;
      if (KEYWORDS.has(word)) push('KW', word);
      else push('NAME', word, SOFT.has(word) ? { soft: true } : {});
      continue;
    }

    const op = OPS.find(o => src.startsWith(o, i));
    if (!op) error(`invalid character '${c}'`);
    if ('([{'.includes(op)) depth++;
    if (')]}'.includes(op)) depth = Math.max(0, depth - 1);
    push('OP', op);
    i += op.length;
  }
  if (!atLineStart && tokens.length && tokens.at(-1).type !== 'NEWLINE') push('NEWLINE', '\n');
  while (indents.length > 1) { indents.pop(); push('DEDENT', 0); }
  push('EOF', null);
  return tokens;
}
