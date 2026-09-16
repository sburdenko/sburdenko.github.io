/** Пульт кадра: переключаем техники и смотрим, во что превращается поток команд. */
import { $, $$, fmt, fmtI, bytes, esc, press, onVisible, RM } from '../assets/vhs.js?v=202609161105';
import { t, onLang } from '../assets/i18n.js?v=202609161105';
import {
  OBJECTS, DEFAULT_FLAGS, MATERIALS, MESHES, PATHS, TECHNIQUES,
  evaluate, compareTechniques, available, unavailableReason, shaderVariant, ALL_OFF
} from './model.js?v=202609161105';
import { createScene } from './scene.js?v=202609161105';

const S = { pipe: 'urp', k: 10, stat: true, dyn: false, srp: true, inst: false, grd: false, wire: false, selRun: null, selObj: null, play: -1 };
let ev, base, runOf = new Map(), hoverId = null, scene, tipEl = null;

const stripe = p => p === 'statsrp' ? 'linear-gradient(90deg,#ffd23f 50%,#a77bff 50%)' : PATHS[p].c;
const pill = p => `<span class="pathpill"><i style="background:${stripe(p)}"></i>${PATHS[p].l}</span>`;

export function initDeck() {
  const cv = $('#scene');
  if (!cv) return;
  const crt = $('#crt'), tapeEl = $('#tape'), sideEl = $('#side'), statsEl = $('#stats');
  const tgBtns = $$('#tgs .tg'), pipeBtns = $$('#pipe button'), scaleBtns = $$('#scale button');

  scene = createScene(cv, {
    objects: OBJECTS,
    isWire: () => S.wire,
    stateOf: o => {
      if (S.play >= 0) {
        const ri = runOf.get(o.id);
        return ri < S.play ? 'n' : ri === S.play ? 'h' : 'g';
      }
      if (S.selRun != null) return ev.runs[S.selRun] && ev.runs[S.selRun].ids.has(o.id) ? 'h' : 'd';
      if (S.selObj != null) return o.id === S.selObj ? 'h' : 'n';
      return 'n';
    }
  });

  /* ---------------- панели ---------------- */

  function renderSide() {
    if (S.selRun != null && ev.runs[S.selRun]) {
      const r = ev.runs[S.selRun];
      const mats = [...r.mats].map(m => MATERIALS[m].n).join(', ');
      sideEl.innerHTML = `<span class="lbl">${t('side.batchOf', S.selRun + 1, ev.runs.length)}</span>${pill(r.p)}
        <dl class="kv"><dt>${t('side.objects')}</dt><dd>${fmtI(r.n)}</dd><dt>${t('side.draws')}</dt><dd>${fmtI(r.draws)}</dd>
        <dt>${t('side.setpass')}</dt><dd>${t(r.setpass ? 'side.setpassNew' : 'side.setpassSame')}</dd><dt>${t('side.verts')}</dt><dd>${fmtI(r.verts)}</dd>
        <dt>${t('side.cpu')}</dt><dd>${fmt(r.cpu, 3)} ${t('stats.ms')}</dd></dl>
        <div><span class="lbl">${t('side.materials')}</span><p style="font-size:14px">${esc(mats)}</p></div>
        <div class="reason"><span class="lbl" style="color:var(--osd)">${t('side.whyBroke')}</span><br>${esc(t(r.reason[0]))}${r.reason[1] ? `<br><code>${esc(r.reason[1])}</code>` : ''}</div>
        <p class="hint">${t('path.info.' + r.p)}</p>`;
      return;
    }
    if (S.selObj != null) {
      const o = OBJECTS[S.selObj], rt = ev.routes[o.id], m = MATERIALS[o.mat];
      sideEl.innerHTML = `<span class="lbl">${t('side.inspector')}</span><h3>${esc(o.name)}</h3>
        <dl class="kv"><dt>${t('side.component')}</dt><dd>${o.skinned ? 'SkinnedMeshRenderer' : 'MeshRenderer'}</dd>
        <dt>${t('side.mesh')}</dt><dd>${MESHES[o.mesh].n} · ${t('side.meshVerts', MESHES[o.mesh].v)}</dd>
        <dt>${t('side.material')}</dt><dd>${m.n}</dd><dt>${t('side.shader')}</dt><dd>${esc(shaderVariant(o, S.pipe))}</dd>
        <dt>${t('side.instancing')}</dt><dd>${m.inst ? t('side.instOn') : '—'}</dd></dl>
        <div class="inline-tg"><button class="tg" data-flag="static" aria-pressed="${o.static}" ${o.skinned ? 'disabled' : ''}>Static</button><button class="tg" data-flag="mpb" aria-pressed="${o.mpb}">MaterialPropertyBlock</button></div>
        <span class="lbl">${t('side.howDraw')}</span>${pill(rt.p)}
        <ul class="why">${rt.why.map(([kind, key, ...args]) => `<li class="${kind}">${esc(t(key, ...args))}</li>`).join('')}</ul>
        <p class="note">${t('side.flagsNote')}</p>`;
      return;
    }
    const cnt = {};
    OBJECTS.forEach(o => { const p = ev.routes[o.id].p; cnt[p] = (cnt[p] || 0) + 1; });
    sideEl.innerHTML = `<span class="lbl">${t('side.legendTitle')}</span>
      <div class="legend">${Object.keys(PATHS).filter(p => cnt[p]).map(p => `<div><i style="background:${stripe(p)}"></i><span>${PATHS[p].l}</span><b>${cnt[p]}</b></div>`).join('')}</div>
      <p class="hint">${t('side.legendHint', OBJECTS.length)}</p>
      <p class="hint">${t('side.clickHint')}</p>`;
  }

  function renderTape() {
    $('#tapeT').textContent = t('deck.tapeTitle', ev.runs.length, ev.T.draws);
    tapeEl.innerHTML = ev.runs.map((r, i) => {
      const w = Math.round(62 + Math.min(96, Math.log2(r.draws + 1) * 13));
      const st = S.play >= 0 ? (i < S.play ? ' done' : i === S.play ? '' : ' todo') : '';
      const dots = [...r.mats].slice(0, 8).map(m => `<i style="background:${MATERIALS[m].c}"></i>`).join('');
      return `<button class="run${st}" data-i="${i}" style="width:${w}px" aria-pressed="${S.selRun === i || S.play === i}" aria-label="${esc(PATHS[r.p].l)}: ${r.draws} draw calls, ${r.n} obj${r.setpass ? ', SetPass' : ''}">
        <span class="stripe" style="background:${stripe(r.p)}"></span><span class="nm">${PATHS[r.p].s}</span>
        <span class="dots">${dots}</span>
        <span class="ct"><span>×${fmtI(r.draws)}</span>${r.setpass ? `<span class="sp" title="${t('deck.spTitle')}">SP</span>` : ''}</span></button>`;
    }).join('');
  }

  const tile = (lbl, val, unit, d, cls = '', bar = '') =>
    `<div class="tile ${cls}"><span class="lbl">${lbl}</span><span class="val">${val}${unit ? `<small>${unit}</small>` : ''}</span>${bar}<span class="d ${d[1] || ''}">${d[0]}</span></div>`;

  const delta = (cur, b, lowerBetter = true) => {
    if ((b === 0 && cur === 0) || Math.abs(cur - b) / Math.max(b, 1e-9) < 0.005) return [t('stats.same'), ''];
    const pct = Math.round((cur - b) / b * 100);
    return [t('stats.delta', pct), (pct < 0) === lowerBetter ? 'good' : 'badc'];
  };

  function renderStats() {
    const T = ev.T, B = base.T;
    const cmax = Math.max(B.cpu, T.cpu, 16.7) * 1.08, gmax = Math.max(B.gpu, T.gpu, 16.7) * 1.08;
    const bar = (v, max, col) => `<div class="bar"><i style="width:${Math.min(100, v / max * 100)}%;background:${col};box-shadow:0 0 10px ${col}"></i><span class="budget" style="left:${16.7 / max * 100}%"></span></div>`;
    const saved = T.objects - T.draws;
    const ms = t('stats.ms');
    statsEl.innerHTML =
      tile(t('stats.draws'), fmtI(T.draws), '', [t('stats.savedFoot', Math.max(0, saved)), saved > 0 ? 'good' : '']) +
      tile(t('stats.setpass'), fmtI(T.setpass), '', delta(T.setpass, B.setpass)) +
      tile(t('stats.cpu'), fmt(T.cpu, T.cpu < 10 ? 2 : 1), ms, delta(T.cpu, B.cpu), 'cpu-t', bar(T.cpu, cmax, '#ff3ea5')) +
      tile(t('stats.gpu'), fmt(T.gpu, T.gpu < 10 ? 2 : 1), ms, delta(T.gpu, B.gpu), 'gpu-t', bar(T.gpu, gmax, '#26e3ea')) +
      tile(t('stats.upload'), bytes(T.upload), '', delta(T.upload, B.upload)) +
      tile(t('stats.memory'), T.memory ? bytes(T.memory) : '0', '', T.memory ? [t('stats.memYes'), 'badc'] : [t('stats.memNo'), '']);
    $('#crtL').textContent = t('deck.crt', OBJECTS.length, S.k);
  }

  /** Идея из первой версии лаборатории: одна сцена — и сразу все техники по отдельности. */
  function renderCompare() {
    const { base: cmpBase, rows } = compareTechniques(S);
    const cell = (v, b, unit, lowerBetter = true) => {
      const d = b === 0 ? 0 : Math.round((v - b) / b * 100);
      const cls = d === 0 ? '' : (d < 0) === lowerBetter ? 'style="color:var(--ok)"' : 'style="color:var(--bad)"';
      return `${unit === 'ms' ? fmt(v, 2) : unit === 'b' ? bytes(v) : fmtI(v)} <small ${cls}>${d === 0 ? '—' : (d > 0 ? '+' : '') + d + '%'}</small>`;
    };
    const B = cmpBase.T;
    $('#cmpBody').innerHTML = [
      `<tr><td>${t('compare.baseline')}</td><td>${fmtI(B.draws)}</td><td>${fmtI(B.setpass)}</td><td>${fmt(B.cpu, 2)}</td><td>${bytes(B.upload)}</td><td>0</td><td class="note">${t('compare.baselineNote')}</td></tr>`,
      ...rows.map(r => {
        const T = r.result.T;
        const on = S[r.key] && available(r.key, S);
        return `<tr class="${on ? 'hl' : ''}"><td>${r.name}</td>
          <td>${cell(T.draws, B.draws)}</td>
          <td>${cell(T.setpass, B.setpass)}</td>
          <td>${cell(T.cpu, B.cpu, 'ms')}</td>
          <td>${cell(T.upload, B.upload, 'b')}</td>
          <td>${T.memory ? bytes(T.memory) : '0'}</td>
          <td class="note">${r.available ? t(on ? 'compare.on' : 'compare.available') : '↪ ' + esc(t(r.reason))}</td></tr>`;
      })
    ].join('');
    $('#cmpNote').textContent = t('compare.note', OBJECTS.length * S.k, S.pipe.toUpperCase());
  }

  function renderControls() {
    press(pipeBtns, b => b.dataset.v === S.pipe);
    press(scaleBtns, b => +b.dataset.v === S.k);
    tgBtns.forEach(b => {
      const k = b.dataset.k, ok = available(k, S);
      b.disabled = !ok;
      b.setAttribute('aria-pressed', S[k] && ok ? 'true' : 'false');
      b.title = ok ? '' : t(unavailableReason(k, S));
    });
    $('#wire').setAttribute('aria-pressed', S.wire);
  }

  function refreshUI() {
    renderControls(); renderSide(); renderTape(); renderStats(); renderCompare();
    if (RM) paintScene();
  }

  function recompute() {
    ev = evaluate(S);
    base = evaluate({ ...S, ...ALL_OFF });
    runOf = new Map();
    ev.runs.forEach((r, i) => r.ids.forEach(id => { if (!runOf.has(id)) runOf.set(id, i); }));
    if (S.selRun != null && S.selRun >= ev.runs.length) S.selRun = null;
  }

  function change() { stopPlay(); S.selRun = null; recompute(); refreshUI(); }

  /* ---------------- ввод ---------------- */

  tgBtns.forEach(b => b.onclick = () => { S[b.dataset.k] = !S[b.dataset.k]; change(); });
  pipeBtns.forEach(b => b.onclick = () => { S.pipe = b.dataset.v; change(); });
  scaleBtns.forEach(b => b.onclick = () => { S.k = +b.dataset.v; change(); });
  $('#wire').onclick = () => { S.wire = !S.wire; renderControls(); paintScene(); };

  const PRESETS = {
    none: { ...ALL_OFF },
    birp: { pipe: 'birp', stat: true, dyn: true, srp: false, inst: true, grd: false },
    urp: { pipe: 'urp', stat: true, dyn: false, srp: true, inst: false, grd: false },
    u6: { pipe: 'urp', stat: false, dyn: false, srp: true, inst: false, grd: true },
    forest: { pipe: 'birp', ...ALL_OFF, inst: true, k: 10 },
    materials: { pipe: 'urp', ...ALL_OFF, srp: true, k: 10 },
    heavy: { pipe: 'urp', ...ALL_OFF, dyn: true, k: 100 }
  };
  const applyPreset = name => {
    Object.assign(S, PRESETS[name]);
    change();
  };
  $$('#presets button').forEach(b => b.onclick = () => applyPreset(b.dataset.p));
  $$('#exps button').forEach(b => b.onclick = () => {
    applyPreset(b.dataset.p);
    $('#deck').scrollIntoView({ behavior: RM ? 'instant' : 'smooth' });
  });

  tapeEl.addEventListener('click', e => {
    const b = e.target.closest('.run');
    if (!b) return;
    stopPlay();
    const i = +b.dataset.i;
    S.selRun = S.selRun === i ? null : i;
    S.selObj = null;
    renderSide(); renderTape();
    if (RM) paintScene();
  });

  sideEl.addEventListener('click', e => {
    const b = e.target.closest('[data-flag]');
    if (!b || S.selObj == null) return;
    OBJECTS[S.selObj][b.dataset.flag] = !OBJECTS[S.selObj][b.dataset.flag];
    stopPlay(); recompute(); refreshUI();
  });

  $('#clearSel').onclick = () => {
    stopPlay();
    S.selRun = null; S.selObj = null;
    OBJECTS.forEach((o, i) => { o.static = DEFAULT_FLAGS[i].static; o.mpb = DEFAULT_FLAGS[i].mpb; });
    recompute(); refreshUI();
  };

  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const o = scene.pick(e.clientX - r.left, e.clientY - r.top);
    hoverId = o ? o.id : null;
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'crt-tip'; crt.appendChild(tipEl); }
    if (o) {
      tipEl.hidden = false;
      tipEl.textContent = `${o.name} · ${PATHS[ev.routes[o.id].p].l}`;
      tipEl.style.left = Math.min(e.clientX - r.left + 14, r.width - tipEl.offsetWidth - 6) + 'px';
      tipEl.style.top = (e.clientY - r.top + 14) + 'px';
    } else tipEl.hidden = true;
    if (RM) paintScene();
  });
  cv.addEventListener('mouseleave', () => { hoverId = null; if (tipEl) tipEl.hidden = true; if (RM) paintScene(); });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const o = scene.pick(e.clientX - r.left, e.clientY - r.top);
    stopPlay();
    S.selRun = null;
    S.selObj = o ? o.id : null;
    refreshUI();
  });

  /* ---------------- проигрывание кадра ---------------- */

  let playT = null;
  const playBtn = $('#play');
  function stopPlay() {
    if (playT) { clearTimeout(playT); playT = null; }
    if (S.play >= 0) {
      S.play = -1;
      $('#crtR').textContent = '● REC';
      playBtn.textContent = t('deck.play');
    }
  }
  function stepPlay() {
    if (S.play >= ev.runs.length - 1) {
      playT = setTimeout(() => { stopPlay(); renderTape(); if (RM) paintScene(); }, 900);
      return;
    }
    S.play++;
    $('#crtR').textContent = t('deck.step', S.play + 1, ev.runs.length);
    renderTape();
    if (RM) paintScene();
    const el = tapeEl.children[S.play];
    if (el) tapeEl.scrollLeft = Math.max(0, el.offsetLeft - tapeEl.clientWidth / 2 + el.offsetWidth / 2);
    playT = setTimeout(stepPlay, Math.max(260, Math.min(700, 5200 / ev.runs.length)));
  }
  playBtn.onclick = () => {
    if (S.play >= 0) { stopPlay(); renderTape(); if (RM) paintScene(); return; }
    S.selRun = null; S.selObj = null;
    renderSide();
    S.play = -1;
    playBtn.textContent = t('deck.stop');
    stepPlay();
  };

  /* ---------------- цикл отрисовки ---------------- */

  let visible = true, lastFrame = 0;
  function paintScene(now = performance.now()) { scene.draw(now / 1000, hoverId); }
  onVisible(cv, v => visible = v);
  function loop(now) {
    if (visible && now - lastFrame > 32) { paintScene(now); lastFrame = now; }
    requestAnimationFrame(loop);
  }
  addEventListener('resize', () => { scene.resize(); paintScene(); });

  onLang(() => { if (S.play < 0) playBtn.textContent = t('deck.play'); refreshUI(); });

  recompute();
  refreshUI();
  paintScene();
  if (!RM) requestAnimationFrame(loop);
}
