import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildFrameGraph,
  chooseRenderer,
  diagnose,
  probeRecommendation,
  shadowBudget,
  upscalingModel,
} from '../unity-urp/model.js';
import { DICT } from '../unity-urp/i18n.js';
import { COMMON } from '../assets/i18n-common.js';

test('every URP translation has English and Russian values of the same type', () => {
  for (const [key, entry] of Object.entries(DICT)) {
    assert.ok('en' in entry, `${key} has no English value`);
    assert.ok('ru' in entry, `${key} has no Russian value`);
    assert.equal(typeof entry.en, typeof entry.ru, `${key} changes value type between languages`);
  }
});

test('every static URP translation key in markup exists', () => {
  const html = readFileSync(new URL('../unity-urp/index.html', import.meta.url), 'utf8');
  const known = new Set([...Object.keys(COMMON), ...Object.keys(DICT)]);
  for (const match of html.matchAll(/data-i18n(?:-aria|-title)?="([^"]+)"/g)) {
    assert.ok(known.has(match[1]), `missing translation: ${match[1]}`);
  }
});

test('every literal URP translation key requested by page code exists', () => {
  const source = readFileSync(new URL('../unity-urp/page.js', import.meta.url), 'utf8');
  const known = new Set([...Object.keys(COMMON), ...Object.keys(DICT)]);
  for (const match of source.matchAll(/\bt\('([^']+)'/g)) {
    assert.ok(known.has(match[1]), `missing translation: ${match[1]}`);
  }
});

test('interview drill covers every major URP topic in both languages', () => {
  for (const lang of ['en', 'ru']) {
    const items = DICT['qa.items'][lang];
    assert.ok(items.length >= 16);
    assert.deepEqual(new Set(items.map(item => item.category)), new Set(['renderer', 'lighting', 'graph', 'performance']));
  }
});

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

test('render graph culls unused output and aliases non-overlapping resources', () => {
  const graph = buildFrameGraph({ ssao: true, decals: true, bloom: true, debug: true });
  assert.equal(graph.declared.find(pass => pass.id === 'debug').culled, true);
  assert.equal(graph.passes.some(pass => pass.id === 'debug'), false);
  assert.equal(graph.resources.some(resource => resource.name === 'debug'), false);
  assert.ok(graph.transientMB < graph.dedicatedMB);
  for (const slot of graph.slots) {
    const resources = slot.resources.map(name => graph.resources.find(resource => resource.name === name));
    for (let left = 0; left < resources.length; left++) {
      for (let right = left + 1; right < resources.length; right++) {
        assert.ok(resources[left].last < resources[right].first || resources[right].last < resources[left].first);
      }
    }
  }
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
