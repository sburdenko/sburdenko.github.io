/** Ревью кода, раздел 2, финал: полный листинг TileLoader. */
export default {
  id: 'rv.u2.boss',
  title: "Финал: TileLoader целиком",
  sub: "Найди все баги в загрузчике тайлов",
  minutes: 14,
  boss: true,
  cards: [
    {
      t: 'learn',
      title: "Ревью на выход",
      body: "<p>Перед тобой весь загрузчик тайлов. Ты уже видел его по кускам: блокировки, гонки, таймеры и отмену. Теперь найди всё сам. Багов здесь больше десяти, и они связаны: один прячет другой.</p><p>Подсказка по порядку: сначала глазами пройди <b>потоки</b> (кто какую строку выполняет), потом <b>общие данные</b> (кто пишет и кто читает), потом <b>время жизни</b> (кто держит ссылку, кто остановит).</p>"
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: "Найди все баги в TileLoader. Нажимай на строки с проблемами, потом «Проверить». Всего их 12.",
      code: "public class TileLoader\n{\n    private static readonly HttpClient Http = new HttpClient();\n\n    private readonly ConcurrentDictionary<int, Task<Tile>> _loading = new ConcurrentDictionary<int, Task<Tile>>();\n    private readonly Dictionary<int, Tile> _loaded = new Dictionary<int, Tile>();\n    private readonly object _sync = new object();\n    private readonly SemaphoreSlim _throttle = new SemaphoreSlim(4);\n    private readonly TaskCompletionSource<bool> _allLoaded = new TaskCompletionSource<bool>();\n    private readonly Slider _progressBar;\n\n    private bool _stopRequested;\n    private int _pending;\n\n    public TileLoader(Slider progressBar)\n    {\n        _progressBar = progressBar;\n        var timer = new Timer(_ => ReportProgress(), null, 0, 1000);\n    }\n\n    public Task<Tile> GetTileAsync(int id, CancellationToken ct)\n    {\n        return _loading.GetOrAdd(id, _ => LoadAsync(id, ct));\n    }\n\n    private async Task<Tile> LoadAsync(int id, CancellationToken ct)\n    {\n        _throttle.Wait();\n        Interlocked.Increment(ref _pending);\n\n        var bytes = await Http.GetByteArrayAsync($\"https://cdn.example.com/tiles/{id}\");\n        Thread.Sleep(50); // чтобы не перегружать CDN\n        var tile = Tile.Parse(bytes);\n\n        lock (_sync)\n        {\n            _loaded[id] = tile;\n        }\n\n        _throttle.Release();\n\n        if (--_pending == 0)\n            _allLoaded.SetResult(true);\n\n        return tile;\n    }\n\n    public void PreloadAll(IEnumerable<int> ids)\n    {\n        foreach (var id in ids)\n            GetTileAsync(id, CancellationToken.None);\n    }\n\n    public Task WhenAllLoaded() => _allLoaded.Task;\n\n    public Tile TryGetLoaded(int id) =>\n        _loaded.TryGetValue(id, out var tile) ? tile : null;\n\n    public void StartBackgroundCompaction()\n    {\n        Task.Factory.StartNew(async () =>\n        {\n            while (!_stopRequested)\n            {\n                Compact();\n                await Task.Delay(1000);\n            }\n        });\n    }\n\n    public void Stop() => _stopRequested = true;\n\n    private void Compact()\n    {\n        lock (_sync)\n        {\n            foreach (var id in _loaded.Keys.ToList())\n            {\n                if (_loaded[id].IsStale)\n                {\n                    _loaded.Remove(id);\n                    _loading.TryRemove(id, out _);\n                }\n            }\n        }\n    }\n\n    private void ReportProgress()\n    {\n        _progressBar.value = _loaded.Count;\n    }\n}",
      bugs: [
        { lines: [27], title: "Синхронный Wait() в async-методе", why: "Фабрика GetOrAdd идёт на потоке вызывающего. На главном потоке Unity это заморозка и дедлок: Release лежит в продолжении, которое Unity вернёт на тот же заблокированный поток. Нужен await _throttle.WaitAsync(ct)." },
        { lines: [39], title: "Release и счётчик вне try/finally", why: "Любая ошибка сети или Parse оставляет место занятым. После четырёх ошибок семафор исчерпан навсегда, а _pending не уменьшается, так что _allLoaded не сработает никогда." },
        { lines: [31], title: "Thread.Sleep в async-методе", why: "Блокирует поток: продолжение после await вернулось на главный поток Unity, и кадр замирает. Нужен await Task.Delay(50, ct). Продолжения заодно стоит увести с главного потока через ConfigureAwait(false)." },
        { lines: [30, 50], title: "Токен не используется, а в PreloadAll передан None", why: "GetByteArrayAsync вызван без токена, а None отключает отмену целиком. Плюс фабрика замыкает токен первого вызвавшего: его отмена заденет всех, кто делит задачу." },
        { lines: [41, 42, 8], title: "Неатомарный счётчик и TCS", why: "--_pending теряет обновления, ноль возможен между тайлами, и тогда всё «загружено» раньше времени. Повторный SetResult бросает исключение. Нужны Interlocked, TrySetResult и RunContinuationsAsynchronously." },
        { lines: [22], title: "GetOrAdd запускает LoadAsync в фабрике", why: "Фабрика может выполниться в двух потоках: тайл загрузится дважды, счётчик и семафор заденутся дважды. Храни Lazy<Task<Tile>>." },
        { lines: [4], title: "В кэше навсегда остаются упавшие задачи", why: "Повторный GetTileAsync вернёт ту же упавшую или отменённую Task, повторной попытки не будет. Неудачные записи нужно убирать." },
        { lines: [55, 56, 89], title: "Чтение _loaded без lock", why: "Другие потоки пишут в Dictionary под lock, а TryGetLoaded и ReportProgress читают без него. Чтение во время записи даёт мусор или исключение." },
        { lines: [17], title: "Timer в локальной переменной", why: "Ссылок на таймер нет: в .NET его соберёт GC и прогресс тихо замрёт, в Mono (Unity) его не остановить. Плюс колбэк идёт из пула и пишет в Slider, а Unity API можно трогать только с главного потока." },
        { lines: [60, 65], title: "StartNew(async) и Delay без токена", why: "Получается Task<Task>, исключения цикла теряются. Task.Delay(1000) не прерывается при Stop(). Нужен Task.Run и токен." },
        { lines: [11, 62, 70], title: "Флажок остановки без синхронизации", why: "Обычный bool между потоками формально не гарантирует, что цикл увидит запись, а Stop() не ждёт завершения цикла. Нужен CancellationTokenSource." },
        { lines: [47, 49], title: "PreloadAll: fire-and-forget", why: "Задачи выбрасываются: ошибки не видны, дождаться нельзя. А фабрика с Wait() выполняется прямо в цикле: с пятого id PreloadAll блокирует вызывающий поток (с главного — дедлок). Нужен метод, возвращающий Task." }
      ],
      goal: { min: 10, maxFalse: 3 },
      solve: ['flag:27', 'flag:39', 'flag:31', 'flag:30', 'flag:41', 'flag:22', 'flag:4', 'flag:55', 'flag:17', 'flag:60', 'flag:11', 'flag:47', 'check']
    },
    {
      t: 'choice',
      q: "Когда в LoadAsync произойдёт дедлок из-за Wait()?",
      options: [
        "GetTileAsync вызван с главного потока Unity, когда все 4 места заняты",
        "Только если вызов идёт из потока пула",
        "Только если сервер тайлов недоступен",
        "При любом вызове, даже когда места свободны"
      ],
      answer: 0,
      explain: "Нужно, чтобы Wait() реально блокировал (мест нет) и блокировал именно главный поток, на который Unity вернёт продолжения с Release (так будет, если загрузки, держащие места, тоже стартовали с главного потока). Пока места свободны, Wait проходит мгновенно.",
      wrong: { 3: "Со свободным местом Wait() возвращается сразу, блокировки нет." }
    },
    {
      t: 'multi',
      q: "Какие правки в LoadAsync действительно нужны?",
      options: [
        "await _throttle.WaitAsync(ct) вместо Wait()",
        "Release и уменьшение счётчика в finally",
        "Заменить lock (_sync) на Mutex",
        "await Task.Delay(50, ct) вместо Thread.Sleep(50)"
      ],
      answer: [0, 1, 3],
      explain: "lock вокруг записи в словарь здесь как раз в порядке и короткий. Mutex тяжелее, привязан к потоку и ничего не исправляет. Остальные три правки убирают блокировки и потерю места."
    },
    {
      t: 'blanks',
      q: "Замени флажок остановки на токен: допиши фоновый цикл.",
      code: 'private readonly CancellationTokenSource _cts = new ___();\n\npublic void StartBackgroundCompaction()\n{\n    Task.___(async () =>\n    {\n        while (!_cts.Token.IsCancellationRequested)\n        {\n            Compact();\n            await Task.Delay(1000, _cts.Token);\n        }\n    });\n}\n\npublic void Stop() => _cts.___();',
      tiles: ['CancellationTokenSource', 'Run', 'Cancel', 'StartNew', 'Dispose'],
      answer: ['CancellationTokenSource', 'Run', 'Cancel'],
      explain: "Task.Run разворачивает async-лямбду, Cancel сигналит и циклу, и Delay. Task.Delay при отмене бросает исключение, поэтому в реальном коде его ловят как OperationCanceledException."
    },
    {
      t: 'order',
      q: "Собери правильную схему LoadAsync по порядку.",
      items: [
        "await _throttle.WaitAsync(ct): неблокирующее ожидание места",
        "try {",
        "Скачать и распарсить тайл, передавая ct",
        "Под lock записать результат в _loaded",
        "} finally { Release; Interlocked.Decrement }"
      ],
      explain: "Место берём до try (иначе при отмене ожидания освободим то, чего не брали) и возвращаем в finally при любом исходе."
    },
    {
      t: 'match',
      q: "Соедини баг и его последствие.",
      pairs: [
        ["Release вне finally", "После четырёх ошибок все загрузки зависают"],
        ["Колбэк Timer пишет в Slider", "Unity API вызывается не с главного потока"],
        ["StartNew(async) без Unwrap", "Ошибки фонового цикла теряются"],
        ["GetOrAdd с запуском в фабрике", "Тайл загружается дважды"],
        ["Повторный SetResult", "InvalidOperationException в LoadAsync"]
      ]
    },
    {
      t: 'choice',
      q: "Игрок жалуется: после нескольких сбоев сети карта больше не подгружается, хотя сеть уже в порядке, а игра не тормозит. Какая причина самая вероятная?",
      options: [
        "Место семафора не возвращается при ошибке (нет finally)",
        "Timer собран сборщиком мусора",
        "Thread.Sleep замораживает главный поток",
        "Не хватает ConfigureAwait(false)"
      ],
      answer: 0,
      explain: "Симптом «тихо перестало грузить после ошибок, без тормозов» это исчерпанный семафор. Заморозка главного потока была бы видна как лаги, проблема с Timer затронула бы только полоску прогресса (а в Mono-рантайме Unity таймер без ссылки и вовсе не собирается)."
    }
  ]
};
