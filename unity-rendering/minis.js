/** Маленькие стенды к главам: static, dynamic, SRP Batcher, instancing, GPU Resident Drawer. */
import { $, $$, fmt, fmtI, bytes, fitCanvas, RM } from '../assets/vhs.js?v=202609252015';
import { t, onLang } from '../assets/i18n.js?v=202609252015';

/* ---------------- CH.03 static batching ---------------- */
export function initStaticMini() {
  const box = $('#ibuf');
  if (!box) return;
  const out = $('#ibufOut');
  let vis = [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0];

  function render() {
    let runs = 0, r = -1;
    const cls = vis.map((v, i) => {
      if (v && (i === 0 || !vis[i - 1])) { runs++; r++; }
      return v ? 'r' + (r % 8) : '';
    });
    box.innerHTML = vis.map((v, i) =>
      `<button class="${cls[i]}" aria-pressed="${!!v}" aria-label="${t('static.cellAria', i + 1, v)}">${i + 1}</button>`).join('');
    const n = vis.filter(Boolean).length;
    out.innerHTML = n ? t('static.out', n, runs) : t('static.outEmpty');
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = [...box.children].indexOf(b);
    vis[i] = vis[i] ? 0 : 1;
    render();
  });
  $('#ibufRnd').onclick = () => { vis = vis.map(() => Math.random() < .68 ? 1 : 0); render(); };
  $('#ibufAll').onclick = () => { vis = vis.map(() => 1); render(); };
  render();

  const n = $('#stN'), mem = $('#stMem'), MESH_BYTES = 800 * 48;
  function renderMemory() {
    const k = +n.value;
    $('#stNo').textContent = k;
    const a = MESH_BYTES, b = MESH_BYTES * k, max = Math.max(MESH_BYTES * 500, b);
    mem.innerHTML = `
      <div class="mb"><div class="top"><span>${t('static.memWithout')}</span><b>${bytes(a)}</b></div>
        <div class="track"><i style="width:${Math.max(.6, a / max * 100)}%;background:var(--ok)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('static.memWith', k)}</span><b>${bytes(b)}</b></div>
        <div class="track"><i style="width:${b / max * 100}%;background:var(--bad)"></i></div></div>`;
  }
  n.oninput = renderMemory;
  renderMemory();
  onLang(() => { render(); renderMemory(); });

  $('#stMove').onclick = () => {
    $('#stToast').hidden = false;
    const p = $('#stMove');
    p.classList.remove('shake');
    void p.offsetWidth;
    if (!RM) p.classList.add('shake');
  };
}

/* ---------------- CH.04 dynamic batching ---------------- */
export function initDynamicMini() {
  const wrap = $('#dyAttrs');
  if (!wrap) return;
  const ATTRS = [['Position', 12, true], ['Normal', 12, false], ['UV0', 8, false], ['UV1', 8, false], ['Tangent', 16, false], ['Color', 4, false]];
  const sel = new Set(['Position', 'Normal', 'UV0']);
  wrap.innerHTML = ATTRS.map(([name, , lock]) =>
    `<button class="chip" data-a="${name}" aria-pressed="${sel.has(name)}" ${lock ? `disabled data-i18n-title="dyn.posLock" title="${t('dyn.posLock')}"` : ''}>${name}</button>`).join('');
  wrap.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a;
    sel.has(a) ? sel.delete(a) : sel.add(a);
    b.setAttribute('aria-pressed', sel.has(a));
    render();
  });
  const v = $('#dyV'), cnt = $('#dyC');
  v.oninput = cnt.oninput = render;

  function render() {
    const V = +v.value, C = +cnt.value, na = sel.size;
    const limit = Math.min(300, Math.floor(900 / na));
    const ok = V <= limit;
    const bytesPerVertex = ATTRS.filter(a => sel.has(a[0])).reduce((s, a) => s + a[1], 0);
    $('#dyVo').textContent = V;
    $('#dyCo').textContent = C;
    $('#dyLimit').innerHTML = t('dyn.limit', na, limit, V, ok);

    const without = C * 0.020, withBatch = 0.020 + C * V * na * 0.00004;
    const max = Math.max(without, withBatch) * 1.1;
    const ms = t('stats.ms');
    $('#dyBars').innerHTML = `
      <div class="mb"><div class="top"><span>${t('dyn.barWithout', C)}</span><b>${fmt(without, 2)} ${ms}</b></div>
        <div class="track"><i style="width:${without / max * 100}%;background:var(--cpu)"></i></div></div>
      <div class="mb"><div class="top"><span>${t('dyn.barWith', ok, C * V)}</span><b>${ok ? fmt(withBatch, 2) + ' ' + ms : '—'}</b></div>
        <div class="track"><i style="width:${ok ? withBatch / max * 100 : 0}%;background:var(--warn)"></i></div></div>`;

    const vd = $('#dyVerdict');
    if (!ok) { vd.className = 'badge no'; vd.textContent = t('dyn.verdictTooBig'); }
    else if (withBatch < without * 0.9) { vd.className = 'badge ok'; vd.textContent = t('dyn.verdictGood', Math.round((1 - withBatch / without) * 100)); }
    else if (withBatch <= without * 1.05) { vd.className = 'badge warn'; vd.textContent = t('dyn.verdictSame'); }
    else { vd.className = 'badge no'; vd.textContent = t('dyn.verdictBad', Math.round((withBatch / without - 1) * 100)); }

    $('#dyNote').innerHTML = ok
      ? t('dyn.noteOk', bytes(C * V * bytesPerVertex), bytesPerVertex)
      : t('dyn.noteBad');
  }
  render();
  onLang(render);
}

/* ---------------- CH.05 SRP Batcher ---------------- */
export function initSrpMini() {
  const colA = $('#srpA');
  if (!colA) return;
  const colB = $('#srpB'), vMat = $('#vMat'), vDraw = $('#vDraw');
  const objs = [['Obj1', 'A'], ['Obj2', 'A'], ['Obj3', 'B'], ['Obj4', 'B'], ['Obj5', 'C'], ['Obj6', 'C']];
  let frame = 0, dirty = new Set(), timers = [];

  vMat.innerHTML = ['A', 'B', 'C'].map(m => `<span class="slot" data-m="${m}">Mat ${m}</span>`).join('');
  vDraw.innerHTML = objs.map(([o]) => `<span class="slot" data-o="${o}">${o.replace('Obj', '#')}</span>`).join('');
  const head = title => `<div class="hd"><span>${title}</span><span>${t('srp.frameNo', frame)}</span></div>`;

  const seqPlain = () => {
    const L = [];
    let cur = null;
    objs.forEach(([o, m]) => {
      if (m !== cur) {
        L.push(['sp', t('srp.cmdSetPass', m), 'CPU']);
        L.push(['up', t('srp.cmdMatProps', m), bytes(128)]);
        cur = m;
      }
      L.push(['up', t('srp.cmdMatrices', o), bytes(256)]);
      L.push(['dr', t('srp.cmdDraw', o), '']);
    });
    return L;
  };
  const seqSrp = () => {
    const L = [['sp', t('srp.cmdSetPassOne'), 'CPU']];
    const changed = [...dirty];
    if (frame === 1) L.push(['up', t('srp.cmdUploadAll'), bytes(384)]);
    else if (changed.length) changed.forEach(m => L.push(['up', t('srp.cmdUploadOne', m), bytes(128)]));
    else L.push(['no', t('srp.cmdNothing'), bytes(0)]);
    L.push(['up', t('srp.cmdPerDraw'), bytes(1536)]);
    objs.forEach(([o, m]) => L.push(['bd', t('srp.cmdBind', m, o), '']));
    return L;
  };
  const summary = L => {
    const sp = L.filter(x => x[0] === 'sp').length;
    const up = L.filter(x => x[0] === 'up').length;
    const dr = L.filter(x => x[0] === 'dr' || x[0] === 'bd').length;
    return `<div class="cmdsum"><span>${t('srp.sumSetPass')} <b>${sp}</b></span><span>${t('srp.sumUploads')} <b>${up}</b></span><span>${t('srp.sumDraws')} <b>${dr}</b></span></div>`;
  };

  function play() {
    timers.forEach(clearTimeout);
    timers = [];
    const A = seqPlain(), B = seqSrp();
    colA.innerHTML = head(t('srp.colA'));
    colB.innerHTML = head(t('srp.colB'));
    const add = (col, [kind, text, right]) => {
      const d = document.createElement('div');
      d.className = 'cmd ' + kind;
      d.innerHTML = `<span>${text}</span><span>${right}</span>`;
      col.appendChild(d);
    };
    const flash = sel => {
      const el = $(sel);
      if (!el) return;
      el.classList.add('flash');
      timers.push(setTimeout(() => el.classList.remove('flash'), 500));
    };
    const step = RM ? 0 : 110, n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) timers.push(setTimeout(() => {
      if (A[i]) add(colA, A[i]);
      if (B[i]) {
        add(colB, B[i]);
        if (B[i][0] === 'up') {
          if (B[i][1] === t('srp.cmdPerDraw')) objs.forEach(([o]) => flash(`#vDraw [data-o="${o}"]`));
          else ['A', 'B', 'C'].forEach(m => { if (frame === 1 || B[i][1].includes('Mat ' + m)) flash(`#vMat [data-m="${m}"]`); });
        }
      }
    }, i * step));
    timers.push(setTimeout(() => {
      colA.insertAdjacentHTML('beforeend', summary(A));
      colB.insertAdjacentHTML('beforeend', summary(B));
      dirty.clear();
    }, n * step + 50));
  }

  $('#srpRun').onclick = () => { frame = 1; dirty.clear(); play(); };
  $('#srpNext').onclick = () => { frame = frame ? frame + 1 : 1; play(); };
  $('#srpDirty').onclick = () => { if (!frame) frame = 1; else { frame++; dirty.add('B'); } play(); };
  frame = 1;
  play();

  const checks = [
    ['cb', 'srp.chkCbuffer', false],
    ['pd', 'srp.chkPerDraw', false],
    ['mpb', 'srp.chkMpb', true],
    ['ps', 'srp.chkParticles', true]
  ];
  const st = { cb: true, pd: true, mpb: false, ps: false };
  const wrap = $('#srpChecks');

  function renderChecks() {
    wrap.innerHTML = checks.map(([k, key, neg]) =>
      `<button class="check${neg ? ' neg' : ''}" data-k="${k}" aria-pressed="${st[k]}"><span>${t(key)}</span><span class="sw">${t(st[k] ? 'chk.yes' : 'chk.no')}</span></button>`).join('');
    const bad = [];
    if (!st.cb) bad.push(t('srp.badMat'));
    if (!st.pd) bad.push(t('srp.badDraw'));
    if (st.mpb) bad.push(t('srp.badMpb'));
    if (st.ps) bad.push(t('srp.badParticles'));
    const badge = $('#srpBadge');
    badge.className = bad.length ? 'badge no' : 'badge ok';
    badge.textContent = bad.length ? t('srp.badgeNo', bad.join(', ')) : t('srp.badgeOk');
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.check');
    if (!b) return;
    st[b.dataset.k] = !st[b.dataset.k];
    renderChecks();
  });
  renderChecks();
  onLang(() => { renderChecks(); play(); });
}

/* ---------------- CH.06 GPU instancing ---------------- */
export function initInstancingMini() {
  const cv = $('#instCv');
  if (!cv) return;
  const n = $('#inN'), mB = $('#inMesh'), cB = $('#inCol'), xB = $('#inMax');
  const PAL = ['#ff3ea5', '#26e3ea', '#ffd23f', '#a77bff', '#5dfc9a', '#ff9a3d', '#6cc9ff', '#ff8b8b', '#ffe9a8', '#b8ff6d', '#ff6fb0'];
  const seed = Array.from({ length: 5000 }, () => [Math.random(), Math.random(), Math.random()]);
  let c, W, H;
  const resize = () => ({ c, w: W, h: H } = fitCanvas(cv, 280));

  function render() {
    const N = +n.value;
    const meshes = mB.getAttribute('aria-pressed') === 'true' ? 3 : 1;
    const perInstanceColor = cB.getAttribute('aria-pressed') === 'true';
    const max = xB.getAttribute('aria-pressed') === 'true' ? 1023 : 500;
    $('#inNo').textContent = fmtI(N);
    c.clearRect(0, 0, W, H);
    const cols = Math.ceil(Math.sqrt(N * W / H)), rows = Math.ceil(N / cols);
    const cw = W / cols, ch = H / rows, s = Math.max(1.5, Math.min(cw, ch) * .62);
    const per = [0, 0, 0];
    for (let i = 0; i < N; i++) {
      const m = meshes === 1 ? 0 : Math.floor(seed[i][2] * 3);
      const idx = per[m]++;
      const bi = meshes === 1 ? Math.floor(idx / max) : m * 20 + Math.floor(idx / max);
      const x = (i % cols + .5) * cw, y = (Math.floor(i / cols) + .5) * ch;
      c.fillStyle = perInstanceColor ? `hsl(${Math.floor(seed[i][0] * 360)},90%,65%)` : PAL[bi % PAL.length];
      c.globalAlpha = perInstanceColor ? .9 : .85;
      c.beginPath();
      if (m === 0) { c.moveTo(x, y - s / 2); c.lineTo(x + s / 2, y); c.lineTo(x, y + s / 2); c.lineTo(x - s / 2, y); }
      else if (m === 1) { c.arc(x, y, s / 2.2, 0, Math.PI * 2); }
      else { c.moveTo(x, y - s / 2); c.lineTo(x + s / 2, y + s / 2); c.lineTo(x - s / 2, y + s / 2); }
      c.fill();
    }
    c.globalAlpha = 1;
    const draws = per.reduce((a, v) => a + Math.ceil(v / max), 0);
    const bytesPer = 128 + (perInstanceColor ? 16 : 0);
    $('#inOut').innerHTML = t('inst.out', draws, N, bytes(N * bytesPer), bytesPer, perInstanceColor, meshes);
    $('#inNote').innerHTML = t(perInstanceColor ? 'inst.noteColor' : 'inst.notePlain')
      + (meshes > 1 ? t('inst.noteMeshes') : t('inst.noteLimit', max));
  }

  [mB, cB, xB].forEach(b => b.onclick = () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    render();
  });
  n.oninput = render;
  addEventListener('resize', () => { resize(); render(); });
  onLang(render);
  resize();
  render();
}

/* ---------------- CH.07 GPU Resident Drawer ---------------- */
export function initGrdMini() {
  const wrap = $('#grdChecks');
  if (!wrap) return;
  const checks = [
    ['fp', 'grd.chkFp'], ['srp', 'grd.chkSrp'], ['brg', 'grd.chkBrg'],
    ['cs', 'grd.chkCs'], ['mr', 'grd.chkMr'], ['mpb', 'grd.chkMpb']
  ];
  const st = {};
  checks.forEach(([k]) => st[k] = true);
  const nameOf = k => t(checks.find(x => x[0] === k)[1]);

  function render() {
    wrap.innerHTML = checks.map(([k, key]) =>
      `<button class="check" data-k="${k}" aria-pressed="${st[k]}"><span>${t(key)}</span><span class="sw">${t(st[k] ? 'chk.yes' : 'chk.no')}</span></button>`).join('');
    const project = ['fp', 'srp', 'brg', 'cs'].filter(k => !st[k]);
    const obj = ['mr', 'mpb'].filter(k => !st[k]);
    const badge = $('#grdBadge'), out = $('#grdOut');
    if (project.length) {
      badge.className = 'badge no';
      badge.textContent = t('grd.badgeNo');
      out.innerHTML = t('grd.outNo', project.map(nameOf).join('; '), st.srp);
    } else if (obj.length) {
      badge.className = 'badge warn';
      badge.textContent = t('grd.badgeFallback');
      out.innerHTML = t('grd.outFallback', obj.map(nameOf).join('; '));
    } else {
      badge.className = 'badge ok';
      badge.textContent = t('grd.badgeOk');
      out.innerHTML = t('grd.outOk');
    }
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.check');
    if (!b) return;
    st[b.dataset.k] = !st[b.dataset.k];
    render();
  });
  render();
  onLang(render);
}
