/** Общий каркас стендов на моделях вида { init, act, goal }: состояние, кнопки с data-act, проверка цели. */
import { esc } from '../assets/vhs.js?v=202610100741';

export const h = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
};

/** Кнопка-действие: стенд ловит клики по data-act делегированием. */
export const act = (a, text, cls = 'btn', disabled = false) =>
  `<button type="button" class="${cls}" data-act="${esc(a)}"${disabled ? ' disabled' : ''}>${text}</button>`;

/** Цвет ссылки по номеру объекта: одна и та же ссылка и объект в куче одного цвета. */
const COLORS = ['var(--gpu)', 'var(--cpu)', 'var(--osd)', 'var(--ok)', '#b28dff', 'var(--warn)', '#7fd4ff', '#ff9ad5'];
export const refColor = id => COLORS[(id - 1) % COLORS.length];

/**
 * Запускает стенд: draw(state) возвращает HTML, клики по [data-act] меняют состояние через model.act.
 * done() вызывается один раз, когда model.goal впервые выполнена.
 */
export function drive(card, host, model, draw, done, after) {
  let s = model.init(card), reached = false;
  const box = h('div', 'rig-live');
  host.append(box);
  const render = () => {
    box.innerHTML = draw(s);
    after?.(box, s);
    if (!reached && model.goal(card, s)) { reached = true; done(); }
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    s = model.act(card, s, b.dataset.act);
    render();
  });
  render();
  return { get: () => s, set: x => { s = x; render(); }, box };
}
