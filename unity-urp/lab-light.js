/** CH.04 shadows + atlas, CH.05 mixed lighting + rendering layers. */
import { $, fitCanvas, clamp, fmt } from '../assets/vhs.js?v=202609162304';
import { t } from '../assets/i18n.js?v=202609162304';
import { bindSeg, isPressed, togglePressed, tile } from '../assets/lab.js?v=202609162304';
import { renderCode } from '../assets/code.js?v=202609162304';
import { SNIPPETS } from './snippets.js?v=202609162304';
import {
  shadowBudget, cascadeSplits, atlasLayout, LIGHT_MODES, MODE_MATRIX, characterInPillarShadow,
  LAYERS, layerMask, lightAffects,
} from './model-light.js?v=202609162304';

/* ---------------- Main light shadows ---------------- */
export function initShadows() {
  const controls = { distance: $('#shadowDistance'), resolution: $('#shadowResolution'), cascades: $('#cascades'), soft: $('#softToggle') };
  const canvas = $('#shadowCanvas');
  const PALETTE = ['#ff3ea5', '#8a4dff', '#26e3ea', '#5dfc9a'];
  const OBJECTS = [
    { meters: 8, lane: -0.42, color: '#ff5ca8' },
    { meters: 45, lane: 0.34, color: '#8a7dff' },
    { meters: 120, lane: -0.18, color: '#26e3ea' },
  ];

  const state = () => ({
    distance: +controls.distance.value,
    resolution: 2 ** +controls.resolution.value,
    cascades: +controls.cascades.value,
    soft: isPressed(controls.soft),
    spotLights: 0,
    pointLights: 0,
  });

  function paint() {
    const s = state();
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 320 : 400);
    const horizon = h * 0.3, bottom = h * 0.93, center = w * 0.53, depth = 200;
    const splits = cascadeSplits(s.distance, s.cascades);
    const screenY = m => bottom - Math.sqrt(clamp(m / depth, 0, 1)) * (bottom - horizon);
    const halfWidth = y => 42 + clamp((y - horizon) / (bottom - horizon), 0, 1) * (w * 0.48 - 42);
    const band = (near, far) => {
      const ny = screenY(near), fy = screenY(far), nw = halfWidth(ny), fw = halfWidth(fy);
      c.beginPath(); c.moveTo(center - nw, ny); c.lineTo(center + nw, ny); c.lineTo(center + fw, fy); c.lineTo(center - fw, fy); c.closePath();
    };
    const sky = c.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#100d35'); sky.addColorStop(0.6, '#593064'); sky.addColorStop(1, '#ed8178');
    c.fillStyle = sky; c.fillRect(0, 0, w, horizon);
    c.fillStyle = '#100b1d'; c.fillRect(0, horizon, w, h - horizon);
    band(0, depth); c.fillStyle = '#4a3f78'; c.fill();

    let previous = 0;
    splits.forEach((split, i) => {
      band(previous, split);
      c.fillStyle = `${PALETTE[i]}22`; c.fill();
      c.strokeStyle = `${PALETTE[i]}88`; c.lineWidth = 1.5; c.stroke();
      const labelY = (screenY(previous) + screenY(split)) / 2;
      c.fillStyle = '#f5efff'; c.font = '10px JetBrains Mono';
      c.fillText(t('shadow.cascadeLabel', i + 1, previous, split, Math.round(s.resolution / (s.cascades > 1 ? 2 : 1))), center - halfWidth(labelY) + 8, labelY + 3);
      previous = split;
    });

    const cutY = screenY(s.distance), cutW = halfWidth(cutY);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 2.5; c.setLineDash([8, 6]);
    c.beginPath(); c.moveTo(center - cutW, cutY); c.lineTo(center + cutW, cutY); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ffd23f'; c.font = '600 10px JetBrains Mono';
    c.fillText(t('shadow.cutoff', s.distance), center + cutW - 120, cutY - 7);

    let casting = 0;
    [...OBJECTS].sort((a, b) => b.meters - a.meters).forEach(object => {
      const y = screenY(object.meters), x = center + object.lane * halfWidth(y);
      const scale = clamp(1.18 - object.meters / 165, 0.34, 1.15);
      const index = Math.max(0, splits.findIndex(split => object.meters <= split));
      const start = index === 0 ? 0 : splits[index - 1];
      const texelsPerMeter = (s.resolution / (s.cascades > 1 ? 2 : 1)) / Math.max(1, splits[index] - start);
      if (object.meters <= s.distance) {
        casting++;
        const step = clamp(22 / Math.sqrt(Math.max(0.4, texelsPerMeter)), 2, 15);
        const length = 32 + 88 * scale;
        c.save();
        if (s.soft) c.filter = `blur(${clamp(step * 0.5, 2, 8)}px)`;
        c.fillStyle = s.soft ? 'rgba(4,2,12,.78)' : 'rgba(2,1,8,.92)';
        c.beginPath();
        for (let k = 0; k <= 8; k++) {
          const a = k / 8;
          c.lineTo(Math.round((x - length * 0.92 * a) / step) * step, Math.round((y + length * 0.3 * a - 14 * scale * 0.2) / step) * step);
        }
        for (let k = 8; k >= 0; k--) {
          const a = k / 8;
          c.lineTo(Math.round((x - length * 0.92 * a) / step) * step, Math.round((y + length * 0.3 * a + 14 * scale * (0.5 + a * 0.4)) / step) * step);
        }
        c.closePath(); c.fill(); c.restore();
      }
      const bw = 31 * scale, bh = 72 * scale;
      const body = c.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
      body.addColorStop(0, object.color); body.addColorStop(0.68, '#e9faff'); body.addColorStop(1, '#26375f');
      c.fillStyle = body; c.fillRect(x - bw / 2, y - bh, bw, bh);
      c.font = '600 9px JetBrains Mono'; c.textAlign = 'center';
      c.fillStyle = object.meters <= s.distance ? '#fff' : '#ff6f8e';
      c.fillText(`${object.meters} m`, x, y - bh - 8);
      if (object.meters > s.distance) c.fillText(t('shadow.noShadow'), x, y + 16);
      c.textAlign = 'left';
    });
    const nearIndex = 0;
    const nearTexels = (s.resolution / (s.cascades > 1 ? 2 : 1)) / Math.max(1, splits[nearIndex]);
    $('#shadowSceneExplain').innerHTML = t('shadow.caption', casting, fmt(nearTexels, 1));
  }

  function render() {
    const s = state();
    const budget = shadowBudget(s);
    $('#distanceOut').textContent = `${s.distance} m`;
    $('#resolutionOut').textContent = s.resolution;
    $('#cascadeOut').textContent = s.cascades;
    $('#shadowQuality').textContent = t(`shadow.quality.${budget.quality}`);
    $('#shadowStats').innerHTML = [
      tile(t('shadow.statMemory'), `${fmt(budget.mainMemoryMB, 1)} MB`, t('shadow.statMemoryD')),
      tile(t('shadow.statViews'), s.cascades, t('shadow.statViewsD')),
      tile(t('shadow.statDensity'), fmt(budget.density, 1), t(`shadow.quality.${budget.quality}`)),
      tile(t('shadow.statCost'), `${fmt(budget.relativeCost, 1)}×`, t('shadow.statCostD')),
    ].join('');
    $('#shadowAdvice').innerHTML = t(budget.warningKey, ...budget.warningArgs);
    paint();
  }

  [controls.distance, controls.resolution, controls.cascades].forEach(input => input.addEventListener('input', render));
  controls.soft.onclick = () => { togglePressed(controls.soft); render(); };
  addEventListener('resize', paint);
  render();
  return render;
}

/* ---------------- Additional light shadow atlas ---------------- */
const LIGHT_COLORS = ['#ff3ea5', '#26e3ea', '#ffd23f', '#a77bff', '#5dfc9a', '#ff9a3d', '#6cc9ff', '#ff8b8b'];
const TIERS = [256, 512, 1024];
const BOOK = [{ type: 'point', tier: 256 }, { type: 'spot', tier: 512 }];

export function initAtlas() {
  const canvas = $('#atlasCanvas');
  let lights = BOOK.map(light => ({ ...light })), atlasSize = 1024;
  bindSeg($('#atlasSize'), value => { atlasSize = +value; render(); });
  $('#atlasBook').onclick = () => { lights = BOOK.map(light => ({ ...light })); render(); };
  $('#atlasAdd').addEventListener('click', event => {
    const button = event.target.closest('button[data-type]');
    if (!button || lights.length >= 8) return;
    lights = [...lights, { type: button.dataset.type, tier: 512 }];
    render();
  });
  $('#atlasLights').addEventListener('click', event => {
    const row = event.target.closest('[data-i]');
    if (!row) return;
    const i = +row.dataset.i;
    if (event.target.closest('[data-remove]')) lights = lights.filter((_, k) => k !== i);
    const tierButton = event.target.closest('[data-tier]');
    if (tierButton) lights = lights.map((light, k) => (k === i ? { ...light, tier: +tierButton.dataset.tier } : light));
    render();
  });

  function render() {
    $('#atlasAdd').innerHTML = `<button class="btn" data-type="spot">+ Spot · 1 map</button><button class="btn" data-type="point">+ Point · 6 maps</button>`;
    $('#atlasLights').innerHTML = lights.map((light, i) => `
      <div class="atlas-light" data-i="${i}"><i style="background:${LIGHT_COLORS[i]}"></i><b>${light.type === 'point' ? 'Point' : 'Spot'} #${i + 1}</b>
        <div class="seg">${TIERS.map(tier => `<button data-tier="${tier}" aria-pressed="${tier === light.tier}">${tier}</button>`).join('')}</div>
        <button class="btn" data-remove aria-label="remove">✕</button></div>`).join('') || `<p class="hint">${t('atlas.empty')}</p>`;
    const layout = atlasLayout(lights, atlasSize);
    const { c, w, h } = fitCanvas(canvas, 320);
    const size = Math.min(w, h) - 24, ox = (w - size) / 2, oy = 12;
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#40316a'; c.strokeRect(ox, oy, size, size);
    const perTexel = size / atlasSize;
    const cell = (layout.required * layout.scale / layout.grid) * perTexel;
    layout.maps.forEach(map => {
      const col = map.cell % layout.grid, row = Math.floor(map.cell / layout.grid);
      const x = ox + col * cell, y = oy + row * cell, side = map.size * perTexel;
      c.fillStyle = `${LIGHT_COLORS[map.light]}22`; c.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      c.fillStyle = LIGHT_COLORS[map.light]; c.fillRect(x + 2, y + 2, Math.max(2, side - 4), Math.max(2, side - 4));
      c.fillStyle = '#0b0715'; c.font = '600 10px JetBrains Mono';
      if (side > 34) c.fillText(`${map.size}`, x + 6, y + 15);
    });
    $('#atlasOut').innerHTML = lights.length
      ? t('atlas.out', layout.maps.length, layout.grid, layout.required, atlasSize, layout.downscaled, Math.round(layout.scale * 100))
      : t('atlas.empty');
  }
  addEventListener('resize', render);
  render();
  return render;
}

/* ---------------- Mixed lighting ---------------- */
const ROWS = ['directStatic', 'directDynamic', 'indirect', 'staticOnStatic', 'farStatic', 'dynamicOnStatic', 'staticOnDynamic', 'specular'];

export function initModes() {
  const canvas = $('#modesCanvas'), walk = $('#modeWalk');
  let mode = 'shadowmask';
  const seg = $('#modeSeg');
  seg.innerHTML = LIGHT_MODES.map(key => `<button data-v="${key}" aria-pressed="${key === mode}"></button>`).join('');
  bindSeg(seg, value => { mode = value; render(); });
  walk.addEventListener('input', render);
  addEventListener('resize', render);

  function paint() {
    const m = MODE_MATRIX[mode];
    const { c, w, h } = fitCanvas(canvas, 300);
    const ground = h - 60;
    const indirect = m.indirect === 'baked' ? 0.34 : 0.16;
    c.fillStyle = '#0d0a22'; c.fillRect(0, 0, w, ground);
    c.fillStyle = `rgb(${Math.round(60 + indirect * 200)},${Math.round(45 + indirect * 150)},${Math.round(90 + indirect * 120)})`;
    c.fillRect(0, ground, w, h - ground);
    c.fillStyle = '#ffe98a'; c.beginPath(); c.arc(w * 0.58, 70, 18, 0, Math.PI * 2); c.fill();

    const cutoff = w * 0.68;
    c.strokeStyle = '#ffd23f'; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(cutoff, 20); c.lineTo(cutoff, h - 8); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ffd23f'; c.font = '10px JetBrains Mono'; c.fillText('Shadow Distance', cutoff + 6, 24);

    const pillar = { x: w * 0.3, width: 26, height: 120 };
    const shadowStart = pillar.x - 150, shadowEnd = pillar.x;
    const kindColor = kind => (kind === 'rt' ? 'rgba(4,2,12,.72)' : kind === 'baked' ? 'rgba(80,40,120,.72)' : null);
    const drawShadow = (x0, x1, kind) => {
      const color = kindColor(kind);
      if (!color) return;
      c.fillStyle = color; c.fillRect(x0, ground, x1 - x0, 14);
    };
    drawShadow(shadowStart, shadowEnd, m.staticOnStatic);
    const far = { x: w * 0.86 };
    drawShadow(far.x - 90, far.x, m.farStatic === 'none' ? null : m.farStatic);

    c.fillStyle = m.directStatic === 'baked' ? '#8f78b8' : '#c9b5ff';
    c.fillRect(pillar.x, ground - pillar.height, pillar.width, pillar.height);
    c.fillRect(far.x, ground - 90, 22, 90);

    const charX = w * 0.05 + (+walk.value / 100) * w * 0.6;
    const inShadow = characterInPillarShadow(mode, charX, shadowStart, shadowEnd);
    if (m.dynamicOnStatic !== 'none') drawShadow(charX - 60, charX, m.dynamicOnStatic);
    const lit = inShadow === 'shadow' ? 0.35 : inShadow === 'probe' ? 0.7 : m.directDynamic === 'probe' ? 0.75 : 1;
    c.fillStyle = `rgb(${Math.round(255 * lit)},${Math.round(62 * lit + 30)},${Math.round(165 * lit)})`;
    c.beginPath(); c.roundRect(charX - 12, ground - 64, 24, 64, 12); c.fill();
    c.fillStyle = '#fff'; c.font = '10px JetBrains Mono'; c.textAlign = 'center';
    c.fillText(t(`modes.char.${inShadow}`), charX, ground - 72);
    c.fillText(t('modes.pillar'), pillar.x + pillar.width / 2, ground - pillar.height - 8);
    c.fillText(t('modes.farPillar'), far.x + 11, ground - 98);
    c.textAlign = 'left';
    return inShadow;
  }

  function render() {
    const names = t('modes.names');
    [...seg.children].forEach(button => { button.textContent = names[button.dataset.v]; });
    $('#modeWalkOut').textContent = `${walk.value}%`;
    const inShadow = paint();
    $('#modesTitle').textContent = names[mode];
    $('#modesCost').textContent = t('modes.cost', MODE_MATRIX[mode].runtime, MODE_MATRIX[mode].memory);
    const rows = t('modes.rows'), cells = t('modes.cells');
    $('#modesHead').innerHTML = `<tr><th></th>${LIGHT_MODES.map(key => `<th class="${key === mode ? 'hl' : ''}">${names[key]}</th>`).join('')}</tr>`;
    $('#modesBody').innerHTML = ROWS.map(row => `<tr><td>${rows[row]}</td>${LIGHT_MODES.map(key =>
      `<td class="cell-${MODE_MATRIX[key][row]} ${key === mode ? 'hl' : ''}">${cells[MODE_MATRIX[key][row]]}</td>`).join('')}</tr>`).join('');
    $('#modesExplain').innerHTML = `${t('modes.explain')[mode]} ${t(`modes.walkNote.${inShadow}`)}`;
  }
  render();
  return render;
}

/* ---------------- Rendering layers ---------------- */
const OBJECTS = [
  { name: 'Wall', layers: ['Default'] },
  { name: 'Syringe (pickup)', layers: ['Default', 'Highlight'] },
  { name: 'Interior prop', layers: ['Interior'] },
];

export function initLayers() {
  let light = ['Highlight'];
  $('#layersLight').addEventListener('click', event => {
    const button = event.target.closest('button[data-l]');
    if (!button) return;
    const name = button.dataset.l;
    light = light.includes(name) ? light.filter(l => l !== name) : [...light, name];
    render();
  });
  function render() {
    $('#layersLight').innerHTML = LAYERS.map(name => `<button class="chip" data-l="${name}" aria-pressed="${light.includes(name)}">${name}</button>`).join('');
    const mask = layerMask(light);
    $('#layersObjects').innerHTML = OBJECTS.map(object => {
      const on = lightAffects(mask, layerMask(object.layers));
      return `<div class="layer-object ${on ? 'lit' : ''}"><b>${object.name}</b><span>Rendering Layer Mask: ${object.layers.join(' | ')}</span><em>${on ? t('layers.lit') : t('layers.unlit')}</em></div>`;
    }).join('');
  }
  renderCode($('#layersCode'), SNIPPETS.renderingLayers);
  render();
  return render;
}
