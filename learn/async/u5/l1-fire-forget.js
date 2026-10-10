/** Async, раздел 5, урок 1: async void и fire-and-forget. */
export default {
  id: 'as.u5.l1',
  title: 'Запустил и забыл',
  sub: 'Fire-and-forget, забытый await и async void',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Запустил и забыл',
      body: '<p>Вызов async-метода без await называют <b>fire-and-forget</b>. Компилятор предупредит (CS4014).</p><p>Опасность: не узнаешь, когда он закончился, и не увидишь его ошибку.</p>'
    },
    {
      t: 'tapline',
      q: 'Где забыли await?',
      code: 'public async Task SaveAllAsync()\n{\n    foreach (var o in orders)\n        SaveAsync(o);\n    await LogAsync("сохранено");\n}',
      answer: 3,
      explain: 'Сохранения запущены, но не дождались. Ошибки потеряются.'
    },
    {
      t: 'choice',
      q: 'Что окажется в логе?',
      code: 'foreach (var o in orders)\n    SaveAsync(o);\nawait LogAsync("сохранено");',
      options: ['«сохранено» — хотя сохранения ещё идут или уже упали', 'Ничего', 'Лог появится после всех сохранений'],
      answer: 0,
      explain: 'Без await код не ждёт завершения SaveAsync.'
    },
    {
      t: 'learn',
      title: 'async void роняет процесс',
      body: '<p>Исключение из async void уходит в SynchronizationContext, где метод начался. Если контекста нет (консоль, пул), оно выбрасывается в пуле потоков — и процесс падает.</p>'
    },
    {
      t: 'choice',
      q: 'Консольное приложение вызывает async void метод, который бросает исключение после await. Что будет?',
      options: ['Процесс упадёт с необработанным исключением', 'Исключение тихо потеряется', 'Его поймает try вокруг вызова'],
      answer: 0,
      explain: 'Вызов уже вернулся, try вокруг него давно закончился. Ловить исключение некому.'
    },
    {
      t: 'learn',
      title: 'Если всё же нужно запустить и забыть',
      body: '<p>Оберни задачу так, чтобы ошибка точно попала в лог. На сервере для фоновой работы используют BackgroundService или очередь.</p>',
      code: 'async Task RunSafeAsync(Func<Task> work)\n{\n    try { await work(); }\n    catch (Exception e) { log.LogError(e, "фоновая задача упала"); }\n}\n\n_ = RunSafeAsync(() => SendEmailAsync(user));'
    },
    {
      t: 'multi',
      q: 'Чем плох fire-and-forget? Отметь все.',
      options: ['Не узнать, когда задача закончилась', 'Исключения теряются', 'Задача может пережить объект или запрос, который её запустил', 'Код выполняется медленнее'],
      answer: [0, 1, 2],
      explain: 'По скорости разницы нет — всё дело в контроле.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['CS4014', 'Предупреждение: вызов без await'],
        ['async void', 'Нельзя дождаться, исключение роняет процесс'],
        ['_ = task', 'Явно «забыть» задачу'],
        ['BackgroundService', 'Фоновая работа на сервере']
      ]
    }
  ]
};
