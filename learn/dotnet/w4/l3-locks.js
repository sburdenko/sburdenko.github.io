/** Раздел 4, урок 3: lock, Interlocked и взаимная блокировка. */
export default {
  id: 'dotnet.w4.l3',
  title: 'lock, Interlocked и deadlock',
  sub: 'Как чинить гонки и как не повесить программу',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'lock — по одному',
      body: '<p><code>lock (obj) { … }</code> пускает в блок только один поток. Остальные ждут у входа, пока он не выйдет.</p>',
      code: 'static readonly object _gate = new();\n\nlock (_gate)\n{\n    count++;\n}',
      deep: 'lock — это Monitor.Enter/Exit в try/finally. С .NET 9 и C# 13 есть отдельный тип System.Threading.Lock, и lock по нему работает эффективнее. Не делай lock(this) и lock по строке: до этих объектов может добраться чужой код и взять тот же замок.'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'lock',
      task: 'Тот же count++, но внутри lock. Попробуй снова получить 1 — и доведи оба потока до конца.',
      goal: 'done',
      solve: ['step:A', 'step:A', 'step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'choice',
      q: 'Почему с lock не удалось потерять увеличение?',
      options: ['Пока A внутри lock, B не может начать свои шаги', 'lock делает процессор быстрее', 'lock запускает потоки по очереди с самого начала программы'],
      answer: 0,
      explain: 'Чтение, прибавление и запись внутри lock выполняются одним куском относительно других потоков с тем же замком.'
    },
    {
      t: 'learn',
      title: 'Interlocked — атомарно и без замка',
      body: '<p>Для простых операций с числами есть <code>Interlocked</code>: Increment, Add, Exchange, CompareExchange. Процессор выполняет их как одну неделимую инструкцию — быстрее, чем lock.</p>',
      code: 'Interlocked.Increment(ref count);'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'atomic', random: true,
      task: 'Interlocked.Increment: запусти 2 потока × 1 000 и проверь результат.',
      goal: 'random',
      solve: ['random']
    },
    {
      t: 'choice',
      q: 'Что покажет 2 потока × 1 000 вызовов Interlocked.Increment?',
      options: ['Всегда 2 000', 'Каждый раз разное число около 2 000', 'Всегда 1 000'],
      answer: 0,
      explain: 'Прочитать, прибавить и записать — одна неделимая операция. Потерять увеличение нельзя.'
    },
    {
      t: 'learn',
      title: 'Цена замков: deadlock',
      body: '<p>Если потоку нужны два замка, а другой поток берёт те же замки в обратном порядке, они могут застрять навсегда — каждый ждёт замок, который держит другой.</p><p>Это <b>взаимная блокировка</b>, deadlock. Программа не падает — она просто висит.</p>'
    },
    {
      t: 'rig', rig: 'deadlock',
      task: 'A берёт L1, потом L2. B — наоборот. Доведи потоки до deadlock.',
      goal: 'deadlock',
      solve: ['step:A', 'step:B']
    },
    {
      t: 'rig', rig: 'deadlock', toggle: true,
      task: 'Почини: пусть оба потока берут замки в одном порядке. Потом доведи их до конца.',
      goal: 'fixed',
      solve: ['fix', 'step:A', 'step:A', 'step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'choice',
      q: 'Главное правило против deadlock на замках?',
      options: ['Всегда брать замки в одном и том же порядке', 'Брать как можно больше замков сразу', 'Добавить Thread.Sleep перед lock'],
      answer: 0,
      explain: 'При одном порядке второй поток будет ждать уже на первом замке и не сможет перехватить второй. Цикла ожидания не возникает.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['lock', 'Один поток в блоке, остальные ждут'],
        ['Interlocked', 'Неделимая операция над числом'],
        ['Deadlock', 'Потоки навсегда ждут друг друга'],
        ['Гонка данных', 'Результат зависит от переключений']
      ]
    }
  ]
};
