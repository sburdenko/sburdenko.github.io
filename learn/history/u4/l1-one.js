/** История .NET, раздел 4, урок 1: .NET 5 и один .NET. */
export default {
  id: 'hs.u4.l1',
  title: 'Один .NET',
  sub: '.NET 5, LTS и STS, ноябрьские релизы',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: '2020: просто .NET',
      body: '<p>После .NET Core 3.1 вышел <b>.NET 5</b>. Слово «Core» убрали: это теперь главный .NET. Номер 4 пропустили, чтобы не путать с .NET Framework 4.x.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Найди год, когда вышел .NET 5.',
      goal: { year: 2020 },
      solve: ['year:2020']
    },
    {
      t: 'choice',
      q: 'Почему после .NET Core 3.1 сразу .NET 5, а не 4?',
      options: ['Чтобы не путать с .NET Framework 4.x', 'Версия 4 оказалась с ошибками', 'Так совпало'],
      answer: 0,
      explain: '«.NET 4» звучало бы как очередной Framework.'
    },
    {
      t: 'learn',
      title: 'Каждый ноябрь — новая версия',
      body: '<p>Чётные версии — <b>LTS</b> (Long Term Support), поддержка 3 года. Нечётные — <b>STS</b> (Standard Term Support), с .NET 9 — 2 года (раньше 18 месяцев).</p><p>.NET 8 (LTS) и .NET 9 (STS) теряют поддержку в один день — 10 ноября 2026. .NET 10 (LTS) поддерживается до ноября 2028.</p>'
    },
    {
      t: 'choice',
      q: 'Сейчас октябрь 2026. Сервер на .NET 8. Что делать?',
      options: ['Переходить на .NET 10 (LTS): поддержка .NET 8 кончается 10 ноября 2026', 'Ничего, LTS вечный', 'Откатиться на .NET Framework'],
      answer: 0,
      explain: 'После окончания поддержки исправления безопасности больше не выходят.'
    },
    {
      t: 'match',
      q: 'Соедини версию и тип поддержки',
      pairs: [
        ['.NET 8', 'LTS, до ноября 2026'],
        ['.NET 9', 'STS, тоже до ноября 2026'],
        ['.NET 10', 'LTS, до ноября 2028'],
        ['.NET 11', 'Ожидается в ноябре 2026']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Чётные версии — LTS', 'Новые версии выходят в ноябре', 'LTS поддерживается 3 года', '.NET 5 был продолжением .NET Framework'],
      answer: [0, 1, 2],
      explain: '.NET 5 — продолжение .NET Core, а не Framework.'
    },
    {
      t: 'blanks',
      q: 'Цель приложения на последней LTS',
      code: '<TargetFramework>___</TargetFramework>',
      lang: 'xml',
      tiles: ['net10.0', 'net9.0', 'netcoreapp10', 'net4.10'],
      answer: ['net10.0'],
      explain: 'С .NET 5 цели называются netN.0.'
    },
    {
      t: 'choice',
      q: 'Чем LTS лучше для плагинов и корпоративных систем?',
      options: ['Поддержка дольше, обновлять рантайм приходится реже', 'LTS быстрее', 'В STS нет C#'],
      answer: 0,
      explain: 'Autodesk и другие большие хосты переходят именно с LTS на LTS.'
    }
  ]
};
