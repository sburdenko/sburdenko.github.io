/** Async, раздел 2, урок 5: отмена и таймауты. */
export default {
  id: 'as.u2.l5',
  title: 'Отмена и таймауты',
  sub: 'CancellationToken — вежливая просьба остановиться',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Отмена — это просьба',
      body: '<p>В .NET отмена <b>кооперативная</b>: CancellationTokenSource выдаёт токен, ты передаёшь его в методы, а они сами проверяют его и прекращают работу. Принудительно «убить» задачу нельзя.</p>',
      code: 'using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));\ntry\n{\n    var data = await http.GetStringAsync(url, cts.Token);\n}\ncatch (OperationCanceledException)\n{\n    Show("Слишком долго");\n}'
    },
    {
      t: 'choice',
      q: 'Сервер не ответил за 5 секунд. Что произойдёт?',
      options: ['Токен отменится, и GetStringAsync бросит OperationCanceledException', 'Запрос будет ждать дальше', 'Программа закроется'],
      answer: 0,
      explain: 'HttpClient бросает TaskCanceledException — это наследник OperationCanceledException.'
    },
    {
      t: 'learn',
      title: 'Свой код тоже должен слушать токен',
      body: '<p>В долгом цикле вызывай <code>token.ThrowIfCancellationRequested()</code> и передавай токен дальше во все async-методы. Иначе отмена застрянет на твоём методе.</p>'
    },
    {
      t: 'tapline',
      q: 'Где теряется отмена?',
      code: 'async Task ProcessAsync(List<Item> items, CancellationToken ct)\n{\n    foreach (var item in items)\n    {\n        ct.ThrowIfCancellationRequested();\n        await SaveAsync(item);\n    }\n}',
      answer: 5,
      explain: 'SaveAsync не получил токен: начатое сохранение не прервётся.'
    },
    {
      t: 'choice',
      q: 'Как отменить задачу, которая не принимает токен?',
      options: ['Никак напрямую: можно лишь перестать её ждать, например через WaitAsync(token)', 'Вызвать task.Abort()', 'Присвоить task = null'],
      answer: 0,
      explain: 'WaitAsync (.NET 6+) прекращает ожидание, но сама операция продолжит работу в фоне.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Отмена кооперативная', 'При отмене обычно бросается OperationCanceledException', 'CancellationTokenSource можно создать с таймаутом', 'Cancel() мгновенно останавливает любой код', 'Токен достаточно проверить в конце метода'],
      answer: [0, 1, 2],
      explain: 'Код останавливается только там, где он проверяет токен.'
    },
    {
      t: 'blanks',
      q: 'Передай отмену дальше',
      code: 'await SaveAsync(item, ___);',
      lang: 'cs',
      tiles: ['ct', 'cts', 'null', 'true'],
      answer: ['ct'],
      explain: 'В методы передают сам токен, а не источник.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['CancellationTokenSource', 'Тот, кто отменяет'],
        ['CancellationToken', 'Что передают в методы'],
        ['OperationCanceledException', 'Чем кончается отменённая операция'],
        ['WaitAsync', 'Перестать ждать по таймауту']
      ]
    }
  ]
};
