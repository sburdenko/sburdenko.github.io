/**
 * Адаптер входа на Firebase Authentication. Остальная платформа о Firebase не знает:
 * она видит только интерфейс из auth.js. SDK грузится с официального CDN Firebase, только когда
 * вход включён в config.js.
 */
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

/** Пользователь Firebase → пользователь Bathys. */
const toUser = u => u && {
  id: u.uid,
  name: u.displayName || u.email || 'User',
  email: u.email || '',
  photo: u.photoURL || '',
  provider: 'Google'
};

export async function createAdapter(settings, emit) {
  const [{ initializeApp }, fa] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`)
  ]);
  const app = initializeApp(settings);
  const auth = fa.getAuth(app);
  // пока не пришёл первый ответ, пользователь неизвестен — ждём его, чтобы не мигать кнопкой «Войти»
  await new Promise(resolve => {
    let first = true;
    fa.onAuthStateChanged(auth, u => {
      emit(toUser(u));
      if (first) { first = false; resolve(); }
    });
  });
  return {
    async signIn(method) {
      if (method !== 'google') throw new Error(`unknown method ${method}`);
      const provider = new fa.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await fa.signInWithPopup(auth, provider);
      } catch (e) {
        // всплывающее окно заблокировано — уходим на страницу Google и возвращаемся
        if (e?.code === 'auth/popup-blocked') return fa.signInWithRedirect(auth, provider);
        if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
        throw e;
      }
    },
    signOut: () => fa.signOut(auth)
  };
}
