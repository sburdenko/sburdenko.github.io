/** CH.02 Factory, CH.03 Object Pool, CH.04 Singleton. */
import { $, fitCanvas, fmt, fmtI } from '../assets/vhs.js?v=202609241230';
import { t } from '../assets/i18n.js?v=202609241230';
import { bindSeg, isPressed, setPressed, togglePressed, tile, visibleLoop } from '../assets/lab.js?v=202609241230';
import { renderCode } from '../assets/code.js?v=202609241230';
import { SNIPPETS } from './snippets.js?v=202609241230';
import {
  factoryDesignCost, spawnTrace, createPoolState, poolStep, releaseTwice,
  bootSingleton, loadScene, addScore, currentScore,
} from './model-creation.js?v=202609241230';

const COLORS = { A: '#ff3ea5', B: '#26e3ea', C: '#ffd23f' };

/* ---------------- Factory ---------------- */
export function initFactory() {
  const canvas = $('#factoryCanvas');
  let factory = 'A', installed = ['A', 'B'], products = [], log = [], clock = 0;
  bindSeg($('#factorySeg'), value => { factory = value; });

  canvas.addEventListener('click', event => {
    const box = canvas.getBoundingClientRect();
    const position = { x: Math.round(event.clientX - box.left), y: Math.round(event.clientY - box.top) };
    const trace = spawnTrace(factory, position);
    products = [...products.slice(-24), { ...trace.product, id: factory, born: clock }];
    log = [...trace.calls.map(text => ({ text, kind: 'ok' })), ...log].slice(0, 12);
    renderSide();
  });
  $('#factoryAddC').onclick = () => {
    if (installed.includes('C')) return;
    installed = [...installed, 'C'];
    $('#factorySeg [data-v="C"]').hidden = false;
    $('#factoryAddC').disabled = true;
    renderSide();
  };
  $('#factoryClear').onclick = () => { products = []; log = []; renderSide(); };

  function renderSide() {
    $('#factoryCount').textContent = products.length;
    $('#factoryLog').innerHTML = log.map(line => `<div class="${line.kind}">${line.text}</div>`).join('');
    const sw = factoryDesignCost('switch', installed), fac = factoryDesignCost('factory', installed);
    $('#factoryCostSwitch').className = `cost-card ${sw.editsToClient ? 'bad' : ''}`;
    $('#factoryCostSwitch').innerHTML = t('factory.costSwitch', sw);
    $('#factoryCostFactory').className = 'cost-card good';
    $('#factoryCostFactory').innerHTML = t('factory.costFactory', fac);
  }

  function draw() {
    const { c, w, h } = fitCanvas(canvas, 300);
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.04)';
    for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    products.forEach(p => {
      const age = clock - p.born, color = COLORS[p.id];
      c.fillStyle = color;
      c.fillRect(p.x - 9, p.y - 9, 18, 18);
      if (p.effect === 'particles' && age < 1.2) {
        for (let i = 0; i < 10; i++) {
          const angle = i / 10 * Math.PI * 2, r = 12 + age * 60;
          c.globalAlpha = 1 - age / 1.2;
          c.fillRect(p.x + Math.cos(angle) * r - 2, p.y + Math.sin(angle) * r - 2, 4, 4);
        }
      }
      if (p.effect === 'sound' && age < 1.5) {
        c.strokeStyle = color; c.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const r = 12 + ((age * 50 + k * 16) % 48);
          c.globalAlpha = Math.max(0, 1 - r / 60) * (1 - age / 1.5);
          c.beginPath(); c.arc(p.x, p.y, r, -0.7, 0.7); c.stroke();
        }
      }
      if (p.effect === 'light') {
        const glow = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, 46);
        glow.addColorStop(0, 'rgba(255,210,63,.55)'); glow.addColorStop(1, 'rgba(255,210,63,0)');
        c.globalAlpha = Math.min(1, age * 2);
        c.fillStyle = glow; c.beginPath(); c.arc(p.x, p.y, 46, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
      c.fillStyle = '#fff'; c.font = '10px JetBrains Mono';
      c.fillText(p.type, p.x + 12, p.y - 12);
    });
    if (!products.length) {
      c.fillStyle = '#8c82b0'; c.font = '13px JetBrains Mono'; c.textAlign = 'center';
      c.fillText(t('factory.empty'), w / 2, h / 2); c.textAlign = 'left';
    }
  }

  visibleLoop(canvas, dt => { clock += dt; draw(); });
  renderCode($('#factoryCode'), SNIPPETS.factory);
  renderCode($('#factorySwitchCode'), SNIPPETS.factorySwitch);
  renderSide();
  draw();
  return () => { renderSide(); draw(); };
}

/* ---------------- Object Pool ---------------- */
export function initPool() {
  const canvas = $('#poolCanvas');
  const inputs = { rate: $('#poolRate'), life: $('#poolLife'), max: $('#poolMax'), warm: $('#poolWarm') };
  let mode = 'pool', state, history, burstUntil = -1;
  const modeValue = bindSeg($('#poolMode'), value => { mode = value; reset(); });
  mode = modeValue();

  const config = () => ({
    mode,
    fireRate: state.time < burstUntil ? 40 : +inputs.rate.value,
    lifetime: +inputs.life.value / 10,
    maxSize: +inputs.max.value,
    prewarm: +inputs.warm.value,
    firing: isPressed($('#poolFire')) || state.time < burstUntil,
  });

  function reset() {
    state = createPoolState({ mode, prewarm: +inputs.warm.value });
    history = [];
    burstUntil = -1;
    $('#poolToast').hidden = true;
    renderStats();
  }

  function step(dt) {
    if (!dt) { draw(); return; }
    const before = state;
    state = poolStep(state, config(), dt);
    history = [...history, { t: state.time, created: state.created - before.created, destroyed: state.destroyed - before.destroyed }]
      .filter(item => item.t > state.time - 8);
    draw();
    renderStats();
  }

  function renderStats() {
    $('#poolRateOut').textContent = `${inputs.rate.value}/s`;
    $('#poolLifeOut').textContent = `${fmt(+inputs.life.value / 10, 1)} s`;
    $('#poolMaxOut').textContent = inputs.max.value;
    $('#poolWarmOut').textContent = inputs.warm.value;
    $('#poolTime').textContent = `T ${fmt(state.time, 1)} s`;
    $('#poolGc').textContent = state.destroyed ? t('pool.garbage', state.destroyed) : t('pool.noGarbage');
    const pooled = mode === 'pool';
    $('#poolStats').innerHTML = [
      tile(t('pool.active'), state.active.length, 'CountActive', 'gpu-t'),
      tile(t('pool.inactive'), pooled ? state.inactive : '—', 'CountInactive'),
      tile(t('pool.created'), fmtI(state.created), pooled ? 'createFunc' : 'Instantiate', 'cpu-t'),
      tile(t('pool.destroyed'), fmtI(state.destroyed), pooled ? 'actionOnDestroy' : 'Destroy'),
      tile('Get', pooled ? fmtI(state.gets) : '—', 'actionOnGet'),
      tile('Release', pooled ? fmtI(state.releases) : '—', 'actionOnRelease'),
    ].join('');
  }

  function draw() {
    const { c, w, h } = fitCanvas(canvas, 300);
    const cfg = config();
    const lane = h * 0.58;
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#241842'; c.fillRect(14, lane / 2 - 18, 44, 36);
    c.fillStyle = '#ffd23f'; c.fillRect(58, lane / 2 - 5, 16, 10);
    const shelfX = w - 140;
    state.active.forEach(bullet => {
      const k = (state.time - bullet.bornAt) / cfg.lifetime;
      const x = 80 + k * (shelfX - 110);
      const y = lane / 2 + Math.sin(bullet.id * 1.7) * lane * 0.35;
      c.fillStyle = '#ff3ea5'; c.fillRect(x, y - 3, 14, 6);
    });
    c.strokeStyle = '#40316a'; c.strokeRect(shelfX, 40, 126, lane - 50);
    c.fillStyle = '#8c82b0'; c.font = '10px JetBrains Mono';
    c.fillText(mode === 'pool' ? `STACK · ${state.inactive}/${cfg.maxSize}` : 'NO POOL', shelfX + 6, 54);
    if (mode === 'pool') {
      const cols = 6, cell = 18;
      for (let i = 0; i < Math.min(state.inactive, 60); i++) {
        c.fillStyle = '#5dfc9a';
        c.fillRect(shelfX + 8 + (i % cols) * cell, 62 + Math.floor(i / cols) * 12, cell - 4, 8);
      }
    }
    const top = lane + 8, graphH = h - top - 18;
    c.fillStyle = '#120b20'; c.fillRect(0, top, w, graphH + 18);
    c.fillStyle = '#8c82b0'; c.fillText(t('pool.timeline'), 10, top + 12);
    history.forEach(item => {
      const x = w - (state.time - item.t) / 8 * w;
      if (item.created) { c.fillStyle = '#ff3ea5'; c.fillRect(x, top + 18, 2, graphH / 2 - 4); }
      if (item.destroyed) { c.fillStyle = '#ff5c6c'; c.fillRect(x, top + 18 + graphH / 2, 2, graphH / 2 - 4); }
    });
    c.fillStyle = '#ff3ea5'; c.fillText(t('pool.lineCreate'), w - 150, top + 12);
    c.fillStyle = '#ff5c6c'; c.fillText(t('pool.lineDestroy'), w - 150, h - 6);
  }

  $('#poolFire').onclick = () => {
    const holding = togglePressed($('#poolFire'));
    $('#poolFire').textContent = t(holding ? 'pool.hold' : 'pool.release');
  };
  $('#poolBurst').onclick = () => { setPressed($('#poolFire'), false); $('#poolFire').textContent = t('pool.release'); burstUntil = state.time + 0.6; };
  $('#poolReset').onclick = reset;
  $('#poolCheck').onclick = () => togglePressed($('#poolCheck'));
  $('#poolDouble').onclick = () => {
    const result = releaseTwice(state, isPressed($('#poolCheck')));
    state = result.state;
    const toast = $('#poolToast');
    toast.hidden = false;
    toast.innerHTML = result.error ? t('pool.doubleThrow') : t('pool.doubleCorrupt');
    renderStats();
  };
  Object.values(inputs).forEach(input => input.addEventListener('input', renderStats));
  inputs.warm.addEventListener('change', reset);

  reset();
  visibleLoop(canvas, step);
  renderCode($('#poolManualCode'), SNIPPETS.poolManual);
  renderCode($('#poolUnityCode'), SNIPPETS.poolUnity);
  return () => {
    $('#poolFire').textContent = t(isPressed($('#poolFire')) ? 'pool.hold' : 'pool.release');
    renderStats();
    draw();
  };
}

/* ---------------- Singleton ---------------- */
export function initSingleton() {
  let variant = 'simple', world;
  bindSeg($('#singletonVariant'), value => { variant = value; reset(); });
  const inB = $('#singletonInB');
  inB.onclick = () => { togglePressed(inB); reset(); };

  function reset() {
    world = bootSingleton({ variant, managerInSceneB: isPressed(inB) });
    render();
  }

  function sceneBlock(name, objects, active) {
    const rows = objects.length
      ? objects.map(item => `<div class="go ${item.id === world.instance ? 'inst' : ''}">GameManager #${item.id}<span>score ${item.score}</span></div>`).join('')
      : `<div class="empty">${t('singleton.noManager')}</div>`;
    return `<div class="scene ${active ? '' : 'off'} ${name === 'DontDestroyOnLoad' ? 'ddol' : ''}"><b>▾ ${name}</b>${rows}</div>`;
  }

  function render() {
    const inScene = world.objects;
    $('#singletonHierarchy').innerHTML = [
      sceneBlock('Scene A', world.scene === 'A' ? inScene : [], world.scene === 'A'),
      sceneBlock('Scene B', world.scene === 'B' ? inScene : [], world.scene === 'B'),
      variant === 'persistent' ? sceneBlock('DontDestroyOnLoad', world.persistent, true) : '',
    ].join('');
    const score = currentScore(world);
    const instance = world.instance === null ? 'null' : score === null ? t('singleton.destroyed') : `#${world.instance}`;
    $('#singletonStats').innerHTML = [
      tile('Instance', instance, '', score === null && world.instance !== null ? 'cpu-t' : 'gpu-t'),
      tile(t('singleton.scoreLabel'), score ?? '—'),
      tile(t('singleton.sceneLabel'), world.scene),
    ].join('');
    $('#singletonLog').innerHTML = [...world.log].reverse().slice(0, 14)
      .map(line => `<div class="${line.kind}">${t('singleton.' + line.key, ...line.args)}</div>`).join('');
  }

  $('#singletonScore').onclick = () => { world = addScore(world); render(); };
  $('#singletonLoadA').onclick = () => { world = loadScene(world, 'A'); render(); };
  $('#singletonLoadB').onclick = () => { world = loadScene(world, 'B'); render(); };
  $('#singletonReset').onclick = reset;
  renderCode($('#singletonSimpleCode'), SNIPPETS.singletonSimple);
  renderCode($('#singletonGenericCode'), SNIPPETS.singletonGeneric);
  reset();
  return render;
}
