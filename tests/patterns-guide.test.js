import test from 'node:test';
import assert from 'node:assert/strict';
import { PRINCIPLES, SOLID_CASES, applyRequest, totalImpact } from '../unity-patterns/model-solid.js';
import {
  factoryDesignCost, spawnTrace, createPoolState, poolStep, simulatePool, releaseTwice,
  bootSingleton, loadScene, addScore, currentScore,
} from '../unity-patterns/model-creation.js';
import {
  createCommandState, executeMove, undoMove, redoMove, replayPath, isValidMove,
  createPlayer, tickPlayer, createSubject, setSubscribed, destroyObserver, raise,
  abilityForStreak, addAbilityCost,
} from '../unity-patterns/model-behavior.js';
import {
  createHealth, healthAction, healthStatus, flyweightMemory, editBaseAttack, UNIT_FIELDS,
  createSectors, sectorsTick, playerOnPath, opSequence, lazyRecalc,
} from '../unity-patterns/model-data.js';
import { PRESSURES, recommendPattern, PATTERN_CHAPTERS } from '../unity-patterns/model-choose.js';

test('every SOLID "after" design never edits stable code for its requests', () => {
  for (const principle of PRINCIPLES.filter(p => p !== 'srp')) {
    assert.equal(totalImpact(principle, 'after').edits, 0, principle);
    assert.equal(totalImpact(principle, 'after').stubs, 0, principle);
  }
  const srpRequests = Object.keys(SOLID_CASES.srp.requests);
  const touched = srpRequests.map(request => applyRequest('srp', 'after', request).edit.join());
  assert.equal(new Set(touched).size, srpRequests.length, 'SRP: every reason to change lands in its own class');
});

test('SOLID "before" designs show the pressure each principle removes', () => {
  assert.ok(totalImpact('ocp', 'before').edits > 0);
  assert.ok(totalImpact('dip', 'before').edits > 0);
  assert.ok(totalImpact('isp', 'before').stubs > 0);
  assert.equal(applyRequest('lsp', 'before', 'train').outcome, 'runtime');
  assert.equal(applyRequest('lsp', 'after', 'train').outcome, 'compile');
  assert.deepEqual(applyRequest('srp', 'before', 'audio').edit, applyRequest('srp', 'before', 'input').edit);
  assert.notDeepEqual(applyRequest('srp', 'after', 'audio').edit, applyRequest('srp', 'after', 'input').edit);
});

test('SOLID requests exist for both designs', () => {
  for (const principle of PRINCIPLES) {
    for (const request of Object.values(SOLID_CASES[principle].requests)) {
      assert.ok(request.before && request.after);
    }
  }
});

test('factory keeps the client closed while the switch spawner grows', () => {
  assert.equal(factoryDesignCost('factory', ['A', 'B', 'C']).editsToClient, 0);
  assert.equal(factoryDesignCost('switch', ['A', 'B', 'C']).editsToClient, 1);
  assert.equal(spawnTrace('A', { x: 1, y: 2 }).calls.at(-1), 'ProductA.Initialize()');
});

test('pool mode reuses released objects and only creates the peak', () => {
  const config = { mode: 'pool', fireRate: 10, lifetime: 1, maxSize: 100, prewarm: 0, firing: true };
  const pooled = simulatePool(config, 10);
  const raw = simulatePool({ ...config, mode: 'instantiate' }, 10);
  assert.ok(raw.created >= 100);
  assert.ok(pooled.created <= 12, `created ${pooled.created}`);
  assert.equal(pooled.destroyed, 0);
  assert.ok(raw.destroyed > 80);
});

test('maxSize destroys releases that do not fit, prewarm moves creation to load time', () => {
  const burst = { mode: 'pool', fireRate: 20, lifetime: 1, maxSize: 5, prewarm: 0, firing: true };
  const steady = simulatePool(burst, 3);
  assert.equal(steady.destroyed, 0, 'a steady stream releases one and gets one, maxSize never triggers');
  let small = steady;
  for (let i = 0; i < 120; i++) small = poolStep(small, { ...burst, firing: false }, 1 / 60);
  assert.equal(small.active.length, 0);
  assert.equal(small.inactive, 5);
  assert.ok(small.destroyed > 0);
  const warm = createPoolState({ mode: 'pool', prewarm: 30 });
  assert.equal(warm.inactive, 30);
  assert.equal(warm.created, 30);
  const after = poolStep(warm, { mode: 'pool', fireRate: 10, lifetime: 1, maxSize: 50, firing: true }, 0.5);
  assert.equal(after.created, 30);
});

test('collectionCheck turns a double release into an exception', () => {
  const state = createPoolState({ mode: 'pool', prewarm: 1 });
  assert.equal(releaseTwice(state, true).error, 'InvalidOperationException');
  assert.equal(releaseTwice(state, false).state.doubleRelease, true);
});

test('simple singleton loses state on scene load, persistent one keeps it', () => {
  const simple = addScore(addScore(bootSingleton({ variant: 'simple', managerInSceneB: true })));
  assert.equal(currentScore(simple), 2);
  assert.equal(currentScore(loadScene(simple, 'B')), 0);
  const zombie = addScore(loadScene(bootSingleton({ variant: 'simple', managerInSceneB: false }), 'B'));
  assert.equal(zombie.log.at(-1).key, 'log.missing');

  const persistent = addScore(addScore(bootSingleton({ variant: 'persistent', managerInSceneB: true })));
  const moved = loadScene(persistent, 'B');
  assert.equal(currentScore(moved), 2);
  assert.equal(moved.log.at(-1).key, 'log.duplicate');
  assert.equal(moved.objects.length, 0);
});

test('command: invalid moves are not recorded, new command clears redo, limit trims history', () => {
  let state = createCommandState(3);
  assert.equal(isValidMove(state.pos, 'up'), false);
  assert.equal(executeMove(state, 'up').created, false);
  state = executeMove(state, 'down').state;
  state = executeMove(state, 'down').state;
  state = undoMove(state);
  assert.equal(state.redo.length, 1);
  state = executeMove(state, 'down').state;
  assert.equal(state.redo.length, 0);
  state = redoMove(undoMove(state));
  assert.deepEqual(state.pos, { x: 0, y: 2 });
  for (const dir of ['down', 'down', 'right']) state = executeMove(state, dir).state;
  assert.equal(state.undo.length, 3);
  assert.deepEqual(replayPath(state).at(-1), state.pos);
});

test('state: states decide transitions and report Exit before Enter', () => {
  let player = createPlayer();
  let result = tickPlayer(player, { move: 1, jump: false }, 1 / 60);
  assert.equal(result.player.state, 'walk');
  assert.deepEqual(result.calls.slice(1), ['IdleState.Exit()', 'WalkState.Enter()']);
  result = tickPlayer(result.player, { move: 1, jump: true }, 1 / 60);
  assert.equal(result.player.state, 'jump');
  player = result.player;
  for (let i = 0; i < 120; i++) player = tickPlayer(player, { move: 0, jump: false }, 1 / 60).player;
  assert.equal(player.state, 'idle');
});

test('observer: destroyed listener that never unsubscribed is still invoked', () => {
  let subject = createSubject(['Audio', 'Particles']);
  subject = destroyObserver(subject, 'Audio', false);
  const leaked = raise(subject);
  assert.deepEqual(leaked.results.map(r => r.outcome), ['missing', 'handled']);
  const clean = raise(destroyObserver(createSubject(['Audio', 'Particles']), 'Audio', true));
  assert.deepEqual(clean.results.map(r => r.name), ['Particles']);
  const muted = raise(setSubscribed(createSubject(['Audio']), 'Audio', false));
  assert.equal(muted.results.length, 0);
});

test('strategy picks the best unlocked ability and adding one never edits the runner', () => {
  assert.equal(abilityForStreak(4, ['radar', 'firstAid', 'airSupport']), 'firstAid');
  assert.equal(addAbilityCost('strategy').edited.length, 0);
  assert.ok(addAbilityCost('switch').edited.length > 0);
});

test('MVP keeps a stale label, MVVM binding follows the model', () => {
  const start = createHealth();
  const mvp = healthAction(start, 'mvp', { type: 'rename', label: 'Scout' });
  const mvvm = healthAction(start, 'mvvm', { type: 'rename', label: 'Scout' });
  assert.equal(mvp.stale, true);
  assert.equal(mvvm.stale, false);
  assert.equal(healthAction(start, 'mvp', { type: 'damage', amount: 70 }).state.view.current, 30);
  assert.equal(healthStatus(30), 'danger');
  assert.equal(healthStatus(50), 'neutral');
  assert.equal(healthStatus(90), 'good');
});

test('flyweight saves per-instance copies and references only save pointer bytes', () => {
  const all = UNIT_FIELDS.filter(f => f.shareable).map(f => f.id);
  const memory = flyweightMemory({ units: 1000, shared: all });
  assert.ok(memory.flyweight < memory.duplicated);
  assert.equal(memory.savedByField.factionName, 999 * 8);
  assert.ok(memory.savedByField.swayCurve > memory.savedByField.factionIcon);
  const none = flyweightMemory({ units: 1000, shared: [] });
  assert.equal(none.saved, 0);
  assert.deepEqual(editBaseAttack(50, true), { unitsUpdated: 50, unitsStale: 0, writes: 1 });
});

test('dirty flag only does expensive sector work on a boundary change', () => {
  let sectors = createSectors();
  let naive = 0, dirty = 0;
  let naiveSectors = createSectors();
  for (let frame = 0; frame < 600; frame++) {
    const player = playerOnPath(frame / 600);
    const a = sectorsTick(sectors, player, 0.9, false);
    const b = sectorsTick(naiveSectors, player, 0.9, true);
    sectors = a.sectors; naiveSectors = b.sectors;
    dirty += a.expensive; naive += b.expensive;
  }
  assert.equal(naive, 600 * 9);
  assert.ok(dirty < 100, `dirty ${dirty}`);
  assert.deepEqual(sectors.map(s => s.loaded), naiveSectors.map(s => s.loaded));
});

test('lazy recalculation never exceeds reads and skips repeated writes', () => {
  const ops = opSequence(200, 0.6);
  const result = lazyRecalc(ops);
  assert.ok(result.lazy <= ops.filter(op => op === 'read').length);
  assert.deepEqual(lazyRecalc(['write', 'write', 'read', 'read']), { eager: 2, lazy: 1, marks: ['write', 'write', 'recalc', 'cached'] });
});

test('every pressure maps to a pattern with a chapter', () => {
  for (const key of Object.keys(PRESSURES)) assert.ok(PATTERN_CHAPTERS[recommendPattern(key)], key);
});
