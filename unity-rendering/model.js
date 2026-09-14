/**
 * Учебная модель батчинга Unity: сцена квартала, правила выбора пути отрисовки
 * и оценка стоимости кадра. Без DOM — проверяется тестами (tests/render-model.test.js).
 *
 * Миллисекунды и байты здесь условные: они позволяют сравнивать техники между собой,
 * а не измеряют конкретное железо.
 */

export const SHADERS = {
  lit: { urp: 'Lit', hdrp: 'HDRP/Lit', birp: 'Standard', kw: '' },
  litA: { urp: 'Lit', hdrp: 'HDRP/Lit', birp: 'Standard', kw: '_ALPHATEST_ON' },
  unlit: { urp: 'Unlit', hdrp: 'HDRP/Unlit', birp: 'Unlit/Color', kw: '' }
};
export const SHADER_ORDER = ['lit', 'litA', 'unlit'];

export const MATERIALS = {
  concrete: { n: 'Concrete', sh: 'lit', c: '#6c64a0', inst: false },
  metal: { n: 'Metal', sh: 'lit', c: '#a9b6d8', inst: true },
  wood: { n: 'Wood', sh: 'lit', c: '#c98a4b', inst: false },
  carR: { n: 'Car_Red', sh: 'lit', c: '#ff5470', inst: true },
  carB: { n: 'Car_Blue', sh: 'lit', c: '#4f7dff', inst: true },
  carY: { n: 'Car_Yellow', sh: 'lit', c: '#ffb13d', inst: true },
  skin: { n: 'Character', sh: 'lit', c: '#e3c9ff', inst: false },
  leaf: { n: 'Foliage', sh: 'litA', c: '#35d687', inst: true },
  neonP: { n: 'Neon_Pink', sh: 'unlit', c: '#ff7fd8', inst: false },
  neonC: { n: 'Neon_Cyan', sh: 'unlit', c: '#7ff4ff', inst: false },
  neonY: { n: 'Neon_Yellow', sh: 'unlit', c: '#ffe177', inst: false },
  neonV: { n: 'Neon_Violet', sh: 'unlit', c: '#b99bff', inst: false },
  holo: { n: 'Hologram', sh: 'unlit', c: '#8ff0ff', inst: true }
};
export const MATERIAL_ORDER = Object.keys(MATERIALS);

export const MESHES = {
  bA: { n: 'Building_A', v: 1200 }, bB: { n: 'Building_B', v: 900 }, bC: { n: 'Building_C', v: 1500 },
  lamp: { n: 'StreetLamp', v: 420 }, tree: { n: 'Tree', v: 500 }, crate: { n: 'Crate', v: 24 },
  quad: { n: 'Quad', v: 4 }, car: { n: 'Car', v: 800 }, chr: { n: 'Character', v: 2500 }
};
export const MESH_ORDER = Object.keys(MESHES);

export const PATHS = {
  plain: { l: 'Draw Mesh', s: 'DRAW', c: '#8c82b0', rank: 6 },
  srp: { l: 'SRP Batch', s: 'SRP', c: '#a77bff', rank: 2 },
  stat: { l: 'Static Batch', s: 'STATIC', c: '#ffd23f', rank: 0 },
  statsrp: { l: 'SRP Batch · Static', s: 'SRP·ST', c: '#ffd23f', rank: 0 },
  grd: { l: 'Hybrid Batch Group', s: 'HBG', c: '#26e3ea', rank: 1 },
  inst: { l: 'Draw Mesh (instanced)', s: 'INST', c: '#5dfc9a', rank: 3 },
  dyn: { l: 'Dynamic Batch', s: 'DYN', c: '#ff9a3d', rank: 4 }
};

export const TECHNIQUES = {
  stat: 'Static batching',
  dyn: 'Dynamic batching',
  srp: 'SRP Batcher',
  inst: 'GPU instancing',
  grd: 'GPU Resident Drawer'
};

/* ------------------------------------------------------------- сцена */

function buildScene() {
  const objects = [];
  const add = (kind, name, mesh, mat, gx, gy, extra = {}) => objects.push(Object.assign({
    id: objects.length, kind, name, mesh, mat, gx, gy, z: 0,
    static: false, moving: false, skinned: false, mpb: false
  }, extra));

  const blocks = [[1.2, 1.2, 3.0, 'bA'], [3.0, 1.1, 1.9, 'bB'], [1.1, 3.0, 2.4, 'bC'], [7.2, 1.2, 3.4, 'bA'],
    [9.0, 1.3, 2.1, 'bB'], [1.2, 8.1, 2.2, 'bC'], [8.6, 8.2, 3.2, 'bA'], [6.9, 9.0, 1.7, 'bB']];
  blocks.forEach(([x, y, h, m], i) => add('building', 'Building_' + (i + 1), m, 'concrete', x, y, { static: true, h }));

  [[0.8, 4.1], [2.6, 4.1], [7.2, 4.1], [9.2, 4.1], [0.8, 5.9], [2.6, 5.9], [7.2, 5.9], [9.2, 5.9],
    [4.1, 1.6], [5.9, 1.6], [4.1, 8.4], [5.9, 8.4]]
    .forEach(([x, y], i) => add('lamp', 'StreetLamp_' + (i + 1), 'lamp', 'metal', x, y, { static: true }));

  [[2.6, 6.6], [3.6, 6.9], [2.2, 7.5], [3.4, 7.9], [2.7, 8.9], [3.7, 9.3], [6.6, 6.6], [7.6, 6.7],
    [9.3, 6.7], [6.4, 7.6], [9.4, 9.3], [2.5, 2.5], [3.6, 3.4], [3.7, 2.3]]
    .forEach(([x, y], i) => add('tree', 'Tree_' + (i + 1), 'tree', 'leaf', x, y, { moving: true, ph: i * 1.7 }));

  [[6.6, 2.8], [7.0, 2.8], [7.4, 2.8], [6.8, 3.2], [7.2, 3.2], [6.6, 3.6], [7.0, 3.6], [8.2, 2.9], [8.6, 3.3], [8.2, 3.7]]
    .forEach(([x, y], i) => add('crate', 'Crate_' + (i + 1), 'crate', 'wood', x, y, { moving: true, ph: i * 0.9 }));

  const neon = ['neonP', 'neonC', 'neonY', 'neonV', 'neonP', 'neonC', 'neonY', 'neonV'];
  blocks.forEach(([x, y, h], i) => add('sign', 'NeonSign_' + (i + 1), 'quad', neon[i], x + 0.72, y, { z: h * 0.42, sh: h * 0.3 }));

  ['carR', 'carB', 'carY', 'carR', 'carB', 'carY'].forEach((m, i) =>
    add('car', 'Car_' + (i + 1), 'car', m, (i * 1.75) % 10, i % 2 ? 5.3 : 4.7, { moving: true, dir: i % 2 ? -1 : 1, sp: 0.55 + ((i * 37) % 10) / 25 }));

  [[0, 3.85, 1], [5, 6.15, -1], [8, 6.15, 1]].forEach(([x, y, d], i) =>
    add('char', 'Character_' + (i + 1), 'chr', 'skin', x, y, { moving: true, skinned: true, dir: d }));

  [[5, 2.6], [5, 7.4]].forEach(([x, y], i) => add('holo', 'HoloAd_' + (i + 1), 'quad', 'holo', x, y, { z: 1.5, mpb: true }));

  return objects;
}

export const OBJECTS = buildScene();
export const DEFAULT_FLAGS = OBJECTS.map(o => ({ static: o.static, mpb: o.mpb }));

/* ------------------------------------------------------------- правила */

export const isScriptable = pipe => pipe === 'urp' || pipe === 'hdrp';

/** Доступна ли техника в текущем пайплайне и при текущих настройках. */
export function available(key, state) {
  if (key === 'srp') return isScriptable(state.pipe);
  if (key === 'grd') return isScriptable(state.pipe) && state.srp;
  if (key === 'dyn') return state.pipe !== 'hdrp';
  return true;
}

/** Ключ причины недоступности — текст подставляет страница. */
export const unavailableReason = (key, state) => {
  if (key === 'srp') return 'na.srp';
  if (key === 'grd') return isScriptable(state.pipe) ? 'na.grdNeedsSrp' : 'na.grd';
  if (key === 'dyn') return 'na.dyn';
  return '';
};

export const isOn = (key, state) => Boolean(state[key]) && available(key, state);

export const shaderVariant = (o, pipe) => {
  const sh = SHADERS[MATERIALS[o.mat].sh];
  return (sh[pipe] || sh.urp) + (sh.kw ? ' +' + sh.kw : '');
};

/**
 * По каким правилам Unity выберет путь отрисовки для объекта.
 * Приоритет: SRP Batcher и static batching → GPU instancing → dynamic batching.
 */
export function route(o, state) {
  const mat = MATERIALS[o.mat], verts = MESHES[o.mesh].v, why = [];
  const on = key => isOn(key, state);
  const scriptable = isScriptable(state.pipe);

  if (on('stat') && o.static && !o.skinned) {
    why.push(['y', 'why.staticBatched']);
    return { p: (scriptable && on('srp') && !o.mpb) ? 'statsrp' : 'stat', why };
  }
  if (o.static && !on('stat')) why.push(['n', 'why.staticOff']);
  else if (!o.static && on('stat') && !o.skinned) why.push(['n', 'why.notStatic']);

  if (scriptable && on('srp')) {
    if (o.mpb) {
      why.push(['n', 'why.mpbSkipsSrp']);
    } else {
      if (on('grd')) {
        if (!o.skinned) {
          why.push(['y', 'why.grdTakes']);
          return { p: 'grd', why };
        }
        why.push(['n', 'why.grdSkinned']);
      }
      why.push(['y', 'why.srpCompatible']);
      return { p: 'srp', why };
    }
  } else if (scriptable) {
    why.push(['n', 'why.srpOff']);
  } else {
    why.push(['n', 'why.birpNoSrp']);
  }

  if (o.skinned) {
    why.push(['n', 'why.skinned']);
  } else if (on('inst') && mat.inst) {
    why.push(['y', 'why.instOn']);
    return { p: 'inst', why };
  } else if (!mat.inst) {
    why.push(['n', 'why.noInstFlag']);
  } else {
    why.push(['n', 'why.instOff']);
  }

  if (!o.skinned) {
    if (on('dyn')) {
      if (verts <= 300) {
        why.push(['y', 'why.dynFits', verts]);
        return { p: 'dyn', why };
      }
      why.push(['n', 'why.dynTooBig', verts]);
    } else if (state.pipe === 'hdrp') {
      why.push(['n', 'why.dynHdrp']);
    } else {
      why.push(['n', 'why.dynOff']);
    }
  }
  return { p: 'plain', why };
}

const COST = { setpass: 0.040, cull: 0.0012 };

/** Ключ причины, по которой очередной батч не склеился с предыдущим. */
export function breakReason(prev, next, state) {
  const a = prev.items[0].o, b = next.items[0].o;
  const ma = MATERIALS[a.mat], mb = MATERIALS[b.mat];
  const vn = o => shaderVariant(o, state.pipe);
  if (prev.p !== next.p) {
    if (next.p === 'plain' && b.mpb && isScriptable(state.pipe) && state.srp) {
      return ['brk.mpb', `${PATHS[prev.p].l} → ${PATHS[next.p].l}`];
    }
    if (next.p === 'plain' && b.skinned) return ['brk.skinned', `${PATHS[prev.p].l} → ${PATHS[next.p].l}`];
    if (ma.sh !== mb.sh) return ['brk.variantAndPath', `${vn(a)} → ${vn(b)}`];
    return ['brk.path', `${PATHS[prev.p].l} → ${PATHS[next.p].l}`];
  }
  switch (next.p) {
    case 'srp': case 'grd': return ['brk.variant', `${vn(a)} → ${vn(b)}`];
    case 'inst': return a.mesh !== b.mesh
      ? ['brk.mesh', `${MESHES[a.mesh].n} → ${MESHES[b.mesh].n}`]
      : ['brk.material', `${ma.n} → ${mb.n}`];
    default: return ['brk.material', `${ma.n} → ${mb.n}`];
  }
}

const batchKey = it => {
  const o = it.o;
  switch (it.p) {
    case 'srp': case 'grd': return it.p + '|' + MATERIALS[o.mat].sh;
    case 'stat': case 'statsrp': return it.p + '|' + o.mat;
    case 'inst': return 'inst|' + o.mesh + '|' + o.mat;
    default: return it.p + '|' + o.mat;
  }
};

function batchCost(run) {
  const n = run.items.length;
  const verts = run.items.reduce((s, it) => s + MESHES[it.o.mesh].v, 0);
  const moving = run.items.filter(it => it.o.moving).length;
  let draws, cpu, upload, memory = 0;
  switch (run.p) {
    case 'plain': draws = n; cpu = n * 0.020; upload = n * 384; break;
    case 'srp': draws = n; cpu = n * 0.0055 + run.mats.size * 0.002; upload = n * 256; break;
    case 'stat': draws = Math.ceil(verts / 64000); cpu = draws * 0.012; upload = draws * 256; memory = verts * 48; break;
    case 'statsrp': draws = Math.ceil(verts / 64000); cpu = draws * 0.006; upload = draws * 256; memory = verts * 48; break;
    case 'inst': draws = Math.ceil(n / 500); cpu = draws * 0.015 + n * 0.0012; upload = n * (run.items[0].o.mpb ? 144 : 128); break;
    case 'dyn': draws = Math.ceil(verts / 64000); cpu = draws * 0.020 + verts * 0.00012; upload = verts * 36 + draws * 384; break;
    case 'grd': {
      const combos = new Set(run.items.map(it => it.o.mesh + '|' + it.o.mat));
      draws = combos.size; cpu = draws * 0.004; upload = moving * 128 + draws * 64;
      break;
    }
  }
  return { n, verts, draws, cpu, upload, memory };
}

/**
 * Считает кадр: группирует объекты в батчи и оценивает стоимость.
 * state: { pipe, k (кварталов), stat, dyn, srp, inst, grd }
 */
export function evaluate(state, objects = OBJECTS) {
  const routes = objects.map(o => route(o, state));
  const items = [];
  for (let b = 0; b < state.k; b++) for (const o of objects) items.push({ o, b, p: routes[o.id].p });

  const shaderIdx = it => SHADER_ORDER.indexOf(MATERIALS[it.o.mat].sh);
  items.sort((A, B) =>
    shaderIdx(A) - shaderIdx(B) ||
    PATHS[A.p].rank - PATHS[B.p].rank ||
    MATERIAL_ORDER.indexOf(A.o.mat) - MATERIAL_ORDER.indexOf(B.o.mat) ||
    MESH_ORDER.indexOf(A.o.mesh) - MESH_ORDER.indexOf(B.o.mesh) ||
    A.b - B.b || A.o.id - B.o.id);

  const runs = [];
  let cur = null;
  for (const it of items) {
    const key = batchKey(it);
    if (!cur || cur.key !== key) {
      cur = { key, p: it.p, items: [], ids: new Set(), mats: new Set() };
      runs.push(cur);
    }
    cur.items.push(it);
    cur.ids.add(it.o.id);
    cur.mats.add(it.o.mat);
  }

  const T = { draws: 0, setpass: 0, cpu: 0, gpu: 0, upload: 0, memory: 0, objects: items.length, verts: 0 };
  let lastPass = null;
  runs.forEach((run, i) => {
    const srpFamily = run.p === 'srp' || run.p === 'statsrp' || run.p === 'grd';
    const pass = srpFamily ? 'V:' + MATERIALS[run.items[0].o.mat].sh : 'M:' + run.items[0].o.mat;
    run.setpass = pass !== lastPass ? 1 : 0;
    lastPass = pass;

    Object.assign(run, batchCost(run));
    run.cpu += run.setpass * COST.setpass + run.n * (run.p === 'grd' ? 0.0002 : COST.cull);
    run.gpu = run.verts * 0.00001 + run.draws * 0.0015;
    run.reason = i ? breakReason(runs[i - 1], run, state) : ['brk.first', ''];

    T.draws += run.draws; T.setpass += run.setpass; T.cpu += run.cpu;
    T.gpu += run.gpu; T.upload += run.upload; T.memory += run.memory; T.verts += run.verts;
  });
  if (runs.some(r => r.p === 'grd')) T.gpu += 0.06;

  return { runs, T, routes, state };
}

export const ALL_OFF = { stat: false, dyn: false, srp: false, inst: false, grd: false };

/** Каждая техника по отдельности на той же сцене — для таблицы сравнения. */
export function compareTechniques(state, objects = OBJECTS) {
  const base = evaluate({ ...state, ...ALL_OFF }, objects);
  const rows = Object.keys(TECHNIQUES).map(key => {
    const patch = key === 'grd' ? { srp: true, grd: true } : { [key]: true };
    const variantState = { ...state, ...ALL_OFF, ...patch };
    const ok = available(key, variantState);
    return {
      key,
      name: TECHNIQUES[key],
      available: ok,
      reason: ok ? '' : unavailableReason(key, state),
      result: ok ? evaluate(variantState, objects) : base
    };
  });
  return { base, rows };
}
