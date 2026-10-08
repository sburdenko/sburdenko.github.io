/** Async, раздел 4, урок 2: deadlock с .Result. */
export default {
  id: 'as.u4.l2',
  title: 'Deadlock с .Result',
  sub: 'Классическая взаимная блокировка в UI',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Классика жанра',
      body: '<p>UI-поток вызывает <code>GetDataAsync().Result</code> и блокируется. Внутри GetDataAsync продолжение после await хочет вернуться в UI-поток. А тот заблокирован и ждёт эту самую задачу.</p><p>Каждый ждёт другого — <b>deadlock</b>.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Переключи обработчик на .Result и доведи программу до зависания.',
      start: { ctx: 'ui', call: 'await' }, lock: ['ctx', 'cfa'],
      goal: { status: 'deadlock' },
      solve: ['call:result', 'end']
    },
    {
      t: 'choice',
      q: 'Чего ждёт UI-поток?',
      options: ['Завершения задачи GetDataAsync', 'Ответа сервера', 'Клика пользователя'],
      answer: 0,
      explain: '.Result блокирует поток до завершения задачи.'
    },
    {
      t: 'choice',
      q: 'А чего ждёт задача?',
      options: ['Пока UI-поток выполнит её продолжение', 'Ответа сервера', 'Сборки мусора'],
      answer: 0,
      explain: 'Ответ уже пришёл. Задаче осталось выполнить продолжение — в очереди заблокированного потока.'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Оставь .Result, но перенеси код в консольное приложение. Зависнет?',
      start: { ctx: 'ui', call: 'result' }, lock: ['call', 'cfa'],
      goal: { status: 'done', call: 'result', ctx: 'console' },
      solve: ['ctx:console', 'end']
    },
    {
      t: 'choice',
      q: 'Почему в консоли .Result не зависает?',
      options: ['Контекста нет: продолжение выполняет поток пула, а он свободен', 'Консоль быстрее', 'Консоль не поддерживает await'],
      answer: 0,
      explain: 'Без контекста продолжению не нужен заблокированный поток.'
    },
    {
      t: 'learn',
      title: 'Почему это всё равно плохо',
      body: '<p>В консоли и ASP.NET Core .Result не зависнет, но поток всё равно простаивает. Под нагрузкой это голодание пула — урок 5.</p><p>Блокировать асинхронный код плохо везде.</p>'
    },
    {
      t: 'order',
      q: 'Как складывается deadlock',
      items: ['UI-поток вызывает GetDataAsync().Result и блокируется', 'Запрос уходит в сеть', 'Ответ пришёл, продолжение встаёт в очередь UI-потока', 'UI-поток не может его выполнить — он ждёт задачу', 'Никто никого не дождётся'],
      explain: 'Цикл ожидания: поток → задача → поток.'
    },
    {
      t: 'multi',
      q: 'Где возможен такой deadlock? Отметь все.',
      options: ['WPF', 'WinForms', 'Классический ASP.NET на .NET Framework', 'ASP.NET Core', 'Консольное приложение'],
      answer: [0, 1, 2],
      explain: 'Нужен однопоточный контекст. У старого ASP.NET он был (AspNetSynchronizationContext), у ASP.NET Core — нет.'
    }
  ]
};
