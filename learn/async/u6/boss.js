/** Финал курса async/await: платформы и всё вместе. */
export default {
  id: 'as.u6.boss',
  title: 'Финал курса',
  sub: 'Сервер, окно и игра — один механизм',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'timeline',
      task: 'Найди платформу, где .Result не зависает.',
      start: { ctx: 'ui', call: 'result' }, lock: ['call', 'cfa'],
      goal: { status: 'done', call: 'result', cfa: false },
      solve: ['ctx:console', 'end']
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Unity-скрипт после await двигает transform. Сделай так, чтобы всё работало и кадры не замирали.',
      start: { ctx: 'unity', call: 'result', cfa: true }, lock: ['ctx'],
      goal: { status: 'done', ctx: 'unity', call: 'await', cfa: false },
      solve: ['call:await', 'cfa', 'end']
    },
    {
      t: 'choice',
      q: 'Что общего у WPF и Unity в async?',
      options: ['Оба ставят SynchronizationContext, который возвращает продолжение в главный поток', 'Оба запрещают await', 'Ничего'],
      answer: 0,
      explain: 'Поэтому и .Result в обоих зависает.'
    },
    {
      t: 'multi',
      q: 'Где ConfigureAwait(false) опасен? Отметь все.',
      options: ['В WPF-обработчике, который потом меняет контрол', 'В Unity-скрипте, который потом трогает transform', 'В библиотеке HTTP-клиента', 'В контроллере ASP.NET Core'],
      answer: [0, 1],
      explain: 'В библиотеке он полезен, а в ASP.NET Core ничего не меняет.'
    },
    {
      t: 'tapline',
      q: 'В какой строке не хватает отмены?',
      code: 'async Awaitable Start()\n{\n    await Awaitable.WaitForSecondsAsync(3f);\n    transform.position = spawnPoint;\n}',
      answer: 2,
      explain: 'Без destroyCancellationToken ожидание не отменится, и следующая строка тронет уничтоженный объект.'
    },
    {
      t: 'choice',
      q: 'Сервер на ASP.NET Core под нагрузкой отвечает всё медленнее, процессор почти свободен. Первое подозрение?',
      options: ['Блокирующие .Result/.Wait() съели потоки пула', 'Медленный процессор', 'Слишком много await'],
      answer: 0,
      explain: 'Голод пула. await по всей цепочке.'
    },
    {
      t: 'order',
      q: 'Расставь путь продолжения после await в WPF',
      items: ['await захватил контекст UI', 'Операция завершилась в потоке пула', 'Продолжение отправлено в контекст (Post)', 'UI-поток взял его из очереди сообщений', 'Код после await выполнился в UI-потоке'],
      explain: 'Если UI-поток в этот момент заблокирован .Result, шаг 4 не наступит — это и есть deadlock.'
    },
    {
      t: 'match',
      q: 'Соедини платформу и её контекст',
      pairs: [
        ['WPF', 'DispatcherSynchronizationContext'],
        ['WinForms', 'WindowsFormsSynchronizationContext'],
        ['Unity', 'UnitySynchronizationContext'],
        ['ASP.NET Core', 'Контекста нет']
      ]
    },
    {
      t: 'choice',
      q: 'Главное правило всего курса?',
      options: ['Async до самого верха: не блокируй асинхронный код через .Result и .Wait()', 'Везде ставь Task.Run', 'Всегда ConfigureAwait(false)'],
      answer: 0,
      explain: 'Остальное — детали конкретной платформы.'
    }
  ]
};
