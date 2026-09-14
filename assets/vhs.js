/** Общие утилиты и VHS-эффекты для всех кассет сайта. */
export { rng } from './rand.js?v=202609141732';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
/** В node (тесты) matchMedia нет — считаем, что анимации разрешены. */
export const RM = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let locale = 'en-US';
/** Локаль для чисел и единиц измерения; переключается вместе с языком страницы. */
export const setLocale = l => { locale = l; };
export const getLocale = () => locale;

export const fmt = (v, d = 1) => v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtI = v => Math.round(v).toLocaleString(locale);
export const bytes = b => {
  const u = locale.startsWith('ru') ? ['Б', 'КБ', 'МБ'] : ['B', 'KB', 'MB'];
  return b < 1024 ? fmtI(b) + ' ' + u[0]
    : b < 1048576 ? fmt(b / 1024, b < 10240 ? 1 : 0) + ' ' + u[1]
    : fmt(b / 1048576, b < 10485760 ? 1 : 0) + ' ' + u[2];
};
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

const hexRGB = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const mix = (v, f) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f)));
export const hexShade = (h, f) => '#' + hexRGB(h).map(v => mix(v, f).toString(16).padStart(2, '0')).join('');
export const shade = (h, f, a = 1) => { const [r, g, b] = hexRGB(h).map(v => mix(v, f)); return `rgba(${r},${g},${b},${a})`; };

/** Подгоняет canvas под devicePixelRatio; возвращает контекст и CSS-размеры. */
export function fitCanvas(cv, h) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth;
  const hh = h ?? cv.clientHeight;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(hh * dpr);
  cv.style.height = hh + 'px';
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, w, h: hh };
}

export function press(btns, pred) {
  btns.forEach(b => b.setAttribute('aria-pressed', pred(b) ? 'true' : 'false'));
}

export function onVisible(el, cb) {
  if (!('IntersectionObserver' in window)) { cb(true); return; }
  new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), { rootMargin: '100px' }).observe(el);
}

/** Плёночный шум поверх страницы. */
export function startNoise(cv) {
  if (!cv) return;
  const c = cv.getContext('2d'), img = c.createImageData(160, 90);
  const paint = () => {
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    c.putImageData(img, 0, 0);
  };
  paint();
  if (RM) return;
  let last = 0;
  (function loop(t) { if (t - last > 90) { paint(); last = t; } requestAnimationFrame(loop); })(0);
}

/** Строка состояния: текущая глава, точки-навигация и счётчик плёнки. */
export function startOsd() {
  const secs = $$('section[data-ch]'), nav = $('#osdNav'), chEl = $('#osdCh'), ctr = $('#osdCtr');
  if (!secs.length || !chEl) return;
  if (nav) secs.forEach(s => {
    const a = document.createElement('a');
    a.href = '#' + s.id; a.title = s.dataset.ch; a.setAttribute('aria-label', s.dataset.ch);
    nav.appendChild(a);
  });
  const dots = nav ? $$('a', nav) : [];
  let tick = false;
  function upd() {
    tick = false;
    const y = scrollY, max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (ctr) {
      const t = Math.round(y / max * 5400);
      ctr.textContent = `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    }
    let idx = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.35) idx = i; });
    chEl.textContent = secs[idx].dataset.ch;
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
  }
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}

export function bootVhs() {
  startNoise($('#noise'));
  startOsd();
}
