/** Async, раздел «Задачи без await», урок 4: таймеры, фоновые потоки и кооперативная отмена глубже. */
export default {
  id: 'as.u7.l4',
  title: 'Таймеры, потоки и отмена',
  sub: 'Кто держит таймер, кто держит процесс и как связать отмены',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Таймеры: кто и где вызывает',
      body: '<ul><li><code>System.Threading.Timer</code> — вызывает колбэк в <b>потоке пула</b> каждые <code>period</code>. Если колбэк дольше периода, следующий стартует, не дожидаясь, — колбэки идут внахлёст в разных потоках. <code>Change</code> перенастраивает, <code>Timeout.Infinite</code> выключает.</li><li><code>System.Timers.Timer</code> — обёртка с событием <code>Elapsed</code> и <code>AutoReset</code>, тоже в пуле.</li><li>UI-таймеры (<code>DispatcherTimer</code>, <code>System.Windows.Forms.Timer</code>) — тик через очередь сообщений в UI-потоке. Внахлёст не бывает, но долгий обработчик морозит окно.</li></ul>',
      code: 'var timer = new Timer(_ =>\n{\n    Poll();                      // в потоке пула\n}, state: null, dueTime: 0, period: 1000);\n\ntimer.Change(Timeout.Infinite, Timeout.Infinite);  // остановить',
      deep: '<p>Исключение из колбэка <code>System.Threading.Timer</code> — необработанное исключение в потоке пула: процесс падает. А <code>System.Timers.Timer</code> по документации <b>глотает</b> исключения обработчиков <code>Elapsed</code> — ошибка просто исчезает.</p><p>Таймеры рантайм держит в своих очередях; срабатывание отслеживает служебный поток, а колбэки уходят в пул. С .NET 8 есть <code>TimeProvider</code>: <code>TimeProvider.System.CreateTimer(…)</code> в коде и подменный провайдер в тестах — время можно «прокручивать» без реального ожидания.</p>'
    },
    {
      t: 'choice',
      q: 'System.Threading.Timer с периодом 1 с, а колбэк работает 3 с. Что происходит?',
      options: ['Колбэки идут внахлёст: через секунду стартует следующий в другом потоке', 'Таймер ждёт конца колбэка и сдвигает следующий тик', 'Лишние тики выбрасываются, колбэк всегда один', 'Таймер бросает исключение о перегрузке'],
      answer: 0,
      explain: 'Таймер не знает, закончил ли ты. Одновременно будут работать около трёх колбэков, и общие данные в них нужно защищать. Не хочешь нахлёста — перезаводи таймер через Change в конце колбэка или бери PeriodicTimer.'
    },
    {
      t: 'learn',
      title: 'Кто держит таймер',
      body: '<p>Работающий таймер записан в очередь рантайма, но очередь держит <b>внутреннюю часть</b>, а не твой объект <code>Timer</code>. Если ссылку на <code>Timer</code> никто не хранит, сборщик мусора может его собрать — финализатор остановит таймер, и тики молча прекратятся. Документация прямо говорит: пока таймер нужен, держи на него ссылку.</p><p>Коварство в том, что баг плавает. Если таймер — локальная переменная долгого метода, в Debug-сборке JIT продлевает её жизнь до конца метода, и всё работает. В Release переменная мертва сразу после последнего использования.</p><p>Обратная сторона: пока таймер активен, очередь держит колбэк и всё, что он захватил. Таймер в поле объекта, чей метод он вызывает, держит этот объект по кругу: очередь → колбэк → объект → таймер. Такой таймер сам не соберётся никогда — останавливай через <code>Dispose</code>.</p>',
      code: 'class HealthCheck : IDisposable\n{\n    private Timer? _timer;   // поле держит таймер живым\n\n    public void Start() =>\n        _timer = new Timer(_ => Check(), null, 0, 5000);\n\n    public void Dispose() => _timer?.Dispose();\n}',
      deep: '<p>В .NET Core таймер разделён на три объекта: <code>Timer</code> → <code>TimerHolder</code> (с финализатором) → <code>TimerQueueTimer</code>. Очередь ссылается только на последний. Поэтому брошенный <code>Timer</code> с держателем становятся мусором, и финализатор держателя закрывает <code>TimerQueueTimer</code>, — иначе забытый таймер тикал бы вечно.</p>'
    },
    {
      t: 'choice',
      q: 'Что будет с тиками?',
      code: 'static void Main()\n{\n    StartTicking();\n    while (true)\n    {\n        Thread.Sleep(100);\n        GC.Collect();          // в жизни сборки идут и сами\n    }\n}\n\nstatic void StartTicking()\n{\n    var t = new Timer(_ => Console.WriteLine("tick"), null, 0, 1000);\n}',
      options: ['Скоро прекратятся', 'Будут идти вечно: таймер стоит в очереди рантайма', 'Не начнутся: таймеру нужен отдельный поток', 'После каждой сборки будут идти вдвое чаще'],
      answer: 0,
      explain: 'После возврата из StartTicking на Timer не осталось ни одной ссылки. Сборка мусора соберёт его, финализатор остановит таймер. Очередь рантайма держит только внутреннюю часть, а не твой объект. Лечение: хранить таймер в поле и освобождать через Dispose.'
    },
    {
      t: 'learn',
      title: 'PeriodicTimer: таймер для async',
      body: '<p><code>PeriodicTimer</code> (.NET 6) работает без колбэков — циклом с <code>await WaitForNextTickAsync</code>:</p><ul><li>тики не идут внахлёст: следующая итерация начнётся, только когда ты вернёшься к ожиданию;</li><li>пропущенные тики не копятся: если работа заняла три периода, ждёт максимум один тик, и следующее ожидание завершится сразу;</li><li>остановка — <code>Dispose</code> (ожидание вернёт <code>false</code>) или токен (бросит <code>OperationCanceledException</code>);</li><li>ждать одновременно может только один потребитель.</li></ul><p>В .NET 8 добавили свойство <code>Period</code>, которое можно менять на ходу, и конструктор с <code>TimeProvider</code>.</p>',
      code: 'using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));\n\nwhile (await timer.WaitForNextTickAsync(ct))\n{\n    await RefreshAsync(ct);   // следующий тик не начнётся, пока не вернёмся\n}',
      deep: '<p>Внутри тот же <code>TimerQueueTimer</code>. <code>WaitForNextTickAsync</code> возвращает <code>ValueTask&lt;bool&gt;</code> поверх переиспользуемого <code>IValueTaskSource</code>, поэтому тик не создаёт новую задачу. Отсюда и ограничение «один ожидающий»: источник у таймера один.</p>'
    },
    {
      t: 'blanks',
      q: 'Синхронизация раз в минуту без нахлёста',
      code: 'using var timer = new ___(TimeSpan.FromMinutes(1));\nwhile (await timer.___(ct))\n    await SyncAsync(ct);',
      tiles: ['PeriodicTimer', 'WaitForNextTickAsync', 'Timer', 'Change', 'Elapsed'],
      answer: ['PeriodicTimer', 'WaitForNextTickAsync'],
      explain: 'Цикл сам определяет темп: пока SyncAsync работает, новый тик не запустит второй экземпляр.'
    },
    {
      t: 'learn',
      title: 'Фоновые и обычные потоки',
      body: '<p>Процесс живёт, пока жив хотя бы один <b>обычный</b> (foreground) поток. <code>Main</code> вернул управление, а <code>new Thread(…)</code> ещё работает — процесс ждёт его.</p><p><b>Фоновые</b> потоки (<code>IsBackground = true</code>) процесс не держат. Когда завершился последний обычный поток, рантайм останавливает фоновые на месте: без исключения, <code>finally</code> не выполнится.</p><ul><li>Фоновые: все потоки пула — значит, <code>Task.Run</code>, колбэки таймеров, продолжения после await; поток <code>LongRunning</code>.</li><li>Обычные: главный поток и <code>new Thread</code> по умолчанию.</li></ul>',
      code: 'var worker = new Thread(() =>\n{\n    try { WriteBigFile(); }\n    finally { Flush(); }        // у фонового может не выполниться\n})\n{\n    IsBackground = true\n};\nworker.Start();\n// Main закончился → процесс завершается, worker обрывается',
      deep: '<p>Для аккуратного завершения не надейся на поток — дай ему сигнал: в хосте .NET это <code>BackgroundService</code> и токен <code>stoppingToken</code>, у процесса — событие <code>AppDomain.ProcessExit</code>.</p><p><b>Тогда и сейчас:</b> в .NET Framework был <code>Thread.Abort</code> — «убить» поток исключением. В .NET Core и .NET 5+ он бросает <code>PlatformNotSupportedException</code>. Остановить чужой код можно только кооперативно.</p>'
    },
    {
      t: 'choice',
      q: 'Консольное приложение. Появится ли файл done.txt?',
      code: 'static void Main()\n{\n    Task.Run(() =>\n    {\n        Thread.Sleep(2000);\n        File.WriteAllText("done.txt", "ok");\n    });\n    Console.WriteLine("main end");\n}',
      options: ['Нет: поток пула фоновый, процесс завершится раньше', 'Да: процесс дождётся всех незавершённых задач', 'Да: Task.Run создаёт обычный поток', 'Только в Debug-сборке'],
      answer: 0,
      explain: 'Main вернулся, обычных потоков не осталось — процесс завершается, задача обрывается на Sleep. Нужно дождаться её: await Task.Run(…) в async Main.'
    },
    {
      t: 'learn',
      title: 'Register: что делать в момент отмены',
      body: '<p><code>token.Register(callback)</code> подписывает колбэк на отмену. Так подключают отмену к API без токенов: закрыть сокет, отменить <code>TaskCompletionSource</code>.</p><ul><li>Колбэк выполняется <b>синхронно в потоке, который вызвал Cancel()</b>, — прямо внутри <code>Cancel</code>.</li><li>Если токен уже отменён — колбэк выполнится сразу, внутри самого <code>Register</code>.</li><li>Исключения колбэков <code>Cancel</code> соберёт в <code>AggregateException</code> после того, как отработают все.</li><li><code>Register</code> возвращает <code>CancellationTokenRegistration</code>. Не освободишь — колбэк и всё, что он захватил, живут столько же, сколько источник токена.</li></ul>',
      code: 'var tcs = new TaskCompletionSource(\n    TaskCreationOptions.RunContinuationsAsynchronously);\nusing var reg = ct.Register(() => tcs.TrySetCanceled(ct));\n\nlegacy.OnDone += () => tcs.TrySetResult();\nlegacy.Start();\nawait tcs.Task;',
      deep: '<p><code>Dispose</code> регистрации ждёт, если колбэк прямо сейчас выполняется в другом потоке: после него колбэк гарантированно закончен. Держишь замок, который нужен колбэку, — получишь deadlock. <code>Unregister()</code> (.NET Core 3.0) снимает подписку без ожидания.</p><p><code>Register(cb, useSynchronizationContext: true)</code> отправит колбэк в контекст, захваченный при регистрации. <code>CancelAsync()</code> (.NET 8) запускает колбэки не в твоём потоке и возвращает задачу.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var cts = new CancellationTokenSource();\ncts.Cancel();\ncts.Token.Register(() => Console.WriteLine("A"));\nConsole.WriteLine("B");',
      options: ['A, потом B', 'B, потом A', 'Только B', 'InvalidOperationException'],
      answer: 0,
      explain: 'Токен уже отменён, поэтому Register выполняет колбэк сразу и синхронно, ещё до возврата. Опоздавший подписчик не пропускает отмену.'
    },
    {
      t: 'learn',
      title: 'Связанные токены и CancelAfter',
      body: '<p>Часто причин для отмены две: вызывающий передумал, и истёк твой таймаут.</p><ul><li><code>CancellationTokenSource.CreateLinkedTokenSource(a, b)</code> — новый источник, который отменяется, когда отменён любой из родителей (или он сам);</li><li><code>CancelAfter(time)</code> — отменить по внутреннему таймеру. Повторный вызов переставляет срок;</li><li>связанный источник подписывается на родителей через <code>Register</code>, поэтому его <b>обязательно</b> освобождают. Иначе долгоживущий родитель копит подписки.</li></ul><p>Кто отменил — проверяй в фильтре <code>when</code>.</p>',
      code: 'async Task<Data> LoadAsync(CancellationToken callerCt)\n{\n    using var cts = CancellationTokenSource.CreateLinkedTokenSource(callerCt);\n    cts.CancelAfter(TimeSpan.FromSeconds(5));\n    try\n    {\n        return await FetchAsync(cts.Token);\n    }\n    catch (OperationCanceledException) when (!callerCt.IsCancellationRequested)\n    {\n        throw new TimeoutException("Сервер молчит дольше 5 с");\n    }\n}',
      deep: '<p>Как задача становится <b>Canceled</b>, а не Faulted. У async-метода любое вылетевшее <code>OperationCanceledException</code> делает задачу Canceled. У <code>Task.Run(work, ct)</code> — только если исключение несёт тот же <code>ct</code> и он отменён; иначе Faulted. Поэтому <code>ThrowIfCancellationRequested</code> удобнее ручного <code>throw</code>: исключение сразу несёт нужный токен.</p><p><code>TryReset()</code> (.NET 6) возвращает неотменённый источник в исходное состояние — для пулов. С .NET 8 конструктор принимает <code>TimeProvider</code>, и таймаут тестируется без реального ожидания.</p>'
    },
    {
      t: 'tapline',
      q: 'Сервис работает неделями, память медленно растёт. Какая строка виновата?',
      code: 'while (!appStopping.IsCancellationRequested)\n{\n    var req = await queue.ReadAsync(appStopping);\n    var cts = CancellationTokenSource.CreateLinkedTokenSource(appStopping);\n    cts.CancelAfter(TimeSpan.FromSeconds(30));\n    await HandleAsync(req, cts.Token);\n}',
      answer: 3,
      explain: 'Связанный источник подписался на appStopping, а он живёт всё время работы сервиса. Без Dispose каждая подписка остаётся в его списке вместе с источником. Нужно using var cts.'
    },
    {
      t: 'match',
      q: 'Соедини инструмент и что он даёт',
      pairs: [
        ['Register', 'Колбэк в момент отмены'],
        ['CreateLinkedTokenSource', 'Отмена по любой из причин'],
        ['CancelAfter', 'Отмена по таймеру'],
        ['IsBackground = true', 'Поток не держит процесс'],
        ['PeriodicTimer', 'Тики через await без нахлёста']
      ]
    }
  ]
};
