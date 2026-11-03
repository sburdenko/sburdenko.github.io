/* Tape 07 models: the map, the Draw* → Render* grid, the args buffer, GPU culling, lamps, particles and the chooser. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PATHS, pathsIn, GEOMETRY, COUNT, apiCell, ARGS_MESH, drawIndexed, makeField, inFrustum, cull, cullSteps, cullTimeline,
  lampOn, lampLevel, lampCost, particleTool, particleSystemsCost, SCENARIOS, TOOLS,
} from '../unity-gpu-draw/model.js';
import { DICT } from '../unity-gpu-draw/i18n.js';

test('every path sits in one quadrant, every quadrant has a path, every path has a card', () => {
  const placed = ['go', 'own'].flatMap(owner => ['cpu', 'gpu'].flatMap(data => pathsIn(owner, data)));
  assert.deepEqual([...placed].sort(), Object.keys(PATHS).sort());
  for (const owner of ['go', 'own']) for (const data of ['cpu', 'gpu']) assert.ok(pathsIn(owner, data).length, `${owner}/${data}`);
  for (const lang of ['en', 'ru']) {
    for (const p of Object.keys(PATHS)) {
      assert.ok(DICT['map.names'][lang][p], `${lang} name ${p}`);
      assert.equal(DICT['map.info'][lang][p].length, 4, `${lang} card ${p}`);
    }
  }
});

test('the Draw* → Render* grid: indirect pairs, and only geometry-less rows have indexed calls', () => {
  assert.equal(apiCell('mesh', 'gpuArgs').old, 'Graphics.DrawMeshInstancedIndirect');
  assert.equal(apiCell('mesh', 'gpuArgs').now, 'Graphics.RenderMeshIndirect');
  assert.equal(apiCell('none', 'gpuArgs').old, 'Graphics.DrawProceduralIndirect');
  assert.equal(apiCell('none', 'gpuArgs').now, 'Graphics.RenderPrimitivesIndirect');
  for (const g of GEOMETRY) for (const c of COUNT) {
    const cell = apiCell(g, c);
    if (!cell) continue;
    assert.equal(Boolean(cell.indexed), g === 'none', `${g}.${c}`);
    for (const lang of ['en', 'ru']) {
      const keys = [`${g}.${c}`, ...(cell.indexed ? [`${g}.${c}.indexed`] : [])];
      for (const key of keys) {
        const info = DICT['api.info'][lang][key];
        for (const field of ['what', 'count', 'shader', 'when', 'code']) assert.ok(info?.[field], `${lang} ${key}.${field}`);
      }
    }
  }
});

test('the args buffer draws what its five numbers say', () => {
  const full = drawIndexed({ indexCountPerInstance: 9, instanceCount: 5, startIndex: 0, baseVertexIndex: 0, startInstance: 0 });
  assert.equal(full.triangles.length, 3);
  assert.deepEqual(full.instances, [0, 1, 2, 3, 4]);
  assert.deepEqual(full.warnings, []);
  const roofOnly = drawIndexed({ indexCountPerInstance: 3, instanceCount: 1, startIndex: 6, baseVertexIndex: 0, startInstance: 0 });
  assert.deepEqual(roofOnly.triangles, [[2, 3, 4]]);
  const tree = drawIndexed({ indexCountPerInstance: 9, instanceCount: 1, startIndex: 0, baseVertexIndex: 5, startInstance: 0 });
  assert.deepEqual(tree.triangles[0], [5, 6, 7]);
  const shifted = drawIndexed({ indexCountPerInstance: 9, instanceCount: 3, startIndex: 0, baseVertexIndex: 0, startInstance: 4 });
  assert.deepEqual(shifted.instances, [4, 5, 6]);
  const zero = drawIndexed({ indexCountPerInstance: 9, instanceCount: 0, startIndex: 0, baseVertexIndex: 0, startInstance: 0 });
  assert.equal(zero.instances.length, 0);
  const past = drawIndexed({ indexCountPerInstance: 9, instanceCount: 12, startIndex: 3, baseVertexIndex: 0, startInstance: 6 });
  assert.ok(past.warnings.includes('indexOut') && past.warnings.includes('instanceOut'));
  for (const lang of ['en', 'ru']) {
    for (const w of ['indexOut', 'instanceOut', 'vertexOut', 'partialTriangle']) assert.ok(DICT['args.warn'][lang][w], `${lang} ${w}`);
  }
  assert.equal(ARGS_MESH.indices.length, 9);
});

test('GPU culling: the frustum test, and readback costs a stall that the indirect path does not have', () => {
  const cam = { x: 0.5, y: 1, angle: 0, fov: 60, range: 0.9 };
  assert.ok(inFrustum({ x: 0.5, y: 0.5 }, cam));
  assert.ok(!inFrustum({ x: 0.05, y: 0.95 }, cam));
  assert.ok(!inFrustum({ x: 0.5, y: 0 }, cam), 'beyond range');
  const field = makeField(500);
  assert.equal(field.length, 500);
  const left = cull(field, { ...cam, angle: -30 }), right = cull(field, { ...cam, angle: 30 });
  assert.ok(left.length > 0 && right.length > 0);
  assert.ok(left.every(id => field[id].x < 0.75));
  assert.deepEqual(cullSteps(), ['reset', 'dispatch', 'copyCount', 'drawIndirect']);
  assert.ok(cullSteps({ readback: true }).includes('wait'));
  assert.equal(cullTimeline({ total: 1000, visible: 300, readback: false }).stall, 0);
  assert.ok(cullTimeline({ total: 1000, visible: 300, readback: true }).stall > 0);
  for (const lang of ['en', 'ru']) for (const s of [...cullSteps(), ...cullSteps({ readback: true })]) assert.equal(DICT['cull.steps'][lang][s].length, 4, `${lang} ${s}`);
});

test('lamps: blinking needs nothing from the CPU, states only on change, GameObjects pay per lamp', () => {
  const on = Array.from({ length: 2000 }, (_, i) => lampOn(i, 0)).filter(Boolean).length;
  assert.ok(on > 800 && on < 1200, 'phases are spread');
  assert.notEqual(lampOn(3, 0), lampOn(3, 0.5));
  assert.equal(lampLevel(0, 1, 0), 0);
  assert.equal(lampLevel(1, 1, 0), 1);
  assert.deepEqual(lampCost('deco', { lamps: 2000, changedPerFrame: 3 }), { bytes: 0, calls: 1, objects: 0, coroutines: 0 });
  assert.equal(lampCost('state', { lamps: 2000, changedPerFrame: 0 }).bytes, 0);
  assert.equal(lampCost('state', { lamps: 2000, changedPerFrame: 1 }).bytes, 2000);
  assert.equal(lampCost('naive', { lamps: 2000, changedPerFrame: 0 }).objects, 2000);
});

test('particles: state or long life means entities, CPU needs mean Shuriken, sheer count means VFX Graph', () => {
  const base = { count: 500, life: 'short', cpuEvents: false, colliders: false, state: false };
  assert.equal(particleTool({ ...base, state: true }).pick, 'entities');
  assert.equal(particleTool({ ...base, life: 'long' }).pick, 'entities');
  assert.equal(particleTool({ ...base, colliders: true }).pick, 'shuriken');
  assert.equal(particleTool({ ...base, count: 500000 }).pick, 'vfx');
  assert.equal(particleSystemsCost({ effects: 2000, perEffect: 10, shared: false }).calls, 2000);
  assert.equal(particleSystemsCost({ effects: 2000, perEffect: 10, shared: true }).calls, 1);
  for (const lang of ['en', 'ru']) {
    for (const pick of ['entities', 'shuriken', 'shurikenHeavy', 'vfx', 'either']) assert.ok(DICT['pt.picks'][lang][pick], `${lang} ${pick}`);
    for (const why of ['state', 'long', 'events', 'colliders', 'many', 'few']) assert.ok(DICT['pt.why'][lang][why], `${lang} ${why}`);
  }
});

test('the chooser: every scenario has its answer among four known options and a text', () => {
  for (const sc of SCENARIOS) {
    assert.equal(sc.options.length, 4);
    assert.ok(sc.options.includes(sc.answer));
    assert.equal(new Set(sc.options).size, 4);
    for (const o of sc.options) assert.ok(TOOLS.includes(o), o);
    for (const lang of ['en', 'ru']) assert.ok(DICT['choose.items'][lang][sc.id]?.q && DICT['choose.items'][lang][sc.id]?.a, `${lang} ${sc.id}`);
  }
  for (const lang of ['en', 'ru']) for (const tool of TOOLS) assert.ok(DICT.tools[lang][tool], `${lang} tool ${tool}`);
});
