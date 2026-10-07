/**
 * Mounts one rig: editable inputs → Python source → trace → code panel, picture, console, explanation and transport.
 * rig = { id, code: params => string | string, fields, example, random, check, stdin, files, view, notes, hide, maxSteps, problem }
 */
import { $, $$, esc } from '../../assets/vhs.js?v=202610071637';
import { t, onLang, applyTo } from '../../assets/i18n.js?v=202610071637';
import { createPlayer, bindTransport } from '../../algorithms/bfs-dfs/player.js?v=202610071637';
import { runProgram, formatTraceback, MAX_STEPS } from './py/run.js?v=202610071637';
import { renderPyCode } from './py-code.js?v=202610071637';
import { memoryView, currentNames } from './memory-view.js?v=202610071637';
import { structView } from './struct-views.js?v=202610071637';
import { explain } from './explain.js?v=202610071637';
import { parseField, formatField } from './fields.js?v=202610071637';
import { markProblem } from './progress.js?v=202610071637';

const shell = rig => `
  <div class="rig-head"><p class="lbl" data-i18n="py.ui.rigTag">RIG · STEP BY STEP</p><h3 class="rig-title"></h3></div>
  ${rig.fields && rig.fields.length ? `<div class="editor">
    <div class="fields"></div>
    <div class="ed-actions">${rig.random ? `<button type="button" class="btn" data-ed="random" data-i18n="in.random">🎲 Random</button>` : ''}<button type="button" class="btn" data-ed="example" data-i18n="in.example">↺ Example</button></div>
    <p class="ed-msg" aria-live="polite"></p>
  </div>` : ''}
  <div class="py-two${rig.wide ? ' wide' : ''}">
    <div class="py-code"><p class="lbl" data-i18n="py.ui.code">Code</p><div class="code-wrap"></div></div>
    <div class="py-stage"><p class="lbl stage-lbl" data-i18n="py.ui.memory">Memory</p><div class="crt"><div class="stage"></div></div>${rig.view && rig.showMemory ? '<div class="crt mem2"><div class="stage stage-mem"></div></div>' : ''}</div>
  </div>
  <div class="py-vars"><span class="lbl" data-i18n="py.ui.vars">Names right now</span><div class="chips"></div></div>
  <div class="explanation" aria-live="polite"></div>
  <div class="py-console"><p class="lbl" data-i18n="py.ui.console">Console</p><pre class="con"></pre></div>
  <div class="transport">
    <button class="btn" data-t="first" data-i18n-title="tr.first" data-i18n-aria="tr.first">|◀</button>
    <button class="btn" data-t="back" data-i18n-title="tr.back" data-i18n-aria="tr.back">◀</button>
    <button class="btn primary" data-t="play">► PLAY</button>
    <button class="btn" data-t="fwd" data-i18n-title="tr.fwd" data-i18n-aria="tr.fwd">▶</button>
    <button class="btn" data-t="end" data-i18n-title="tr.end" data-i18n-aria="tr.end">▶|</button>
    <span class="spd"><span data-i18n="tr.speedLabel">SPEED</span><input type="range" min="1" max="8" value="2" data-i18n-aria="tr.speedAria"><b data-t="sps">2</b><span data-i18n="tr.perSec">/s</span></span>
    <span class="lbl" data-t="pos"></span>
  </div>
  <div class="py-try"><button type="button" class="btn try" data-try data-i18n="py.ui.try">▶ RUN IT YOURSELF</button><span class="hint" data-i18n="py.ui.tryHint"></span><div class="repl-slot"></div></div>`;

export const sourceOf = (rig, params) => (typeof rig.code === 'function' ? rig.code(params) : rig.code);

export function mountRig(root, rig, { tape = '', titles = {} } = {}) {
  root.classList.add('pyrig');
  root.id = root.id || `rig-${rig.id}`;
  root.innerHTML = shell(rig);
  applyTo(root);
  const codeWrap = $('.code-wrap', root), stage = $('.stage', root), stageMem = $('.stage-mem', root), con = $('.con', root);
  const explanation = $('.explanation', root), chips = $('.chips', root), title = $('.rig-title', root), stageLbl = $('.stage-lbl', root);
  const fields = $('.fields', root), message = $('.ed-msg', root), replSlot = $('.repl-slot', root);
  let run = null, params = rig.example ? { ...rig.example } : {}, frame = null, error = null, timer = 0, ownInput = false;

  const player = createPlayer(paint);
  const sync = bindTransport($('.transport', root), player);

  function setTitle() {
    const key = `rig.${rig.id}.title`;
    const text = t(key);
    title.textContent = text !== key ? text : (titles[rig.id] || rig.title || rig.id);
    if (rig.view) stageLbl.textContent = t(`rig.${rig.id}.stage`) !== `rig.${rig.id}.stage` ? t(`rig.${rig.id}.stage`) : (rig.view.label || t('py.ui.memory'));
  }

  function paint(next) {
    frame = next;
    if (!run) return;
    const event = run.events[next.index], prev = run.events[next.index - 1];
    const marks = event.kind === 'error' ? { [event.line]: 'err' } : {};
    for (const tb of event.traceback || []) if (tb.line !== event.line) marks[tb.line] = 'err-path';
    codeWrap.innerHTML = renderPyCode(run.src, { current: event.line, prev: prev ? prev.line : 0, marks });
    scrollToLine(codeWrap);
    const memOpts = { prev: prev ? prev.mem : null, touched: event.touched, hide: rig.hide || [], labels: { globals: t('py.ui.globals') } };
    if (rig.view) {
      stage.innerHTML = structView(rig.view, event.mem, event, run);
      if (stageMem) stageMem.innerHTML = memoryView(event.mem, memOpts);
    } else stage.innerHTML = memoryView(event.mem, memOpts);
    const names = currentNames(event.mem, rig.hide || []);
    chips.innerHTML = names.length ? names.map(([n, o]) => `<span class="vchip${o && !o.immutable ? ' mut' : ''}"><b>${esc(n)}</b> = ${esc(shortValue(o))}</span>`).join('') : `<span class="vchip empty">${t('py.ui.noVars')}</span>`;
    explanation.innerHTML = explain(event, rig) || '&nbsp;';
    const out = event.out || '';
    con.innerHTML = (out ? esc(out) : `<span class="dim">${t('py.ui.consoleEmpty')}</span>`) + (event.kind === 'error' ? `<span class="tb">${esc(formatTraceback(run.error))}</span>` : '');
    con.scrollTop = con.scrollHeight;
    sync(next);
    if (next.index === next.total - 1 && rig.problem && tape && ownInput) markProblem(tape, rig.problem);
  }

  function load() {
    const src = sourceOf(rig, params);
    const inputs = rig.stdin ? (typeof rig.stdin === 'function' ? rig.stdin(params) : (params[rig.stdin] ?? [])) : [];
    const result = runProgram(src, { inputs, maxSteps: rig.maxSteps ?? MAX_STEPS, files: rig.files ? (typeof rig.files === 'function' ? rig.files(params) : rig.files) : {}, recursionLimit: rig.recursionLimit ?? 1000 });
    if (result.error && result.error.type === 'StepLimit') { error = { error: ['py.ui.tooBig', rig.maxSteps ?? MAX_STEPS], field: null }; showMessage(); return false; }
    if (result.error && result.error.internal) { console.error(result.error); }
    run = { ...result, src };
    player.load(run);
    if (rig.start === 'end') player.toEnd();
    return true;
  }

  /* ---------- editable fields ---------- */
  const textsOf = p => Object.fromEntries((rig.fields || []).map(f => [f.key, formatField(p[f.key], f)]));
  const fit = input => input.style.setProperty('--w', Math.max(6, input.value.length + 2));
  function renderFields(texts) {
    if (!fields) return;
    fields.innerHTML = rig.fields.map(f => `<label class="fld" for="${root.id}-${f.key}"><span class="fk">${esc(f.label || f.key)}</span><input id="${root.id}-${f.key}" data-key="${esc(f.key)}" value="${esc(texts[f.key])}" spellcheck="false" autocomplete="off" autocapitalize="off"></label>`).join('');
    $$('input', fields).forEach(fit);
  }
  function showMessage() {
    if (!message) return;
    $$('input', fields).forEach(input => input.setAttribute('aria-invalid', String(!!error && error.field === input.dataset.key)));
    message.classList.toggle('bad', !!error);
    message.textContent = error ? `${error.field ? `${error.field}: ` : ''}${t(...error.error)} ${t('in.stale')}` : t('in.hint');
  }
  function apply() {
    clearTimeout(timer);
    if (!rig.fields || !rig.fields.length) { error = null; load(); return; }
    const texts = Object.fromEntries($$('input', fields).map(input => [input.dataset.key, input.value]));
    const next = {};
    error = null;
    for (const spec of rig.fields) {
      const parsed = parseField(texts[spec.key] ?? '', spec);
      if (parsed.error) { error = { error: parsed.error, field: spec.key }; break; }
      next[spec.key] = parsed.value;
    }
    if (!error && rig.check) { const cross = rig.check(next); if (cross) error = { error: cross, field: null }; }
    if (!error) { params = next; if (!load()) return; }
    showMessage();
  }
  function setTexts(texts) { renderFields(texts); apply(); }
  if (fields) {
    fields.addEventListener('input', event => { fit(event.target); ownInput = true; clearTimeout(timer); timer = setTimeout(apply, 300); });
    fields.addEventListener('keydown', event => { if (event.key === 'Enter') apply(); });
    $('[data-ed="random"]', root)?.addEventListener('click', () => { ownInput = true; setTexts(textsOf(rig.random(Math.random))); });
    $('[data-ed="example"]', root).addEventListener('click', () => setTexts(textsOf(rig.example)));
  }

  /* ---------- try it yourself ---------- */
  $('[data-try]', root).addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    const { mountRepl } = await import('./repl.js?v=202609271602');
    const inputs = rig.stdin ? (typeof rig.stdin === 'function' ? rig.stdin(params) : (params[rig.stdin] ?? [])) : [];
    mountRepl(replSlot, { code: sourceOf(rig, params), stdin: inputs, files: run ? run.files : {} });
  });

  onLang(() => { setTitle(); showMessage(); if (frame && run) paint(frame); });
  setTitle();
  if (rig.fields && rig.fields.length) setTexts(textsOf(rig.example)); else apply();
  return { reload: apply, player };
}

function shortValue(o) {
  if (!o) return '?';
  if (o.value !== undefined && o.type !== 'function') return o.value.length > 18 ? o.value.slice(0, 17) + '…' : o.value;
  if (o.type === 'function') return `${o.name}()`;
  if (o.type === 'class') return `class ${o.name}`;
  if (o.type === 'instance') return `${o.cls}(…)`;
  if (o.items) return `${o.type}[${o.length}]`;
  if (o.entries) return `${o.type}{${o.length}}`;
  return o.type;
}

function scrollToLine(wrap) {
  const pre = $('pre', wrap), cur = $('.ln.cur', wrap);
  if (!pre || !cur) return;
  const top = cur.offsetTop - pre.clientHeight / 2 + cur.offsetHeight / 2;
  if (Math.abs(pre.scrollTop - top) > 4) pre.scrollTop = Math.max(0, top);
}

/** Mounts every `[data-rig]` placeholder inside `container` from the given rig list. */
export function mountRigs(container, rigs, ctx) {
  const byId = new Map(rigs.map(r => [r.id, r]));
  return $$('[data-rig]', container).map(el => {
    const rig = byId.get(el.dataset.rig);
    if (!rig) { el.innerHTML = `<p class="toast">missing rig ${esc(el.dataset.rig)}</p>`; return null; }
    return mountRig(el, rig, ctx);
  }).filter(Boolean);
}
