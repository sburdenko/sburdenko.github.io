/** Полка: язык и VHS-эффекты. */
import { bootVhs } from './vhs.js?v=202610081317';
import { initI18n } from './i18n.js?v=202610081317';
import { COMMON } from './i18n-common.js?v=202610081317';
import { HUB } from './i18n-hub.js?v=202610081317';

initI18n({ ...COMMON, ...HUB });
bootVhs();
