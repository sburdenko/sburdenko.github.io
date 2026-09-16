import { $, $$, bootVhs, fitCanvas, press, clamp } from '../assets/vhs.js?v=202609161617';
import { initI18n, t, onLang } from '../assets/i18n.js?v=202609161617';
import { COMMON } from '../assets/i18n-common.js?v=202609161617';
import { DICT } from './i18n.js?v=202609161617';
import {
  RENDERERS,
  MSAA_PATTERNS,
  buildFrameGraph,
  chooseRenderer,
  msaaCost,
  msaaCoverage,
  probeRecommendation,
  shadowBudget,
  upscalingModel,
} from './model.js?v=202609161617';

initI18n({ ...COMMON, ...DICT });
bootVhs();

const bool = button => button.getAttribute('aria-pressed') === 'true';
const toggle = button => button.setAttribute('aria-pressed', bool(button) ? 'false' : 'true');
const tile = (label, value, detail = '') => `<div class="tile"><span class="lbl">${label}</span><span class="val">${value}</span><span class="d">${detail}</span></div>`;

function initRendererLab() {
  const lights = $('#lightCount'), transparent = $('#transparent'), msaa = $('#msaaToggle');
  const targets = $$('#targetSeg button');
  const cards = $('#rendererCards');
  function render() {
    const catalog = t('renderer.catalog');
    const result = chooseRenderer({
      lights: +lights.value,
      transparent: +transparent.value,
      msaa: bool(msaa),
      mobile: targets.find(button => bool(button)).dataset.v === 'mobile',
    });
    $('#lightOut').textContent = lights.value;
    $('#transparentOut').textContent = `${transparent.value}%`;
    $('#rendererName').textContent = RENDERERS[result.key].name;
    $('#rendererIdea').textContent = catalog[result.key].idea;
    $('#rendererReason').textContent = t(result.reasonKey);
    const max = Math.max(...Object.values(result.scores), 1);
    $('#rendererScores').innerHTML = Object.entries(result.scores).map(([key, score]) => `
      <div class="score-row"><span>${RENDERERS[key].name}</span><i style="width:${Math.max(0, score) / max * 100}%"></i><b>${score}</b></div>`).join('');
    cards.innerHTML = Object.entries(RENDERERS).map(([key, renderer]) => `
      <article class="renderer-card" data-renderer="${key}">
        <h4>${renderer.name}</h4><p>${catalog[key].idea}</p>
        <small>${t('renderer.wins')}</small><ul><li>${catalog[key].wins.join('</li><li>')}</li></ul>
        <small>${t('renderer.costs')}</small><ul class="cost-list"><li>${catalog[key].costs.join('</li><li>')}</li></ul>
      </article>`).join('');
    $$('.renderer-card', cards).forEach(card => card.classList.toggle('selected', card.dataset.renderer === result.key));
  }
  [lights, transparent].forEach(input => input.addEventListener('input', render));
  msaa.onclick = () => { toggle(msaa); render(); };
  targets.forEach(button => button.onclick = () => { press(targets, candidate => candidate === button); render(); });
  render();
  return render;
}

function initMsaaLab() {
  const sampleButtons = $$('#msaaSamples button'), problemButtons = $$('#msaaProblem button');
  const edge = $('#msaaEdge'), canvas = $('#msaaCanvas');

  function paint(samples) {
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 330 : 390);
    const columns = 10, rows = 6, pad = 24;
    const cell = Math.min((w - pad * 2) / columns, (h - pad * 2) / rows);
    const left = (w - cell * columns) / 2, top = (h - cell * rows) / 2;
    const slope = -0.35, edgeLine = 2.1 + (+edge.value / 100) * 3.1;
    const selectedX = Math.floor(columns / 2);
    const selectedY = clamp(Math.floor(slope * (selectedX + .5) + edgeLine), 0, rows - 1);
    let selected;

    c.clearRect(0, 0, w, h);
    c.fillStyle = '#08050f'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const result = msaaCoverage({ samples, pixelX: x, pixelY: y, slope, edge: edgeLine });
        const px = left + x * cell, py = top + y * cell;
        c.fillStyle = `rgba(38,227,234,${.05 + result.coverage * .68})`;
        c.fillRect(px, py, cell, cell);
        c.strokeStyle = '#493b66'; c.lineWidth = 1; c.strokeRect(px, py, cell, cell);
        MSAA_PATTERNS[samples].forEach(([sx, sy], index) => {
          c.fillStyle = result.mask[index] ? '#5dfc9a' : '#ff5c87';
          c.beginPath(); c.arc(px + sx * cell, py + sy * cell, samples > 4 ? 2.2 : 3, 0, Math.PI * 2); c.fill();
        });
        if (x === selectedX && y === selectedY) selected = result;
      }
    }
    const lineStartY = top + edgeLine * cell, lineEndY = top + (slope * columns + edgeLine) * cell;
    c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.moveTo(left, lineStartY); c.lineTo(left + columns * cell, lineEndY); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(left + selectedX * cell + 2, top + selectedY * cell + 2, cell - 4, cell - 4);
    return selected || msaaCoverage({ samples, pixelX: selectedX, pixelY: selectedY, slope, edge: edgeLine });
  }

  function render() {
    const samples = +(sampleButtons.find(bool) || sampleButtons[2]).dataset.samples;
    const problem = (problemButtons.find(bool) || problemButtons[0]).dataset.problem;
    const coverage = paint(samples), cost = msaaCost(samples);
    const [title, copy] = t('msaa.problemData')[problem];
    const verdictKey = problem === 'geometry' ? 'msaa.works' : problem === 'alpha' ? 'msaa.conditional' : 'msaa.no';
    $('#msaaEdgeOut').textContent = `${edge.value}%`;
    $('#msaaMode').textContent = `${samples}× MSAA`;
    $('#msaaVerdict').textContent = t(verdictKey);
    $('#msaaVerdict').dataset.verdict = problem;
    $('#msaaProblemTitle').textContent = title;
    $('#msaaProblemCopy').textContent = copy;
    $('#msaaMask').innerHTML = MSAA_PATTERNS[samples].map(([x, y], index) => `<i class="${coverage.mask[index] ? 'covered' : ''}" style="left:${x * 100}%;top:${y * 100}%"></i>`).join('');
    $('#msaaResolve').textContent = t('msaa.resolve', coverage.covered, samples, Math.round(coverage.coverage * 100));
    $('#msaaStats').innerHTML = [
      tile(t('msaa.coverageStat'), `${Math.round(coverage.coverage * 100)}%`, t('msaa.coverageDetail')),
      tile(t('msaa.testsStat'), `${samples}×`, t('msaa.perPixel')),
      tile(t('msaa.memoryStat'), `${cost.attachmentMemoryMB.toFixed(1)} MB`, t('msaa.memoryDetail')),
      tile(t('msaa.resolveStat'), samples > 1 ? `${cost.resolveTargetMB.toFixed(1)} MB` : '—', samples > 1 ? t('msaa.oneFinal') : t('msaa.noResolve')),
    ].join('');
  }

  sampleButtons.forEach(button => button.onclick = () => { press(sampleButtons, candidate => candidate === button); render(); });
  problemButtons.forEach(button => button.onclick = () => { press(problemButtons, candidate => candidate === button); render(); });
  edge.addEventListener('input', render);
  addEventListener('resize', render);
  render();
  return render;
}

function initShadowLab() {
  const controls = {
    resolution: $('#shadowResolution'), distance: $('#shadowDistance'), cascades: $('#cascades'),
    spotLights: $('#spotLights'), pointLights: $('#pointLights'), soft: $('#softToggle'),
  };
  const canvas = $('#shadowCanvas');
  let latest;
  function paint() {
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 340 : 430);
    const distance = +controls.distance.value, cascades = +controls.cascades.value;
    const resolution = 2 ** +controls.resolution.value, soft = bool(controls.soft);
    const horizon = h * .31, bottom = h * .93, center = w * .53, sceneDepth = 200;
    const palette = ['#ff3ea5', '#8a4dff', '#26e3ea', '#5dfc9a'];
    const objects = [
      { meters: 8, lane: -.42, label: 'shadow.near', color: '#ff5ca8' },
      { meters: 45, lane: .34, label: 'shadow.middle', color: '#8a7dff' },
      { meters: 120, lane: -.18, label: 'shadow.far', color: '#26e3ea' },
    ];
    const splits = Array.from({ length: cascades }, (_, index) => Math.round(distance * ((index + 1) / cascades) ** 1.45));
    splits[splits.length - 1] = distance;
    const screenY = meters => bottom - Math.sqrt(clamp(meters / sceneDepth, 0, 1)) * (bottom - horizon);
    const halfWidth = y => 42 + clamp((y - horizon) / (bottom - horizon), 0, 1) * (w * .48 - 42);
    const groundPath = (nearMeters, farMeters) => {
      const nearY = screenY(nearMeters), farY = screenY(farMeters);
      const nearW = halfWidth(nearY), farW = halfWidth(farY);
      c.beginPath(); c.moveTo(center - nearW, nearY); c.lineTo(center + nearW, nearY);
      c.lineTo(center + farW, farY); c.lineTo(center - farW, farY); c.closePath();
    };
    const cascadeFor = meters => {
      const index = Math.max(0, splits.findIndex(split => meters <= split));
      const start = index === 0 ? 0 : splits[index - 1];
      const end = splits[index];
      return { index, start, end, density: resolution / Math.max(1, end - start) };
    };

    c.clearRect(0, 0, w, h);
    const sky = c.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#100d35'); sky.addColorStop(.58, '#593064'); sky.addColorStop(1, '#ed8178');
    c.fillStyle = sky; c.fillRect(0, 0, w, horizon);
    c.fillStyle = '#100b1d'; c.fillRect(0, horizon, w, h - horizon);

    const sunX = w * .84, sunY = h * .14;
    const glow = c.createRadialGradient(sunX, sunY, 4, sunX, sunY, 48);
    glow.addColorStop(0, '#fffbd1'); glow.addColorStop(.28, '#ffd76a'); glow.addColorStop(1, '#ffd23f00');
    c.fillStyle = glow; c.beginPath(); c.arc(sunX, sunY, 48, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff3a0'; c.beginPath(); c.arc(sunX, sunY, 18, 0, Math.PI * 2); c.fill();

    groundPath(0, sceneDepth);
    const ground = c.createLinearGradient(0, horizon, 0, bottom);
    ground.addColorStop(0, '#17162f'); ground.addColorStop(1, '#28203b');
    c.fillStyle = ground; c.fill();

    let previous = 0;
    splits.forEach((split, index) => {
      groundPath(previous, split);
      c.fillStyle = `${palette[index]}20`; c.fill();
      c.strokeStyle = `${palette[index]}88`; c.lineWidth = 1.5; c.stroke();
      const labelY = (screenY(previous) + screenY(split)) / 2;
      c.fillStyle = '#f5efff'; c.font = '10px JetBrains Mono';
      c.fillText(t('shadow.cascade', index + 1, previous, split), center - halfWidth(labelY) + 10, labelY - 5);
      previous = split;
    });

    c.strokeStyle = '#ffffff13'; c.lineWidth = 1;
    [-.66, -.33, 0, .33, .66].forEach(lane => {
      c.beginPath(); c.moveTo(center + lane * halfWidth(bottom), bottom); c.lineTo(center + lane * halfWidth(horizon), horizon); c.stroke();
    });
    [25, 50, 100, 150, 200].forEach(meters => {
      const y = screenY(meters), hw = halfWidth(y);
      c.beginPath(); c.moveTo(center - hw, y); c.lineTo(center + hw, y); c.stroke();
    });

    const cutoffY = screenY(distance), cutoffW = halfWidth(cutoffY);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.setLineDash([8, 6]);
    c.beginPath(); c.moveTo(center - cutoffW, cutoffY); c.lineTo(center + cutoffW, cutoffY); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ffd23f'; c.font = '600 10px JetBrains Mono';
    c.fillText(t('shadow.cutoff', distance), center + cutoffW - Math.min(150, cutoffW * 1.3), cutoffY - 8);

    const quantize = (value, step) => Math.round(value / step) * step;
    function drawShadow(x, y, scale, density) {
      const length = 32 + 88 * scale, dx = -length * .92, dy = length * .3;
      const width = 14 * scale, step = clamp(22 / Math.sqrt(Math.max(.4, density)), 2, 15);
      const count = Math.max(5, Math.ceil(length / step));
      const points = [];
      for (let i = 0; i <= count; i++) {
        const amount = i / count, spread = width * (.72 + amount * .48);
        points.push([quantize(x + dx * amount, step), quantize(y + dy * amount - spread * .12, step)]);
      }
      for (let i = count; i >= 0; i--) {
        const amount = i / count, spread = width * (.72 + amount * .48);
        points.push([quantize(x + dx * amount, step), quantize(y + dy * amount + spread * .5, step)]);
      }
      const trace = () => {
        c.beginPath(); c.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach(point => c.lineTo(point[0], point[1]));
        c.closePath();
      };
      if (soft) {
        c.save(); c.filter = `blur(${clamp(step * .65, 3, 9)}px)`; c.fillStyle = '#020108a8'; trace(); c.fill(); c.restore();
      }
      c.fillStyle = soft ? '#0301099c' : '#020108dc'; trace(); c.fill();
      c.strokeStyle = soft ? '#0000' : '#ff5c8766'; c.lineWidth = 1; c.stroke();
      if (step > 5) {
        c.fillStyle = '#ff5c873d';
        points.filter((_, index) => index % 2 === 0).forEach(([px, py]) => c.fillRect(px - step * .25, py - step * .25, step * .5, step * .5));
      }
    }

    let visibleShadows = 0;
    [...objects].sort((a, b) => b.meters - a.meters).forEach(object => {
      const y = screenY(object.meters), hw = halfWidth(y), x = center + object.lane * hw;
      const scale = clamp(1.18 - object.meters / 165, .34, 1.15);
      const casts = object.meters <= distance;
      if (casts) {
        visibleShadows++;
        drawShadow(x, y, scale, cascadeFor(object.meters).density);
      }

      const bodyW = 31 * scale, bodyH = 72 * scale, top = 9 * scale;
      const body = c.createLinearGradient(x - bodyW / 2, 0, x + bodyW / 2, 0);
      body.addColorStop(0, object.color); body.addColorStop(.68, '#e9faff'); body.addColorStop(1, '#26375f');
      c.fillStyle = body; c.fillRect(x - bodyW / 2, y - bodyH, bodyW, bodyH);
      c.fillStyle = '#ffffffcc'; c.beginPath(); c.moveTo(x - bodyW / 2, y - bodyH); c.lineTo(x - bodyW / 2 + top, y - bodyH - top);
      c.lineTo(x + bodyW / 2 + top, y - bodyH - top); c.lineTo(x + bodyW / 2, y - bodyH); c.closePath(); c.fill();
      c.fillStyle = '#1b1833'; c.beginPath(); c.ellipse(x, y + 2, bodyW * .7, 4 * scale, 0, 0, Math.PI * 2); c.fill();
      c.font = '600 9px JetBrains Mono'; c.textAlign = 'center';
      c.fillStyle = casts ? '#ffffff' : '#ff6f8e';
      c.fillText(`${t(object.label)} · ${object.meters} m`, x, y - bodyH - top - 9);
      if (!casts) c.fillText(t('shadow.noShadow'), x, y + 17);
    });
    c.textAlign = 'left';

    c.fillStyle = '#ff3ea5'; c.beginPath(); c.moveTo(center - 16, bottom + 4); c.lineTo(center + 16, bottom + 4); c.lineTo(center, bottom - 18); c.closePath(); c.fill();
    c.fillStyle = '#ffb8dd'; c.font = '10px JetBrains Mono'; c.fillText(t('shadow.camera'), center + 22, bottom);
    c.strokeStyle = '#2f2346'; c.beginPath(); c.moveTo(0, bottom + 5); c.lineTo(w, bottom + 5); c.stroke();

    const nearDensity = cascadeFor(objects[0].meters).density;
    $('#shadowSceneExplain').textContent = t('shadow.sceneCaption', visibleShadows, nearDensity.toFixed(1));
  }
  function render() {
    const state = {
      resolution: 2 ** +controls.resolution.value,
      distance: +controls.distance.value,
      cascades: +controls.cascades.value,
      spotLights: +controls.spotLights.value,
      pointLights: +controls.pointLights.value,
      soft: bool(controls.soft),
    };
    latest = shadowBudget(state);
    $('#distanceOut').textContent = `${state.distance} m`;
    $('#resolutionOut').textContent = state.resolution;
    $('#cascadeOut').textContent = state.cascades;
    $('#spotOut').textContent = state.spotLights;
    $('#pointOut').textContent = state.pointLights;
    $('#shadowQuality').textContent = t(`shadow.quality.${latest.quality}`);
    $('#shadowStats').innerHTML = [
      tile(t('shadow.views'), latest.maps, t('shadow.point6')),
      tile(t('shadow.memory'), `${latest.mainMemoryMB.toFixed(1)} MB`, t('shadow.estimate')),
      tile(t('shadow.density'), latest.density.toFixed(1), t(`shadow.quality.${latest.quality}`)),
      tile(t('shadow.cost'), `${latest.relativeCost.toFixed(1)}×`, t('shadow.compare')),
    ].join('');
    $('#shadowAdvice').textContent = t(latest.warningKey, ...latest.warningArgs);
    paint();
  }
  Object.values(controls).forEach(control => {
    if (control.tagName === 'BUTTON') control.onclick = () => { toggle(control); render(); };
    else control.addEventListener('input', render);
  });
  addEventListener('resize', paint);
  render();
  return render;
}

function initLightModes() {
  const buttons = $$('#lightModes .seg button'), scene = $('#lightModes .light-mode-scene'), motion = $('#modeMotion');
  const staticActor = $('.static-actor', scene), dynamicActor = $('.dynamic-actor', scene);
  const staticBeam = $('.beam-static', scene), dynamicBeam = $('.beam-dynamic', scene);
  const aimBeam = (beam, actor) => {
    const sceneBox = scene.getBoundingClientRect(), actorBox = actor.getBoundingClientRect();
    const sourceX = sceneBox.width * .5, sourceY = 112;
    const targetX = actorBox.left - sceneBox.left + actorBox.width * .5;
    const targetY = actorBox.top - sceneBox.top + actorBox.height * .42;
    const dx = targetX - sourceX, dy = targetY - sourceY;
    beam.style.left = `${sourceX}px`;
    beam.style.top = `${sourceY}px`;
    beam.style.width = `${Math.hypot(dx, dy)}px`;
    beam.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
  };
  const move = () => {
    scene.style.setProperty('--dynamic-x', `${motion.value}%`);
    $('#modeMotionOut').textContent = `${motion.value}%`;
    aimBeam(staticBeam, staticActor);
    aimBeam(dynamicBeam, dynamicActor);
  };
  const render = button => {
    press(buttons, candidate => candidate === button);
    const mode = button.dataset.v;
    const visual = t('modes.visual')[mode];
    $('#modeFacts').innerHTML = t('modes.data')[mode].map(([name, text]) => `<div><b>${name}</b><p>${text}</p></div>`).join('');
    scene.dataset.mode = mode;
    $('#modeSourceBadge').textContent = visual.source;
    $('#staticLightBadge').textContent = visual.staticObject;
    $('#dynamicLightBadge').textContent = visual.dynamicObject;
    $('#staticShadowBadge').textContent = visual.staticShadow;
    $('#dynamicShadowBadge').textContent = visual.dynamicShadow;
    $('#modeRuntime').textContent = visual.runtime;
    $('#modeSceneExplain').textContent = visual.explain;
    move();
  };
  buttons.forEach(button => button.onclick = () => render(button));
  motion.addEventListener('input', move);
  addEventListener('resize', move);
  render(buttons[0]);
  return () => render(buttons.find(bool) || buttons[0]);
}

function initProbeLab() {
  const canvas = $('#probeCanvas'), position = $('#objectPosition'), time = $('#timeBlend');
  const lightSwatch = $('#probeLightSwatch'), objectSwatch = $('#probeObjectSwatch'), mixLabel = $('#probeMixLabel');
  const checks = { dynamic: true, large: false, changing: true };
  const probeButtons = $$('[data-probe]');
  function colors(day) {
    const night = [[48, 76, 145], [72, 62, 138], [30, 94, 142], [92, 56, 130], [40, 64, 112]];
    const noon = [[255, 173, 84], [255, 222, 147], [118, 207, 213], [255, 131, 106], [161, 204, 128]];
    return noon.map((rgb, i) => rgb.map((channel, k) => Math.round(night[i][k] + (channel - night[i][k]) * day)));
  }
  function paint() {
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 310 : 390);
    const day = 1 - +time.value / 100;
    const palette = colors(day), stops = [.08, .29, .5, .71, .92];
    const probes = palette.map((color, i) => ({ x: w * stops[i], y: h * (.28 + (i % 2) * .44), color }));
    const x = w * +position.value / 100, y = h * .53;
    c.fillStyle = day > .45 ? '#24244c' : '#080c22'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < probes.length - 1; i++) {
      const field = c.createLinearGradient(probes[i].x, 0, probes[i + 1].x, 0);
      field.addColorStop(0, `rgba(${probes[i].color.join(',')},.18)`);
      field.addColorStop(1, `rgba(${probes[i + 1].color.join(',')},.18)`);
      c.fillStyle = field; c.fillRect(probes[i].x, 0, probes[i + 1].x - probes[i].x, h);
    }
    const nx = +position.value / 100;
    let left = 0;
    while (left < stops.length - 2 && nx > stops[left + 1]) left++;
    const right = Math.min(left + 1, stops.length - 1);
    const blend = clamp((nx - stops[left]) / (stops[right] - stops[left]), 0, 1);
    const weights = probes.map((_, i) => i === left ? 1 - blend : i === right ? blend : 0);
    const mix = [0, 0, 0];
    probes.forEach((probe, i) => {
      const weight = weights[i];
      for (let channel = 0; channel < 3; channel++) mix[channel] += probe.color[channel] * weight;
      if (weight > 0) {
        c.strokeStyle = `rgba(${probe.color.join(',')},${.45 + weight * .55})`; c.lineWidth = 2 + weight * 8;
        c.beginPath(); c.moveTo(probe.x, probe.y); c.lineTo(x, y); c.stroke();
      }
      c.globalAlpha = weight > 0 ? 1 : .28;
      c.fillStyle = `rgb(${probe.color.join(',')})`; c.shadowColor = c.fillStyle; c.shadowBlur = weight > 0 ? 20 : 0;
      c.beginPath(); c.arc(probe.x, probe.y, 9 + weight * 10, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
      if (weight > 0) {
        c.fillStyle = '#fff'; c.font = '10px JetBrains Mono'; c.fillText(`${Math.round(weight * 100)}%`, probe.x - 12, probe.y - 17);
      }
      c.globalAlpha = 1;
    });
    const color = mix.map(Math.round);
    const highlight = color.map(channel => Math.round(channel + (255 - channel) * .38));
    const shade = color.map(channel => Math.round(channel * .22));
    const gradient = c.createRadialGradient(x - 15, y - 18, 3, x, y, 47);
    gradient.addColorStop(0, `rgb(${highlight.join(',')})`); gradient.addColorStop(.18, `rgb(${color.join(',')})`); gradient.addColorStop(.72, `rgb(${color.join(',')})`); gradient.addColorStop(1, `rgb(${shade.join(',')})`);
    c.shadowColor = `rgb(${color.join(',')})`; c.shadowBlur = 28; c.fillStyle = gradient; c.beginPath(); c.arc(x, y, 45, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
    c.strokeStyle = `rgba(${highlight.join(',')},.9)`; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#efeaff'; c.font = '11px JetBrains Mono'; c.fillText(t('probes.object'), x - 50, y + 67);
    $('#probeReadout').textContent = `RGB ${color.join(' · ')}`;
    $('#probeReadout').style.color = `rgb(${highlight.join(',')})`;
    lightSwatch.style.background = `rgb(${color.join(',')})`;
    objectSwatch.style.background = `radial-gradient(circle at 35% 30%,rgb(${highlight.join(',')}),rgb(${color.join(',')}) 45%,rgb(${shade.join(',')}))`;
    mixLabel.textContent = `P${left + 1} ${Math.round((1 - blend) * 100)}% + P${right + 1} ${Math.round(blend * 100)}%`;
  }
  function render() {
    $('#objectOut').textContent = `${position.value}%`;
    $('#timeOut').textContent = +time.value < 50 ? t('probes.day') : t('probes.night');
    const result = probeRecommendation({ dynamicObjects: checks.dynamic, largeWorld: checks.large, lightingChanges: checks.changing });
    const [name, why, watch] = t('probe.data')[result.key];
    $('#probeChoice').textContent = name;
    $('#probeWhy').textContent = why;
    $('#probeWatch').textContent = watch;
    probeButtons.forEach(button => $('.sw', button).textContent = checks[button.dataset.probe] ? t('probes.yes') : t('probes.no'));
    paint();
  }
  [position, time].forEach(input => input.addEventListener('input', render));
  probeButtons.forEach(button => button.onclick = () => {
    checks[button.dataset.probe] = !checks[button.dataset.probe];
    button.setAttribute('aria-pressed', checks[button.dataset.probe]);
    render();
  });
  addEventListener('resize', paint);
  render();
  return render;
}

function initShaderLab() {
  const buttons = $$('#shaderPasses button'), object = $('.shader-object');
  let focused = 'forward';
  function render(focused = 'forward') {
    const active = Object.fromEntries(buttons.map(button => [button.dataset.pass, bool(button)]));
    object.classList.toggle('unlit', !active.forward);
    object.classList.toggle('no-shadow', !active.shadow);
    object.classList.toggle('no-depth', !active.depth);
    $('#shaderPreviewLabel').textContent = `${active.forward ? t('shader.visible') : t('shader.noForward')} · ${active.shadow ? t('shader.casts') : t('shader.noShadow')} · ${active.depth ? t('shader.inDepth') : t('shader.noDepth')}`;
    $('#shaderCode').textContent = t('shader.snippets')[focused];
  }
  buttons.forEach(button => button.onclick = () => { toggle(button); focused = button.dataset.pass; render(focused); });
  render();
  return () => render(focused);
}

function initGraphLab() {
  const toggles = $$('.graph-toggle'), phases = $$('#graphPhaseSeg button');
  const step = $('#graphStep'), transport = $('#graphTransport');
  let phase = 'setup', cursor = 0, inspectedId = null;

  const resourceName = id => t('graph.resourceNames')[id] || id;
  const passData = id => t('graph.pass')[id];

  function render() {
    const settings = Object.fromEntries(toggles.map(button => [button.dataset.feature, bool(button)]));
    const graph = buildFrameGraph(settings);
    cursor = clamp(cursor, 0, graph.passes.length - 1);
    const shown = phase === 'execute' ? graph.passes : graph.declared;
    $('#graphPhaseCopy').innerHTML = t(`graph.phase.${phase}.copy`);
    $('#graphStats').innerHTML = [
      tile(t('graph.declared'), graph.declared.length),
      tile(t('graph.survived'), graph.passes.length),
      tile(t('graph.culled'), graph.culledCount),
      tile(t('graph.memory'), `${graph.transientMB} MB`, t('graph.saved', graph.savedMB)),
    ].join('');
    $('#frameGraph').innerHTML = shown.map(pass => {
      const [name, purpose] = passData(pass.id);
      const active = phase === 'execute' && pass.activeIndex === cursor;
      const culled = phase !== 'setup' && pass.culled;
      return `<button class="pass-card${active ? ' active' : ''}${culled ? ' culled' : ''}" data-pass="${pass.id}" ${culled ? '' : `data-active-index="${pass.activeIndex}"`}>
        <span class="pass-state">${culled ? t('graph.culledBadge') : `${t('graph.read')} ${pass.reads.map(resourceName).join(', ')}`}</span>
        <b>${name}</b><small>${purpose}</small><small>${t('graph.write')} ${pass.writes.map(resourceName).join(', ')}</small>
      </button>`;
    }).join('');

    const header = `<div class="resource-row resource-head" style="--pass-count:${graph.passes.length}"><b>${t('graph.resource')}</b>${graph.passes.map(pass => `<span class="life-cell">${passData(pass.id)[0]}</span>`).join('')}</div>`;
    $('#resourceTable').innerHTML = header + graph.resources.map(resource => `
      <div class="resource-row" style="--pass-count:${graph.passes.length}"><b>${resourceName(resource.name)}<small>${resource.sizeMB} MB · ${t('graph.slot', resource.slot || '—')}</small></b>${graph.passes.map((pass, index) => {
        const alive = index >= resource.first && index <= resource.last;
        const access = phase === 'execute' && index === cursor && [...pass.reads, ...pass.writes].includes(resource.name);
        const writes = pass.writes.includes(resource.name), reads = pass.reads.includes(resource.name);
        const state = [alive ? 'alive' : '', index === resource.first ? 'born' : '', index === resource.last ? 'release' : '', access ? 'access' : ''].filter(Boolean).join(' ');
        return `<span class="life-cell ${state}">${access ? (writes && reads ? 'R/W' : writes ? 'W' : 'R') : ''}</span>`;
      }).join('')}</div>`).join('');
    $('#resourceTable').classList.toggle('pending', phase === 'setup');

    transport.hidden = phase !== 'execute';
    step.max = Math.max(0, graph.passes.length - 1); step.value = cursor;
    $('#graphStepLabel').textContent = t('graph.step', cursor + 1, graph.passes.length);
    $('#graphPrev').disabled = cursor === 0; $('#graphNext').disabled = cursor === graph.passes.length - 1;

    if (phase === 'execute') {
      const pass = graph.passes[cursor], [name, purpose] = passData(pass.id);
      const allocate = graph.resources.filter(resource => resource.first === cursor).map(resource => resourceName(resource.name)).join(', ');
      const release = graph.resources.filter(resource => resource.last === cursor && resource.name !== 'camera').map(resource => resourceName(resource.name)).join(', ');
      $('#graphFocus').innerHTML = `<span class="lbl">${t('graph.step', cursor + 1, graph.passes.length)}</span><strong>${name}</strong><p>${purpose}</p><code>${t('graph.read')} ${pass.reads.map(resourceName).join(', ')} → ${t('graph.write')} ${pass.writes.map(resourceName).join(', ')}</code><small>${t('graph.events', allocate, release)}</small>`;
    } else if (phase === 'compile' && inspectedId) {
      const pass = graph.declared.find(candidate => candidate.id === inspectedId);
      if (pass) {
        const [name, purpose] = passData(pass.id);
        $('#graphFocus').innerHTML = `<span class="lbl">${pass.culled ? t('graph.culledBadge') : t('graph.survived')}</span><strong>${name}</strong><p>${purpose}</p>`;
      } else {
        inspectedId = null;
        $('#graphFocus').innerHTML = '';
      }
    } else {
      $('#graphFocus').innerHTML = '';
    }

    $$('#frameGraph .pass-card').forEach(card => card.onclick = () => {
      const pass = graph.declared.find(candidate => candidate.id === card.dataset.pass);
      inspectedId = pass.id;
      if (!pass.culled) {
        phase = 'execute'; cursor = pass.activeIndex;
        press(phases, button => button.dataset.phase === phase);
      }
      render();
    });
  }
  toggles.forEach(button => button.onclick = () => { toggle(button); render(); });
  phases.forEach(button => button.onclick = () => { phase = button.dataset.phase; inspectedId = null; press(phases, candidate => candidate === button); render(); });
  step.addEventListener('input', () => { cursor = +step.value; render(); });
  $('#graphPrev').onclick = () => { cursor--; render(); };
  $('#graphNext').onclick = () => { cursor++; render(); };
  render();
  return render;
}

function initMergeLab() {
  const toggleButton = $('#fetchToggle');
  function render() {
    const fetch = bool(toggleButton);
    $('#mergeTrack').innerHTML = fetch
      ? `<div class="merge-pass merged">${t('merge.merged')}</div>`
      : [t('merge.draw'), t('merge.copy'), t('merge.tint')].map(name => `<div class="merge-pass">${name}</div>`).join('<i>→</i>');
    $('#mergeResult').textContent = fetch ? t('merge.fetch') : t('merge.regular');
    $('#mergeReason').textContent = fetch ? t('merge.fetchReason') : t('merge.regularReason');
  }
  toggleButton.onclick = () => { toggle(toggleButton); render(); };
  render();
  return render;
}

function initPostLab() {
  const position = $('#cameraPosition'), preview = $('#postPreview'), toggles = $$('.post-toggle'), overlay = $('#overlayToggle');
  function render() {
    const x = +position.value, blend = clamp((x - 40) / 35, 0, 1);
    $('#cameraOut').textContent = `${x}%`;
    $('.camera-marker', preview).style.left = `${x}%`;
    preview.style.setProperty('--sat', (1 + blend * .8).toFixed(2));
    preview.style.setProperty('--contrast', (1 + blend * .3).toFixed(2));
    preview.style.setProperty('--glow', `${12 + blend * 50}px`);
    preview.style.setProperty('--spread', `${blend * 14}px`);
    preview.classList.toggle('no-bloom', !bool(toggles.find(button => button.dataset.effect === 'bloom')));
    preview.classList.toggle('no-grade', !bool(toggles.find(button => button.dataset.effect === 'grade')));
    preview.classList.toggle('vignette', bool(toggles.find(button => button.dataset.effect === 'vignette')));
    $('#cockpit').hidden = !bool(overlay);
    $('#postReadout').textContent = blend === 0
      ? t('post.outside')
      : blend === 1
        ? t('post.inside')
        : t('post.blend', Math.round(blend * 100));
  }
  position.addEventListener('input', render);
  [...toggles, overlay].forEach(button => button.onclick = () => { toggle(button); render(); });
  render();
  return render;
}

function initUnity6Lab() {
  const scale = $('#renderScale'), stp = $('#stpToggle');
  function renderStp() {
    const value = +scale.value / 100, result = upscalingModel({ scale: value, stp: bool(stp) });
    $('#scaleOut').textContent = `${scale.value}%`;
    $('#internalPixels').style.setProperty('--pixel-size', `${Math.round(7 / value)}px`);
    $('#internalPixels').textContent = `${Math.round(1920 * value)} × ${Math.round(1080 * value)}`;
    $('#stpStats').innerHTML = [
      tile(t('stp.internal'), `${result.internalMP.toFixed(2)} MP`),
      tile(t('stp.output'), `${result.outputMP.toFixed(2)} MP`),
      tile(t('stp.gpu'), `${Math.round(result.relativeGpu * 100)}%`),
    ].join('');
    $('#stpQuality').textContent = `${t(result.qualityKey)}. ${t('stp.explain')}`;
  }
  scale.addEventListener('input', renderStp); stp.onclick = () => { toggle(stp); renderStp(); }; renderStp();

  const buttons = $$('#psoSeg button');
  const placement = { runtime: ['72%', '18%'], sync: ['20%', '48%'], async: ['42%', '35%'] };
  function renderPso(button) {
    press(buttons, candidate => candidate === button);
    const [left, top] = placement[button.dataset.v];
    $('#psoSpike').style.left = left; $('#psoSpike').style.top = top;
    $('#psoExplanation').textContent = t('pso.copy')[button.dataset.v];
  }
  buttons.forEach(button => button.onclick = () => renderPso(button)); renderPso(buttons[0]);
  return () => { renderStp(); renderPso(buttons.find(bool) || buttons[0]); };
}

function initDiagnostics() {
  const buttons = $$('#symptoms button');
  function render(button) {
    press(buttons, candidate => candidate === button);
    const [tool, first, actions] = t('perf.data')[button.dataset.symptom];
    $('#diagnosticTool').textContent = tool;
    $('#diagnosticFirst').textContent = first;
    $('#diagnosticActions').innerHTML = actions.map(action => `<li>${action}</li>`).join('');
  }
  buttons.forEach(button => button.onclick = () => render(button)); render(buttons[0]);
  return () => render(buttons.find(bool) || buttons[0]);
}

function initInterview() {
  const filters = $$('#qaFilters button');
  let category = 'all';
  function render() {
    $('#decisionBody').innerHTML = t('cheat.rows').map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('');
    const items = t('qa.items').filter(item => category === 'all' || item.category === category);
    $('#qaCount').textContent = t('qa.count', items.length);
    $('#qa').innerHTML = items.map((item, index) => `<details data-category="${item.category}"><summary><span class="q">Q${String(index + 1).padStart(2, '0')}</span><span>${item.q}</span></summary><div class="a"><p>${item.a}</p></div></details>`).join('');
  }
  filters.forEach(button => button.onclick = () => { category = button.dataset.category; press(filters, candidate => candidate === button); render(); });
  render();
  return render;
}

const refreshers = [
  initRendererLab(), initMsaaLab(), initShadowLab(), initLightModes(), initProbeLab(), initShaderLab(),
  initGraphLab(), initMergeLab(), initPostLab(), initUnity6Lab(), initDiagnostics(), initInterview(),
];
onLang(() => refreshers.forEach(render => render()));
