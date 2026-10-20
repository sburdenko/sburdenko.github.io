/**
 * Стенд «алгоритм по шагам»: SVG и текст шага берутся у кассеты 06 (algorithms/patterns/), логика — в models-algo.js.
 * Стили SVG тоже кассетные: правила .stage/.vchip/.mk-* из её style.css подключаются один раз,
 * с приставкой .algo-rig, чтобы остальная её вёрстка не задела страницу курса.
 */
import { esc } from '../assets/vhs.js?v=202610201312';
import { drive } from './rig-kit.js?v=202610201312';
import { tr } from './i18n.js?v=202610201312';
import { ALGO, algoRig, algoRun, algoAskAt, algoCan, algoBlocked, optionLabel, tapeText } from './models-algo.js?v=202610201312';
import { shuffle } from './engine.js?v=202610201312';
import { t as tl } from './ui.js?v=202610201312';

/* ---------- стили кассеты, точечно ---------- */

const KEEP = /^\.(stage|vchip|mk-)/;
let tapeCss = null;

/** Берёт из style.css кассеты только правила SVG и фишек переменных и вешает их на .algo-rig. */
function loadTapeCss() {
  if (tapeCss || typeof document === 'undefined') return;
  const done = () => document.documentElement.classList.add('algo-css');
  // метка версии та же, что у этого модуля: ?v= в import.meta.url
  const href = new URL(`../algorithms/patterns/style.css${new URL(import.meta.url).search}`, import.meta.url);
  tapeCss = fetch(href)
    .then(r => (r.ok ? r.text() : Promise.reject(new Error(`${href}: ${r.status}`))))
    .then(text => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(text);
      const rules = [...sheet.cssRules].flatMap(rule => {
        if (!(rule instanceof CSSStyleRule)) return [];
        const parts = rule.selectorText.split(',').map(p => p.trim());
        return parts.every(p => KEEP.test(p)) ? [`${parts.map(p => `.algo-rig ${p}`).join(',')}{${rule.style.cssText}}`] : [];
      });
      const style = document.createElement('style');
      style.dataset.from = 'algorithms/patterns/style.css';
      style.textContent = rules.join('\n');
      document.head.append(style);
    })
    .catch(e => console.warn('algo: стили кассеты не загрузились', e))
    .finally(done);
}

/* Наконечники стрелок, на которые ссылаются виды кассеты (url(#pat-ah…)); на её странице они в index.html. */
const DEFS = `<svg class="algo-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <marker id="pat-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-edge" d="M0 0L10 5L0 10z"/></marker>
  <marker id="pat-ah-amb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-amb" d="M0 0L10 5L0 10z"/></marker>
  <marker id="pat-ah-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-ok" d="M0 0L10 5L0 10z"/></marker>
</defs></svg>`;

/* ---------- отрисовка ---------- */

const tbtn = (a, sym, label, cls, disabled) =>
  `<button type="button" class="${cls}" data-act="${a}" aria-label="${esc(label)}" title="${esc(label)}"${disabled ? ' disabled' : ''}>${sym}</button>`;

/** Вопрос на текущем шаге: открытый (варианты и промахи) или уже отвеченный (верный вариант и разбор). */
/** Постоянное число из строки: порядок вариантов не прыгает между перерисовками и у всех одинаков. */
const seedOf = str => [...str].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

function askBlock(card, s, { ask, answered }) {
  // варианты перемешаны, как в обычных карточках: у авторов верный ответ часто первым; pick:N — номер в данных
  const order = shuffle(ask.options.map((_, n) => n), seedOf(`${card.problem}:${ask.at}`));
  const opts = order.map(n => [ask.options[n], n]).map(([o, n]) => {
    const wrong = !answered && s.wrong.includes(n), right = answered && n === ask.answer;
    const cls = `btn algo-opt${wrong ? ' bad' : ''}${right ? ' ok' : ''}`;
    const mark = wrong ? '✗ ' : right ? '✓ ' : '';
    return `<button type="button" class="${cls}" data-act="pick:${n}"${algoCan(card, s, `pick:${n}`) ? '' : ' disabled'}>${mark}${esc(optionLabel(o))}</button>`;
  }).join('');
  const fb = answered
    ? `${tl('r.algo.right')}${ask.explain ? ` ${tr(ask.explain)}` : ''}`
    : s.wrong.length ? tl('r.algo.wrong') : tl('r.algo.askHint');
  return `<div class="algo-ask${answered ? ' ok' : ''}" role="group" aria-label="${esc(tl('r.algo.askAria'))}">
      <p class="algo-q">${ask.q ? tr(ask.q) : esc(tl('r.algo.ask'))}</p>
      <div class="algo-opts">${opts}</div>
      <p class="algo-fb" aria-live="polite">${fb}</p>
    </div>`;
}

function algo(card, host, done) {
  const p = ALGO[card.problem], run = algoRun(card), n = run.events.length;
  loadTapeCss();
  let lastAct = null;
  // кнопки перерисовываются после каждого нажатия — фокус возвращается на ту же кнопку
  host.addEventListener('click', e => { lastAct = /** @type {HTMLElement} */ (e.target).closest('[data-act]')?.getAttribute('data-act') ?? null; }, true);
  const live = drive(card, host, algoRig, s => {
    const e = run.events[s.i], last = s.i === n - 1, blocked = algoBlocked(card, s), here = algoAskAt(card, s);
    const vars = p.vars(run, e).map(([key, html]) => `<div class="row"><span class="k">${esc(tapeText(key))}</span><span class="v">${html}</span></div>`).join('');
    return `${DEFS}
      <div class="algo-head">
        <span class="algo-pat">${esc(p.patternName)} · <span class="algo-var">${esc(tr(p.i18n.variant))}</span></span>
        <b>${esc(p.title)}</b><span class="algo-num">#${p.num}</span><i class="algo-diff ${p.diff}">${p.diff}</i>
      </div>
      <p class="algo-brief">${tr(p.i18n.task)}</p>
      <div class="stage algo-stage">${p.view(run, e)}</div>
      <div class="vm-note${last ? ' ret' : ''}" aria-live="polite">${tapeText(e.key, e.args)}</div>
      ${vars ? `<div class="algo-vars">${vars}</div>` : ''}
      ${here ? askBlock(card, s, here) : ''}
      <div class="algo-bar">
        <div class="btns">
          ${tbtn('reset', '⏮', tl('r.algo.first'), 'btn', !algoCan(card, s, 'reset'))}
          ${tbtn('prev', '◀', tl('r.algo.prev'), 'btn', !algoCan(card, s, 'prev'))}
          ${tbtn('next', '▶', tl('r.algo.next'), 'btn primary', !algoCan(card, s, 'next'))}
          ${tbtn('end', '⏭', tl('r.algo.end'), 'btn', !algoCan(card, s, 'end'))}
        </div>
        <span class="algo-pos">${tl('r.algo.step', { i: s.i + 1, n })}${blocked ? ` · ${tl('r.algo.locked')}` : ''}</span>
      </div>`;
  }, done, box => {
    if (!lastAct) return;
    const b = /** @type {HTMLButtonElement | null} */ (box.querySelector(`[data-act="${lastAct}"]`));
    const fallback = /** @type {HTMLButtonElement | null} */ (box.querySelector('.algo-opt:not([disabled])') ?? box.querySelector('[data-act="next"]:not([disabled])') ?? box.querySelector('[data-act="prev"]'));
    (b && !b.disabled ? b : fallback)?.focus();
  });
  live.box.classList.add('algo-rig');
}

export const RIGS_ALGO = { algo };
