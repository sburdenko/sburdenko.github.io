/** Пульт кадра: переключаем техники и смотрим, во что превращается поток команд. */
import { $, $$, fmt, fmtI, bytes, esc, press, onVisible, RM } from '../../assets/vhs.js';
import {
  OBJECTS, DEFAULT_FLAGS, MATERIALS, MESHES, PATHS, PATH_INFO, TECHNIQUES,
  evaluate, compareTechniques, available, unavailableReason, shaderVariant, ALL_OFF
} from './model.js';
import { createScene } from './scene.js';

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
      sideEl.innerHTML = `<span class="lbl">Батч ${S.selRun + 1} из ${ev.runs.length}</span>${pill(r.p)}
        <dl class="kv"><dt>Объектов</dt><dd>${fmtI(r.n)}</dd><dt>Draw calls</dt><dd>${fmtI(r.draws)}</dd>
        <dt>SetPass</dt><dd>${r.setpass ? 'новый проход' : 'тот же проход'}</dd><dt>Вершин</dt><dd>${fmtI(r.verts)}</dd>
        <dt>CPU ≈</dt><dd>${fmt(r.cpu, 3)} мс</dd></dl>
        <div><span class="lbl">Материалы</span><p style="font-size:14px">${esc(mats)}</p></div>
        <div class="reason"><span class="lbl" style="color:var(--osd)">Почему не склеилось с предыдущим</span><br>${esc(r.reason[0])}${r.reason[1] ? `<br><code>${esc(r.reason[1])}</code>` : ''}</div>
        <p class="hint">${PATH_INFO[r.p]}</p>`;
      return;
    }
    if (S.selObj != null) {
      const o = OBJECTS[S.selObj], rt = ev.routes[o.id], m = MATERIALS[o.mat];
      sideEl.innerHTML = `<span class="lbl">Inspector</span><h3>${esc(o.name)}</h3>
        <dl class="kv"><dt>Компонент</dt><dd>${o.skinned ? 'SkinnedMeshRenderer' : 'MeshRenderer'}</dd>
        <dt>Меш</dt><dd>${MESHES[o.mesh].n} · ${fmtI(MESHES[o.mesh].v)} верш.</dd>
        <dt>Материал</dt><dd>${m.n}</dd><dt>Шейдер</dt><dd>${esc(shaderVariant(o, S.pipe))}</dd>
        <dt>Instancing</dt><dd>${m.inst ? 'включён' : '—'}</dd></dl>
        <div class="inline-tg"><button class="tg" data-flag="static" aria-pressed="${o.static}" ${o.skinned ? 'disabled' : ''}>Static</button><button class="tg" data-flag="mpb" aria-pressed="${o.mpb}">MaterialPropertyBlock</button></div>
        <span class="lbl">Как Unity его нарисует</span>${pill(rt.p)}
        <ul class="why">${rt.why.map(([k, t]) => `<li class="${k}">${esc(t)}</li>`).join('')}</ul>
        <p class="note">Флаги меняются у этого объекта во всех кварталах.</p>`;
      return;
    }
    const cnt = {};
    OBJECTS.forEach(o => { const p = ev.routes[o.id].p; cnt[p] = (cnt[p] || 0) + 1; });
    sideEl.innerHTML = `<span class="lbl">Как рисуется квартал</span>
      <div class="legend">${Object.keys(PATHS).filter(p => cnt[p]).map(p => `<div><i style="background:${stripe(p)}"></i><span>${PATHS[p].l}</span><b>${cnt[p]}</b></div>`).join('')}</div>
      <p class="hint">Цифры — сколько из ${OBJECTS.length} объектов квартала идёт каждым путём. Цвет объекта в кадре — его материал.</p>
      <p class="hint"><b>Кликни</b> объект в кадре, чтобы увидеть, почему он попал именно сюда, или блок на ленте — чтобы подсветить батч.</p>`;
  }

  function renderTape() {
    $('#tapeT').textContent = `COMMAND STREAM · ${ev.runs.length} GROUPS · ${ev.T.draws} DRAW CALLS`;
    tapeEl.innerHTML = ev.runs.map((r, i) => {
      const w = Math.round(62 + Math.min(96, Math.log2(r.draws + 1) * 13));
      const st = S.play >= 0 ? (i < S.play ? ' done' : i === S.play ? '' : ' todo') : '';
      const dots = [...r.mats].slice(0, 8).map(m => `<i style="background:${MATERIALS[m].c}"></i>`).join('');
      return `<button class="run${st}" data-i="${i}" style="width:${w}px" aria-pressed="${S.selRun === i || S.play === i}" aria-label="${esc(PATHS[r.p].l)}: ${r.draws} draw calls, ${r.n} объектов${r.setpass ? ', новый SetPass' : ''}">
        <span class="stripe" style="background:${stripe(r.p)}"></span><span class="nm">${PATHS[r.p].s}</span>
        <span class="dots">${dots}</span>
        <span class="ct"><span>×${fmtI(r.draws)}</span>${r.setpass ? '<span class="sp" title="новый SetPass">SP</span>' : ''}</span></button>`;
    }).join('');
  }

  const tile = (lbl, val, unit, d, cls = '', bar = '') =>
    `<div class="tile ${cls}"><span class="lbl">${lbl}</span><span class="val">${val}${unit ? `<small>${unit}</small>` : ''}</span>${bar}<span class="d ${d[1] || ''}">${d[0]}</span></div>`;

  const delta = (cur, b, lowerBetter = true) => {
    if (b === 0 && cur === 0) return ['как без батчинга', ''];
    if (Math.abs(cur - b) / Math.max(b, 1e-9) < 0.005) return ['как без батчинга', ''];
    const pct = Math.round((cur - b) / b * 100);
    return [(pct > 0 ? '+' : '') + pct + '% к «всё выключено»', (pct < 0) === lowerBetter ? 'good' : 'badc'];
  };

  function renderStats() {
    const T = ev.T, B = base.T;
    const cmax = Math.max(B.cpu, T.cpu, 16.7) * 1.08, gmax = Math.max(B.gpu, T.gpu, 16.7) * 1.08;
    const bar = (v, max, col) => `<div class="bar"><i style="width:${Math.min(100, v / max * 100)}%;background:${col};box-shadow:0 0 10px ${col}"></i><span class="budget" style="left:${16.7 / max * 100}%"></span></div>`;
    const saved = T.objects - T.draws;
    statsEl.innerHTML =
      tile('Draw calls', fmtI(T.draws), '', [`сэкономлено батчингом: ${fmtI(Math.max(0, saved))}`, saved > 0 ? 'good' : '']) +
      tile('SetPass calls', fmtI(T.setpass), '', delta(T.setpass, B.setpass)) +
      tile('CPU · render thread', fmt(T.cpu, T.cpu < 10 ? 2 : 1), 'мс', delta(T.cpu, B.cpu), 'cpu-t', bar(T.cpu, cmax, '#ff3ea5')) +
      tile('GPU', fmt(T.gpu, T.gpu < 10 ? 2 : 1), 'мс', delta(T.gpu, B.gpu), 'gpu-t', bar(T.gpu, gmax, '#26e3ea')) +
      tile('CPU → GPU за кадр', bytes(T.upload), '', delta(T.upload, B.upload)) +
      tile('Доп. память', T.memory ? bytes(T.memory) : '0', '', T.memory ? ['копии вершин static batching', 'badc'] : ['лишних копий нет', '']);
    $('#crtL').textContent = `CAM 01 · ${OBJECTS.length} OBJ${S.k > 1 ? ` · ×${S.k} = ${OBJECTS.length * S.k} OBJ` : ''}`;
  }

  /** Идея из первой версии лаборатории: одна сцена — и сразу все техники по отдельности. */
  function renderCompare() {
    const { base: cmpBase, rows } = compareTechniques(S);
    const cell = (v, b, unit, lowerBetter = true) => {
      const d = b === 0 ? 0 : Math.round((v - b) / b * 100);
      const cls = d === 0 ? '' : (d < 0) === lowerBetter ? 'style="color:var(--ok)"' : 'style="color:var(--bad)"';
      return `${unit === 'мс' ? fmt(v, 2) : unit === 'Б' ? bytes(v) : fmtI(v)} <small ${cls}>${d === 0 ? '—' : (d > 0 ? '+' : '') + d + '%'}</small>`;
    };
    const B = cmpBase.T;
    $('#cmpBody').innerHTML = [
      `<tr><td>Без батчинга</td><td>${fmtI(B.draws)}</td><td>${fmtI(B.setpass)}</td><td>${fmt(B.cpu, 2)}</td><td>${bytes(B.upload)}</td><td>0</td><td class="note">точка отсчёта</td></tr>`,
      ...rows.map(r => {
        const T = r.result.T;
        const on = S[r.key] && available(r.key, S);
        return `<tr class="${on ? 'hl' : ''}"><td>${r.name}</td>
          <td>${cell(T.draws, B.draws)}</td>
          <td>${cell(T.setpass, B.setpass)}</td>
          <td>${cell(T.cpu, B.cpu, 'мс')}</td>
          <td>${cell(T.upload, B.upload, 'Б')}</td>
          <td>${T.memory ? bytes(T.memory) : '0'}</td>
          <td class="note">${r.available ? (on ? 'включена сейчас' : 'доступна в этой сцене') : '↪ ' + esc(r.reason)}</td></tr>`;
      })
    ].join('');
    $('#cmpNote').textContent = `Каждая строка — та же сцена (${OBJECTS.length * S.k} объектов, ${S.pipe.toUpperCase()}) с одной включённой техникой. Проценты — к строке «без батчинга».`;
  }

  function renderControls() {
    press(pipeBtns, b => b.dataset.v === S.pipe);
    press(scaleBtns, b => +b.dataset.v === S.k);
    tgBtns.forEach(b => {
      const k = b.dataset.k, ok = available(k, S);
      b.disabled = !ok;
      b.setAttribute('aria-pressed', S[k] && ok ? 'true' : 'false');
      b.title = ok ? '' : unavailableReason(k, S);
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
      playBtn.textContent = '► Проиграть кадр';
    }
  }
  function stepPlay() {
    if (S.play >= ev.runs.length - 1) {
      playT = setTimeout(() => { stopPlay(); renderTape(); if (RM) paintScene(); }, 900);
      return;
    }
    S.play++;
    $('#crtR').textContent = `► STEP ${S.play + 1}/${ev.runs.length}`;
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
    playBtn.textContent = '■ Стоп';
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

  recompute();
  refreshUI();
  paintScene();
  if (!RM) requestAnimationFrame(loop);
}
