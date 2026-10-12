/** C# глубже, раздел «Исключения и надёжность», урок 3: необработанные исключения, цена исключения, TryXxx и свои типы исключений. */
export default {
  id: 'cs.u12.l3',
  title: 'Необработанные, цена и свои исключения',
  sub: 'Что роняет процесс, сколько стоит throw, шаблон TryXxx и проектирование исключений',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Где исключение роняет весь процесс',
      body: '<p>Исключение, которое не поймали <b>ни в одном кадре своего потока</b>, завершает весь процесс — неважно, главный это поток или нет. Так с .NET 2.0; в .NET 1.x ошибки фоновых потоков молча проглатывались.</p><p>Процесс падает от необработанного исключения:</p><ul><li>в потоке <code>new Thread(...)</code>;</li><li>в работе пула: <code>ThreadPool.QueueUserWorkItem</code>, колбэк <code>System.Threading.Timer</code>;</li><li>в <b>финализаторе</b> — поток финализации такой же поток;</li><li>в <code>async void</code> — исключение уходит в контекст синхронизации или в пул.</li></ul><p>Исключение внутри <code>Task.Run</code> процесс не роняет: его сохраняет задача, как в курсе «Async/await до дна».</p>',
      code: 'new Thread(() => throw new Exception("boom")).Start();\n// Unhandled exception. System.Exception: boom\n// процесс завершён\n\nThreadPool.QueueUserWorkItem(_ => throw new Exception());\n// то же самое\n\nclass Handle { ~Handle() => throw new Exception(); }\n// упадёт, когда поток финализации\n// дойдёт до объекта после сборки'
    },
    {
      t: 'multi',
      q: 'Какие из этих необработанных исключений завершат процесс? Отметь все.',
      options: ['throw в теле new Thread(...)', 'throw в финализаторе ~T()', 'throw в Task.Run, задачу никто не ждёт', 'throw в колбэке ThreadPool.QueueUserWorkItem', 'throw в catch, который сам внутри внешнего try с catch'],
      answer: [0, 1, 3],
      explain: 'Поток, поток финализации и рабочий элемент пула — исключению некуда деться выше, процесс падает. Task.Run складывает исключение в задачу. Исключение из catch ловит внешний try — оно обработано.'
    },
    {
      t: 'learn',
      title: 'AppDomain.UnhandledException — последнее слово',
      body: '<p>Перед падением рантайм вызывает событие <code>AppDomain.CurrentDomain.UnhandledException</code>. Стек ещё не раскручен, в <code>e.ExceptionObject</code> — исключение, <code>e.IsTerminating</code> равен <code>true</code>.</p><p>Это <b>уведомление, а не обработчик</b>: отменить завершение оно не может. Его дело — записать лог, сбросить буферы логгера, отправить отчёт. После обработчика процесс всё равно завершится.</p><p>И ещё: исключение из другого потока нельзя поймать <code>try</code> вокруг <code>Start</code> или <code>Join</code>. У каждого потока свой стек, и поиск обработчика идёт только по нему. Ловить надо внутри потока.</p>',
      code: 'AppDomain.CurrentDomain.UnhandledException += (_, e) =>\n{\n    var ex = (Exception)e.ExceptionObject;\n    log.Fatal(ex, "crash");\n    log.Flush();   // иначе последние записи потеряются\n};',
      deep: '<p>Тип <code>ExceptionObject</code> — <code>object</code>: в IL можно бросить что угодно, не только <code>Exception</code>. C# такое бросить не даёт, а рантайм заворачивает чужие объекты в <code>RuntimeWrappedException</code> (атрибут <code>RuntimeCompatibility(WrapNonExceptionThrows = true)</code>, который компилятор C# ставит на сборку сам).</p><p>В ASP.NET Core необработанное исключение запроса процесс не роняет: его ловит сервер и превращает в ответ 500. Но фоновые потоки и <code>async void</code> там падают так же. Для фоновой работы есть <code>BackgroundService</code>; с .NET 6 упавший <code>ExecuteAsync</code> по умолчанию останавливает хост (<code>BackgroundServiceExceptionBehavior.StopHost</code>).</p>'
    },
    {
      t: 'choice',
      q: 'Что увидит пользователь?',
      code: 'var t = new Thread(() => throw new InvalidOperationException());\ntry\n{\n    t.Start();\n    t.Join();\n}\ncatch (Exception)\n{\n    Console.WriteLine("caught");\n}',
      options: ['Процесс упадёт, caught не напечатается', 'caught', 'caught, и поток перезапустится', 'Ничего: исключение потока тихо пропадёт'],
      answer: 0,
      explain: 'Исключение летит по стеку потока t, а там обработчика нет. try главного потока к этому стеку отношения не имеет. Join просто дожидается завершения потока, ошибок он не передаёт.',
      wrong: { 3: 'Так было в .NET 1.x. С .NET 2.0 необработанное исключение любого потока завершает процесс.' }
    },
    {
      t: 'learn',
      title: 'Сколько стоит throw',
      body: '<p>Бросок — не просто переход. Рантайм:</p><ul><li>создаёт объект исключения в куче;</li><li>в первом проходе обходит стек и вычисляет фильтры;</li><li>во втором раскручивает кадры, выполняет finally и записывает каждый кадр в стек исключения.</li></ul><p>Порядок цифр: на .NET 9 бросок и поимка неудачного <code>int.Parse</code> — <b>единицы микросекунд</b>, <code>int.TryParse</code> на той же строке — <b>единицы наносекунд</b>. Разница — около тысячи раз, и она растёт с глубиной стека. Точные числа зависят от машины.</p><p>Отсюда правило: исключения — для <b>исключительных</b> ситуаций. Если ошибка — обычный исход (неверный ввод, нет ключа), её возвращают значением.</p>',
      deep: '<p>Самое дорогое — превращение стека в текст (имена методов, номера строк из PDB), но оно ленивое: платишь, только если читаешь <code>StackTrace</code> или логируешь <code>ToString()</code>. В .NET 9 CoreCLR перешёл на управляемую обработку исключений из NativeAOT, и броски стали в несколько раз быстрее, — но разрыв с обычным <code>return</code> по-прежнему огромный.</p>'
    },
    {
      t: 'choice',
      q: 'Файл на миллион строк, каждая десятая — не число. Разбор через int.Parse с catch (FormatException). Сколько примерно времени уйдёт на одни только исключения?',
      options: ['Порядка половины секунды', 'Порядка миллисекунды', 'Порядка минуты', 'Нисколько: JIT убирает исключения в Release'],
      answer: 0,
      explain: 'Сто тысяч бросков по нескольку микросекунд — сотни миллисекунд. С TryParse та же работа заняла бы единицы миллисекунд на весь файл. При более глубоком стеке исключения обходятся ещё дороже.',
      wrong: { 3: 'JIT не превращает throw в возврат значения: каждый бросок — настоящий обход и раскрутка стека.' }
    },
    {
      t: 'learn',
      title: 'Шаблон TryXxx',
      body: '<p>Для операций, где неудача — нормальный исход, в .NET принят шаблон <b>TryXxx</b>: метод возвращает <code>bool</code>, а результат — через <code>out</code>. Обычно рядом есть пара без <code>Try</code>, которая бросает: <code>int.Parse</code> и <code>int.TryParse</code>, индексатор словаря и <code>TryGetValue</code>.</p><p>Атрибут <code>[NotNullWhen(true)]</code> сообщает анализу nullable: если вернулось <code>true</code>, в <code>out</code> не null. Без него вызывающему придётся писать <code>user!</code>.</p><p>Try-метод не глушит всё подряд: он возвращает <code>false</code> только на ожидаемую неудачу. Ошибки программиста и среды — неверный аргумент, сломанный диск — он по-прежнему бросает.</p>',
      code: 'public bool TryFind(string id, [NotNullWhen(true)] out User? user)\n{\n    user = _cache.GetValueOrDefault(id);\n    return user is not null;\n}\n\nif (repo.TryFind(id, out var user))\n    Greet(user);   // без предупреждения: user не null',
      deep: '<p>Альтернатива — «проверь, потом сделай» (tester-doer): <code>if (dict.ContainsKey(k)) v = dict[k];</code>. Это два поиска вместо одного и гонка, если коллекцию меняет другой поток. Try-метод делает проверку и действие одной операцией — поэтому у <code>ConcurrentDictionary</code> почти весь API из <code>TryAdd</code>, <code>TryRemove</code>, <code>TryUpdate</code>.</p>'
    },
    {
      t: 'blanks',
      q: 'Допиши Try-метод так, чтобы после true вызывающий получил ненулевой user без предупреждений',
      code: 'public bool TryLoad(int id, [___(true)] out User? user)\n{\n    if (!_rows.TryGetValue(id, out var row))\n    {\n        user = null;\n        return ___;\n    }\n    user = Map(row);\n    return true;\n}',
      tiles: ['NotNullWhen', 'MaybeNull', 'NotNull', 'false', 'true'],
      answer: ['NotNullWhen', 'false'],
      explain: 'NotNullWhen(true) связывает результат с out-параметром. Когда записи нет, метод возвращает false и кладёт в out null — это обычный исход, а не исключение.'
    },
    {
      t: 'learn',
      title: 'Своё исключение: когда и как',
      body: '<p>Сначала подумай, нужен ли новый тип. Чаще подходит стандартный: <code>ArgumentException</code> и его наследники — неверный аргумент, <code>InvalidOperationException</code> — объект не в том состоянии, <code>NotSupportedException</code>, <code>ObjectDisposedException</code>. Свой тип нужен, когда вызывающий будет ловить <b>именно его</b> и по-особому реагировать.</p><p>Если нужен:</p><ul><li>наследуй <code>Exception</code> (не <code>ApplicationException</code> — от этой идеи давно отказались);</li><li>имя заканчивай на <code>Exception</code>;</li><li>дай три конструктора: пустой, с сообщением, с сообщением и внутренним исключением;</li><li>данные для обработки клади в свойства, а не только в текст.</li></ul><p>Конструктор сериализации <code>(SerializationInfo, StreamingContext)</code> больше не пиши: в .NET 8 он устарел вместе с BinaryFormatter (SYSLIB0051).</p>',
      code: 'public sealed class OrderNotFoundException : Exception\n{\n    public int OrderId { get; }\n\n    public OrderNotFoundException() { }\n    public OrderNotFoundException(string message) : base(message) { }\n    public OrderNotFoundException(string message, Exception inner)\n        : base(message, inner) { }\n    public OrderNotFoundException(int orderId)\n        : base($"Order {orderId} not found") => OrderId = orderId;\n}',
      deep: '<p>Для проверки аргументов есть готовые помощники: <code>ArgumentNullException.ThrowIfNull</code> (.NET 6), <code>ArgumentException.ThrowIfNullOrEmpty</code> и <code>ObjectDisposedException.ThrowIf</code> (.NET 7), <code>ArgumentOutOfRangeException.ThrowIfNegative</code> и родня (.NET 8). Имя параметра они берут сами через <code>[CallerArgumentExpression]</code>.</p><p>Зачем броски выносят в отдельный метод: создание исключения и строки раздувает код метода и мешает его встроить. Вызов помощника, который только бросает, JIT распознаёт как ветку без возврата и уносит в холодный код. Атрибут <code>[StackTraceHidden]</code> (.NET 6) убирает сам помощник из стека.</p>'
    },
    {
      t: 'multi',
      q: 'Какие исключения библиотечный код не должен бросать сам? Отметь все.',
      options: ['System.Exception', 'NullReferenceException', 'InvalidOperationException', 'IndexOutOfRangeException', 'ArgumentOutOfRangeException'],
      answer: [0, 1, 3],
      explain: 'Exception слишком общий: поймать его отдельно от остальных нельзя. NullReferenceException и IndexOutOfRangeException бросает рантайм, они означают баг в коде. Для плохого аргумента — ArgumentNullException и ArgumentOutOfRangeException, для неверного состояния — InvalidOperationException.'
    },
    {
      t: 'learn',
      title: 'Где ловить Exception целиком',
      body: '<p><code>catch (Exception)</code> без фильтра ловит всё: и баги, и отмену, и то, о чём ты не подумал. Его место — <b>на границах</b>: верх обработки запроса или сообщения, точка входа потока, цикл фоновой задачи. Там ошибку логируют и решают: пропустить элемент, повторить, остановиться.</p><p>Внутри логики лови конкретные типы или ставь фильтр. Особенно не глуши <code>OperationCanceledException</code>: отмена — не ошибка, и проглотив её, ты продолжишь работу, которую пользователь просил остановить.</p>',
      code: 'catch (Exception e) when (e is not OperationCanceledException)\n{\n    log.Warn(e, "item skipped");\n}'
    },
    {
      t: 'tapline',
      q: 'Пользователь нажал «Отмена», а загрузка продолжилась по остальным файлам. Какая строка виновата?',
      code: 'void UploadAll(IEnumerable<string> files, CancellationToken ct)\n{\n    foreach (var file in files)\n    {\n        try\n        {\n            Upload(file, ct);\n        }\n        catch (Exception e)\n        {\n            log.Warn(e, $"skip {file}");\n        }\n    }\n}',
      answer: 8,
      explain: 'Upload бросает OperationCanceledException, а catch (Exception) ловит и её: отмена записана как «пропущен файл», цикл идёт дальше. Нужен фильтр when (e is not OperationCanceledException) — тогда отмена пролетит наружу и остановит цикл.'
    }
  ]
};
