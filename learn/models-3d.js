/**
 * Модели стендов курса «3D-форматы». Без DOM — покрыты тестами.
 * У каждого стенда вход init(card), act(card, s, 'действие'), goal(card, s) — как в models-mem.js.
 */
import { tr } from './i18n.js?v=202610101413';

const clone = x => structuredClone(x);

/* =====================================================================
   Сборка меша из треугольников: домик из пяти вершин.
   Человек тапает по три вершины — получается треугольник. Порядок обхода задаёт лицевую сторону.
   ===================================================================== */

export const HOUSE = [
  { n: 'A', x: 0, y: 0 }, { n: 'B', x: 4, y: 0 }, { n: 'C', x: 4, y: 3 }, { n: 'D', x: 2, y: 5 }, { n: 'E', x: 0, y: 3 }
];
export const HOUSE_AREA = 16;

/** Ориентированная площадь: > 0 — обход против часовой стрелки (лицевая сторона к нам). */
export const signedArea = (P, [a, b, c]) => ((P[b].x - P[a].x) * (P[c].y - P[a].y) - (P[c].x - P[a].x) * (P[b].y - P[a].y)) / 2;

function project(P, tri, nx, ny) {
  const d = tri.map(i => P[i].x * nx + P[i].y * ny);
  return [Math.min(...d), Math.max(...d)];
}

/** Пересекаются ли треугольники внутренностями (касание по ребру — не пересечение). Теорема о разделяющей оси. */
export function overlap(P, t1, t2) {
  for (const t of [t1, t2]) {
    for (let k = 0; k < 3; k++) {
      const a = P[t[k]], b = P[t[(k + 1) % 3]];
      const nx = -(b.y - a.y), ny = b.x - a.x;
      const [min1, max1] = project(P, t1, nx, ny), [min2, max2] = project(P, t2, nx, ny);
      if (max1 <= min2 + 1e-9 || max2 <= min1 + 1e-9) return false;
    }
  }
  return true;
}

const sameTri = (a, b) => [...a].sort().join() === [...b].sort().join();

export function meshObj(P, tris) {
  return [...P.map(p => `v ${p.x} ${p.y} 0`), ...tris.map(t => `f ${t.map(i => i + 1).join(' ')}`)].join('\n');
}

export function meshStl(P, tris) {
  const out = ['solid house'];
  for (const t of tris) {
    out.push(`  facet normal 0 0 ${signedArea(P, t) > 0 ? 1 : -1}`, '    outer loop');
    t.forEach(i => out.push(`      vertex ${P[i].x} ${P[i].y} 0`));
    out.push('    endloop', '  endfacet');
  }
  out.push('endsolid house');
  return out.join('\n');
}

/** Размер бинарного STL: заголовок 80 байт + счётчик 4 байта + по 50 байт на треугольник. */
export const stlBinarySize = tris => 84 + 50 * tris;

export const meshRig = {
  init: () => ({ sel: [], tris: [], msg: tr({ ru: 'Нажимай на вершины по три — получится треугольник.', en: 'Tap vertices three at a time to make a triangle.' }) }),
  act(card, s0, a) {
    const s = clone(s0), P = HOUSE;
    if (a === 'reset') return meshRig.init();
    if (a === 'undo') { s.tris.pop(); s.sel = []; s.msg = tr({ ru: 'Последний треугольник убран.', en: 'Last triangle removed.' }); return s; }
    if (a === 'flip') {
      const t = s.tris.at(-1);
      if (t) { [t[1], t[2]] = [t[2], t[1]]; s.msg = tr({ ru: 'Порядок обхода последнего треугольника развёрнут — нормаль смотрит в другую сторону.', en: 'Winding order of the last triangle reversed — its normal now points the other way.' }); }
      return s;
    }
    if (a.startsWith('v:')) {
      const i = +a.slice(2);
      if (s.sel.includes(i)) { s.sel = s.sel.filter(x => x !== i); return s; }
      s.sel.push(i);
      if (s.sel.length < 3) { { const picked = s.sel.map(j => P[j].n).join(', '); s.msg = tr({ ru: `Выбрано: ${picked}.`, en: `Selected: ${picked}.` }); } return s; }
      const t = s.sel; s.sel = [];
      const name = t.map(j => P[j].n).join('');
      if (Math.abs(signedArea(P, t)) < 1e-9) s.msg = tr({ ru: `${name} — все три точки на одной прямой, треугольника нет.`, en: `${name}: all three points lie on one line, so there is no triangle.` });
      else if (s.tris.some(x => sameTri(x, t))) s.msg = tr({ ru: `${name} уже есть.`, en: `${name} is already there.` });
      else if (s.tris.some(x => overlap(P, x, t))) s.msg = tr({ ru: `${name} налезает на другой треугольник. В меше они не должны пересекаться.`, en: `${name} overlaps another triangle. Triangles in a mesh must not overlap.` });
      else {
        s.tris.push(t);
        s.msg = signedArea(P, t) > 0
          ? tr({ ru: `${name}: обход против часовой — лицевой стороной к тебе.`, en: `${name}: counter-clockwise winding — front face toward you.` })
          : tr({ ru: `${name}: обход по часовой — к тебе изнанкой, с отсечением задних граней его не будет видно.`, en: `${name}: clockwise winding — back face toward you; with back-face culling it will be invisible.` });
      }
      return s;
    }
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const area = s.tris.reduce((acc, t) => acc + Math.abs(signedArea(HOUSE, t)), 0);
    const covered = Math.abs(area - HOUSE_AREA) < 1e-9;
    return covered && (!card.goal?.ccw || s.tris.every(t => signedArea(HOUSE, t) > 0));
  }
};

/* =====================================================================
   Тесселяция цилиндра R = 50 мм, H = 100 мм.
   ===================================================================== */

export const CYL = { r: 50, h: 100 };

/** Стрелка прогиба: насколько середина хорды отстоит от настоящей окружности. */
export const sagitta = (n, r = CYL.r) => r * (1 - Math.cos(Math.PI / n));

export function tessInfo(n, flat = false) {
  const tris = 2 * n + 2 * (n - 2);              // бок: n четырёхугольников по 2 треугольника; крышки — веером
  const positions = 2 * n;                        // уникальных точек в пространстве
  // вершины для видеокарты: позиция + нормаль. Крышки всегда отдельно (там другая нормаль).
  const gpu = (flat ? 4 * n : 2 * n) + 2 * n;
  return {
    n, tris, positions, gpu,
    err: sagitta(n),
    stl: stlBinarySize(tris),
    glb: 1200 + gpu * 24 + tris * 3 * (gpu > 65535 ? 4 : 2),   // JSON ~1.2 КБ + позиции и нормали по 12 байт + индексы
    step: 2600                                    // STEP: цилиндр описан формулой, размер не зависит от качества
  };
}

/** Треугольники цилиндра в 3D для отрисовки: [[x,y,z]×3, нормаль]. */
export function cylinderTris(n, { r = 1, h = 2 } = {}) {
  const ring = y => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
  const lo = ring(-h / 2), hi = ring(h / 2), out = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = ((i + 0.5) / n) * Math.PI * 2, nrm = [Math.cos(a), 0, Math.sin(a)];
    out.push([[lo[i], hi[i], hi[j]], nrm], [[lo[i], hi[j], lo[j]], nrm]);
  }
  for (let i = 1; i < n - 1; i++) {
    out.push([[hi[0], hi[i + 1], hi[i]], [0, 1, 0]], [[lo[0], lo[i], lo[i + 1]], [0, -1, 0]]);
  }
  return out;
}

export const tessRig = {
  init: card => ({ n: card.start ?? 8, flat: false, seenFlat: false }),
  act(card, s0, a) {
    const s = { ...s0 };
    if (a === 'reset') return tessRig.init(card);
    if (a === 'flat') { s.flat = !s.flat; if (s.flat) s.seenFlat = true; return s; }
    if (a.startsWith('n:')) { s.n = Math.max(3, Math.min(256, Math.round(+a.slice(2)))); return s; }
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const g = card.goal, info = tessInfo(s.n, s.flat);
    if (g.kind === 'err') return info.err <= g.max && info.tris <= g.maxTris;
    if (g.kind === 'flat') return s.seenFlat;
    if (g.kind === 'n') return s.n >= g.min;
    return false;
  }
};

/* =====================================================================
   Единицы и оси: кружка высотой 10 см, смоделирована в Z-up программе.
   Экспорт без пересчёта в просмотрщик glTF, который ждёт метры и ось Y вверх.
   ===================================================================== */

export const UNITS = { mm: 1000, cm: 100, m: 1, in: 39.3701 };
export const MUG_M = 0.1;

export function unitsView(s) {
  const written = MUG_M * UNITS[s.unit];          // число, которое попало в файл
  return { written, seen: written, upright: s.up === 'Y', ok: s.unit === 'm' && s.up === 'Y' };
}

export const unitsRig = {
  init: () => ({ unit: 'mm', up: 'Z' }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return unitsRig.init();
    if (k === 'unit' && v in UNITS) return { ...s0, unit: v };
    if (k === 'up' && (v === 'Y' || v === 'Z')) return { ...s0, up: v };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal: (card, s) => unitsView(s).ok
};

/* =====================================================================
   USD: слои и варианты. Атрибут берётся из самого сильного слоя, где он задан.
   ===================================================================== */

export const USD_LAYERS = [
  { id: 'shot', file: 'shot.usda', role: { ru: 'правки для конкретного кадра', en: 'tweaks for one specific shot' }, opinions: { color: 'red' } },
  { id: 'set', file: 'set.usda', role: { ru: 'расстановка мебели в сцене', en: 'furniture layout in the scene' }, opinions: { color: 'walnut', scale: 1.2 } },
  { id: 'base', file: 'chair.usda', role: { ru: 'сам ассет стула', en: 'the chair asset itself' }, opinions: { color: 'oak', scale: 1 }, locked: true }
];
export const USD_VARIANTS = { classic: { legs: 4, height: { ru: 'обычный', en: 'regular' } }, bar: { legs: 3, height: { ru: 'барный', en: 'bar' } } };

/** Итоговое значение каждого атрибута и откуда оно взялось. Варианты слабее локальных мнений слоёв. */
export function usdResolve(s) {
  const order = s.order.map(id => USD_LAYERS.find(l => l.id === id)).filter(l => s.on[l.id]);
  const out = {};
  for (const attr of ['color', 'scale', 'legs', 'height']) {
    const layer = order.find(l => attr in l.opinions);
    if (layer) out[attr] = { value: layer.opinions[attr], from: layer.file };
    else out[attr] = { value: tr(USD_VARIANTS[s.variant][attr]), from: tr({ ru: `вариант «${s.variant}» в chair.usda`, en: `variant “${s.variant}” in chair.usda` }) };
  }
  return out;
}

export const usdRig = {
  init: () => ({ order: ['shot', 'set', 'base'], on: { shot: false, set: true, base: true }, variant: 'classic' }),
  act(card, s0, a) {
    const s = clone(s0), [k, v] = a.split(':');
    if (k === 'reset') return usdRig.init();
    if (k === 'layer' && !USD_LAYERS.find(l => l.id === v).locked) { s.on[v] = !s.on[v]; return s; }
    if (k === 'swap') { s.order = [s.order[1], s.order[0], s.order[2]]; return s; }
    if (k === 'var' && v in USD_VARIANTS) { s.variant = v; return s; }
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const r = usdResolve(s);
    return Object.entries(card.goal).every(([k, v]) => r[k].value === v);
  }
};

/* =====================================================================
   Конвертер: что переживёт сохранение в формат.
   yes — сохранится, part — частично или нестандартно, no — потеряется.
   ===================================================================== */

export const FEATURES = {
  geometry: { ru: 'Геометрия (вершины и грани)', en: 'Geometry (vertices and faces)' },
  normals: { ru: 'Нормали', en: 'Normals' },
  uv: { ru: 'UV-развёртка', en: 'UV mapping' },
  vcolor: { ru: 'Цвет вершин', en: 'Vertex colors' },
  pbr: { ru: 'PBR-материалы', en: 'PBR materials' },
  hierarchy: { ru: 'Иерархия объектов', en: 'Object hierarchy' },
  skin: { ru: 'Скелетная анимация', en: 'Skeletal animation' },
  morph: { ru: 'Морф-таргеты (blend shapes)', en: 'Morph targets (blend shapes)' },
  cameras: { ru: 'Камеры', en: 'Cameras' },
  units: { ru: 'Явные единицы измерения', en: 'Explicit units' }
};

export const FORMATS = {
  obj: { name: 'OBJ', caps: { geometry: 'yes', normals: 'yes', uv: 'yes', vcolor: 'part', pbr: 'part', hierarchy: 'no', skin: 'no', morph: 'no', cameras: 'no', units: 'no' },
    notes: { vcolor: { ru: 'только неофициальным расширением строки v', en: 'only via an unofficial extension of the v line' }, pbr: { ru: 'файл .mtl — старые материалы в духе Phong; PBR лишь неофициально', en: 'the .mtl file holds old Phong-style materials; PBR only unofficially' }, hierarchy: { ru: 'есть группы o и g, но без трансформаций и вложенности', en: 'has o and g groups, but no transforms or nesting' } } },
  stl: { name: 'STL', caps: { geometry: 'yes', normals: 'part', uv: 'no', vcolor: 'no', pbr: 'no', hierarchy: 'no', skin: 'no', morph: 'no', cameras: 'no', units: 'no' },
    notes: { geometry: { ru: 'только треугольники, вершины не общие', en: 'triangles only, vertices are not shared' }, normals: { ru: 'одна нормаль на треугольник', en: 'one normal per triangle' }, vcolor: { ru: 'в бинарном STL бывают нестандартные хаки с цветом', en: 'binary STL sometimes has non-standard color hacks' } } },
  ply: { name: 'PLY', caps: { geometry: 'yes', normals: 'yes', uv: 'part', vcolor: 'yes', pbr: 'no', hierarchy: 'no', skin: 'no', morph: 'no', cameras: 'no', units: 'no' },
    notes: { uv: { ru: 'свойства s, t или u, v — имена не стандартизованы', en: 'properties s, t or u, v — the names are not standardized' }, geometry: { ru: 'можно хранить и точки без граней', en: 'can also store points without faces' } } },
  gltf: { name: 'glTF / GLB', caps: { geometry: 'yes', normals: 'yes', uv: 'yes', vcolor: 'yes', pbr: 'yes', hierarchy: 'yes', skin: 'yes', morph: 'yes', cameras: 'yes', units: 'yes' },
    notes: { units: { ru: 'по спецификации всегда метры и ось Y вверх', en: 'by spec always meters with Y up' }, pbr: { ru: 'metallic-roughness в ядре формата', en: 'metallic-roughness is in the core spec' } } },
  fbx: { name: 'FBX', caps: { geometry: 'yes', normals: 'yes', uv: 'yes', vcolor: 'yes', pbr: 'part', hierarchy: 'yes', skin: 'yes', morph: 'yes', cameras: 'yes', units: 'yes' },
    notes: { pbr: { ru: 'классические Lambert/Phong; PBR каждая программа пишет по-своему', en: 'classic Lambert/Phong; every tool writes PBR its own way' }, units: { ru: 'UnitScaleFactor в настройках файла', en: 'UnitScaleFactor in the file settings' } } },
  usd: { name: 'USD / USDZ', caps: { geometry: 'yes', normals: 'yes', uv: 'yes', vcolor: 'yes', pbr: 'yes', hierarchy: 'yes', skin: 'yes', morph: 'yes', cameras: 'yes', units: 'yes' },
    notes: { pbr: { ru: 'UsdPreviewSurface или MaterialX', en: 'UsdPreviewSurface or MaterialX' }, units: { ru: 'metersPerUnit в метаданных сцены', en: 'metersPerUnit in the scene metadata' } } },
  dae: { name: 'DAE (Collada)', caps: { geometry: 'yes', normals: 'yes', uv: 'yes', vcolor: 'yes', pbr: 'part', hierarchy: 'yes', skin: 'yes', morph: 'yes', cameras: 'yes', units: 'yes' },
    notes: { pbr: { ru: 'Phong, Blinn, Lambert — PBR в формате нет', en: 'Phong, Blinn, Lambert — the format has no PBR' } } }
};

export const convertRig = {
  init: () => ({ fmt: null, tried: [] }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return convertRig.init();
    if (k === 'fmt' && v in FORMATS) return { fmt: v, tried: s0.tried.includes(v) ? s0.tried : [...s0.tried, v] };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const g = card.goal;
    if (g.kind === 'keep') return Boolean(s.fmt) && card.asset.every(f => FORMATS[s.fmt].caps[f] === 'yes') && (!g.not || !g.not.includes(s.fmt));
    if (g.kind === 'fmt') return s.fmt === g.fmt;
    if (g.kind === 'tried') return s.tried.length >= g.n;
    return false;
  }
};

/* =====================================================================
   NURBS: рациональная квадратичная кривая. Вес средней точки w подбирают так,
   чтобы дуга стала точной четвертью окружности: w = cos(45°) ≈ 0,7071.
   ===================================================================== */

export function nurbsPoint(w, t) {
  const b0 = (1 - t) ** 2, b1 = 2 * t * (1 - t) * w, b2 = t ** 2, d = b0 + b1 + b2;
  return { x: (b0 * 1 + b1 * 1 + b2 * 0) / d, y: (b0 * 0 + b1 * 1 + b2 * 1) / d };
}

export function nurbsError(w, steps = 200) {
  let max = 0;
  for (let i = 0; i <= steps; i++) {
    const p = nurbsPoint(w, i / steps);
    max = Math.max(max, Math.abs(Math.hypot(p.x, p.y) - 1));
  }
  return max;
}

export const nurbsRig = {
  init: () => ({ w: 1 }),
  act(card, s0, a) {
    if (a === 'reset') return nurbsRig.init();
    const set = w => ({ w: Math.max(0.1, Math.min(3, Math.round(w * 1000) / 1000)) });
    if (a.startsWith('w:')) return set(+a.slice(2));
    if (a.startsWith('w+:')) return set(s0.w + +a.slice(3));
    if (a.startsWith('w-:')) return set(s0.w - +a.slice(3));
    throw new Error(`неизвестное действие ${a}`);
  },
  goal: (card, s) => nurbsError(s.w) <= card.goal.max
};

/* =====================================================================
   BIM: маленькое IFC-здание. Объекты с типом, этажом и свойствами.
   ===================================================================== */

export const BIM = [
  { id: '2O2Fr$t4X7Zf8NOew3FLOH', type: 'IfcWall', name: { ru: 'Наружная стена 300', en: 'Exterior wall 300' }, storey: 1, props: { IsExternal: true, FireRating: 'REI 90', LoadBearing: true } },
  { id: '0K7w7JpZz5QxMe1oNsEhM1', type: 'IfcWall', name: { ru: 'Наружная стена 300', en: 'Exterior wall 300' }, storey: 1, props: { IsExternal: true, FireRating: 'REI 90', LoadBearing: true } },
  { id: '3hJzF1xb54Pg7Ce$8WqYk2', type: 'IfcWall', name: { ru: 'Перегородка 100', en: 'Partition wall 100' }, storey: 1, props: { IsExternal: false, FireRating: 'EI 30', LoadBearing: false } },
  { id: '1Vt0dM9qL8_9xG2sKpQwA3', type: 'IfcDoor', name: { ru: 'Дверь входная 1000×2100', en: 'Entrance door 1000×2100' }, storey: 1, props: { IsExternal: true, FireRating: 'EI 60' } },
  { id: '2bQ7nW$3P1kHf5Zr0yTsB4', type: 'IfcDoor', name: { ru: 'Дверь межкомнатная 800×2000', en: 'Interior door 800×2000' }, storey: 1, props: { IsExternal: false } },
  { id: '0cR8mX4rT6lJg2Yq9vUoC5', type: 'IfcWindow', name: { ru: 'Окно 1500×1500', en: 'Window 1500×1500' }, storey: 1, props: { IsExternal: true } },
  { id: '3dS9nY5sU7mKh3Zp8wVnD6', type: 'IfcSlab', name: { ru: 'Плита перекрытия 220', en: 'Floor slab 220' }, storey: 1, props: { LoadBearing: true, FireRating: 'REI 60' } },
  { id: '1eT0oZ6tV8nLi4_o7xWmE7', type: 'IfcWall', name: { ru: 'Наружная стена 300', en: 'Exterior wall 300' }, storey: 2, props: { IsExternal: true, FireRating: 'REI 90', LoadBearing: true } },
  { id: '2fU1pA7uW9oMj5$n6yXlF8', type: 'IfcWall', name: { ru: 'Перегородка 100', en: 'Partition wall 100' }, storey: 2, props: { IsExternal: false, FireRating: 'EI 30', LoadBearing: false } },
  { id: '0gV2qB8vX0pNk6Am5zYkG9', type: 'IfcDoor', name: { ru: 'Дверь межкомнатная 800×2000', en: 'Interior door 800×2000' }, storey: 2, props: { IsExternal: false } },
  { id: '3hW3rC9wY1qOl7Bl4AZjHa', type: 'IfcDoor', name: { ru: 'Дверь межкомнатная 800×2000', en: 'Interior door 800×2000' }, storey: 2, props: { IsExternal: false } },
  { id: '1iX4sD0xZ2rPm8Ck3BaiIb', type: 'IfcDoor', name: { ru: 'Дверь на балкон 900×2200', en: 'Balcony door 900×2200' }, storey: 2, props: { IsExternal: true, FireRating: 'EI 30' } },
  { id: '2jY5tE1y03sQn9Dj2CbhJc', type: 'IfcWindow', name: { ru: 'Окно 1500×1500', en: 'Window 1500×1500' }, storey: 2, props: { IsExternal: true } },
  { id: '0kZ6uF2z14tRo0Ei1DcgKd', type: 'IfcWindow', name: { ru: 'Окно 900×1500', en: 'Window 900×1500' }, storey: 2, props: { IsExternal: true } }
];
export const BIM_TRIS = { IfcWall: 12, IfcDoor: 148, IfcWindow: 96, IfcSlab: 12 };

export function bimFilter(s) {
  return BIM.filter(e => (!s.type || e.type === s.type) && (!s.storey || e.storey === s.storey) && (!s.fire || 'FireRating' in e.props));
}

export const bimRig = {
  init: () => ({ type: null, storey: null, fire: false, mesh: false, sel: null, seenMesh: false }),
  act(card, s0, a) {
    const s = { ...s0 }, [k, v] = a.split(':');
    if (k === 'reset') return bimRig.init();
    if (k === 'mesh') { s.mesh = !s.mesh; if (s.mesh) s.seenMesh = true; s.sel = null; return s; }
    if (s.mesh) return s;
    if (k === 'type') { s.type = s.type === v ? null : v; return s; }
    if (k === 'storey') { s.storey = s.storey === +v ? null : +v; return s; }
    if (k === 'fire') { s.fire = !s.fire; return s; }
    if (k === 'sel') { s.sel = v; return s; }
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const g = card.goal;
    if (g.kind === 'filter') return !s.mesh && (g.type ?? null) === s.type && (g.storey ?? null) === s.storey && Boolean(g.fire) === s.fire;
    if (g.kind === 'mesh') return s.seenMesh;
    if (g.kind === 'sel') return s.sel != null && BIM.find(e => e.id === s.sel)?.type === g.type;
    return false;
  }
};

/* =====================================================================
   Координация: коллизии между моделями разделов и BCF-замечание.
   Боксы в плоскости разреза: x — вдоль здания, y — высота (мм).
   ===================================================================== */

// Разделы и виды элементов — общие объекты: findClashes сравнивает model по ссылке
const KR = { ru: 'КР (конструкции)', en: 'Structural' }, OV = { ru: 'ОВ (вентиляция)', en: 'HVAC (ventilation)' }, VK = { ru: 'ВК (водопровод)', en: 'Plumbing (water supply)' };
const BEAM = { ru: 'Балка', en: 'Beam' }, DUCT = { ru: 'Воздуховод', en: 'Duct' }, PIPE = { ru: 'Труба', en: 'Pipe' };

export const CLASH_ITEMS = [
  { id: 'B-12', model: KR, disc: 'kr', kind: BEAM, guid: '3Kd9$wQ1n5Rf0Ue7Ty2Gh1', box: [0, 2700, 6000, 3000] },
  { id: 'B-13', model: KR, disc: 'kr', kind: BEAM, guid: '1Lm2_xR3o6Sg1Vf8Uz3Hi2', box: [6000, 2700, 12000, 3000] },
  { id: 'D-7', model: OV, disc: 'ov', kind: DUCT, guid: '0Np4AyS5p7Th2Wg9Va4Ij3', box: [1500, 2800, 9000, 3100] },
  { id: 'P-3', model: VK, disc: 'vk', kind: PIPE, guid: '2Oq5BzT6q8Ui3Xh0Wb5Jk4', box: [7200, 2400, 11500, 2520] },
  { id: 'P-4', model: VK, disc: 'vk', kind: PIPE, guid: '3Pr6C0U7r9Vj4Yi1Xc6Kl5', box: [2000, 2550, 5000, 2690] }
];

/** Пересечения элементов разных моделей с допуском tol мм (зазор меньше допуска тоже считается). */
export function findClashes(tol) {
  const out = [];
  for (let i = 0; i < CLASH_ITEMS.length; i++) for (let j = i + 1; j < CLASH_ITEMS.length; j++) {
    const a = CLASH_ITEMS[i], b = CLASH_ITEMS[j];
    if (a.model === b.model) continue;
    const gx = Math.max(a.box[0], b.box[0]) - Math.min(a.box[2], b.box[2]);
    const gy = Math.max(a.box[1], b.box[1]) - Math.min(a.box[3], b.box[3]);
    const gap = Math.max(gx, gy);
    if (gap < tol) out.push({ a: a.id, b: b.id, hard: gap < 0, gap });
  }
  return out;
}

export const clashRig = {
  init: () => ({ ran: false, tol: 0, pick: null, bcf: null }),
  act(card, s0, a) {
    const s = { ...s0 }, [k, v] = a.split(':');
    if (k === 'reset') return clashRig.init();
    if (k === 'run') { s.ran = true; s.pick = null; s.bcf = null; return s; }
    if (k === 'tol') { s.tol = +v; s.ran = false; s.pick = null; s.bcf = null; return s; }
    if (k === 'pick' && s.ran) { s.pick = +v; s.bcf = null; return s; }
    if (k === 'bcf' && s.pick != null) { s.bcf = findClashes(s.tol)[s.pick]; return s; }
    return s;
  },
  goal(card, s) {
    const g = card.goal;
    if (g.kind === 'count') return s.ran && s.tol === g.tol && findClashes(s.tol).length === g.n;
    if (g.kind === 'bcf') return Boolean(s.bcf) && (!g.pair || [s.bcf.a, s.bcf.b].sort().join() === [...g.pair].sort().join());
    return false;
  }
};

/* =====================================================================
   Облако точек: процедурный «скан» и калькулятор размера файла.
   ===================================================================== */

export const PC_FORMATS = {
  xyz: { name: { ru: 'XYZ (текст)', en: 'XYZ (text)' }, bytes: 42, note: { ru: 'строка «x y z r g b»: около 42 символов на точку', en: 'a line “x y z r g b”: about 42 characters per point' } },
  pts: { name: { ru: 'PTS (текст)', en: 'PTS (text)' }, bytes: 46, note: { ru: 'строка «x y z интенсивность r g b»', en: 'a line “x y z intensity r g b”' } },
  las: { name: 'LAS 1.4', bytes: 36, header: 375, note: { ru: 'формат записи 7: координаты, интенсивность, класс, время, RGB — 36 байт', en: 'point record format 7: coordinates, intensity, class, time, RGB — 36 bytes' } },
  laz: { name: 'LAZ', bytes: 36 * 0.14, header: 375, note: { ru: 'тот же LAS, сжатый без потерь, — обычно 7–20 % размера', en: 'the same LAS, losslessly compressed — usually 7–20% of the size' } },
  e57: { name: 'E57', bytes: 30, header: 4096, note: { ru: 'оценка: зависит от точности и набора полей', en: 'an estimate: depends on precision and the set of fields' } }
};
export const PC_COUNTS = { '1M': 1e6, '10M': 1e7, '100M': 1e8, '1B': 1e9 };

export const pcSize = (fmt, n) => Math.round((PC_FORMATS[fmt].header ?? 0) + PC_FORMATS[fmt].bytes * n);

/** Детерминированный «скан»: земля, фасад здания и дерево. */
export function pcCloud(count = 2600, seed = 7) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pts = [];
  for (let i = 0; i < count; i++) {
    const k = r();
    if (k < 0.45) {                                   // земля
      const x = r() * 20 - 10, z = r() * 14 - 7;
      pts.push({ x, y: r() * 0.08, z, cls: 2, rgb: [96 + r() * 30, 104 + r() * 30, 80], i: 0.3 + r() * 0.2 });
    } else if (k < 0.8) {                             // фасад: две стены
      const side = r() < 0.6, y = r() * 7;
      const p = side ? { x: -6 + r() * 8, y, z: -2 } : { x: 2, y, z: -2 + r() * 5 };
      const win = (Math.floor(p.y) % 2 === 1) && (Math.floor((p.x + p.z) * 1.3) % 3 === 0);
      pts.push({ ...p, cls: 6, rgb: win ? [70, 110, 150] : [190, 160, 130], i: win ? 0.15 : 0.7 + r() * 0.2 });
    } else {                                          // дерево: ствол и крона
      if (r() < 0.15) pts.push({ x: 6 + r() * 0.3, y: r() * 3, z: 3, cls: 5, rgb: [100, 70, 40], i: 0.4 });
      else {
        const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), R = 2.2 * Math.cbrt(r());
        pts.push({ x: 6 + R * Math.sin(v) * Math.cos(u), y: 4.5 + R * Math.cos(v), z: 3 + R * Math.sin(v) * Math.sin(u), cls: 5, rgb: [50 + r() * 40, 120 + r() * 50, 50], i: 0.2 + r() * 0.3 });
      }
    }
  }
  return pts;
}

export const pcRig = {
  init: () => ({ mode: 'rgb', seen: ['rgb'], density: 100, n: '10M', fmt: 'xyz' }),
  act(card, s0, a) {
    const s = { ...s0, seen: [...s0.seen] }, [k, v] = a.split(':');
    if (k === 'reset') return pcRig.init();
    if (k === 'mode') { s.mode = v; if (!s.seen.includes(v)) s.seen.push(v); return s; }
    if (k === 'density') { s.density = +v; return s; }
    if (k === 'n' && v in PC_COUNTS) { s.n = v; return s; }
    if (k === 'fmt' && v in PC_FORMATS) { s.fmt = v; return s; }
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const g = card.goal;
    if (g.kind === 'modes') return s.seen.length >= g.n;
    if (g.kind === 'fit') return s.n === g.n && pcSize(s.fmt, PC_COUNTS[s.n]) <= g.maxBytes;
    return false;
  }
};
