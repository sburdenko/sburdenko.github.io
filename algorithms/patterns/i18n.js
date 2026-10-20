/** All tape 06 strings: { key: { en, ru } }. */
import { CORE } from './i18n-core.js?v=202610201333';
import { CH_A } from './i18n-a.js?v=202610201333';
import { CH_B } from './i18n-b.js?v=202610201333';
import { CH_C } from './i18n-c.js?v=202610201333';
import { CH_D } from './i18n-d.js?v=202610201333';
import { CH_E } from './i18n-e.js?v=202610201333';
import { CH_F } from './i18n-f.js?v=202610201333';
import { CH_GAMES } from './i18n-games.js?v=202610201333';
import { EV_A } from './ev-a.js?v=202610201333';
import { EV_B } from './ev-b.js?v=202610201333';
import { EV_C } from './ev-c.js?v=202610201333';
import { EV_D } from './ev-d.js?v=202610201333';
import { EV_E } from './ev-e.js?v=202610201333';
import { EV_F } from './ev-f.js?v=202610201333';
import { EV_GAMES } from './ev-games.js?v=202610201333';
import { INPUTS } from './i18n-inputs.js?v=202610201333';
import { CH_H } from './i18n-h.js?v=202610201333';
import { EV_H } from './ev-h.js?v=202610201333';
import { CH_ARR, P_ARR } from './i18n-arr.js?v=202610201333';
import { EV_ARR } from './ev-arr.js?v=202610201333';

export const DICT = { ...CORE, ...CH_A, ...CH_B, ...CH_C, ...CH_D, ...CH_E, ...EV_A, ...EV_B, ...EV_C, ...EV_D, ...EV_E, ...INPUTS, ...CH_F, ...EV_F, ...CH_GAMES, ...EV_GAMES, ...CH_H, ...EV_H };

/* Problems appended to existing chapters (problems-arr.js): their texts follow the chapter's own. */
Object.assign(DICT, CH_ARR, EV_ARR);
for (const [id, texts] of Object.entries(P_ARR)) {
  DICT[`${id}.p`] = { en: [...DICT[`${id}.p`].en, ...texts.en], ru: [...DICT[`${id}.p`].ru, ...texts.ru] };
}
/* Problems added to existing chapters: their texts go to the end of `${chapter}.p`, as in problems.js. */
import { P_BG, CH_BG } from './i18n-bg.js?v=202610201333';
import { EV_BG } from './ev-bg.js?v=202610201333';
Object.assign(DICT, CH_BG, EV_BG);
for (const [id, texts] of Object.entries(P_BG)) DICT[`${id}.p`] = { en: [...DICT[`${id}.p`].en, ...texts.en], ru: [...DICT[`${id}.p`].ru, ...texts.ru] };
