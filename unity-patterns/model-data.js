/** MVP / MVVM update flow, Flyweight memory and Dirty Flag as pure functions. */

/* ---------------- MVP / MVVM ---------------- */

export const MAX_HEALTH = 100;

export function createHealth() {
  return { model: { current: MAX_HEALTH, label: 'Tank' }, view: { current: MAX_HEALTH, label: 'Tank' } };
}

/** Status text the book converts to: < 1/3 Danger, < 2/3 Neutral, otherwise Good. */
export function healthStatus(current) {
  const ratio = current / MAX_HEALTH;
  if (ratio < 1 / 3) return 'danger';
  if (ratio < 2 / 3) return 'neutral';
  return 'good';
}

const clampHealth = value => Math.max(0, Math.min(MAX_HEALTH, value));

/**
 * Applies a user action and returns the new model/view plus the step list the page animates.
 * MVP: the Presenter only refreshes what UpdateUI covers; LabelName is read once in OnEnable.
 * MVVM: every bound property follows the model.
 */
export function healthAction(state, mode, action) {
  const model = action.type === 'damage'
    ? { ...state.model, current: clampHealth(state.model.current - action.amount) }
    : action.type === 'restore'
      ? { ...state.model, current: MAX_HEALTH }
      : { ...state.model, label: action.label };
  const steps = mode === 'mvp' ? mvpSteps(action) : mvvmSteps(action);
  const labelFollows = mode === 'mvvm';
  const view = {
    current: model.current,
    label: labelFollows ? model.label : state.view.label,
  };
  return { state: { model, view }, steps, stale: view.label !== model.label };
}

function mvpSteps(action) {
  if (action.type === 'rename') return ['mvp.renameModel', 'mvp.noEvent'];
  const entry = action.type === 'damage' ? 'mvp.applyDamage' : 'mvp.restore';
  return [entry, 'mvp.modelChange', 'mvp.event', 'mvp.handler', 'mvp.updateUi'];
}

function mvvmSteps(action) {
  if (action.type === 'rename') return ['mvvm.renameModel', 'mvvm.bindingLabel'];
  const entry = action.type === 'damage' ? 'mvvm.applyDamage' : 'mvvm.restore';
  return [entry, 'mvvm.modelChange', 'mvvm.binding', 'mvvm.converter', 'mvvm.targets'];
}

/* ---------------- Flyweight ---------------- */

/**
 * Fields of a unit. `storage` describes what a copy costs per instance in Unity:
 *  value — copied bytes; reference — an 8-byte pointer, the target is already shared;
 *  serialized — a serialized collection that Unity duplicates for every instance.
 */
export const UNIT_FIELDS = [
  { id: 'factionName', type: 'string', storage: 'reference', bytes: 8, shareable: true },
  { id: 'factionIcon', type: 'Sprite', storage: 'reference', bytes: 8, shareable: true },
  { id: 'baseStats', type: 'int × 4', storage: 'value', bytes: 16, shareable: true },
  { id: 'swayCurve', type: 'AnimationCurve (32 keys)', storage: 'serialized', bytes: 32 * 28, shareable: true },
  { id: 'lodDistances', type: 'float[64]', storage: 'serialized', bytes: 64 * 4, shareable: true },
  { id: 'health', type: 'int', storage: 'value', bytes: 4, shareable: false },
  { id: 'position', type: 'Vector3', storage: 'value', bytes: 12, shareable: false },
];

const REFERENCE_BYTES = 8;

export function flyweightMemory({ units, shared }) {
  const sharedSet = new Set(shared);
  const perUnitDuplicated = UNIT_FIELDS.reduce((sum, field) => sum + field.bytes, 0);
  const sharedFields = UNIT_FIELDS.filter(field => field.shareable && sharedSet.has(field.id));
  const sharedBytes = sharedFields.reduce((sum, field) => sum + field.bytes, 0);
  const perUnitFlyweight = perUnitDuplicated - sharedBytes + (sharedFields.length ? REFERENCE_BYTES : 0);
  const duplicated = units * perUnitDuplicated;
  const flyweight = units * perUnitFlyweight + sharedBytes;
  const savedByField = Object.fromEntries(sharedFields.map(field => [field.id, (units - 1) * field.bytes]));
  return { duplicated, flyweight, saved: duplicated - flyweight, perUnitDuplicated, perUnitFlyweight, sharedBytes, savedByField };
}

/** Changing a base stat: shared data updates every unit, copied data needs a sync pass. */
export function editBaseAttack(units, flyweight) {
  return flyweight ? { unitsUpdated: units, unitsStale: 0, writes: 1 } : { unitsUpdated: 0, unitsStale: units, writes: units };
}

/* ---------------- Dirty flag: sector streaming ---------------- */

export const SECTOR_GRID = 3;

export function createSectors() {
  return Array.from({ length: SECTOR_GRID * SECTOR_GRID }, (_, index) => ({
    id: index,
    cx: (index % SECTOR_GRID) + 0.5,
    cy: Math.floor(index / SECTOR_GRID) + 0.5,
    loaded: false,
    dirty: false,
  }));
}

export function isPlayerClose(sector, player, radius) {
  return Math.hypot(sector.cx - player.x, sector.cy - player.y) <= radius;
}

/**
 * One GameSectors.Update. `naive` runs LoadContent/UnloadContent for every sector every frame;
 * the dirty-flag version only runs them when the proximity result disagrees with IsLoaded.
 */
export function sectorsTick(sectors, player, radius, naive) {
  let checks = 0, expensive = 0;
  const next = sectors.map(sector => {
    checks++;
    const close = isPlayerClose(sector, player, radius);
    if (naive) {
      expensive++;
      return { ...sector, loaded: close, dirty: false };
    }
    if (close === sector.loaded) return { ...sector, dirty: false };
    expensive++;
    return { ...sector, loaded: close, dirty: true };
  });
  return { sectors: next, checks, expensive };
}

/** Player path around the world, t in [0, 1). */
export function playerOnPath(t) {
  const angle = t * Math.PI * 2;
  return { x: 1.5 + Math.cos(angle) * 1.05, y: 1.5 + Math.sin(angle * 2) * 0.75 };
}

/* ---------------- Dirty flag: lazy derived value ---------------- */

/** Deterministic sequence of writes and reads for the cache lab. */
export function opSequence(length, writeShare, seed = 7) {
  let s = seed >>> 0;
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length }, () => (random() < writeShare ? 'write' : 'read'));
}

/** Eager recalculates on every write; dirty flag recalculates on the first read after any write. */
export function lazyRecalc(ops) {
  let dirty = true, eager = 0, lazy = 0;
  const marks = ops.map(op => {
    if (op === 'write') { eager++; dirty = true; return 'write'; }
    if (dirty) { lazy++; dirty = false; return 'recalc'; }
    return 'cached';
  });
  return { eager, lazy, marks };
}
