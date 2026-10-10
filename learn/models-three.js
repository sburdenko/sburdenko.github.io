/**
 * Модели курса «Three.js: начальный уровень»: первая сцена, камера, иерархия, свет, текстуры.
 * Без DOM и без Three.js — логика заданий проверяется тестами, а картинку рисует настоящий Three.js.
 */
import { tr } from './i18n.js?v=202610100807';

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
  if (!drawn) return { visible: false, spin: false, why: tr({ ru: 'Никто не вызвал renderer.render — холст пустой.', en: 'Nobody called renderer.render — the canvas is empty.' }) };
  if (!s.added) return { visible: false, spin: false, why: tr({ ru: 'Куб создан, но не добавлен в сцену. Рендерер рисует только то, что лежит в scene.', en: 'The cube exists but is not added to the scene. The renderer draws only what is in scene.' }) };
  if (s.camZ === 0) return { visible: false, spin: false, why: tr({ ru: 'Камера стоит в центре куба. Изнутри грани повёрнуты от нас, и Three.js их не рисует.', en: 'The camera sits at the center of the cube. From inside, the faces point away from us, and Three.js does not draw them.' }) };
  return { visible: true, spin: s.loop, why: tr(s.loop ? { ru: 'Куб на месте и крутится: setAnimationLoop рисует кадр за кадром.', en: 'The cube is there and spinning: setAnimationLoop draws frame after frame.' } : { ru: 'Куб на месте. Кадр нарисован один раз — дальше картинка не меняется.', en: 'The cube is there. The frame was drawn once — the picture won\'t change after that.' }) };
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
  { id: 'a', name: { ru: 'Красный', en: 'Red' }, x: 0, z: 0, color: '#ff5d73' },
  { id: 'b', name: { ru: 'Зелёный', en: 'Green' }, x: 4, z: -4, color: '#5dfc9a' },
  { id: 'c', name: { ru: 'Синий', en: 'Blue' }, x: -5, z: -14, color: '#4f9dff' }
];
export const CAM_OPTIONS = { fov: [35, 50, 75, 100], z: [3, 6, 10], near: [0.1, 2, 5], far: [5, 10, 50] };

/** Виден ли центр каждого объекта и если нет — почему. */
export function camSees(s) {
  return CAM_OBJECTS.map(o => {
    const d = s.z - o.z;
    const half = d * Math.tan((s.fov / 2) * Math.PI / 180) * ASPECT;
    if (d < s.near) return { id: o.id, ok: false, d, why: tr({ ru: `ближе near (${d} < ${s.near})`, en: `closer than near (${d} < ${s.near})` }) };
    if (d > s.far) return { id: o.id, ok: false, d, why: tr({ ru: `дальше far (${d} > ${s.far})`, en: `beyond far (${d} > ${s.far})` }) };
    if (Math.abs(o.x) > half) return { id: o.id, ok: false, d, why: tr({ ru: 'вне угла обзора', en: 'outside the field of view' }) };
    return { id: o.id, ok: true, d, why: tr({ ru: `в кадре, до камеры ${d}`, en: `in frame, ${d} from the camera` }) };
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
    flat: { ru: 'MeshBasicMaterial не реагирует на свет: одна заливка, объёма не видно.', en: 'MeshBasicMaterial ignores light: one flat fill, no sense of volume.' },
    black: { ru: 'Материал реагирует на свет, а источников нет — всё чёрное.', en: 'The material reacts to light, but there are no lights — everything is black.' },
    dull: { ru: 'Только AmbientLight: светит одинаково со всех сторон, поэтому форма плоская.', en: 'Only AmbientLight: it shines equally from all sides, so the shape looks flat.' },
    shaded: { ru: 'Есть направленный свет — у формы появились светлые и тёмные стороны.', en: 'There is directional light — the shape now has lit and dark sides.' }
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
      one: { ru: 'Картинка натянута на плоскость один раз.', en: 'The image is stretched over the plane once.' },
      tiled: { ru: 'repeat 4×4 и RepeatWrapping: картинка повторяется плиткой.', en: 'repeat 4×4 and RepeatWrapping: the image repeats as tiles.' },
      smeared: { ru: 'repeat 4×4, но края в режиме ClampToEdge: одна копия в углу, остальное — растянутые крайние пиксели.', en: 'repeat 4×4, but the edges use ClampToEdge: one copy in the corner, the rest is stretched edge pixels.' }
    }[tiles]) + tr(s.cs === 'srgb' ? { ru: ' Цвета верные.', en: ' Colors are correct.' } : { ru: ' Цвета бледные: текстура не помечена как sRGB.', en: ' Colors look washed out: the texture is not marked as sRGB.' })
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
