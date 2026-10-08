/** Async, раздел 6, урок 2: WPF и WinForms. */
export default {
  id: 'as.u6.l2',
  title: 'WPF и WinForms',
  sub: 'UI-поток, Dispatcher и Task.Run',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Один поток для всех контролов',
      body: '<p>Окно рисует и обрабатывает клики один UI-поток. Контролы можно трогать только из него. await в обработчике сам возвращает тебя туда — поэтому <code>label.Text = ...</code> после await работает.</p>'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'После await обработчик пишет в label.Text. Кто-то добавил ConfigureAwait(false) — и всё упало. Почини.',
      start: { ctx: 'ui', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'done', ctx: 'ui', cfa: false },
      solve: ['cfa', 'end']
    },
    {
      t: 'choice',
      q: 'Какое исключение увидишь в WPF, если тронуть контрол из чужого потока?',
      options: ['InvalidOperationException: «The calling thread cannot access this object because a different thread owns it»', 'NullReferenceException', 'OutOfMemoryException'],
      answer: 0,
      explain: 'В WinForms — похожая InvalidOperationException о межпоточном обращении.'
    },
    {
      t: 'learn',
      title: 'Вернуться в UI-поток вручную',
      body: '<p>Если код уже в другом потоке (событие от таймера, колбэк библиотеки), попроси UI-поток выполнить работу:</p>',
      code: '// WPF\nawait Dispatcher.InvokeAsync(() => label.Content = text);\n\n// WinForms\nlabel.BeginInvoke(() => label.Text = text);'
    },
    {
      t: 'learn',
      title: 'Тяжёлые вычисления — в Task.Run',
      body: '<p>await сам по себе не уводит работу с UI-потока: синхронный код до первого await выполняется там же. Тяжёлый расчёт отдай в пул через Task.Run, а результат покажи после await.</p>',
      code: 'async void Build_Click(object s, EventArgs e)\n{\n    var mesh = await Task.Run(() => BuildMesh(points));\n    viewport.Show(mesh);          // снова UI-поток\n}'
    },
    {
      t: 'choice',
      q: 'В обработчике кнопки стоит await CalculateAsync(), но окно всё равно замирает на 3 секунды. Почему?',
      options: ['CalculateAsync считает синхронно до первого await, то есть в UI-потоке', 'await всегда замораживает окно', 'Не хватает ConfigureAwait(false)'],
      answer: 0,
      explain: 'async не делает код фоновым. Отдай расчёт в Task.Run.'
    },
    {
      t: 'order',
      q: 'Расставь, что происходит при клике',
      items: ['Обработчик стартует в UI-потоке', 'Task.Run отдаёт расчёт пулу', 'UI-поток свободен и обрабатывает клики', 'Расчёт закончился, продолжение встаёт в очередь UI', 'UI-поток показывает результат'],
      explain: 'Пока считает пул, окно живое.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['await в обработчике возвращает в UI-поток', 'Dispatcher.InvokeAsync выполняет код в UI-потоке', 'Task.Run уводит тяжёлый расчёт с UI-потока', 'Обработчик кнопки должен быть async Task'],
      answer: [0, 1, 2],
      explain: 'Сигнатуру обработчика задаёт событие — там async void допустим.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Dispatcher.InvokeAsync', 'WPF: выполнить в UI-потоке'],
        ['Control.BeginInvoke', 'WinForms: выполнить в UI-потоке'],
        ['Task.Run', 'Расчёт в пуле'],
        ['DispatcherSynchronizationContext', 'Возвращает await в UI-поток WPF']
      ]
    }
  ]
};
