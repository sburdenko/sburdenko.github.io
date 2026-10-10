/**
 * Настройки входа. provider — какой адаптер подключить; его настройки лежат рядом под тем же ключом.
 * Чтобы включить вход через Google, вставь в firebase конфиг веб-приложения из консоли Firebase
 * (Project settings → Your apps → SDK setup and configuration). Эти значения не секретные:
 * доступ защищают правила Firebase и список разрешённых доменов.
 */
export const AUTH_CONFIG = {
  provider: 'firebase',
  firebase: null
  // firebase: {
  //   apiKey: '…',
  //   authDomain: '<project>.firebaseapp.com',
  //   projectId: '<project>',
  //   appId: '…'
  // }
};
