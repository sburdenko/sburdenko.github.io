/** CH.08 shader steps + Fresnel halo, CH.09 Render Objects, Render Graph and pass merging. */
import { $, $$, fitCanvas, clamp } from '../assets/vhs.js?v=202609162304';
import { t } from '../assets/i18n.js?v=202609162304';
import { bindSeg, isPressed, setPressed, togglePressed, tile } from '../assets/lab.js?v=202609162304';
import { renderCode } from '../assets/code.js?v=202609162304';
import { SHADERS, SNIPPETS } from './snippets.js?v=202609162304';
import {
  SHADER_STEPS, SHADER_CAPS, addedLines, fresnelHaloAlpha, lambert, silhouetteSummary, buildFrameGraph, nativePasses,
} from './model-frame.js?v=202609162304';

const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/* ---------------- Five shaders from the book ---------------- */
export function initShaderSteps() {
  const canvas = $('#shaderCanvas'), color = $('#shaderColor'), light = $('#shaderLight'), strength = $('#shaderShadow'), caster = $('#shaderCaster');
  let step = 'unlit';
  const seg = $('#shaderSteps');
  seg.innerHTML = SHADER_STEPS.map((key, i) => `<button data-v="${key}" aria-pressed="${i === 0}"></button>`).join('');
  bindSeg(seg, value => { step = value; render(); });
  [color, light, strength].forEach(input => input.addEventListener('input', paint));
  caster.onclick = () => { togglePressed(caster); paint(); };
  addEventListener('resize', paint);

  function paint() {
    const caps = SHADER_CAPS[step];
    const { c, w, h } = fitCanvas(canvas, 300);
    c.fillStyle = '#1b1231'; c.fillRect(0, 0, w, h);
    const floorY = h * 0.78;
    const angle = (+light.value * Math.PI) / 180;
    const lightDir = [Math.sin(angle), Math.cos(angle) * 0.8, 0.6];
    const norm = Math.hypot(...lightDir);
    const L = lightDir.map(v => v / norm);
    const base = caps.color ? hexToRgb(color.value) : [255, 255, 255];
    const cx = w / 2, cy = floorY - 90, rx = 46, ry = 86;

    c.fillStyle = '#2a2046'; c.fillRect(0, floorY, w, h - floorY);
    const casterOn = step !== 'shadows' || isPressed(caster);
    if (caps.lambert || step === 'shadows') {
      if (casterOn) {
        c.fillStyle = 'rgba(0,0,0,.55)';
        c.beginPath(); c.ellipse(cx - L[0] * 70, floorY + 10, 60, 10, 0, 0, Math.PI * 2); c.fill();
      }
    }
    if (step === 'shadows') {
      const blocker = { x: cx + 80, y: floorY - 150 };
      c.fillStyle = '#5b4b86'; c.fillRect(blocker.x, blocker.y, 60, 16);
      c.fillStyle = '#8c82b0'; c.font = '10px JetBrains Mono'; c.fillText(t('shader.blocker'), blocker.x - 6, blocker.y - 6);
    }

    const steps = 64;
    for (let j = 0; j < steps; j++) {
      for (let i = 0; i < steps; i++) {
        const u = (i + 0.5) / steps * 2 - 1, v = (j + 0.5) / steps * 2 - 1;
        if (u * u + v * v > 1) continue;
        const nz = Math.sqrt(1 - u * u - v * v);
        const N = [u, -v, nz];
        let rgb = [...base];
        if (caps.texture) {
          const checker = (Math.floor((i / steps) * 8) + Math.floor((j / steps) * 12)) % 2;
          rgb = rgb.map(ch => ch * (checker ? 1 : 0.55));
        }
        if (caps.lambert) rgb = rgb.map(ch => ch * (0.08 + lambert(N, L)));
        if (caps.receives) {
          const shadowed = v < -0.3 + u * 0.25;
          const factor = shadowed ? Math.max(1 - +strength.value / 100, 0) : 1;
          rgb = rgb.map(ch => ch * factor);
        }
        c.fillStyle = `rgb(${rgb.map(ch => Math.round(clamp(ch, 0, 255))).join(',')})`;
        c.fillRect(cx + u * rx - rx / steps, cy + v * ry - ry / steps, (2 * rx) / steps + 1, (2 * ry) / steps + 1);
      }
    }
    $('#shaderLightOut').textContent = `${light.value}°`;
    $('#shaderShadowOut').textContent = (+strength.value / 100).toFixed(2);
  }

  function render() {
    const names = t('shader.steps');
    [...seg.children].forEach(button => { button.textContent = names[button.dataset.v]; });
    const caps = SHADER_CAPS[step];
    $$('#shaderControls [data-need]').forEach(el => { el.hidden = !caps[el.dataset.need]; });
    const index = SHADER_STEPS.indexOf(step);
    const previous = index ? SHADERS[SHADER_STEPS[index - 1]] : null;
    renderCode($('#shaderCode'), SHADERS[step], index ? addedLines(previous, SHADERS[step]) : []);
    $('#shaderName').textContent = `CustomURP/${t('shader.fileNames')[step]}`;
    $('#shaderBatcher').textContent = caps.cbuffer ? 'SRP BATCHER ✓' : 'NO PROPERTIES';
    $('#shaderExplain').innerHTML = t('shader.explain')[step];
    paint();
  }
  render();
  return render;
}

/* ---------------- Fresnel halo (Shader Graph) ---------------- */
export function initHalo() {
  const canvas = $('#haloCanvas'), power = $('#haloPower'), strength = $('#haloStrength');
  [power, strength].forEach(input => input.addEventListener('input', render));
  addEventListener('resize', render);
  function render() {
    const P = +power.value / 10, S = +strength.value / 100;
    $('#haloPowerOut').textContent = P.toFixed(1);
    $('#haloStrengthOut').textContent = S.toFixed(2);
    const { c, w, h } = fitCanvas(canvas, 260);
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a2046'; for (let x = 0; x < w; x += 28) c.fillRect(x, 0, 14, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.4;
    const steps = 90;
    for (let j = 0; j < steps; j++) {
      for (let i = 0; i < steps; i++) {
        const u = (i + 0.5) / steps * 2 - 1, v = (j + 0.5) / steps * 2 - 1, r2 = u * u + v * v;
        if (r2 > 1) continue;
        const alpha = fresnelHaloAlpha(Math.sqrt(1 - r2), P, S);
        c.fillStyle = `rgba(255,236,170,${alpha.toFixed(3)})`;
        c.fillRect(cx + u * R - R / steps, cy + v * R - R / steps, (2 * R) / steps + 1, (2 * R) / steps + 1);
      }
    }
    c.fillStyle = '#fff8d8'; c.beginPath(); c.arc(cx, cy, 5, 0, Math.PI * 2); c.fill();
  }
  render();
  return render;
}

/* ---------------- Render Objects silhouette ---------------- */
const SIL_CHECKS = ['excludeFromOpaque', 'silhouettePass', 'normalPass'];
const BOOK_SIL = { excludeFromOpaque: true, silhouettePass: true, normalPass: true, depthTest: 'greater' };

export function initSilhouette() {
  const canvas = $('#silCanvas');
  let options = { excludeFromOpaque: false, silhouettePass: false, normalPass: false, depthTest: 'greater' };
  const depthSeg = $('#silDepth');
  bindSeg(depthSeg, value => { options = { ...options, depthTest: value }; render(); });
  $('#silChecks').addEventListener('click', event => {
    const button = event.target.closest('button[data-k]');
    if (!button) return;
    options = { ...options, [button.dataset.k]: !options[button.dataset.k] };
    render();
  });
  $('#silBook').onclick = () => {
    options = { ...BOOK_SIL };
    $$('button', depthSeg).forEach(b => setPressed(b, b.dataset.v === 'greater'));
    render();
  };
  addEventListener('resize', render);

  function render() {
    const labels = t('sil.checks');
    $('#silChecks').innerHTML = SIL_CHECKS.map(key =>
      `<button class="check" data-k="${key}" aria-pressed="${options[key]}"><span>${labels[key]}</span><span class="sw">${t(options[key] ? 'chk.on' : 'chk.off')}</span></button>`).join('');
    const summary = silhouetteSummary(options);
    const { c, w, h } = fitCanvas(canvas, 240);
    c.fillStyle = '#120b20'; c.fillRect(0, 0, w, h);
    const colW = 16, cols = summary.cells.length, charX = w / 2 - (cols * colW) / 2, top = 40, height = 150;
    const COLORS = { character: '#ff3ea5', silhouette: '#26e3ea', wall: '#4a3b6e', missing: '#120b20' };
    summary.cells.forEach((cell, i) => {
      c.fillStyle = COLORS[cell.result];
      c.fillRect(charX + i * colW, top + (i % 2 ? 6 : 0), colW, height - (i % 2 ? 6 : 0));
    });
    c.fillStyle = 'rgba(74,59,110,.55)'; c.fillRect(0, 0, charX + 6 * colW, h);
    c.strokeStyle = '#8c82b0'; c.strokeRect(0, 0, charX + 6 * colW, h);
    c.fillStyle = '#fff'; c.font = '10px JetBrains Mono';
    c.fillText(t('sil.wall'), 10, h - 12);
    c.fillText(t('sil.hero'), charX + cols * colW + 8, top + 12);
    $('#silOut').innerHTML = summary.ok ? t('sil.ok') : summary.doubleDraw ? t('sil.double') : t('sil.issue', summary.cells.map(cell => cell.result));
  }
  render();
  return render;
}

/* ---------------- Render Graph ---------------- */
export function initGraph() {
  const toggles = $$('.graph-toggle'), step = $('#graphStep'), transport = $('#graphTransport');
  let phase = 'setup', cursor = 0, inspectedId = null;
  const phaseValue = bindSeg($('#graphPhaseSeg'), value => { phase = value; inspectedId = null; render(); });
  phase = phaseValue();
  const resourceName = id => t('graph.resourceNames')[id] || id;
  const passData = id => t('graph.pass')[id];

  function setPhase(next) {
    phase = next;
    $$('#graphPhaseSeg button').forEach(button => setPressed(button, button.dataset.v === next));
  }

  function render() {
    const settings = Object.fromEntries(toggles.map(button => [button.dataset.feature, isPressed(button)]));
    const graph = buildFrameGraph(settings);
    cursor = clamp(cursor, 0, graph.passes.length - 1);
    const shown = phase === 'execute' ? graph.passes : graph.declared;
    $('#graphPhaseCopy').innerHTML = t(`graph.phase.${phase}.copy`);
    $('#graphStats').innerHTML = [
      tile(t('graph.declared'), graph.declared.length),
      tile(t('graph.survived'), graph.passes.length),
      tile(t('graph.culled'), phase === 'setup' ? '?' : graph.culledCount),
      tile(t('graph.memory'), phase === 'setup' ? '?' : `${graph.transientMB} MB`, phase === 'setup' ? '' : t('graph.saved', graph.savedMB)),
    ].join('');
    $('#frameGraph').innerHTML = shown.map(pass => {
      const [name, purpose] = passData(pass.id);
      const active = phase === 'execute' && pass.activeIndex === cursor;
      const culled = phase !== 'setup' && pass.culled;
      return `<button class="pass-card${active ? ' active' : ''}${culled ? ' culled' : ''}" data-pass="${pass.id}">
        <span class="pass-state">${culled ? t('graph.culledBadge') : `${t('graph.read')} ${pass.reads.map(resourceName).join(', ')}`}</span>
        <b>${name}</b><small>${purpose}</small><small>${t('graph.write')} ${pass.writes.map(resourceName).join(', ')}</small>
      </button>`;
    }).join('');
    const head = `<div class="resource-row resource-head" style="--pass-count:${graph.passes.length}"><b>${t('graph.resource')}</b>${graph.passes.map(pass => `<span class="life-cell">${passData(pass.id)[0]}</span>`).join('')}</div>`;
    $('#resourceTable').innerHTML = head + graph.resources.map(resource => `
      <div class="resource-row" style="--pass-count:${graph.passes.length}"><b>${resourceName(resource.name)}<small>${resource.sizeMB} MB · ${t('graph.slot', resource.slot || '—')}</small></b>${graph.passes.map((pass, index) => {
        const alive = index >= resource.first && index <= resource.last;
        const touches = [...pass.reads, ...pass.writes].includes(resource.name);
        const access = phase === 'execute' && index === cursor && touches;
        const writes = pass.writes.includes(resource.name), reads = pass.reads.includes(resource.name);
        const cls = [alive ? 'alive' : '', index === resource.first ? 'born' : '', index === resource.last ? 'release' : '', access ? 'access' : ''].join(' ');
        return `<span class="life-cell ${cls}">${access ? (writes && reads ? 'R/W' : writes ? 'W' : 'R') : ''}</span>`;
      }).join('')}</div>`).join('');
    $('#resourceTable').classList.toggle('pending', phase === 'setup');
    transport.hidden = phase !== 'execute';
    step.max = Math.max(0, graph.passes.length - 1);
    step.value = cursor;
    $('#graphStepLabel').textContent = t('graph.step', cursor + 1, graph.passes.length);
    $('#graphPrev').disabled = cursor === 0;
    $('#graphNext').disabled = cursor === graph.passes.length - 1;

    if (phase === 'execute') {
      const pass = graph.passes[cursor], [name, purpose] = passData(pass.id);
      const allocate = graph.resources.filter(r => r.first === cursor && r.name !== 'camera').map(r => resourceName(r.name)).join(', ');
      const release = graph.resources.filter(r => r.last === cursor && r.name !== 'camera').map(r => resourceName(r.name)).join(', ');
      $('#graphFocus').innerHTML = `<span class="lbl">${t('graph.step', cursor + 1, graph.passes.length)}</span><strong>${name}</strong><p>${purpose}</p><small>${t('graph.events', allocate, release)}</small>`;
    } else if (phase === 'compile' && inspectedId) {
      const pass = graph.declared.find(candidate => candidate.id === inspectedId);
      const [name, purpose] = passData(pass.id);
      $('#graphFocus').innerHTML = `<span class="lbl">${pass.culled ? t('graph.culledBadge') : t('graph.survived')}</span><strong>${name}</strong><p>${purpose}</p>`;
    } else {
      $('#graphFocus').innerHTML = '';
    }

    $$('#frameGraph .pass-card').forEach(card => card.onclick = () => {
      const pass = graph.declared.find(candidate => candidate.id === card.dataset.pass);
      inspectedId = pass.id;
      if (!pass.culled && phase !== 'setup') { setPhase('execute'); cursor = pass.activeIndex; }
      else if (phase === 'setup') setPhase('compile');
      render();
    });
  }
  toggles.forEach(button => button.onclick = () => { togglePressed(button); render(); });
  step.addEventListener('input', () => { cursor = +step.value; render(); });
  $('#graphPrev').onclick = () => { cursor--; render(); };
  $('#graphNext').onclick = () => { cursor++; render(); };
  render();
  return render;
}

/* ---------------- Native pass merging ---------------- */
export function initMerge() {
  let depthMode = 'afterOpaques', downsampling = '2x', tint = 'texture';
  bindSeg($('#mergeDepthMode'), value => { depthMode = value; render(); });
  bindSeg($('#mergeDown'), value => { downsampling = value; render(); });
  bindSeg($('#mergeTint'), value => { tint = value; render(); });
  ['#mergeDepth', '#mergeOpaque', '#mergeFetch'].forEach(id => { $(id).onclick = () => { togglePressed($(id)); render(); }; });

  function render() {
    const result = nativePasses({
      depthTexture: isPressed($('#mergeDepth')), depthMode,
      opaqueTexture: isPressed($('#mergeOpaque')), downsampling,
      tint, fetchSupported: isPressed($('#mergeFetch')),
    });
    const names = t('merge.passes'), reasons = t('merge.reasons');
    $('#mergePasses').innerHTML = result.groups.map((group, i) => `
      <div class="native-pass">
        <span class="lbl">${t('merge.native', i + 1)}${group.reason ? ` · <em>${reasons[group.reason]}</em>` : ''}</span>
        <div class="ctl-row">${group.passes.map(id => `<span class="pass-chip">${names[id]}</span>`).join('')}</div>
      </div>`).join('');
    $('#mergeOut').innerHTML = result.merged ? t('merge.merged') : t('merge.broken', result.groups.length);
  }
  renderCode($('#mergeCode'), SNIPPETS.renderGraph);
  renderCode($('#mergeFetchCode'), SNIPPETS.renderGraphFetch);
  render();
  return render;
}
