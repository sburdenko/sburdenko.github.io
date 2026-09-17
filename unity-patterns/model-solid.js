/**
 * SOLID change-impact model. Each principle has a "before" and "after" design from the book
 * and a list of requests. Applying a request to a design tells which existing classes must be
 * edited, which classes are added and how the program behaves.
 */

export const PRINCIPLES = ['srp', 'ocp', 'lsp', 'isp', 'dip'];

const ISP_BEFORE_MEMBERS = 14;

export const SOLID_CASES = {
  srp: {
    before: ['UnrefactoredPlayer'],
    after: ['Player', 'PlayerInput', 'PlayerMovement', 'PlayerAudio', 'PlayerFX'],
    requests: {
      input: { before: { edit: ['UnrefactoredPlayer'] }, after: { edit: ['PlayerInput'] } },
      movement: { before: { edit: ['UnrefactoredPlayer'] }, after: { edit: ['PlayerMovement'] } },
      audio: { before: { edit: ['UnrefactoredPlayer'] }, after: { edit: ['PlayerAudio'] } },
      fx: { before: { edit: ['UnrefactoredPlayer'] }, after: { edit: ['PlayerFX'] } },
    },
  },
  ocp: {
    before: ['AreaCalculator', 'Rectangle', 'Circle'],
    after: ['AreaCalculator', 'Shape', 'Rectangle', 'Circle'],
    requests: {
      triangle: { before: { edit: ['AreaCalculator'], add: ['Triangle'] }, after: { add: ['Triangle'] } },
      hexagon: { before: { edit: ['AreaCalculator'], add: ['Hexagon'] }, after: { add: ['Hexagon'] } },
    },
  },
  lsp: {
    before: ['Vehicle', 'Car', 'Truck', 'Train', 'Navigator'],
    after: ['IMovable', 'ITurnable', 'RoadVehicle', 'RailVehicle', 'Car', 'Train', 'Navigator'],
    requests: {
      car: { before: { outcome: 'ok' }, after: { outcome: 'ok' } },
      truck: { before: { outcome: 'ok' }, after: { outcome: 'ok' } },
      train: { before: { outcome: 'runtime', fail: ['Train'] }, after: { outcome: 'compile', fail: ['Navigator'] } },
    },
  },
  isp: {
    before: ['IUnitStats', 'EnemyUnit'],
    after: ['IMovable', 'IDamageable', 'IUnitStats', 'EnemyUnit'],
    requests: {
      barrel: {
        before: { stubs: ISP_BEFORE_MEMBERS - 5 + 1, edit: ['IUnitStats', 'EnemyUnit'], add: ['ExplodingBarrel'] },
        after: { stubs: 0, add: ['IExplodable', 'ExplodingBarrel'] },
      },
      crate: { before: { stubs: ISP_BEFORE_MEMBERS - 5, add: ['Crate'] }, after: { stubs: 0, add: ['Crate'] } },
    },
  },
  dip: {
    before: ['Switch', 'Door'],
    after: ['Switch', 'ISwitchable', 'Door'],
    requests: {
      door: { before: { outcome: 'ok' }, after: { outcome: 'ok' } },
      trap: { before: { edit: ['Switch'], add: ['Trap'] }, after: { add: ['Trap'] } },
      light: { before: { edit: ['Switch'], add: ['Light'] }, after: { add: ['Light'] } },
    },
  },
};

/** Result of applying one request to the before/after design of a principle. */
export function applyRequest(principle, design, request) {
  const scenario = SOLID_CASES[principle];
  const effect = scenario.requests[request][design];
  const edit = effect.edit ?? [];
  const add = effect.add ?? [];
  return {
    classes: [...scenario[design], ...add.filter(name => !scenario[design].includes(name))],
    edit,
    add,
    fail: effect.fail ?? [],
    stubs: effect.stubs ?? 0,
    outcome: effect.outcome ?? (edit.length ? 'edit' : 'ok'),
  };
}

/** Sums the cost of running every request of a principle against one design. */
export function totalImpact(principle, design) {
  const requests = Object.keys(SOLID_CASES[principle].requests);
  return requests.reduce((sum, request) => {
    const result = applyRequest(principle, design, request);
    return {
      edits: sum.edits + result.edit.length,
      stubs: sum.stubs + result.stubs,
      failures: sum.failures + (result.outcome === 'runtime' ? 1 : 0),
    };
  }, { edits: 0, stubs: 0, failures: 0 });
}
