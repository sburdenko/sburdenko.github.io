/** Async, раздел 5, урок 2: lock и await, SemaphoreSlim. */
export default {
  id: 'as.u5.l2',
  title: 'lock и await',
  sub: 'Асинхронный замок — SemaphoreSlim',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'await внутри lock нельзя',
      body: '<p>Компилятор не даст: ошибка CS1996. lock принадлежит потоку, а после await метод может продолжиться в другом — и отпускать замок пришлось бы не тому потоку, который его взял.</p>'
    },
    {
      t: 'choice',
      q: 'Почему нельзя await внутри lock?',
      options: ['lock привязан к потоку, а после await метод может продолжиться в другом потоке', 'Это медленно', 'lock не поддерживает Task'],
      answer: 0,
      explain: 'Monitor требует, чтобы Exit вызвал тот же поток, что и Enter.'
    },
    {
      t: 'learn',
      title: 'SemaphoreSlim — асинхронный замок',
      body: '<p><code>SemaphoreSlim(1, 1)</code> пускает внутрь одного. Его <code>WaitAsync</code> ждёт без блокировки потока, а отпустить можно из любого потока.</p>',
      code: 'static readonly SemaphoreSlim _gate = new(1, 1);\n\nawait _gate.WaitAsync();\ntry\n{\n    await WriteToFileAsync(data);\n}\nfinally\n{\n    _gate.Release();\n}'
    },
    {
      t: 'blanks',
      q: 'Собери асинхронный замок',
      code: 'await _gate.___();\ntry { await WriteAsync(); }\nfinally { _gate.___(); }',
      lang: 'cs',
      tiles: ['WaitAsync', 'Release', 'Wait', 'Dispose', 'Enter'],
      answer: ['WaitAsync', 'Release'],
      explain: 'Wait() тоже есть, но он блокирует поток.'
    },
    {
      t: 'choice',
      q: 'Зачем Release в finally?',
      options: ['Иначе при исключении семафор останется занятым навсегда', 'Так быстрее', 'Иначе не скомпилируется'],
      answer: 0,
      explain: 'Забытый Release — тот же deadlock, только тихий.'
    },
    {
      t: 'choice',
      q: 'Что значит new SemaphoreSlim(3, 3)?',
      options: ['Внутрь одновременно пустят до трёх', 'Три попытки на вход', 'Три секунды ожидания'],
      answer: 0,
      explain: 'Семафор со счётчиком ограничивает параллельность — например, число одновременных запросов к API.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['WaitAsync не блокирует поток, пока ждёт', 'SemaphoreSlim не привязан к потоку', 'lock можно использовать вокруг await', 'Release можно не вызывать — GC отпустит'],
      answer: [0, 1],
      explain: 'Семафор никто не отпустит за тебя.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['lock', 'Синхронный замок, привязан к потоку'],
        ['SemaphoreSlim', 'Асинхронный замок со счётчиком'],
        ['WaitAsync', 'Подождать без блокировки потока'],
        ['CS1996', 'await внутри lock']
      ]
    }
  ]
};
