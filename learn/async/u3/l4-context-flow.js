/** Async, раздел 3, урок 4: builder и ExecutionContext. */
export default {
  id: 'as.u3.l4',
  title: 'Builder и ExecutionContext',
  sub: 'Кто собирает задачу и что едет через await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Кто собирает задачу',
      body: '<p>Машина состояний сама задачу не создаёт — это делает <b>builder</b>: <code>AsyncTaskMethodBuilder&lt;T&gt;</code>. Он создаёт Task, подписывает MoveNext на awaiter и в конце вызывает <code>SetResult</code> или <code>SetException</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Внутри async-метода вылетело исключение. Что делает builder?',
      options: ['Вызывает SetException: задача становится Faulted, исключение бросит await', 'Роняет процесс', 'Игнорирует его'],
      answer: 0,
      explain: 'Исключение «едет» внутри задачи до того, кто её дождётся.'
    },
    {
      t: 'learn',
      title: 'ExecutionContext путешествует с await',
      body: '<p>Вместе с продолжением .NET переносит <b>ExecutionContext</b>: текущую культуру, значения AsyncLocal&lt;T&gt; и другие «окружающие» данные. Поэтому AsyncLocal видно после await, даже если продолжение выполняет другой поток.</p>',
      code: 'static AsyncLocal<string> RequestId = new();\n\nRequestId.Value = "req-42";\nawait Task.Delay(100);        // может продолжиться в другом потоке\nLog(RequestId.Value);         // всё равно "req-42"'
    },
    {
      t: 'choice',
      q: 'Что выведет Log после await?',
      options: ['req-42', 'null', 'Зависит от потока'],
      answer: 0,
      explain: 'ExecutionContext перенёс значение AsyncLocal вместе с продолжением.'
    },
    {
      t: 'choice',
      q: 'Чем ExecutionContext отличается от SynchronizationContext?',
      options: ['ExecutionContext — данные, которые едут с кодом; SynchronizationContext — где продолжить выполнение', 'Это одно и то же', 'ExecutionContext есть только в WPF'],
      answer: 0,
      explain: 'ConfigureAwait(false) отключает возврат в SynchronizationContext, но ExecutionContext всё равно переносится.'
    },
    {
      t: 'learn',
      title: 'ThreadStatic против AsyncLocal',
      body: '<p>Поле с [ThreadStatic] принадлежит потоку: если после await код продолжит другой поток, значение «пропадёт». Для данных запроса или операции используют AsyncLocal.</p>',
      deep: 'Изменение AsyncLocal внутри вызванного async-метода не видно вызывающему после возврата: ExecutionContext неизменяемый и копируется при записи. Значение течёт вниз по цепочке вызовов, но не вверх.'
    },
    {
      t: 'multi',
      q: 'Что переносится через await вместе с ExecutionContext? Отметь все.',
      options: ['Значения AsyncLocal', 'Текущая культура (CultureInfo.CurrentCulture)', 'Значения [ThreadStatic]-полей', 'Локальные переменные других потоков'],
      answer: [0, 1],
      explain: 'ThreadStatic остаётся в своём потоке.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Builder', 'Создаёт и завершает Task'],
        ['AsyncLocal', 'Данные, которые едут через await'],
        ['ThreadStatic', 'Данные потока, теряются при смене потока'],
        ['SynchronizationContext', 'Где выполнить продолжение']
      ]
    }
  ]
};
