/** Async, раздел 2, урок 4: несколько задач — WhenAll и WhenAny. */
export default {
  id: 'as.u2.l4',
  title: 'Несколько задач сразу',
  sub: 'По очереди, WhenAll и WhenAny',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'По очереди или вместе',
      body: '<p>Три независимых запроса можно ждать по очереди: await, await, await — время сложится.</p><p>А можно запустить все три сразу и ждать вместе через <code>Task.WhenAll</code> — время будет как у самого долгого.</p>'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Три запроса: 300, 500 и 200 мс. Добейся общего времени не больше 500 мс.',
      goal: { kind: 'time', mode: 'all', max: 500 },
      solve: ['mode:all']
    },
    {
      t: 'choice',
      q: 'Сколько займёт последовательный вариант?',
      options: ['1 000 мс', '500 мс', '300 мс'],
      answer: 0,
      explain: '300 + 500 + 200. Каждый следующий запрос стартует после предыдущего.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Вернись к «по очереди» и урони первый запрос. Что стало с остальными?',
      goal: { kind: 'skip' },
      solve: ['fail:A']
    },
    {
      t: 'choice',
      q: 'Почему при последовательном await после падения A запросы B и C даже не начались?',
      options: ['await A бросил исключение, и до строк с B и C выполнение не дошло', 'WhenAll их отменил', 'Сервер отказал всем'],
      answer: 0,
      explain: 'Исключение прерывает метод на первом же await.'
    },
    {
      t: 'learn',
      title: 'WhenAny — кто первый',
      body: '<p><code>Task.WhenAny</code> возвращает первую завершившуюся задачу. Удобно для «кто быстрее ответит» и для таймаутов.</p><p>Сам WhenAny не бросает: проверь победителя или сделай await его.</p>'
    },
    {
      t: 'choice',
      q: 'Нужны данные от самого быстрого из трёх зеркал. Что использовать?',
      options: ['Task.WhenAny', 'Task.WhenAll', 'Последовательный await'],
      answer: 0,
      explain: 'Остальные задачи стоит отменить токеном, чтобы не тратили ресурсы.'
    },
    {
      t: 'tapline',
      q: 'Почему запросы всё равно идут по очереди?',
      code: 'var tasks = new List<Task<string>>();\nforeach (var url in urls)\n{\n    var html = await http.GetStringAsync(url);\n    tasks.Add(Task.FromResult(html));\n}\nawait Task.WhenAll(tasks);',
      answer: 3,
      explain: 'await внутри цикла ждёт каждый запрос до запуска следующего. Нужно добавлять в список сами задачи, без await.'
    },
    {
      t: 'blanks',
      q: 'Запусти все запросы разом',
      code: 'var tasks = urls.Select(u => http.GetStringAsync(u));\nstring[] pages = await Task.___(tasks);',
      lang: 'cs',
      tiles: ['WhenAll', 'WhenAny', 'Run', 'Delay'],
      answer: ['WhenAll'],
      explain: 'WhenAll вернёт массив результатов в том же порядке.'
    }
  ]
};
