/** Shaders, Render Objects, Render Graph and native pass merging. */

/* ---------------- Custom shader steps ---------------- */

export const SHADER_STEPS = ['unlit', 'color', 'texture', 'lit', 'shadows'];

export const SHADER_CAPS = {
  unlit: { color: false, texture: false, lambert: false, receives: false, cbuffer: false },
  color: { color: true, texture: false, lambert: false, receives: false, cbuffer: true },
  texture: { color: true, texture: true, lambert: false, receives: false, cbuffer: true },
  lit: { color: true, texture: true, lambert: true, receives: false, cbuffer: true },
  shadows: { color: true, texture: false, lambert: false, receives: true, cbuffer: true },
};

/** Lines present in `next` but not in `previous`, 1-based, for diff highlighting. */
export function addedLines(previous, next) {
  const before = new Set((previous ?? '').split('\n').map(line => line.trim()));
  return next.split('\n').flatMap((line, i) => (line.trim() && !before.has(line.trim()) ? [i + 1] : []));
}

/** Shader Graph halo from the book: Fresnel → One Minus → Power → Multiply(Strength) → Alpha. */
export function fresnelHaloAlpha(nDotV, power, strength) {
  const fresnel = 1 - Math.max(0, Math.min(1, nDotV));
  return Math.max(0, Math.min(1, Math.pow(1 - fresnel, power) * strength));
}

/** URP LightingLambert: color × saturate(dot(normal, lightDir)). */
export function lambert(normal, light) {
  return Math.max(0, normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2]);
}

/* ---------------- Render Objects silhouette ---------------- */

/**
 * One screen column over the character. `occluded` means the wall is closer to the camera there.
 * Returns what ends up in the colour buffer for that column.
 */
export function silhouetteColumn({ occluded, excludeFromOpaque, silhouettePass, depthTest, normalPass }) {
  const draws = (excludeFromOpaque ? 0 : 1) + (silhouettePass ? 1 : 0) + (normalPass ? 1 : 0);
  let result = occluded ? 'wall' : 'missing';
  if (!excludeFromOpaque && !occluded) result = 'character';
  const passesTest = depthTest === 'always' || (depthTest === 'greater' ? occluded : !occluded);
  if (silhouettePass && passesTest) result = 'silhouette';
  if (normalPass && !occluded) result = 'character';
  return { result, draws };
}

export function silhouetteSummary(options, columns = 12, wallColumns = 6) {
  const cells = Array.from({ length: columns }, (_, i) => silhouetteColumn({ ...options, occluded: i < wallColumns }));
  const doubleDraw = !options.excludeFromOpaque && options.normalPass;
  const ok = cells.every((cell, i) => cell.result === (i < wallColumns ? 'silhouette' : 'character')) && !doubleDraw;
  return { cells, doubleDraw, ok };
}

/* ---------------- Render Graph ---------------- */

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
  const ordered = resources.filter(item => item.name !== 'camera').sort((a, b) => a.first - b.first || b.sizeMB - a.sizeMB);
  const assigned = new Map();
  for (const resource of ordered) {
    let slot = slots.find(candidate => candidate.last < resource.first && candidate.sizeMB >= resource.sizeMB);
    if (!slot) {
      slot = { id: slots.length + 1, sizeMB: resource.sizeMB, last: -1, resources: [] };
      slots.push(slot);
    }
    slot.last = resource.last;
    slot.resources.push(resource.name);
    assigned.set(resource.name, slot.id);
  }
  return { slots, assigned };
}

export function buildFrameGraph({ ssao, decals, bloom, debug = false }) {
  const ids = ['shadows', 'depth', 'opaques'];
  if (ssao) ids.push('ssao');
  if (decals) ids.push('decals');
  if (debug) ids.push('debug');
  ids.push('transparents');
  if (bloom) ids.push('bloom');
  ids.push('composite');
  const declaredRaw = ids.map(id => ({
    id,
    ...PASS_LIBRARY[id],
    reads: id === 'composite' ? ['color', ...(ssao ? ['ao'] : []), ...(bloom ? ['bloom'] : [])] : PASS_LIBRARY[id].reads,
  }));

  const needed = new Set(['camera']);
  const culledIds = new Set();
  for (let index = declaredRaw.length - 1; index >= 0; index--) {
    const pass = declaredRaw[index];
    if (!pass.writes.some(resource => needed.has(resource))) culledIds.add(pass.id);
    else pass.reads.forEach(resource => needed.add(resource));
  }
  const passes = declaredRaw.filter(pass => !culledIds.has(pass.id)).map((pass, index) => ({ ...pass, culled: false, activeIndex: index }));
  const declared = declaredRaw.map(pass => passes.find(p => p.id === pass.id) ?? { ...pass, culled: true, activeIndex: undefined });
  const names = [...new Set(passes.flatMap(pass => [...pass.reads, ...pass.writes]))].filter(name => name !== 'scene');
  const baseResources = names.map(name => {
    const touched = passes.flatMap((pass, index) => ([...pass.reads, ...pass.writes].includes(name) ? [index] : []));
    return { name, sizeMB: RESOURCE_MB[name], first: Math.min(...touched), last: Math.max(...touched) };
  });
  const { slots, assigned } = assignTransientSlots(baseResources);
  const resources = baseResources.map(resource => ({ ...resource, slot: assigned.get(resource.name) }));
  const dedicatedMB = resources.filter(r => r.name !== 'camera').reduce((sum, r) => sum + r.sizeMB, 0);
  const transientMB = slots.reduce((sum, slot) => sum + slot.sizeMB, 0);
  return { declared, passes, resources, slots, culledCount: declared.length - passes.length, dedicatedMB, transientMB, savedMB: dedicatedMB - transientMB };
}

/* ---------------- Native render pass merging (mobile) ---------------- */

/**
 * Builds the main URP pass list and groups it into native render passes. A group ends when a pass
 * reads the previous attachment as a regular texture or the resolution changes.
 */
export function nativePasses({ depthTexture, depthMode, opaqueTexture, downsampling, tint, fetchSupported }) {
  const list = [{ id: 'opaques' }];
  if (depthTexture && depthMode === 'afterOpaques') list.push({ id: 'copyDepth', breaks: 'copyDepth' });
  list.push({ id: 'skybox' });
  if (opaqueTexture) list.push({ id: 'copyColor', breaks: downsampling === 'none' ? null : 'downsample' });
  list.push({ id: 'transparents' });
  if (depthTexture && depthMode === 'afterTransparents') list.push({ id: 'copyDepthLate' });
  if (tint !== 'off') {
    const fetch = tint === 'fetch' && fetchSupported;
    const reason = tint === 'fetch' ? (fetchSupported ? null : 'noFetch') : 'textureRead';
    list.push({ id: 'tintCopy', breaks: fetch ? null : reason });
    list.push({ id: 'tintFullscreen', breaks: fetch ? null : reason });
  }
  const groups = [];
  list.forEach(pass => {
    if (!groups.length || pass.breaks) groups.push({ passes: [], reason: pass.breaks ?? null });
    groups[groups.length - 1].passes.push(pass.id);
  });
  return { list, groups, merged: groups.length === 1 };
}

/* ---------------- Camera stacking ---------------- */

export function stackPaths(renderingPath, overlays) {
  const base = renderingPath;
  const overlay = renderingPath === 'deferred' ? 'forward' : renderingPath;
  return { base, overlays: Array.from({ length: overlays }, () => overlay) };
}
