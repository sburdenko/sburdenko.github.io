/** Общие панели для обеих визуализаций: псевдокод, фронт, плитки, подписи к событиям. */
import { esc } from '../../assets/vhs.js?v=202609161139';
import { t } from '../../assets/i18n.js?v=202609161139';

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
  const ratio = total > 1 ? k / (total - 1) : 0;
  const base = order === 'bfs' ? [38, 90, 160] : [130, 40, 110];
  const top = order === 'bfs' ? [70, 200, 220] : [255, 120, 190];
  const c = base.map((v, i) => Math.round(v + (top[i] - v) * ratio));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Цвет слоя: одинаковая глубина — одинаковый цвет, видно волну BFS. */
export function depthColor(d, maxD) {
  if (d < 0) return COL.free;
  const ratio = maxD > 0 ? d / maxD : 0;
  const hue = 190 - ratio * 190;
  return `hsl(${hue.toFixed(0)},72%,${(34 + ratio * 16).toFixed(0)}%)`;
}

export function renderPseudo(el, order, line) {
  el.innerHTML = t('code.' + order).map((src, i) => {
    const html = esc(src)
      .replace(/\b(while|if|for|continue|in|not empty|не пуст|reversed|обратно)\b/g, '<em class="kw">$1</em>')
      .replace(/(queue|stack|seen|visited|parent)/g, '<em class="fn">$1</em>');
    return `<div class="ln${i === line ? ' on' : ''}"><span>${i + 1}</span><span>${html}</span></div>`;
  }).join('');
}

export function renderFrontier(el, ids, order, labelOf) {
  const rail = el.querySelector('.rail');
  el.classList.toggle('stk', order === 'dfs');
  if (!ids.length) {
    rail.innerHTML = `<span class="empty">${t('ui.empty')}</span>`;
  } else {
    const view = ids.length > 60 ? ids.slice(0, 60) : ids;
    const headIdx = order === 'bfs' ? 0 : view.length - 1;
    rail.innerHTML = view.map((id, i) =>
      `<span class="cellchip${i === headIdx ? ' head' : ''}">${esc(labelOf(id))}</span>`
    ).join('') + (ids.length > view.length ? `<span class="empty">+${ids.length - view.length}</span>` : '');
    if (order === 'dfs') rail.scrollLeft = rail.scrollWidth;
  }
  const ends = el.querySelector('.ends');
  if (ends) ends.innerHTML = t(order === 'bfs' ? 'ui.queueEnds' : 'ui.stackEnds');
}

export function tile(lbl, val, unit, foot, cls = '') {
  return `<div class="tile ${cls}"><span class="lbl">${lbl}</span><span class="val">${val}${unit ? `<small>${unit}</small>` : ''}</span>${foot ? `<span class="d">${foot}</span>` : ''}</div>`;
}

/** Человеческое описание текущего события — тексты лежат в словаре. */
export function noteFor(order, ev, labelOf) {
  if (!ev) return { tag: '—', text: '' };
  const A = labelOf(ev.node);
  const B = ev.from != null ? labelOf(ev.from) : '';
  return { tag: t('ev.tag.' + ev.t), text: t('ev.' + ev.t, order, A, B, ev) };
}
