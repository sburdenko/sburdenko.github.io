/** Async, раздел 4, урок 1: SynchronizationContext. */
export default {
  id: 'as.u4.l1',
  title: 'SynchronizationContext',
  sub: 'Кто выполнит код после await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Где продолжится код после await',
      body: '<p>await запоминает текущий <b>SynchronizationContext</b>. В WPF и WinForms это «UI-поток»: продолжение встанет в очередь окна и выполнится там же, поэтому можно трогать контролы.</p><p>В консоли и ASP.NET Core контекста нет: продолжение выполнит любой поток пула.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Пройди сценарий в WPF, потом переключи на консоль и посмотри, кто выполняет продолжения.',
      start: { ctx: 'ui', call: 'await' }, lock: ['call', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'await' },
      solve: ['end', 'ctx:console', 'end']
    },
    {
      t: 'choice',
      q: 'Почему в WPF после await можно писать label.Text = …?',
      options: ['Продолжение вернулось в UI-поток через контекст синхронизации', 'WPF разрешает менять контролы из любого потока', 'await блокирует UI-поток'],
      answer: 0,
      explain: 'Это главная работа SynchronizationContext в приложениях с окном.'
    },
    {
      t: 'multi',
      q: 'Где SynchronizationContext есть по умолчанию? Отметь все.',
      options: ['WPF', 'WinForms', 'Unity', 'Консольное приложение', 'ASP.NET Core'],
      answer: [0, 1, 2],
      explain: 'В консоли и ASP.NET Core контекста нет — продолжения выполняет пул.'
    },
    {
      t: 'learn',
      title: 'Контекст — это очередь',
      body: '<p>Контекст UI — очередь: клики, перерисовка, продолжения после await. Один поток разбирает её по одному элементу.</p><p>Если этот поток занят или заблокирован, очередь стоит.</p>'
    },
    {
      t: 'choice',
      q: 'UI-поток занят долгим вычислением, а продолжение после await стоит в очереди. Когда оно выполнится?',
      options: ['Когда поток освободится и дойдёт до него', 'Сразу, в другом потоке', 'Никогда'],
      answer: 0,
      explain: 'Продолжение ждёт свою очередь, как и клики.'
    },
    {
      t: 'learn',
      title: 'Когда контекста нет',
      body: '<p>Если SynchronizationContext не задан, await смотрит на текущий TaskScheduler. По умолчанию это пул потоков.</p>',
      deep: 'SynchronizationContext.Current и TaskScheduler.Current проверяются в момент await. Свой контекст ставят через SynchronizationContext.SetSynchronizationContext — так тестовые фреймворки и Unity делают однопоточное выполнение продолжений.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['WPF', 'DispatcherSynchronizationContext'],
        ['WinForms', 'WindowsFormsSynchronizationContext'],
        ['Unity', 'UnitySynchronizationContext'],
        ['ASP.NET Core', 'Контекста нет']
      ]
    }
  ]
};
