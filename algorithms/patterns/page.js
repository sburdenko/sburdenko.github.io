/** Tape 06 assembly: language, map, skeletons and, per chapter, four problem tabs that each drive their own rig. */
import { $, $$, esc, bootVhs } from '../../assets/vhs.js?v=202609252015';
import { initI18n, t, onLang } from '../../assets/i18n.js?v=202609252015';
import { COMMON } from '../../assets/i18n-common.js?v=202609252015';
import { renderCode } from '../../assets/code.js?v=202609252015';
import { createPlayer, bindTransport } from '../bfs-dfs/player.js?v=202609252015';
import { DICT } from './i18n.js?v=202609252015';
import { RIGS, PATTERN_IDS } from './rigs.js?v=202609252015';
import { PROBLEMS, NAMES } from './problems.js?v=202609252015';

const pad = n => String(n).padStart(2, '0');
const HARD_TAB = 3;

/* Shells go in before initI18n so their data-i18n labels are translated with the rest of the page. */
const shell = () => `<h4 data-i18n="ui.problems"></h4>
  <div class="ptabs" role="tablist" data-i18n-aria="ui.problemsAria"></div>
  <div class="panel rig" role="tabpanel">
    <div class="rig-head"><p class="lbl" data-i18n="ui.rigTag">RIG · STEP BY STEP</p><h3 class="rig-title"></h3></div>
    <div class="crt"><div class="stage"></div></div>
    <div class="explanation" aria-live="polite"></div>
    <div class="rig-vars"></div>
    <div class="transport">
      <button class="btn" data-t="first" data-i18n-title="tr.first" data-i18n-aria="tr.first">|◀</button>
      <button class="btn" data-t="back" data-i18n-title="tr.back" data-i18n-aria="tr.back">◀</button>
      <button class="btn primary" data-t="play">► PLAY</button>
      <button class="btn" data-t="fwd" data-i18n-title="tr.fwd" data-i18n-aria="tr.fwd">▶</button>
      <button class="btn" data-t="end" data-i18n-title="tr.end" data-i18n-aria="tr.end">▶|</button>
      <span class="spd"><span data-i18n="tr.speedLabel">SPEED</span><input type="range" min="1" max="8" value="2" data-i18n-aria="tr.speedAria"><b data-t="sps">2</b><span data-i18n="tr.perSec">/s</span></span>
      <span class="lbl" data-t="pos"></span>
    </div>
  </div>
  <div class="ppanel panel"></div>`;

$$('[data-probs]').forEach(root => { root.innerHTML = shell(); });

initI18n({ ...COMMON, ...DICT });
bootVhs();

function mountChapter(root) {
  const id = root.dataset.probs;
  const tabs = $('.ptabs', root), info = $('.ppanel', root), title = $('.rig-title', root);
  const stage = $('.stage', root), explanation = $('.explanation', root), vars = $('.rig-vars', root);
  let selected = 0, rig = null, run = null, frame = null;

  const paint = next => {
    frame = next;
    const event = next.run.events[next.index];
    stage.innerHTML = rig.view(run, event);
    explanation.innerHTML = t(event.key, ...event.args);
    vars.innerHTML = rig.vars(run, event)
      .map(([key, html]) => `<div class="rv"><span class="lbl">${t(key)}</span><span class="rv-val">${html}</span></div>`).join('');
    sync(next);
  };
  const player = createPlayer(paint);
  const sync = bindTransport($('.transport', root), player);

  function renderTabs() {
    const texts = t(`${id}.p`);
    tabs.innerHTML = PROBLEMS[id].map((p, j) => `<button type="button" class="ptab${j === HARD_TAB ? ' hard' : ''}" role="tab" id="${id}-tab-${j}" aria-selected="${j === selected}" tabindex="${j === selected ? 0 : -1}" data-j="${j}">
      <span class="v">${texts[j].variant}</span><span class="nm">${esc(p.name)}</span>
      <span class="meta">#${p.num} · <i class="diff ${p.diff}">${p.diff}</i>${j === HARD_TAB ? ` · <b class="must">${t('ui.hard')}</b>` : ''}</span></button>`).join('');
  }

  function renderInfo() {
    const p = PROBLEMS[id][selected], text = t(`${id}.p`)[selected];
    info.innerHTML = `<div class="pinfo">
        <h3>${esc(p.name)} <span class="lc">#${p.num}</span></h3>
        <dl>
          <div><dt class="lbl">${t('ui.task')}</dt><dd>${text.task}</dd></div>
          <div><dt class="lbl">${t('ui.idea')}</dt><dd>${text.idea}</dd></div>
          <div><dt class="lbl">${t('ui.why')}</dt><dd class="reason">${text.why}</dd></div>
          <div><dt class="lbl">${t('ui.cx')}</dt><dd class="cx">${text.cx}</dd></div>
        </dl>
        <a class="leet" href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener">${t('ui.leet')}</a>
      </div>
      <div class="pcode"><p class="lbl">${t('ui.code')}</p><pre class="code"></pre></div>`;
    renderCode($('.pcode pre', info), p.code);
  }

  function select(j, focus = false) {
    selected = j;
    const p = PROBLEMS[id][j];
    rig = RIGS[p.rig];
    run = rig.run();
    title.textContent = `${p.name} · ${rig.input}`;
    renderTabs();
    renderInfo();
    player.load(run);
    if (focus) $(`#${id}-tab-${j}`, root)?.focus();
  }

  tabs.addEventListener('click', event => {
    const tab = event.target.closest('.ptab');
    if (tab) select(Number(tab.dataset.j));
  });
  tabs.addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    select((selected + step + PROBLEMS[id].length) % PROBLEMS[id].length, true);
  });
  onLang(() => {
    renderTabs();
    renderInfo();
    if (frame) paint(frame);
  });
  select(0);
}

function renderMap() {
  $('#patternMap').innerHTML = PATTERN_IDS.map((id, i) =>
    `<a href="#${id}"><span class="n">${pad(i + 1)}</span><b>${esc(NAMES[id])}</b><span class="s">${t(`${id}.short`)}</span></a>`).join('');
}

function renderTemplates() {
  $$('[data-tpl]').forEach(pre => renderCode(pre, t(`${pre.dataset.tpl}.tpl`)));
}

$$('[data-probs]').forEach(mountChapter);
renderMap();
renderTemplates();
onLang(() => {
  renderMap();
  renderTemplates();
});
