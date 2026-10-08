/** Async, раздел 2, урок 1: первый async-метод. */
export default {
  id: 'as.u2.l1',
  title: 'Первый async-метод',
  sub: 'async, await и где метод встаёт на паузу',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Два слова',
      body: '<p><code>async</code> перед методом разрешает писать внутри <code>await</code>.</p><p><code>await</code> берёт задачу. Если она ещё не готова, метод «встаёт на паузу» и возвращает управление тому, кто его вызвал. Когда задача закончится, метод продолжит с того же места.</p>',
      code: 'async Task<int> GetLengthAsync(string url)\n{\n    string html = await http.GetStringAsync(url);\n    return html.Length;\n}'
    },
    {
      t: 'learn',
      title: 'Начало — синхронное',
      body: '<p>До первого await, который действительно ждёт, async-метод работает как обычный — в том же потоке, без всяких переключений.</p><p>А если задача уже завершена, await вообще не останавливается.</p>'
    },
    {
      t: 'choice',
      q: 'Что получит вызывающий код, когда GetLengthAsync дойдёт до await незавершённого запроса?',
      options: ['Незавершённый Task<int>', 'Число', 'null', 'Ничего — вызывающий будет ждать'],
      answer: 0,
      explain: 'Метод возвращает задачу сразу, на первой настоящей паузе. Результат придёт позже.'
    },
    {
      t: 'tapline',
      q: 'В какой строке метод может приостановиться?',
      code: 'async Task<int> CountAsync()\n{\n    var list = new List<int>();\n    var data = await LoadAsync();\n    list.AddRange(data);\n    return list.Count;\n}',
      answer: 3,
      explain: 'Пауза возможна только на await.'
    },
    {
      t: 'choice',
      q: 'return html.Length возвращает int, а метод объявлен как Task<int>. Почему так можно?',
      options: ['Компилятор сам завернёт результат в задачу', 'Это ошибка компиляции', 'int автоматически становится Task'],
      answer: 0,
      explain: 'В async-методе return задаёт результат будущей задачи.'
    },
    {
      t: 'blanks',
      q: 'Сделай метод асинхронным',
      code: '___ Task<string> LoadAsync()\n{\n    var text = ___ File.ReadAllTextAsync(path);\n    return text.Trim();\n}',
      lang: 'cs',
      tiles: ['async', 'await', 'Task', 'void', 'static'],
      answer: ['async', 'await'],
      explain: 'async в объявлении, await перед задачей.'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Один и тот же async-код: запусти его в WPF, потом в консоли. Кто выполняет продолжение?',
      start: { ctx: 'console', call: 'await' }, lock: ['call', 'cfa'],
      goal: { status: 'done', ctx: 'ui', call: 'await' },
      solve: ['end', 'ctx:ui', 'end']
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['До первого await async-метод работает синхронно', 'await уже завершённой задачи не приостанавливает метод', 'async без единого await внутри выполнится синхронно', 'async сам по себе создаёт новый поток', 'await блокирует поток'],
      answer: [0, 1, 2],
      explain: 'async не создаёт потоков и не блокирует. Это способ разрезать метод на куски вокруг ожиданий.'
    },
    {
      t: 'choice',
      q: 'Метод помечен async, но внутри нет ни одного await. Что будет?',
      options: ['Он выполнится синхронно, компилятор предупредит (CS1998)', 'Он выполнится в другом потоке', 'Ошибка компиляции'],
      answer: 0,
      explain: 'Без await нет пауз — метод отработает целиком и вернёт уже завершённую задачу.'
    }
  ]
};
