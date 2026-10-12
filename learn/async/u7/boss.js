/** Финал раздела «Задачи без await» курса async/await. */
export default {
  id: 'as.u7.boss',
  title: 'Финал: задачи без await',
  sub: 'ContinueWith, планировщики, Parallel, таймеры и отмена',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Обработчик кнопки WPF, не внутри какой-либо задачи. Где выполнится Heavy()?',
      code: 'void OnClick(object sender, RoutedEventArgs e)\n{\n    Task.Factory.StartNew(() => Heavy());\n}',
      options: ['В пуле: вне задачи TaskScheduler.Current равен Default', 'В UI-потоке: StartNew берёт текущий SynchronizationContext', 'В UI-потоке: StartNew без планировщика берёт Current', 'В новом отдельном потоке: так по умолчанию работает StartNew'],
      answer: 0,
      explain: 'Current — планировщик выполняющейся задачи, а не контекст потока. Обработчик кнопки — не задача, поэтому Current равен Default. Ловушка срабатывает, только когда код уже внутри задачи на UI-планировщике. Надёжнее не гадать и писать Task.Run.'
    },
    {
      t: 'tapline',
      q: 'Какая строка бросит TaskCanceledException при любом исходе LoadAsync?',
      code: 'var t = LoadAsync();\nvar show = t.ContinueWith(x => Show(x.Result),\n    TaskContinuationOptions.OnlyOnRanToCompletion);\nvar log = t.ContinueWith(x => Log(x.Exception!),\n    TaskContinuationOptions.OnlyOnFaulted);\nawait Task.WhenAll(show, log);',
      answer: 5,
      explain: 'Из двух продолжений одно всегда пропускается и переходит в Canceled: при успехе — log, при ошибке — show. WhenAll с отменённой задачей тоже отменяется, и await бросает TaskCanceledException.'
    },
    {
      t: 'multi',
      q: 'Чем Task.Run(work) отличается от Task.Factory.StartNew(work)? Отметь все.',
      options: ['Task.Run всегда идёт в TaskScheduler.Default', 'Task.Run запрещает прикрепление дочерних задач', 'Task.Run разворачивает Task<Task> из async-лямбды', 'Task.Run выделяет отдельный поток под долгую работу', 'Task.Run сам подставляет токен отмены вызывающего'],
      answer: [0, 1, 2],
      explain: 'Task.Run = StartNew с DenyChildAttach, TaskScheduler.Default и Unwrap для async-лямбд. Отдельный поток даёт только LongRunning, а токен Task.Run берёт лишь тот, что передали явно.'
    },
    {
      t: 'choice',
      q: 'Внутри Task.Run библиотека создаёт задачу с AttachedToParent и бросает из неё исключение. Что увидит await на твоей задаче?',
      options: ['Ничего: ребёнок не прикрепился, его ошибка останется в его задаче', 'AggregateException с ошибкой ребёнка', 'Твоя задача будет ждать ребёнка и завершится вместе с ним', 'InvalidOperationException: прикрепиться запрещено'],
      answer: 0,
      explain: 'DenyChildAttach у задачи из Task.Run молча превращает ребёнка в независимую задачу. Ни ожидания, ни чужих исключений. Ошибка ребёнка — забота того, кто его создал.'
    },
    {
      t: 'choice',
      q: 'Нужно построить отчёт в исходном порядке строк, но посчитать тяжёлую формулу на всех ядрах. Что добавить?',
      code: 'var report = rows\n    .AsParallel()\n    // ???\n    .Select(r => Heavy(r))\n    .ToList();',
      options: ['.AsOrdered()', '.WithDegreeOfParallelism(1)', '.OrderBy(r => r)', 'Ничего: ToList сохраняет порядок'],
      answer: 0,
      explain: 'AsOrdered заставляет PLINQ вернуть результаты в исходном порядке, вычисляя их параллельно. WithDegreeOfParallelism(1) убьёт параллельность, а OrderBy отсортирует по значению, а не по позиции.'
    },
    {
      t: 'choice',
      q: 'PeriodicTimer с периодом 5 с, а работа в цикле занимает 8 с. Как пойдут запуски?',
      options: ['Сразу друг за другом: ждёт один пропущенный тик, лишние не копятся', 'Внахлёст: каждые 5 с стартует новый экземпляр', 'Каждые 10 с: пропущенный тик откладывает следующий', 'Пропущенные тики накопятся, и цикл будет их догонять'],
      answer: 0,
      explain: 'Пока работа идёт, таймер запоминает максимум один тик. Следующее ожидание завершается сразу, и работа снова занимает 8 с. Нахлёста нет: новая итерация не начнётся, пока не вернёшься к WaitForNextTickAsync.'
    },
    {
      t: 'choice',
      q: 'Фоновый поток (IsBackground = true) пишет файл в try/finally, и в этот момент завершается Main. Что с finally?',
      options: ['Не выполнится: рантайм останавливает фоновые потоки без исключения', 'Выполнится: finally выполняется всегда', 'Выполнится: при выходе в потоке поднимется ThreadAbortException', 'Процесс подождёт, пока фоновый поток допишет файл'],
      answer: 0,
      explain: 'Фоновые потоки не держат процесс. Когда кончился последний обычный поток, их обрывают на месте, finally не запускается. Для аккуратного выхода — токен отмены и ожидание работы.'
    },
    {
      t: 'blanks',
      q: 'Отмени запрос, если отменил вызывающий или прошло 10 секунд, и не оставь подписку на чужом токене',
      code: '___ var cts = CancellationTokenSource.___(ct);\ncts.___(TimeSpan.FromSeconds(10));\nreturn await FetchAsync(cts.Token);',
      tiles: ['using', 'CreateLinkedTokenSource', 'CancelAfter', 'await', 'Register', 'Cancel'],
      answer: ['using', 'CreateLinkedTokenSource', 'CancelAfter'],
      explain: 'Связанный источник отменится по любой из причин, CancelAfter добавит таймаут, а using снимет подписку на ct, когда метод закончится.'
    },
    {
      t: 'match',
      q: 'Соедини и проверь себя по всему разделу',
      pairs: [
        ['Unwrap()', 'Задача, которая ждёт внутреннюю задачу'],
        ['LongRunning', 'Отдельный поток под блокирующую работу'],
        ['ParallelLoopState.Break()', 'Доделать итерации с меньшими индексами'],
        ['ExecuteSynchronously', 'Продолжение без очереди планировщика'],
        ['CancellationToken.Register', 'Колбэк в потоке, вызвавшем Cancel']
      ]
    }
  ]
};
