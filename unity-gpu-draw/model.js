/** Tape 07 models: the map of drawing paths, the Draw* → Render* grid, an indirect args buffer, a GPU-culling frame,
 *  blinking lamps and particles. Pure functions: the rigs draw what these return. */
import { rng } from '../assets/rand.js?v=202611040856';

/* ---------------- CH.00 map: two axes ---------------- */

/** owner: 'go' — a GameObject with a renderer, 'own' — your own arrays; data: 'cpu' — re-sent every frame, 'gpu' — stays in VRAM. */
export const PATHS = {
  static:   { owner: 'go',  data: 'gpu', tape: 'tape1', chapter: 'static' },
  dynamic:  { owner: 'go',  data: 'cpu', tape: 'tape1', chapter: 'dynamic' },
  srp:      { owner: 'go',  data: 'cpu', tape: 'tape1', chapter: 'srp' },
  goInst:   { owner: 'go',  data: 'cpu', tape: 'tape1', chapter: 'instancing' },
  grd:      { owner: 'go',  data: 'gpu', tape: 'tape1', chapter: 'grd' },
  rmesh:    { owner: 'own', data: 'cpu', chapter: 'api' },
  rinst:    { owner: 'own', data: 'cpu', chapter: 'api' },
  rprim:    { owner: 'own', data: 'gpu', chapter: 'api' },
  rindirect:{ owner: 'own', data: 'gpu', chapter: 'indirect' },
  brg:      { owner: 'own', data: 'gpu', chapter: 'brg' },
};

export const pathsIn = (owner, data) => Object.keys(PATHS).filter(k => PATHS[k].owner === owner && PATHS[k].data === data);

/* ---------------- CH.01 Draw* → Render* ---------------- */

/** Rows: where the geometry comes from. Columns: who decides how many instances and where their data comes from. */
export const GEOMETRY = ['mesh', 'none'];
export const COUNT = ['one', 'cpuArray', 'cpuCount', 'gpuArgs'];

/** One cell of the grid: the old call, the new one, or null when the combination does not exist. */
export const API = {
  'mesh.one':       { old: 'Graphics.DrawMesh', now: 'Graphics.RenderMesh' },
  'mesh.cpuArray':  { old: 'Graphics.DrawMeshInstanced', now: 'Graphics.RenderMeshInstanced' },
  'mesh.cpuCount':  { old: 'Graphics.DrawMeshInstancedProcedural', now: 'Graphics.RenderMeshPrimitives' },
  'mesh.gpuArgs':   { old: 'Graphics.DrawMeshInstancedIndirect', now: 'Graphics.RenderMeshIndirect' },
  'none.one':       null,
  'none.cpuArray':  null,
  'none.cpuCount':  { old: 'Graphics.DrawProcedural', now: 'Graphics.RenderPrimitives', indexed: 'Graphics.RenderPrimitivesIndexed' },
  'none.gpuArgs':   { old: 'Graphics.DrawProceduralIndirect', now: 'Graphics.RenderPrimitivesIndirect', indexed: 'Graphics.RenderPrimitivesIndexedIndirect' },
};

export const apiCell = (geometry, count) => API[`${geometry}.${count}`];

/* ---------------- CH.02 an indirect args buffer, cell by cell ---------------- */

/**
 * The mesh of the args rig: a vertex buffer with two shapes of five vertices each (a house, then a tree) and an index
 * buffer of three triangles over the first five vertices. baseVertexIndex 5 makes the same indices land on the tree.
 */
export const ARGS_MESH = {
  vertices: [
    [0, 1], [1, 1], [0, 0.45], [1, 0.45], [0.5, 0],          // house: walls (two triangles) and the roof apex
    [0.35, 1], [0.65, 1], [0.15, 0.55], [0.85, 0.55], [0.5, 0], // tree: trunk base, crown corners, top
  ],
  indices: [0, 1, 2, 1, 3, 2, 2, 3, 4],
  instances: 12,
};

export const ARGS_FIELDS = ['indexCountPerInstance', 'instanceCount', 'startIndex', 'baseVertexIndex', 'startInstance'];

/**
 * What one IndirectDrawIndexedArgs command draws on ARGS_MESH: which instance ids, and which triangles each of them gets.
 * `instanceId` is what GetIndirectInstanceID() gives the shader: startInstance + SV_InstanceID.
 */
export function drawIndexed(args, mesh = ARGS_MESH) {
  const { indexCountPerInstance: count, instanceCount, startIndex, baseVertexIndex, startInstance } = args;
  const triangles = [], warnings = [];
  const last = Math.min(mesh.indices.length, startIndex + count);
  for (let i = startIndex; i + 3 <= last; i += 3) {
    const tri = mesh.indices.slice(i, i + 3).map(index => index + baseVertexIndex);
    if (tri.some(v => v >= mesh.vertices.length)) { warnings.push('vertexOut'); break; }
    triangles.push(tri);
  }
  if (startIndex + count > mesh.indices.length) warnings.push('indexOut');
  if (count % 3) warnings.push('partialTriangle');
  const instances = [];
  for (let k = 0; k < instanceCount; k++) {
    const id = startInstance + k;
    if (id >= mesh.instances) { warnings.push('instanceOut'); break; }
    instances.push(id);
  }
  return { triangles, instances, warnings: [...new Set(warnings)] };
}

/* ---------------- CH.03 one frame of GPU culling ---------------- */

/** A field of objects seen from above, a camera at the bottom looking up. Angles in degrees, 0 = straight up. */
export function makeField(count, seed = 7) {
  const next = rng(seed);
  return Array.from({ length: count }, (_, i) => ({ id: i, x: next(), y: next() * 0.92 }));
}

/** Frustum test in 2D: inside the view cone and within range. Mirrors what one compute thread does per instance. */
export function inFrustum(object, cam) {
  const dx = object.x - cam.x, dy = cam.y - object.y;
  const dist = Math.hypot(dx, dy);
  if (dist > cam.range || dist < 1e-6) return false;
  const angle = Math.atan2(dx, dy) * 180 / Math.PI;
  return Math.abs(angle - cam.angle) <= cam.fov / 2;
}

/** Visible ids. `aspect` stretches x the way the canvas does, so the test and the picture agree. */
export const cull = (field, cam, aspect = 1) =>
  field.filter(o => inFrustum({ x: o.x * aspect, y: o.y }, { ...cam, x: cam.x * aspect })).map(o => o.id);

/** The steps of one frame. `readback` — the naive version that asks the CPU for the visible count. */
export function cullSteps({ readback = false } = {}) {
  return readback
    ? ['reset', 'dispatch', 'readback', 'wait', 'drawCpu']
    : ['reset', 'dispatch', 'copyCount', 'drawIndirect'];
}

/**
 * Timeline of one frame in milliseconds on two lanes. The numbers are a model for comparing the two ways, not hardware.
 * The GPU work is the cull dispatch (all objects) and the draw (visible ones). With a readback the CPU stops until
 * the GPU has run everything queued before it, then submits the draw: the lanes stop overlapping.
 */
export function cullTimeline({ total, visible, readback, queued = 2 }) {
  const cpuSubmit = 0.15, gpuCull = 0.02 + total * 0.00002, gpuDraw = 0.1 + visible * 0.0001;
  if (!readback) {
    return {
      cpu: [{ k: 'submit', from: 0, to: cpuSubmit * 3 }],
      gpu: [{ k: 'cull', from: cpuSubmit, to: cpuSubmit + gpuCull }, { k: 'draw', from: cpuSubmit + gpuCull, to: cpuSubmit + gpuCull + gpuDraw }],
      stall: 0,
    };
  }
  const gpuBusy = queued + gpuCull;
  const stall = gpuBusy;
  return {
    cpu: [{ k: 'submit', from: 0, to: cpuSubmit }, { k: 'wait', from: cpuSubmit, to: cpuSubmit + stall }, { k: 'submit', from: cpuSubmit + stall, to: cpuSubmit * 2 + stall }],
    gpu: [{ k: 'queued', from: cpuSubmit, to: cpuSubmit + queued }, { k: 'cull', from: cpuSubmit + queued, to: cpuSubmit + gpuBusy },
      { k: 'draw', from: cpuSubmit * 2 + stall, to: cpuSubmit * 2 + stall + gpuDraw }],
    stall,
  };
}

/* ---------------- CH.06 2000 blinking lamps ---------------- */

/** On/off of a decorative lamp: the phase comes from its own index, nothing comes from the CPU. */
export const lampOn = (id, time, speed = 1) => ((id * 0.618 + time * speed) % 1 + 1) % 1 >= 0.5;

/** States of a machine lamp: 0 — off, 1 — steady, 2 — blinking (the blinking itself still runs in the shader). */
export const lampLevel = (state, id, time) => (state === 0 ? 0 : state === 1 ? 1 : lampOn(id, time, 2) ? 1 : 0.15);

/**
 * What the CPU sends per frame for N lamps, in bytes, and how many draw calls go out.
 * deco — nothing; state — one byte per lamp, only in frames where something changed; part — the lamp is a zone in
 * the machine's mesh, its state rides in the machine's per-instance data that is uploaded anyway; naive — every lamp
 * is a GameObject with its own renderer and a coroutine that toggles it.
 */
export function lampCost(mode, { lamps, changedPerFrame }) {
  switch (mode) {
    case 'deco': return { bytes: 0, calls: 1, objects: 0, coroutines: 0 };
    case 'state': return { bytes: changedPerFrame > 0 ? lamps : 0, calls: 1, objects: 0, coroutines: 0 };
    case 'part': return { bytes: changedPerFrame > 0 ? changedPerFrame * 4 : 0, calls: 0, objects: 0, coroutines: 0 };
    default: return { bytes: 0, calls: lamps, objects: lamps, coroutines: lamps };
  }
}

/* ---------------- CH.07 particles ---------------- */

/**
 * Which tool fits a stream of short-lived things. count — how many alive at once; life — 'short' | 'long';
 * cpuEvents — C# must hear about each particle (sound on a hit, damage); colliders — must hit physics colliders;
 * state — the thing has gameplay meaning and is queried later.
 */
export function particleTool({ count, life, cpuEvents, colliders, state }) {
  if (state || life === 'long') return { pick: 'entities', why: state ? 'state' : 'long' };
  if (cpuEvents || colliders) return { pick: count > 20000 ? 'shurikenHeavy' : 'shuriken', why: cpuEvents ? 'events' : 'colliders' };
  return { pick: count > 20000 ? 'vfx' : 'either', why: count > 20000 ? 'many' : 'few' };
}

/** N effects as N particle systems against one shared system that you Emit() into: draw calls and systems to update. */
export function particleSystemsCost({ effects, perEffect, shared }) {
  return shared
    ? { systems: 1, calls: 1, particles: effects * perEffect }
    : { systems: effects, calls: effects, particles: effects * perEffect };
}

/* ---------------- CH.08 what would you pick ---------------- */

export const TOOLS = ['static', 'srp', 'grd', 'rinst', 'rindirect', 'rprim', 'brg', 'shader', 'shuriken', 'vfx'];

/** Scenario → the right tool and three plausible wrong ones. */
export const SCENARIOS = [
  { id: 'lamps', answer: 'shader', options: ['shader', 'shuriken', 'rindirect', 'srp'] },
  { id: 'level', answer: 'static', options: ['static', 'rinst', 'brg', 'vfx'] },
  { id: 'grass', answer: 'rindirect', options: ['rindirect', 'rinst', 'grd', 'static'] },
  { id: 'rts', answer: 'rinst', options: ['rinst', 'grd', 'static', 'shuriken'] },
  { id: 'scene', answer: 'grd', options: ['grd', 'brg', 'rinst', 'static'] },
  { id: 'sparks', answer: 'shuriken', options: ['shuriken', 'vfx', 'rinst', 'shader'] },
  { id: 'rain', answer: 'vfx', options: ['vfx', 'shuriken', 'rinst', 'rindirect'] },
  { id: 'engine', answer: 'brg', options: ['brg', 'grd', 'rindirect', 'srp'] },
  { id: 'ribbons', answer: 'rprim', options: ['rprim', 'rinst', 'vfx', 'static'] },
];
