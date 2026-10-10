/** Финал раздела 5 курса async/await: ловушки. */
export default {
  id: 'as.u5.boss',
  title: 'Финал: ловушки',
  sub: 'Найди ошибку в каждом фрагменте',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'tapline',
      q: 'Где ошибка?',
      code: 'public async Task ImportAsync(IEnumerable<Row> rows)\n{\n    foreach (var r in rows)\n        _db.InsertAsync(r);\n    await _db.CommitAsync();\n}',
      answer: 3,
      explain: 'InsertAsync без await — коммит пойдёт раньше вставок, ошибки потеряются.'
    },
    {
      t: 'tapline',
      q: 'Что не скомпилируется?',
      code: 'lock (_sync)\n{\n    var data = await LoadAsync();\n    _cache = data;\n}',
      answer: 2,
      explain: 'CS1996: await внутри lock запрещён. Нужен SemaphoreSlim.WaitAsync.'
    },
    {
      t: 'choice',
      q: 'TaskCompletionSource завершают из колбэка библиотеки под её внутренним замком. Что поставить при создании?',
      options: ['TaskCreationOptions.RunContinuationsAsynchronously', 'TaskCreationOptions.LongRunning', 'Ничего'],
      answer: 0,
      explain: 'Иначе продолжения ожидающих выполнятся прямо под чужим замком.'
    },
    {
      t: 'choice',
      q: 'Где async void допустим?',
      options: ['В обработчике события', 'В методе библиотеки', 'В методе сохранения в базу'],
      answer: 0,
      explain: 'Везде, кроме обработчиков, — async Task.'
    },
    {
      t: 'multi',
      q: 'Как ограничить число одновременных запросов? Отметь все.',
      options: ['Parallel.ForEachAsync с MaxDegreeOfParallelism', 'SemaphoreSlim(N, N) и WaitAsync', 'Ограниченный Channel и N потребителей', 'Task.WhenAll на всю коллекцию'],
      answer: [0, 1, 2],
      explain: 'WhenAll не ограничивает ничего.'
    },
    {
      t: 'blanks',
      q: 'Асинхронная очистка соединения',
      code: '___ using var conn = new SqlConnection(cs);',
      lang: 'cs',
      tiles: ['await', 'async', 'lock', 'static'],
      answer: ['await'],
      explain: 'await using вызовет DisposeAsync.'
    },
    {
      t: 'choice',
      q: 'Чем хорош IAsyncEnumerable для чтения огромного файла?',
      options: ['Элементы обрабатываются по мере чтения, без загрузки всего файла в память', 'Он сжимает файл', 'Он читает файл в несколько потоков'],
      answer: 0,
      explain: 'Поток данных вместо одного огромного списка.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['CS4014', 'Забыли await'],
        ['CS1996', 'await внутри lock'],
        ['TrySetResult', 'Завершить TCS один раз'],
        ['BoundedChannel', 'Обратное давление']
      ]
    }
  ]
};
