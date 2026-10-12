/** Async/await до дна, раздел «Синхронизация глубже», урок 5: двойная проверка, Lazy<T> и конкурентные коллекции. */
export default {
  id: 'as.u8.l5',
  title: 'Lazy и конкурентные коллекции',
  sub: 'Двойная проверка, режимы Lazy<T>, ConcurrentDictionary.GetOrAdd',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Двойная проверка',
      body: '<p>Объект дорогой, создать его нужно один раз, а читают его постоянно. Брать <code>lock</code> на каждое чтение жалко. Отсюда <b>двойная проверка</b> (double-checked locking):</p><ul><li>первая проверка — без замка: объект уже есть — сразу отдаём;</li><li>нет — берём замок и проверяем <b>ещё раз</b>: пока мы ждали замок, другой поток мог успеть создать объект.</li></ul><p>Работает ли это без <code>volatile</code>? По общей спецификации ECMA — нет. В CoreCLR — да: запись ссылки на объект является release, а чтение через ссылку уважает зависимость по данным (урок 1). Но только при условии, что объект полностью готов <b>до</b> записи ссылки в поле.</p>',
      code: 'private static Settings? _inst;\nprivate static readonly object _gate = new();\n\npublic static Settings Instance\n{\n    get\n    {\n        if (_inst == null)                 // 1: без замка\n        {\n            lock (_gate)\n            {\n                if (_inst == null)         // 2: под замком\n                    _inst = Settings.Load();\n            }\n        }\n        return _inst;\n    }\n}',
      deep: '<p>Для синглтона двойная проверка обычно не нужна вовсе. <code>static readonly Settings Instance = Settings.Load();</code> — и CLR сам гарантирует, что инициализатор типа выполнится ровно один раз, под своим внутренним замком. Цена — меньше контроля над моментом создания: без статического конструктора тип помечен <code>beforefieldinit</code>, и инициализация может случиться раньше первого обращения.</p>'
    },
    {
      t: 'tapline',
      q: 'Другой поток иногда получает Settings с пустыми полями. Какая строка выпускает объект наружу раньше, чем он готов?',
      code: 'if (_inst == null)\n{\n    lock (_gate)\n    {\n        if (_inst == null)\n        {\n            _inst = new Settings();\n            _inst.LoadFromDisk();\n        }\n    }\n}\nreturn _inst;',
      answer: 6,
      explain: 'После этой строки поле уже не null, и первая проверка в другом потоке пропустит его мимо замка — к объекту, который ещё не загружен. Создай и настрой объект в локальной переменной, а в поле запиши последним действием.'
    },
    {
      t: 'learn',
      title: 'Lazy<T>: двойная проверка, написанная за тебя',
      body: '<p><code>Lazy&lt;T&gt;</code> хранит фабрику и вызывает её при первом обращении к <code>Value</code>. Как он ведёт себя под конкуренцией, задаёт <code>LazyThreadSafetyMode</code>:</p><ul><li><b>ExecutionAndPublication</b> (по умолчанию) — фабрика под замком, запускается <b>ровно один раз</b>, остальные потоки ждут результат;</li><li><b>PublicationOnly</b> — без замка: фабрику могут запустить несколько потоков одновременно, в поле попадёт первый готовый результат (через CompareExchange), остальные выбрасываются;</li><li><b>None</b> — никакой синхронизации, для объектов одного потока. Самый быстрый.</li></ul>',
      code: 'private static readonly Lazy<Settings> _settings =\n    new(() => Settings.Load());                          // ExecutionAndPublication\n\nprivate static readonly Lazy<Parser> _parser =\n    new(() => new Parser(), LazyThreadSafetyMode.PublicationOnly);\n\npublic static Settings Settings => _settings.Value;'
    },
    {
      t: 'match',
      q: 'Соедини способ ленивой инициализации и поведение',
      pairs: [
        ['ExecutionAndPublication', 'Фабрика под замком, ровно один запуск'],
        ['PublicationOnly', 'Фабрика может выполниться несколько раз, победит первый результат'],
        ['LazyThreadSafetyMode.None', 'Без синхронизации — только для одного потока'],
        ['LazyInitializer.EnsureInitialized', 'Без объекта Lazy: поле и CompareExchange']
      ]
    },
    {
      t: 'learn',
      title: 'Исключения в фабрике и LazyInitializer',
      body: '<p>Неочевидное поведение: если фабрика бросила исключение в режиме <b>ExecutionAndPublication</b> (или None), <code>Lazy</code> <b>запоминает</b> его. Каждое следующее обращение к <code>Value</code> бросит то же исключение, фабрику больше не вызовут. Сбой сети на старте — и объект «сломан» до перезапуска.</p><p>В режиме <b>PublicationOnly</b> исключения не кэшируются: следующее обращение попробует снова.</p><p>Если не хочется держать отдельный объект <code>Lazy</code> на каждое поле, есть <code>LazyInitializer.EnsureInitialized(ref поле, фабрика)</code>. Без явного замка он работает как PublicationOnly: проверяет поле на null и публикует результат через CompareExchange — ровно как код из урока про Interlocked.</p>',
      code: 'private Report? _report;\n\npublic Report Report =>\n    LazyInitializer.EnsureInitialized(ref _report, () => BuildReport());'
    },
    {
      t: 'choice',
      q: 'Lazy<HttpConfig> с режимом по умолчанию. На первом Value фабрика бросила HttpRequestException: сеть не поднялась. Через минуту сеть есть. Что даст следующее обращение к Value?',
      options: ['То же HttpRequestException: исключение закэшировано', 'Фабрика запустится заново и вернёт конфиг', 'null', 'InvalidOperationException: Lazy в состоянии ошибки'],
      answer: 0,
      explain: 'ExecutionAndPublication кэширует исключение фабрики навсегда. Если сбой бывает временным — режим PublicationOnly, свой код с повтором или пересоздание Lazy.',
      wrong: { 1: 'Так ведёт себя только PublicationOnly. Режим по умолчанию запоминает исключение.' }
    },
    {
      t: 'learn',
      title: 'ConcurrentDictionary изнутри',
      body: '<p><code>ConcurrentDictionary</code> — не обычный словарь под одним <code>lock</code>.</p><ul><li><b>Чтение</b> (<code>TryGetValue</code>, индексатор) идёт <b>без замков</b>: корзины публикуются так, что читатель всегда видит целостное состояние.</li><li><b>Запись</b> берёт замок только своей полосы (striped locking): массив замков, каждый закрывает часть корзин. Писатели в разные полосы друг другу не мешают.</li><li>Операции над <b>всем</b> словарём — <code>Count</code>, <code>Keys</code>, <code>Values</code>, <code>ToArray</code> — берут <b>все</b> замки сразу. Вызывать их в горячем цикле — значит останавливать всех писателей.</li><li>Перебор <code>foreach</code> безопасен при параллельных изменениях, но это не снимок: можешь увидеть часть изменений, сделанных во время обхода.</li></ul>'
    },
    {
      t: 'learn',
      title: 'GetOrAdd и фабрика, которая запускается несколько раз',
      body: '<p><code>GetOrAdd(key, factory)</code> выглядит атомарным, но фабрику словарь вызывает <b>вне замка</b> — чтобы чужой медленный или реентерабельный код не держал полосу. Поэтому:</p><ul><li>несколько потоков, одновременно не нашедших ключ, <b>все запустят фабрику</b>;</li><li>в словарь попадёт одно значение, и <b>все</b> получат именно его;</li><li>остальные созданные значения просто выбрасываются — без <code>Dispose</code>.</li></ul><p>Для дешёвой фабрики это неважно. Для дорогой или с побочным эффектом (соединение, файл, платный запрос) — кладут в словарь не значение, а <code>Lazy&lt;T&gt;</code>. Лишние <code>Lazy</code> создаются почти даром, а фабрика внутри победившего запустится один раз.</p>',
      code: 'var cache = new ConcurrentDictionary<string, Connection>();\n\n// 10 потоков одновременно — фабрика может отработать до 10 раз\nvar c = cache.GetOrAdd("db", key => Connection.Open(key));',
      deep: '<p>То же с <code>AddOrUpdate</code>: функцию обновления словарь тоже вызывает вне замка и при гонке повторяет — это CAS-цикл над значением. Поэтому в неё нельзя класть побочные эффекты. Есть перегрузки <code>GetOrAdd&lt;TArg&gt;(key, factory, arg)</code>: аргумент передаётся явно, и лямбда не захватывает переменные — без аллокации замыкания на каждый вызов.</p>'
    },
    {
      t: 'choice',
      q: '10 потоков одновременно вызывают GetOrAdd с одним новым ключом. Что верно?',
      options: ['Фабрика может выполниться от 1 до 10 раз, но все потоки получат одно и то же значение', 'Фабрика выполнится ровно один раз: GetOrAdd атомарен', 'Каждый поток получит своё значение, в словаре останется последнее', 'Девять потоков получат исключение: ключ уже добавлен'],
      answer: 0,
      explain: 'Фабрика вне замка, поэтому её запуски не ограничены. А вставка — под замком полосы: первая вставка побеждает, остальные потоки видят ключ при повторной проверке и возвращают значение победителя.'
    },
    {
      t: 'blanks',
      q: 'Сделай так, чтобы дорогое соединение открывалось один раз на ключ',
      code: 'var cache = new ConcurrentDictionary<string, Lazy<Connection>>();\n\nvar conn = cache\n    .GetOrAdd(key, k => new ___<Connection>(() => Connection.Open(k)))\n    .___;',
      tiles: ['Lazy', 'Value', 'Task', 'Result', 'Func'],
      answer: ['Lazy', 'Value'],
      explain: 'Несколько потоков могут создать по объекту Lazy, но в словарь попадёт один, и все вызовут Value у него. Режим по умолчанию ExecutionAndPublication гарантирует единственный Connection.Open. Помни о кэше исключений: упавшее открытие останется в словаре — его удаляют через TryRemove.'
    },
    {
      t: 'learn',
      title: 'Остальные коллекции и ловушка «проверил — сделал»',
      body: '<ul><li><b>ConcurrentQueue</b> — без замков на обычном пути, сегменты-массивы; лучший выбор для FIFO между потоками.</li><li><b>ConcurrentStack</b> — связный список на CAS-цикле, как стек из урока про Interlocked.</li><li><b>ConcurrentBag</b> — у каждого потока свой список; выгоден, когда один и тот же поток и кладёт, и забирает. Как очередь общего назначения — медленнее ConcurrentQueue.</li><li><b>BlockingCollection</b> — блокирующая обёртка с ограничением ёмкости. В асинхронном коде её заменяет <code>Channel</code>.</li></ul><p>Главная ловушка: потокобезопасна <b>каждая операция</b>, но не их комбинация. <code>if (!d.ContainsKey(k)) d[k] = v;</code> — между проверкой и записью успеет другой поток. Нужна одна операция: <code>TryAdd</code>, <code>GetOrAdd</code>, <code>AddOrUpdate</code>, <code>TryRemove</code>, <code>TryUpdate</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Чтение из ConcurrentDictionary не берёт замков', 'Count у ConcurrentDictionary дешёвый: читает одно поле', 'Lazy в режиме по умолчанию запоминает исключение фабрики', 'Фабрика GetOrAdd вызывается под замком полосы', 'Пара ContainsKey + индексатор не атомарна, даже у ConcurrentDictionary'],
      answer: [0, 2, 4],
      explain: 'Count берёт все замки словаря. Фабрику GetOrAdd словарь нарочно вызывает вне замка, поэтому она может отработать несколько раз. Атомарна только одна операция, а не их последовательность.'
    }
  ]
};
