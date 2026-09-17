/** Tape 04 wiring: language, VHS effects and every rig. */
import { bootVhs } from '../assets/vhs.js?v=202609162304';
import { initI18n, onLang } from '../assets/i18n.js?v=202609162304';
import { COMMON } from '../assets/i18n-common.js?v=202609162304';
import { DICT } from './i18n.js?v=202609162304';
import { initMap, initShaderTable, initSettings, initRenderer, initMsaa, initGrd } from './lab-setup.js?v=202609162304';
import { initShadows, initAtlas, initModes, initLayers } from './lab-light.js?v=202609162304';
import { initProbes, initLeak, initEffects } from './lab-gi.js?v=202609162304';
import { initShaderSteps, initHalo, initSilhouette, initGraph, initMerge } from './lab-frame.js?v=202609162304';
import { initVolume, initStp, initPso, initDiagnostics, initInterview } from './lab-output.js?v=202609162304';

initI18n({ ...COMMON, ...DICT });
bootVhs();

const refreshers = [
  initMap(), initShaderTable(), initSettings(), initRenderer(), initMsaa(), initGrd(),
  initShadows(), initAtlas(), initModes(), initLayers(),
  initProbes(), initLeak(), initEffects(),
  initShaderSteps(), initHalo(), initSilhouette(), initGraph(), initMerge(),
  initVolume(), initStp(), initPso(), initDiagnostics(), initInterview(),
];
onLang(() => refreshers.forEach(render => render()));
