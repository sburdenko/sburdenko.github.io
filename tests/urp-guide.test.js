import test from 'node:test';
import assert from 'node:assert/strict';
import { SETTINGS, LOCATIONS, settingsIn, quizOrder, chooseRenderer, residentDrawer, GRD_REQUIREMENTS } from '../unity-urp/model-setup.js';
import { shadowBudget, cascadeSplits, atlasGrid, atlasLayout, MODE_MATRIX, LIGHT_MODES, characterInPillarShadow, layerMask, lightAffects } from '../unity-urp/model-light.js';
import { objectLighting, leakSample, blendVolumes, INSIDE } from '../unity-urp/model-gi.js';
import { SHADER_STEPS, SHADER_CAPS, addedLines, fresnelHaloAlpha, silhouetteSummary, buildFrameGraph, nativePasses, stackPaths } from '../unity-urp/model-frame.js';
import { MSAA_PATTERNS, msaaCoverage, msaaCost, dpiRenderScale, renderScaleModel, jitter, psoFrames } from '../unity-urp/model-output.js';

test('every setting lives in a known place and every place has settings', () => {
  for (const [name, place] of Object.entries(SETTINGS)) assert.ok(LOCATIONS.includes(place), name);
  for (const place of LOCATIONS) assert.ok(settingsIn(place).length > 0, place);
  assert.equal(new Set(quizOrder()).size, Object.keys(SETTINGS).length);
});

test('renderer chooser applies the e-book feature table as hard constraints', () => {
  const base = { msaa: false, grd: false, vertexLighting: false, lightsPerObject: 2, lightsOnScreen: 4, transparentShare: 10, platform: 'desktop', overlayCameras: false };
  assert.equal(chooseRenderer(base).best, 'forward');
  assert.equal(chooseRenderer({ ...base, grd: true }).best, 'forwardPlus');
  assert.equal(chooseRenderer({ ...base, vertexLighting: true }).best, 'forward');
  const msaaMany = chooseRenderer({ ...base, msaa: true, lightsPerObject: 12, lightsOnScreen: 40 });
  assert.equal(msaaMany.best, 'forwardPlus');
  assert.deepEqual(msaaMany.verdicts.find(v => v.key === 'deferred').failed, ['msaa']);
  assert.equal(chooseRenderer({ ...base, grd: true, vertexLighting: true }).best, null);
  assert.equal(chooseRenderer({ ...base, lightsOnScreen: 40, lightsPerObject: 12, platform: 'mobileLow' }).best, 'deferred');
  assert.ok(chooseRenderer({ ...base, lightsOnScreen: 40, platform: 'gles3' }).notes.some(n => n.key === 'cameraLimit'));
});

test('GPU Resident Drawer needs every requirement and leaves skinned meshes and particles alone', () => {
  const all = Object.fromEntries(GRD_REQUIREMENTS.map(k => [k, true]));
  const scene = { meshRenderers: 3000, uniquePairs: 400, skinned: 60, particles: 40, occluded: 30, occlusionCulling: true };
  const on = residentDrawer({ ...scene, enabled: all });
  assert.equal(on.active, true);
  assert.equal(on.after, 500);
  assert.equal(on.instancesDrawn, 2100);
  const off = residentDrawer({ ...scene, enabled: { ...all, brgKeepAll: false } });
  assert.deepEqual(off.missing, ['brgKeepAll']);
  assert.equal(off.after, off.before);
});

test('shadow budget: point lights render six views, cascades end at max distance', () => {
  const base = { resolution: 2048, distance: 60, cascades: 2, spotLights: 1, pointLights: 0, soft: true };
  assert.equal(shadowBudget({ ...base, pointLights: 1 }).maps - shadowBudget(base).maps, 6);
  assert.equal(cascadeSplits(80, 4).at(-1), 80);
  assert.ok(cascadeSplits(80, 4)[0] < 20);
});

test('shadow atlas follows the e-book tiling table and downscales the book example', () => {
  assert.deepEqual([1, 2, 4, 5, 16, 17].map(atlasGrid), [1, 2, 2, 4, 4, 8]);
  const haunted = atlasLayout([{ type: 'point', tier: 256 }, { type: 'spot', tier: 512 }], 1024);
  assert.equal(haunted.maps.length, 7);
  assert.equal(haunted.grid, 4);
  assert.equal(haunted.downscaled, true);
  assert.equal(haunted.maps.at(-1).size, 256);
  assert.equal(atlasLayout([{ type: 'point', tier: 256 }, { type: 'spot', tier: 256 }], 1024).downscaled, false);
});

test('mixed lighting modes match the e-book descriptions', () => {
  for (const mode of LIGHT_MODES) assert.ok(MODE_MATRIX[mode]);
  assert.equal(MODE_MATRIX.bakedIndirect.farStatic, 'none');
  assert.equal(MODE_MATRIX.shadowmask.farStatic, 'baked');
  assert.equal(MODE_MATRIX.subtractive.staticOnDynamic, 'probe');
  assert.equal(MODE_MATRIX.subtractive.dynamicOnStatic, 'rt');
  assert.ok(MODE_MATRIX.shadowmask.memory > MODE_MATRIX.bakedIndirect.memory);
  assert.equal(characterInPillarShadow('subtractive', 5, 4, 6), 'probe');
  assert.equal(characterInPillarShadow('realtime', 5, 4, 6), 'shadow');
});

test('rendering layers are a bitwise overlap', () => {
  assert.equal(lightAffects(layerMask(['Highlight']), layerMask(['Default', 'Highlight'])), true);
  assert.equal(lightAffects(layerMask(['Interior']), layerMask(['Default'])), false);
});

test('light probe group lights a long object uniformly, APV follows the gradient', () => {
  const span = { start: 0.3, length: 0.4 };
  const group = objectLighting('group', span);
  const apv = objectLighting('apv', span);
  assert.equal(new Set(group.values).size, 1);
  assert.ok(apv.values.at(-1) > apv.values[0] + 0.5);
  assert.ok(apv.error < group.error);
});

test('APV leak: coarse grid leaks, rendering layers or bias removes it', () => {
  const leaky = leakSample({ spacing: 3, wallThickness: 0.3, normalBias: 0, viewBias: 0, virtualOffset: false, dilation: false, renderingLayers: false });
  assert.ok(leaky.leak > 0.2 || leaky.tooDark, JSON.stringify(leaky.used));
  const layered = leakSample({ spacing: 3, wallThickness: 0.3, normalBias: 0, viewBias: 0, virtualOffset: true, dilation: true, renderingLayers: true });
  assert.ok(Math.abs(layered.value - INSIDE) < 0.01);
  const biased = leakSample({ spacing: 1, wallThickness: 0.3, normalBias: 0.6, viewBias: 0.5, virtualOffset: false, dilation: false, renderingLayers: false });
  assert.ok(Math.abs(biased.value - INSIDE) < 0.01);
});

test('volumes blend by priority, weight and blend distance', () => {
  const volumes = [
    { id: 'global', global: true, priority: 0, weight: 1, value: 0.2, override: true },
    { id: 'local', global: false, priority: 1, weight: 1, value: 0.6, override: true, min: 40, max: 70, blendDistance: 10 },
  ];
  assert.equal(blendVolumes(0, volumes, 10).value, 0.2);
  assert.equal(blendVolumes(0, volumes, 50).value, 0.6);
  assert.ok(Math.abs(blendVolumes(0, volumes, 35).value - 0.4) < 1e-9);
  const halfWeight = volumes.map(v => (v.id === 'local' ? { ...v, weight: 0.5 } : v));
  assert.ok(Math.abs(blendVolumes(0, halfWeight, 50).value - 0.4) < 1e-9);
});

test('shader steps add lines and only colour steps use the SRP Batcher CBUFFER', () => {
  assert.equal(SHADER_STEPS.length, 5);
  assert.equal(SHADER_CAPS.unlit.cbuffer, false);
  assert.deepEqual(addedLines('a\nb', 'a\nb\nc'), [3]);
  assert.equal(fresnelHaloAlpha(1, 4, 1), 1);
  assert.ok(fresnelHaloAlpha(0.3, 4, 1) < 0.01);
});

test('silhouette setup from the book shows the hero behind the wall without drawing twice', () => {
  const book = silhouetteSummary({ excludeFromOpaque: true, silhouettePass: true, depthTest: 'greater', normalPass: true });
  assert.equal(book.ok, true);
  const noSecond = silhouetteSummary({ excludeFromOpaque: true, silhouettePass: true, depthTest: 'greater', normalPass: false });
  assert.ok(noSecond.cells.some(cell => cell.result === 'missing'));
  const always = silhouetteSummary({ excludeFromOpaque: false, silhouettePass: true, depthTest: 'always', normalPass: false });
  assert.equal(always.cells.at(-1).result, 'silhouette');
  assert.equal(silhouetteSummary({ excludeFromOpaque: false, silhouettePass: true, depthTest: 'greater', normalPass: true }).doubleDraw, true);
});

test('render graph culls unused output and reuses transient memory', () => {
  const graph = buildFrameGraph({ ssao: true, decals: true, bloom: true, debug: true });
  assert.equal(graph.declared.find(p => p.id === 'debug').culled, true);
  assert.ok(graph.transientMB < graph.dedicatedMB);
  for (const resource of graph.resources) {
    const touched = graph.passes.flatMap((p, i) => ([...p.reads, ...p.writes].includes(resource.name) ? [i] : []));
    assert.equal(resource.first, Math.min(...touched));
  }
  const lean = buildFrameGraph({ ssao: false, decals: true, bloom: false });
  assert.deepEqual(lean.passes.find(p => p.id === 'composite').reads, ['color']);
});

test('native pass merging follows the e-book mobile advice', () => {
  const lean = nativePasses({ depthTexture: false, opaqueTexture: false, tint: 'off', depthMode: 'afterOpaques', downsampling: 'none', fetchSupported: true });
  assert.equal(lean.merged, true);
  assert.equal(nativePasses({ depthTexture: true, depthMode: 'afterOpaques', opaqueTexture: false, tint: 'off', downsampling: 'none', fetchSupported: true }).merged, false);
  assert.equal(nativePasses({ depthTexture: true, depthMode: 'afterTransparents', opaqueTexture: false, tint: 'off', downsampling: 'none', fetchSupported: true }).merged, true);
  assert.equal(nativePasses({ depthTexture: false, opaqueTexture: true, downsampling: '2x', tint: 'off', depthMode: 'afterOpaques', fetchSupported: true }).merged, false);
  assert.equal(nativePasses({ depthTexture: false, opaqueTexture: false, tint: 'texture', depthMode: 'afterOpaques', downsampling: 'none', fetchSupported: true }).merged, false);
  assert.equal(nativePasses({ depthTexture: false, opaqueTexture: false, tint: 'fetch', depthMode: 'afterOpaques', downsampling: 'none', fetchSupported: true }).merged, true);
  assert.equal(nativePasses({ depthTexture: false, opaqueTexture: false, tint: 'fetch', depthMode: 'afterOpaques', downsampling: 'none', fetchSupported: false }).merged, false);
  assert.deepEqual(stackPaths('deferred', 2).overlays, ['forward', 'forward']);
});

test('MSAA samples stay inside the pixel and memory scales with samples', () => {
  for (const samples of [1, 2, 4, 8]) {
    assert.equal(MSAA_PATTERNS[samples].length, samples);
    assert.ok(MSAA_PATTERNS[samples].flat().every(v => v >= 0 && v <= 1));
  }
  assert.equal(msaaCoverage({ samples: 4, slope: 0, edge: 0.5 }).coverage, 0.5);
  assert.equal(msaaCost(4).attachmentMemoryMB, msaaCost(1).attachmentMemoryMB * 4);
  assert.equal(msaaCost(1).resolveTargetMB, 0);
});

test('render scale and DPI tip from the e-book', () => {
  assert.equal(dpiRenderScale(300), 0.32);
  const quarter = renderScaleModel({ output: '1080p', scale: 0.25 });
  assert.equal(quarter.pixelShare, 1 / 16);
  const offsets = Array.from({ length: 16 }, (_, i) => jitter(i));
  assert.ok(offsets.every(([x, y]) => x >= -0.5 && x < 0.5 && y >= -0.5 && y < 0.5));
});

test('PSO warm-up removes gameplay spikes and moves the cost', () => {
  const none = psoFrames({ strategy: 'none', cached: false });
  const warm = psoFrames({ strategy: 'warmup', cached: false });
  const progressive = psoFrames({ strategy: 'progressive', cached: false });
  const cached = psoFrames({ strategy: 'none', cached: true });
  assert.equal(none.spikes, 4);
  assert.equal(warm.spikes, 0);
  assert.equal(progressive.spikes, 0);
  assert.ok(warm.loadSeconds > none.loadSeconds);
  assert.ok(none.worst > 150);
  assert.ok(cached.worst < none.worst);
  assert.ok(Math.max(...progressive.frames.map(f => f.ms)) < Math.max(...warm.frames.map(f => f.ms)));
});
