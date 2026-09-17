/** Shadows, additional-light shadow atlas, mixed lighting modes and rendering layers. */

export function shadowBudget({ resolution, distance, cascades, spotLights, pointLights, soft }) {
  const mainMemoryMB = resolution * resolution * 4 / 1048576;
  const maps = cascades + spotLights + pointLights * 6;
  const relativeCost = maps * (resolution / 1024) ** 2 * (distance / 60) * (soft ? 1.28 : 1);
  const nearest = cascadeSplits(distance, cascades)[0];
  const density = resolution / Math.max(1, cascades > 1 ? nearest * 2 : distance);
  const quality = density > 36 ? 'high' : density > 18 ? 'balanced' : 'low';
  const warningKey = pointLights > 0
    ? 'shadow.warning.point'
    : distance > 120
      ? 'shadow.warning.distance'
      : cascades === 1 && distance > 70
        ? 'shadow.warning.cascades'
        : 'shadow.warning.default';
  return { mainMemoryMB, maps, relativeCost, density, quality, warningKey, warningArgs: pointLights > 0 ? [pointLights, pointLights * 6] : [] };
}

/** Teaching split: later cascades cover more distance, the last one ends at Max Distance. */
export function cascadeSplits(distance, cascades) {
  const splits = Array.from({ length: cascades }, (_, i) => Math.round(distance * ((i + 1) / cascades) ** 1.45));
  splits[splits.length - 1] = distance;
  return splits;
}

/* ---------------- Additional light shadow atlas ---------------- */

export const MAPS_PER_LIGHT = { spot: 1, point: 6 };

/** The e-book rule: 1 map → 1×1, 2–4 → 2×2, 5–16 → 4×4, then 8×8. */
export function atlasGrid(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 16) return 4;
  return 8;
}

/**
 * Lays out shadow maps for additional lights. When the required atlas (largest tier × grid) is
 * bigger than the atlas, every map is scaled down and URP warns in the console.
 */
export function atlasLayout(lights, atlasSize) {
  const maps = lights.flatMap((light, index) =>
    Array.from({ length: MAPS_PER_LIGHT[light.type] }, (_, face) => ({ light: index, face, tier: light.tier })));
  const grid = atlasGrid(maps.length);
  const largest = maps.reduce((max, map) => Math.max(max, map.tier), 0);
  const required = largest * grid;
  const scale = maps.length ? Math.min(1, atlasSize / required) : 1;
  return {
    maps: maps.map((map, i) => ({ ...map, cell: i, size: Math.floor(map.tier * scale) })),
    grid,
    required,
    scale,
    downscaled: scale < 1,
  };
}

/* ---------------- Mixed lighting ---------------- */

export const LIGHT_MODES = ['realtime', 'bakedIndirect', 'shadowmask', 'subtractive', 'baked'];

/**
 * What each mode gives, from the e-book's lightmapping chapter.
 * rt = real-time, baked = from lightmaps, probe = approximated by probes, none = missing.
 */
export const MODE_MATRIX = {
  realtime: { directStatic: 'rt', directDynamic: 'rt', indirect: 'none', staticOnStatic: 'rt', farStatic: 'none', dynamicOnStatic: 'rt', staticOnDynamic: 'rt', specular: 'rt', runtime: 3, memory: 0 },
  bakedIndirect: { directStatic: 'rt', directDynamic: 'rt', indirect: 'baked', staticOnStatic: 'rt', farStatic: 'none', dynamicOnStatic: 'rt', staticOnDynamic: 'rt', specular: 'rt', runtime: 3, memory: 1 },
  shadowmask: { directStatic: 'rt', directDynamic: 'rt', indirect: 'baked', staticOnStatic: 'rt', farStatic: 'baked', dynamicOnStatic: 'rt', staticOnDynamic: 'rt', specular: 'rt', runtime: 3, memory: 2 },
  subtractive: { directStatic: 'baked', directDynamic: 'rt', indirect: 'baked', staticOnStatic: 'baked', farStatic: 'baked', dynamicOnStatic: 'rt', staticOnDynamic: 'probe', specular: 'none', runtime: 1, memory: 1 },
  baked: { directStatic: 'baked', directDynamic: 'probe', indirect: 'baked', staticOnStatic: 'baked', farStatic: 'baked', dynamicOnStatic: 'none', staticOnDynamic: 'probe', specular: 'none', runtime: 0, memory: 1 },
};

/** Whether a dynamic character standing at `x` is darkened by the static pillar's shadow. */
export function characterInPillarShadow(mode, x, shadowStart, shadowEnd) {
  const inside = x >= shadowStart && x <= shadowEnd;
  if (!inside) return 'lit';
  const kind = MODE_MATRIX[mode].staticOnDynamic;
  return kind === 'rt' ? 'shadow' : 'probe';
}

/* ---------------- Rendering layers ---------------- */

export const LAYERS = ['Default', 'Interior', 'Highlight'];

export function layerMask(names) {
  return names.reduce((mask, name) => mask | (1 << LAYERS.indexOf(name)), 0);
}

/** A light affects a renderer only if their rendering layer masks share a bit. */
export function lightAffects(lightMask, rendererMask) {
  return (lightMask & rendererMask) !== 0;
}
