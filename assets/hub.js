/** Полка: язык и VHS-эффекты. */
import { bootVhs } from './vhs.js';
import { initI18n } from './i18n.js';
import { COMMON } from './i18n-common.js';
import { HUB } from './i18n-hub.js';

initI18n({ ...COMMON, ...HUB });
bootVhs();
