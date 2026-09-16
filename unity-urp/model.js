/** Pure teaching models for the URP field guide. Values are relative, not benchmarks. */

export const RENDERERS = {
  forward: {
    name: 'Forward',
    idea: 'Shade each object as it is drawn.',
    wins: ['MSAA', 'Simple scenes', 'Camera stacking', 'Vertex lighting'],
    costs: ['Many lights scale poorly', '9 real-time lights per object'],
  },
  'forward-plus': {
    name: 'Forward+',
    idea: 'Cull lights into screen-space clusters, then shade forward.',
    wins: ['Many lights', 'MSAA', 'GPU Resident Drawer', 'Camera stacking'],
    costs: ['More setup than Forward', 'Per-camera light limit still applies'],
  },
  deferred: {
    name: 'Deferred',
    idea: 'Write geometry into G-buffers first, then calculate lighting.',
    wins: ['Many lights', 'Complex lit scenes', 'Lighting cost is per pixel'],
    costs: ['No MSAA', 'More memory', 'Transparent objects still use Forward'],
  },
};

export function chooseRenderer({ lights, msaa, transparent, mobile }) {
  const scores = { forward: 0, 'forward-plus': 0, deferred: 0 };
  if (lights <= 8) scores.forward += 4;
  if (lights > 8) { scores['forward-plus'] += 5; scores.deferred += 4; }
  if (lights > 40) scores.deferred += 3;
  if (msaa) { scores.forward += 3; scores['forward-plus'] += 4; scores.deferred -= 8; }
  if (transparent > 45) { scores.forward += 2; scores['forward-plus'] += 3; scores.deferred -= 2; }
  if (mobile) { scores.forward += 2; scores['forward-plus'] += 2; scores.deferred -= 2; }
  const key = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  return { key, scores, reasonKey: `renderer.reason.${key}` };
}

export function shadowBudget({ resolution, distance, cascades, spotLights, pointLights, soft }) {
  const mainMemoryMB = resolution * resolution * 4 / 1048576;
  const maps = cascades + spotLights + pointLights * 6;
  const relativeCost = maps * (resolution / 1024) ** 2 * (distance / 60) * (soft ? 1.28 : 1);
  const density = resolution / Math.max(1, distance);
  const quality = density > 36 ? 'high' : density > 18 ? 'balanced' : 'soft / unstable';
  return {
    mainMemoryMB,
    maps,
    relativeCost,
    density,
    quality,
    warningKey: pointLights > 0
      ? 'shadow.warning.point'
      : distance > 120
        ? 'shadow.warning.distance'
        : cascades === 1 && distance > 70
          ? 'shadow.warning.cascades'
          : 'shadow.warning.default',
    warningArgs: pointLights > 0 ? [pointLights, pointLights * 6] : [],
  };
}

export function probeRecommendation({ dynamicObjects, largeWorld, lightingChanges }) {
  if (largeWorld || lightingChanges) {
    return {
      key: 'apv',
      name: 'Adaptive Probe Volumes',
      why: largeWorld
        ? 'Automatic 3D probe placement and streaming suit a large world.'
        : 'Lighting Scenarios can blend baked probe data between states such as day and night.',
      watch: 'Fix light leaks with validity thresholds, dilation, rendering layers, and enough geometry thickness.',
    };
  }
  if (dynamicObjects) {
    return {
      key: 'probes',
      name: 'Light Probes',
      why: 'A small or controlled scene can use manually placed tetrahedral probes for dynamic objects.',
      watch: 'Place probes where lighting changes, not as a uniform carpet everywhere.',
    };
  }
  return {
    key: 'lightmaps',
    name: 'Lightmaps',
    why: 'Static geometry can read baked indirect light directly from lightmaps.',
    watch: 'Baked light is diffuse; keep direct/specular contribution where the scene needs it.',
  };
}

const PASS_LIBRARY = {
  shadows: { reads: ['scene'], writes: ['shadow'] },
  depth: { reads: ['scene'], writes: ['depth'] },
  opaques: { reads: ['scene', 'shadow'], writes: ['color', 'depth'] },
  ssao: { reads: ['depth'], writes: ['ao'] },
  decals: { reads: ['depth', 'color'], writes: ['color'] },
  debug: { reads: ['depth'], writes: ['debug'] },
  transparents: { reads: ['scene', 'depth', 'color'], writes: ['color'] },
  bloom: { reads: ['color'], writes: ['bloom'] },
  composite: { reads: ['color', 'ao', 'bloom'], writes: ['camera'] },
};

const RESOURCE_MB = { shadow: 16, depth: 8, color: 16, ao: 4, debug: 4, bloom: 8, camera: 16 };

function assignTransientSlots(resources) {
  const slots = [];
  for (const resource of resources.filter(item => item.name !== 'camera').sort((a, b) => a.first - b.first || b.sizeMB - a.sizeMB)) {
    let slot = slots.find(candidate => candidate.last < resource.first && candidate.sizeMB >= resource.sizeMB);
    if (!slot) {
      slot = { id: slots.length + 1, sizeMB: resource.sizeMB, last: -1, resources: [] };
      slots.push(slot);
    }
    slot.last = resource.last;
    slot.sizeMB = Math.max(slot.sizeMB, resource.sizeMB);
    slot.resources.push(resource.name);
    resource.slot = slot.id;
  }
  return slots;
}

export function buildFrameGraph({ ssao, decals, bloom, debug = false }) {
  const ids = ['shadows', 'depth', 'opaques'];
  if (ssao) ids.push('ssao');
  if (decals) ids.push('decals');
  if (debug) ids.push('debug');
  ids.push('transparents');
  if (bloom) ids.push('bloom');
  ids.push('composite');
  const declared = ids.map(id => {
    const pass = { id, ...PASS_LIBRARY[id] };
    if (id === 'composite') {
      pass.reads = ['color', ...(ssao ? ['ao'] : []), ...(bloom ? ['bloom'] : [])];
    }
    return pass;
  });

  const needed = new Set(['camera']);
  for (let index = declared.length - 1; index >= 0; index--) {
    const pass = declared[index];
    pass.culled = !pass.writes.some(resource => needed.has(resource));
    if (!pass.culled) pass.reads.forEach(resource => needed.add(resource));
  }
  const passes = declared.filter(pass => !pass.culled).map((pass, index) => ({ ...pass, activeIndex: index }));
  const activeIndices = new Map(passes.map(pass => [pass.id, pass.activeIndex]));
  declared.forEach(pass => { pass.activeIndex = activeIndices.get(pass.id); });
  const resourceNames = [...new Set(passes.flatMap(pass => [...pass.reads, ...pass.writes]))].filter(name => name !== 'scene');
  const resources = resourceNames
    .map(name => {
      const touched = passes.flatMap((pass, index) => [...pass.reads, ...pass.writes].includes(name) ? [index] : []);
      return { name, sizeMB: RESOURCE_MB[name], first: Math.min(...touched), last: Math.max(...touched) };
    });
  const slots = assignTransientSlots(resources);
  const peaks = passes.map((_, index) => resources
    .filter(resource => resource.name !== 'camera' && index >= resource.first && index <= resource.last)
    .reduce((sum, resource) => sum + resource.sizeMB, 0));
  const dedicatedMB = resources.filter(resource => resource.name !== 'camera').reduce((sum, resource) => sum + resource.sizeMB, 0);
  const transientMB = slots.reduce((sum, slot) => sum + slot.sizeMB, 0);
  return {
    declared,
    passes,
    resources,
    slots,
    culledCount: declared.length - passes.length,
    peakMB: Math.max(...peaks),
    dedicatedMB,
    transientMB,
    savedMB: dedicatedMB - transientMB,
  };
}

export function upscalingModel({ scale, stp }) {
  const pixelFraction = scale * scale;
  const outputMP = 1920 * 1080 / 1000000;
  const internalMP = outputMP * pixelFraction;
  const relativeGpu = Math.max(0.28, pixelFraction + (stp ? 0.1 : 0));
  const qualityKey = stp
    ? scale >= 0.75 ? 'stp.quality.close' : scale >= 0.6 ? 'stp.quality.good' : 'stp.quality.pressure'
    : scale >= 0.9 ? 'stp.quality.native' : scale >= 0.75 ? 'stp.quality.soft' : 'stp.quality.under';
  return { internalMP, outputMP, relativeGpu, qualityKey };
}

export const DIAGNOSES = {
  'too-many-draws': {
    tool: 'Frame Debugger',
    first: 'Inspect draw calls and SetPass changes one event at a time.',
    actions: ['Check material and shader variant changes', 'Verify SRP Batcher compatibility', 'Evaluate GPU Resident Drawer in Forward+'],
  },
  'gpu-frame': {
    tool: 'Profiler + GPU module',
    first: 'Confirm the frame is GPU-bound before lowering visual quality.',
    actions: ['Reduce shadow distance/resolution', 'Disable unused depth or opaque textures', 'Measure post-processing passes individually'],
  },
  stutter: {
    tool: 'Profiler · GraphicsPipelineImpl markers',
    first: 'Check whether new PSOs are created during the hitch.',
    actions: ['Trace representative gameplay into a GraphicsStateCollection', 'Precook during loading or asynchronously', 'Retest after driver/OS cache invalidation'],
  },
  overdraw: {
    tool: 'Rendering Debugger / Frame Debugger',
    first: 'Find transparent layers and full-screen passes that repeatedly shade the same pixels.',
    actions: ['Reduce large transparent overlap', 'Question full-screen effects', 'Use occlusion culling for blocked static geometry'],
  },
};

export function diagnose(id) {
  return DIAGNOSES[id];
}
