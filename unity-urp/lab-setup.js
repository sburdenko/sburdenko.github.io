/** CH.00 map, CH.01 settings, CH.02 renderer + MSAA, CH.03 GPU Resident Drawer. */
import { $, fitCanvas, clamp, fmt, fmtI } from '../assets/vhs.js?v=202609252015';
import { t } from '../assets/i18n.js?v=202609252015';
import { bindSeg, isPressed, togglePressed, tile } from '../assets/lab.js?v=202609252015';
import { LOCATIONS, SETTINGS, settingsIn, quizOrder, chooseRenderer, RENDERER_KEYS, residentDrawer, GRD_REQUIREMENTS } from './model-setup.js?v=202609252015';
import { MSAA_PATTERNS, msaaCoverage, msaaCost } from './model-output.js?v=202609252015';

export function initMap() {
  function render() {
    $('#frameMap').innerHTML = t('map.items').map(([chapter, title, hint], i) =>
      `<a href="#${chapter}"><span>${String(i + 1).padStart(2, '0')}</span><b>${title}</b><small>${hint}</small></a>`).join('');
  }
  render();
  return render;
}

export function initShaderTable() {
  function render() {
    $('#shaderTable').innerHTML = t('setup.shaders').map(([name, model, use]) =>
      `<tr><td>${name}</td><td>${model}</td><td>${use}</td></tr>`).join('');
  }
  render();
  return render;
}

/* ---------------- Where does this setting live? ---------------- */
export function initSettings() {
  const order = quizOrder();
  let mode = 'quiz', index = 0, score = 0, answered = 0, browse = 'asset', feedback = null;
  bindSeg($('#settingsMode'), value => { mode = value; feedback = null; render(); });

  $('#settingsLocations').addEventListener('click', event => {
    const button = event.target.closest('button[data-l]');
    if (!button) return;
    if (mode === 'browse') { browse = button.dataset.l; render(); return; }
    if (feedback) { index = (index + 1) % order.length; feedback = null; render(); return; }
    const correct = SETTINGS[order[index]] === button.dataset.l;
    answered++;
    if (correct) score++;
    feedback = { picked: button.dataset.l, correct };
    render();
  });

  function render() {
    const names = t('settings.locations');
    const setting = order[index];
    const answer = SETTINGS[setting];
    $('#settingsLocations').innerHTML = LOCATIONS.map(location => {
      const cls = mode === 'browse'
        ? (location === browse ? 'on' : '')
        : !feedback ? '' : location === answer ? 'right' : location === feedback.picked ? 'wrong' : '';
      return `<button data-l="${location}" class="${cls}"><b>${names[location][0]}</b><small>${names[location][1]}</small></button>`;
    }).join('');
    if (mode === 'browse') {
      $('#settingsQuestion').innerHTML = `<span class="lbl">${names[browse][0]}</span><div class="chips">${settingsIn(browse).map(s => `<span>${s}</span>`).join('')}</div>`;
      $('#settingsResult').innerHTML = t('settings.browseHint');
      return;
    }
    $('#settingsQuestion').innerHTML = `<span class="lbl">${t('settings.where', index + 1, order.length)}</span><strong>${setting}</strong>`;
    $('#settingsResult').innerHTML = feedback
      ? `${feedback.correct ? t('settings.right') : t('settings.wrong', names[answer][0])} ${t('settings.score', score, answered)} <i>${t('settings.next')}</i>`
      : t('settings.score', score, answered);
  }
  render();
  return render;
}

/* ---------------- Renderer ---------------- */
const CHECKS = ['msaa', 'grd', 'vertexLighting', 'overlayCameras'];

export function initRenderer() {
  const state = { msaa: true, grd: false, vertexLighting: false, overlayCameras: false };
  const inputs = { perObject: $('#rPerObject'), onScreen: $('#rOnScreen'), transparent: $('#rTransparent') };
  let platform = 'desktop';
  bindSeg($('#rPlatform'), value => { platform = value; render(); });
  $('#rendererChecks').addEventListener('click', event => {
    const button = event.target.closest('button[data-k]');
    if (!button) return;
    state[button.dataset.k] = !state[button.dataset.k];
    render();
  });
  Object.values(inputs).forEach(input => input.addEventListener('input', render));

  function renderTable() {
    $('#rendererTable').innerHTML = t('renderer.rows').map(([label, ...cells]) =>
      `<tr><td>${label}</td>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  }

  function render() {
    const labels = t('renderer.checks');
    $('#rendererChecks').innerHTML = CHECKS.map(key =>
      `<button class="check" data-k="${key}" aria-pressed="${state[key]}"><span>${labels[key]}</span><span class="sw">${t(state[key] ? 'chk.yes' : 'chk.no')}</span></button>`).join('');
    $('#rPerObjectOut').textContent = inputs.perObject.value;
    $('#rOnScreenOut').textContent = inputs.onScreen.value;
    $('#rTransparentOut').textContent = `${inputs.transparent.value}%`;
    const result = chooseRenderer({
      ...state,
      lightsPerObject: +inputs.perObject.value,
      lightsOnScreen: +inputs.onScreen.value,
      transparentShare: +inputs.transparent.value,
      platform,
    });
    const names = t('renderer.names');
    const failNames = t('renderer.fails');
    $('#rendererVerdicts').innerHTML = RENDERER_KEYS.map(key => {
      const verdict = result.verdicts.find(v => v.key === key);
      const best = result.best === key;
      const status = verdict.failed.length ? 'out' : best ? 'best' : 'ok';
      const body = verdict.failed.length
        ? `<ul>${verdict.failed.map(f => `<li>${failNames[f]}</li>`).join('')}</ul>`
        : `<p>${t('renderer.ideas')[key]}</p>`;
      return `<article class="verdict-card ${status}"><span class="lbl">${t('renderer.status.' + status)}</span><h4>${names[key]}</h4>${body}</article>`;
    }).join('') + (result.best ? '' : `<p class="toast">${t('renderer.none')}</p>`)
      + result.notes.map(note => `<p class="reason">${t('renderer.note.' + note.key, ...note.args)}</p>`).join('');
  }
  renderTable();
  render();
  return () => { renderTable(); render(); };
}

/* ---------------- MSAA ---------------- */
export function initMsaa() {
  const canvas = $('#msaaCanvas'), edge = $('#msaaEdge');
  let samples = 4, problem = 'geometry';
  bindSeg($('#msaaSamples'), value => { samples = +value; render(); });
  bindSeg($('#msaaProblem'), value => { problem = value; render(); });
  edge.addEventListener('input', render);
  addEventListener('resize', render);

  function paint() {
    const { c, w, h } = fitCanvas(canvas, canvas.clientWidth < 620 ? 320 : 380);
    const columns = 10, rows = 6, pad = 20;
    const cell = Math.min((w - pad * 2) / columns, (h - pad * 2) / rows);
    const left = (w - cell * columns) / 2, top = (h - cell * rows) / 2;
    const slope = -0.35, edgeLine = 2.1 + (+edge.value / 100) * 3.1;
    const selectedX = Math.floor(columns / 2);
    const selectedY = clamp(Math.floor(slope * (selectedX + 0.5) + edgeLine), 0, rows - 1);
    c.fillStyle = '#08050f'; c.fillRect(0, 0, w, h);
    let selected = null;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const result = msaaCoverage({ samples, pixelX: x, pixelY: y, slope, edge: edgeLine });
        const px = left + x * cell, py = top + y * cell;
        c.fillStyle = `rgba(38,227,234,${0.05 + result.coverage * 0.68})`;
        c.fillRect(px, py, cell, cell);
        c.strokeStyle = '#493b66'; c.lineWidth = 1; c.strokeRect(px, py, cell, cell);
        MSAA_PATTERNS[samples].forEach(([sx, sy], i) => {
          c.fillStyle = result.mask[i] ? '#5dfc9a' : '#ff5c87';
          c.beginPath(); c.arc(px + sx * cell, py + sy * cell, samples > 4 ? 2.2 : 3, 0, Math.PI * 2); c.fill();
        });
        if (x === selectedX && y === selectedY) selected = result;
      }
    }
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(left, top + edgeLine * cell); c.lineTo(left + columns * cell, top + (slope * columns + edgeLine) * cell); c.stroke();
    c.strokeStyle = '#fff'; c.strokeRect(left + selectedX * cell + 2, top + selectedY * cell + 2, cell - 4, cell - 4);
    return selected;
  }

  function render() {
    const coverage = paint();
    const cost = msaaCost(samples);
    const [title, copy] = t('msaa.problemData')[problem];
    $('#msaaEdgeOut').textContent = `${edge.value}%`;
    $('#msaaMode').textContent = `${samples}× MSAA`;
    $('#msaaVerdict').textContent = t(`msaa.verdict.${problem}`);
    $('#msaaVerdict').dataset.verdict = problem;
    $('#msaaProblemTitle').textContent = title;
    $('#msaaProblemCopy').innerHTML = copy;
    $('#msaaMask').innerHTML = MSAA_PATTERNS[samples].map(([x, y], i) =>
      `<i class="${coverage.mask[i] ? 'covered' : ''}" style="left:${x * 100}%;top:${y * 100}%"></i>`).join('');
    $('#msaaResolve').textContent = t('msaa.resolve', coverage.covered, samples, Math.round(coverage.coverage * 100));
    $('#msaaStats').innerHTML = [
      tile(t('msaa.coverageStat'), `${Math.round(coverage.coverage * 100)}%`, t('msaa.coverageDetail')),
      tile(t('msaa.testsStat'), `${samples}×`, t('msaa.perPixel')),
      tile(t('msaa.memoryStat'), `${fmt(cost.attachmentMemoryMB, 1)} MB`, t('msaa.memoryDetail')),
      tile(t('msaa.resolveStat'), samples > 1 ? `${fmt(cost.resolveTargetMB, 1)} MB` : '—', samples > 1 ? t('msaa.oneFinal') : t('msaa.noResolve')),
    ].join('');
  }
  render();
  return render;
}

/* ---------------- GPU Resident Drawer ---------------- */
export function initGrd() {
  const enabled = Object.fromEntries(GRD_REQUIREMENTS.map(key => [key, true]));
  const inputs = { mesh: $('#grdMesh'), pairs: $('#grdPairs'), skinned: $('#grdSkinned'), particles: $('#grdParticles'), occluded: $('#grdOccluded') };
  $('#grdChecks').addEventListener('click', event => {
    const button = event.target.closest('button[data-k]');
    if (!button) return;
    enabled[button.dataset.k] = !enabled[button.dataset.k];
    render();
  });
  $('#grdOcclusion').onclick = () => { togglePressed($('#grdOcclusion')); render(); };
  Object.values(inputs).forEach(input => input.addEventListener('input', render));

  function render() {
    const labels = t('grd.checks');
    $('#grdChecks').innerHTML = GRD_REQUIREMENTS.map(key =>
      `<button class="check" data-k="${key}" aria-pressed="${enabled[key]}"><span>${labels[key]}</span><span class="sw">${t(enabled[key] ? 'chk.yes' : 'chk.no')}</span></button>`).join('');
    const scene = {
      meshRenderers: +inputs.mesh.value, uniquePairs: +inputs.pairs.value, skinned: +inputs.skinned.value,
      particles: +inputs.particles.value, occluded: +inputs.occluded.value, occlusionCulling: isPressed($('#grdOcclusion')),
    };
    $('#grdMeshOut').textContent = fmtI(scene.meshRenderers);
    $('#grdPairsOut').textContent = fmtI(scene.uniquePairs);
    $('#grdSkinnedOut').textContent = scene.skinned;
    $('#grdParticlesOut').textContent = scene.particles;
    $('#grdOccludedOut').textContent = `${scene.occluded}%`;
    const result = residentDrawer({ ...scene, enabled });
    const badge = $('#grdBadge');
    badge.className = `badge ${result.active ? 'ok' : 'no'}`;
    badge.textContent = result.active ? t('grd.badgeOn') : t('grd.badgeOff', result.missing.map(key => labels[key]).join(', '));
    const max = Math.max(result.before, 1);
    $('#grdBars').innerHTML = `
      <div class="mb"><div class="top"><span>${t('grd.barBefore')}</span><b>${fmtI(result.before)}</b></div><div class="track"><i style="width:100%;background:var(--bad)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('grd.barAfter')}</span><b>${fmtI(result.after)}</b></div><div class="track"><i style="width:${result.after / max * 100}%;background:var(--ok)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('grd.barInstances')}</span><b>${fmtI(result.instancesDrawn)}</b></div><div class="track"><i style="width:${result.instancesDrawn / Math.max(1, scene.meshRenderers) * 100}%;background:var(--gpu)"></i></div></div>`;
    $('#grdNote').innerHTML = t('grd.note', result.fallback, scene.occlusionCulling && result.active);
  }
  render();
  return render;
}

