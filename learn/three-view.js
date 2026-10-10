/**
 * Живая 3D-картинка для стендов курса Three.js: настоящий Three.js с CDN.
 * Логика заданий — в models-three.js; если Three.js не загрузился, стенд работает без картинки.
 */
import { RM } from '../assets/vhs.js?v=202610100741';
import { tr } from './i18n.js?v=202610100741';

export const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
export const VIEW_ASPECT = 1.6;
let loading = null;
export const loadThree = () => (loading ??= import(THREE_URL));

/**
 * Добавляет в host окно с WebGL-холстом. setup(THREE, renderer) возвращает { update(state), frame(time) }.
 * Когда холст пропадает со страницы (следующая карточка), рендерер освобождает WebGL-контекст.
 */
export function makeView(host, setup) {
  const el = document.createElement('div');
  el.className = 'tj-view';
  el.innerHTML = `<div class="tj-msg">${tr({ ru: 'Загружаю Three.js…', en: 'Loading Three.js…' })}</div>`;
  host.append(el);
  let api = null, last = null;
  loadThree().then(THREE => {
    const canvas = document.createElement('canvas');
    el.replaceChildren(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    let w = 0;
    api = setup(THREE, renderer, { RM });
    if (last) api.update(last);
    renderer.setAnimationLoop(t => {
      if (!canvas.isConnected) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
        return;
      }
      const cw = el.clientWidth || 320;
      if (cw !== w) { w = cw; renderer.setSize(cw, Math.round(cw / VIEW_ASPECT), false); }
      api.frame(t);
    });
  }).catch(() => {
    el.innerHTML = `<div class="tj-msg">${tr({ ru: 'Three.js не загрузился (нужен интернет). Задание можно пройти и без картинки.', en: 'Three.js failed to load (an internet connection is needed). You can still complete the task without the picture.' })}</div>`;
  });
  return { update(s) { last = s; api?.update(s); } };
}
