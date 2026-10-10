/** История .NET, раздел 1, урок 2: Framework растёт — 2.0…4.5. */
export default {
  id: 'hs.u1.l2',
  title: 'Framework растёт',
  sub: 'Дженерики, WPF, LINQ, async — по версиям',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Каждая версия — большой шаг',
      body: '<p>Framework и C# росли вместе. Почти каждая версия приносила то, без чего сегодня код на C# не представить.</p>'
    },
    {
      t: 'learn',
      title: '2005 — 2.0: дженерики',
      body: '<p><code>List&lt;int&gt;</code> вместо <code>ArrayList</code>: тип проверяет компилятор, и числа не упаковываются в объекты. Дженерики сделаны в самом CLR, а не только в языке, — у Java не так.</p>'
    },
    {
      t: 'learn',
      title: '2006–2007 — 3.0 и 3.5',
      body: '<p><b>3.0</b>: WPF (новый UI на XAML), WCF (сетевые сервисы), Workflow Foundation.</p><p><b>3.5 и C# 3.0</b>: LINQ, лямбды, <code>var</code>, методы расширения. Запросы к коллекциям и базам на самом C#.</p>',
      code: 'var adults = people.Where(p => p.Age >= 18)\n                   .OrderBy(p => p.Name);'
    },
    {
      t: 'learn',
      title: '2010–2012 — 4.0 и 4.5',
      body: '<p><b>4.0</b>: библиотека задач TPL (<code>Task</code>, <code>Parallel.For</code>) и <code>dynamic</code>.</p><p><b>4.5 и C# 5</b>: <code>async</code> и <code>await</code> — асинхронный код, который читается как обычный.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Найди год, когда в C# появились async и await.',
      goal: { year: 2012 },
      solve: ['year:2012']
    },
    {
      t: 'order',
      q: 'Расставь по времени',
      items: ['Дженерики (2.0)', 'WPF (3.0)', 'LINQ (3.5)', 'Task и TPL (4.0)', 'async/await (4.5)'],
      explain: 'Каждая следующая фича опиралась на предыдущие: LINQ невозможен без дженериков и лямбд, async — без Task.'
    },
    {
      t: 'match',
      q: 'Соедини версию и главное в ней',
      pairs: [
        ['C# 2.0', 'Дженерики'],
        ['C# 3.0', 'LINQ и лямбды'],
        ['C# 4.0', 'dynamic'],
        ['C# 5.0', 'async и await']
      ]
    },
    {
      t: 'choice',
      q: 'Чем дженерики .NET отличаются от дженериков Java?',
      options: ['Они есть в самом рантайме: List<int> хранит настоящие int без упаковки', 'Ничем', 'В .NET их нет'],
      answer: 0,
      explain: 'В Java дженерики стираются при компиляции, и List<Integer> хранит объекты.'
    },
    {
      t: 'choice',
      q: 'Без чего не получился бы async/await?',
      options: ['Без Task из .NET 4.0', 'Без WPF', 'Без dynamic'],
      answer: 0,
      explain: 'await ждёт задачу. Сначала появился Task, через два года — удобный синтаксис для него.'
    }
  ]
};
