/** Async, раздел 5, урок 5: Channel<T> и Parallel.ForEachAsync. */
export default {
  id: 'as.u5.l5',
  title: 'Channel и Parallel.ForEachAsync',
  sub: 'Конвейеры и ограничение параллельности',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Конвейер: производитель → потребитель',
      body: '<p><code>Channel&lt;T&gt;</code> — асинхронная очередь: одни пишут через WriteAsync, другие читают через ReadAllAsync.</p><p>Ограниченный канал (CreateBounded) заставляет быстрого производителя подождать, пока потребитель разгребёт очередь. Это <b>обратное давление</b> (backpressure).</p>',
      code: 'var ch = Channel.CreateBounded<Job>(100);\n\n// производитель\nawait ch.Writer.WriteAsync(job);\n\n// потребитель\nawait foreach (var job in ch.Reader.ReadAllAsync())\n    await HandleAsync(job);'
    },
    {
      t: 'choice',
      q: 'Канал на 100 элементов заполнен. Что сделает WriteAsync?',
      options: ['Подождёт асинхронно, пока освободится место', 'Выбросит самый старый элемент', 'Бросит исключение'],
      answer: 0,
      explain: 'Это поведение по умолчанию (BoundedChannelFullMode.Wait). Выбрасывать элементы можно, если явно попросить.'
    },
    {
      t: 'choice',
      q: 'Зачем ограничивать канал?',
      options: ['Чтобы быстрый производитель не забил память, когда потребитель не успевает', 'Чтобы канал работал быстрее', 'Так требует .NET'],
      answer: 0,
      explain: 'Без лимита очередь может расти, пока не кончится память.'
    },
    {
      t: 'learn',
      title: 'Parallel.ForEachAsync',
      body: '<p>С .NET 6 можно обработать коллекцию асинхронно с лимитом параллельности. Он не запустит 10 000 запросов разом.</p>',
      code: 'await Parallel.ForEachAsync(urls,\n    new ParallelOptions { MaxDegreeOfParallelism = 8 },\n    async (url, ct) => await DownloadAsync(url, ct));'
    },
    {
      t: 'choice',
      q: 'Нужно скачать 10 000 файлов, но не больше 8 одновременно. Что выбрать?',
      options: ['Parallel.ForEachAsync с MaxDegreeOfParallelism = 8', 'Task.WhenAll сразу на все 10 000', 'Последовательный await в цикле'],
      answer: 0,
      explain: 'WhenAll на 10 000 задач завалит сервер, а последовательный цикл будет идти вечность.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Channel — асинхронная очередь между частями программы', 'Ограниченный канал даёт обратное давление', 'Parallel.ForEachAsync ограничивает число одновременных операций', 'Task.WhenAll сам ограничивает параллельность', 'Channel хранит данные на диске'],
      answer: [0, 1, 2],
      explain: 'WhenAll ждёт всё, что ему дали, — ограничивать нужно самому.'
    },
    {
      t: 'blanks',
      q: 'Ограничь параллельность',
      code: 'await Parallel.ForEachAsync(urls,\n    new ParallelOptions { ___ = 8 },\n    async (url, ct) => await DownloadAsync(url, ct));',
      lang: 'cs',
      tiles: ['MaxDegreeOfParallelism', 'BoundedCapacity', 'Timeout', 'Priority'],
      answer: ['MaxDegreeOfParallelism'],
      explain: 'Не больше 8 загрузок одновременно.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Channel<T>', 'Асинхронная очередь'],
        ['CreateBounded', 'Очередь с лимитом и ожиданием'],
        ['ReadAllAsync', 'Читать, пока канал не закрыт'],
        ['Parallel.ForEachAsync', 'Обработать коллекцию с лимитом']
      ]
    }
  ]
};
