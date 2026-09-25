/** Every string of tape 05, merged from the chapter dictionaries. */
import { CORE } from './i18n-core.js?v=202609252015';
import { CREATION } from './i18n-creation.js?v=202609252015';
import { BEHAVIOR } from './i18n-behavior.js?v=202609252015';
import { DATA } from './i18n-data.js?v=202609252015';
import { CHOOSE } from './i18n-choose.js?v=202609252015';

export const DICT = { ...CORE, ...CREATION, ...BEHAVIOR, ...DATA, ...CHOOSE };
