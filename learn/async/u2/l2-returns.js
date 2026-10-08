/** Async, раздел 2, урок 2: Task, Task<T>, ValueTask, async void. */
export default {
  id: 'as.u2.l2',
  title: 'Что возвращать',
  sub: 'Task, ValueTask и опасный async void',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Task, Task<T>, ValueTask<T>',
      body: '<p><code>Task</code> — результата нет, но дождаться можно.<br><code>Task&lt;T&gt;</code> — вернёт T.<br><code>ValueTask&lt;T&gt;</code> — то же, но без выделения памяти, если результат часто готов сразу (например, из кэша). Ждать его можно только один раз.</p>'
    },
    {
      t: 'learn',
      title: 'async void — только для обработчиков событий',
      body: '<p><code>async void</code> нельзя дождаться: вызывающий не узнает, когда метод закончился. А исключение из него не поймать снаружи: оно уйдёт в контекст синхронизации и чаще всего уронит приложение.</p><p>Пиши async void только там, где сигнатуру диктует событие: <code>button.Click += async (s, e) =&gt; …</code></p>'
    },
    {
      t: 'choice',
      q: 'Почему async void опасен?',
      options: ['Его нельзя дождаться, а исключение из него не поймать через try вокруг вызова', 'Он медленнее', 'Он не умеет await'],
      answer: 0,
      explain: 'Нет задачи — нечего ждать и не через что передать исключение.'
    },
    {
      t: 'tapline',
      q: 'Какая строка — ошибка дизайна?',
      code: 'public async void SaveAsync(Order o)\n{\n    await db.InsertAsync(o);\n}\npublic async Task LoadAsync() => await db.LoadAsync();',
      answer: 0,
      explain: 'SaveAsync не обработчик события — ему нужен async Task, чтобы его можно было дождаться.'
    },
    {
      t: 'choice',
      q: 'Когда ValueTask<T> выгоднее Task<T>?',
      options: ['Когда результат часто готов сразу и метод вызывают очень часто', 'Всегда', 'Когда метод долго ждёт сеть'],
      answer: 0,
      explain: 'Экономия — только на быстром пути без ожидания. Если метод всегда ждёт, разницы почти нет.'
    },
    {
      t: 'multi',
      q: 'Что нельзя делать с ValueTask? Отметь все.',
      options: ['Ждать его дважды', 'Ждать его из двух мест одновременно', 'Брать .Result, пока он не завершён', 'Один раз сделать await'],
      answer: [0, 1, 2],
      explain: 'Нужно больше — вызови .AsTask() и работай с обычной задачей.',
      deep: 'ValueTask может оборачивать переиспользуемый IValueTaskSource. После первого await его содержимое может уже принадлежать другой операции — отсюда строгие правила.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Task', 'Дождаться без результата'],
        ['Task<T>', 'Дождаться результата T'],
        ['ValueTask<T>', 'Без аллокации, если готово сразу'],
        ['async void', 'Только обработчики событий']
      ]
    },
    {
      t: 'blanks',
      q: 'Исправь сигнатуру',
      code: 'public async ___ SaveAsync(Order o)\n{\n    await db.InsertAsync(o);\n}',
      lang: 'cs',
      tiles: ['Task', 'void', 'object', 'int'],
      answer: ['Task'],
      explain: 'async Task — метод без результата, который можно дождаться.'
    }
  ]
};
