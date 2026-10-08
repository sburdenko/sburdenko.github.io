/** Async, раздел 2, урок 3: исключения. */
export default {
  id: 'as.u2.l3',
  title: 'Исключения',
  sub: 'await, .Result и AggregateException',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'await бросает как обычный код',
      body: '<p>Если задача упала, await выбросит её исключение — то самое, что бросили внутри. Ловится обычным try/catch вокруг await.</p>',
      code: 'try\n{\n    var json = await http.GetStringAsync(url);\n}\ncatch (HttpRequestException e)\n{\n    Log(e.Message);\n}'
    },
    {
      t: 'learn',
      title: '.Result и .Wait() заворачивают',
      body: '<p>Если ждать синхронно через <code>.Result</code> или <code>.Wait()</code>, исключение придёт завёрнутым в <code>AggregateException</code>, а исходное будет внутри, в InnerExceptions.</p><p><code>GetAwaiter().GetResult()</code> бросает исходное исключение, но поток всё так же блокирует.</p>'
    },
    {
      t: 'choice',
      q: 'Поймает ли этот catch ошибку сети?',
      code: 'try { var r = GetAsync().Result; }\ncatch (HttpRequestException) { … }',
      options: ['Нет: .Result бросит AggregateException, а HttpRequestException будет внутри', 'Да', 'Только в Release'],
      answer: 0,
      explain: 'Ещё одна причина не блокировать: и deadlock, и неудобные исключения.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Запусти три запроса через Task.WhenAll и урони два из них. Сколько исключений бросит await, а сколько лежит в задаче?',
      goal: { kind: 'inner', n: 2 },
      solve: ['mode:all', 'fail:A', 'fail:C']
    },
    {
      t: 'choice',
      q: 'WhenAll, упали A и C. Что бросит await?',
      options: ['Только исключение A; все ошибки лежат в Exception.InnerExceptions задачи WhenAll', 'AggregateException с обоими', 'Ничего'],
      answer: 0,
      explain: 'await разворачивает и бросает первое. Чтобы увидеть все, сохрани задачу WhenAll и посмотри её Exception.'
    },
    {
      t: 'learn',
      title: 'Забытые исключения',
      body: '<p>Если задачу никто не дождался, её исключение никто не увидит. С .NET 4.5 приложение из-за этого не падает — ошибка просто теряется (её можно поймать событием TaskScheduler.UnobservedTaskException).</p><p>Поэтому «запустил и забыл» прячет ошибки.</p>'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['await бросает исходное исключение', '.Result заворачивает его в AggregateException', 'У задачи WhenAll все ошибки лежат в Exception.InnerExceptions', 'Исключение недождавшейся задачи сразу роняет приложение', 'try/catch не работает с await'],
      answer: [0, 1, 2],
      explain: 'С await try/catch работает так же, как с синхронным кодом.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['await', 'Исходное исключение'],
        ['.Result', 'AggregateException'],
        ['GetAwaiter().GetResult()', 'Исходное, но поток заблокирован'],
        ['UnobservedTaskException', 'Ошибка задачи, которую никто не ждал']
      ]
    }
  ]
};
