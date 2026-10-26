/** Tape 06 assembly: language, map, skeletons and, per chapter, four problem tabs that each drive their own rig. */
import { $, $$, esc, bootVhs } from '../../assets/vhs.js?v=202610261308';
import { initI18n, t, onLang, getLang } from '../../assets/i18n.js?v=202610261308';
import { COMMON } from '../../assets/i18n-common.js?v=202610261308';
import { renderCode } from '../../assets/code.js?v=202610261308';
import { createPlayer, bindTransport } from '../bfs-dfs/player.js?v=202610261308';
import { DICT } from './i18n.js?v=202610261308';
import { RIGS, PATTERN_IDS, runWithInput } from './rigs.js?v=202610261308';
import { formatField } from './inputs.js?v=202610261308';
import { PROBLEMS, NAMES } from './problems.js?v=202610261308';
import { STATEMENTS } from './statements.js?v=202610261308';

const pad = n => String(n).padStart(2, '0');

/* Shells go in before initI18n so their data-i18n labels are translated with the rest of the page. */
const shell = () => `<div class="panel rig">
    <div class="rig-head">
      <p class="lbl"><span data-i18n="ui.rigTag">RIG · STEP BY STEP</span> · <span class="rig-count"></span></p>
      <div class="rig-name">
        <div class="pick">
          <h3><button type="button" class="pick-btn" aria-haspopup="listbox" aria-expanded="false"><span class="rig-title"></span><span class="pick-arrow" aria-hidden="true">▾</span></button></h3>
          <ul class="pick-list" role="listbox" tabindex="-1" data-i18n-aria="ui.problemsAria" hidden></ul>
        </div>
        <span class="pick-steps"><button type="button" class="btn" data-step="-1" data-i18n-title="ui.prevProblem" data-i18n-aria="ui.prevProblem">◀</button><button type="button" class="btn" data-step="1" data-i18n-title="ui.nextProblem" data-i18n-aria="ui.nextProblem">▶</button></span>
        <span class="rig-meta"></span>
        <p class="rig-fact"></p>
      </div>
    </div>
    <div class="rig-grid">
      <div class="rig-main">
        <div class="crt"><div class="stage"></div></div>
        <div class="transport">
          <button class="btn" data-t="first" data-i18n-title="tr.first" data-i18n-aria="tr.first">|◀</button>
          <button class="btn" data-t="back" data-i18n-title="tr.back" data-i18n-aria="tr.back">◀</button>
          <button class="btn primary" data-t="play">► PLAY</button>
          <button class="btn" data-t="fwd" data-i18n-title="tr.fwd" data-i18n-aria="tr.fwd">▶</button>
          <button class="btn" data-t="end" data-i18n-title="tr.end" data-i18n-aria="tr.end">▶|</button>
          <span class="spd"><span data-i18n="tr.speedLabel">SPEED</span><input type="range" min="1" max="8" value="2" data-i18n-aria="tr.speedAria"><b data-t="sps">2</b><span data-i18n="tr.perSec">/s</span></span>
          <span class="lbl" data-t="pos"></span>
        </div>
        <div class="explanation" aria-live="polite"></div>
        <div class="rig-vars"></div>
      </div>
      <div class="rig-side">
        <div class="itabs" role="tablist">
          <button type="button" class="itab" role="tab" data-pane="task" aria-selected="true" data-i18n="ui.task">Task</button>
          <button type="button" class="itab" role="tab" data-pane="idea" aria-selected="false" tabindex="-1" data-i18n="ui.solution">Solution</button>
          <button type="button" class="itab" role="tab" data-pane="code" aria-selected="false" tabindex="-1" data-i18n="ui.codeTab">C#</button>
          <button type="button" class="itab" role="tab" data-pane="input" aria-selected="false" tabindex="-1" data-i18n="ui.inputTab">Your input</button>
        </div>
        <div class="ibody">
          <div class="ipane rig-task" role="tabpanel" data-pane="task"></div>
          <div class="ipane pinfo" role="tabpanel" data-pane="idea" hidden></div>
          <div class="ipane pcode" role="tabpanel" data-pane="code" hidden><pre class="code"></pre></div>
          <div class="ipane editor" role="tabpanel" data-pane="input" hidden>
            <div class="fields"></div>
            <div class="ed-actions">
              <button type="button" class="btn" data-ed="random" data-i18n="in.random">🎲 Random</button>
              <button type="button" class="btn" data-ed="example" data-i18n="in.example">↺ Example</button>
            </div>
            <p class="ed-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </div>
  </div>`;

$$('[data-probs]').forEach(root => { root.innerHTML = shell(); });

initI18n({ ...COMMON, ...DICT });
bootVhs();

function mountChapter(root) {
  const id = root.dataset.probs;
  const list = $('.pick-list', root), pickBtn = $('.pick-btn', root), info = $('.ipane[data-pane="idea"]', root), title = $('.rig-title', root);
  const count = $('.rig-count', root), fact = $('.rig-fact', root);
  const meta = $('.rig-meta', root), task = $('.rig-task', root);
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

  /* The chapter's problems live in a dropdown on the rig's title: one line instead of a grid of cards. */
  function renderTabs() {
    const texts = t(`${id}.p`), n = PROBLEMS[id].length;
    count.textContent = `${t('ui.problemOf', selected + 1, n)} · ${texts[selected].variant}`;
    list.innerHTML = PROBLEMS[id].map((p, j) => `<li role="option" class="opt${p.diff === 'Hard' ? ' hard' : ''}" id="${id}-opt-${j}" aria-selected="${j === selected}" data-j="${j}">
      <span class="n">${pad(j + 1)}</span><span class="nm">${esc(p.name)}</span><span class="v">${texts[j].variant}</span>
      <span class="meta">#${p.num} · <i class="diff ${p.diff}">${p.diff}</i>${p.must ? ` · <b class="must">${t('ui.hard')}</b>` : ''}</span></li>`).join('');
  }

  let active = 0;
  const setActive = j => {
    active = (j + PROBLEMS[id].length) % PROBLEMS[id].length;
    $$('.opt', list).forEach((o, k) => o.classList.toggle('active', k === active));
    list.setAttribute('aria-activedescendant', `${id}-opt-${active}`);
    $(`#${id}-opt-${active}`, list)?.scrollIntoView({ block: 'nearest' });
  };
  const isOpen = () => !list.hidden;
  function open() {
    list.hidden = false;
    pickBtn.setAttribute('aria-expanded', 'true');
    setActive(selected);
    list.focus();
  }
  function close(refocus = true) {
    if (!isOpen()) return;
    list.hidden = true;
    pickBtn.setAttribute('aria-expanded', 'false');
    if (refocus) pickBtn.focus();
  }

  /* The full statement: what is given and returned, the limits and the rig's own example with its answer. */
  function statement(rigId) {
    const st = STATEMENTS[rigId], text = st?.[getLang()];
    if (!text) return null;
    return `<p>${text.text}</p>
      ${text.limits ? `<p class="st-limits"><span class="lbl">${t('ui.limits')}</span> ${text.limits}</p>` : ''}
      <div class="st-ex"><span class="lbl">${t('ui.example')}</span>
        <code><b>${t('ui.input')}:</b> ${esc(st.ex.in)}</code>
        <code><b>${t('ui.output')}:</b> ${esc(st.ex.out)}</code>
        ${text.note ? `<span class="st-note">${text.note}</span>` : ''}</div>`;
  }

  /* Everything about the problem shares one card beside the rig, a tab each, so the whole problem fits one screen. */
  function renderInfo() {
    const p = PROBLEMS[id][selected], text = t(`${id}.p`)[selected];
    meta.innerHTML = `#${p.num} · <i class="diff ${p.diff}">${p.diff}</i>${p.must ? ` · <b class="must">${t('ui.hard')}</b>` : ''} · <a class="leet" href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener">${t('ui.leet')}</a>`;
    const note = STATEMENTS[p.rig]?.[getLang()]?.fact;
    fact.hidden = !note;
    fact.innerHTML = note ? `<span class="lbl">${t('ui.fact')}</span> ${note}` : '';
    task.innerHTML = statement(p.rig) ?? `<p>${text.task}</p>`;
    info.innerHTML = `<dl>
        <div><dt class="lbl">${t('ui.idea')}</dt><dd>${text.idea}</dd></div>
        <div><dt class="lbl">${t('ui.why')}</dt><dd class="reason">${text.why}</dd></div>
        <div><dt class="lbl">${t('ui.cx')}</dt><dd class="cx">${text.cx}</dd></div>
      </dl>`;
    renderCode($('.pcode pre', root), p.code);
  }

  const itabs = $$('.itab', root), panes = $$('.ipane', root);
  function showPane(name, focus = false) {
    itabs.forEach(tab => {
      const on = tab.dataset.pane === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
      if (on) {
        const bar = tab.parentElement, left = tab.offsetLeft - bar.offsetLeft;
        if (left < bar.scrollLeft || left + tab.offsetWidth > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = left;
      }
    });
    panes.forEach(pane => { pane.hidden = pane.dataset.pane !== name; });
  }
  itabs.forEach(tab => tab.addEventListener('click', () => showPane(tab.dataset.pane)));
  $('.itabs', root).addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const at = itabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    showPane(itabs[(at + step + itabs.length) % itabs.length].dataset.pane, true);
  });

  /* Edited texts per problem survive switching tabs back and forth. */
  const edits = new Map();
  const fields = $('.fields', root), message = $('.ed-msg', root);
  let error = null, timer = 0;
  const textsOf = params => Object.fromEntries(rig.fields.map(f => [f.key, formatField(params[f.key], f)]));
  const fieldId = key => `${id}-in-${key}`;
  const fit = input => { input.style.setProperty('--w', Math.max(6, input.value.length + 2)); };

  function renderFields(texts) {
    fields.innerHTML = rig.fields.map(f => `<label class="fld" for="${fieldId(f.key)}"><span class="fk">${esc(f.key)}</span>
      <input id="${fieldId(f.key)}" data-key="${esc(f.key)}" value="${esc(texts[f.key])}" spellcheck="false" autocomplete="off" autocapitalize="off"></label>`).join('');
    $$('input', fields).forEach(fit);
  }

  function showMessage() {
    $$('input', fields).forEach(input => input.setAttribute('aria-invalid', String(!!error && error.field === input.dataset.key)));
    message.classList.toggle('bad', !!error);
    $('.itab[data-pane="input"]', root).classList.toggle('bad', !!error);
    message.textContent = error
      ? `${error.field ? `${error.field}: ` : ''}${t(...error.error)} ${t('in.stale')}`
      : t('in.hint');
  }

  function apply() {
    clearTimeout(timer);
    const texts = Object.fromEntries($$('input', fields).map(input => [input.dataset.key, input.value]));
    edits.set(selected, texts);
    const result = runWithInput(rig, texts);
    error = result.error ? result : null;
    showMessage();
    if (!error) { run = result.run; player.load(run); }
  }

  function setTexts(texts) {
    renderFields(texts);
    apply();
  }

  fields.addEventListener('input', event => {
    fit(event.target);
    clearTimeout(timer);
    timer = setTimeout(apply, 300);
  });
  fields.addEventListener('keydown', event => { if (event.key === 'Enter') apply(); });
  root.querySelector('[data-ed="random"]').addEventListener('click', () => setTexts(textsOf(rig.random(Math.random))));
  root.querySelector('[data-ed="example"]').addEventListener('click', () => setTexts(textsOf(rig.example)));

  function select(j) {
    selected = j;
    const p = PROBLEMS[id][j];
    rig = RIGS[p.rig];
    title.textContent = p.name;
    renderTabs();
    renderInfo();
    setTexts(edits.get(j) || textsOf(rig.example));
  }

  pickBtn.addEventListener('click', () => (isOpen() ? close() : open()));
  pickBtn.addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step) { event.preventDefault(); select((selected + step + PROBLEMS[id].length) % PROBLEMS[id].length); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); }
  });
  list.addEventListener('click', event => {
    const opt = event.target.closest('.opt');
    if (!opt) return;
    close();
    select(Number(opt.dataset.j));
  });
  list.addEventListener('mousemove', event => {
    const opt = event.target.closest('.opt');
    if (opt && Number(opt.dataset.j) !== active) setActive(Number(opt.dataset.j));
  });
  list.addEventListener('keydown', event => {
    const n = PROBLEMS[id].length;
    const moves = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: n - 1 };
    if (event.key in moves) { event.preventDefault(); setActive(moves[event.key]); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); close(); select(active); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') close(false);
  });
  document.addEventListener('pointerdown', event => { if (isOpen() && !event.target.closest('.pick')?.contains(list)) close(false); });
  root.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () =>
    select((selected + Number(b.dataset.step) + PROBLEMS[id].length) % PROBLEMS[id].length)));
  onLang(() => {
    renderTabs();
    renderInfo();
    showMessage();
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
