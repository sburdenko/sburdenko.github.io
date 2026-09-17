/** Factory, Object Pool and Singleton as pure state transitions. */

/* ---------------- Factory ---------------- */

export const FACTORIES = {
  A: { product: 'ProductA', effect: 'particles' },
  B: { product: 'ProductB', effect: 'sound' },
  C: { product: 'ProductC', effect: 'light' },
};

/**
 * Cost of supporting a set of products. A switch-based spawner edits one shared method per
 * product; the factory design adds one factory and one product class and never edits the client.
 */
export function factoryDesignCost(design, productIds) {
  const extra = productIds.filter(id => id !== 'A' && id !== 'B');
  if (design === 'switch') {
    return { editsToClient: extra.length, newClasses: extra.length, caseBranches: productIds.length };
  }
  return { editsToClient: 0, newClasses: extra.length * 2, caseBranches: 0 };
}

/** The call trace produced by ClickToCreate using the chosen factory. */
export function spawnTrace(factoryId, position) {
  const { product, effect } = FACTORIES[factoryId];
  return {
    product: { type: product, effect, x: position.x, y: position.y },
    calls: [
      `ClickToCreate → ConcreteFactory${factoryId}.GetProduct(${position.x}, ${position.y})`,
      `Instantiate(${product} prefab)`,
      `${product}.Initialize()`,
    ],
  };
}

/* ---------------- Object Pool (UnityEngine.Pool.ObjectPool<T> semantics) ---------------- */

export function createPoolState({ mode, prewarm = 0 }) {
  const warm = mode === 'pool' ? prewarm : 0;
  return {
    time: 0,
    nextShotAt: 0,
    nextId: 1,
    active: [],
    inactive: warm,
    created: warm,
    destroyed: 0,
    gets: 0,
    releases: 0,
    doubleRelease: false,
  };
}

function fire(state, config) {
  const bullet = { id: state.nextId, bornAt: state.time, expiresAt: state.time + config.lifetime };
  const base = { ...state, nextId: state.nextId + 1, active: [...state.active, bullet] };
  if (config.mode !== 'pool') return { ...base, created: state.created + 1 };
  if (state.inactive > 0) return { ...base, inactive: state.inactive - 1, gets: state.gets + 1 };
  return { ...base, created: state.created + 1, gets: state.gets + 1 };
}

function expire(state, config) {
  const alive = state.active.filter(bullet => bullet.expiresAt > state.time);
  const expired = state.active.length - alive.length;
  if (!expired) return state;
  if (config.mode !== 'pool') return { ...state, active: alive, destroyed: state.destroyed + expired };
  const room = Math.max(0, config.maxSize - state.inactive);
  const kept = Math.min(room, expired);
  return {
    ...state,
    active: alive,
    inactive: state.inactive + kept,
    destroyed: state.destroyed + expired - kept,
    releases: state.releases + expired,
  };
}

/** Advances the simulation by dt seconds. Shots happen at fireRate per second while `firing`. */
export function poolStep(state, config, dt) {
  let next = { ...state, time: state.time + dt };
  next = expire(next, config);
  if (!config.firing) return { ...next, nextShotAt: Math.max(next.nextShotAt, next.time) };
  const interval = 1 / config.fireRate;
  while (next.nextShotAt <= next.time) {
    next = fire(next, config);
    next = { ...next, nextShotAt: next.nextShotAt + interval };
  }
  return next;
}

/** Runs a whole scenario at a fixed step; used by tests and the summary tiles. */
export function simulatePool(config, seconds, dt = 1 / 60) {
  let state = createPoolState(config);
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) state = poolStep(state, config, dt);
  return state;
}

/** Releasing an object that is already inactive: collectionCheck throws, otherwise the pool is corrupted. */
export function releaseTwice(state, collectionCheck) {
  if (collectionCheck) return { state, error: 'InvalidOperationException' };
  return { state: { ...state, inactive: state.inactive + 1, doubleRelease: true }, error: null };
}

/* ---------------- Singleton ---------------- */

export function createSingletonWorld({ variant, managerInSceneB }) {
  return {
    variant,
    scene: 'A',
    managerInSceneB,
    objects: [{ id: 1, scene: 'A', score: 0 }],
    persistent: [],
    instance: null,
    nextId: 2,
    log: [],
  };
}

function awake(world, object) {
  const instanceAlive = world.instance !== null
    && [...world.objects, ...world.persistent].some(item => item.id === world.instance);
  if (instanceAlive) {
    return {
      ...world,
      objects: world.objects.filter(item => item.id !== object.id),
      log: [...world.log, { kind: 'warn', key: 'log.duplicate', args: [object.id] }],
    };
  }
  if (world.variant === 'persistent') {
    return {
      ...world,
      instance: object.id,
      objects: world.objects.filter(item => item.id !== object.id),
      persistent: [...world.persistent, { ...object, scene: 'DontDestroyOnLoad' }],
      log: [...world.log, { kind: 'ok', key: 'log.persist', args: [object.id] }],
    };
  }
  return { ...world, instance: object.id, log: [...world.log, { kind: 'ok', key: 'log.assign', args: [object.id] }] };
}

/** Starts the world: the manager placed in scene A runs Awake. */
export function bootSingleton(options) {
  const world = createSingletonWorld(options);
  return awake(world, world.objects[0]);
}

export function loadScene(world, scene) {
  const placed = scene === 'A' || world.managerInSceneB;
  const loaded = placed ? [{ id: world.nextId, scene, score: 0 }] : [];
  const cleared = {
    ...world,
    scene,
    objects: loaded,
    nextId: world.nextId + loaded.length,
    log: [...world.log, { kind: 'dim', key: 'log.load', args: [scene] }],
  };
  return loaded.reduce(awake, cleared);
}

function findInstance(world) {
  return [...world.objects, ...world.persistent].find(item => item.id === world.instance) ?? null;
}

/** GameManager.Instance.AddScore(): shows lazy creation, lost state and MissingReferenceException. */
export function addScore(world) {
  const target = findInstance(world);
  if (target) {
    const bump = item => (item.id === target.id ? { ...item, score: item.score + 1 } : item);
    return {
      ...world,
      objects: world.objects.map(bump),
      persistent: world.persistent.map(bump),
      log: [...world.log, { kind: 'ok', key: 'log.score', args: [target.score + 1] }],
    };
  }
  if (world.variant === 'persistent') {
    const created = { id: world.nextId, scene: 'DontDestroyOnLoad', score: 1 };
    return {
      ...world,
      instance: created.id,
      nextId: world.nextId + 1,
      persistent: [...world.persistent, created],
      log: [...world.log, { kind: 'warn', key: 'log.lazy', args: [created.id] }],
    };
  }
  const key = world.instance === null ? 'log.null' : 'log.missing';
  return { ...world, log: [...world.log, { kind: 'bad', key, args: [] }] };
}

export function currentScore(world) {
  return findInstance(world)?.score ?? null;
}
