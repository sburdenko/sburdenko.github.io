/** Async, раздел 6, урок 1: ASP.NET Core. */
export default {
  id: 'as.u6.l1',
  title: 'ASP.NET Core',
  sub: 'Контекста нет, но блокировать всё равно нельзя',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'На сервере контекста нет',
      body: '<p>В ASP.NET Core нет SynchronizationContext: продолжение после await выполняет любой свободный поток пула. Поэтому классического deadlock от .Result здесь нет.</p><p>Старый ASP.NET (Framework) контекст имел — и там .Result зависал так же, как в WPF.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Обработчик запроса делает .Result. Дойди до конца — зависнет ли?',
      start: { ctx: 'console', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'result' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Почему здесь .Result не зависает?',
      options: ['Продолжению не нужен конкретный поток — его выполнит любой поток пула', 'Сервер быстрее', '.Result в ASP.NET Core работает как await'],
      answer: 0,
      explain: 'Нет контекста — нечего ждать главному потоку.'
    },
    {
      t: 'learn',
      title: 'Но .Result всё равно вреден',
      body: '<p>Пока запрос стоит на .Result, поток пула занят и ничего не делает. Сотня таких запросов — и пул голодает: новые запросы ждут в очереди, хотя процессор свободен. Это тот же голод пула из раздела 4.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Перепиши обработчик на await и дойди до конца.',
      start: { ctx: 'console', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'await' },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Сервер тормозит под нагрузкой, а процессор загружен на 5%. В коде много .Result. Что происходит?',
      options: ['Потоки пула заблокированы, и новым запросам не хватает потоков', 'Не хватает памяти', 'База данных медленная'],
      answer: 0,
      explain: 'Классический голод пула. Лечится await по всей цепочке.'
    },
    {
      t: 'learn',
      title: 'HttpContext живёт только во время запроса',
      body: '<p>Не уноси HttpContext и scoped-сервисы (например, DbContext) в фоновую задачу: запрос закончится, и они будут уничтожены. Скопируй нужные данные заранее, а фоновую работу отдай BackgroundService или очереди.</p>',
      code: '// плохо\n_ = Task.Run(() => Log(HttpContext.User.Identity.Name));\n\n// хорошо\nvar name = HttpContext.User.Identity.Name;\nawait _queue.EnqueueAsync(name);'
    },
    {
      t: 'tapline',
      q: 'Какая строка опасна?',
      code: 'public async Task<IActionResult> Order(int id)\n{\n    var order = await _db.Orders.FindAsync(id);\n    _ = Task.Run(() => _db.SaveChangesAsync());\n    return Ok(order);\n}',
      answer: 3,
      explain: 'DbContext уничтожат по окончании запроса, а фоновая задача ещё будет им пользоваться.'
    },
    {
      t: 'multi',
      q: 'Что правда про ASP.NET Core? Отметь все.',
      options: ['SynchronizationContext нет', '.Result не даёт классического deadlock, но блокирует поток пула', 'ConfigureAwait(false) в коде приложения ничего не меняет', 'HttpContext можно безопасно использовать после ответа'],
      answer: [0, 1, 2],
      explain: 'HttpContext после окончания запроса использовать нельзя.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['ASP.NET Core', 'Контекста нет'],
        ['ASP.NET Framework', 'Контекст был, .Result зависал'],
        ['Голод пула', 'Потоки заняты ожиданием'],
        ['BackgroundService', 'Работа вне запроса']
      ]
    }
  ]
};
