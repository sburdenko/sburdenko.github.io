/**
 * Настройки входа. provider — какой адаптер подключить; его настройки лежат рядом под тем же ключом.
 * Чтобы включить вход через Google, вставь в firebase конфиг веб-приложения из консоли Firebase
 * (Project settings → Your apps → SDK setup and configuration). Эти значения не секретные:
 * доступ защищают правила Firebase и список разрешённых доменов.
 */
export const AUTH_CONFIG = {
  provider: 'firebase',
  firebase: {
    apiKey: 'AIzaSyDEVhWUOb2u_Dt-p5TVITU5oeW9ggtcapQ',
    authDomain: 'bathys-d6656.firebaseapp.com',
    projectId: 'bathys-d6656',
    storageBucket: 'bathys-d6656.firebasestorage.app',
    messagingSenderId: '374160906820',
    appId: '1:374160906820:web:80fcc421a8afff391d3a11'
  }
};
