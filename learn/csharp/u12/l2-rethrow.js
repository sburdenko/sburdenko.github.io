/** C# глубже, раздел «Исключения и надёжность», урок 2: переброс исключений, ExceptionDispatchInfo и TypeInitializationException. */
export default {
  id: 'cs.u12.l2',
  title: 'Переброс и сломанные типы',
  sub: 'throw против throw ex, ExceptionDispatchInfo и TypeInitializationException',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Что лежит в StackTrace',
      body: '<p>Стек вызовов исключения (stack trace) собирается <b>во время раскрутки</b>: рантайм записывает в объект исключения кадры, которые проходит, — от места броска до кадра с <code>catch</code>. Кадры выше обработчика в него не попадают. Нужен полный стек текущего потока — <code>Environment.StackTrace</code>.</p><p>Текст строится <b>лениво</b>: пока не прочитал <code>e.StackTrace</code> или <code>e.ToString()</code>, в объекте лежат только адреса методов. Имена и номера строк рантайм достаёт при чтении, а номера строк — из PDB, если он рядом.</p>',
      code: 'static void Run()\n{\n    try { Deep(3); }\n    catch (Exception e)\n    {\n        // кадры Deep и Run.\n        // Main, который вызвал Run, — не здесь.\n        Console.WriteLine(e.StackTrace);\n    }\n}\n\nstatic void Deep(int n)\n{\n    if (n == 0) throw new Exception();\n    Deep(n - 1);\n}'
    },
    {
      t: 'learn',
      title: 'throw; против throw ex;',
      body: '<p>Внутри <code>catch</code> есть два способа бросить пойманное исключение дальше:</p><p><code>throw;</code> — <b>переброс</b> (rethrow). Летит тот же объект, а собранный стек дополняется: место исходного броска сохраняется.</p><p><code>throw ex;</code> — <b>новый бросок</b> того же объекта. Рантайм считает его исходной точкой эту строку и начинает стек заново. Метод, где ошибка случилась на самом деле, из лога исчезает.</p><p>Анализатор .NET ловит это правилом <b>CA2200</b>. Правило простое: внутри catch для переброса — только <code>throw;</code>.</p>',
      code: 'void B1()\n{\n    try { A(); }\n    catch (Exception ex) { throw ex; }  // стек: B1, Main\n}\n\nvoid B2()\n{\n    try { A(); }\n    catch (Exception) { throw; }        // стек: A, B2, Main\n}'
    },
    {
      t: 'tapline',
      q: 'В логе ошибки нет метода Parse, хотя упал именно он. Какая строка виновата?',
      code: 'Order Load(string path)\n{\n    try\n    {\n        var text = File.ReadAllText(path);\n        return Parse(text);\n    }\n    catch (FormatException e)\n    {\n        log.Warn($"bad file {path}");\n        throw e;\n    }\n}',
      answer: 10,
      explain: 'throw e бросает исключение заново, и стек начинается со строки в Load. Нужно throw; — тогда в стеке останется Parse и всё, что ниже него.'
    },
    {
      t: 'learn',
      title: 'Обернуть, не потеряв причину',
      body: '<p>Иногда исключение нижнего уровня нужно превратить в своё: вызывающему не важен <code>SqlException</code>, ему важно «заказ не сохранён». Тогда бросают новое исключение и передают старое в конструктор — оно окажется в <code>InnerException</code>.</p><p><code>e.ToString()</code> печатает всю цепочку: внешнее, потом <code>---&gt;</code> и внутреннее со своим стеком, потом строку <code>--- End of inner exception stack trace ---</code>. Логируй через <code>ToString()</code> или передавай исключение логгеру целиком — <code>e.Message</code> покажет только верхний уровень.</p>',
      code: 'try\n{\n    db.Insert(order);\n}\ncatch (DbException e)\n{\n    throw new OrderSaveException(\n        $"Order {order.Id} was not saved", e);  // e → InnerException\n}'
    },
    {
      t: 'choice',
      q: 'Слой репозитория поймал DbException и хочет сообщить наверх своей ошибкой. Как правильно?',
      options: [
        'throw new RepositoryException("save failed", e);',
        'throw new RepositoryException("save failed: " + e.Message);',
        'throw new RepositoryException(e.StackTrace);',
        'log.Error(e); return null;'
      ],
      answer: 0,
      explain: 'Исходное исключение уходит в InnerException целиком: тип, сообщение, стек. Склеенные строки теряют тип и половину деталей, а return null превращает ошибку в тихий баг ниже по коду.',
      wrong: { 2: 'Стек, записанный строкой в Message, не видят ни отладчик, ни системы сбора ошибок. Да и сам тип исходной ошибки потерян.' }
    },
    {
      t: 'learn',
      title: 'ExceptionDispatchInfo: переброс в другом месте',
      body: '<p><code>throw;</code> работает только внутри <code>catch</code> — снаружи это ошибка <b>CS0156</b>. А бывает, что исключение поймали в одном месте, а бросить нужно позже или в другом потоке: рабочий поток сохранил ошибку, главный должен её выбросить.</p><p>Для этого есть <code>ExceptionDispatchInfo</code> (пространство имён <code>System.Runtime.ExceptionServices</code>). <code>Capture(e)</code> запоминает исключение и его стек, <code>Throw()</code> бросает тот же объект, сохраняя исходный стек. В логе новые кадры отделены строкой <code>--- End of stack trace from previous location ---</code>.</p><p>Именно так <code>await</code> бросает исключение упавшей задачи: стек показывает и место внутри задачи, и место ожидания.</p>',
      code: 'ExceptionDispatchInfo? error = null;\n\nvar worker = new Thread(() =>\n{\n    try { Work(); }\n    catch (Exception e) { error = ExceptionDispatchInfo.Capture(e); }\n});\nworker.Start();\nworker.Join();\n\nerror?.Throw();  // исходный стек Work + этот кадр',
      deep: '<p>Есть и короткая статическая форма <code>ExceptionDispatchInfo.Throw(e)</code>. Оба метода помечены <code>[DoesNotReturn]</code>, поэтому анализ nullable знает, что после них код не продолжается. Но правила достижимости C# этот атрибут не учитывают: в методе с возвращаемым значением после <code>Throw()</code> всё равно нужен <code>return</code> или <code>throw</code>.</p><p>В .NET 5 добавили <code>ExceptionDispatchInfo.SetCurrentStackTrace(e)</code> — записать текущий стек в исключение, которое ещё ни разу не бросали.</p>'
    },
    {
      t: 'blanks',
      q: 'Сохрани исключение из обработчика и брось его позже с исходным стеком',
      code: 'ExceptionDispatchInfo? saved = null;\ntry { Step(); }\ncatch (Exception e) { saved = ExceptionDispatchInfo.___(e); }\n\nCleanup();\nsaved?.___();',
      tiles: ['Capture', 'Throw', 'Rethrow', 'Save', 'Raise'],
      answer: ['Capture', 'Throw'],
      explain: 'Capture запоминает исключение вместе со стеком, Throw бросает тот же объект и дописывает к стеку новые кадры после разделителя.'
    },
    {
      t: 'multi',
      q: 'После каких вариантов e.ToString() в обработчике верхнего уровня всё ещё покажет метод, где ошибка возникла? Отметь все.',
      options: ['throw;', 'throw ex;', 'ExceptionDispatchInfo.Capture(ex).Throw();', 'throw new AppException("…", ex);', 'throw new AppException(ex.Message);'],
      answer: [0, 2, 3],
      explain: 'throw; и ExceptionDispatchInfo сохраняют исходный стек. Обёртка с ex в конструкторе хранит его в InnerException, и ToString его печатает. throw ex; начинает стек заново, а обёртка без ex теряет исходное исключение целиком.'
    },
    {
      t: 'learn',
      title: 'TypeInitializationException: тип сломан навсегда',
      body: '<p>Статический конструктор и инициализаторы статических полей выполняются <b>один раз</b> — перед первым обращением к типу. Если они бросили исключение, CLR заворачивает его в <code>TypeInitializationException</code>, а исходное кладёт в <code>InnerException</code>.</p><p>Второй попытки не будет. Рантайм помечает тип как неинициализируемый, и <b>любое</b> обращение к нему — статическое поле, метод, <code>new</code> — снова бросает <code>TypeInitializationException</code>, до конца жизни процесса. Даже к членам, которые к ошибке отношения не имеют. Чинится только перезапуском.</p>',
      code: 'static class Cfg\n{\n    public static int Calls;\n    public static readonly int Port = Init();\n\n    static int Init()\n    {\n        Calls++;\n        return int.Parse("abc");  // FormatException\n    }\n}\n\n// Cfg.Port  → TypeInitializationException\n// Cfg.Port  → снова она, Init не вызывается\n// Cfg.Calls → тоже она',
      deep: '<p>В CoreCLR повторное обращение бросает <b>тот же объект</b> <code>TypeInitializationException</code>, сохранённый при первой неудаче, — со стеком первого падения. Это удобно для диагностики: причина видна, даже если первое исключение кто-то проглотил.</p><p>Когда именно выполнится инициализация, зависит от флага <code>beforefieldinit</code>: без явного статического конструктора рантайм вправе сделать это раньше первого обращения (подробно — в разделе «Члены типа и версии»). Поэтому исключение может вылететь не там, где ты ждёшь.</p>'
    },
    {
      t: 'choice',
      q: 'Переменная LIMIT не задана. Сервис обращается к Settings.Path в цикле по запросам. Что происходит со второго запроса?',
      code: 'static class Settings\n{\n    public static readonly string Root = "/srv";\n    public static readonly int Limit =\n        int.Parse(Environment.GetEnvironmentVariable("LIMIT")!);\n    public static string Path => Root + "/data";\n}',
      options: [
        'Снова TypeInitializationException, инициализаторы не перезапускаются',
        'ArgumentNullException из int.Parse при каждом обращении',
        'Path работает: Root ведь инициализирован',
        'Limit равен 0, остальное работает'
      ],
      answer: 0,
      explain: 'Инициализаторы всех статических полей — часть одного статического конструктора. Он упал, тип помечен сломанным, и Path недоступен вместе с остальным до перезапуска процесса.',
      wrong: { 1: 'int.Parse(null) действительно бросает ArgumentNullException, но только один раз и завёрнутым. Повторно инициализатор не запускается.' }
    },
    {
      t: 'learn',
      title: 'Как не сломать тип',
      body: '<p>Правило: в статической инициализации — только то, что не может упасть. Чтение конфигурации, файлов, сети, разбор строк переносят туда, где ошибку можно обработать: в явный метод <code>Initialize</code>, в конструктор сервиса при старте, в DI-контейнер.</p><p><code>Lazy&lt;T&gt;</code> не спасает автоматически: в режиме по умолчанию он тоже <b>кэширует исключение</b> фабрики и бросает его при каждом обращении к <code>Value</code>. Повторять фабрику после ошибки умеет только режим <code>LazyThreadSafetyMode.PublicationOnly</code>.</p>',
      code: 'static readonly Lazy<Config> _config = new(\n    LoadConfig,\n    LazyThreadSafetyMode.PublicationOnly);  // упала — попробуем снова\n\npublic static Config Config => _config.Value;',
      deep: '<p>В .NET Framework сломанный тип можно было «вылечить», выгрузив AppDomain: в новом домене тип загружался и инициализировался заново. В современном .NET доменов нет, похожий эффект даёт только выгружаемый <code>AssemblyLoadContext</code>: сборка, загруженная в новый контекст, — это новые типы с новой статикой. Для обычного приложения ответ один — перезапуск.</p>'
    },
    {
      t: 'match',
      q: 'Соедини конструкцию и что она делает со стеком или ошибкой',
      pairs: [
        ['throw;', 'Сохраняет исходный стек'],
        ['throw ex;', 'Начинает стек с этой строки'],
        ['ExceptionDispatchInfo.Throw()', 'Переброс вне catch с исходным стеком'],
        ['new X("…", ex)', 'Причина уходит в InnerException'],
        ['TypeInitializationException', 'Упала статическая инициализация']
      ]
    }
  ]
};
