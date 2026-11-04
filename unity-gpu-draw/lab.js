/** Tape 07 rigs: the map, the Draw* → Render* grid, buffers, the args buffer, a GPU-culling frame, BRG, particles,
 *  lamps, the chooser and the interview. Each init returns a render function for language switches. */
import { $, $$, fitCanvas, clamp, fmt, fmtI, bytes, esc } from '../assets/vhs.js?v=202611040944';
import { t } from '../assets/i18n.js?v=202611040944';
import { renderCode } from '../assets/code.js?v=202611040944';
import { bindSeg, togglePressed, setPressed, tile, visibleLoop, cssVar } from '../assets/lab.js?v=202611040944';
import {
  PATHS, pathsIn, GEOMETRY, COUNT, apiCell, ARGS_MESH, ARGS_FIELDS, drawIndexed,
  makeField, cull, cullSteps, cullTimeline, lampOn, lampLevel, lampCost, particleTool, particleSystemsCost, SCENARIOS,
} from './model.js?v=202611040944';

const card = (title, body) => `<h3>${title}</h3>${body}`;

/* ---------------- CH.00 map ---------------- */
export function initMap() {
  let picked = 'rindirect';
  const board = $('#mapBoard');
  board.addEventListener('click', event => {
    const chip = event.target.closest('button[data-p]');
    if (!chip) return;
    picked = chip.dataset.p;
    render();
  });
  function render() {
    const names = t('map.names');
    const quad = (owner, data) => `<div class="quad q-${owner}-${data}"><p class="lbl">${t(`map.q.${owner}.${data}`)}</p><div class="chips">${
      pathsIn(owner, data).map(p => `<button class="chip${PATHS[p].tape ? ' t1' : ''}" data-p="${p}" aria-pressed="${p === picked}">${names[p]}</button>`).join('')}</div></div>`;
    board.innerHTML = `<span class="ax ax-x1">${t('map.axGo')}</span><span class="ax ax-x2">${t('map.axOwn')}</span>
      <span class="ax ax-y1">${t('map.axCpu')}</span><span class="ax ax-y2">${t('map.axGpu')}</span>
      ${quad('go', 'cpu')}${quad('own', 'cpu')}${quad('go', 'gpu')}${quad('own', 'gpu')}`;
    const info = t('map.info')[picked];
    const where = PATHS[picked].tape
      ? `<a href="../unity-rendering/#${PATHS[picked].chapter}">${t('map.inTape1')}</a>`
      : `<a href="#${PATHS[picked].chapter}">${t('map.below')}</a>`;
    $('#mapCard').innerHTML = card(names[picked], `<p>${info[0]}</p>
      <div class="kv"><span>${t('map.who')}</span><b>${info[1]}</b><span>${t('map.cull')}</span><b>${info[2]}</b><span>${t('map.when')}</span><b>${info[3]}</b></div>
      <p class="hint">${where}</p>`);
  }
  render();
  return render;
}

/* ---------------- CH.01 Draw* → Render* ---------------- */
export function initApi() {
  let geometry = 'mesh', count = 'gpuArgs', indexed = false;
  const grid = $('#apiGrid'), toggle = $('#apiIndexed');
  grid.addEventListener('click', event => {
    const cell = event.target.closest('button[data-g]');
    if (!cell || cell.disabled) return;
    geometry = cell.dataset.g;
    count = cell.dataset.c;
    render();
  });
  toggle.addEventListener('click', () => { indexed = togglePressed(toggle); render(); });
  function render() {
    const cols = t('api.cols'), rows = t('api.rows');
    grid.innerHTML = `<div class="api-corner lbl">${t('api.corner')}</div>${COUNT.map(c => `<div class="api-col lbl">${cols[c]}</div>`).join('')}${
      GEOMETRY.map(g => `<div class="api-row lbl">${rows[g]}</div>${COUNT.map(c => {
        const cell = apiCell(g, c);
        if (!cell) return `<button class="api-cell none" data-g="${g}" data-c="${c}" disabled><span>${t('api.noCell')}</span></button>`;
        const now = indexed && cell.indexed ? cell.indexed : cell.now;
        return `<button class="api-cell" data-g="${g}" data-c="${c}" aria-pressed="${g === geometry && c === count}"><small>${cell.old.replace('Graphics.', '')}</small><b>${now.replace('Graphics.', '')}</b></button>`;
      }).join('')}`).join('')}`;
    const cell = apiCell(geometry, count);
    const key = `${geometry}.${count}${indexed && cell.indexed ? '.indexed' : ''}`;
    const info = t('api.info')[key];
    toggle.hidden = geometry !== 'none';
    $('#apiCard').innerHTML = `<div class="api-names"><span class="old">${cell.old}</span><span class="arrow">→</span><span class="now">${indexed && cell.indexed ? cell.indexed : cell.now}</span></div>
      <p>${info.what}</p>
      <div class="kv"><span>${t('api.count')}</span><b>${info.count}</b><span>${t('api.shader')}</span><b>${info.shader}</b><span>${t('api.when')}</span><b>${info.when}</b></div>
      <pre class="code" id="apiCode"></pre>`;
    renderCode($('#apiCode'), info.code);
  }
  render();
  return render;
}

export function initRenderParams() {
  let picked = 'material';
  $('#rpFields').addEventListener('click', event => {
    const button = event.target.closest('button[data-f]');
    if (!button) return;
    picked = button.dataset.f;
    render();
  });
  function render() {
    const fields = t('rp.fields');
    $('#rpFields').innerHTML = Object.keys(fields).map(f => `<button class="chip" data-f="${f}" aria-pressed="${f === picked}">${f}</button>`).join('');
    $('#rpCard').innerHTML = `<p class="lbl">RenderParams.${picked}</p><p>${fields[picked]}</p>`;
  }
  render();
  return render;
}

/* ---------------- CH.02 buffers ---------------- */
export function initNames() {
  const value = bindSeg($('#namesSeg'), () => render());
  function render() {
    const info = t('names.info')[value()];
    $('#namesCard').innerHTML = `<p>${info[0]}</p><div class="kv"><span>${t('names.is')}</span><b>${info[1]}</b><span>${t('names.use')}</span><b>${info[2]}</b></div>`;
  }
  render();
  return render;
}

export function initTargets() {
  let picked = 'Structured';
  $('#targetList').addEventListener('click', event => {
    const button = event.target.closest('button[data-t]');
    if (!button) return;
    picked = button.dataset.t;
    render();
  });
  function render() {
    const targets = t('targets.info');
    $('#targetList').innerHTML = Object.keys(targets).map(k => `<button class="chip" data-t="${k}" aria-pressed="${k === picked}">${k}</button>`).join('');
    const info = targets[picked];
    $('#targetCard').innerHTML = `<p class="lbl">GraphicsBuffer.Target.${picked}</p><p>${info.what}</p>
      <div class="kv"><span>${t('targets.reader')}</span><b>${info.reader}</b><span>HLSL</span><b><code>${esc(info.hlsl)}</code></b></div>
      <pre class="code" id="targetCode"></pre>`;
    renderCode($('#targetCode'), info.code);
  }
  render();
  return render;
}

const ARGS_LIMITS = { indexCountPerInstance: [0, 9, 3], instanceCount: [0, 12, 1], startIndex: [0, 9, 3], baseVertexIndex: [0, 5, 5], startInstance: [0, 11, 1] };

export function initArgs() {
  const args = { indexCountPerInstance: 9, instanceCount: 5, startIndex: 0, baseVertexIndex: 0, startInstance: 0 };
  const root = $('#argsLab');
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-f]');
    if (!button) return;
    const [lo, hi, step] = ARGS_LIMITS[button.dataset.f];
    args[button.dataset.f] = clamp(args[button.dataset.f] + Number(button.dataset.d) * step, lo, hi);
    render();
  });
  $('#argsPreset').addEventListener('click', event => {
    const button = event.target.closest('button[data-p]');
    if (!button) return;
    Object.assign(args, t('args.presets')[button.dataset.p].args);
    render();
  });
  function svg(result) {
    const W = 600, cols = 6, cw = W / cols, ch = 92, pad = 16;
    const slot = id => ({ x: (id % cols) * cw + pad, y: Math.floor(id / cols) * ch + pad });
    const size = cw - pad * 2;
    let out = '';
    for (let id = 0; id < ARGS_MESH.instances; id++) {
      const { x, y } = slot(id), drawn = result.instances.includes(id);
      out += `<rect class="slot${drawn ? ' on' : ''}" x="${x - 8}" y="${y - 8}" width="${size + 16}" height="${ch - pad - 2}" rx="4"/>`;
      out += `<text class="sid" x="${x - 2}" y="${y + ch - pad * 2 - 2}">#${id}</text>`;
      if (!drawn) continue;
      for (const tri of result.triangles) {
        const pts = tri.map(v => `${x + ARGS_MESH.vertices[v][0] * size},${y + ARGS_MESH.vertices[v][1] * (ch - pad * 3)}`).join(' ');
        out += `<polygon class="tri" points="${pts}"/>`;
      }
    }
    return `<svg viewBox="0 0 ${W} ${ch * 2 + 4}" role="img" aria-label="${t('args.svgAria')}">${out}</svg>`;
  }
  function render() {
    const labels = t('args.fields'), result = drawIndexed(args);
    $('#argsCells').innerHTML = ARGS_FIELDS.map((f, i) => `<div class="acell"><span class="off">+${i * 4}</span><b>${f}</b>
      <div class="astep"><button class="btn" data-f="${f}" data-d="-1" aria-label="−">−</button><output>${args[f]}</output><button class="btn" data-f="${f}" data-d="1" aria-label="+">+</button></div>
      <small>${labels[f]}</small></div>`).join('');
    $('#argsPreset').innerHTML = Object.entries(t('args.presets')).map(([k, p]) => `<button class="btn" data-p="${k}">${p.label}</button>`).join('');
    $('#argsView').innerHTML = svg(result);
    const warn = result.warnings.map(w => `<li>${t('args.warn')[w]}</li>`).join('');
    $('#argsRead').innerHTML = `${t('args.drawn', result.instances.length, result.triangles.length)}${warn ? `<ul class="warns">${warn}</ul>` : ''}`;
    renderCode($('#argsCode'), t('args.code', args));
  }
  render();
  return render;
}

/* ---------------- CH.03 GPU culling frame ---------------- */
export function initCull() {
  const cv = $('#cullCv'), state = { count: 400, angle: -10, readback: false, step: 0, playing: false, timer: 0 };
  let field = makeField(state.count);
  const cam = () => ({ x: 0.5, y: 1.02, angle: state.angle, fov: 60, range: 0.95 });
  const aspect = () => (cv.clientWidth || 600) / 300;
  const steps = () => cullSteps({ readback: state.readback });
  $('#cullCount').addEventListener('input', event => { state.count = Number(event.target.value); field = makeField(state.count); render(); });
  $('#cullAngle').addEventListener('input', event => { state.angle = Number(event.target.value); render(); });
  $('#cullReadback').addEventListener('click', event => { state.readback = togglePressed(event.currentTarget); state.step = 0; render(); });
  $('#cullPrev').addEventListener('click', () => { stop(); state.step = Math.max(0, state.step - 1); render(); });
  $('#cullNext').addEventListener('click', () => { stop(); state.step = Math.min(steps().length - 1, state.step + 1); render(); });
  $('#cullPlay').addEventListener('click', () => (state.playing ? stop() : play()));
  function play() {
    state.playing = true;
    if (state.step >= steps().length - 1) state.step = 0;
    tick();
  }
  function tick() {
    render();
    if (state.step >= steps().length - 1) { stop(); return; }
    state.timer = setTimeout(() => { state.step++; tick(); }, 1300);
  }
  function stop() { state.playing = false; clearTimeout(state.timer); render(); }
  new ResizeObserver(() => render()).observe(cv);

  function draw(visible, step) {
    const { c: ctx, w, h } = fitCanvas(cv, 300);
    ctx.fillStyle = '#07040f';
    ctx.fillRect(0, 0, w, h);
    const c = cam(), X = x => x * w, Y = y => y * h;
    const culled = ['dispatch', 'copyCount', 'readback', 'wait', 'drawIndirect', 'drawCpu'].includes(step) || step === undefined;
    const drawn = step === 'drawIndirect' || step === 'drawCpu';
    ctx.fillStyle = 'rgba(38,227,234,.08)';
    ctx.strokeStyle = 'rgba(38,227,234,.45)';
    ctx.beginPath();
    ctx.moveTo(X(c.x), Y(c.y));
    const a0 = (c.angle - c.fov / 2) * Math.PI / 180, a1 = (c.angle + c.fov / 2) * Math.PI / 180;
    ctx.arc(X(c.x), Y(c.y), c.range * h, -Math.PI / 2 + a0, -Math.PI / 2 + a1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const vis = new Set(visible);
    for (const o of field) {
      const on = vis.has(o.id);
      ctx.fillStyle = !culled ? '#8c82b0' : on ? (drawn ? cssVar('--ok') || '#5dfc9a' : '#26e3ea') : 'rgba(140,130,176,.25)';
      const s = drawn && on ? 5 : 3.5;
      ctx.fillRect(X(o.x) - s / 2, Y(o.y) - s / 2, s, s);
    }
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(X(c.x), Y(c.y) - 4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    const list = steps(), step = list[state.step], visible = cull(field, cam(), aspect());
    $('#cullCountOut').textContent = fmtI(state.count);
    $('#cullAngleOut').textContent = `${state.angle}°`;
    $('#cullPlay').textContent = state.playing ? t('cull.pause') : t('cull.play');
    draw(visible, step);
    const names = t('cull.steps');
    $('#cullSteps').innerHTML = list.map((s, i) => `<li class="${i === state.step ? 'on' : i < state.step ? 'done' : ''}${s === 'wait' ? ' bad' : ''}"><b>${i + 1}</b> ${names[s][0]}</li>`).join('');
    const [, who, text, code] = names[step];
    $('#cullExplain').innerHTML = `<p class="lbl">${who}</p><p>${text}</p>`;
    renderCode($('#cullCode'), code);
    const knows = state.readback && state.step >= list.indexOf('readback') ? fmtI(visible.length) : t('cull.nothing');
    $('#cullRead').innerHTML = [
      tile(t('cull.total'), fmtI(state.count)),
      tile(t('cull.visible'), state.step >= 1 ? fmtI(visible.length) : '—', '', 'ok'),
      tile(t('cull.cpuKnows'), knows, '', state.readback ? 'warn' : ''),
    ].join('');
    timeline(visible.length);
  }

  function timeline(visible) {
    const tl = cullTimeline({ total: state.count, visible, readback: state.readback });
    const end = Math.max(...tl.cpu.map(b => b.to), ...tl.gpu.map(b => b.to));
    const span = Math.max(end, 3.2);
    const lane = blocks => blocks.map(b => `<span class="blk b-${b.k}" style="left:${b.from / span * 100}%;width:${Math.max(0.6, (b.to - b.from) / span * 100)}%" title="${t('cull.blk')[b.k]}">${t('cull.blk')[b.k]}</span>`).join('');
    $('#cullLanes').innerHTML = `<div class="lane"><span class="ln">CPU</span><div class="track">${lane(tl.cpu)}</div></div>
      <div class="lane"><span class="ln">GPU</span><div class="track">${lane(tl.gpu)}</div></div>
      <p class="hint">${tl.stall ? t('cull.stallNote', fmt(tl.stall, 1)) : t('cull.noStall')}</p>`;
  }
  render();
  return render;
}

/* ---------------- CH.04 BRG ---------------- */
export function initBrg() {
  const value = bindSeg($('#brgSeg'), () => render());
  function render() {
    const mode = value(), rows = t('brg.rows');
    $('#brgBody').innerHTML = rows.map(([task, grd, ent, own]) => {
      const cell = { grd, ent, own }[mode];
      return `<tr><td>${task}</td><td class="${cell.startsWith('✋') ? 'you' : 'engine'}">${cell}</td></tr>`;
    }).join('');
    $('#brgNote').innerHTML = t('brg.notes')[mode];
    renderCode($('#brgCode'), t('brg.code')[mode]);
  }
  render();
  return render;
}

/* ---------------- CH.05 particles ---------------- */
export function initParticles() {
  const state = { count: 800, life: 'short', cpuEvents: false, colliders: true, state: false };
  const countLog = $('#ptCount');
  countLog.addEventListener('input', () => { state.count = Math.round(10 ** Number(countLog.value)); render(); });
  bindSeg($('#ptLife'), value => { state.life = value; render(); });
  $('#ptChecks').addEventListener('click', event => {
    const button = event.target.closest('button[data-k]');
    if (!button) return;
    state[button.dataset.k] = togglePressed(button);
    render();
  });
  const sys = { effects: 2000, perEffect: 12, shared: false };
  $('#ptEffects').addEventListener('input', event => { sys.effects = Number(event.target.value); renderSystems(); });
  $('#ptShared').addEventListener('click', event => { sys.shared = togglePressed(event.currentTarget); renderSystems(); });
  function render() {
    $('#ptCountOut').textContent = fmtI(state.count);
    $$('#ptChecks button').forEach(b => setPressed(b, state[b.dataset.k]));
    const verdict = particleTool(state), names = t('pt.picks');
    $('#ptVerdict').innerHTML = `<span class="badge">${names[verdict.pick]}</span><p>${t('pt.why')[verdict.why]}</p>`;
    renderSystems();
  }
  function renderSystems() {
    const cost = particleSystemsCost(sys);
    $('#ptEffectsOut').textContent = fmtI(sys.effects);
    $('#ptSysRead').innerHTML = [
      tile(t('pt.systems'), fmtI(cost.systems), '', sys.shared ? 'ok' : 'warn'),
      tile(t('pt.calls'), fmtI(cost.calls), '', sys.shared ? 'ok' : 'warn'),
      tile(t('pt.particles'), fmtI(cost.particles)),
    ].join('');
    $('#ptSysNote').innerHTML = sys.shared ? t('pt.sharedNote') : t('pt.perNote');
    renderCode($('#ptCode'), sys.shared ? t('pt.sharedCode') : t('pt.perCode'));
  }
  render();
  return render;
}

/* ---------------- CH.06 lamps ---------------- */
export function initLamps() {
  const cv = $('#lampCv'), cols = 50, rows = 40, lamps = cols * rows;
  const state = { mode: 'deco', time: 0, states: new Uint8Array(lamps), changed: 0, sinceEvent: 0 };
  for (let i = 0; i < lamps; i++) state.states[i] = (i * 7) % 11 === 0 ? 2 : (i * 3) % 5 === 0 ? 0 : 1;
  const mode = bindSeg($('#lampMode'), value => { state.mode = value; render(); });
  visibleLoop(cv, dt => {
    state.time += dt;
    state.changed = 0;
    if (state.mode === 'state' || state.mode === 'part') {
      state.sinceEvent += dt;
      if (state.sinceEvent > 0.6) {
        state.sinceEvent = 0;
        const i = Math.floor((state.time * 997) % lamps);
        state.states[i] = (state.states[i] + 1) % 3;
        state.changed = 1;
      }
    }
    frame();
  });
  function frame() {
    const { c: ctx, w, h } = fitCanvas(cv, 260);
    ctx.fillStyle = '#07040f';
    ctx.fillRect(0, 0, w, h);
    const cw = w / cols, ch = h / rows, r = Math.min(cw, ch) * 0.32;
    for (let i = 0; i < lamps; i++) {
      const x = (i % cols + 0.5) * cw, y = (Math.floor(i / cols) + 0.5) * ch;
      let level;
      if (state.mode === 'deco') level = lampOn(i, state.time, 0.8) ? 1 : 0.12;
      else level = lampLevel(state.states[i], i, state.time) || 0.08;
      if (state.mode === 'part' && i % 5 === 0) { ctx.fillStyle = 'rgba(140,130,176,.35)'; ctx.fillRect(x - cw * 0.45, y - ch * 0.45, cw * 0.9, ch * 0.9); }
      ctx.fillStyle = state.mode === 'naive' ? `rgba(255,92,108,${0.25 + level * 0.75})` : `rgba(255,210,63,${level})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    readouts();
  }
  function readouts() {
    const cost = lampCost(state.mode, { lamps, changedPerFrame: state.changed });
    $('#lampRead').innerHTML = [
      tile(t('lamp.bytes'), bytes(cost.bytes), t('lamp.bytesD'), cost.bytes ? 'warn' : 'ok'),
      tile(t('lamp.calls'), fmtI(cost.calls), state.mode === 'part' ? t('lamp.callsPart') : '', cost.calls > 10 ? 'warn' : 'ok'),
      tile(t('lamp.objects'), fmtI(cost.objects), cost.coroutines ? t('lamp.coroutines', fmtI(cost.coroutines)) : '', cost.objects ? 'warn' : 'ok'),
    ].join('');
  }
  function render() {
    const info = t('lamp.modes')[mode()];
    $('#lampText').innerHTML = info.text;
    renderCode($('#lampCode'), info.code);
    frame();
  }
  render();
  return render;
}

/* ---------------- CH.07 chooser ---------------- */
/** A fixed order per scenario that does not put the answer first. */
const shuffled = sc => [...sc.options].sort((a, b) => hash(sc.id + a) - hash(sc.id + b));
const hash = text => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function initChooser() {
  let index = 0, answered = new Map();
  $('#chooseOpts').addEventListener('click', event => {
    const button = event.target.closest('button[data-o]');
    if (!button || answered.has(index)) return;
    answered.set(index, button.dataset.o);
    render();
  });
  $('#chooseNext').addEventListener('click', () => { index = (index + 1) % SCENARIOS.length; render(); });
  $('#choosePrev').addEventListener('click', () => { index = (index - 1 + SCENARIOS.length) % SCENARIOS.length; render(); });
  function render() {
    const sc = SCENARIOS[index], tools = t('tools'), text = t('choose.items')[sc.id], picked = answered.get(index);
    $('#chooseQ').innerHTML = `<span class="lbl">${t('choose.of', index + 1, SCENARIOS.length)}</span><p>${text.q}</p>`;
    $('#chooseOpts').innerHTML = shuffled(sc).map(o => {
      const cls = !picked ? '' : o === sc.answer ? 'right' : o === picked ? 'wrong' : '';
      return `<button class="btn ${cls}" data-o="${o}"${picked ? ' disabled' : ''}>${tools[o]}</button>`;
    }).join('');
    const right = [...answered].filter(([i, o]) => SCENARIOS[i].answer === o).length;
    $('#chooseA').innerHTML = picked ? `<p><b>${picked === sc.answer ? t('choose.right') : t('choose.wrong', tools[sc.answer])}</b> ${text.a}</p>` : `<p class="hint">${t('choose.hint')}</p>`;
    $('#chooseScore').textContent = t('choose.score', right, answered.size);
  }
  render();
  return render;
}

/* ---------------- CH.08 interview ---------------- */
export function initInterview() {
  function render() {
    $('#cheatBody').innerHTML = t('cheat.rows').map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    $('#qa').innerHTML = t('qa.items').map(([q, a], i) =>
      `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${q}</span></summary><div class="a">${a}</div></details>`).join('');
  }
  render();
  return render;
}


