/** Полка: язык и VHS-эффекты. */
import { bootVhs } from './vhs.js?v=202609252015';
import { initI18n } from './i18n.js?v=202609252015';
import { COMMON } from './i18n-common.js?v=202609252015';
import { HUB } from './i18n-hub.js?v=202609252015';

initI18n({ ...COMMON, ...HUB });
bootVhs();
