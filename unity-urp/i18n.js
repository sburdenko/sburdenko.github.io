/** Every string of tape 04, merged from the chapter dictionaries. */
import { SETUP } from './i18n-setup.js?v=202610191630';
import { LIGHT } from './i18n-light.js?v=202610191630';
import { GI } from './i18n-gi.js?v=202610191630';
import { FRAME } from './i18n-frame.js?v=202610191630';
import { OUTPUT } from './i18n-output.js?v=202610191630';
import { QA } from './i18n-qa.js?v=202610191630';

export const DICT = { ...SETUP, ...LIGHT, ...GI, ...FRAME, ...OUTPUT, ...QA };
