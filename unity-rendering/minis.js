/** Маленькие стенды к главам: static, dynamic, SRP Batcher, instancing, GPU Resident Drawer. */
import { $, $$, fmt, fmtI, bytes, fitCanvas, RM, plural } from '../../assets/vhs.js';

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
      `<button class="${cls[i]}" aria-pressed="${!!v}" aria-label="Здание ${i + 1}: ${v ? 'видно' : 'скрыто'}">${i + 1}</button>`).join('');
    const n = vis.filter(Boolean).length;
    out.innerHTML = n
      ? `Видно <b>${n}</b> из 16 → <b>${runs}</b> ${plural(runs, 'draw call', 'draw calla', 'draw callов')}. Каждый непрерывный кусок видимых индексов — отдельный вызов.${runs === 1 && n === 16 ? ' Всё видно — весь буфер одним вызовом.' : ''}`
      : 'Камера ничего не видит — <b>0</b> draw calls. Но буфер всё равно лежит в памяти.';
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
      <div class="mb"><div class="top"><span>Без static batching: 1 меш на всех</span><b>${bytes(a)}</b></div>
        <div class="track"><i style="width:${Math.max(.6, a / max * 100)}%;background:var(--ok)"></i></div></div>
      <div class="mb"><div class="top"><span>Со static batching: ${k} ${plural(k, 'копия', 'копии', 'копий')} в мировых координатах</span><b>${bytes(b)}</b></div>
        <div class="track"><i style="width:${b / max * 100}%;background:var(--bad)"></i></div></div>`;
  }
  n.oninput = renderMemory;
  renderMemory();

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
    `<button class="chip" data-a="${name}" aria-pressed="${sel.has(name)}" ${lock ? 'disabled title="Позиция есть всегда"' : ''}>${name}</button>`).join('');
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
    $('#dyLimit').innerHTML = `Атрибутов: <b>${na}</b> → лимит: min(300, 900 / ${na}) = <b>${limit}</b> вершин. Меш на ${V} — ${ok ? '<span style="color:var(--ok)">проходит</span>' : '<span style="color:var(--bad)">не проходит</span>'}.`;

    const without = C * 0.020, withBatch = 0.020 + C * V * na * 0.00004;
    const max = Math.max(without, withBatch) * 1.1;
    $('#dyBars').innerHTML = `
      <div class="mb"><div class="top"><span>Без батчинга: ${C} draw calls</span><b>${fmt(without, 2)} мс</b></div>
        <div class="track"><i style="width:${without / max * 100}%;background:var(--cpu)"></i></div></div>
      <div class="mb"><div class="top"><span>${ok ? `Dynamic batch: 1 вызов + ${fmtI(C * V)} вершин на CPU` : 'Dynamic batching: не применится'}</span><b>${ok ? fmt(withBatch, 2) + ' мс' : '—'}</b></div>
        <div class="track"><i style="width:${ok ? withBatch / max * 100 : 0}%;background:var(--warn)"></i></div></div>`;

    const vd = $('#dyVerdict');
    if (!ok) { vd.className = 'badge no'; vd.textContent = '✗ Меш слишком большой — Unity нарисует по одному'; }
    else if (withBatch < without * 0.9) { vd.className = 'badge ok'; vd.textContent = `✓ Выгодно: −${Math.round((1 - withBatch / without) * 100)}% CPU`; }
    else if (withBatch <= without * 1.05) { vd.className = 'badge warn'; vd.textContent = '≈ Почти без разницы'; }
    else { vd.className = 'badge no'; vd.textContent = `✗ Хуже: +${Math.round((withBatch / without - 1) * 100)}% CPU — батчинг дороже draw calls`; }

    $('#dyNote').innerHTML = ok
      ? `Плюс каждый кадр на GPU заново уезжает <b>${bytes(C * V * bytesPerVertex)}</b> вершин (${bytesPerVertex} байт на вершину) — даже если объекты стоят на месте.`
      : 'Попробуй уменьшить число вершин или убрать лишние атрибуты — например, UV1 и Tangent.';
  }
  render();
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
  const head = t => `<div class="hd"><span>${t}</span><span>кадр ${frame || '—'}</span></div>`;

  const seqPlain = () => {
    const L = [];
    let cur = null;
    objs.forEach(([o, m]) => {
      if (m !== cur) { L.push(['sp', `SetPass · Lit · Mat ${m}`, 'CPU']); L.push(['up', `↑ свойства Mat ${m}`, '128 Б']); cur = m; }
      L.push(['up', `↑ матрицы ${o}`, '256 Б']);
      L.push(['dr', `Draw ${o}`, '']);
    });
    return L;
  };
  const seqSrp = () => {
    const L = [['sp', 'SetPass · Lit (один вариант)', 'CPU']];
    const d = [...dirty];
    if (frame === 1) L.push(['up', '↑ Mat A, B, C → VRAM (один раз)', '384 Б']);
    else if (d.length) d.forEach(m => L.push(['up', `↑ только Mat ${m} (изменился)`, '128 Б']));
    else L.push(['no', 'материалы уже в VRAM — заливать нечего', '0 Б']);
    L.push(['up', '↑ UnityPerDraw: 6 объектов одним куском', '1,5 КБ']);
    objs.forEach(([o, m]) => L.push(['bd', `bind Mat ${m} · Draw ${o}`, '']));
    return L;
  };
  const summary = L => {
    const sp = L.filter(x => x[0] === 'sp').length;
    const up = L.filter(x => x[0] === 'up').length;
    const dr = L.filter(x => x[0] === 'dr' || x[0] === 'bd').length;
    return `<div class="cmdsum"><span>SetPass: <b>${sp}</b></span><span>Заливок: <b>${up}</b></span><span>Draw calls: <b>${dr}</b></span></div>`;
  };

  function play() {
    timers.forEach(clearTimeout);
    timers = [];
    const A = seqPlain(), B = seqSrp();
    colA.innerHTML = head('Без SRP Batcher');
    colB.innerHTML = head('SRP Batcher');
    const add = (col, [k, t, r]) => {
      const d = document.createElement('div');
      d.className = 'cmd ' + k;
      d.innerHTML = `<span>${t}</span><span>${r}</span>`;
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
        const t = B[i][1];
        if (B[i][0] === 'up') {
          if (t.includes('UnityPerDraw')) objs.forEach(([o]) => flash(`#vDraw [data-o="${o}"]`));
          else ['A', 'B', 'C'].forEach(m => { if (frame === 1 || t.includes('Mat ' + m)) flash(`#vMat [data-m="${m}"]`); });
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
    ['cb', 'Свойства материала в CBUFFER UnityPerMaterial', false],
    ['pd', 'Встроенные свойства в CBUFFER UnityPerDraw', false],
    ['mpb', 'Объект использует MaterialPropertyBlock', true],
    ['ps', 'Это Particle System', true]
  ];
  const st = { cb: true, pd: true, mpb: false, ps: false };
  const wrap = $('#srpChecks');
  wrap.innerHTML = checks.map(([k, t, neg]) =>
    `<button class="check${neg ? ' neg' : ''}" data-k="${k}" aria-pressed="${st[k]}"><span>${t}</span><span class="sw">${st[k] ? 'ДА' : 'НЕТ'}</span></button>`).join('');
  function upd() {
    $$('.check', wrap).forEach(b => {
      const v = st[b.dataset.k];
      b.setAttribute('aria-pressed', v);
      b.querySelector('.sw').textContent = v ? 'ДА' : 'НЕТ';
    });
    const bad = [];
    if (!st.cb) bad.push('свойства материала вне UnityPerMaterial');
    if (!st.pd) bad.push('встроенные свойства вне UnityPerDraw');
    if (st.mpb) bad.push('MaterialPropertyBlock');
    if (st.ps) bad.push('частицы');
    const b = $('#srpBadge');
    if (bad.length) { b.className = 'badge no'; b.textContent = 'SRP Batcher: not compatible — ' + bad.join(', '); }
    else { b.className = 'badge ok'; b.textContent = 'SRP Batcher: compatible'; }
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.check');
    if (!b) return;
    st[b.dataset.k] = !st[b.dataset.k];
    upd();
  });
  upd();
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
    $('#inOut').innerHTML = `Draw calls: <b>${fmtI(draws)}</b> вместо <b>${fmtI(N)}</b><br>`
      + `Per-instance буфер: <b>${bytes(N * bytesPer)}</b> за кадр (${bytesPer} Б на инстанс: 2 матрицы${perInstanceColor ? ' + цвет' : ''})<br>`
      + `Меш на GPU: <b>1 копия</b>${meshes > 1 ? ' каждого из 3' : ''}`;
    $('#inNote').innerHTML = (perInstanceColor
      ? 'Цвет у каждого инстанса — это per-instance свойство. В Built-in его задают через MaterialPropertyBlock и <code>UNITY_INSTANCING_BUFFER</code>, instancing при этом не ломается. Но в URP MaterialPropertyBlock выбивает объект из SRP Batcher. '
      : 'Цвет точки — номер draw call, в который попал инстанс. ')
      + (meshes > 1 ? 'Разные меши не инстансятся вместе — у каждого своя серия вызовов.' : `Лимит ${max} инстансов на вызов: следующий инстанс открывает новый draw call.`);
  }

  [mB, cB, xB].forEach(b => b.onclick = () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    render();
  });
  n.oninput = render;
  addEventListener('resize', () => { resize(); render(); });
  resize();
  render();
}

/* ---------------- CH.07 GPU Resident Drawer ---------------- */
export function initGrdMini() {
  const wrap = $('#grdChecks');
  if (!wrap) return;
  const checks = [
    ['fp', 'Rendering Path: Forward+'],
    ['srp', 'SRP Batcher включён'],
    ['brg', 'BatchRendererGroup Variants: Keep All'],
    ['cs', 'Платформа с compute shaders (не OpenGL ES)'],
    ['mr', 'Объект — MeshRenderer, не SkinnedMeshRenderer'],
    ['mpb', 'Без MaterialPropertyBlock']
  ];
  const st = {};
  checks.forEach(([k]) => st[k] = true);
  wrap.innerHTML = checks.map(([k, t]) => `<button class="check" data-k="${k}" aria-pressed="true"><span>${t}</span><span class="sw">ДА</span></button>`).join('');
  const nameOf = k => checks.find(x => x[0] === k)[1];

  function upd() {
    $$('.check', wrap).forEach(b => {
      const v = st[b.dataset.k];
      b.setAttribute('aria-pressed', v);
      b.querySelector('.sw').textContent = v ? 'ДА' : 'НЕТ';
    });
    const project = ['fp', 'srp', 'brg', 'cs'].filter(k => !st[k]);
    const obj = ['mr', 'mpb'].filter(k => !st[k]);
    const badge = $('#grdBadge'), out = $('#grdOut');
    if (project.length) {
      badge.className = 'badge no';
      badge.textContent = 'GPU Resident Drawer не работает';
      out.innerHTML = `Не выполнено на уровне проекта: <b>${project.map(nameOf).join('; ')}</b>. Всё рисуется обычным путём SRP Batcher${st.srp ? '' : ' (или вообще без него)'}.`;
    } else if (obj.length) {
      badge.className = 'badge warn';
      badge.textContent = 'Fallback для этого объекта';
      out.innerHTML = `Проект настроен, но этот объект не подходит: <b>${obj.map(nameOf).join('; ')}</b>. Unity тихо нарисует его без GPU instancing — обычным путём.`;
    } else {
      badge.className = 'badge ok';
      badge.textContent = '✓ Hybrid Batch Group';
      out.innerHTML = 'Объект живёт в GPU-памяти через BatchRendererGroup. Все объекты с тем же мешем и материалом рисуются одним instanced-вызовом, CPU почти не тратит время на объект. В Frame Debugger ищи <b>Hybrid Batch Group</b>.';
    }
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.check');
    if (!b) return;
    st[b.dataset.k] = !st[b.dataset.k];
    upd();
  });
  upd();
}
