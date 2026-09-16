import { $, $$, bootVhs, fitCanvas, press, clamp } from '../assets/vhs.js?v=202609161139';
import { initI18n, t, onLang } from '../assets/i18n.js?v=202609161139';
import { COMMON } from '../assets/i18n-common.js?v=202609161139';
import { DICT } from './i18n.js?v=202609161139';
import {
  RENDERERS,
  buildFrameGraph,
  chooseRenderer,
  probeRecommendation,
  shadowBudget,
  upscalingModel,
} from './model.js?v=202609161139';

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
    c.fillStyle = '#ffbadc'; c.font = '11px JetBrains Mono'; c.fillText(t('post.cam'), 16, horizon - 36);
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
  const buttons = $$('#lightModes .seg button');
  const render = button => {
    press(buttons, candidate => candidate === button);
    const mode = button.dataset.v;
    $('#modeFacts').innerHTML = t('modes.data')[mode].map(([name, text]) => `<div><b>${name}</b><p>${text}</p></div>`).join('');
    $('.light-mode-scene').dataset.mode = mode;
    $('.dynamic-ball').style.filter = mode === 'baked' ? 'brightness(.65)' : 'none';
    $('.mode-rays').style.opacity = mode === 'baked' ? '.25' : mode === 'mixed' ? '.65' : '1';
  };
  buttons.forEach(button => button.onclick = () => render(button));
  render(buttons[0]);
  return () => render(buttons.find(bool) || buttons[0]);
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
    c.fillStyle = '#efeaff'; c.font = '11px JetBrains Mono'; c.fillText(t('probes.object'), x - 50, y + 67);
    $('#probeReadout').textContent = `RGB ${color.join(' · ')}`;
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
  initRendererLab(), initShadowLab(), initLightModes(), initProbeLab(), initShaderLab(),
  initGraphLab(), initMergeLab(), initPostLab(), initUnity6Lab(), initDiagnostics(), initInterview(),
];
onLang(() => refreshers.forEach(render => render()));
