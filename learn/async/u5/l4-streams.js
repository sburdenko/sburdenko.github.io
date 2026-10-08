/** Async, раздел 5, урок 4: IAsyncEnumerable и await using. */
export default {
  id: 'as.u5.l4',
  title: 'Асинхронные потоки и await using',
  sub: 'await foreach, yield и DisposeAsync',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Данные по мере прихода',
      body: '<p>Метод с async и yield return возвращает <code>IAsyncEnumerable&lt;T&gt;</code>: элементы приходят по одному, и между ними можно ждать. Читают через <code>await foreach</code>.</p>',
      code: 'async IAsyncEnumerable<Order> ReadOrdersAsync()\n{\n    await foreach (var line in File.ReadLinesAsync(path))   // .NET 7+\n        yield return Parse(line);\n}\n\nawait foreach (var o in ReadOrdersAsync())\n    Handle(o);'
    },
    {
      t: 'choice',
      q: 'Чем IAsyncEnumerable<T> лучше Task<List<T>>?',
      options: ['Первые элементы можно обрабатывать, не дожидаясь загрузки всех', 'Он всегда быстрее', 'Он не занимает память'],
      answer: 0,
      explain: 'Миллион строк из файла не нужно держать в памяти целиком.'
    },
    {
      t: 'blanks',
      q: 'Прочитай асинхронную последовательность',
      code: '___ ___ (var o in ReadOrdersAsync())\n    Handle(o);',
      lang: 'cs',
      tiles: ['await', 'foreach', 'for', 'async', 'using'],
      answer: ['await', 'foreach'],
      explain: 'await foreach ждёт каждый следующий элемент.'
    },
    {
      t: 'learn',
      title: 'Отмена в асинхронном потоке',
      body: '<p>Потребитель передаёт токен через <code>.WithCancellation(ct)</code>, а метод-генератор получает его в параметре с атрибутом <code>[EnumeratorCancellation]</code>.</p>'
    },
    {
      t: 'learn',
      title: 'await using',
      body: '<p>Если очистка ресурса сама асинхронная (дописать буфер в сеть, закрыть соединение), тип реализует <code>IAsyncDisposable</code> с методом <code>DisposeAsync()</code>. <code>await using</code> вызовет и дождётся его в конце блока.</p>',
      code: 'await using var conn = new SqlConnection(cs);\nawait conn.OpenAsync();'
    },
    {
      t: 'choice',
      q: 'Чем await using отличается от using?',
      options: ['Вызывает DisposeAsync и дожидается его, не блокируя поток', 'Ничем', 'Освобождает память быстрее'],
      answer: 0,
      explain: 'Обычный using вызвал бы синхронный Dispose, который может заблокировать поток.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['await foreach работает с IAsyncEnumerable', 'yield return в async-методе даёт IAsyncEnumerable', 'await using вызывает DisposeAsync', 'await foreach загружает все элементы сразу', 'IAsyncDisposable заменяет финализатор'],
      answer: [0, 1, 2],
      explain: 'Элементы приходят по одному, а финализатор — совсем другой механизм.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['IAsyncEnumerable', 'Асинхронная последовательность'],
        ['await foreach', 'Читать её'],
        ['IAsyncDisposable', 'Асинхронная очистка'],
        ['[EnumeratorCancellation]', 'Получить токен в генераторе']
      ]
    }
  ]
};
