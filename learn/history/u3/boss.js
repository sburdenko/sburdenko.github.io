/** Финал раздела 3 курса «История .NET». */
export default {
  id: 'hs.u3.boss',
  title: 'Финал: Core и Standard',
  sub: 'Совместимость без гадания',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tfm',
      task: 'Одна цель, которую загрузят все четыре хоста без оговорок.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 1 },
      solve: ['tfm:ns20']
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Все четыре хоста, но приложение на .NET 10 должно получить сборку net10.0, а Unity — netstandard2.1. Не больше трёх целей.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 3, prefer: { app10: 'net10', unity: 'ns21' } },
      solve: ['tfm:net10', 'tfm:ns21', 'tfm:net48']
    },
    {
      t: 'choice',
      q: 'Почему .NET Standard 2.1 работает в Unity и .NET 10, но не в .NET Framework?',
      options: ['Framework остановился на 2.0: новым API нужны изменения рантайма, а Framework заморожен', 'Unity и .NET 10 — один и тот же рантайм', '2.1 — платная версия'],
      answer: 0,
      explain: 'Unity (Mono) и .NET 10 (CoreCLR) — разные рантаймы, но оба реализуют 2.1.'
    },
    {
      t: 'multi',
      q: 'Что появилось с .NET Core? Отметь все.',
      options: ['Кросс-платформенность', 'Версии рядом на одной машине', 'Открытая разработка на GitHub', 'AppDomain'],
      answer: [0, 1, 2],
      explain: 'AppDomain как раз не взяли.'
    },
    {
      t: 'blanks',
      q: 'Собери библиотеку под .NET 8 и для Framework',
      code: '<___>net8.0;netstandard2.0</TargetFrameworks>',
      lang: 'xml',
      tiles: ['TargetFrameworks', 'TargetFramework', 'Frameworks', 'Platforms'],
      answer: ['TargetFrameworks'],
      explain: 'Несколько целей — TargetFrameworks во множественном числе.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['2014', 'Исходники открыты'],
        ['2016', '.NET Core 1.0'],
        ['2017', '.NET Standard 2.0'],
        ['2019', '.NET Standard 2.1']
      ]
    },
    {
      t: 'choice',
      q: 'Цели net48 и netstandard2.0. Какую сборку возьмёт Revit 2024?',
      options: ['net48 — она ближе к Framework', 'netstandard2.0', 'Обе'],
      answer: 0,
      explain: 'NuGet выбирает самую близкую цель.'
    },
    {
      t: 'choice',
      q: 'Что такое .NET Standard одним словом?',
      options: ['Контракт', 'Рантайм', 'Компилятор'],
      answer: 0,
      explain: 'Список API. Исполняет код конкретный рантайм.'
    }
  ]
};
