/** Where URP settings live, which renderer fits, and what the GPU Resident Drawer takes over. */

export const LOCATIONS = ['quality', 'asset', 'renderer', 'camera', 'light', 'lighting', 'graphics', 'volume'];

/** Setting → the panel that owns it in Unity 6 (from the e-book tables and the Inspector). */
export const SETTINGS = {
  'VSync Count': 'quality',
  'Texture Quality': 'quality',
  'Anisotropic Textures': 'quality',
  'Texture Streaming': 'quality',
  'Particle Raycast Budget': 'quality',
  'LOD Bias': 'quality',
  'Skin Weights': 'quality',
  'Shadowmask Mode': 'quality',
  'Render Pipeline Asset per level': 'quality',
  'Anti-aliasing (MSAA)': 'asset',
  'Render Scale': 'asset',
  'Upscaling Filter (STP)': 'asset',
  'HDR': 'asset',
  'Depth Texture': 'asset',
  'Opaque Texture': 'asset',
  'Opaque Downsampling': 'asset',
  'Main Light shadow resolution': 'asset',
  'Shadow Max Distance': 'asset',
  'Shadow Cascades': 'asset',
  'Additional Lights · Per Object Limit': 'asset',
  'Shadow Atlas Resolution': 'asset',
  'Reflection Probe Blending': 'asset',
  'Light Probe System (APV)': 'asset',
  'GPU Resident Drawer': 'asset',
  'SRP Batcher': 'asset',
  'LOD Cross Fade': 'asset',
  'LUT size': 'asset',
  'Rendering Path': 'renderer',
  'Opaque Layer Mask': 'renderer',
  'Depth Texture Mode': 'renderer',
  'Renderer Features (SSAO, Decals)': 'renderer',
  'Render Type · Base / Overlay': 'camera',
  'Camera Stack': 'camera',
  'Post Processing checkbox': 'camera',
  'TAA / SMAA / FXAA': 'camera',
  'Culling Mask': 'camera',
  'Light Mode · Realtime / Mixed / Baked': 'light',
  'Shadow Type · Soft': 'light',
  'Rendering Layers of a light': 'light',
  'Lighting Mode · Shadowmask / Subtractive': 'lighting',
  'Lightmapper · Progressive GPU': 'lighting',
  'Environment Lighting source': 'lighting',
  'Sky Occlusion': 'lighting',
  'Scriptable Render Pipeline Settings': 'graphics',
  'BatchRendererGroup Variants': 'graphics',
  'Default Volume profile': 'graphics',
  'Bloom / Vignette / Tonemapping': 'volume',
  'Screen Space Lens Flare': 'volume',
  'Motion Blur': 'volume',
};

export function settingsIn(location) {
  return Object.keys(SETTINGS).filter(name => SETTINGS[name] === location);
}

/** Deterministic quiz order so a reload does not change the question list. */
export function quizOrder(seed = 11) {
  let s = seed >>> 0;
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const names = Object.keys(SETTINGS);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  return names;
}

/* ---------------- Renderer choice ---------------- */

export const RENDERER_KEYS = ['forward', 'forwardPlus', 'deferred'];

/** Feature table of the e-book (Unity 6.0). */
export const RENDERER_FEATURES = {
  forward: { msaa: true, grd: false, vertexLighting: true, perObjectLights: 8, stacking: 'full' },
  forwardPlus: { msaa: true, grd: true, vertexLighting: false, perObjectLights: Infinity, stacking: 'full' },
  deferred: { msaa: false, grd: false, vertexLighting: false, perObjectLights: Infinity, stacking: 'baseOnly' },
};

export const CAMERA_LIGHT_LIMITS = { desktop: 256, mobile: 32, gles3: 16 };

/**
 * Hard constraints remove a renderer; soft ones only reorder. Returns every renderer with the
 * list of failed constraints, plus notes for things that still apply to the survivors.
 */
export function chooseRenderer(req) {
  const verdicts = RENDERER_KEYS.map(key => {
    const f = RENDERER_FEATURES[key];
    const failed = [];
    if (req.msaa && !f.msaa) failed.push('msaa');
    if (req.grd && !f.grd) failed.push('grd');
    if (req.vertexLighting && !f.vertexLighting) failed.push('vertexLighting');
    if (req.lightsPerObject > f.perObjectLights) failed.push('perObjectLights');
    let score = 0;
    if (key === 'forward' && req.lightsPerObject <= 4 && req.lightsOnScreen <= 8) score += 3;
    if (key === 'forwardPlus' && req.lightsOnScreen > 8) score += 3;
    if (key === 'deferred' && req.lightsOnScreen > 8) score += 2;
    if (key === 'deferred' && req.transparentShare > 40) score -= 2;
    if (key === 'deferred' && req.platform === 'mobileLow') score += 2;
    if (key === 'forwardPlus' && req.platform === 'mobileLow') score -= 2;
    if (key === 'deferred' && req.overlayCameras) score -= 1;
    return { key, failed, score };
  });
  const eligible = verdicts.filter(v => !v.failed.length).sort((a, b) => b.score - a.score);
  const notes = [];
  const limit = CAMERA_LIGHT_LIMITS[req.platform === 'desktop' ? 'desktop' : req.platform === 'gles3' ? 'gles3' : 'mobile'];
  if (req.lightsOnScreen > limit) notes.push({ key: 'cameraLimit', args: [limit] });
  if (eligible[0]?.key === 'deferred' && req.overlayCameras) notes.push({ key: 'deferredOverlay', args: [] });
  if (eligible[0]?.key === 'deferred' && req.transparentShare > 40) notes.push({ key: 'transparent', args: [] });
  if (eligible[0]?.key === 'forwardPlus') notes.push({ key: 'forwardPlusOverrides', args: [] });
  return { verdicts, best: eligible[0]?.key ?? null, notes };
}

/* ---------------- GPU Resident Drawer ---------------- */

export const GRD_REQUIREMENTS = ['forwardPlus', 'brgKeepAll', 'srpBatcher', 'compute', 'instancedDrawing'];

/**
 * Teaching estimate of batches for a scene. MeshRenderers that the drawer ingests collapse into
 * one instanced batch per unique mesh+material pair; everything else keeps one batch each.
 */
export function residentDrawer({ enabled, meshRenderers, uniquePairs, skinned, particles, occluded, occlusionCulling }) {
  const missing = GRD_REQUIREMENTS.filter(key => !enabled[key]);
  const active = missing.length === 0;
  const pairs = Math.min(uniquePairs, meshRenderers);
  const visibleShare = active && occlusionCulling ? 1 - occluded / 100 : 1;
  const before = meshRenderers + skinned + particles;
  const after = (active ? pairs : meshRenderers) + skinned + particles;
  const instancesDrawn = Math.round(meshRenderers * visibleShare);
  return { missing, active, before, after, instancesDrawn, fallback: skinned + particles };
}
