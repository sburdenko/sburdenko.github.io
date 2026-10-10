/** Async, раздел 4, урок 3: ConfigureAwait(false). */
export default {
  id: 'as.u4.l3',
  title: 'ConfigureAwait(false)',
  sub: 'Не возвращаться в контекст — и когда это опасно',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Не возвращаться в контекст',
      body: '<p><code>ConfigureAwait(false)</code> говорит: «продолжение не обязательно выполнять в захваченном контексте». Оно уйдёт в пул.</p><p>Для кода библиотек, которым UI-поток не нужен, это правильно: меньше переключений и нет deadlock, если кто-то снаружи сделал .Result.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Код с .Result зависает. Почини внутри библиотеки, не трогая обработчик.',
      start: { ctx: 'ui', call: 'result' }, lock: ['ctx', 'call'],
      goal: { status: 'done', cfa: true, call: 'result' },
      solve: ['cfa', 'end']
    },
    {
      t: 'choice',
      q: 'Что изменил ConfigureAwait(false)?',
      options: ['Продолжение выполнил поток пула, и задача завершилась без UI-потока', 'UI-поток перестал блокироваться', 'Сеть ответила быстрее'],
      answer: 0,
      explain: 'UI-поток по-прежнему стоял на .Result, но задаче он больше не был нужен.'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Теперь метод после await меняет контрол окна. Что будет с ConfigureAwait(false)?',
      start: { ctx: 'ui', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'error' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Почему упало?',
      options: ['После ConfigureAwait(false) код выполнился в потоке пула, а контролы можно трогать только из UI-потока', 'ConfigureAwait(false) запрещён в WPF', 'Сеть вернула ошибку'],
      answer: 0,
      explain: 'ConfigureAwait(false) уместен только там, где после await не нужен UI-поток.'
    },
    {
      t: 'learn',
      title: 'Правило',
      body: '<p>В библиотеках — ConfigureAwait(false) на каждом await. В коде приложения, который трогает UI, — без него.</p><p>Но ConfigureAwait — страховка, а не лечение. Настоящее лечение deadlock — не блокировать: следующий урок.</p>',
      deep: '.NET 8 добавил ConfigureAwaitOptions: например, await task.ConfigureAwait(ConfigureAwaitOptions.SuppressThrowing) дождётся задачи, не бросая исключение. В ASP.NET Core контекста нет, поэтому там ConfigureAwait(false) в коде приложения ничего не меняет.'
    },
    {
      t: 'multi',
      q: 'Где ConfigureAwait(false) уместен? Отметь все.',
      options: ['В библиотеке HTTP-клиента', 'В библиотеке доступа к базе данных', 'В обработчике кнопки, который потом меняет label.Text', 'В Unity-скрипте, который потом двигает transform'],
      answer: [0, 1],
      explain: 'Там, где после await трогают UI или Unity API, контекст нужен.'
    },
    {
      t: 'choice',
      q: 'ConfigureAwait(false) стоит только на первом await метода, на втором — нет. Чем рискуешь?',
      options: ['Если первая задача завершилась сразу, контекст не сменился, и второй await снова захватит UI-контекст', 'Ничем', 'Ошибкой компиляции'],
      answer: 0,
      explain: 'Синхронно завершившийся await не переключает поток. Поэтому ConfigureAwait(false) ставят на каждый await в библиотеке.'
    }
  ]
};
