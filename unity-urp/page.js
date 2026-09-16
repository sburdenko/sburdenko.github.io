import { $, $$, bootVhs, fitCanvas, press, clamp } from '../assets/vhs.js?v=202609161105';
import {
  RENDERERS,
  buildFrameGraph,
  chooseRenderer,
  diagnose,
  probeRecommendation,
  shadowBudget,
  upscalingModel,
} from './model.js?v=202609161105';

bootVhs();

const bool = button => button.getAttribute('aria-pressed') === 'true';
const toggle = button => button.setAttribute('aria-pressed', bool(button) ? 'false' : 'true');
const tile = (label, value, detail = '') => `<div class="tile"><span class="lbl">${label}</span><span class="val">${value}</span><span class="d">${detail}</span></div>`;

function initRendererLab() {
  const lights = $('#lightCount'), transparent = $('#transparent'), msaa = $('#msaaToggle');
  const targets = $$('#targetSeg button');
  const cards = $('#rendererCards');
  cards.innerHTML = Object.entries(RENDERERS).map(([key, renderer]) => `
    <article class="renderer-card" data-renderer="${key}">
      <h4>${renderer.name}</h4><p>${renderer.idea}</p>
      <ul><li>${renderer.wins.slice(0, 2).join('</li><li>')}</li></ul>
    </article>`).join('');

  function render() {
    const result = chooseRenderer({
      lights: +lights.value,
      transparent: +transparent.value,
      msaa: bool(msaa),
      mobile: targets.find(button => bool(button)).dataset.v === 'mobile',
    });
    $('#lightOut').textContent = lights.value;
    $('#transparentOut').textContent = `${transparent.value}%`;
    $('#rendererName').textContent = RENDERERS[result.key].name;
    $('#rendererIdea').textContent = RENDERERS[result.key].idea;
    $('#rendererReason').textContent = result.reason;
    const max = Math.max(...Object.values(result.scores), 1);
    $('#rendererScores').innerHTML = Object.entries(result.scores).map(([key, score]) => `
      <div class="score-row"><span>${RENDERERS[key].name}</span><i style="width:${Math.max(0, score) / max * 100}%"></i><b>${score}</b></div>`).join('');
    $$('.renderer-card', cards).forEach(card => card.classList.toggle('selected', card.dataset.renderer === result.key));
  }
  [lights, transparent].forEach(input => input.addEventListener('input', render));
  msaa.onclick = () => { toggle(msaa); render(); };
  targets.forEach(button => button.onclick = () => { press(targets, candidate => candidate === button); render(); });
  render();
}

function initShadowLab() {
  const controls = {
    resolution: $('#shadowResolution'), distance: $('#shadowDistance'), cascades: $('#cascades'),
    spotLights: $('#spotLights'), pointLights: $('#pointLights'), soft: $('#softToggle'),
  };
  const canvas = $('#shadowCanvas');
  let latest;
  function paint() {
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 300 : 360);
    const distance = +controls.distance.value, cascades = +controls.cascades.value;
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#08050f'; c.fillRect(0, 0, w, h);
    const horizon = h * .62;
    const gradient = c.createLinearGradient(0, 0, 0, horizon);
    gradient.addColorStop(0, '#171348'); gradient.addColorStop(1, '#6a315c');
    c.fillStyle = gradient; c.fillRect(0, 0, w, horizon);
    c.fillStyle = '#171025'; c.fillRect(0, horizon, w, h - horizon);
    c.fillStyle = '#ffd76a'; c.beginPath(); c.arc(w * .82, h * .2, 22, 0, Math.PI * 2); c.fill();
    const start = 46, end = w - 35, usable = end - start;
    c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.setLineDash([6, 5]);
    c.beginPath(); c.moveTo(start, horizon + 40); c.lineTo(end, horizon + 40); c.stroke(); c.setLineDash([]);
    const palette = ['#ff3ea544', '#8a4dff44', '#26e3ea44', '#5dfc9a44'];
    let previous = start;
    for (let i = 0; i < cascades; i++) {
      const fraction = (i + 1) / cascades;
      const next = start + usable * fraction ** 1.35;
      c.fillStyle = palette[i]; c.fillRect(previous, 36, next - previous, horizon - 36);
      c.strokeStyle = palette[i].slice(0, 7); c.strokeRect(previous, 36, next - previous, horizon - 36);
      c.fillStyle = '#e9e2ff'; c.font = '11px JetBrains Mono'; c.fillText(`C${i + 1}`, previous + 8, 54);
      previous = next;
    }
    const poles = Math.max(3, Math.round(distance / 20));
    for (let i = 1; i <= poles; i++) {
      const x = start + usable * i / poles;
      const height = 80 * (1 - i / (poles + 3));
      c.fillStyle = '#ddd5f5'; c.fillRect(x - 3, horizon - height, 6, height);
      c.fillStyle = `rgba(0,0,0,${controls.soft && bool(controls.soft) ? .36 : .62})`;
      c.beginPath(); c.ellipse(x + height * .48, horizon + 8, height * .56, 7, 0, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#ff3ea5'; c.fillRect(20, horizon - 28, 22, 28);
    c.fillStyle = '#ffbadc'; c.font = '11px JetBrains Mono'; c.fillText('CAM', 16, horizon - 36);
    c.fillStyle = '#ffd23f'; c.fillText(`${distance} m`, end - 30, horizon + 62);
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
    $('#shadowQuality').textContent = latest.quality.toUpperCase();
    $('#shadowStats').innerHTML = [
      tile('Shadow maps', latest.maps, 'Point Light = 6'),
      tile('Main map memory', `${latest.mainMemoryMB.toFixed(1)} MB`, '32-bit teaching estimate'),
      tile('Texels / meter', latest.density.toFixed(1), latest.quality),
      tile('Relative cost', `${latest.relativeCost.toFixed(1)}×`, 'compare settings here'),
    ].join('');
    $('#shadowAdvice').textContent = latest.warning;
    paint();
  }
  Object.values(controls).forEach(control => {
    if (control.tagName === 'BUTTON') control.onclick = () => { toggle(control); render(); };
    else control.addEventListener('input', render);
  });
  addEventListener('resize', paint);
  render();
}

function initLightModes() {
  const buttons = $$('#lightModes .seg button');
  const data = {
    realtime: [
      ['Moves?', 'Lights and objects can move freely.'], ['Runtime cost', 'Highest: direct light and shadows update every frame.'], ['Use when', 'Gameplay changes lighting or shadow casters continuously.'],
    ],
    mixed: [
      ['Moves?', 'Dynamic objects receive real-time direct light; static indirect light is baked.'], ['Runtime cost', 'Middle ground. Shadowmask extends static shadows beyond dynamic distance.'], ['Use when', 'A mostly static world still has moving characters and lights.'],
    ],
    baked: [
      ['Moves?', 'Baked lights cannot change at runtime. Dynamic objects need probes.'], ['Runtime cost', 'Lowest lighting cost; textures carry static diffuse illumination.'], ['Use when', 'Architecture and lighting stay fixed.'],
    ],
  };
  const render = button => {
    press(buttons, candidate => candidate === button);
    const mode = button.dataset.v;
    $('#modeFacts').innerHTML = data[mode].map(([name, text]) => `<div><b>${name}</b><p>${text}</p></div>`).join('');
    $('.light-mode-scene').dataset.mode = mode;
    $('.dynamic-ball').style.filter = mode === 'baked' ? 'brightness(.65)' : 'none';
    $('.mode-rays').style.opacity = mode === 'baked' ? '.25' : mode === 'mixed' ? '.65' : '1';
  };
  buttons.forEach(button => button.onclick = () => render(button));
  render(buttons[0]);
}

function initProbeLab() {
  const canvas = $('#probeCanvas'), position = $('#objectPosition'), time = $('#timeBlend');
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
    const palette = colors(day);
    const probes = palette.map((color, i) => ({ x: w * (.12 + i * .19), y: h * (.25 + (i % 2) * .48), color }));
    const x = w * +position.value / 100, y = h * .53;
    c.fillStyle = day > .45 ? '#2a2855' : '#090d25'; c.fillRect(0, 0, w, h);
    const mix = [0, 0, 0], weights = probes.map(probe => 1 / Math.max(18, Math.hypot(x - probe.x, y - probe.y)));
    const total = weights.reduce((a, b) => a + b, 0);
    probes.forEach((probe, i) => {
      const weight = weights[i] / total;
      for (let channel = 0; channel < 3; channel++) mix[channel] += probe.color[channel] * weight;
      c.strokeStyle = `rgba(${probe.color.join(',')},${.15 + weight})`; c.lineWidth = 1 + weight * 8;
      c.beginPath(); c.moveTo(probe.x, probe.y); c.lineTo(x, y); c.stroke();
      c.fillStyle = `rgb(${probe.color.join(',')})`; c.shadowColor = c.fillStyle; c.shadowBlur = 18;
      c.beginPath(); c.arc(probe.x, probe.y, 8 + weight * 12, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
      c.fillStyle = '#efeaff'; c.font = '10px JetBrains Mono'; c.fillText(`${Math.round(weight * 100)}%`, probe.x - 12, probe.y - 16);
    });
    const color = mix.map(Math.round);
    const gradient = c.createRadialGradient(x - 15, y - 18, 4, x, y, 45);
    gradient.addColorStop(0, '#fff'); gradient.addColorStop(.18, `rgb(${color.join(',')})`); gradient.addColorStop(1, '#171025');
    c.fillStyle = gradient; c.beginPath(); c.arc(x, y, 42, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#efeaff'; c.font = '11px JetBrains Mono'; c.fillText('DYNAMIC OBJECT', x - 50, y + 67);
    $('#probeReadout').textContent = `RGB ${color.join(' · ')}`;
  }
  function render() {
    $('#objectOut').textContent = `${position.value}%`;
    $('#timeOut').textContent = +time.value < 50 ? 'DAY' : 'NIGHT';
    const result = probeRecommendation({ dynamicObjects: checks.dynamic, largeWorld: checks.large, lightingChanges: checks.changing });
    $('#probeChoice').textContent = result.name;
    $('#probeWhy').textContent = result.why;
    $('#probeWatch').textContent = result.watch;
    paint();
  }
  [position, time].forEach(input => input.addEventListener('input', render));
  probeButtons.forEach(button => button.onclick = () => {
    checks[button.dataset.probe] = !checks[button.dataset.probe];
    button.setAttribute('aria-pressed', checks[button.dataset.probe]);
    $('.sw', button).textContent = checks[button.dataset.probe] ? 'YES' : 'NO';
    render();
  });
  addEventListener('resize', paint);
  render();
}

function initShaderLab() {
  const buttons = $$('#shaderPasses button'), object = $('.shader-object');
  const snippets = {
    forward: 'Tags { "LightMode" = "UniversalForward" }\n// Vertex + fragment stages produce the visible surface.',
    shadow: 'Tags { "LightMode" = "ShadowCaster" }\n// Writes object depth into the light\'s shadow map.',
    depth: 'Tags { "LightMode" = "DepthOnly" }\nColorMask R\n// Makes depth-based effects see this object.',
  };
  function render(focused = 'forward') {
    const active = Object.fromEntries(buttons.map(button => [button.dataset.pass, bool(button)]));
    object.classList.toggle('unlit', !active.forward);
    object.classList.toggle('no-shadow', !active.shadow);
    object.classList.toggle('no-depth', !active.depth);
    $('#shaderPreviewLabel').textContent = `${active.forward ? 'VISIBLE' : 'NO FORWARD PASS'} · ${active.shadow ? 'CASTS SHADOW' : 'NO SHADOW'} · ${active.depth ? 'IN DEPTH' : 'MISSING FROM DEPTH'}`;
    $('#shaderCode').textContent = snippets[focused];
  }
  buttons.forEach(button => button.onclick = () => { toggle(button); render(button.dataset.pass); });
  render();
}

function initGraphLab() {
  const toggles = $$('.graph-toggle');
  function render() {
    const settings = Object.fromEntries(toggles.map(button => [button.dataset.feature, bool(button)]));
    const graph = buildFrameGraph(settings);
    $('#frameGraph').innerHTML = graph.passes.map(pass => `<div class="pass-card"><b>${pass.name}</b><small>READ ${pass.reads.join(', ')}</small><small>WRITE ${pass.writes.join(', ')}</small></div>`).join('');
    const header = `<div class="resource-row resource-head" style="--pass-count:${graph.passes.length}"><b>RESOURCE</b>${graph.passes.map(pass => `<span class="life-cell">${pass.name}</span>`).join('')}</div>`;
    $('#resourceTable').innerHTML = header + graph.resources.map(resource => `
      <div class="resource-row" style="--pass-count:${graph.passes.length}"><b>${resource.name}</b>${graph.passes.map((_, index) => `<span class="life-cell${index >= resource.first && index <= resource.last ? ' alive' : ''}"></span>`).join('')}</div>`).join('');
  }
  toggles.forEach(button => button.onclick = () => { toggle(button); render(); });
  render();
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
      ? 'Outside the Local Volume: only Global Volume settings apply.'
      : blend === 1
        ? 'Inside the Local Volume: its overrides have full weight.'
        : `Blend weight ${Math.round(blend * 100)}%: local overrides mix with the global profile.`;
  }
  position.addEventListener('input', render);
  [...toggles, overlay].forEach(button => button.onclick = () => { toggle(button); render(); });
  render();
}

function initUnity6Lab() {
  const scale = $('#renderScale'), stp = $('#stpToggle');
  function renderStp() {
    const value = +scale.value / 100, result = upscalingModel({ scale: value, stp: bool(stp) });
    $('#scaleOut').textContent = `${scale.value}%`;
    $('#internalPixels').style.setProperty('--pixel-size', `${Math.round(7 / value)}px`);
    $('#internalPixels').textContent = `${Math.round(1920 * value)} × ${Math.round(1080 * value)}`;
    $('#stpStats').innerHTML = [
      tile('Internal pixels', `${result.internalMP.toFixed(2)} MP`),
      tile('Output pixels', `${result.outputMP.toFixed(2)} MP`),
      tile('Relative GPU', `${Math.round(result.relativeGpu * 100)}%`),
    ].join('');
    $('#stpQuality').textContent = `${result.quality}. STP spends some reconstruction work to avoid shading every output pixel.`;
  }
  scale.addEventListener('input', renderStp); stp.onclick = () => { toggle(stp); renderStp(); }; renderStp();

  const buttons = $$('#psoSeg button');
  const copy = {
    runtime: ['72%', '18%', 'A new graphics state is compiled during gameplay: the frame hitches exactly when the player first sees it.'],
    sync: ['20%', '48%', 'Precook during loading: the load takes longer, but gameplay starts with the required PSOs ready.'],
    async: ['42%', '35%', 'Warm in the background: no blocking spike, but temporary CPU pressure can compete with the game.'],
  };
  function renderPso(button) {
    press(buttons, candidate => candidate === button);
    const [left, top, text] = copy[button.dataset.v];
    $('#psoSpike').style.left = left; $('#psoSpike').style.top = top;
    $('#psoExplanation').textContent = text;
  }
  buttons.forEach(button => button.onclick = () => renderPso(button)); renderPso(buttons[0]);
}

function initDiagnostics() {
  const buttons = $$('#symptoms button');
  function render(button) {
    press(buttons, candidate => candidate === button);
    const result = diagnose(button.dataset.symptom);
    $('#diagnosticTool').textContent = result.tool;
    $('#diagnosticFirst').textContent = result.first;
    $('#diagnosticActions').innerHTML = result.actions.map(action => `<li>${action}</li>`).join('');
  }
  buttons.forEach(button => button.onclick = () => render(button)); render(buttons[0]);
}

initRendererLab();
initShadowLab();
initLightModes();
initProbeLab();
initShaderLab();
initGraphLab();
initPostLab();
initUnity6Lab();
initDiagnostics();
