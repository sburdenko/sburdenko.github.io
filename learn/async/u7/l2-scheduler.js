/** Async, раздел «Задачи без await», урок 2: TaskScheduler, StartNew против Task.Run, дочерние задачи. */
export default {
  id: 'as.u7.l2',
  title: 'Планировщик и StartNew',
  sub: 'TaskScheduler, TaskCreationOptions и дочерние задачи',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Кто выполняет задачу: TaskScheduler',
      body: '<p>Задача, у которой есть делегат, сама себя не запускает. Её отдают <b>планировщику задач</b> (TaskScheduler), а он решает, где и когда её выполнить:</p><ul><li><code>TaskScheduler.Default</code> — пул потоков;</li><li><code>FromCurrentSynchronizationContext()</code> — в текущий контекст, например в UI-поток;</li><li><code>ConcurrentExclusiveSchedulerPair</code> — готовая пара для ограничения: «не больше N сразу» и «строго по одной».</li></ul><p>У задач из async-методов и <code>TaskCompletionSource</code> делегата нет: их не выполняют, а <b>завершают</b> снаружи (как в разделе 1). Планировщик им не нужен.</p>',
      code: 'TaskScheduler pool = TaskScheduler.Default;\nTaskScheduler ui = TaskScheduler.FromCurrentSynchronizationContext();\n\nvar pair = new ConcurrentExclusiveSchedulerPair(\n    TaskScheduler.Default, maxConcurrencyLevel: 4);\nTaskScheduler four = pair.ConcurrentScheduler;   // не больше 4 сразу\nTaskScheduler one = pair.ExclusiveScheduler;     // строго по одной, «четвёрка» ждёт',
      deep: '<p>Свой планировщик наследует <code>TaskScheduler</code> и реализует три метода: <code>QueueTask</code> (принять задачу), <code>TryExecuteTaskInline</code> (можно ли выполнить прямо сейчас в этом потоке) и <code>GetScheduledTasks</code> (для отладчика).</p><p>Встраивание (inlining) случается, например, при <code>Wait()</code> на ещё не начатой задаче: ждущий поток может выполнить её сам вместо того, чтобы стоять. Ещё деталь: если <code>SynchronizationContext</code> нет, а <code>TaskScheduler.Current</code> не Default, <code>await</code> вернётся именно на него. Код под <code>ConcurrentExclusiveSchedulerPair</code> так и остаётся под ним после await.</p>'
    },
    {
      t: 'choice',
      q: 'Какая задача не проходит через TaskScheduler вообще?',
      options: ['Задача, которую вернул async-метод', 'Задача из Task.Run', 'Задача из Task.Factory.StartNew', 'Задача продолжения из ContinueWith'],
      answer: 0,
      explain: 'Задача async-метода — обещание без делегата: её завершает построитель машины состояний. Остальные три несут делегат, и его кто-то должен выполнить — это и есть работа планировщика.'
    },
    {
      t: 'learn',
      title: 'Task.Run — это StartNew с правильными настройками',
      body: '<p><code>Task.Run</code> появился в .NET 4.5 как короткая запись для самого частого случая. Он равен <code>StartNew</code> с тремя явными решениями: без токена, без прикрепления детей, строго в пул. А для async-лямбды он ещё и делает <code>Unwrap</code>.</p><p>«Голый» <code>Task.Factory.StartNew(work)</code> отличается во всём: планировщик <code>Current</code> (ловушка из прошлого урока), флаги <code>None</code>, без разворачивания.</p><p><code>StartNew</code> нужен, когда требуются его возможности: свой планировщик, <code>LongRunning</code>, объект состояния без замыкания.</p>',
      code: 'Task.Run(work);\n\n// почти то же самое:\nTask.Factory.StartNew(work,\n    CancellationToken.None,\n    TaskCreationOptions.DenyChildAttach,\n    TaskScheduler.Default);\n// + для Func<Task> Task.Run сам вызывает Unwrap'
    },
    {
      t: 'choice',
      q: 'Что напечатает этот код?',
      code: 'var sw = Stopwatch.StartNew();\nawait Task.Factory.StartNew(async () => await Task.Delay(1000));\nConsole.WriteLine(sw.ElapsedMilliseconds);',
      options: ['Около 0', 'Около 1000', 'Около 2000', 'Не скомпилируется: StartNew не принимает async-лямбду'],
      answer: 0,
      explain: 'StartNew вернул Task<Task>. Внешняя задача завершилась, когда лямбда дошла до первого await и вернула внутреннюю. await подождал только это. С Task.Run было бы около 1000.'
    },
    {
      t: 'learn',
      title: 'TaskCreationOptions',
      body: '<p>Флаги при создании задачи — подсказки планировщику и правила для родства:</p><ul><li><code>LongRunning</code> — работа надолго. Планировщик по умолчанию даёт ей <b>отдельный поток</b>, а не поток пула: пул не теряет исполнителя и не ждёт, пока доберёт новые потоки;</li><li><code>PreferFairness</code> — в глобальную очередь пула, а не в локальную очередь текущего потока: ближе к порядку «кто раньше пришёл»;</li><li><code>AttachedToParent</code> и <code>DenyChildAttach</code> — родство задач, о них дальше;</li><li><code>HideScheduler</code> — внутри задачи <code>TaskScheduler.Current</code> выглядит как Default;</li><li><code>RunContinuationsAsynchronously</code> — как у <code>TaskCompletionSource</code> в разделе 5.</li></ul>',
      deep: '<p>В планировщике по умолчанию <code>LongRunning</code> устроен буквально: создаётся <code>new Thread(…) { IsBackground = true }</code>, он выполняет одну задачу и завершается. Создание потока — это объект ОС и резерв под стек, порядка десятков микросекунд и больше. Для коротких задач флаг вреден.</p><p>Это только подсказка: свой планировщик может её проигнорировать. А с async-лямбдой отдельный поток живёт лишь до первой настоящей паузы.</p>'
    },
    {
      t: 'choice',
      q: 'Сколько проживёт отдельный поток, выделенный под LongRunning?',
      code: 'Task.Factory.StartNew(async () =>\n{\n    while (true)\n    {\n        var msg = await queue.ReadAsync();\n        Handle(msg);\n    }\n}, TaskCreationOptions.LongRunning);',
      options: ['До первой настоящей паузы в await', 'Пока крутится цикл, то есть всегда', 'Нисколько: с async-лямбдой флаг выдаёт ошибку', 'Пока сборщик мусора не соберёт задачу'],
      answer: 0,
      explain: 'Делегат — async-лямбда. На первом незавершённом await она возвращает задачу, и поток свободен — он завершается. Цикл дальше идёт в потоках пула. Отдельный поток создали зря. Для такого цикла LongRunning не нужен: он и так не держит поток.'
    },
    {
      t: 'learn',
      title: 'Дочерние задачи: AttachedToParent',
      body: '<p>Задача, созданная <b>внутри выполняющейся задачи</b> с флагом <code>AttachedToParent</code>, становится её ребёнком:</p><ul><li>родитель не завершится, пока не завершатся все дети. Пока ждёт — статус <code>WaitingForChildrenToComplete</code>;</li><li>исключения детей попадают в <code>AggregateException</code> родителя.</li></ul><p>Без флага вложенная задача независима (detached): родитель о ней ничего не знает.</p><p>Это модель «структурного параллелизма» из .NET 4.0. В новом коде то же самое делают явно: собирают задачи и ждут их через <code>WhenAll</code>.</p>',
      deep: '<p>Как это работает: при создании задача смотрит, какая задача сейчас выполняется в этом потоке. Если стоит <code>AttachedToParent</code> и у той нет <code>DenyChildAttach</code>, у родителя увеличивается счётчик незавершённых детей. Родитель, закончив свой делегат, уменьшает счётчик на себя; каждый ребёнок при завершении — на себя. Ноль — родитель завершён.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var parent = Task.Factory.StartNew(() =>\n{\n    Task.Factory.StartNew(() =>\n    {\n        Thread.Sleep(500);\n        Console.WriteLine("child");\n    }, TaskCreationOptions.AttachedToParent);\n    Console.WriteLine("parent");\n});\nparent.Wait();\nConsole.WriteLine("done");',
      options: ['parent, child, done', 'parent, done, child', 'child, parent, done', 'done, parent, child'],
      answer: 0,
      explain: 'Ребёнок прикреплён: Wait на родителе ждёт и его. «parent» печатается сразу, «child» — через 500 мс, и только потом родитель завершён и печатается «done».'
    },
    {
      t: 'learn',
      title: 'Почему Task.Run ставит DenyChildAttach',
      body: '<p>Прицепиться решает <b>ребёнок</b>, то есть чужой код. Представь: внутри твоего <code>Task.Run</code> библиотека создала задачу с <code>AttachedToParent</code>. Твоя задача внезапно ждёт чужую работу и получает чужие исключения — а ты об этом не просил.</p><p>Флаг <code>DenyChildAttach</code> у родителя молча отменяет такие просьбы: ребёнок становится обычной независимой задачей, без ошибки. <code>Task.Run</code> ставит его всегда.</p>'
    },
    {
      t: 'choice',
      q: 'В коде прошлого задания внешний StartNew заменили на Task.Run. Что изменится?',
      options: ['done напечатается раньше child: ребёнок не прикрепится', 'Ничего: флаг ребёнка сильнее настроек родителя', 'Создание ребёнка бросит InvalidOperationException', 'child не напечатается: задачу ребёнка отменят'],
      answer: 0,
      explain: 'Task.Run ставит DenyChildAttach, и AttachedToParent ребёнка молча игнорируется. Wait ждёт только тело родителя: «parent», «done», а «child» — через 500 мс, если процесс ещё жив.'
    },
    {
      t: 'blanks',
      q: 'Опрос железа — блокирующий цикл на часы. Дай ему отдельный поток, не трогая пул, и строго через стандартный планировщик',
      code: 'Task.Factory.StartNew(PollHardware,\n    CancellationToken.None,\n    TaskCreationOptions.___ | TaskCreationOptions.DenyChildAttach,\n    TaskScheduler.___);',
      tiles: ['LongRunning', 'Default', 'Current', 'PreferFairness', 'AttachedToParent'],
      answer: ['LongRunning', 'Default'],
      explain: 'LongRunning с планировщиком по умолчанию даёт выделенный поток. Default — чтобы не зависеть от того, из какой задачи код вызван.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Task.Run всегда использует TaskScheduler.Default', 'Task.Factory.StartNew без планировщика берёт TaskScheduler.Current', 'Task.Run разворачивает Task<Task> из async-лямбды', 'LongRunning гарантирует отдельный поток при любом планировщике', 'PreferFairness ускоряет выполнение задачи'],
      answer: [0, 1, 2],
      explain: 'LongRunning — подсказка: отдельный поток даёт только планировщик по умолчанию. PreferFairness меняет очередь, а не скорость.'
    },
    {
      t: 'match',
      q: 'Соедини флаг и его эффект',
      pairs: [
        ['LongRunning', 'Отдельный поток вместо пула'],
        ['PreferFairness', 'Глобальная очередь вместо локальной'],
        ['AttachedToParent', 'Родитель ждёт этого ребёнка'],
        ['DenyChildAttach', 'Дети не могут прицепиться'],
        ['HideScheduler', 'Внутри Current выглядит как Default']
      ]
    }
  ]
};
