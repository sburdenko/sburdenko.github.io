import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OBJECTS, MESHES, MATERIALS, evaluate, route, available, isOn,
  compareTechniques, shaderVariant, ALL_OFF
} from '../unity-rendering/model.js';

const urp = { pipe: 'urp', k: 1, ...ALL_OFF };
const birp = { pipe: 'birp', k: 1, ...ALL_OFF };
const hdrp = { pipe: 'hdrp', k: 1, ...ALL_OFF };
const find = name => OBJECTS.find(o => o.name.startsWith(name));

test('без батчинга каждый объект — свой draw call', () => {
  const r = evaluate(urp);
  assert.equal(r.T.draws, OBJECTS.length);
  assert.equal(r.T.objects, OBJECTS.length);
  assert.ok(r.runs.every(run => run.p === 'plain'));
});

test('SRP Batcher не уменьшает draw calls, но снижает SetPass и CPU', () => {
  const base = evaluate(urp);
  const srp = evaluate({ ...urp, srp: true });
  assert.equal(srp.T.draws, base.T.draws, 'draw calls те же');
  assert.ok(srp.T.setpass < base.T.setpass, 'SetPass меньше');
  assert.ok(srp.T.cpu < base.T.cpu, 'CPU дешевле');
  assert.equal(srp.T.verts, base.T.verts, 'геометрии столько же');
});

test('SRP Batcher и GPU Resident Drawer недоступны в Built-in', () => {
  assert.equal(available('srp', { ...birp, srp: true }), false);
  assert.equal(available('grd', { ...birp, srp: true, grd: true }), false);
  const r = evaluate({ ...birp, srp: true, grd: true });
  assert.equal(r.T.draws, OBJECTS.length, 'всё падает на обычный путь');
});

test('dynamic batching берёт только мелкие меши и не работает в HDRP', () => {
  const crate = find('Crate_1'), building = find('Building_1');
  assert.ok(MESHES[crate.mesh].v <= 300 && MESHES[building.mesh].v > 300);
  assert.equal(route(crate, { ...urp, dyn: true }).p, 'dyn');
  assert.equal(route(building, { ...urp, dyn: true }).p, 'plain');
  assert.equal(available('dyn', { ...hdrp, dyn: true }), false);
  assert.equal(route(crate, { ...hdrp, dyn: true }).p, 'plain');
});

test('static batching платит памятью за копии вершин и требует флага Static', () => {
  const base = evaluate(urp);
  const stat = evaluate({ ...urp, stat: true });
  assert.equal(base.T.memory, 0);
  assert.ok(stat.T.memory > 0, 'появились копии вершин в общем буфере');
  assert.ok(stat.T.draws < base.T.draws);
  assert.equal(route(find('Building_1'), { ...urp, stat: true }).p, 'stat');
  assert.equal(route(find('Crate_1'), { ...urp, stat: true }).p, 'plain', 'движущийся объект не Static');
});

test('в URP у SRP Batcher приоритет над галочкой GPU Instancing', () => {
  const lamp = find('StreetLamp_1');
  assert.equal(MATERIALS[lamp.mat].inst, true, 'у материала включён instancing');
  assert.equal(route(lamp, { ...urp, srp: true, inst: true }).p, 'srp');
  assert.equal(route(lamp, { ...urp, srp: false, inst: true }).p, 'inst');
  assert.equal(route(lamp, { ...birp, inst: true }).p, 'inst', 'в Built-in instancing работает сразу');
});

test('MaterialPropertyBlock выбивает объект из SRP Batcher и из GPU Resident Drawer', () => {
  const holo = find('HoloAd_1');
  assert.equal(holo.mpb, true);
  assert.equal(route(holo, { ...urp, srp: true }).p, 'plain');
  assert.equal(route(holo, { ...urp, srp: true, grd: true }).p, 'plain');
  assert.equal(route(holo, { ...urp, srp: true, inst: true }).p, 'inst', 'зато instancing ему доступен');
});

test('GPU Resident Drawer требует SRP Batcher и не берёт skinned mesh', () => {
  assert.equal(isOn('grd', { ...urp, grd: true, srp: false }), false);
  const lamp = find('StreetLamp_1'), hero = find('Character_1');
  assert.equal(route(lamp, { ...urp, srp: true, grd: true }).p, 'grd');
  assert.equal(route(hero, { ...urp, srp: true, grd: true }).p, 'srp', 'skinned остаётся на SRP Batcher');
  const grd = evaluate({ ...urp, srp: true, grd: true });
  const srp = evaluate({ ...urp, srp: true });
  assert.ok(grd.T.draws < srp.T.draws, 'одинаковые меш+материал схлопываются в instanced-вызовы');
  assert.ok(grd.T.cpu < srp.T.cpu);
});

test('масштаб сцены умножает количество объектов, но не число шейдерных вариантов', () => {
  const one = evaluate({ ...urp, srp: true, k: 1 });
  const ten = evaluate({ ...urp, srp: true, k: 10 });
  assert.equal(ten.T.objects, one.T.objects * 10);
  assert.equal(ten.T.draws, one.T.draws * 10);
  assert.equal(ten.T.setpass, one.T.setpass, 'SetPass зависит от вариантов, а не от числа объектов');
});

test('каждый батч объясняет, почему он не склеился с предыдущим', () => {
  const r = evaluate({ ...urp, srp: true, stat: true });
  assert.deepEqual(r.runs[0].reason, ['Первый вызов в кадре', '']);
  r.runs.slice(1).forEach(run => {
    assert.equal(typeof run.reason[0], 'string');
    assert.ok(run.reason[0].length > 0);
  });
  assert.ok(r.runs.every(run => run.items.length > 0 && run.draws >= 1));
});

test('таблица сравнения помечает недоступные техники и не врёт про baseline', () => {
  const { base, rows } = compareTechniques({ pipe: 'birp', k: 1, ...ALL_OFF });
  const byKey = Object.fromEntries(rows.map(r => [r.key, r]));
  assert.equal(byKey.srp.available, false);
  assert.equal(byKey.grd.available, false);
  assert.equal(byKey.dyn.available, true);
  assert.equal(byKey.srp.result.T.draws, base.T.draws, 'недоступная техника показывает baseline');

  const hdrpRows = compareTechniques({ pipe: 'hdrp', k: 1, ...ALL_OFF }).rows;
  assert.equal(hdrpRows.find(r => r.key === 'dyn').available, false);
  assert.equal(hdrpRows.find(r => r.key === 'grd').available, true, 'GRD включает SRP Batcher сам');
});

test('имя шейдера зависит от пайплайна', () => {
  const lamp = find('StreetLamp_1');
  assert.equal(shaderVariant(lamp, 'urp'), 'Lit');
  assert.equal(shaderVariant(lamp, 'birp'), 'Standard');
  assert.equal(shaderVariant(lamp, 'hdrp'), 'HDRP/Lit');
  assert.match(shaderVariant(find('Tree_1'), 'urp'), /_ALPHATEST_ON/);
});
