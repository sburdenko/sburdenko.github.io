/** Async, раздел 5, урок 3: TaskCompletionSource. */
export default {
  id: 'as.u5.l3',
  title: 'TaskCompletionSource',
  sub: 'Своя задача из колбэков',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Свою задачу — своими руками',
      body: '<p><code>TaskCompletionSource&lt;T&gt;</code> создаёт Task&lt;T&gt;, который ты завершаешь сам: SetResult, SetException, SetCanceled. Так старый API на колбэках превращают в удобный await.</p>',
      code: 'Task<Location> GetLocationAsync()\n{\n    var tcs = new TaskCompletionSource<Location>(\n        TaskCreationOptions.RunContinuationsAsynchronously);\n    gps.OnFix += loc => tcs.TrySetResult(loc);\n    gps.OnError += e => tcs.TrySetException(e);\n    gps.Start();\n    return tcs.Task;\n}'
    },
    {
      t: 'choice',
      q: 'Что делает tcs.TrySetResult(loc)?',
      options: ['Завершает tcs.Task результатом, и все, кто ждёт его через await, продолжают', 'Запускает GPS', 'Блокирует поток до результата'],
      answer: 0,
      explain: 'Задача из TaskCompletionSource ничего не выполняет сама — её завершают снаружи.'
    },
    {
      t: 'learn',
      title: 'Подвох: продолжения бегут в твоём потоке',
      body: '<p>По умолчанию SetResult может выполнить продолжения ожидающих прямо внутри себя — синхронно, в потоке, который его вызвал. Если в этот момент ты держишь замок или находишься в колбэке чужой библиотеки, получишь неожиданную реентерабельность и даже deadlock.</p><p>Флаг <code>RunContinuationsAsynchronously</code> отправляет продолжения в пул.</p>'
    },
    {
      t: 'choice',
      q: 'Зачем RunContinuationsAsynchronously?',
      options: ['Чтобы продолжения ожидающих не выполнялись синхронно внутри SetResult', 'Чтобы задача выполнилась в другом потоке', 'Чтобы ускорить SetResult'],
      answer: 0,
      explain: 'SetResult вернёт управление сразу, а продолжения выполнятся отдельно.'
    },
    {
      t: 'choice',
      q: 'Почему TrySetResult, а не SetResult?',
      options: ['Событие может прийти дважды: SetResult второй раз бросит исключение, а TrySetResult вернёт false', 'TrySetResult быстрее', 'SetResult устарел'],
      answer: 0,
      explain: 'Колбэки бывают повторными, а задача завершается только один раз.'
    },
    {
      t: 'tapline',
      q: 'Из-за какой строки задача может зависнуть навсегда?',
      code: 'var tcs = new TaskCompletionSource<string>();\nclient.OnMessage += m => tcs.TrySetResult(m);\nclient.OnError += e => { log.Error(e); };\nreturn tcs.Task;',
      answer: 2,
      explain: 'При ошибке задача так и не завершится. Нужно tcs.TrySetException(e).'
    },
    {
      t: 'multi',
      q: 'Чем можно завершить задачу TaskCompletionSource? Отметь все.',
      options: ['SetResult', 'SetException', 'SetCanceled', 'Dispose'],
      answer: [0, 1, 2],
      explain: 'Плюс Try-версии всех трёх.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['TaskCompletionSource', 'Задача, которую завершаешь сам'],
        ['TrySetResult', 'Завершить, если ещё не завершена'],
        ['RunContinuationsAsynchronously', 'Продолжения — не внутри SetResult'],
        ['SetException', 'Завершить ошибкой']
      ]
    }
  ]
};
