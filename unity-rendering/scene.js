/** Изометрический квартал: сам по себе не знает про батчинг, только рисует объекты и их состояние. */
import { fitCanvas, shade, hexShade, RM } from '../assets/vhs.js?v=202609150438';
import { MATERIALS } from './model.js?v=202609150438';

const HOLO = ['#8ff0ff', '#ff9ae6'];

export function createScene(cv, opts) {
  const { objects, stateOf, isWire } = opts;
  let c, W, H, TW, OX, OY, t = 0, bb = null;

  const P = (x, y, z) => [OX + (x - y) * TW / 2, OY + (x + y) * TW / 4 - z * TW * 0.5];
  const acc = p => { if (!bb) return; bb[0] = Math.min(bb[0], p[0]); bb[1] = Math.min(bb[1], p[1]); bb[2] = Math.max(bb[2], p[0]); bb[3] = Math.max(bb[3], p[1]); };

  function poly(pts, fill, st, glow, stroke) {
    c.beginPath();
    pts.forEach((p, i) => { acc(p); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
    c.closePath();
    if (st === 'g') { c.strokeStyle = 'rgba(189,179,222,.3)'; c.lineWidth = 1; c.stroke(); return; }
    if (isWire()) { c.strokeStyle = stroke || fill; c.lineWidth = 1; c.stroke(); return; }
    if (glow) { c.shadowColor = glow; c.shadowBlur = 12; }
    c.fillStyle = fill;
    c.fill();
    c.shadowBlur = 0;
    if (st === 'h') { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.3; c.stroke(); }
  }

  function box(x, y, z, w, d, h, col, st, glow) {
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y - d / 2, y1 = y + d / 2;
    poly([P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + h), P(x0, y1, z + h)], shade(col, .78), st, glow, col);
    poly([P(x1, y0, z), P(x1, y1, z), P(x1, y1, z + h), P(x1, y0, z + h)], shade(col, .52), st, glow, col);
    poly([P(x0, y0, z + h), P(x1, y0, z + h), P(x1, y1, z + h), P(x0, y1, z + h)], shade(col, 1.18), st, glow, col);
  }

  function circ(p, r, fill, st, glow) {
    acc([p[0] - r, p[1] - r]); acc([p[0] + r, p[1] + r]);
    c.beginPath();
    c.arc(p[0], p[1], r, 0, Math.PI * 2);
    if (st === 'g' || isWire()) { c.strokeStyle = st === 'g' ? 'rgba(189,179,222,.3)' : fill; c.lineWidth = 1; c.stroke(); return; }
    if (glow) { c.shadowColor = glow; c.shadowBlur = 14; }
    c.fillStyle = fill;
    c.fill();
    c.shadowBlur = 0;
    if (st === 'h') { c.strokeStyle = '#fff'; c.lineWidth = 1.3; c.stroke(); }
  }

  function line(a, b, col, w = 1) {
    c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  }

  function objPos(o) {
    if (o.kind === 'car') { const L = 10.8; return [((o.gx + t * o.sp * o.dir) % L + L) % L - 0.4, o.gy]; }
    if (o.kind === 'char') { const L = 10.4; return [((o.gx + t * 0.22 * o.dir) % L + L) % L - 0.2, o.gy]; }
    return [o.gx, o.gy];
  }

  function drawObject(o, st) {
    const col = o.kind === 'holo' ? HOLO[o.id % 2] : MATERIALS[o.mat].c;
    const [x, y] = objPos(o);
    const glow = st === 'h' ? col : null;
    switch (o.kind) {
      case 'building': {
        box(x, y, 0, 1.4, 1.4, o.h, col, st, glow);
        if (st !== 'g' && !isWire()) {
          for (let z = .4; z < o.h - .15; z += .38) {
            line(P(x - .55, y + .7, z), P(x + .55, y + .7, z), 'rgba(255,214,243,.2)');
            line(P(x + .7, y - .55, z), P(x + .7, y + .55, z), 'rgba(185,246,255,.16)');
          }
        }
        break;
      }
      case 'sign':
        poly([P(x, y - .42, o.z), P(x, y + .42, o.z), P(x, y + .42, o.z + o.sh), P(x, y - .42, o.z + o.sh)], col, st, st === 'g' ? null : col, col);
        break;
      case 'lamp':
        box(x, y, 0, .08, .08, 1.1, col, st, glow);
        box(x, y, 1.08, .24, .24, .06, col, st, glow);
        if (st !== 'g') circ(P(x, y, 1.02), 2.6, '#fff6c8', st === 'd' ? 'd' : 'n', '#fff1a8');
        break;
      case 'tree': {
        const dx = RM ? 0 : Math.sin(t * 1.3 + o.ph) * .05;
        box(x, y, 0, .1, .1, .5, hexShade(col, .45), st, glow);
        circ(P(x + dx, y, .95), TW * .25, shade(col, .85), st, glow);
        if (st !== 'g') circ(P(x + dx - .05, y - .05, 1.08), TW * .12, shade(col, 1.25), st === 'h' ? 'n' : st, null);
        break;
      }
      case 'crate':
        box(x, y, RM ? 0 : Math.abs(Math.sin(t * 2.2 + o.ph)) * .1, .32, .32, .32, col, st, glow);
        break;
      case 'car':
        box(x, y, .06, .9, .42, .22, col, st, glow);
        box(x - .06 * o.dir, y, .28, .46, .36, .16, hexShade(col, .6), st, glow);
        if (st !== 'g') circ(P(x + .46 * o.dir, y, .17), 2.2, '#fff3c4', st === 'd' ? 'd' : 'n', '#fff3c4');
        break;
      case 'char': {
        const bob = RM ? 0 : Math.abs(Math.sin(t * 6 + o.id)) * .03;
        box(x, y, bob, .18, .14, .42, col, st, glow);
        circ(P(x, y, .55 + bob), TW * .065, shade(col, 1.1), st, glow);
        break;
      }
      case 'holo': {
        const ctr = P(x, y, o.z), w = TW * .78, h = TW * .46;
        const flicker = RM ? 1 : .7 + .3 * Math.abs(Math.sin(t * 7 + o.id * 3));
        if (st !== 'g') line(P(x, y, 0), ctr, shade(col, 1, .35), 1.5);
        c.save();
        if (st !== 'g') c.globalAlpha *= flicker;
        poly([[ctr[0] - w / 2, ctr[1] - h / 2], [ctr[0] + w / 2, ctr[1] - h / 2], [ctr[0] + w / 2, ctr[1] + h / 2], [ctr[0] - w / 2, ctr[1] + h / 2]],
          shade(col, 1, .28), st, st === 'g' ? null : col, col);
        if (st !== 'g' && !isWire()) {
          c.strokeStyle = col; c.lineWidth = 1.2;
          c.strokeRect(ctr[0] - w / 2, ctr[1] - h / 2, w, h);
          for (let yy = ctr[1] - h / 2 + 3; yy < ctr[1] + h / 2; yy += 4) line([ctr[0] - w / 2 + 2, yy], [ctr[0] + w / 2 - 2, yy], shade(col, 1, .25));
          c.fillStyle = col;
          c.font = `700 ${Math.max(9, TW * .14)}px "JetBrains Mono", monospace`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(o.id % 2 ? 'NEO BAR' : 'NEO-24', ctr[0], ctr[1]);
          c.textAlign = 'left';
        }
        c.restore();
        break;
      }
    }
  }

  function drawGround() {
    const g = c.createLinearGradient(0, OY, 0, OY + 5 * TW);
    g.addColorStop(0, '#140b26');
    g.addColorStop(1, '#0c0619');
    c.beginPath();
    [P(0, 0, 0), P(10, 0, 0), P(10, 10, 0), P(0, 10, 0)].forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p));
    c.closePath();
    c.fillStyle = g;
    c.fill();
    c.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      line(P(i, 0, 0), P(i, 10, 0), 'rgba(255,62,165,.13)');
      line(P(0, i, 0), P(10, i, 0), 'rgba(255,62,165,.13)');
    }
    const road = pts => {
      c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p));
      c.closePath();
      c.fillStyle = '#0a0614';
      c.fill();
    };
    road([P(0, 4.4, 0), P(10, 4.4, 0), P(10, 5.6, 0), P(0, 5.6, 0)]);
    road([P(4.4, 0, 0), P(5.6, 0, 0), P(5.6, 10, 0), P(4.4, 10, 0)]);
    line(P(0, 4.4, 0), P(10, 4.4, 0), 'rgba(38,227,234,.45)');
    line(P(0, 5.6, 0), P(10, 5.6, 0), 'rgba(38,227,234,.45)');
    line(P(4.4, 0, 0), P(4.4, 10, 0), 'rgba(38,227,234,.45)');
    line(P(5.6, 0, 0), P(5.6, 10, 0), 'rgba(38,227,234,.45)');
    c.setLineDash([6, 8]);
    line(P(0, 5, 0), P(10, 5, 0), 'rgba(255,210,63,.35)');
    line(P(5, 0, 0), P(5, 10, 0), 'rgba(255,210,63,.35)');
    c.setLineDash([]);
  }

  function resize() {
    const w = cv.clientWidth;
    ({ c, w: W, h: H } = fitCanvas(cv, Math.round(w * .66)));
    TW = W / 10.9;
    OX = W / 2;
    OY = TW * 1.95;
  }

  function draw(time, hoverId) {
    if (!c) resize();
    t = time;
    c.clearRect(0, 0, W, H);
    drawGround();
    const order = objects
      .map(o => { const [x, y] = objPos(o); return { o, k: x + y + (o.kind === 'sign' ? .01 : 0) + (o.kind === 'holo' ? .3 : 0) }; })
      .sort((a, b) => a.k - b.k);
    for (const { o } of order) {
      const st = stateOf(o);
      bb = [1e9, 1e9, -1e9, -1e9];
      c.save();
      if (st === 'd') c.globalAlpha = .2;
      drawObject(o, st);
      c.restore();
      o._bb = bb;
      bb = null;
    }
    if (hoverId != null && hoverId >= 0) {
      const b = objects[hoverId]._bb;
      if (b) {
        c.strokeStyle = 'rgba(255,210,63,.9)';
        c.setLineDash([3, 3]);
        c.strokeRect(b[0] - 3, b[1] - 3, b[2] - b[0] + 6, b[3] - b[1] + 6);
        c.setLineDash([]);
      }
    }
  }

  function pick(mx, my) {
    let hit = null, best = -1;
    objects.forEach(o => {
      const b = o._bb;
      if (!b) return;
      const pad = 6;
      if (mx >= b[0] - pad && mx <= b[2] + pad && my >= b[1] - pad && my <= b[3] + pad) {
        const [x, y] = objPos(o);
        const k = x + y + (o.kind === 'holo' ? .3 : 0) + (o.kind === 'sign' ? .01 : 0);
        if (k > best) { best = k; hit = o; }
      }
    });
    return hit;
  }

  resize();
  return { resize, draw, pick };
}
