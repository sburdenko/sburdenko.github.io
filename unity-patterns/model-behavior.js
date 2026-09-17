/** Command, State, Observer and Strategy as pure state transitions. */

/* ---------------- Command ---------------- */

export const MAZE_SIZE = 5;
export const MAZE_WALLS = new Set(['1,0', '1,1', '3,1', '3,2', '1,3', '2,3', '3,4']);
const VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export function createCommandState(limit = 8) {
  return { start: { x: 0, y: 0 }, pos: { x: 0, y: 0 }, undo: [], redo: [], limit, dropped: 0 };
}

/** PlayerMover.IsValidMove: stays on the board and does not hit a wall. */
export function isValidMove(pos, direction) {
  const [dx, dy] = VECTORS[direction];
  const x = pos.x + dx, y = pos.y + dy;
  return x >= 0 && y >= 0 && x < MAZE_SIZE && y < MAZE_SIZE && !MAZE_WALLS.has(`${x},${y}`);
}

function move(pos, [dx, dy]) {
  return { x: pos.x + dx, y: pos.y + dy };
}

/** InputManager.RunPlayerCommand: invalid moves never become commands; a new command clears redo. */
export function executeMove(state, direction) {
  if (!isValidMove(state.pos, direction)) return { state, created: false };
  const command = { direction, vector: VECTORS[direction] };
  const undo = [...state.undo, command];
  const overflow = Math.max(0, undo.length - state.limit);
  const trimmed = undo.slice(overflow);
  const start = overflow ? state.undo.slice(0, overflow).reduce((pos, cmd) => move(pos, cmd.vector), state.start) : state.start;
  return {
    state: { ...state, pos: move(state.pos, command.vector), undo: trimmed, redo: [], start, dropped: state.dropped + overflow },
    created: true,
  };
}

export function undoMove(state) {
  if (!state.undo.length) return state;
  const command = state.undo[state.undo.length - 1];
  const [dx, dy] = command.vector;
  return { ...state, pos: move(state.pos, [-dx, -dy]), undo: state.undo.slice(0, -1), redo: [...state.redo, command] };
}

export function redoMove(state) {
  if (!state.redo.length) return state;
  const command = state.redo[state.redo.length - 1];
  return { ...state, pos: move(state.pos, command.vector), redo: state.redo.slice(0, -1), undo: [...state.undo, command] };
}

/** Positions visited when replaying the undo stack from the oldest retained command. */
export function replayPath(state) {
  return state.undo.reduce((path, command) => [...path, move(path[path.length - 1], command.vector)], [state.start]);
}

/* ---------------- State ---------------- */

export const PLAYER_STATES = ['idle', 'walk', 'jump'];
const SPEED = 4, JUMP_SPEED = 7, GRAVITY = 18, MOVING = 0.1;

export function createPlayer() {
  return { state: 'idle', x: 0, y: 0, vx: 0, vy: 0, grounded: true };
}

function nextState(player) {
  if (!player.grounded) return 'jump';
  return Math.abs(player.vx) > MOVING ? 'walk' : 'idle';
}

/**
 * One Update: physics, then CurrentState.Execute() decides the transition.
 * Returns the lifecycle calls so the page can show Exit/Enter pairs.
 */
export function tickPlayer(player, input, dt) {
  const vx = input.move * SPEED;
  const jumpNow = input.jump && player.grounded;
  const rawVy = jumpNow ? JUMP_SPEED : player.grounded ? 0 : player.vy - GRAVITY * dt;
  const rawY = player.y + rawVy * dt;
  const grounded = rawY <= 0;
  const y = grounded ? 0 : rawY;
  const vy = grounded ? 0 : rawVy;
  const moved = { ...player, x: player.x + vx * dt, y, vx, vy, grounded };
  const target = nextState(moved);
  const calls = [`${cap(player.state)}State.Execute()`];
  if (target === player.state) return { player: moved, calls, changed: false };
  return {
    player: { ...moved, state: target },
    calls: [...calls, `${cap(player.state)}State.Exit()`, `${cap(target)}State.Enter()`],
    changed: true,
  };
}

function cap(name) {
  return name[0].toUpperCase() + name.slice(1);
}

/* ---------------- Observer ---------------- */

export function createSubject(observers) {
  return { observers: observers.map(name => ({ name, subscribed: true, alive: true, received: 0 })) };
}

export function setSubscribed(subject, name, subscribed) {
  return {
    observers: subject.observers.map(o => (o.name === name && o.alive ? { ...o, subscribed } : o)),
  };
}

/** Destroy with or without the OnDisable/OnDestroy unsubscribe. */
export function destroyObserver(subject, name, unsubscribe) {
  return {
    observers: subject.observers.map(o => (o.name === name ? { ...o, alive: false, subscribed: unsubscribe ? false : o.subscribed } : o)),
  };
}

/** ThingHappened?.Invoke(): every handler still in the invocation list runs, alive or not. */
export function raise(subject) {
  const results = subject.observers
    .filter(o => o.subscribed)
    .map(o => ({ name: o.name, outcome: o.alive ? 'handled' : 'missing' }));
  return {
    subject: {
      observers: subject.observers.map(o => (o.subscribed && o.alive ? { ...o, received: o.received + 1 } : o)),
    },
    results,
  };
}

/* ---------------- Strategy ---------------- */

export const ABILITIES = {
  radar: { asset: 'RadarPulse', streak: 0 },
  firstAid: { asset: 'FirstAid', streak: 3 },
  airSupport: { asset: 'AirSupport', streak: 6 },
  shield: { asset: 'ShieldWall', streak: 9 },
};

/** The streak sample: the button shows the best ability unlocked by the current streak. */
export function abilityForStreak(streak, installed) {
  return installed
    .filter(id => ABILITIES[id].streak <= streak)
    .sort((a, b) => ABILITIES[b].streak - ABILITIES[a].streak)[0];
}

/** Adding an ability: enum + switch edits AbilityRunner, the strategy design adds one asset class. */
export function addAbilityCost(design) {
  return design === 'switch'
    ? { edited: ['AbilityRunner.Ability enum', 'AbilityRunner.ActivateAbility switch'], added: [] }
    : { edited: [], added: ['ShieldWall : Ability', 'ShieldWall.asset'] };
}
