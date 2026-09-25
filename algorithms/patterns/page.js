/** Tape 06 assembly: rig shells, language, rigs on the shared player, map, skeletons and problem tabs. */
import { $, $$, esc, bootVhs } from '../../assets/vhs.js?v=202609241230';
import { initI18n, t, onLang } from '../../assets/i18n.js?v=202609241230';
import { COMMON } from '../../assets/i18n-common.js?v=202609241230';
import { renderCode } from '../../assets/code.js?v=202609241230';
import { createPlayer, bindTransport } from '../bfs-dfs/player.js?v=202609241230';
import { DICT } from './i18n.js?v=202609241230';
import { RIGS, PATTERN_IDS } from './rigs.js?v=202609241230';
import { PROBLEMS, NAMES } from './problems.js?v=202609241230';

const pad = n => String(n).padStart(2, '0');

/* Shells go in before initI18n so their data-i18n labels are translated with the rest of the page. */
function rigShell(id) {
  return `<div class="rig-head"><p class="lbl" data-i18n="ui.rigTag">RIG · STEP BY STEP</p><h3 data-i18n="${id}.viz"></h3></div>
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
    </div>`;
}

$$('[data-rig]').forEach(root => { root.innerHTML = rigShell(root.dataset.rig); });

initI18n({ ...COMMON, ...DICT });
bootVhs();

function mountRig(root) {
  const rig = RIGS[root.dataset.rig];
  const run = rig.run();
  const stage = $('.stage', root), explanation = $('.explanation', root), vars = $('.rig-vars', root);
  let current = null;
  const paint = frame => {
    current = frame;
    const event = frame.run.events[frame.index];
    stage.innerHTML = rig.view(run, event);
    explanation.innerHTML = t(event.key, ...event.args);
    vars.innerHTML = rig.vars(run, event)
      .map(([key, html]) => `<div class="rv"><span class="lbl">${t(key)}</span><span class="rv-val">${html}</span></div>`).join('');
    sync(frame);
  };
  const player = createPlayer(paint);
  const sync = bindTransport($('.transport', root), player);
  player.load(run);
  onLang(() => { if (current) paint(current); });
}

function renderMap() {
  $('#patternMap').innerHTML = PATTERN_IDS.map((id, i) =>
    `<a href="#${id}"><span class="n">${pad(i + 1)}</span><b>${esc(NAMES[id])}</b><span class="s">${t(`${id}.short`)}</span></a>`).join('');
}

function renderTemplates() {
  $$('[data-tpl]').forEach(pre => renderCode(pre, t(`${pre.dataset.tpl}.tpl`)));
}

function renderProblems(root) {
  const id = root.dataset.probs;
  const selected = Number(root.dataset.sel || 0);
  const texts = t(`${id}.p`);
  const tabs = PROBLEMS[id].map((p, j) => `<button type="button" class="ptab" role="tab" id="${id}-tab-${j}" aria-controls="${id}-panel" aria-selected="${j === selected}" tabindex="${j === selected ? 0 : -1}" data-j="${j}">
      <span class="v">${texts[j].variant}</span><span class="nm">${esc(p.name)}</span><span class="meta">#${p.num} · <i class="diff ${p.diff}">${p.diff}</i></span></button>`).join('');
  const p = PROBLEMS[id][selected], text = texts[selected];
  root.innerHTML = `<h4>${t('ui.problems')}</h4>
    <div class="ptabs" role="tablist" aria-label="${t('ui.problemsAria')}">${tabs}</div>
    <div class="ppanel panel" role="tabpanel" id="${id}-panel" aria-labelledby="${id}-tab-${selected}">
      <div class="pinfo">
        <h3>${esc(p.name)} <span class="lc">#${p.num}</span></h3>
        <dl>
          <div><dt class="lbl">${t('ui.task')}</dt><dd>${text.task}</dd></div>
          <div><dt class="lbl">${t('ui.idea')}</dt><dd>${text.idea}</dd></div>
          <div><dt class="lbl">${t('ui.why')}</dt><dd class="reason">${text.why}</dd></div>
          <div><dt class="lbl">${t('ui.cx')}</dt><dd class="cx">${text.cx}</dd></div>
        </dl>
        <a class="leet" href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener">${t('ui.leet')}</a>
      </div>
      <div class="pcode"><p class="lbl">${t('ui.code')}</p><pre class="code"></pre></div>
    </div>`;
  renderCode($('.pcode pre', root), p.code);
}

function bindProblems(root) {
  const select = j => {
    root.dataset.sel = j;
    renderProblems(root);
    $(`#${root.dataset.probs}-tab-${j}`)?.focus();
  };
  root.addEventListener('click', event => {
    const tab = event.target.closest('.ptab');
    if (tab) select(Number(tab.dataset.j));
  });
  root.addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step || !event.target.closest('.ptab')) return;
    event.preventDefault();
    select((Number(root.dataset.sel || 0) + step + 3) % 3);
  });
  renderProblems(root);
}

$$('[data-rig]').forEach(mountRig);
$$('[data-probs]').forEach(bindProblems);
renderMap();
renderTemplates();
onLang(() => {
  renderMap();
  renderTemplates();
  $$('[data-probs]').forEach(renderProblems);
});
