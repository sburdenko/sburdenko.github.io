/** All tape 06 strings: { key: { en, ru } }. */
import { CORE } from './i18n-core.js?v=202610080846';
import { CH_A } from './i18n-a.js?v=202610080846';
import { CH_B } from './i18n-b.js?v=202610080846';
import { CH_C } from './i18n-c.js?v=202610080846';
import { EV_A } from './ev-a.js?v=202610080846';
import { EV_B } from './ev-b.js?v=202610080846';
import { EV_C } from './ev-c.js?v=202610080846';
import { INPUTS } from './i18n-inputs.js?v=202610080846';

export const DICT = { ...CORE, ...CH_A, ...CH_B, ...CH_C, ...EV_A, ...EV_B, ...EV_C, ...INPUTS };
