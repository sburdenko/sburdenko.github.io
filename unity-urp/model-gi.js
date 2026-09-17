/** Light probes vs APV sampling, APV light leaks, and Volume blending. */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => Math.max(0, Math.min(1, v));

/* ---------------- Probe sampling along a corridor ---------------- */

/** Ground-truth indirect light along x in [0, 1]: a dark hangar opening onto bright daylight. */
export function corridorLight(x) {
  return lerp(0.08, 1, clamp01((x - 0.42) / 0.16));
}

/** Probe positions are placed by hand (Light Probe Group) or on a regular grid (APV). */
export function probePositions(mode, spacing = 0.1) {
  if (mode === 'group') return [0.05, 0.3, 0.45, 0.55, 0.7, 0.95];
  const count = Math.round(1 / spacing);
  return Array.from({ length: count + 1 }, (_, i) => i / count);
}

export function interpolateProbes(probes, x) {
  if (x <= probes[0]) return corridorLight(probes[0]);
  for (let i = 0; i < probes.length - 1; i++) {
    if (x <= probes[i + 1]) {
      const t = (x - probes[i]) / (probes[i + 1] - probes[i]);
      return lerp(corridorLight(probes[i]), corridorLight(probes[i + 1]), t);
    }
  }
  return corridorLight(probes[probes.length - 1]);
}

/**
 * Light Probe Group: one interpolated value for the whole renderer, sampled at its anchor (centre).
 * APV: every pixel samples the grid at its own position.
 */
export function objectLighting(mode, { start, length, samples = 24 }) {
  const probes = probePositions(mode);
  const centre = start + length / 2;
  const perObject = interpolateProbes(probes, centre);
  const values = Array.from({ length: samples }, (_, i) => {
    const x = start + (length * (i + 0.5)) / samples;
    return mode === 'group' ? perObject : interpolateProbes(probes, x);
  });
  const truth = Array.from({ length: samples }, (_, i) => corridorLight(start + (length * (i + 0.5)) / samples));
  const error = values.reduce((sum, v, i) => sum + Math.abs(v - truth[i]), 0) / samples;
  return { values, truth, error, probes };
}

/* ---------------- APV light leak through a wall ---------------- */

export const INSIDE = 0.1;
export const OUTSIDE = 1;

/**
 * 1D slice through a wall. Probes sit on a grid; a probe inside the wall sees back faces and is
 * invalid. The surface pixel is on the inner face of the wall and samples between two probes.
 */
export function leakSample({ spacing, wallThickness, normalBias, viewBias, virtualOffset, dilation, renderingLayers }) {
  const wallStart = 5.0;
  const wallEnd = wallStart + wallThickness;
  const region = x => (x < wallStart ? 'inside' : x > wallEnd ? 'outside' : 'wall');
  const valueOf = r => (r === 'inside' ? INSIDE : r === 'outside' ? OUTSIDE : 0);

  const probes = Array.from({ length: Math.ceil(12 / spacing) + 1 }, (_, i) => {
    const x = i * spacing;
    let r = region(x);
    let valid = r !== 'wall';
    if (!valid && virtualOffset) {
      r = x - wallStart < wallEnd - x ? 'inside' : 'outside';
      valid = true;
    }
    return { x, region: r, valid, value: valid ? valueOf(r) : 0 };
  });
  const dilated = probes.map((probe, i) => {
    if (probe.valid || !dilation) return probe;
    const neighbour = [probes[i - 1], probes[i + 1]].filter(p => p?.valid).sort((a, b) => Math.abs(a.x - probe.x) - Math.abs(b.x - probe.x))[0];
    return neighbour ? { ...probe, region: neighbour.region, value: neighbour.value, dilated: true } : probe;
  });

  const surface = wallStart - 0.001;
  const sampleX = Math.max(0, surface - normalBias - viewBias);
  const left = Math.min(dilated.length - 2, Math.floor(sampleX / spacing));
  const a = dilated[left], b = dilated[left + 1];
  let wa = 1 - (sampleX - a.x) / spacing, wb = 1 - wa;
  if (renderingLayers) {
    if (a.region !== 'inside') wa = 0;
    if (b.region !== 'inside') wb = 0;
    if (wa + wb === 0) { wa = 1; wb = 0; }
  }
  const total = wa + wb;
  const value = (a.value * wa + b.value * wb) / total;
  return {
    probes: dilated,
    wallStart,
    wallEnd,
    sampleX,
    used: [{ ...a, weight: wa / total }, { ...b, weight: wb / total }],
    value,
    leak: Math.max(0, value - INSIDE) / (OUTSIDE - INSIDE),
    tooDark: value < INSIDE * 0.5,
  };
}

/* ---------------- Volume framework ---------------- */

/**
 * Blends a float override the way URP's VolumeManager does: start from the default,
 * walk volumes from lowest to highest priority, lerp by weight × distance factor.
 */
export function blendVolumes(defaultValue, volumes, cameraX) {
  const ordered = [...volumes].sort((a, b) => a.priority - b.priority);
  const trace = [];
  const value = ordered.reduce((current, volume) => {
    if (!volume.override) { trace.push({ id: volume.id, factor: 0, skipped: 'override' }); return current; }
    let factor = volume.weight;
    if (!volume.global) {
      const distance = Math.max(0, volume.min - cameraX, cameraX - volume.max);
      if (distance > volume.blendDistance) { trace.push({ id: volume.id, factor: 0, skipped: 'far' }); return current; }
      factor *= volume.blendDistance > 0 ? 1 - distance / volume.blendDistance : distance === 0 ? 1 : 0;
    }
    trace.push({ id: volume.id, factor });
    return lerp(current, volume.value, clamp01(factor));
  }, defaultValue);
  return { value, trace };
}
