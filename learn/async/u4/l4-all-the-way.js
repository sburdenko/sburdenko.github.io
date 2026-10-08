/** Async, раздел 4, урок 4: async до самого верха. */
export default {
  id: 'as.u4.l4',
  title: 'Async до самого верха',
  sub: 'Как лечить deadlock по-настоящему',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Не смешивай',
      body: '<p>Если внутри асинхронный код, снаружи тоже должен быть await — вплоть до обработчика события или Main. Это и есть <b>async all the way</b>.</p><p>Смешивание через .Result и .Wait() называют <b>sync-over-async</b>: оно даёт и deadlock, и голодание пула.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Почини deadlock правильно: без ConfigureAwait, сделав обработчик асинхронным.',
      start: { ctx: 'ui', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', call: 'await', cfa: false, ctx: 'ui' },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Чем await лучше .Result в обработчике?',
      options: ['UI-поток не блокируется: продолжения и клики выполняются, deadlock невозможен', 'Код короче', 'Сеть отвечает быстрее'],
      answer: 0,
      explain: 'Нет заблокированного потока — нет цикла ожидания.'
    },
    {
      t: 'learn',
      title: 'async Main и async-обработчики',
      body: '<p>С C# 7.1 Main может быть <code>async Task Main()</code>. Обработчики событий — <code>async void</code>: это единственное разумное место для void. Контроллеры ASP.NET Core возвращают <code>Task&lt;IActionResult&gt;</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Где sync-over-async?',
      code: 'public IActionResult Get(int id)\n{\n    var user = _repo.GetUserAsync(id).Result;\n    return Ok(user);\n}',
      answer: 2,
      explain: '.Result держит поток пула всё время запроса к базе.'
    },
    {
      t: 'blanks',
      q: 'Исправь контроллер',
      code: 'public ___ Task<IActionResult> Get(int id)\n{\n    var user = ___ _repo.GetUserAsync(id);\n    return Ok(user);\n}',
      lang: 'cs',
      tiles: ['async', 'await', 'void', 'lock'],
      answer: ['async', 'await'],
      explain: 'async в объявлении, await перед вызовом.'
    },
    {
      t: 'learn',
      title: 'Обратная беда: async-over-sync',
      body: '<p>Обернуть синхронный блокирующий вызов в Task.Run и назвать метод …Async — обман: поток всё равно занят, просто другой.</p><p>В библиотеке так не делай: пусть вызывающий сам решит, нужен ли ему Task.Run.</p>'
    },
    {
      t: 'multi',
      q: 'Что из этого — sync-over-async? Отметь все.',
      options: ['task.Result', 'task.Wait()', 'task.GetAwaiter().GetResult()', 'await task', 'await Task.WhenAll(tasks)'],
      answer: [0, 1, 2],
      explain: 'Любое синхронное ожидание задачи блокирует поток.'
    }
  ]
};
