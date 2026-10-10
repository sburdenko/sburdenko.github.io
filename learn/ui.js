/** Строки интерфейса Bathys на двух языках. t('key', { n: 3 }) подставляет {n}. */
import { getLang } from './i18n.js?v=202610100741';

const S = {
  'brand.tag': { ru: 'Интерактивные курсы', en: 'Interactive courses' },
  'nav.shelf': { ru: 'Полка', en: 'Shelf' },
  'nav.profile': { ru: 'Профиль', en: 'Profile' },
  'nav.signIn': { ru: 'Войти', en: 'Sign in' },

  'page.catalog': { ru: 'Bathys — интерактивные курсы', en: 'Bathys — interactive courses' },
  'page.course': { ru: '{title} — Bathys', en: '{title} — Bathys' },
  'page.profile': { ru: 'Профиль — Bathys', en: 'Profile — Bathys' },

  'cat.kick': { ru: 'Bathys · от греческого «глубокий»', en: 'Bathys · Greek for “deep”' },
  'cat.title': { ru: 'Учись на глубину', en: 'Learn in depth' },
  'cat.lede': { ru: 'Короткие уроки по 5 минут. Ничего не нужно знать заранее: каждое слово объясняем, на каждом экране что-то делаешь сам. Опытным — раскрывающиеся блоки «Глубже».', en: 'Five-minute lessons. No prior knowledge needed: every term is explained, and on every screen you do something yourself. For experienced readers there are expandable “Go deeper” blocks.' },
  'cat.shelfTitle': { ru: 'Полка кассет', en: 'The tape shelf' },
  'cat.shelfDesc': { ru: 'Длинные интерактивные конспекты: рендер в Unity, URP, паттерны, алгоритмы для собеседований.', en: 'Long interactive notes: Unity rendering, URP, design patterns, interview algorithms.' },
  'cat.shelfGo': { ru: 'ОТКРЫТЬ ПОЛКУ ►', en: 'OPEN THE SHELF ►' },
  'cat.soon': { ru: 'Скоро', en: 'Soon' },
  'cat.start': { ru: 'НАЧАТЬ ►', en: 'START ►' },
  'cat.continue': { ru: 'ПРОДОЛЖИТЬ ►', en: 'CONTINUE ►' },
  'cat.ofLessons': { ru: '{done} из {total} уроков', en: '{done} of {total} lessons' },
  'cat.fallback': { ru: 'Пока только на русском', en: 'Russian only for now' },
  'warn.noStore': { ru: 'Браузер не даёт сохранять данные — прогресс пропадёт после перезагрузки.', en: 'Your browser does not allow saving data — progress will be lost on reload.' },
  'seg.aria': { ru: 'Пройдено уроков', en: 'Lessons completed' },

  'course.back': { ru: '← Все курсы', en: '← All courses' },
  'course.unit': { ru: 'Раздел {n}', en: 'Unit {n}' },
  'course.unitSoon': { ru: 'Раздел {n} · скоро', en: 'Unit {n} · coming soon' },
  'course.redo': { ru: 'повторить', en: 'redo' },
  'course.go0': { ru: 'НАЧАТЬ', en: 'START' },
  'course.go': { ru: 'ДАЛЬШЕ', en: 'NEXT' },
  'course.min': { ru: '{n} мин', en: '{n} min' },
  'course.source': { ru: 'По материалу {link}. Где современный .NET работает иначе, урок говорит об этом отдельно.', en: 'Based on {link}. Where modern .NET behaves differently, the lesson says so.' },
  'course.reset': { ru: 'Сбросить прогресс', en: 'Reset progress' },
  'course.later': { ru: 'Этот урок дальше по курсу — лучше идти по порядку. Всё равно открыть?', en: 'This lesson comes later in the course — it is best to go in order. Open it anyway?' },
  'course.open': { ru: 'Открыть', en: 'Open' },
  'course.resetAsk': { ru: 'Стереть весь прогресс, очки и серию?', en: 'Erase all progress, points and your streak?' },
  'course.erase': { ru: 'Стереть', en: 'Erase' },

  'ask.yes': { ru: 'Да', en: 'Yes' },
  'ask.cancel': { ru: 'Отмена', en: 'Cancel' },
  'leave.ask': { ru: 'Выйти из урока? Прогресс этого урока пропадёт.', en: 'Leave the lesson? Progress in this lesson will be lost.' },
  'leave.yes': { ru: 'Выйти', en: 'Leave' },
  'leave.stay': { ru: 'Остаться', en: 'Stay' },

  'stat.streakOn': { ru: 'Серия: {n} дн. подряд', en: 'Streak: {n} days in a row' },
  'stat.streakOff': { ru: 'Пройди урок сегодня, чтобы начать серию', en: 'Finish a lesson today to start a streak' },

  'l.exit': { ru: 'Выйти из урока', en: 'Leave the lesson' },
  'l.prev': { ru: 'Предыдущая карточка', en: 'Previous card' },
  'l.prevTitle': { ru: 'Перечитать прошлые карточки', en: 'Reread previous cards' },
  'l.progress': { ru: 'Прогресс урока', en: 'Lesson progress' },
  'l.back': { ru: '‹ Назад', en: '‹ Back' },
  'l.again': { ru: '↻ Ещё раз — исправь ошибку', en: '↻ Once more — fix the mistake' },
  'l.new': { ru: 'Новое', en: 'New' },
  'l.try': { ru: 'Попробуй сам', en: 'Try it yourself' },
  'l.done': { ru: 'Готово!', en: 'Done!' },
  'l.almost': { ru: 'Почти', en: 'Almost' },
  'l.deep': { ru: 'Глубже — для тех, кто уже программирует', en: 'Go deeper — for those who already code' },
  'l.next': { ru: 'Дальше ►', en: 'Next ►' },
  'l.gotIt': { ru: 'Понятно ►', en: 'Got it ►' },
  'l.check': { ru: 'Проверить', en: 'Check' },
  'l.doTask': { ru: 'Выполни задание', en: 'Complete the task' },
  'l.findPairs': { ru: 'Найди все пары', en: 'Find all pairs' },
  'l.praise': { ru: 'Верно!|Отлично!|Точно!|Так и есть!', en: 'Correct!|Great!|Exactly!|That’s right!' },
  'l.notQuite': { ru: 'Не совсем', en: 'Not quite' },
  'l.past': { ru: '↺ Пройдено — только для чтения', en: '↺ Done — read only' },
  'l.pastN': { ru: 'Карточка {i} из {n} пройденных', en: 'Card {i} of {n} done' },
  'l.fwd': { ru: 'Вперёд ›', en: 'Forward ›' },
  'l.toResult': { ru: 'К итогам ►', en: 'To results ►' },
  'l.toLive': { ru: 'Вернуться к уроку ►', en: 'Back to the lesson ►' },

  'r.unit': { ru: 'Раздел пройден!', en: 'Unit complete!' },
  'r.perfect': { ru: 'Без единой ошибки!', en: 'Not a single mistake!' },
  'r.lesson': { ru: 'Урок пройден!', en: 'Lesson complete!' },
  'r.record': { ru: 'Новый рекорд по звёздам.', en: 'New star record.' },
  'r.stars': { ru: '{n} из 3 звёзд', en: '{n} of 3 stars' },
  'r.accuracy': { ru: 'точность', en: 'accuracy' },
  'r.time': { ru: 'время', en: 'time' },
  'r.nextLesson': { ru: 'Следующий урок ►', en: 'Next lesson ►' },
  'r.toCourse': { ru: 'К курсу ►', en: 'To the course ►' },
  'r.toCourse2': { ru: 'К курсу', en: 'To the course' },
  'r.reread': { ru: 'Перечитать урок', en: 'Reread the lesson' },
  'r.again': { ru: 'Пройти ещё раз', en: 'Do it again' },

  'c.multi': { ru: 'Отметь все верные варианты.', en: 'Select all correct options.' },
  'c.tap': { ru: 'Нажми на строку.', en: 'Tap the line.' },
  'c.order': { ru: 'Нажимай на шаги снизу по порядку', en: 'Tap the steps below in order' },
  'c.blanks': { ru: 'Нажимай на плитки, чтобы заполнить пропуски. Нажми на пропуск, чтобы очистить его.', en: 'Tap tiles to fill the gaps. Tap a gap to clear it.' },
  'c.match': { ru: 'Нажми слово слева, потом его пару справа.', en: 'Tap a word on the left, then its pair on the right.' },
  'c.pairsSlip': { ru: 'Все пары найдены, но с ошибками.', en: 'All pairs found, with some mistakes.' },
  'c.pairsClean': { ru: 'Все пары найдены с первого раза.', en: 'All pairs found on the first try.' },
  'c.taskDone': { ru: 'Задание выполнено.', en: 'Task complete.' },
  'c.right': { ru: 'Верный ответ: «{a}».', en: 'Correct answer: “{a}”.' },
  'c.rightOrder': { ru: 'Правильный порядок: {a}', en: 'Correct order: {a}' },
  'c.rightBlanks': { ru: 'Нужно: {a}.', en: 'Needed: {a}.' },

  'p.title': { ru: 'Профиль', en: 'Profile' },
  'p.guest': { ru: 'Гость', en: 'Guest' },
  'p.guestHint': { ru: 'Прогресс хранится в этом браузере. Войди, чтобы мы знали, кто ты.', en: 'Progress is stored in this browser. Sign in so we know who you are.' },
  'p.signedHint': { ru: 'Ты вошёл через {provider}.', en: 'You are signed in with {provider}.' },
  'p.google': { ru: 'Войти через Google', en: 'Sign in with Google' },
  'p.signOut': { ru: 'Выйти из аккаунта', en: 'Sign out' },
  'p.authOff': { ru: 'Вход пока не подключён: нужен проект Firebase. Курсы работают и без входа.', en: 'Sign-in is not connected yet: a Firebase project is needed. Courses work without signing in.' },
  'p.authFail': { ru: 'Не получилось войти: {msg}', en: 'Sign-in failed: {msg}' },
  'p.lang': { ru: 'Язык', en: 'Language' },
  'p.langHint': { ru: 'Язык курсов и интерфейса. Полка кассет тоже его запомнит.', en: 'Language of courses and interface. The tape shelf remembers it too.' },
  'p.stats': { ru: 'Статистика', en: 'Stats' },
  'p.xp': { ru: 'очков опыта', en: 'XP' },
  'p.streak': { ru: 'дней подряд', en: 'day streak' },
  'p.lessons': { ru: 'уроков пройдено', en: 'lessons done' },
  'p.stars': { ru: 'звёзд собрано', en: 'stars earned' }
};

/** Строка интерфейса на текущем языке. */
export function t(key, vars = {}) {
  const e = S[key];
  if (!e) return key;
  const s = e[getLang()] ?? e.ru;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Для тестов: все ключи и языки. */
export const UI_STRINGS = S;
