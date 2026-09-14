/** Заставка: две дорожки кадра — что делает CPU и что в это время делает GPU. */
import { $, fitCanvas, fmt, press, RM, onVisible } from '../assets/vhs.js';
import { t, onLang } from '../assets/i18n.js';

const CULL = 0.004, CPU_DRAW = 0.055, GPU_DRAW = 0.018, BATCHES = 5, CPU_BATCH = 0.09;

export function initLanes() {
  const cv = $('#lanes');
  if (!cv) return;
  const nIn = $('#lnN'), nOut = $('#lnNo'), read = $('#lnRead'), bSep = $('#lnSep'), bBat = $('#lnBat');
  let mode = 'sep', ctx, W, H, model, t0 = performance.now(), visible = true;

  function compute() {
    const n = +nIn.value, cpu = [], gpu = [];
    let cursor = n * CULL;
    cpu.push({ s: 0, e: cursor, cull: true });
    let gEnd = 0, busy = 0;
    if (mode === 'sep') {
      for (let i = 0; i < n; i++) {
        const s = cursor, e = cursor + CPU_DRAW;
        cpu.push({ s, e }); cursor = e;
        const gs = Math.max(e, gEnd), ge = gs + GPU_DRAW;
        gpu.push({ s: gs, e: ge }); gEnd = ge; busy += GPU_DRAW;
      }
    } else {
      const per = n / BATCHES;
      for (let i = 0; i < BATCHES; i++) {
        const s = cursor, e = cursor + CPU_BATCH;
        cpu.push({ s, e }); cursor = e;
        const w = per * GPU_DRAW + 0.01;
        const gs = Math.max(e, gEnd), ge = gs + w;
        gpu.push({ s: gs, e: ge }); gEnd = ge; busy += w;
      }
    }
    const frame = Math.max(cursor, gEnd);
    model = { cpu, gpu, cpuT: cursor, gpuT: busy, frame, idle: 1 - busy / frame, bound: cursor > busy ? 'CPU' : 'GPU' };
    nOut.textContent = n;
    const fps = 1000 / model.frame;
    const ms = t('lanes.ms');
    read.innerHTML = `<span>${t('lanes.cpu')} <b class="cpu">${fmt(model.cpuT, 1)} ${ms}</b></span>`
      + `<span>${t('lanes.gpu')} <b class="gpu">${fmt(model.gpuT, 1)} ${ms}</b></span>`
      + `<span>${t('lanes.idle')} <b>${Math.round(model.idle * 100)}%</b> ${t('lanes.idleUnit')}</span>`
      + `<span>${t('lanes.frame')} <b>${fmt(model.frame, 1)} ${ms}</b> (${fps > 999 ? '999+' : Math.round(fps)} FPS)</span>`
      + `<span class="verdict ${model.bound === 'CPU' ? 'cpu-b' : 'gpu-b'}">${t('lanes.bound', model.bound)}</span>`;
    t0 = performance.now();
  }

  function resize() { ({ c: ctx, w: W, h: H } = fitCanvas(cv, 170)); }

  function draw(now) {
    const L = 64, R = W - 10, scale = Math.max(20, Math.ceil((model.frame + 2) / 4) * 4);
    const X = v => L + (R - L) * v / scale;
    const dur = 2600, ph = RM ? 1 : Math.min(1, ((now - t0) % (dur + 900)) / dur), head = scale * ph;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    const lanes = [
      { y: 22, h: 40, lbl: 'CPU', col: '#ff3ea5', arr: model.cpu },
      { y: 84, h: 40, lbl: 'GPU', col: '#26e3ea', arr: model.gpu }
    ];
    lanes.forEach(l => {
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      ctx.fillRect(L, l.y, R - L, l.h);
      ctx.fillStyle = l.col;
      ctx.fillText(l.lbl, 8, l.y + l.h / 2);
      l.arr.forEach(b => {
        if (b.s > head) return;
        const e = Math.min(b.e, head), x = X(b.s), w = Math.max(1, X(e) - x);
        ctx.fillStyle = b.cull ? 'rgba(189,179,222,.35)' : l.col;
        ctx.globalAlpha = b.cull ? 1 : .9;
        ctx.fillRect(x, l.y + 4, w > 3 ? w - 1 : w, l.h - 8);
        ctx.globalAlpha = 1;
      });
    });
    const cb = model.cpu[0];
    if (X(cb.e) - X(cb.s) > 70 && head > cb.e) {
      ctx.fillStyle = '#0b0715';
      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillText('culling', X(cb.s) + 6, 42);
    }
    ctx.strokeStyle = 'rgba(189,179,222,.3)';
    ctx.beginPath(); ctx.moveTo(L, 140); ctx.lineTo(R, 140); ctx.stroke();
    ctx.fillStyle = '#8c82b0';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let v = 0; v <= scale; v += 4) {
      ctx.fillRect(X(v), 137, 1, 6);
      ctx.fillText(v + ' ' + t('lanes.ms'), X(v), 156);
    }
    ctx.textAlign = 'left';
    const bx = X(16.7);
    ctx.strokeStyle = '#ffd23f';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(bx, 14); ctx.lineTo(bx, 134); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffd23f';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('60 FPS', bx + 4, 12);
    if (!RM && ph < 1) {
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.fillRect(X(head), 16, 1.5, 116);
    }
  }

  function loop(now) {
    if (visible) draw(now);
    requestAnimationFrame(loop);
  }

  bSep.onclick = () => { mode = 'sep'; press([bSep, bBat], b => b === bSep); compute(); };
  bBat.onclick = () => { mode = 'bat'; press([bSep, bBat], b => b === bBat); compute(); };
  nIn.oninput = compute;
  onLang(compute);
  addEventListener('resize', resize);
  onVisible(cv, v => visible = v);
  resize();
  compute();
  requestAnimationFrame(loop);
}
