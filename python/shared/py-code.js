/** Python syntax highlighter and the numbered code panel of the stepper. Pure string builders. */
import { esc } from '../../assets/vhs.js?v=202610071708';

const KEYWORDS = new Set(('False None True and as assert async await break class continue def del elif else except finally for from '
  + 'global if import in is lambda nonlocal not or pass raise return try while with yield match case').split(' '));
const BUILTINS = new Set(('print input len range int str float list dict set tuple bool type isinstance sorted sum min max abs round enumerate zip map filter '
  + 'reversed open super property staticmethod classmethod object repr format ord chr hash id any all next iter divmod pow bin hex oct getattr setattr hasattr '
  + 'callable vars dir frozenset bytes slice Exception ValueError TypeError KeyError IndexError ZeroDivisionError AttributeError NameError RuntimeError StopIteration '
  + 'RecursionError AssertionError FileNotFoundError EOFError NotImplemented OSError UnboundLocalError LookupError ArithmeticError').split(' '));

const TOKEN = /(#[^\n]*)|((?:[rRbBfFuU]{0,2})(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'))|(@\w+)|([A-Za-z_À-￿][\wÀ-￿]*)|(\d[\w.]*|\.\d[\w.]*)|([\s\S])/g;

const wrap = (cls, text) => (cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text));

function highlightString(text) {
  const m = text.match(/^([rRbBfFuU]{0,2})(.*)$/s);
  const prefix = m[1], body = m[2];
  if (!/f/i.test(prefix)) return wrap('s', text);
  let out = wrap('s', prefix);
  const re = /\{\{|\}\}|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let last = 0, hit;
  while ((hit = re.exec(body))) {
    out += wrap('s', body.slice(last, hit.index));
    if (hit[0] === '{{' || hit[0] === '}}') out += wrap('s', hit[0]);
    else out += `<span class="fe">${esc(hit[0])}</span>`;
    last = re.lastIndex;
  }
  return out + wrap('s', body.slice(last));
}

/** Highlights one line (or any snippet) of Python. */
export function highlightPy(src) {
  let html = '', m;
  TOKEN.lastIndex = 0;
  let prevWord = '';
  while ((m = TOKEN.exec(src))) {
    const [all, comment, string, decorator, word, number] = m;
    if (comment) html += wrap('c', comment);
    else if (string) html += highlightString(string);
    else if (decorator) html += wrap('d', decorator);
    else if (word) {
      const next = src[TOKEN.lastIndex];
      const cls = KEYWORDS.has(word) ? 'k'
        : prevWord === 'def' || prevWord === 'class' ? 'f'
        : /^__\w+__$/.test(word) ? 'm'
        : BUILTINS.has(word) ? 'b'
        : next === '(' ? 'f'
        : /^[A-Z]/.test(word) ? 't' : '';
      html += wrap(cls, word);
      prevWord = word;
      continue;
    } else if (number) html += wrap('n', number);
    else html += esc(all);
    if (!/^\s+$/.test(all)) prevWord = all;
  }
  return html;
}

/**
 * Numbered panel. `current` and `prev` are 1-based lines; `marks` maps line → extra class (e.g. 'err').
 * Lines that belong to the same frame as the current one can be dimmed by passing `activeRange`.
 */
export function renderPyCode(src, { current = 0, prev = 0, marks = {}, start = 1 } = {}) {
  const lines = src.replace(/\n$/, '').split('\n');
  let html = '';
  lines.forEach((text, i) => {
    const n = i + start;
    const cls = ['ln', n === current ? 'cur' : '', n === prev ? 'prev' : '', marks[n] || ''].filter(Boolean).join(' ');
    html += `<span class="${cls}" data-line="${n}"><span class="no">${n}</span><span class="src">${highlightPy(text) || ' '}</span></span>`;
  });
  return `<pre class="code py">${html}</pre>`;
}

/** Static snippet for prose: highlighted, no line numbers. */
export const pyBlock = src => `<pre class="code py static">${src.replace(/\n$/, '').split('\n').map(l => `<span class="ln"><span class="src">${highlightPy(l) || ' '}</span></span>`).join('')}</pre>`;

/** Python literal for a JS value, used to splice editable inputs into a snippet. */
export function lit(v) {
  if (v === null || v === undefined) return 'None';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(v).includes('.') || String(v).includes('e') ? String(v) : String(v) + '.0';
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'string') {
    const q = v.includes("'") && !v.includes('"') ? '"' : "'";
    return q + v.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, '\\n').replace(/\t/g, '\\t') + q;
  }
  if (Array.isArray(v)) return `[${v.map(lit).join(', ')}]`;
  if (v instanceof Set) return `{${[...v].map(lit).join(', ')}}`;
  if (typeof v === 'object' && v.tuple) return v.tuple.length === 1 ? `(${lit(v.tuple[0])},)` : `(${v.tuple.map(lit).join(', ')})`;
  if (typeof v === 'object') return `{${Object.entries(v).map(([k, x]) => `${lit(k)}: ${lit(x)}`).join(', ')}}`;
  return String(v);
}
export const tuple = (...items) => ({ tuple: items });
