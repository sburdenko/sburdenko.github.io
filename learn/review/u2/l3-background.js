/** Ревью кода, раздел 2, урок 3: таймеры, фоновые задачи, отмена (TileLoader). */
export default {
  id: 'rv.u2.l3',
  title: 'Таймеры, фоновые задачи, отмена',
  sub: 'Timer и сборщик мусора, StartNew(async), токен-обманка',
  minutes: 12,
  cards: [
    {
      t: 'learn',
      title: 'Будильник без хозяина',
      body: '<p>Ты поставил будильник и убрал его в ящик, где никто его не найдёт. Через какое-то время уборщица выбросила ящик вместе с будильником. Он молча замолчал.</p><p>В конструкторе загрузчика ровно это: <code>var timer = new Timer(…)</code>. Переменная <b>локальная</b>, ссылок на таймер нигде нет. Сборщик мусора вправе его убрать, и обновление полоски прогресса остановится «через случайное время», без ошибок и сообщений. В отладке всё работает, а на устройстве — через минуту нет.</p>'
    },
    {
      t: 'choice',
      q: 'Полоска прогресса сначала обновляется, а минуты через три замирает. Исключений в логе нет. Что подозрительнее всего?',
      options: [
        'System.Threading.Timer лежит в локальной переменной, и его собрал GC',
        'Слишком маленький интервал таймера (1000 мс)',
        'HttpClient объявлен static'
      ],
      answer: 0,
      explain: 'Документация прямо требует хранить ссылку на Timer, пока он нужен. Без неё объект собирается по случайному расписанию GC, а колбэк просто перестаёт вызываться.',
      wrong: { 2: 'Статический HttpClient как раз правильная практика: его создают один раз.' }
    },
    {
      t: 'learn',
      title: 'Что ещё не так с таймером',
      body: '<p>Колбэк <code>Timer</code> вызывается из <b>пула потоков</b>, а не из главного потока. Но он пишет <code>_progressBar.value</code>, то есть дёргает Unity API. Это разрешено только на главном потоке.</p><p>Заодно: <code>dueTime = 0</code> запускает колбэк сразу, возможно ещё до окончания конструктора, а <code>Slider</code> к тому моменту может быть уничтожен (смена сцены).</p><p>Правильно: хранить таймер в поле, при остановке делать <code>Dispose</code>, а значение прогресса просто записывать в поле и читать из <code>Update</code> на главном потоке.</p>',
      deep: 'В Unity запись из пула в UI-объект часто «просто не падает», а иногда бросает <code>UnityException</code> («can only be called from the main thread») — поведение зависит от конкретного API и версии. Поэтому правило жёсткое: из фоновых потоков Unity API не трогаем, результат передаём главному потоку (через поле и Update либо через захваченный UnitySynchronizationContext). Оговорка про GC: насколько быстро объект будет собран, зависит от рантайма и сборки (Release-JIT собирает раньше, чем Debug), но документация гарантирует только «держите ссылку».'
    },
    {
      t: 'blanks',
      q: 'Исправь таймер: держи его в поле и освобождай.',
      code: 'private readonly Timer _timer; // поле, а не локальная переменная\n\npublic TileLoader(Slider bar)\n{\n    _progressBar = bar;\n    _timer = ___ Timer(_ => ReportProgress(), null, 1000, 1000);\n}\n\npublic void Stop() => _timer.___();',
      tiles: ['new', 'Dispose', 'static', 'Abort'],
      answer: ['new', 'Dispose'],
      explain: 'Поле держит таймер живым, пока жив загрузчик. Dispose останавливает его и освобождает ресурсы. (В реальном коде колбэк ещё и не должен трогать Slider напрямую.)'
    },
    {
      t: 'learn',
      title: 'Task.Factory.StartNew(async …) — «Task в Task»',
      body: '<p>Лямбда с <code>async</code> возвращает <code>Task</code>. А <code>StartNew</code> оборачивает её результат ещё в одну задачу: получается <code>Task&lt;Task&gt;</code>. Внешняя задача считается завершённой, как только лямбда дошла до первого <code>await</code>, то есть почти сразу.</p><p>Внутренняя задача (цикл с <code>Compact</code>) живёт сама по себе. Если в ней случится исключение, его никто не увидит: на внутреннюю задачу никто не смотрит. Лечится одним словом: <code>Task.Run</code> разворачивает вложенную задачу автоматически.</p>',
      code: 'Task t1 = Task.Factory.StartNew(async () => { await Task.Delay(1000); });\n// на деле Task<Task>: t1 завершится почти сразу\n\nTask t2 = Task.Run(async () => { await Task.Delay(1000); });\n// t2 завершится, когда закончится сама лямбда',
      lang: 'csharp'
    },
    {
      t: 'choice',
      q: 'Какой тип возвращает Task.Factory.StartNew(async () => { … }) без Unwrap?',
      options: ['Task<Task>', 'Task', 'void', 'Task<T> для T из тела лямбды'],
      answer: 0,
      explain: 'StartNew запускает делегат и оборачивает его результат в Task. Результат async-лямбды сам является Task, поэтому тип получается вложенным. Task.Run или .Unwrap() превращают его в обычный Task.'
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: 'Найди четыре проблемы в конструкторе, предзагрузке и фоновом цикле. Нажимай на строки, потом «Проверить».',
      code: 'public TileLoader(Slider progressBar)\n{\n    _progressBar = progressBar;\n    var timer = new Timer(_ => ReportProgress(), null, 0, 1000);\n}\n\npublic void PreloadAll(IEnumerable<int> ids)\n{\n    foreach (var id in ids)\n        GetTileAsync(id,\n            CancellationToken.None);\n}\n\npublic void StartBackgroundCompaction(CancellationToken ct)\n{\n    Task.Factory.StartNew(async () =>\n    {\n        while (!ct.IsCancellationRequested)\n        {\n            Compact();\n            await Task.Delay(1000);\n        }\n    });\n}',
      bugs: [
        { lines: [3], title: 'Timer в локальной переменной', why: 'На таймер нет ссылок, GC его соберёт, и прогресс тихо перестанет обновляться. Нужно поле и Dispose.' },
        { lines: [8, 9], title: 'Fire-and-forget в PreloadAll', why: 'Возвращаемые Task игнорируются: ошибки не наблюдаются, дождаться результата нельзя. Для тысяч id каждый блокирующий Wait занимает поток.' },
        { lines: [10], title: 'CancellationToken.None вместо токена', why: 'Выглядит как аккуратная передача токена, а на деле отмена отключена полностью: остановить загрузку снаружи нельзя.' },
        { lines: [15, 20], title: 'StartNew(async) и Delay без токена', why: 'Получается Task<Task>, исключения цикла теряются. А Task.Delay(1000) без ct не прерывается при остановке и держит цикл до конца паузы.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:3', 'flag:8', 'flag:10', 'flag:15', 'check']
    },
    {
      t: 'learn',
      title: 'Токен, который выглядит как отмена',
      body: '<p>Метод принимает <code>CancellationToken ct</code>, а дальше его <b>не использует</b>: ни в <code>GetByteArrayAsync</code>, ни в <code>Delay</code>. Это табличка «выход» над закрытой дверью. А <code>PreloadAll</code> вообще передаёт <code>CancellationToken.None</code> — токен, который отменить нельзя в принципе.</p><p>И ещё хитрость. Все, кто просит один и тот же тайл, делят одну задачу. Фабрика замыкает <code>ct</code> <b>первого</b> вызвавшего. Если он отменится, отмена ударит и по остальным.</p>',
      deep: 'Нормальная схема: общая работа получает токен самого загрузчика (<code>CancellationTokenSource</code> на уровне объекта), а каждый вызывающий отменяет только своё ожидание: <code>task.WaitAsync(ct)</code> (есть в .NET 6+) либо <code>Task.WhenAny</code> с задачей отмены. Ещё оговорка: перегрузка <code>HttpClient.GetByteArrayAsync(url, ct)</code> есть в .NET 5+; в старых профилях (например, .NET Standard 2.0 в Unity) токен передают через <code>SendAsync(request, ct)</code>.'
    },
    {
      t: 'tapline',
      q: 'Токен передан везде, кроме одной строки. Нажми на неё.',
      code: 'await _throttle.WaitAsync(ct);\ntry\n{\n    var resp = await Http.GetAsync(url);\n    resp.EnsureSuccessStatusCode();\n    await Task.Delay(50, ct);\n}',
      answer: 3,
      explain: 'GetAsync(url) без токена: отмена не прервёт сетевой запрос, он будет идти до конца. Нужно Http.GetAsync(url, ct).'
    },
    {
      t: 'learn',
      title: 'PreloadAll: выстрелил и забыл',
      body: '<p>Цикл вызывает <code>GetTileAsync</code> и выбрасывает задачу. Исключение внутри такой задачи никто не увидит. Нельзя узнать, когда всё готово. А если ещё и семафор блокирует (<code>Wait()</code>), каждый ожидающий занимает <b>целый поток</b>. Тысяча id, и пул потоков исчерпан («голодание пула»): даже посторонние задачи программы начинают тормозить.</p><p>Исправление: метод возвращает <code>Task</code>, ждёт через <code>await</code>, а ограничение «не более 4» делает асинхронный <code>WaitAsync</code> внутри загрузки.</p>',
      code: 'public Task PreloadAllAsync(IEnumerable<int> ids, CancellationToken ct)\n{\n    var tasks = ids.Select(id => GetTileAsync(id, ct)).ToList();\n    return Task.WhenAll(tasks);\n}',
      lang: 'csharp'
    },
    {
      t: 'choice',
      q: 'Что делает PreloadAllAsync из примера лучше, чем PreloadAll с игнорированием задач?',
      options: [
        'Возвращает Task: можно дождаться конца, увидеть исключения и передать токен',
        'Загружает тайлы быстрее, потому что использует больше потоков',
        'Заменяет семафор и больше не нужен ограничитель'
      ],
      answer: 0,
      explain: 'Задачи собраны в WhenAll, поэтому исключения и завершение наблюдаемы. Скорость и потоки тут ни при чём, а ограничитель по-прежнему нужен, только неблокирующий.',
      wrong: { 2: 'Task.WhenAll ничего не ограничивает: ограничение остаётся за WaitAsync внутри загрузки.' }
    },
    {
      t: 'multi',
      q: 'Что верно про фоновые задачи и таймеры в этом загрузчике?',
      options: [
        'Колбэк System.Threading.Timer выполняется на потоке пула, а не на главном потоке Unity',
        'Task.Run развернёт async-лямбду, а StartNew(async) нет',
        'Игнорируемая Task гарантирует, что исключения будут показаны в консоли Unity',
        'Для остановки фонового цикла лучше CancellationToken, чем флажок'
      ],
      answer: [0, 1, 3],
      explain: 'Первое, второе и четвёртое верны. Игнорируемая задача, наоборот, прячет исключения: они остаются «не наблюдаемыми».'
    }
  ]
};
