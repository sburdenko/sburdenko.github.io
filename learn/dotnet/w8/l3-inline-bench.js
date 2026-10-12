/** .NET изнутри, раздел «Производительность рантайма», урок 3: встраивание, девиртуализация и честный замер в BenchmarkDotNet. */
export default {
  id: 'dotnet.w8.l3',
  title: 'Встраивание, девиртуализация и замер',
  sub: 'Inlining, sealed, guarded devirtualization и BenchmarkDotNet',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'Встраивание: вызова больше нет',
      body: '<p><b>Встраивание</b> (inlining) — JIT копирует тело вызываемого метода прямо в вызывающий. Экономия на самом вызове скромная. Главное — что открывается после: JIT видит аргументы и тело вместе и может упростить код дальше — свернуть константы, убрать проверку границ массива, разложить структуру по регистрам.</p><p>Напомним из урока 1: Tier 0 не встраивает ничего. Встраивание — работа Tier 1, R2R и Native AOT.</p>',
      code: 'static int Square(int x) => x * x;\n\nstatic int Area() => Square(5);\n// после встраивания: return 25;\n// ни вызова, ни умножения',
      deep: '<p>Решение принимается по CIL вызываемого метода. Грубая картина эвристик RyuJIT: совсем маленькие методы (порядка 16 байт IL — геттеры, обёртки) встраиваются почти всегда; крупнее — по модели выгоды, которая учитывает константные аргументы, циклы, профиль; методы больше примерно 100 байт IL обычно не встраиваются. Пороги — деталь реализации и меняются между версиями.</p><p>Цена встраивания — рост машинного кода. Слишком много встраивания раздувает горячий код и бьёт по кэшу инструкций, поэтому JIT и осторожничает.</p>'
    },
    {
      t: 'choice',
      q: 'Почему встраивание часто ускоряет код сильнее, чем стоит сам вызов?',
      options: ['После вставки тела JIT видит аргументы и может упростить код дальше', 'Встроенный метод выполняется параллельно на другом ядре', 'Во встроенном коде не работает сборщик мусора', 'Встроенный код сохраняется на диск и не компилируется повторно'],
      answer: 0,
      explain: 'Вызов стоит немного. Выигрыш — в оптимизациях, которые становятся возможны, когда тело метода и его аргументы оказались в одном месте: константы сворачиваются, проверки исчезают.'
    },
    {
      t: 'learn',
      title: 'Что мешает встраиванию',
      body: '<ul><li><b>Размер</b>: большое тело встраивать невыгодно.</li><li><b>Виртуальность</b>: у виртуального или интерфейсного вызова JIT не знает, чьё тело вставлять.</li><li><b>Обработка исключений</b>: долго методы с <code>try</code>/<code>catch</code>/<code>finally</code> не встраивались вовсе; в .NET 10 JIT научился встраивать часть из них, прежде всего с <code>try</code>/<code>finally</code>.</li><li><b>throw</b>: метод, который только бросает, не встраивают, а <code>throw</code> внутри раздувает тело.</li><li>Рекурсия и <code>[MethodImpl(MethodImplOptions.NoInlining)]</code>.</li></ul><p><code>[MethodImpl(MethodImplOptions.AggressiveInlining)]</code> снимает ограничение по размеру, но не остальные: виртуальный вызов с ним всё равно не встроится. Классический приём — вынести бросок в отдельный метод, чтобы горячий остался маленьким.</p>',
      code: 'public int this[int i]\n{\n    get\n    {\n        if ((uint)i >= (uint)_count)\n            ThrowIndex();      // холодный путь — отдельный метод\n        return _items[i];\n    }\n}\n\n[DoesNotReturn]\nstatic void ThrowIndex() => throw new ArgumentOutOfRangeException("i");',
      deep: '<p>Так устроены сами библиотеки .NET: внутренние классы ThrowHelper держат весь код бросков отдельно. JIT видит, что метод не возвращается, и уводит его вызов в холодную часть кода.</p><p>Почему встраивание не случилось, рантайм сообщает событием <code>MethodJitInliningFailed</code> с текстовой причиной (его видно в PerfView и <code>dotnet-trace</code>). Быстрее посмотреть машинный код через <code>DOTNET_JitDisasm</code>: остался <code>call</code> — не встроено.</p>'
    },
    {
      t: 'tapline',
      q: 'Get крошечный, но в Sum его не встроят. Какая строка виновата?',
      code: 'class Cache\n{\n    private readonly int[] _items = new int[16];\n\n    public virtual int Get(int i) => _items[i & 15];\n\n    public int Sum() => Get(0) + Get(1);\n}',
      answer: 4,
      explain: 'Get виртуальный: this может оказаться наследником Cache с другим Get, и JIT не знает, чьё тело вставлять. Помогут sealed у класса или отказ от virtual.'
    },
    {
      t: 'learn',
      title: 'Девиртуализация: вернуть прямой вызов',
      body: '<p>Если JIT <b>доказал</b> точный тип объекта, виртуальный вызов становится прямым — и его можно встроить. Откуда JIT это знает:</p><ul><li>класс или метод помечен <code>sealed</code> — наследников с другим телом быть не может;</li><li>объект создан тут же, через <code>new</code>;</li><li>объект лежит в <code>static readonly</code>-поле, и Tier 1 видит его тип (урок 1);</li><li>это структура: от неё не наследуются.</li></ul><p>Поэтому <code>sealed</code> на классах без наследников — бесплатная подсказка JIT. Анализатор <b>CA1852</b> предлагает запечатать внутренние классы, у которых нет наследников.</p>',
      code: 'abstract class Shape { public abstract double Area(); }\n\nsealed class Circle : Shape\n{\n    public double R;\n    public override double Area() => Math.PI * R * R;\n}\n\ndouble One(Circle c) => c.Area(); // тип точно Circle: прямой вызов\ndouble Any(Shape s) => s.Area();  // тип неизвестен: вызов через таблицу методов',
      deep: '<p>Дженерики со структурой: для каждого значимого T JIT делает отдельную копию кода, и в <code>M&lt;T&gt;(T x) where T : IShape</code> вызов <code>x.Area()</code> для структуры становится прямым и встраивается. Для ссылочных T код общий, и тип там неизвестен (подробно — в разделе о дженериках изнутри).</p><p><code>sealed</code> ускоряет и проверки типа: <code>obj is Circle</code> для запечатанного класса — одно сравнение указателя на тип, без обхода иерархии.</p>'
    },
    {
      t: 'learn',
      title: 'Guarded devirtualization: ставка по профилю',
      body: '<p>Часто тип статически неизвестен: в <code>Any(Shape s)</code> может прийти что угодно. Но Dynamic PGO видит, что на практике почти всегда приходит <code>Circle</code>. Тогда Tier 1 делает <b>защищённую девиртуализацию</b> (guarded devirtualization, GDV): проверяет тип одним сравнением и на частом пути вызывает метод напрямую — со встраиванием.</p><p>Запасной путь — обычный виртуальный вызов, так что код корректен при любом типе. Если нагрузка изменится, проверка просто начнёт чаще промахиваться: Tier 1 повторно не пересобирается. Тот же приём работает для интерфейсных вызовов и делегатов.</p>',
      code: '// что Tier 1 делает с s.Area(), если профиль говорит «почти всегда Circle»\nif (s.GetType() == typeof(Circle))\n    result = Math.PI * ((Circle)s).R * ((Circle)s).R; // встроено\nelse\n    result = s.Area();                                // обычный вызов'
    },
    {
      t: 'multi',
      q: 'Когда JIT может вызвать s.Area() напрямую или встроить его? Отметь все.',
      options: ['Circle помечен sealed, и переменная имеет тип Circle', 'Объект только что создан через new Circle() в этом же методе', 'Профиль PGO показал, что почти всегда приходит Circle (с проверкой типа)', 'Area помечен AggressiveInlining, а тип объекта неизвестен', 'Метод выполняется в Tier 0'],
      answer: [0, 1, 2],
      explain: 'Нужен точный тип: из sealed, из new рядом или из профиля — под проверкой. AggressiveInlining не говорит, чьё тело вставлять, а Tier 0 не встраивает вообще.'
    },
    {
      t: 'learn',
      title: 'BenchmarkDotNet: замер, которому можно верить',
      body: '<p>Почему <code>Stopwatch</code> вокруг одного вызова врёт: первый вызов включает JIT и медленный Tier 0, Debug-сборка не оптимизирована, один прогон тонет в шуме, а сборка мусора от чужого кода может случиться посреди замера.</p><p><b>BenchmarkDotNet</b> делает это за тебя: собирает проект в Release, запускает каждый бенчмарк в отдельном процессе, прогревает метод до стабильного времени, делает много итераций и считает статистику. Неоптимизированную сборку он запускать откажется.</p>',
      code: 'using BenchmarkDotNet.Attributes;\nusing BenchmarkDotNet.Running;\n\nBenchmarkRunner.Run<ShapeBench>();\n\n[MemoryDiagnoser]\npublic class ShapeBench\n{\n    private Shape _any = new Circle { R = 2 };\n    private Circle _circle = new Circle { R = 2 };\n\n    [Benchmark(Baseline = true)]\n    public double Virtual() => _any.Area();\n\n    [Benchmark]\n    public double Sealed() => _circle.Area();\n}',
      deep: '<p>Запуск — <code>dotnet run -c Release</code>. Столбцы: Mean — среднее, Error — половина 99,9%-го доверительного интервала, StdDev — разброс, Ratio — отношение к Baseline, Allocated и Gen0 — от <code>[MemoryDiagnoser]</code>.</p><p>Сравнить рантаймы и настройки можно в одном прогоне: <code>[SimpleJob(RuntimeMoniker.Net80)]</code>, <code>[SimpleJob(RuntimeMoniker.NativeAot80)]</code>, а через конфигурацию задачи — переменные окружения вроде <code>DOTNET_TieredPGO=0</code>. <code>[DisassemblyDiagnoser]</code> покажет машинный код, который на самом деле мерили.</p>'
    },
    {
      t: 'choice',
      q: 'В бенчмарке выше Ratio у Sealed получился около 0,97 — почти как у Virtual. Почему разница такая маленькая?',
      options: ['Dynamic PGO сделал guarded devirtualization: в Virtual тоже встроен Circle.Area за проверкой типа', 'BenchmarkDotNet не умеет мерить виртуальные вызовы', 'Виртуальный вызов в .NET ничего не стоит', 'Замер шёл в Debug-сборке'],
      answer: 0,
      explain: 'В _any всегда лежит Circle, профиль это увидел, и Tier 1 поставил проверку типа с встроенным телом. Осталась разница в одно сравнение. Выключи DOTNET_TieredPGO=0 — и разрыв, скорее всего, вырастет.',
      wrong: { 2: 'Сам по себе виртуальный вызов — косвенный переход и запрет на встраивание. Здесь его спрятал PGO.', 3: 'В Debug BenchmarkDotNet не запустится — он проверяет, что сборка оптимизирована.' }
    },
    {
      t: 'learn',
      title: 'Как обмануть себя: мёртвый код и ленивость',
      body: '<ul><li><b>Dead code elimination</b>: результат не используется — JIT вправе выкинуть вычисление, и ты меряешь пустоту. Возвращай результат из метода: BenchmarkDotNet его «потребит».</li><li><b>Свёртка констант</b>: <code>Square(5)</code> превратится в 25 при компиляции. Входные данные держи в полях, задавай через <code>[Params]</code> и готовь в <code>[GlobalSetup]</code>.</li><li><b>Ленивость LINQ</b>: вернул <code>IEnumerable</code> — замерил только создание запроса. Перебери последовательность: <code>.Consume(consumer)</code> с <code>Consumer</code> из BenchmarkDotNet.</li></ul>',
      code: 'private readonly Consumer _consumer = new();\nprivate int[] _data = null!;\n\n[GlobalSetup]\npublic void Setup() => _data = Enumerable.Range(0, 1000).ToArray();\n\n[Benchmark]\npublic void Bad() => Math.Sqrt(_data.Length); // результат выброшен\n\n[Benchmark]\npublic void Good() => _data.Where(x => x % 2 == 0).Consume(_consumer);'
    },
    {
      t: 'tapline',
      q: 'Какой бенчмарк меряет почти пустую работу?',
      code: '[Benchmark]\npublic int Count() => _data.Count(x => x > 0);\n\n[Benchmark]\npublic IEnumerable<int> Filter() => _data.Where(x => x > 0);\n\n[Benchmark]\npublic int[] FilterAll() => _data.Where(x => x > 0).ToArray();',
      answer: 4,
      explain: 'Where ленивый: Filter только создаёт объект запроса, а фильтрация не начинается. BenchmarkDotNet потребит возвращённую ссылку, но перебирать её не станет. Count и ToArray проходят весь массив.'
    },
    {
      t: 'match',
      q: 'Соедини атрибут или класс BenchmarkDotNet и зачем он нужен',
      pairs: [
        ['[MemoryDiagnoser]', 'Столбцы Allocated и Gen0'],
        ['Baseline = true', 'Столбец Ratio относительно эталона'],
        ['[GlobalSetup]', 'Подготовка данных вне замера'],
        ['Consumer', 'Перебрать последовательность, чтобы её не выкинули'],
        ['[DisassemblyDiagnoser]', 'Машинный код замеренного метода']
      ]
    },
    {
      t: 'order',
      q: 'Как BenchmarkDotNet прогоняет один бенчмарк? Расставь по порядку.',
      items: ['Собирает отдельный проект в Release', 'Запускает отдельный процесс', 'Подбирает число вызовов на итерацию (pilot)', 'Прогревает метод до стабильного времени', 'Делает основные замеры и считает статистику'],
      explain: 'Отдельный процесс отрезает влияние чужого кода и чужого JIT. Пилот подбирает число вызовов, чтобы итерация не была слишком короткой для таймера. Прогрев доводит метод до Tier 1, и только потом идут замеры.'
    }
  ]
};
