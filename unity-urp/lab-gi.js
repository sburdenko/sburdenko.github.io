/** CH.06 probes vs APV and light leaks, CH.07 effect chooser. */
import { $, fitCanvas, fmt } from '../assets/vhs.js?v=202609252015';
import { t } from '../assets/i18n.js?v=202609252015';
import { bindSeg, tile } from '../assets/lab.js?v=202609252015';
import { corridorLight, objectLighting, leakSample, INSIDE, OUTSIDE } from './model-gi.js?v=202609252015';

const shadeOf = v => {
  const k = Math.max(0, Math.min(1, v));
  return `rgb(${Math.round(30 + 225 * k)},${Math.round(24 + 196 * k)},${Math.round(60 + 110 * k)})`;
};

/* ---------------- Probes: per object vs per pixel ---------------- */
export function initProbes() {
  const canvas = $('#probeCanvas'), pos = $('#probePos'), len = $('#probeLen');
  let mode = 'group';
  bindSeg($('#probeMode'), value => { mode = value; render(); });
  [pos, len].forEach(input => input.addEventListener('input', render));
  addEventListener('resize', render);

  function render() {
    const start = +pos.value / 100, length = Math.min(+len.value / 100, 1 - start);
    $('#probePosOut').textContent = `${pos.value}%`;
    $('#probeLenOut').textContent = `${Math.round(length * 100)}%`;
    const result = objectLighting(mode, { start, length, samples: 48 });
    const { c, w, h } = fitCanvas(canvas, 260);
    for (let x = 0; x < w; x += 2) { c.fillStyle = shadeOf(corridorLight(x / w) * 0.55); c.fillRect(x, 0, 2, h); }
    c.fillStyle = '#ffffff'; c.font = '10px JetBrains Mono';
    c.fillText(t('probes.hangar'), 12, h - 12);
    c.textAlign = 'right'; c.fillText(t('probes.outside'), w - 12, h - 12); c.textAlign = 'left';

    result.probes.forEach(p => {
      const x = p * w, y = 44;
      c.fillStyle = shadeOf(corridorLight(p)); c.strokeStyle = '#fff'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill(); c.stroke();
    });

    const top = h * 0.46, height = 54;
    const x0 = start * w, width = length * w;
    result.values.forEach((value, i) => {
      c.fillStyle = shadeOf(value);
      c.fillRect(x0 + (width * i) / result.values.length, top, width / result.values.length + 1, height);
    });
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x0, top, width, height);
    if (mode === 'group') {
      const cx = x0 + width / 2;
      c.strokeStyle = '#ffd23f'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx, 54); c.lineTo(cx, top); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#ffd23f'; c.fillText(t('probes.anchor'), cx + 6, top - 8);
    }
    const truthTop = top + height + 10;
    result.truth.forEach((value, i) => {
      c.fillStyle = shadeOf(value);
      c.fillRect(x0 + (width * i) / result.truth.length, truthTop, width / result.truth.length + 1, 10);
    });
    c.fillStyle = '#bdb3de'; c.fillText(t('probes.truth'), x0, truthTop + 24);
    $('#probeError').textContent = t('probes.error', Math.round(result.error * 100));
    $('#probeExplain').innerHTML = t(`probes.explain.${mode}`);
  }
  render();
  return render;
}

/* ---------------- APV light leak ---------------- */
const FIXES = ['virtualOffset', 'dilation', 'renderingLayers'];

export function initLeak() {
  const canvas = $('#leakCanvas');
  const inputs = { thick: $('#leakThick'), normal: $('#leakNormal'), view: $('#leakView') };
  const fixes = { virtualOffset: false, dilation: false, renderingLayers: false };
  let spacing = 3;
  bindSeg($('#leakSpacing'), value => { spacing = +value; render(); });
  Object.values(inputs).forEach(input => input.addEventListener('input', render));
  $('#leakChecks').addEventListener('click', event => {
    const button = event.target.closest('button[data-k]');
    if (!button) return;
    fixes[button.dataset.k] = !fixes[button.dataset.k];
    render();
  });
  addEventListener('resize', render);

  function render() {
    const labels = t('leak.fixes');
    $('#leakChecks').innerHTML = FIXES.map(key =>
      `<button class="check" data-k="${key}" aria-pressed="${fixes[key]}"><span>${labels[key]}</span><span class="sw">${t(fixes[key] ? 'chk.on' : 'chk.off')}</span></button>`).join('');
    const params = {
      spacing,
      wallThickness: +inputs.thick.value / 10,
      normalBias: +inputs.normal.value / 10,
      viewBias: +inputs.view.value / 10,
      ...fixes,
    };
    $('#leakThickOut').textContent = `${fmt(params.wallThickness, 1)} m`;
    $('#leakNormalOut').textContent = fmt(params.normalBias, 1);
    $('#leakViewOut').textContent = fmt(params.viewBias, 1);
    const r = leakSample(params);

    const { c, w, h } = fitCanvas(canvas, 240);
    const span = 12, px = x => (x / span) * w;
    c.fillStyle = shadeOf(INSIDE * 0.9); c.fillRect(0, 0, px(r.wallStart), h);
    c.fillStyle = shadeOf(OUTSIDE * 0.75); c.fillRect(px(r.wallEnd), 0, w - px(r.wallEnd), h);
    c.fillStyle = '#3a2d58'; c.fillRect(px(r.wallStart), 0, Math.max(3, px(r.wallEnd) - px(r.wallStart)), h);
    c.fillStyle = '#fff'; c.font = '10px JetBrains Mono';
    c.fillText(t('leak.inside'), 10, 16);
    c.textAlign = 'right'; c.fillStyle = '#0b0715'; c.fillText(t('leak.outside'), w - 10, 16); c.textAlign = 'left';

    const probeY = h * 0.45;
    r.probes.forEach(p => {
      if (p.x > span) return;
      const used = r.used.find(u => u.x === p.x);
      c.fillStyle = p.valid || p.dilated ? shadeOf(p.value) : '#000';
      c.strokeStyle = used && used.weight > 0 ? '#ffd23f' : p.valid ? '#fff' : '#ff5c6c';
      c.lineWidth = used && used.weight > 0 ? 3 : 1.5;
      c.beginPath(); c.arc(px(p.x), probeY, 9, 0, Math.PI * 2); c.fill(); c.stroke();
      if (used && used.weight > 0) {
        c.fillStyle = '#ffd23f'; c.textAlign = 'center';
        c.fillText(`${Math.round(used.weight * 100)}%`, px(p.x), probeY - 16); c.textAlign = 'left';
        c.strokeStyle = 'rgba(255,210,63,.6)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(px(p.x), probeY + 10); c.lineTo(px(r.sampleX), h * 0.78); c.stroke();
      }
      if (!p.valid && !p.dilated) { c.fillStyle = '#ff5c6c'; c.textAlign = 'center'; c.fillText('✕', px(p.x), probeY + 4); c.textAlign = 'left'; }
    });
    c.fillStyle = shadeOf(r.value); c.strokeStyle = '#fff'; c.lineWidth = 2;
    c.fillRect(px(r.wallStart) - 26, h * 0.72, 22, 30); c.strokeRect(px(r.wallStart) - 26, h * 0.72, 22, 30);
    c.fillStyle = '#26e3ea'; c.beginPath(); c.arc(px(r.sampleX), h * 0.78, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.fillText(t('leak.pixel'), Math.max(4, px(r.wallStart) - 120), h - 12);

    $('#leakStats').innerHTML = [
      tile(t('leak.truth'), fmt(INSIDE, 2), t('leak.truthD')),
      tile(t('leak.sampled'), fmt(r.value, 2), '', r.leak > 0.05 || r.tooDark ? 'cpu-t' : 'gpu-t'),
      tile(t('leak.error'), r.tooDark ? t('leak.dark') : `${Math.round(r.leak * 100)}%`, t('leak.errorD')),
    ].join('');
    $('#leakExplain').innerHTML = r.tooDark ? t('leak.explainDark') : r.leak > 0.05 ? t('leak.explainLeak') : t('leak.explainOk');
  }
  render();
  return render;
}

/* ---------------- Which effect tool? ---------------- */
const EFFECTS = ['lightFlare', 'brightFlare', 'halo', 'crevices', 'decal', 'highlight', 'seeBehind', 'fullscreen', 'smoke'];

export function initEffects() {
  let selected = 'brightFlare';
  $('#effectsList').addEventListener('click', event => {
    const button = event.target.closest('button[data-e]');
    if (!button) return;
    selected = button.dataset.e;
    render();
  });
  function render() {
    const data = t('effects.items');
    $('#effectsList').innerHTML = EFFECTS.map(key => `<button data-e="${key}" aria-pressed="${key === selected}">${data[key][0]}</button>`).join('');
    const [, tool, steps, cost] = data[selected];
    $('#effectsTool').textContent = tool;
    $('#effectsSteps').innerHTML = steps.map(step => `<li>${step}</li>`).join('');
    $('#effectsCost').innerHTML = cost;
  }
  render();
  return render;
}
