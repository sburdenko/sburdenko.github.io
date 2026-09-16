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
  const reason = key === 'forward'
    ? 'The scene is simple enough that the direct path stays easy and efficient.'
    : key === 'forward-plus'
      ? 'Clustered light culling handles the light count while keeping MSAA and camera stacking.'
      : 'Many opaque lit pixels make a G-buffer worth its memory cost.';
  return { key, scores, reason };
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
    warning: pointLights > 0
      ? `Each shadowed Point Light renders six maps. ${pointLights} Point Light${pointLights > 1 ? 's' : ''} adds ${pointLights * 6}.`
      : distance > 120
        ? 'The shadow map is stretched across a large distance. Nearby shadows lose detail.'
        : cascades === 1 && distance > 70
          ? 'A long shadow distance usually benefits from 2 or 3 cascades.'
          : 'Start here, then verify the result in the target scene and on target hardware.',
  };
}

export function probeRecommendation({ dynamicObjects, largeWorld, lightingChanges }) {
  if (largeWorld || lightingChanges) {
    return {
      name: 'Adaptive Probe Volumes',
      why: largeWorld
        ? 'Automatic 3D probe placement and streaming suit a large world.'
        : 'Lighting Scenarios can blend baked probe data between states such as day and night.',
      watch: 'Fix light leaks with validity thresholds, dilation, rendering layers, and enough geometry thickness.',
    };
  }
  if (dynamicObjects) {
    return {
      name: 'Light Probes',
      why: 'A small or controlled scene can use manually placed tetrahedral probes for dynamic objects.',
      watch: 'Place probes where lighting changes, not as a uniform carpet everywhere.',
    };
  }
  return {
    name: 'Lightmaps',
    why: 'Static geometry can read baked indirect light directly from lightmaps.',
    watch: 'Baked light is diffuse; keep direct/specular contribution where the scene needs it.',
  };
}

const PASS_LIBRARY = {
  shadows: { name: 'Shadow maps', reads: ['scene'], writes: ['shadow'] },
  depth: { name: 'Depth prepass', reads: ['scene'], writes: ['depth'] },
  opaques: { name: 'Opaque draw', reads: ['scene', 'shadow'], writes: ['color', 'depth'] },
  ssao: { name: 'SSAO', reads: ['depth'], writes: ['ao'] },
  decals: { name: 'Decals', reads: ['depth', 'color'], writes: ['color'] },
  transparents: { name: 'Transparent draw', reads: ['scene', 'depth', 'color'], writes: ['color'] },
  bloom: { name: 'Bloom', reads: ['color'], writes: ['bloom'] },
  composite: { name: 'Final composite', reads: ['color', 'ao', 'bloom'], writes: ['camera'] },
};

export function buildFrameGraph({ ssao, decals, bloom }) {
  const ids = ['shadows', 'depth', 'opaques'];
  if (ssao) ids.push('ssao');
  if (decals) ids.push('decals');
  ids.push('transparents');
  if (bloom) ids.push('bloom');
  ids.push('composite');
  const passes = ids.map(id => {
    const pass = { id, ...PASS_LIBRARY[id] };
    if (id === 'composite') {
      pass.reads = ['color', ...(ssao ? ['ao'] : []), ...(bloom ? ['bloom'] : [])];
    }
    return pass;
  });
  const resources = ['shadow', 'depth', 'color', ...(ssao ? ['ao'] : []), ...(bloom ? ['bloom'] : []), 'camera']
    .map(name => {
      const touched = passes.flatMap((pass, index) => [...pass.reads, ...pass.writes].includes(name) ? [index] : []);
      return { name, first: Math.min(...touched), last: Math.max(...touched) };
    });
  return { passes, resources };
}

export function upscalingModel({ scale, stp }) {
  const pixelFraction = scale * scale;
  const outputMP = 1920 * 1080 / 1000000;
  const internalMP = outputMP * pixelFraction;
  const relativeGpu = Math.max(0.28, pixelFraction + (stp ? 0.1 : 0));
  const quality = stp
    ? scale >= 0.75 ? 'Very close to native' : scale >= 0.6 ? 'Good temporal reconstruction' : 'Visible reconstruction pressure'
    : scale >= 0.9 ? 'Near native' : scale >= 0.75 ? 'Softer image' : 'Clearly undersampled';
  return { internalMP, outputMP, relativeGpu, quality };
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
