/** Step texts for the rigs in rigs-gap.js: Valid Palindrome, Contains Duplicate II, Invert Binary Tree. */
const num = v => (v == null ? 'null' : String(v).replace('-', '−'));
const esc = c => String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Russian plural: 1 пара, 2 пары, 5 пар. */
const ruN = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u >= 2 && u <= 4 ? few : many}`;
};
const enN = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* A character of the palindrome string: a space is named, anything else is quoted (and escaped: the text is HTML). */
const chEn = (i, c) => (c === ' ' ? `s[${i}] is a space` : `s[${i}] = “${esc(c)}”`);
const chRu = (i, c) => (c === ' ' ? `s[${i}] — пробел,` : `s[${i}] = «${esc(c)}» —`);
const qEn = c => `“${esc(c)}”`;
const qRu = c => `«${esc(c)}»`;

export const EV_GAP = {
  /* ---------- Valid Palindrome ---------- */
  'pal.ev.start': {
    en: n => `l = 0 and r = ${n - 1}: the two ends of the string. Each pointer skips what is not a letter or a digit, then the two characters are compared ignoring case.`,
    ru: n => `l = 0 и r = ${n - 1} — концы строки. Каждый указатель пропускает всё, что не буква и не цифра, потом два символа сравниваются без учёта регистра.`,
  },
  'pal.ev.skipL': {
    en: (from, c, to, met) => `${chEn(from, c)} — not a letter or a digit, so l skips it: l → ${to}.${met ? ' Now l = r, and the skip loop stops on l &lt; r, whatever stands there.' : ''}`,
    ru: (from, c, to, met) => `${chRu(from, c)} не буква и не цифра, l его пропускает: l → ${to}.${met ? ' Теперь l = r, и цикл пропуска останавливается на условии l &lt; r, что бы там ни стояло.' : ''}`,
  },
  'pal.ev.skipR': {
    en: (from, c, to, met) => `${chEn(from, c)} — not a letter or a digit, so r skips it: r → ${to}.${met ? ' Now l = r, and the skip loop stops on l &lt; r.' : ''}`,
    ru: (from, c, to, met) => `${chRu(from, c)} не буква и не цифра, r его пропускает: r → ${to}.${met ? ' Теперь l = r, и цикл пропуска останавливается на условии l &lt; r.' : ''}`,
  },
  'pal.ev.match': {
    en: (l, r, a, b, kind) => (kind === 'self'
      ? `l = r = ${l}: s[${l}] is compared with itself, which is always equal. l and r step past each other.`
      : kind === 'case'
        ? `s[${l}] = ${qEn(a)} and s[${r}] = ${qEn(b)}: ToLowerInvariant turns both into ${qEn(a.toLowerCase())} — equal. Both step inward: l → ${l + 1}, r → ${r - 1}.`
        : `s[${l}] = ${qEn(a)} and s[${r}] = ${qEn(b)} — equal. Both step inward: l → ${l + 1}, r → ${r - 1}.`),
    ru: (l, r, a, b, kind) => (kind === 'self'
      ? `l = r = ${l}: s[${l}] сравнивается сам с собой — равенство гарантировано. l и r расходятся.`
      : kind === 'case'
        ? `s[${l}] = ${qRu(a)} и s[${r}] = ${qRu(b)}: после ToLowerInvariant оба — ${qRu(a.toLowerCase())}, равны. Оба шагают внутрь: l → ${l + 1}, r → ${r - 1}.`
        : `s[${l}] = ${qRu(a)} и s[${r}] = ${qRu(b)} — равны. Оба шагают внутрь: l → ${l + 1}, r → ${r - 1}.`),
  },
  'pal.ev.mismatch': {
    en: (l, r, a, b) => `s[${l}] = ${qEn(a)} and s[${r}] = ${qEn(b)}: ${qEn(a.toLowerCase())} ≠ ${qEn(b.toLowerCase())} even ignoring case. Not a palindrome — return <b>false</b>.`,
    ru: (l, r, a, b) => `s[${l}] = ${qRu(a)} и s[${r}] = ${qRu(b)}: ${qRu(a.toLowerCase())} ≠ ${qRu(b.toLowerCase())} даже без учёта регистра. Не палиндром — return <b>false</b>.`,
  },
  'pal.ev.done': {
    en: (pairs, l, r) => `${l > r ? 'l > r: the pointers have crossed' : 'l = r: only the middle character is left, and it needs no pair'}. ${pairs ? `${enN(pairs, 'pair')} matched` : 'There was nothing to compare'} — return <b>true</b>.`,
    ru: (pairs, l, r) => `${l > r ? 'l > r: указатели разошлись' : 'l = r: остался только средний символ, пара ему не нужна'}. ${pairs ? `Совпало пар: ${pairs}` : 'Сравнивать было нечего'} — return <b>true</b>.`,
  },

  /* ---------- Contains Duplicate II ---------- */
  'dw.ev.start': {
    en: k => `The window is a HashSet of the last k = ${k} values. Add() returns false when the value is already inside — that is a repeat at most k positions back.`,
    ru: k => `Окно — HashSet из последних k = ${k} чисел. Add() возвращает false, если число уже внутри, — значит, повтор не дальше k позиций.`,
  },
  'dw.ev.add': {
    en: (i, x, prev, dist, k) => `i = ${i}: Add(${num(x)}) → true — ${num(x)} is not in the window.${prev == null ? '' : ` It was at index ${prev}, but ${i} − ${prev} = ${dist} > k = ${k}: that copy has already left.`}`,
    ru: (i, x, prev, dist, k) => `i = ${i}: Add(${num(x)}) → true — ${num(x)} в окне нет.${prev == null ? '' : ` Оно было на индексе ${prev}, но ${i} − ${prev} = ${dist} > k = ${k}: та копия уже вышла из окна.`}`,
  },
  'dw.ev.evict': {
    en: (i, x, j, k) => `Count = ${k + 1} > k = ${k}: Remove(nums[${i} − ${k}]) — ${num(x)} from index ${j} leaves the window. From index ${i + 1} on it is more than k away.`,
    ru: (i, x, j, k) => `Count = ${k + 1} > k = ${k}: Remove(nums[${i} − ${k}]) — ${num(x)} с индекса ${j} выходит из окна. Начиная с индекса ${i + 1} оно дальше k.`,
  },
  'dw.ev.hit': {
    en: (i, x, j, dist, k) => `i = ${i}: Add(${num(x)}) → <b>false</b> — ${num(x)} is in the window, at index ${j}. ${i} − ${j} = ${dist} ≤ k = ${k}: return <b>true</b>.`,
    ru: (i, x, j, dist, k) => `i = ${i}: Add(${num(x)}) → <b>false</b> — ${num(x)} уже в окне, на индексе ${j}. ${i} − ${j} = ${dist} ≤ k = ${k}: return <b>true</b>.`,
  },
  'dw.ev.done': {
    en: k => `The array is over and every Add() returned true: no two equal values are within k = ${k} of each other. return <b>false</b>.`,
    ru: k => `Массив кончился, и каждый Add() вернул true: равных чисел на расстоянии не больше k = ${k} нет. return <b>false</b>.`,
  },

  /* ---------- Invert Binary Tree ---------- */
  'inv.ev.start': {
    en: n => `Top — the tree as given (${enN(n, 'node')}), bottom — the same tree as the code changes it. InvertTree goes down first and swaps a node’s children only after both subtrees are inverted.`,
    ru: n => `Сверху — дерево как дано (${ruN(n, 'узел', 'узла', 'узлов')}), снизу — то же дерево, каким его делает код. InvertTree сначала спускается и меняет детей узла местами, только когда оба поддерева уже инвертированы.`,
  },
  'inv.ev.enter': {
    en: (v, l, r) => `Enter ${num(v)}. First invert its left subtree (${l == null ? 'null — returns at once' : `rooted at ${num(l)}`}), then the right one (${r == null ? 'null — returns at once' : `rooted at ${num(r)}`}).`,
    ru: (v, l, r) => `Входим в ${num(v)}. Сначала инвертируем его левое поддерево (${l == null ? 'null — вернётся сразу' : `с корнем ${num(l)}`}), потом правое (${r == null ? 'null — вернётся сразу' : `с корнем ${num(r)}`}).`,
  },
  'inv.ev.leaf': {
    en: (v, root) => `${num(v)} is a leaf: both calls return null at once, and swapping two nulls changes nothing. ${root ? 'It is also the root — the answer.' : `Return ${num(v)}.`}`,
    ru: (v, root) => `${num(v)} — лист: оба вызова сразу возвращают null, а обмен двух null ничего не меняет. ${root ? 'Он же корень — это и есть ответ.' : `Возвращаем ${num(v)}.`}`,
  },
  'inv.ev.swap': {
    en: (v, l, r, root) => `Both subtrees of ${num(v)} are inverted, so swap them: now ${num(l)} is on the left and ${num(r)} on the right. ${root ? `${num(v)} is the root — InvertTree returns it.` : `Return ${num(v)} to the caller.`}`,
    ru: (v, l, r, root) => `Оба поддерева ${num(v)} инвертированы — меняем их местами: теперь слева ${num(l)}, справа ${num(r)}. ${root ? `${num(v)} — корень, его и возвращает InvertTree.` : `Возвращаем ${num(v)} наверх.`}`,
  },
  'inv.ev.done': {
    en: n => `Done: ${n === 1 ? 'the only node was visited' : `each of the ${n} nodes was visited once`}, and the bottom tree is the mirror of the top one. O(n) time, O(h) stack.`,
    ru: n => `Готово: узлов — ${n}, каждый посещён один раз, и нижнее дерево — зеркало верхнего. Время O(n), стек O(h).`,
  },
};
