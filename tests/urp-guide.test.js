import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFrameGraph,
  chooseRenderer,
  diagnose,
  probeRecommendation,
  shadowBudget,
  upscalingModel,
} from '../unity-urp/model.js';

test('renderer chooser respects hard renderer constraints', () => {
  assert.equal(chooseRenderer({ lights: 5, msaa: false, transparent: 10, mobile: false }).key, 'forward');
  assert.equal(chooseRenderer({ lights: 30, msaa: true, transparent: 10, mobile: false }).key, 'forward-plus');
  assert.equal(chooseRenderer({ lights: 80, msaa: false, transparent: 5, mobile: false }).key, 'deferred');
});

test('point-light shadows add six maps per light', () => {
  const base = shadowBudget({ resolution: 1024, distance: 60, cascades: 2, spotLights: 1, pointLights: 0, soft: false });
  const point = shadowBudget({ resolution: 1024, distance: 60, cascades: 2, spotLights: 1, pointLights: 1, soft: false });
  assert.equal(point.maps - base.maps, 6);
  assert.ok(point.relativeCost > base.relativeCost);
});

test('probe chooser maps world constraints to the suitable system', () => {
  assert.equal(probeRecommendation({ dynamicObjects: true, largeWorld: false, lightingChanges: false }).name, 'Light Probes');
  assert.equal(probeRecommendation({ dynamicObjects: true, largeWorld: true, lightingChanges: false }).name, 'Adaptive Probe Volumes');
  assert.equal(probeRecommendation({ dynamicObjects: false, largeWorld: false, lightingChanges: false }).name, 'Lightmaps');
});

test('render graph resource lifetimes contain every read and write', () => {
  const graph = buildFrameGraph({ ssao: true, decals: true, bloom: true });
  for (const resource of graph.resources) {
    const touches = graph.passes.flatMap((pass, index) =>
      [...pass.reads, ...pass.writes].includes(resource.name) ? [index] : []);
    assert.equal(resource.first, Math.min(...touches));
    assert.equal(resource.last, Math.max(...touches));
  }
});

test('render graph removes disabled resources from the final composite', () => {
  const graph = buildFrameGraph({ ssao: false, decals: true, bloom: false });
  const composite = graph.passes.find(pass => pass.id === 'composite');
  assert.deepEqual(composite.reads, ['color']);
  assert.deepEqual(graph.resources.map(resource => resource.name), ['shadow', 'depth', 'color', 'camera']);
});

test('lower render scale reduces internal pixels and STP adds reconstruction cost', () => {
  const low = upscalingModel({ scale: 0.5, stp: false });
  const stp = upscalingModel({ scale: 0.5, stp: true });
  assert.ok(low.internalMP < low.outputMP);
  assert.ok(stp.relativeGpu > low.relativeGpu);
});

test('every diagnostic path gives a tool and ordered actions', () => {
  for (const id of ['too-many-draws', 'gpu-frame', 'stutter', 'overdraw']) {
    const result = diagnose(id);
    assert.ok(result.tool);
    assert.equal(result.actions.length, 3);
  }
});
