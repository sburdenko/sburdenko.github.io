/** Общие панели для обеих визуализаций: псевдокод, фронт, плитки, подписи к событиям. */
import { esc } from '../../assets/vhs.js';
import { LINES } from './traversal.js';

export const COL = {
  bfs: '#26e3ea',
  dfs: '#ff3ea5',
  path: '#ffd23f',
  wall: '#2e2456',
  free: '#090514',
  start: '#5dfc9a',
  goal: '#ff7fd8'
};

/** Цвет посещённой вершины: чем позже посещена, тем светлее. */
export function visitedColor(k, total, order) {
  const t = total > 1 ? k / (total - 1) : 0;
  const base = order === 'bfs' ? [38, 90, 160] : [130, 40, 110];
  const top = order === 'bfs' ? [70, 200, 220] : [255, 120, 190];
  const c = base.map((v, i) => Math.round(v + (top[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Цвет слоя: одинаковая глубина — одинаковый цвет, видно волну BFS. */
export function depthColor(d, maxD) {
  if (d < 0) return COL.free;
  const t = maxD > 0 ? d / maxD : 0;
  const hue = 190 - t * 190;
  return `hsl(${hue.toFixed(0)},72%,${(34 + t * 16).toFixed(0)}%)`;
}

export function renderPseudo(el, order, line) {
  el.innerHTML = LINES[order].map((src, i) => {
    const html = esc(src)
      .replace(/\b(while|if|for|continue|in|не пуст)\b/g, '<em class="kw">$1</em>')
      .replace(/(queue|stack|seen|visited|parent)/g, '<em class="fn">$1</em>');
    return `<div class="ln${i === line ? ' on' : ''}"><span>${i + 1}</span><span>${html}</span></div>`;
  }).join('');
}

export function renderFrontier(el, ids, order, labelOf) {
  const rail = el.querySelector('.rail');
  el.classList.toggle('stk', order === 'dfs');
  if (!ids.length) {
    rail.innerHTML = '<span class="empty">пусто</span>';
  } else {
    const view = ids.length > 60 ? ids.slice(0, 60) : ids;
    const headIdx = order === 'bfs' ? 0 : view.length - 1;
    rail.innerHTML = view.map((id, i) =>
      `<span class="cellchip${i === headIdx ? ' head' : ''}">${esc(labelOf(id))}</span>`
    ).join('') + (ids.length > view.length ? `<span class="empty">+${ids.length - view.length}</span>` : '');
    if (order === 'dfs') rail.scrollLeft = rail.scrollWidth;
  }
  const ends = el.querySelector('.ends');
  if (ends) ends.innerHTML = order === 'bfs'
    ? '<span>◀ ГОЛОВА · берём отсюда</span><span>кладём сюда · ХВОСТ ▶</span>'
    : '<span>ДНО</span><span>берём и кладём сюда · ВЕРШИНА ▶</span>';
}

export function tile(lbl, val, unit, foot, cls = '') {
  return `<div class="tile ${cls}"><span class="lbl">${lbl}</span><span class="val">${val}${unit ? `<small>${unit}</small>` : ''}</span>${foot ? `<span class="d">${foot}</span>` : ''}</div>`;
}

const ACTION = {
  init: 'СТАРТ',
  pop: 'ИЗВЛЕКАЕМ',
  visit: 'ПОСЕЩАЕМ',
  push: 'ДОБАВЛЯЕМ',
  skip: 'ПРОПУСК',
  dup: 'ДУБЛЬ',
  goal: 'ЦЕЛЬ',
  done: 'КОНЕЦ'
};

/** Человеческое описание текущего события. */
export function noteFor(order, ev, labelOf) {
  if (!ev) return { tag: '—', text: '' };
  const box = order === 'bfs' ? 'очередь' : 'стек';
  const A = labelOf(ev.node), B = ev.from != null ? labelOf(ev.from) : '';
  switch (ev.t) {
    case 'init': return { tag: ACTION.init, text: `Кладём <b>${A}</b> в ${box} и помечаем как открытую.` };
    case 'pop': return { tag: ACTION.pop, text: order === 'bfs'
      ? `Берём <b>${A}</b> из <b>головы</b> очереди — это самая «старая» открытая вершина.`
      : `Снимаем <b>${A}</b> с <b>вершины</b> стека — это самая «свежая» открытая вершина.` };
    case 'visit': return { tag: ACTION.visit, text: `Посещаем <b>${A}</b>. Номер обхода ${ev.order + 1}, глубина ${ev.depth}.` };
    case 'push': return { tag: ACTION.push, text: `Сосед <b>${A}</b> ещё не открыт: запоминаем родителя <b>${B}</b> и кладём ${order === 'bfs' ? 'в хвост очереди' : 'на вершину стека'}.` };
    case 'skip': return { tag: ACTION.skip, text: `Сосед <b>${A}</b> уже ${order === 'bfs' ? 'в очереди или посещён' : 'посещён'} — второй раз не открываем.` };
    case 'dup': return { tag: ACTION.dup, text: `<b>${A}</b> лежал в стеке дважды. Эта копия устарела — выбрасываем.` };
    case 'goal': return { tag: ACTION.goal, text: `<b>${A}</b> — это цель. Путь восстанавливаем по родителям назад до старта.` };
    case 'done': return { tag: ACTION.done, text: `${order === 'bfs' ? 'Очередь' : 'Стек'} пуст: всё, до чего можно дойти, обойдено.` };
    default: return { tag: '—', text: '' };
  }
}
