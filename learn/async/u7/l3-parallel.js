/** Async, раздел «Задачи без await», урок 3: Parallel.For/ForEach/Invoke и PLINQ для работы процессора. */
export default {
  id: 'as.u7.l3',
  title: 'Parallel и PLINQ',
  sub: 'Все ядра на одну задачу — и когда это не окупается',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Параллелизм данных',
      body: '<p>async — про ожидание. Здесь другое: <b>вычисления</b>. Одна и та же операция над множеством элементов, разложенная по всем ядрам. Для этого есть <code>Parallel.For</code>, <code>Parallel.ForEach</code>, <code>Parallel.Invoke</code> и PLINQ.</p><p>Главное про <code>Parallel.For</code>: он <b>синхронный</b>. Вызывающий поток блокируется до конца всех итераций и сам тоже берёт итерации в работу. Остальное разбирают потоки пула.</p><p>Это инструмент для работы процессора. Для ввода-вывода — <code>Parallel.ForEachAsync</code> из раздела 5.</p>',
      code: 'var pixels = new float[4096 * 4096];\n\nParallel.For(0, pixels.Length, i =>\n{\n    pixels[i] = MathF.Sqrt(i);   // каждая итерация пишет в свою ячейку\n});\n// сюда попадём, когда готовы все итерации',
      deep: '<p>Внутри Parallel создаёт «размножающуюся» задачу: вызывающий поток выполняет её сам, а её копии уходят в пул. Каждая копия забирает диапазоны индексов, и диапазоны растут по ходу работы, — так нагрузка выравнивается, даже если итерации разной длины.</p><p><code>MaxDegreeOfParallelism</code> по умолчанию равен −1, то есть без ограничения: сколько исполнителей дать, решает пул. Если тело итерации блокируется, пул добавляет потоки, и цикл охотно занимает и их. Поэтому блокирующее тело в Parallel — путь к голоду пула из раздела 4.</p>'
    },
    {
      t: 'choice',
      q: 'В обработчике кнопки WPF вызвали Parallel.For с тяжёлой работой на 3 секунды. Что с окном?',
      options: ['Зависнет: Parallel.For синхронный и занимает вызывающий поток', 'Не зависнет: все итерации уходят в пул', 'Бросит InvalidOperationException: из UI-потока нельзя', 'Зависнет, только если ядро одно'],
      answer: 0,
      explain: 'UI-поток ждёт конца цикла и сам считает итерации. Лечение: await Task.Run(() => Parallel.For(…)) — тогда ждать будет поток пула, а UI-поток свободен.'
    },
    {
      t: 'learn',
      title: 'Общие данные: гонка и локальные итоги',
      body: '<p>Итерации идут одновременно. Писать каждой в свою ячейку — можно. Менять общую переменную — гонка, как <code>count++</code> из двух потоков в «.NET изнутри». А <code>lock</code> в каждой итерации выстроит потоки в очередь, и параллельность пропадёт.</p><p>Шаблон: у каждого исполнителя свой <b>локальный итог</b>, а в общий он сливается один раз в конце. Для этого есть перегрузка с <code>localInit</code> и <code>localFinally</code>.</p>',
      code: 'long total = 0;\nParallel.For(0, data.Length,\n    () => 0L,                                    // localInit: свой итог у исполнителя\n    (i, state, local) => local + data[i],        // тело: только локальная сумма\n    local => Interlocked.Add(ref total, local)); // localFinally: слить один раз'
    },
    {
      t: 'tapline',
      q: 'Какая строка теряет увеличения?',
      code: 'int count = 0;\nParallel.ForEach(words, w =>\n{\n    if (w.Length > 5)\n        count++;\n});\nConsole.WriteLine(count);',
      answer: 4,
      explain: 'count++ — чтение, сложение и запись. Два потока читают одно значение, оба пишут +1, одно увеличение теряется. Нужен Interlocked.Increment или локальные итоги.'
    },
    {
      t: 'learn',
      title: 'Остановка, исключения, Invoke',
      body: '<ul><li><code>ParallelLoopState.Stop()</code> — прекратить как можно скорее;</li><li><code>ParallelLoopState.Break()</code> — не начинать итерации с бо́льшими индексами, но доделать все с меньшими. Нужен для поиска первого подходящего;</li><li><code>ParallelOptions</code>: <code>MaxDegreeOfParallelism</code> и <code>CancellationToken</code> (при отмене — <code>OperationCanceledException</code>);</li><li>исключение в итерации: новые итерации не стартуют, начатые доделываются, а все ошибки приходят одним <code>AggregateException</code>.</li></ul><p><code>Parallel.Invoke</code> запускает несколько <b>разных</b> действий и возвращается, когда готовы все.</p>',
      code: 'var opts = new ParallelOptions\n{\n    MaxDegreeOfParallelism = 2,\n    CancellationToken = ct\n};\n\nParallel.Invoke(opts,\n    () => BuildIndex(),\n    () => CompressLogs(),\n    () => ResizeImages());'
    },
    {
      t: 'choice',
      q: 'Ищешь в массиве элемент с наименьшим индексом, подходящий под условие. Что вызвать в итерации, которая его нашла?',
      options: ['state.Break()', 'state.Stop()', 'return из лямбды', 'Cancel() у своего CancellationTokenSource'],
      answer: 0,
      explain: 'Break гарантирует, что все итерации с меньшими индексами выполнятся: если среди них есть подходящий, ты его не пропустишь. Наименьший индекс, на котором вызвали Break, вернёт ParallelLoopResult.LowestBreakIteration.',
      wrong: { 1: 'Stop может оставить невыполненными итерации с меньшими индексами — найденный элемент не обязательно первый.', 2: 'return завершает только текущую итерацию, цикл идёт дальше.' }
    },
    {
      t: 'learn',
      title: 'PLINQ: AsParallel',
      body: '<p>PLINQ — параллельный LINQ to Objects. <code>AsParallel()</code> превращает последовательность в <code>ParallelQuery&lt;T&gt;</code>, и операторы после него выполняются на нескольких потоках.</p><ul><li>Запрос ленивый, как обычный LINQ: работа начнётся при <code>foreach</code> или <code>ToList</code>.</li><li><b>Порядок не сохраняется.</b> <code>AsOrdered()</code> вернёт исходный порядок ценой буферизации.</li><li><code>WithDegreeOfParallelism(n)</code> — сколько исполнителей (по умолчанию по числу ядер), <code>WithCancellation(ct)</code> — отмена.</li><li><code>ForAll(action)</code> — обработать результаты прямо в рабочих потоках, без слияния в один поток.</li></ul>',
      code: 'var hits = files\n    .AsParallel()\n    .WithDegreeOfParallelism(4)\n    .Where(f => Hash(f) == target)   // считается на 4 потоках\n    .ToList();                       // результаты сливаются, порядок любой',
      deep: '<p>PLINQ анализирует форму запроса и для некоторых сочетаний операторов решает выполнить его последовательно, если считает, что параллельность не окупится. <code>WithExecutionMode(ParallelExecutionMode.ForceParallelism)</code> заставляет параллелить.</p><p><code>WithMergeOptions</code> управляет тем, как результаты отдаются потребителю: <code>NotBuffered</code> — по одному сразу, <code>FullyBuffered</code> — все разом в конце, <code>AutoBuffered</code> — порциями (по умолчанию).</p>'
    },
    {
      t: 'choice',
      q: 'Что гарантировано про порядок элементов в r?',
      code: 'int[] r = Enumerable.Range(1, 8)\n    .AsParallel()\n    .Select(x => x * 10)\n    .ToArray();',
      options: ['Ничего: без AsOrdered порядок может быть любым', 'Исходный: ToArray сам восстанавливает порядок', 'Исходный: у Range индексы известны заранее', 'Обратный: последний поток пишет первым'],
      answer: 0,
      explain: 'Без AsOrdered PLINQ не обещает порядок, даже если на маленьком примере он часто совпадает с исходным. Нужен порядок — AsParallel().AsOrdered().'
    },
    {
      t: 'learn',
      title: 'Когда параллельность проигрывает',
      body: '<ul><li><b>Дешёвое тело.</b> Разбиение, вызов делегата, слияние стоят больше, чем <code>x * 2</code>. Тысяча таких итераций последовательно быстрее.</li><li><b>Общее состояние под замком.</b> Потоки стоят в очереди за <code>lock</code>.</li><li><b>Упор в память.</b> Простой проход по огромному массиву ограничен пропускной способностью RAM, а не числом ядер.</li><li><b>Ложное разделение</b> (false sharing). Потоки пишут в соседние ячейки одной кэш-линии и гоняют её между ядрами (кэш-линии — в курсе «Память в .NET»).</li><li><b>Ввод-вывод внутри.</b> Потоки пула стоят и ждут. Тут нужны <code>Parallel.ForEachAsync</code> или <code>WhenAll</code>.</li></ul><p>Решает замер, а не интуиция: BenchmarkDotNet на реальных данных.</p>',
      deep: '<p>Для дешёвого тела нарезай диапазон крупно: <code>Partitioner.Create(0, n)</code> выдаёт пары «от — до», и внутри каждой идёт обычный <code>for</code>. Вызов делегата — один на кусок, а не на элемент:</p><p><code>Parallel.ForEach(Partitioner.Create(0, n), r =&gt; { for (int i = r.Item1; i &lt; r.Item2; i++) a[i] *= 2; });</code></p>'
    },
    {
      t: 'tapline',
      q: 'Почему «всё скачано» печатается раньше, чем всё скачано? Найди строку.',
      code: 'Parallel.ForEach(urls, async url =>\n{\n    var html = await http.GetStringAsync(url);\n    Save(url, html);\n});\nConsole.WriteLine("всё скачано");',
      answer: 0,
      explain: 'Parallel.ForEach принимает Action<T>, и async-лямбда становится async void. Каждая итерация возвращается на первом await, цикл считает её законченной. Ошибки из async void к тому же уронят процесс. Для ввода-вывода — await Parallel.ForEachAsync.'
    },
    {
      t: 'multi',
      q: 'Где Parallel.For или PLINQ, скорее всего, ускорят работу? Отметь все.',
      options: ['Посчитать SHA-256 для 10 000 крупных буферов в памяти', 'Умножить на 2 каждый элемент массива из 1000 int', 'Рассчитать кадр 4K попиксельно тяжёлой формулой на CPU', 'Скачать 500 страниц по HTTP', 'В каждой итерации прибавлять к общему счётчику под lock'],
      answer: [0, 2],
      explain: 'Ускоряется тяжёлая независимая работа процессора. 1000 умножений дешевле накладных расходов, HTTP — это ожидание, а общий lock выстраивает потоки в очередь.'
    },
    {
      t: 'blanks',
      q: 'Разбери тяжёлый разбор логов на 4 потока через PLINQ',
      code: 'var errors = lines\n    .___()\n    .___(4)\n    .Where(l => Parse(l).IsError)\n    .ToList();',
      tiles: ['AsParallel', 'WithDegreeOfParallelism', 'AsOrdered', 'ToParallel', 'MaxDegreeOfParallelism'],
      answer: ['AsParallel', 'WithDegreeOfParallelism'],
      explain: 'AsParallel включает PLINQ, WithDegreeOfParallelism ограничивает число исполнителей. MaxDegreeOfParallelism — свойство ParallelOptions для класса Parallel, а не оператор PLINQ.'
    },
    {
      t: 'match',
      q: 'Соедини инструмент и задачу',
      pairs: [
        ['Parallel.For', 'Цикл по индексам с работой процессора'],
        ['Parallel.Invoke', 'Несколько разных действий сразу'],
        ['AsOrdered', 'Сохранить исходный порядок в PLINQ'],
        ['ForAll', 'Обработать результаты без слияния'],
        ['Parallel.ForEachAsync', 'Асинхронный ввод-вывод с лимитом']
      ]
    }
  ]
};
