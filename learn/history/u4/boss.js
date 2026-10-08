/** Финал курса «История .NET». */
export default {
  id: 'hs.u4.boss',
  title: 'Финал курса',
  sub: 'От 2002 до 2026',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Пройди по поворотным годам: 2002, 2004, 2014, 2016, 2020 и 2025.',
      goal: { visit: [2002, 2004, 2014, 2016, 2020, 2025] },
      solve: ['year:2002', 'year:2004', 'year:2014', 'year:2016', 'year:2020', 'year:2025']
    },
    {
      t: 'order',
      q: 'Расставь по времени',
      items: ['.NET Framework 1.0', 'Mono 1.0', 'Исходники открыты', '.NET Core 1.0', '.NET 5', '.NET 10'],
      explain: '2002, 2004, 2014, 2016, 2020, 2025.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Общая библиотека для Revit 2024, Revit 2025, Unity и .NET 10 одной сборкой.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 1 },
      solve: ['tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Почему .NET Standard 2.1, а не 2.0, для общего кода Unity и .NET 10?',
      options: ['В 2.1 есть Span<T>, IAsyncEnumerable и методы интерфейсов по умолчанию; Framework при этом не нужен', '2.1 работает везде', '2.0 устарел и не грузится'],
      answer: 0,
      explain: 'Если нужен ещё и Framework — только 2.0 или отдельная сборка net48.'
    },
    {
      t: 'multi',
      q: 'Что правда в октябре 2026? Отметь все.',
      options: ['.NET 10 — актуальная LTS', 'Поддержка .NET 8 закончится в ноябре', 'Revit 2025 работает на .NET 8', '.NET Framework получил C# 14 и .NET Standard 2.1'],
      answer: [0, 1, 2],
      explain: 'Framework заморожен: максимум .NET Standard 2.0.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Framework 4.8', 'Только Windows, только исправления'],
        ['.NET Standard', 'Контракт API'],
        ['.NET 10', 'Актуальная LTS'],
        ['Mono', 'Рантайм старого Unity и Xamarin']
      ]
    },
    {
      t: 'choice',
      q: 'В C# 14 появились…',
      options: ['field, члены-расширения и ?.=', 'records и nullable', 'async и await'],
      answer: 0,
      explain: 'Records — C# 9, nullable — C# 8, async — C# 5.'
    },
    {
      t: 'blanks',
      q: 'Плагин под Revit 2024 и Revit 2025',
      code: '<TargetFrameworks>___;___</TargetFrameworks>',
      lang: 'xml',
      tiles: ['net48', 'net8.0-windows', 'netstandard2.1', 'net10.0'],
      answer: ['net48', 'net8.0-windows'],
      explain: '-windows — потому что плагину нужен WPF.'
    },
    {
      t: 'choice',
      q: 'Какой вывод из всей истории?',
      options: ['Код живёт в рантайме хоста: сначала узнай, где он будет работать, потом выбирай цель', 'Всегда бери самую новую версию', 'Всегда бери .NET Standard'],
      answer: 0,
      explain: 'Revit, Unity и сервер диктуют рантайм — а TFM лишь отвечает им.'
    }
  ]
};
