/**
 * Рендеры карточек урока. Каждый получает карточку, контейнер и api плеера:
 *   api.ready(bool)        — можно ли нажать «Проверить»;
 *   api.complete(ok, text) — карточка без кнопки проверки закончена (match, rig).
 * Возвращает { mode, input, reveal, key }:
 *   mode  'learn' — сразу «Дальше»; 'check' — «Проверить»; 'auto' — ждём complete();
 *   input() — ответ в исходных индексах карточки (см. engine.check);
 *   reveal(ok) — подсветить верное и неверное после проверки;
 *   key(e) — горячие клавиши (цифры выбирают вариант).
 */
import { esc } from '../assets/vhs.js?v=202610081418';
import { codeHtml } from './code-view.js?v=202610081418';
import { shuffle, scramble, check, blankCount } from './engine.js?v=202610081418';
import { mountRig } from './rigs.js?v=202610081418';

const h = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
};

const codeBlock = (src, lang) => h('pre', 'code', codeHtml(src, lang));

/** Одна строка кода без обёртки .ln — для строк-кнопок и кода с пропусками. */
const lineHtml = (line, lang) => (line ? codeHtml(line, lang).replace(/^<span class="ln">|<\/span>$/g, '') : '');

function head(card, host) {
  if (card.q) host.append(h('p', 'q', esc(card.q)));
  if (card.code && card.t !== 'tapline' && card.t !== 'blanks') host.append(codeBlock(card.code, card.lang));
}

/* ---------- learn ---------- */
function learn(card, host) {
  host.append(h('h3', '', esc(card.title)));
  const body = h('div', 'body', card.body);
  host.append(body);
  if (card.flow) {
    const f = h('div', 'flow');
    f.innerHTML = card.flow.map(s => `<span>${esc(s)}</span>`).join('<em>→</em>');
    body.append(f);
  }
  if (card.code) body.append(codeBlock(card.code, card.lang));
  if (card.deep) {
    const d = h('details', 'deep', `<summary>Глубже — для тех, кто уже программирует</summary><div>${card.deep}</div>`);
    host.append(d);
  }
  return { mode: 'learn' };
}

/* ---------- choice / multi ---------- */
function options(card, host, api, seed, multi) {
  head(card, host);
  if (multi) host.append(h('p', 'hint', 'Отметь все верные варианты.'));
  const order = shuffle(card.options.map((_, i) => i), seed);
  const box = h('div', multi ? 'opts multi' : 'opts');
  const picked = new Set();
  const btns = order.map((oi, pos) => {
    const b = h('button', 'opt', `<span class="k">${pos + 1}</span><span>${esc(card.options[oi])}</span>`);
    b.type = 'button';
    b.dataset.i = oi;
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => toggle(oi);
    box.append(b);
    return b;
  });
  host.append(box);
  function toggle(oi) {
    if (multi) picked.has(oi) ? picked.delete(oi) : picked.add(oi);
    else { picked.clear(); picked.add(oi); }
    btns.forEach(b => b.setAttribute('aria-pressed', picked.has(+b.dataset.i) ? 'true' : 'false'));
    api.ready(picked.size > 0);
  }
  return {
    mode: 'check',
    input: () => (multi ? [...picked] : [...picked][0]),
    reveal() {
      const right = new Set(multi ? card.answer : [card.answer]);
      btns.forEach(b => {
        const i = +b.dataset.i;
        b.disabled = true;
        if (right.has(i)) b.classList.add('right');
        else if (picked.has(i)) b.classList.add('wrong');
      });
    },
    key(e) {
      const n = +e.key;
      if (n >= 1 && n <= btns.length) { btns[n - 1].click(); return true; }
      return false;
    }
  };
}

/* ---------- tapline ---------- */
function tapline(card, host, api) {
  head(card, host);
  host.append(h('p', 'hint', 'Нажми на строку.'));
  const box = h('div', 'lines');
  let picked = null;
  const btns = card.code.split('\n').map((line, i) => {
    const b = h('button', 'line', lineHtml(line, card.lang) || ' ');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => {
      picked = i;
      btns.forEach((x, j) => x.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
      api.ready(true);
    };
    box.append(b);
    return b;
  });
  host.append(box);
  return {
    mode: 'check',
    input: () => picked,
    reveal() {
      btns.forEach((b, i) => {
        b.disabled = true;
        if (i === card.answer) b.classList.add('right');
        else if (i === picked) b.classList.add('wrong');
      });
    }
  };
}

/* ---------- order ---------- */
function order(card, host, api, seed) {
  head(card, host);
  const zone = h('div', 'answer-zone');
  zone.dataset.empty = 'Нажимай на шаги снизу по порядку';
  const bank = h('div', 'bank');
  const chosen = [];
  const tiles = scramble(card.items.length, seed).map(i => {
    const b = h('button', 'tile', esc(card.items[i]));
    b.type = 'button';
    b.onclick = () => { chosen.push(i); b.classList.add('used'); draw(); };
    bank.append(b);
    return { i, b };
  });
  host.append(zone, bank);
  function draw() {
    zone.replaceChildren(...chosen.map((i, pos) => {
      const r = h('button', 'tile row', `<span class="n">${pos + 1}</span><span>${esc(card.items[i])}</span>`);
      r.type = 'button';
      r.onclick = () => {
        chosen.splice(pos, 1);
        tiles.find(t => t.i === i).b.classList.remove('used');
        draw();
      };
      return r;
    }));
    api.ready(chosen.length === card.items.length);
  }
  return {
    mode: 'check',
    input: () => [...chosen],
    reveal() {
      [...zone.children].forEach((r, pos) => {
        r.disabled = true;
        r.classList.add(chosen[pos] === pos ? 'right' : 'wrong');
      });
      tiles.forEach(t => (t.b.disabled = true));
    }
  };
}

/* ---------- blanks ---------- */
function blanks(card, host, api, seed) {
  head(card, host);
  const parts = card.code.split('___');
  const n = blankCount(card.code);
  const fill = Array(n).fill(null);        // индекс плитки в каждом пропуске
  const pre = h('pre', 'code blanks');
  const bank = h('div', 'bank');
  const order = shuffle(card.tiles.map((_, i) => i), seed);
  const tiles = order.map(ti => {
    const b = h('button', 'tile mono', esc(card.tiles[ti]));
    b.type = 'button';
    b.onclick = () => {
      const slot = fill.indexOf(null);
      if (slot < 0) return;
      fill[slot] = ti; draw();
    };
    bank.append(b);
    return { ti, b };
  });
  host.append(pre, h('p', 'hint', 'Нажимай на плитки, чтобы заполнить пропуски. Нажми на пропуск, чтобы очистить его.'), bank);
  const slots = [];
  function draw() {
    pre.replaceChildren();
    slots.length = 0;
    parts.forEach((p, i) => {
      pre.append(h('span', '', p.split('\n').map(line => lineHtml(line, card.lang)).join('\n')));
      if (i < n) {
        const s = h('button', fill[i] === null ? 'slot' : 'slot filled', fill[i] === null ? '&nbsp;' : esc(card.tiles[fill[i]]));
        s.type = 'button';
        s.onclick = () => { fill[i] = null; draw(); };
        pre.append(s);
        slots.push(s);
      }
    });
    tiles.forEach(t => t.b.classList.toggle('used', fill.includes(t.ti)));
    api.ready(!fill.includes(null));
  }
  draw();
  return {
    mode: 'check',
    input: () => fill.map(ti => card.tiles[ti]),
    reveal() {
      slots.forEach((s, i) => {
        s.disabled = true;
        s.classList.add(card.tiles[fill[i]] === card.answer[i] ? 'right' : 'wrong');
      });
      tiles.forEach(t => (t.b.disabled = true));
    }
  };
}

/* ---------- match ---------- */
function match(card, host, api, seed) {
  head(card, host);
  host.append(h('p', 'hint', 'Нажми слово слева, потом его пару справа.'));
  const box = h('div', 'match');
  const L = h('div', 'col'), R = h('div', 'col');
  box.append(L, R);
  host.append(box);
  let sel = null, left = card.pairs.length, slip = false;
  const mk = (text, side, i) => {
    const b = h('button', 'tile', esc(text));
    b.type = 'button';
    b.dataset.side = side; b.dataset.i = i;
    b.setAttribute('aria-pressed', 'false');
    b.onclick = () => pick(b);
    return b;
  };
  const lefts = scramble(card.pairs.length, seed).map(i => mk(card.pairs[i][0], 'l', i));
  const rights = scramble(card.pairs.length, seed + 7).map(i => mk(card.pairs[i][1], 'r', i));
  L.append(...lefts); R.append(...rights);
  function pick(b) {
    if (b.classList.contains('ok')) return;
    if (!sel || sel.dataset.side === b.dataset.side) {
      if (sel) sel.setAttribute('aria-pressed', 'false');
      sel = b; b.setAttribute('aria-pressed', 'true');
      return;
    }
    const a = sel; sel = null;
    a.setAttribute('aria-pressed', 'false');
    if (a.dataset.i === b.dataset.i) {
      [a, b].forEach(x => { x.classList.add('ok'); x.disabled = true; });
      if (--left === 0) api.complete(!slip, slip ? 'Все пары найдены, но с ошибками.' : 'Все пары найдены с первого раза.');
    } else {
      slip = true;
      [a, b].forEach(x => { x.classList.remove('bad'); void x.offsetWidth; x.classList.add('bad'); });
    }
  }
  return { mode: 'auto' };
}

/* ---------- rig ---------- */
function rig(card, host, api) {
  const box = h('div', 'rig');
  const task = h('div', 'task', `<i>✓</i><span>${esc(card.task)}</span>`);
  box.append(task);
  host.append(box);
  mountRig(card, box, () => {
    task.classList.add('ok');
    api.complete(true, 'Задание выполнено.');
  });
  return { mode: 'auto' };
}

const RENDER = { learn, choice: (c, h2, a, s) => options(c, h2, a, s, false), multi: (c, h2, a, s) => options(c, h2, a, s, true), tapline, order, blanks, match, rig };

export function renderCard(card, host, api, seed) {
  return RENDER[card.t](card, host, api, seed);
}

/** Текст под «Не совсем»: что именно не так и какой ответ верный. */
export function feedback(card, input, ok) {
  if (ok) return card.explain ?? '';
  const parts = [];
  if (card.t === 'choice' && card.wrong?.[input]) parts.push(card.wrong[input]);
  if (card.t === 'choice') parts.push(`Верный ответ: «${card.options[card.answer]}».`);
  if (card.t === 'order') parts.push('Правильный порядок: ' + card.items.map((s, i) => `${i + 1}) ${s}`).join(' '));
  if (card.t === 'blanks') parts.push('Нужно: ' + card.answer.join(', ') + '.');
  if (card.explain) parts.push(card.explain);
  return parts.join(' ');
}

export { check };
