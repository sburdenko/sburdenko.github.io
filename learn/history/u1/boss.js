/** Финал раздела 1 курса «История .NET». */
export default {
  id: 'hs.u1.boss',
  title: 'Финал: эпоха Framework',
  sub: '2002–2019 одним махом',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Пройди по ключевым годам Framework: 2002, 2005, 2007, 2012 и 2019.',
      goal: { visit: [2002, 2005, 2007, 2012, 2019] },
      solve: ['year:2002', 'year:2005', 'year:2007', 'year:2012', 'year:2019']
    },
    {
      t: 'order',
      q: 'Расставь по времени',
      items: ['.NET Framework 1.0', 'Дженерики', 'LINQ', 'async/await', 'Framework 4.8'],
      explain: '2002, 2005, 2007, 2012, 2019.'
    },
    {
      t: 'choice',
      q: 'Какую проблему 90-х .NET решал сборками с версиями?',
      options: ['DLL hell', 'Медленный интернет', 'Отсутствие IDE'],
      answer: 0,
      explain: 'Сборка знает свою версию, и программа просит нужную.'
    },
    {
      t: 'choice',
      q: 'Почему Framework 4.8 не получит новых API?',
      options: ['Он общий для всей Windows и обновляется на месте — менять его опасно, а развитие ушло в новый .NET', 'Microsoft его удалила', 'Он не поддерживает C#'],
      answer: 0,
      explain: 'Новые возможности получает только современный .NET.'
    },
    {
      t: 'multi',
      q: 'Где сегодня всё ещё нужен Framework 4.8? Отметь все.',
      options: ['Плагины для Revit 2024 и старше', 'Старые корпоративные приложения на Windows', 'Новый сервер на Linux', 'Плагины для Revit 2025'],
      answer: [0, 1],
      explain: 'Revit 2025 — уже .NET 8, а на Linux Framework не работает.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['2002', 'Framework 1.0 и C# 1.0'],
        ['2005', 'Дженерики'],
        ['2007', 'LINQ'],
        ['2012', 'async/await']
      ]
    },
    {
      t: 'choice',
      q: 'Плагин работает на рантайме…',
      options: ['хоста, который его загрузил', 'который указан последним в системе', 'самом новом из установленных'],
      answer: 0,
      explain: 'Плагин живёт в процессе хоста — значит, и в его рантайме.'
    },
    {
      t: 'blanks',
      q: 'Плагин для AutoCAD 2024',
      code: '<TargetFramework>___</TargetFramework>',
      lang: 'xml',
      tiles: ['net48', 'net8.0', 'netstandard2.1'],
      answer: ['net48'],
      explain: 'AutoCAD 2024, как и Revit 2024, — на Framework 4.8.'
    }
  ]
};
