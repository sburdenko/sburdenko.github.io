/** Async, раздел 6, урок 3: async/await в Unity. */
export default {
  id: 'as.u6.l3',
  title: 'Unity',
  sub: 'Главный поток, UnitySynchronizationContext и Awaitable',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'В Unity тоже есть контекст',
      body: '<p>Почти весь Unity API (transform, GameObject, компоненты) работает только из главного потока. Unity ставит свой <b>UnitySynchronizationContext</b>: продолжение после await выполнится в главном потоке, в ближайшем кадре.</p>'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Скрипт после await двигает transform. Запусти как есть.',
      start: { ctx: 'unity', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'error', ctx: 'unity' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Что за ошибку покажет Unity?',
      options: ['UnityException: … can only be called from the main thread', 'NullReferenceException', 'MissingReferenceException'],
      answer: 0,
      explain: 'ConfigureAwait(false) увёл продолжение в пул, а transform трогать оттуда нельзя.'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Почини: продолжение должно вернуться в главный поток.',
      start: { ctx: 'unity', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'done', ctx: 'unity', cfa: false },
      solve: ['cfa', 'end']
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Unity тоже может зависнуть. Доведи до deadlock.',
      start: { ctx: 'unity', call: 'await' }, lock: ['ctx', 'cfa'],
      goal: { status: 'deadlock', ctx: 'unity' },
      solve: ['call:result', 'end']
    },
    {
      t: 'learn',
      title: 'Awaitable — родной async в Unity',
      body: '<p>С Unity 2023.1 (и в Unity 6) есть класс <code>Awaitable</code>: дешёвые ожидания без лишних аллокаций.</p>',
      code: 'async Awaitable FlyAsync()\n{\n    await Awaitable.WaitForSecondsAsync(1f);\n    await Awaitable.BackgroundThreadAsync();  // в пул\n    var path = FindPath(map);                  // тяжёлый расчёт\n    await Awaitable.MainThreadAsync();         // обратно\n    transform.position = path[0];\n}',
      deep: 'Объекты Awaitable берутся из пула и после завершения возвращаются туда. Поэтому один Awaitable нельзя ждать дважды: второй await может получить уже чужую операцию. Если нужно ждать несколько раз — заверни в Task.'
    },
    {
      t: 'blanks',
      q: 'Посчитай в фоне, а потом подвинь объект',
      code: 'await Awaitable.___();\nvar path = FindPath(map);\nawait Awaitable.___();\ntransform.position = path[0];',
      lang: 'cs',
      tiles: ['BackgroundThreadAsync', 'MainThreadAsync', 'NextFrameAsync', 'Task.Run', 'Yield'],
      answer: ['BackgroundThreadAsync', 'MainThreadAsync'],
      explain: 'Без MainThreadAsync строка с transform упадёт.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['NextFrameAsync', 'Подождать следующий кадр'],
        ['WaitForSecondsAsync', 'Подождать игровое время'],
        ['BackgroundThreadAsync', 'Перейти в пул'],
        ['MainThreadAsync', 'Вернуться в главный поток']
      ]
    },
    {
      t: 'choice',
      q: 'Можно ли дважды сделать await одного и того же Awaitable?',
      options: ['Нет: Awaitable возвращается в пул, и повторный await непредсказуем', 'Да, как с Task', 'Да, но только в главном потоке'],
      answer: 0,
      explain: 'Это плата за отсутствие аллокаций.'
    }
  ]
};
