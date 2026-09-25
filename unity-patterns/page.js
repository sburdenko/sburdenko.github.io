/** Tape 05 wiring: language, VHS effects and every rig. */
import { bootVhs } from '../assets/vhs.js?v=202609241230';
import { initI18n, onLang } from '../assets/i18n.js?v=202609241230';
import { COMMON } from '../assets/i18n-common.js?v=202609241230';
import { DICT } from './i18n.js?v=202609241230';
import { initMap, initSolid } from './lab-solid.js?v=202609241230';
import { initFactory, initPool, initSingleton } from './lab-creation.js?v=202609241230';
import { initCommand, initState, initObserver, initStrategy } from './lab-behavior.js?v=202609241230';
import { initUi, initFlyweight, initDirty, initLazy } from './lab-data.js?v=202609241230';
import { initChooser, initInterview } from './lab-choose.js?v=202609241230';

initI18n({ ...COMMON, ...DICT });
bootVhs();

const refreshers = [
  initMap(), initSolid(), initFactory(), initPool(), initSingleton(), initCommand(), initState(),
  initObserver(), initUi(), initStrategy(), initFlyweight(), initDirty(), initLazy(), initChooser(), initInterview(),
];
onLang(() => refreshers.forEach(render => render()));
