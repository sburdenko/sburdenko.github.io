/** Async, раздел 3, урок 2: awaiter-паттерн. */
export default {
  id: 'as.u3.l2',
  title: 'Awaiter-паттерн',
  sub: 'Почему ждать можно что угодно',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'await работает с любым, у кого есть GetAwaiter',
      body: '<p><code>await x</code> компилируется примерно так: взять <code>x.GetAwaiter()</code>; если <code>IsCompleted</code> — сразу <code>GetResult()</code>; если нет — подписаться через <code>OnCompleted</code> и выйти.</p><p>Это паттерн, а не интерфейс: подойдёт любой тип с нужными методами — даже метод-расширение.</p>'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['GetAwaiter()', 'Получить объект ожидания'],
        ['IsCompleted', 'Готово ли уже'],
        ['OnCompleted(…)', 'Что вызвать, когда будет готово'],
        ['GetResult()', 'Забрать результат или исключение']
      ]
    },
    {
      t: 'learn',
      title: 'Свой awaitable за две строки',
      body: '<p>Метод-расширение GetAwaiter для TimeSpan — и время можно ждать напрямую.</p>',
      code: 'public static TaskAwaiter GetAwaiter(this TimeSpan t)\n    => Task.Delay(t).GetAwaiter();\n\nawait TimeSpan.FromSeconds(1);   // теперь так можно'
    },
    {
      t: 'choice',
      q: 'Почему await TimeSpan.FromSeconds(1) скомпилировался?',
      options: ['Для TimeSpan появился метод-расширение GetAwaiter — await нужен только он', 'TimeSpan наследует Task', 'Это встроено в C# 12'],
      answer: 0,
      explain: 'Компилятор ищет GetAwaiter так же, как foreach ищет GetEnumerator.'
    },
    {
      t: 'blanks',
      q: 'Собери, во что разворачивается await',
      code: 'var aw = task.___();\nif (!aw.___)\n{\n    // подписаться и выйти\n}\nvar result = aw.GetResult();',
      lang: 'cs',
      tiles: ['GetAwaiter', 'IsCompleted', 'Wait', 'Result'],
      answer: ['GetAwaiter', 'IsCompleted'],
      explain: 'Сначала awaiter, потом проверка готовности.'
    },
    {
      t: 'choice',
      q: 'Что сделает GetResult(), если задача упала?',
      options: ['Бросит её исключение', 'Вернёт null', 'Вернёт AggregateException как значение'],
      answer: 0,
      explain: 'Поэтому await и бросает исходное исключение.'
    },
    {
      t: 'multi',
      q: 'Что можно ждать через await? Отметь все.',
      options: ['Task', 'ValueTask', 'Task.Yield()', 'Awaitable в Unity', 'int без своего GetAwaiter'],
      answer: [0, 1, 2, 3],
      explain: 'У всех, кроме int, есть GetAwaiter.'
    },
    {
      t: 'choice',
      q: 'Зачем писать await Task.Yield()?',
      options: ['Принудительно отдать управление и продолжить чуть позже через очередь', 'Чтобы подождать кадр в Unity', 'Чтобы освободить память'],
      answer: 0,
      explain: 'YieldAwaitable всегда говорит IsCompleted = false — метод гарантированно приостановится.'
    }
  ]
};
