/**
 * Модели курса «Three.js: начальный уровень»: первая сцена, камера, иерархия, свет, текстуры.
 * Без DOM и без Three.js — логика заданий проверяется тестами, а картинку рисует настоящий Three.js.
 */
import { tr } from './i18n.js?v=202610191643';
import { t as tl, bi } from './ui.js?v=202610191643';

/* =====================================================================
   Первая сцена: что нужно, чтобы куб появился.
   ===================================================================== */

export const firstRig = {
  init: card => ({ added: false, camZ: 0, render: false, loop: false, ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return firstRig.init(card);
    if (k === 'add') return { ...s0, added: !s0.added };
    if (k === 'render') return { ...s0, render: !s0.render };
    if (k === 'loop') return { ...s0, loop: !s0.loop };
    if (k === 'camz' && (v === '0' || v === '5')) return { ...s0, camZ: Number(v) };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const v = firstView(s), g = card.goal;
    return v.visible === g.visible && (g.spin == null || v.spin === g.spin);
  }
};

/** Что будет на экране и почему. */
export function firstView(s) {
  const drawn = s.render || s.loop;
  if (!drawn) return { visible: false, spin: false, why: tl('m.three.firstView.1') };
  if (!s.added) return { visible: false, spin: false, why: tl('m.three.firstView.2') };
  if (s.camZ === 0) return { visible: false, spin: false, why: tl('m.three.firstView.3') };
  return { visible: true, spin: s.loop, why: tr(s.loop ? bi('m.three.firstView.4') : bi('m.three.firstView.5')) };
}

export function firstCode(s) {
  return [
    "import * as THREE from 'three';",
    '',
    'const scene = new THREE.Scene();',
    'const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);',
    `camera.position.z = ${s.camZ};`,
    'const renderer = new THREE.WebGLRenderer({ antialias: true });',
    '',
    'const cube = new THREE.Mesh(',
    '  new THREE.BoxGeometry(1, 1, 1),',
    '  new THREE.MeshNormalMaterial());',
    s.added ? 'scene.add(cube);' : '// scene.add(cube);',
    '',
    s.loop ? 'renderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});'
      : s.render ? 'renderer.render(scene, camera);' : '// renderer.render(scene, camera);'
  ].join('\n');
}

/* =====================================================================
   Камера: fov, положение, near и far. Камера смотрит вдоль −Z.
   ===================================================================== */

export const ASPECT = 1.6;
export const CAM_OBJECTS = [
  { id: 'a', name: bi('m.three.CAM_OBJECTS.1'), x: 0, z: 0, color: '#ff5d73' },
  { id: 'b', name: bi('m.three.CAM_OBJECTS.2'), x: 4, z: -4, color: '#5dfc9a' },
  { id: 'c', name: bi('m.three.CAM_OBJECTS.3'), x: -5, z: -14, color: '#4f9dff' }
];
export const CAM_OPTIONS = { fov: [35, 50, 75, 100], z: [3, 6, 10], near: [0.1, 2, 5], far: [5, 10, 50] };

/** Виден ли центр каждого объекта и если нет — почему. */
export function camSees(s) {
  return CAM_OBJECTS.map(o => {
    const d = s.z - o.z;
    const half = d * Math.tan((s.fov / 2) * Math.PI / 180) * ASPECT;
    if (d < s.near) return { id: o.id, ok: false, d, why: tl('m.three.camSees.1', { d, near: s.near }) };
    if (d > s.far) return { id: o.id, ok: false, d, why: tl('m.three.camSees.2', { d, far: s.far }) };
    if (Math.abs(o.x) > half) return { id: o.id, ok: false, d, why: tl('m.three.camSees.3') };
    return { id: o.id, ok: true, d, why: tl('m.three.camSees.4', { d }) };
  });
}

export const camRig = {
  init: card => ({ fov: 50, z: 6, near: 0.1, far: 50, ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return camRig.init(card);
    if (k in CAM_OPTIONS && CAM_OPTIONS[k].includes(Number(v))) return { ...s0, [k]: Number(v) };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const seen = camSees(s), g = card.goal;
    return (g.see ?? []).every(id => seen.find(x => x.id === id).ok) && (g.hide ?? []).every(id => !seen.find(x => x.id === id).ok);
  }
};

/* =====================================================================
   Иерархия: Солнце, поворотная группа Земли и Луна.
   ===================================================================== */

export const EARTH_R = 4, MOON_R = 1.2;

/** Мировые координаты (вид сверху: x и z) Земли и Луны. */
export function orbitWorld(s) {
  const a = s.angle * Math.PI / 180;
  const earth = { x: EARTH_R * Math.cos(a), z: -EARTH_R * Math.sin(a) };
  const moon = s.parent === 'earth'
    ? { x: (EARTH_R + MOON_R * s.scale) * Math.cos(a), z: -(EARTH_R + MOON_R * s.scale) * Math.sin(a) }
    : { x: EARTH_R + MOON_R, z: 0 };
  return { earth, moon, dist: Math.hypot(moon.x - earth.x, moon.z - earth.z) };
}

export const graphRig = {
  init: card => ({ parent: 'scene', angle: 0, scale: 1, hist: [], ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return graphRig.init(card);
    if (k === 'parent' && (v === 'scene' || v === 'earth')) return { ...s0, parent: v, hist: [] };
    if (k === 'scale') return { ...s0, scale: s0.scale === 1 ? 2 : 1, hist: [] };
    if (k === 'orbit') {
      const s = { ...s0, angle: (s0.angle + 45) % 360 };
      return { ...s, hist: [...s0.hist, Math.round(orbitWorld(s).dist * 100) / 100] };
    }
    throw new Error(`неизвестное действие ${a}`);
  },
  /** Цель: после последней перестройки — не меньше orbits шагов орбиты, и Луна всё время на расстоянии dist. */
  goal(card, s) {
    const g = card.goal;
    return s.hist.length >= g.orbits && s.hist.every(d => Math.abs(d - g.dist) < 0.01);
  }
};

/* =====================================================================
   Свет и материалы.
   ===================================================================== */

export const MATERIALS = { basic: 'MeshBasicMaterial', lambert: 'MeshLambertMaterial', standard: 'MeshStandardMaterial' };
export const LIGHTS = { amb: 'AmbientLight', dir: 'DirectionalLight', pt: 'PointLight' };
export const SHADOW_FLAGS = {
  sm: 'renderer.shadowMap.enabled = true',
  lc: 'light.castShadow = true',
  cc: 'knot.castShadow = true',
  fr: 'floor.receiveShadow = true'
};

export function lightView(s) {
  const any = s.amb || s.dir || s.pt;
  const look = s.mat === 'basic' ? 'flat' : !any ? 'black' : (s.dir || s.pt) ? 'shaded' : 'dull';
  const missing = Object.keys(SHADOW_FLAGS).filter(k => !s[k]);
  const shadow = s.dir && !missing.length;
  const why = tr({
    flat: bi('m.three.lightView.1'),
    black: bi('m.three.lightView.2'),
    dull: bi('m.three.lightView.3'),
    shaded: bi('m.three.lightView.4')
  }[look]);
  return { look, shadow, missing, why };
}

export const lightRig = {
  init: card => ({ mat: 'standard', amb: false, dir: false, pt: false, sm: false, lc: false, cc: false, fr: false, ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return lightRig.init(card);
    if (k === 'mat' && v in MATERIALS) return { ...s0, mat: v };
    if (k in LIGHTS || k in SHADOW_FLAGS) return { ...s0, [k]: !s0[k] };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const v = lightView(s), g = card.goal;
    return (g.look == null || v.look === g.look) && (g.shadow == null || v.shadow === g.shadow);
  }
};

/* =====================================================================
   Текстуры: повтор, режим краёв и цветовое пространство.
   ===================================================================== */

export function texView(s) {
  const tiles = s.repeat === 1 ? 'one' : s.wrap === 'repeat' ? 'tiled' : 'smeared';
  return {
    tiles,
    colors: s.cs === 'srgb',
    why: tr({
      one: bi('m.three.texView.1'),
      tiled: bi('m.three.texView.2'),
      smeared: bi('m.three.texView.3')
    }[tiles]) + tr(s.cs === 'srgb' ? bi('m.three.texView.4') : bi('m.three.texView.5'))
  };
}

export const texRig = {
  init: card => ({ repeat: 1, wrap: 'clamp', cs: 'none', ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return texRig.init(card);
    if (k === 'rep' && (v === '1' || v === '4')) return { ...s0, repeat: Number(v) };
    if (k === 'wrap' && (v === 'clamp' || v === 'repeat')) return { ...s0, wrap: v };
    if (k === 'cs' && (v === 'none' || v === 'srgb')) return { ...s0, cs: v };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const v = texView(s), g = card.goal;
    return (g.tiles == null || v.tiles === g.tiles) && (g.colors == null || v.colors === g.colors);
  }
};
