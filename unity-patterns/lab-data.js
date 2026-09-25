/** CH.08 MVP/MVVM, CH.10 Flyweight, CH.11 Dirty Flag. */
import { $, fitCanvas, bytes, fmtI, RM } from '../assets/vhs.js?v=202609241230';
import { t } from '../assets/i18n.js?v=202609241230';
import { bindSeg, isPressed, togglePressed, tile, visibleLoop } from '../assets/lab.js?v=202609241230';
import { renderCode } from '../assets/code.js?v=202609241230';
import { SNIPPETS } from './snippets.js?v=202609241230';
import {
  MAX_HEALTH, createHealth, healthAction, healthStatus, UNIT_FIELDS, flyweightMemory, editBaseAttack,
  SECTOR_GRID, createSectors, sectorsTick, playerOnPath, opSequence, lazyRecalc,
} from './model-data.js?v=202609241230';

/* ---------------- MVP / MVVM ---------------- */
const LABELS = ['Tank', 'Scout', 'Medic', 'Sniper'];

export function initUi() {
  let mode = 'mvp', health = createHealth(), steps = [], timers = [], labelIndex = 0;
  bindSeg($('#uiMode'), value => { mode = value; health = createHealth(); labelIndex = 0; steps = []; render(); });

  function renderView() {
    const { view } = health;
    const ratio = view.current / MAX_HEALTH;
    $('#uiLabel').textContent = view.label;
    $('#uiValue').textContent = view.current;
    const status = healthStatus(view.current);
    $('#uiStatus').textContent = t(`ui.status.${status}`);
    const color = `rgb(${Math.round(255 * (1 - ratio))},${Math.round(220 * ratio)},90)`;
    $('#uiStatus').style.color = color;
    $('#uiBar').style.width = `${ratio * 100}%`;
    $('#uiBar').style.backgroundColor = color;
  }

  function render(activeCount = steps.length, stale = false) {
    renderView();
    $('#uiStale').hidden = !stale;
    $('#uiSteps').innerHTML = steps.length
      ? steps.map((key, i) => `<li class="${i < activeCount ? 'on' : ''} ${key.endsWith('noEvent') && i < activeCount ? 'warn' : ''}"><span>${t('ui.' + key)}</span></li>`).join('')
      : `<li><span>${t('ui.idle')}</span></li>`;
    $('#uiCompare').innerHTML = t('ui.compareRows').map(([what, mvp, mvvm]) => `<tr><td>${what}</td><td>${mvp}</td><td>${mvvm}</td></tr>`).join('');
    renderCode($('#uiCode'), mode === 'mvp' ? SNIPPETS.mvp : SNIPPETS.mvvm);
  }

  function run(action) {
    timers.forEach(clearTimeout);
    const result = healthAction(health, mode, action);
    health = result.state;
    steps = result.steps;
    const delay = RM ? 0 : 280;
    steps.forEach((_, i) => timers.push(setTimeout(() => render(i + 1, result.stale && i === steps.length - 1), i * delay)));
    render(0, false);
  }

  $('#uiDamage').onclick = () => run({ type: 'damage', amount: 15 });
  $('#uiRestore').onclick = () => run({ type: 'restore' });
  $('#uiRename').onclick = () => { labelIndex = (labelIndex + 1) % LABELS.length; run({ type: 'rename', label: LABELS[labelIndex] }); };
  render();
  return () => render(steps.length, health.view.label !== health.model.label);
}

/* ---------------- Flyweight ---------------- */
export function initFlyweight() {
  const units = $('#flyUnits');
  let shared = new Set(UNIT_FIELDS.filter(f => f.shareable).map(f => f.id));
  let editResult = null;

  $('#flyFields').addEventListener('click', event => {
    const button = event.target.closest('button[data-f]');
    if (!button || button.disabled) return;
    const id = button.dataset.f;
    shared = new Set(shared.has(id) ? [...shared].filter(item => item !== id) : [...shared, id]);
    editResult = null;
    render();
  });
  units.addEventListener('input', () => { editResult = null; render(); });
  $('#flyEdit').onclick = () => { editResult = editBaseAttack(+units.value, shared.has('baseStats')); render(); };

  function render() {
    const count = +units.value;
    $('#flyUnitsOut').textContent = fmtI(count);
    $('#flyFields').innerHTML = UNIT_FIELDS.map(field => `
      <button class="check" data-f="${field.id}" aria-pressed="${field.shareable && shared.has(field.id)}" ${field.shareable ? '' : 'disabled'}>
        <span>${field.id}<span class="ty">${field.type} · ${bytes(field.bytes)}</span></span>
        <span class="sw">${field.shareable ? (shared.has(field.id) ? 'FactionData' : t('fly.perUnit')) : t('fly.always')}</span>
      </button>`).join('');
    const memory = flyweightMemory({ units: count, shared: [...shared] });
    const max = Math.max(memory.duplicated, 1);
    $('#flyBars').innerHTML = `
      <div class="mb"><div class="top"><span>${t('fly.barCopy', bytes(memory.perUnitDuplicated))}</span><b>${bytes(memory.duplicated)}</b></div>
        <div class="track"><i style="width:${memory.duplicated / max * 100}%;background:var(--bad)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('fly.barFly', bytes(memory.perUnitFlyweight), bytes(memory.sharedBytes))}</span><b>${bytes(memory.flyweight)}</b></div>
        <div class="track"><i style="width:${Math.max(0.5, memory.flyweight / max * 100)}%;background:var(--ok)"></i></div></div>`;
    $('#flyBreakdown').innerHTML = UNIT_FIELDS.filter(f => f.shareable && shared.has(f.id)).map(field =>
      `<tr><td>${field.id}</td><td>${t('fly.storage.' + field.storage)}</td><td>${bytes(memory.savedByField[field.id])}</td></tr>`).join('')
      || `<tr><td colspan="3">${t('fly.nothingShared')}</td></tr>`;
    $('#flyEditOut').innerHTML = editResult ? t('fly.editOut', editResult) : '';
  }

  renderCode($('#flyCode'), SNIPPETS.flyweight);
  render();
  return render;
}

/* ---------------- Dirty flag: sectors ---------------- */
export function initDirty() {
  const canvas = $('#dirtyCanvas'), radius = $('#dirtyRadius'), play = $('#dirtyPlay');
  let dirtySectors, naiveSectors, totals, frame, pathT, flashes;

  function reset() {
    dirtySectors = createSectors();
    naiveSectors = createSectors();
    totals = { naive: 0, dirty: 0, checks: 0 };
    frame = 0; pathT = 0; flashes = {};
    tick(0);
  }

  function tick(dt) {
    if (dt && isPressed(play)) {
      pathT = (pathT + dt / 14) % 1;
      frame++;
      const player = playerOnPath(pathT), r = +radius.value / 100;
      const a = sectorsTick(dirtySectors, player, r, false);
      const b = sectorsTick(naiveSectors, player, r, true);
      a.sectors.forEach(s => { if (s.dirty) flashes[s.id] = frame + 20; });
      dirtySectors = a.sectors; naiveSectors = b.sectors;
      totals = { naive: totals.naive + b.expensive, dirty: totals.dirty + a.expensive, checks: totals.checks + a.checks };
    }
    draw();
    renderBars();
  }

  function draw() {
    const { c, w, h } = fitCanvas(canvas, 360);
    const size = Math.min(w, h - 40) - 10, cell = size / SECTOR_GRID;
    const ox = (w - size) / 2, oy = 36;
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    dirtySectors.forEach(sector => {
      const x = ox + (sector.id % SECTOR_GRID) * cell, y = oy + Math.floor(sector.id / SECTOR_GRID) * cell;
      const flashing = (flashes[sector.id] ?? 0) > frame;
      c.fillStyle = flashing ? 'rgba(255,210,63,.35)' : sector.loaded ? 'rgba(93,252,154,.18)' : '#120b20';
      c.fillRect(x + 3, y + 3, cell - 6, cell - 6);
      c.strokeStyle = flashing ? '#ffd23f' : sector.loaded ? '#5dfc9a' : '#2a2046';
      c.lineWidth = flashing ? 2 : 1;
      c.strokeRect(x + 3, y + 3, cell - 6, cell - 6);
      c.fillStyle = sector.loaded ? '#bfffd6' : '#8c82b0';
      c.font = '600 11px JetBrains Mono';
      c.fillText(`Sector ${sector.id}`, x + 10, y + 20);
      c.font = '10px JetBrains Mono';
      c.fillText(sector.loaded ? 'IsLoaded' : 'unloaded', x + 10, y + 34);
      if (flashing) { c.fillStyle = '#ffd23f'; c.fillText(sector.loaded ? 'LoadContent()' : 'UnloadContent()', x + 10, y + 48); }
    });
    const player = playerOnPath(pathT);
    const px = ox + player.x * cell, py = oy + player.y * cell;
    c.strokeStyle = 'rgba(38,227,234,.5)'; c.setLineDash([5, 5]);
    c.beginPath(); c.arc(px, py, +radius.value / 100 * cell, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ff3ea5'; c.beginPath(); c.arc(px, py, 8, 0, Math.PI * 2); c.fill();
    $('#dirtyFrame').textContent = `F ${frame}`;
  }

  function renderBars() {
    $('#dirtyRadiusOut').textContent = (+radius.value / 100).toFixed(2);
    const max = Math.max(1, totals.naive);
    $('#dirtyBars').innerHTML = `
      <div class="mb"><div class="top"><span>${t('dirty.barChecks')}</span><b>${fmtI(totals.checks)}</b></div>
        <div class="track"><i style="width:${totals.checks / max * 100}%;background:var(--gpu)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('dirty.barNaive')}</span><b>${fmtI(totals.naive)}</b></div>
        <div class="track"><i style="width:${totals.naive / max * 100}%;background:var(--bad)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('dirty.barDirty')}</span><b>${fmtI(totals.dirty)}</b></div>
        <div class="track"><i style="width:${Math.max(0.4, totals.dirty / max * 100)}%;background:var(--ok)"></i></div></div>`;
  }

  play.onclick = () => { const on = togglePressed(play); play.textContent = t(on ? 'dirty.pause' : 'dirty.play'); };
  $('#dirtyReset').onclick = reset;
  radius.addEventListener('input', renderBars);
  reset();
  visibleLoop(canvas, tick);
  renderCode($('#dirtyCode'), SNIPPETS.dirty);
  return () => { play.textContent = t(isPressed(play) ? 'dirty.pause' : 'dirty.play'); renderBars(); draw(); };
}

/* ---------------- Dirty flag: lazy derived value ---------------- */
export function initLazy() {
  const share = $('#lazyShare');
  function render() {
    const ops = opSequence(120, +share.value / 100);
    const result = lazyRecalc(ops);
    const reads = ops.filter(op => op === 'read').length;
    $('#lazyShareOut').textContent = `${share.value}%`;
    $('#lazyOps').innerHTML = result.marks.map(mark => `<i class="${mark}" title="${mark}"></i>`).join('');
    $('#lazyStats').innerHTML = [
      tile(t('lazy.eager'), result.eager, t('lazy.eagerD'), 'cpu-t'),
      tile(t('lazy.lazy'), result.lazy, t('lazy.lazyD', reads), 'gpu-t'),
      tile(t('lazy.saved'), result.eager - result.lazy, t('lazy.savedD')),
    ].join('');
  }
  share.addEventListener('input', render);
  renderCode($('#lazyCode'), SNIPPETS.dirtyLazy);
  render();
  return render;
}
