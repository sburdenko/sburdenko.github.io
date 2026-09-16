export const PRINCIPLES = ['srp', 'ocp', 'lsp', 'isp', 'dip'];

export function poolModel({ spawnRate, lifetime, seconds, pooling, poolSize }) {
  const spawned = Math.round(spawnRate * seconds);
  const peakAlive = Math.ceil(spawnRate * lifetime);
  if (!pooling) return { spawned, peakAlive, allocations: spawned, reused: 0, capacity: 0, misses: 0 };
  const capacity = Math.max(1, poolSize);
  const misses = Math.max(0, peakAlive - capacity);
  const allocations = Math.min(spawned, capacity + misses);
  return { spawned, peakAlive, allocations, reused: Math.max(0, spawned - allocations), capacity, misses };
}

export const STATE_TRANSITIONS = {
  idle: { move: 'move', jump: 'jump', hit: 'dead' },
  move: { stop: 'idle', jump: 'jump', attack: 'attack', hit: 'dead' },
  jump: { land: 'idle', hit: 'dead' },
  attack: { finish: 'idle', hit: 'dead' },
  dead: { respawn: 'idle' },
};

export function transitionState(state, event) {
  return STATE_TRANSITIONS[state]?.[event] || state;
}

export function flyweightMemory({ units, sharedBytes, uniqueBytes }) {
  const duplicated = units * (sharedBytes + uniqueBytes);
  const flyweight = sharedBytes + units * uniqueBytes;
  return { duplicated, flyweight, saved: duplicated - flyweight };
}

export function dirtyWork({ frames, changes, reads }) {
  const eager = frames;
  const dirty = Math.min(frames, Math.min(changes, reads));
  return { eager, dirty, saved: Math.max(0, eager - dirty) };
}

const RECOMMENDATIONS = {
  create: 'factory', reuse: 'pool', global: 'singleton', undo: 'command', modes: 'state', notify: 'observer',
  ui: 'mvvm', swap: 'strategy', memory: 'flyweight', recalc: 'dirty',
};

export function recommendPattern(problem) {
  return RECOMMENDATIONS[problem] || 'none';
}

export function applyMove(position, direction) {
  const vectors = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [dx, dy] = vectors[direction];
  return { x: Math.max(0, Math.min(4, position.x + dx)), y: Math.max(0, Math.min(4, position.y + dy)) };
}
