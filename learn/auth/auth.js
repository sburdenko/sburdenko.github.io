/**
 * Вход в Bathys без привязки к конкретному сервису.
 *
 * Приложение работает только с этим интерфейсом:
 *   auth.ready          — Promise, который разрешается, когда известно, вошёл ли пользователь
 *   auth.user           — null или { id, name, email, photo, provider }
 *   auth.enabled        — подключён ли настоящий провайдер
 *   auth.onChange(cb)   — подписка на вход и выход, возвращает функцию отписки
 *   auth.signIn(method) — method: 'google'; бросает ошибку с понятным текстом
 *   auth.signOut()
 *
 * Адаптер — модуль с export async function createAdapter(settings, emit), который возвращает
 * { signIn(method), signOut() } и вызывает emit(user) при каждом изменении пользователя.
 * Сменить Firebase на другой сервис — значит написать новый адаптер и поменять provider в config.js.
 */
import { AUTH_CONFIG } from './config.js?v=202610100731';

const ADAPTERS = {
  firebase: () => import('./firebase.js?v=202610100731')
};

function createAuth(config) {
  const listeners = new Set();
  let adapter = null;
  const auth = {
    user: null,
    enabled: false,
    ready: null,
    onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async signIn(method = 'google') {
      await auth.ready;
      if (!adapter) throw new Error('auth-disabled');
      return adapter.signIn(method);
    },
    async signOut() {
      await auth.ready;
      return adapter?.signOut();
    }
  };
  const emit = user => {
    auth.user = user;
    listeners.forEach(cb => cb(user));
  };
  const settings = config[config.provider];
  auth.ready = (async () => {
    if (!settings || !ADAPTERS[config.provider]) return;
    try {
      const mod = await ADAPTERS[config.provider]();
      adapter = await mod.createAdapter(settings, emit);
      auth.enabled = true;
    } catch (e) {
      console.warn('Bathys: вход не подключился', e);
    }
  })();
  return auth;
}

export const auth = createAuth(AUTH_CONFIG);
