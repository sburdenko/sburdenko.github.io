/** Maps a design pressure to the pattern the book suggests, or to "nothing yet" (KISS). */

export const PRESSURES = {
  god: 'solid',
  switchGrows: 'strategy',
  creation: 'factory',
  gcSpikes: 'pool',
  global: 'singleton',
  undo: 'command',
  modes: 'state',
  broadcast: 'observer',
  uiGlue: 'mvp',
  uiBinding: 'mvvm',
  duplicateData: 'flyweight',
  expensiveUpdate: 'dirty',
  oneCase: 'none',
};

export function recommendPattern(pressure) {
  return PRESSURES[pressure] ?? 'none';
}

export const PATTERN_CHAPTERS = {
  solid: 'solid', strategy: 'strategy', factory: 'factory', pool: 'pool', singleton: 'singleton',
  command: 'command', state: 'state', observer: 'observer', mvp: 'ui', mvvm: 'ui',
  flyweight: 'flyweight', dirty: 'dirty', none: 'map',
};
