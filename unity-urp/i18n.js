/** Every string of tape 04, merged from the chapter dictionaries. */
import { SETUP } from './i18n-setup.js?v=202610101649';
import { LIGHT } from './i18n-light.js?v=202610101649';
import { GI } from './i18n-gi.js?v=202610101649';
import { FRAME } from './i18n-frame.js?v=202610101649';
import { OUTPUT } from './i18n-output.js?v=202610101649';
import { QA } from './i18n-qa.js?v=202610101649';

export const DICT = { ...SETUP, ...LIGHT, ...GI, ...FRAME, ...OUTPUT, ...QA };
