/** CH.10 volumes, CH.11 STP + PSO, CH.12 diagnostics, CH.13 cheat sheet and interview. */
import { $, fitCanvas, fmt, fmtI } from '../assets/vhs.js?v=202609241230';
import { t } from '../assets/i18n.js?v=202609241230';
import { bindSeg, isPressed, togglePressed, tile, visibleLoop } from '../assets/lab.js?v=202609241230';
import { renderCode } from '../assets/code.js?v=202609241230';
import { SNIPPETS } from './snippets.js?v=202609241230';
import { blendVolumes } from './model-gi.js?v=202609241230';
import { renderScaleModel, dpiRenderScale, jitter, psoFrames, PSO_TIMELINE, SYMPTOMS } from './model-output.js?v=202609241230';

/* ---------------- Volume blending ---------------- */
export function initVolume() {
  const canvas = $('#volumeCanvas');
  const inputs = { cam: $('#volCam'), gWeight: $('#volGWeight'), lWeight: $('#volLWeight'), blend: $('#volBlend'), priority: $('#volPriority') };
  const override = $('#volOverride');
  Object.values(inputs).forEach(input => input.addEventListener('input', render));
  override.onclick = () => { togglePressed(override); render(); };
  addEventListener('resize', render);

  function render() {
    const cameraX = +inputs.cam.value;
    const volumes = [
      { id: 'global', global: true, priority: 0, weight: +inputs.gWeight.value / 100, value: 0.2, override: true },
      { id: 'local', global: false, priority: +inputs.priority.value, weight: +inputs.lWeight.value / 100, value: 0.65, override: isPressed(override), min: 40, max: 70, blendDistance: +inputs.blend.value },
    ];
    const result = blendVolumes(0, volumes, cameraX);
    $('#volCamOut').textContent = `${cameraX} m`;
    $('#volGWeightOut').textContent = fmt(+inputs.gWeight.value / 100, 2);
    $('#volLWeightOut').textContent = fmt(+inputs.lWeight.value / 100, 2);
    $('#volBlendOut').textContent = `${inputs.blend.value} m`;
    $('#volPriorityOut').textContent = inputs.priority.value;
    $('#volValue').textContent = fmt(result.value, 2);

    const { c, w, h } = fitCanvas(canvas, 240);
    const px = x => 20 + (x / 100) * (w - 40);
    const grad = c.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2b2a6e'); grad.addColorStop(0.55, '#ff8c80'); grad.addColorStop(1, '#1f1432');
    c.fillStyle = grad; c.fillRect(0, 0, w, h);
    const blend = +inputs.blend.value;
    c.fillStyle = 'rgba(38,227,234,.12)'; c.fillRect(px(40 - blend), 30, px(70 + blend) - px(40 - blend), h - 70);
    c.fillStyle = 'rgba(38,227,234,.22)'; c.fillRect(px(40), 30, px(70) - px(40), h - 70);
    c.strokeStyle = '#26e3ea'; c.setLineDash([5, 4]); c.strokeRect(px(40), 30, px(70) - px(40), h - 70); c.setLineDash([]);
    c.fillStyle = '#fff'; c.font = '10px JetBrains Mono';
    c.fillText(t('volume.local'), px(40) + 6, 46);
    c.fillStyle = '#ff3ea5'; c.beginPath(); c.moveTo(px(cameraX), h - 36); c.lineTo(px(cameraX) - 9, h - 18); c.lineTo(px(cameraX) + 9, h - 18); c.fill();
    const vignette = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, `rgba(0,0,0,${Math.min(0.95, result.value * 1.4)})`);
    c.fillStyle = vignette; c.fillRect(0, 0, w, h);

    const names = t('volume.names');
    $('#volTrace').innerHTML = `<li class="on"><span>${t('volume.default')}</span></li>` + result.trace.map(step =>
      `<li class="${step.skipped ? '' : 'on'}"><span>${step.skipped ? t(`volume.skip.${step.skipped}`, names[step.id]) : t('volume.apply', names[step.id], fmt(step.factor, 2))}</span></li>`).join('');
  }
  renderCode($('#volumeCode'), SNIPPETS.volumeCode);
  renderCode($('#stackCode'), SNIPPETS.stackCode);
  render();
  return render;
}

/* ---------------- STP: internal resolution and temporal accumulation ---------------- */
function drawTestScene(c, w, h, offsetX = 0, offsetY = 0) {
  c.fillStyle = '#10102c'; c.fillRect(0, 0, w, h);
  c.save();
  c.translate(offsetX, offsetY);
  c.fillStyle = '#26e3ea';
  c.beginPath(); c.arc(w * 0.28, h * 0.5, h * 0.3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#ff3ea5'; c.lineWidth = Math.max(1, w / 220);
  for (let i = 0; i < 9; i++) {
    c.beginPath(); c.moveTo(w * 0.55, h * (0.15 + i * 0.08)); c.lineTo(w * 0.95, h * (0.1 + i * 0.1)); c.stroke();
  }
  c.fillStyle = '#ffd23f';
  c.font = `700 ${Math.round(h * 0.16)}px JetBrains Mono`;
  c.fillText('URP', w * 0.56, h * 0.95);
  c.restore();
}

export function initStp() {
  const internal = $('#stpInternal'), output = $('#stpOutputCanvas');
  const scale = $('#stpScale'), dpi = $('#stpDpi');
  let outputKey = '1080p', filter = 'stp', frame = 0, history = null, key = '';
  bindSeg($('#stpOutput'), value => { outputKey = value; reset(); });
  bindSeg($('#stpFilter'), value => { filter = value; reset(); });
  scale.addEventListener('input', reset);
  dpi.addEventListener('input', renderStats);
  $('#stpUseDpi').onclick = () => { scale.value = Math.round(dpiRenderScale(+dpi.value) * 100); reset(); };
  const low = document.createElement('canvas');
  const hi = document.createElement('canvas');

  function reset() { frame = 0; history = null; renderStats(); }

  function renderStats() {
    const model = renderScaleModel({ output: outputKey, scale: +scale.value / 100 });
    $('#stpScaleOut').textContent = fmt(+scale.value / 100, 2);
    $('#stpDpiOut').textContent = `${dpi.value} dpi → ${fmt(dpiRenderScale(+dpi.value), 2)}`;
    $('#stpStats').innerHTML = [
      tile(t('stp.internalRes'), `${model.internalW}×${model.internalH}`),
      tile(t('stp.outputRes'), `${model.w}×${model.h}`),
      tile(t('stp.pixels'), `${fmt(model.pixelShare * 100, 1)}%`, t('stp.pixelsD', fmtI(model.internalPixels))),
      tile(t('stp.frames'), filter === 'stp' ? Math.min(frame, 32) : '—', t('stp.framesD')),
    ].join('');
    $('#stpCaption').textContent = t(filter === 'stp' ? 'stp.captionStp' : 'stp.captionBilinear');
  }

  function step() {
    const { c: ic, w: iw, h: ih } = fitCanvas(internal, 200);
    const { c: oc, w: ow, h: oh } = fitCanvas(output, 200);
    const s = +scale.value / 100;
    const lw = Math.max(8, Math.round(ow * s / 3)), lh = Math.max(5, Math.round(oh * s / 3));
    const currentKey = `${ow}x${oh}:${lw}x${lh}:${filter}`;
    if (currentKey !== key) { key = currentKey; frame = 0; history = null; }
    low.width = lw; low.height = lh;
    const lc = low.getContext('2d');
    const [jx, jy] = filter === 'stp' ? jitter(frame) : [0, 0];
    lc.imageSmoothingEnabled = true;
    drawTestScene(lc, lw, lh, jx, jy);

    ic.imageSmoothingEnabled = false;
    ic.clearRect(0, 0, iw, ih);
    ic.drawImage(low, 0, 0, iw, ih);

    if (hi.width !== Math.round(ow) || hi.height !== Math.round(oh)) { hi.width = Math.round(ow); hi.height = Math.round(oh); }
    const hc = hi.getContext('2d');
    hc.imageSmoothingEnabled = filter !== 'stp';
    hc.drawImage(low, -jx * (ow / lw), -jy * (oh / lh), ow, oh);
    if (filter !== 'stp') {
      oc.drawImage(hi, 0, 0, ow, oh);
    } else {
      if (!history) { history = document.createElement('canvas'); history.width = hi.width; history.height = hi.height; history.getContext('2d').drawImage(hi, 0, 0); }
      const n = Math.min(frame + 1, 32);
      const hctx = history.getContext('2d');
      hctx.globalAlpha = 1 / n;
      hctx.drawImage(hi, 0, 0);
      hctx.globalAlpha = 1;
      oc.drawImage(history, 0, 0, ow, oh);
    }
    frame++;
    if (frame % 8 === 1) renderStats();
  }

  visibleLoop(output, dt => { if (dt) step(); });
  renderStats();
  return renderStats;
}

/* ---------------- PSO warm-up timeline ---------------- */
export function initPso() {
  const canvas = $('#psoCanvas');
  let strategy = 'none';
  bindSeg($('#psoStrategy'), value => { strategy = value; render(); });
  $('#psoCached').onclick = () => { togglePressed($('#psoCached')); render(); };
  addEventListener('resize', render);

  function render() {
    const cached = isPressed($('#psoCached'));
    const result = psoFrames({ strategy, cached });
    const { c, w, h } = fitCanvas(canvas, 240);
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    const total = result.frames.at(-1).time + result.frames.at(-1).ms / 1000;
    const maxMs = 500, py = ms => h - 24 - (Math.min(ms, maxMs) / maxMs) * (h - 40);
    const loadEnd = result.frames.filter(f => f.phase === 'load').reduce((s, f) => s + f.ms / 1000, 0);
    c.fillStyle = 'rgba(122,44,255,.18)'; c.fillRect(0, 0, (loadEnd / total) * w, h - 24);
    c.fillStyle = '#bdb3de'; c.font = '10px JetBrains Mono';
    c.fillText(t('pso.loading'), 8, 14);
    c.fillText(t('pso.gameplay'), (loadEnd / total) * w + 8, 14);
    [16.7, 33.3, 100].forEach(ms => {
      c.strokeStyle = ms < 20 ? 'rgba(93,252,154,.4)' : 'rgba(255,177,61,.35)'; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(0, py(ms)); c.lineTo(w, py(ms)); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#8c82b0'; c.fillText(`${ms} ms`, w - 56, py(ms) - 3);
    });
    result.frames.forEach(frame => {
      const x = (frame.time / total) * w;
      c.fillStyle = frame.ms > 100 ? '#ff5c6c' : frame.ms > 20 ? '#ffb13d' : frame.phase === 'load' ? '#a77bff' : '#5dfc9a';
      c.fillRect(x, py(frame.ms), Math.max(1, (frame.ms / 1000 / total) * w), h - 24 - py(frame.ms));
    });
    PSO_TIMELINE.firstUse.forEach(item => {
      const x = ((item.at - PSO_TIMELINE.loadEnd + loadEnd) / total) * w;
      c.fillStyle = '#ffd23f'; c.fillRect(x - 1, h - 22, 2, 8);
    });
    c.fillStyle = '#ffd23f'; c.fillText(t('pso.markers'), 8, h - 6);

    $('#psoStats').innerHTML = [
      tile(t('pso.load'), `${fmt(result.loadSeconds, 2)} s`),
      tile(t('pso.worst'), `${fmt(result.worst, 0)} ms`, '', result.worst > 33 ? 'cpu-t' : 'gpu-t'),
      tile(t('pso.spikes'), result.spikes),
    ].join('');
    $('#psoOut').innerHTML = `${t('pso.explain')[strategy]}${cached ? ` ${t('pso.cachedNote')}` : ''}`;
  }
  renderCode($('#psoCode'), SNIPPETS.pso);
  render();
  return render;
}

/* ---------------- Diagnostic router ---------------- */
export function initDiagnostics() {
  let selected = SYMPTOMS[0];
  $('#diagList').addEventListener('click', event => {
    const button = event.target.closest('button[data-s]');
    if (!button) return;
    selected = button.dataset.s;
    render();
  });
  function render() {
    const data = t('perf.symptoms');
    $('#diagList').innerHTML = SYMPTOMS.map(key => `<button data-s="${key}" aria-pressed="${key === selected}">${data[key][0]}</button>`).join('');
    const [, tool, first, steps] = data[selected];
    $('#diagTool').textContent = tool;
    $('#diagFirst').innerHTML = first;
    $('#diagSteps').innerHTML = steps.map(item => `<li>${item}</li>`).join('');
  }
  render();
  return render;
}

/* ---------------- Cheat sheet and interview ---------------- */
const CATEGORIES = ['all', 'setup', 'lighting', 'shaders', 'graph', 'post', 'perf'];

export function initInterview() {
  let category = 'all';
  const filters = $('#qaFilters');
  filters.innerHTML = CATEGORIES.map((key, i) => `<button data-v="${key}" aria-pressed="${i === 0}"></button>`).join('');
  bindSeg(filters, value => { category = value; render(); });
  function render() {
    $('#cheatBody').innerHTML = t('cheat.rows').map(([q, start, verify]) => `<tr><td>${q}</td><td>${start}</td><td>${verify}</td></tr>`).join('');
    const names = t('qa.categories');
    [...filters.children].forEach(button => { button.textContent = names[button.dataset.v]; });
    const items = t('qa.items').filter(item => category === 'all' || item.c === category);
    $('#qaCount').textContent = t('qa.count', items.length);
    $('#qa').innerHTML = items.map((item, i) =>
      `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${item.q}</span></summary><div class="a">${item.a}</div></details>`).join('');
  }
  render();
  return render;
}
