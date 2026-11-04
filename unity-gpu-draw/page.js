/** Tape 07 wiring: language, VHS effects and every rig. */
import { bootVhs } from '../assets/vhs.js?v=202611040929';
import { initI18n, onLang } from '../assets/i18n.js?v=202611040929';
import { COMMON } from '../assets/i18n-common.js?v=202611040929';
import { DICT } from './i18n.js?v=202611040929';
import {
  initMap, initApi, initRenderParams, initNames, initTargets, initArgs, initCull, initBrg, initParticles, initLamps,
  initChooser, initInterview,
} from './lab.js?v=202611040929';

initI18n({ ...COMMON, ...DICT });
bootVhs();

const refreshers = [
  initMap(), initApi(), initRenderParams(), initNames(), initTargets(), initArgs(), initCull(), initBrg(), initParticles(),
  initLamps(), initChooser(), initInterview(),
];
onLang(() => refreshers.forEach(render => render()));
