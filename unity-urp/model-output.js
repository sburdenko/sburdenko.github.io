/** MSAA coverage, render scale / STP, PSO warm-up timeline and the diagnostic router. */

export const MSAA_PATTERNS = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  4: [[0.375, 0.125], [0.875, 0.375], [0.125, 0.625], [0.625, 0.875]],
  8: [[0.5625, 0.3125], [0.4375, 0.6875], [0.8125, 0.5625], [0.3125, 0.1875], [0.1875, 0.8125], [0.0625, 0.4375], [0.6875, 0.9375], [0.9375, 0.0625]],
};

export function msaaCoverage({ samples, pixelX = 0, pixelY = 0, slope = -0.35, edge = 1 }) {
  const mask = MSAA_PATTERNS[samples].map(([x, y]) => pixelY + y >= slope * (pixelX + x) + edge);
  const covered = mask.filter(Boolean).length;
  return { mask, covered, samples, coverage: covered / samples };
}

/** RGBA8 colour + 32-bit depth per sample, plus a single-sample resolve target above 1×. */
export function msaaCost(samples, width = 1920, height = 1080) {
  const attachmentMemoryMB = width * height * 8 * samples / 1048576;
  const resolveTargetMB = samples > 1 ? width * height * 4 / 1048576 : 0;
  return { attachmentMemoryMB, resolveTargetMB };
}

/* ---------------- Render scale and STP ---------------- */

export const OUTPUTS = { '1080p': [1920, 1080], '1440p': [2560, 1440], phone: [2400, 1080] };

/** The e-book mobile tip: 96 DPI is enough for most games, so render scale = 96 / Screen.dpi. */
export function dpiRenderScale(dpi, targetDpi = 96) {
  return Math.min(1, targetDpi / dpi);
}

export function renderScaleModel({ output, scale }) {
  const [w, h] = OUTPUTS[output];
  const internalW = Math.round(w * scale), internalH = Math.round(h * scale);
  const outputPixels = w * h, internalPixels = internalW * internalH;
  return { w, h, internalW, internalH, pixelShare: internalPixels / outputPixels, outputPixels, internalPixels };
}

/** R2 sequence jitter offsets in [-0.5, 0.5) used for temporal accumulation. */
export function jitter(index) {
  const g = 1.32471795724474602596;
  const a1 = 1 / g, a2 = 1 / (g * g);
  return [((0.5 + a1 * index) % 1) - 0.5, ((0.5 + a2 * index) % 1) - 0.5];
}

/* ---------------- PSO warm-up ---------------- */

export const PSO_TIMELINE = {
  seconds: 20,
  loadEnd: 4,
  firstUse: [
    { at: 6, count: 6 },
    { at: 9.5, count: 10 },
    { at: 13, count: 4 },
    { at: 16.5, count: 8 },
  ],
  baseFrameMs: 12,
  compileMs: 45,
  cachedMs: 4,
  progressivePerFrame: 2,
};

/**
 * Frame times for one play-through. `strategy`: none | warmup | progressive | async.
 * `cached` models a driver disk cache hit on a second run.
 */
export function psoFrames({ strategy, cached }) {
  const t = PSO_TIMELINE;
  const compile = cached ? t.cachedMs : t.compileMs;
  const total = t.firstUse.reduce((sum, item) => sum + item.count, 0);
  const frames = [];
  let time = 0, warm = 0, used = 0, spikes = 0, asyncClock = 0, loadDone = false, gameStart = 0, loadWork = 0;
  const fired = new Set();

  while (true) {
    let ms = t.baseFrameMs;
    if (!loadDone) {
      if (strategy === 'warmup' && warm < total) { ms += total * compile; warm = total; }
      if (strategy === 'progressive' && warm < total) {
        const n = Math.min(total - warm, t.progressivePerFrame);
        warm += n;
        ms += n * compile;
      }
      loadWork += t.baseFrameMs / 1000;
      const baseLoadOver = loadWork >= t.loadEnd;
      const warmupOver = strategy === 'progressive' ? warm >= total : true;
      if (baseLoadOver && warmupOver) { loadDone = true; gameStart = time; }
      frames.push({ time, ms, phase: 'load' });
      time += ms / 1000;
      continue;
    }
    const gameTime = time - gameStart + t.loadEnd;
    if (gameTime >= t.seconds) break;
    if (strategy === 'async' && warm < total) {
      asyncClock += ms / 1000;
      ms += 1.5;
      while (asyncClock >= 0.25 && warm < total) { asyncClock -= 0.25; warm++; }
    }
    t.firstUse.forEach((item, index) => {
      if (gameTime < item.at || fired.has(index)) return;
      fired.add(index);
      const needed = used + item.count;
      const missing = Math.max(0, needed - Math.max(warm, used));
      used = needed;
      if (missing) { ms += missing * compile; spikes++; warm = Math.max(warm, needed); }
    });
    frames.push({ time, ms, phase: 'play' });
    time += ms / 1000;
  }
  const play = frames.filter(f => f.phase === 'play');
  const worst = play.reduce((max, f) => Math.max(max, f.ms), 0);
  const loadSeconds = frames.filter(f => f.phase === 'load').reduce((sum, f) => sum + f.ms / 1000, 0);
  return { frames, worst, spikes, loadSeconds };
}

/* ---------------- Diagnostic router ---------------- */

export const SYMPTOMS = ['cpuDraws', 'gpuHeavy', 'hitch', 'overdraw', 'mobileHeat', 'lighting'];
