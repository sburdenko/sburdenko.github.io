/** История .NET, раздел 4, урок 4: Framework против современного .NET. */
export default {
  id: 'hs.u4.l4',
  title: 'Framework или .NET: в чём разница',
  sub: 'Шпаргалка и переезд',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Главные отличия',
      body: '<p><b>Где работает</b>: Framework — Windows; .NET — Windows, Linux, macOS.<br><b>Установка</b>: Framework — один на систему, обновляется на месте; .NET — версии рядом или вместе с программой.<br><b>Развитие</b>: Framework — только исправления; .NET — новая версия каждый год.<br><b>Скорость</b>: .NET заметно быстрее.</p>'
    },
    {
      t: 'learn',
      title: 'Проект выглядит иначе',
      body: '<p>Старый .csproj — сотни строк со списком каждого файла и packages.config. Новый SDK-стиль — несколько строк: файлы подхватываются сами, пакеты — через PackageReference.</p>',
      code: '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>',
      lang: 'xml'
    },
    {
      t: 'tapline',
      q: 'Какая строка выдаёт проект для .NET Framework?',
      code: '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net48</TargetFramework>\n    <LangVersion>latest</LangVersion>\n  </PropertyGroup>\n</Project>',
      lang: 'xml',
      answer: 2,
      explain: 'SDK-стиль подходит и для Framework — цель задаёт TargetFramework.'
    },
    {
      t: 'match',
      q: 'Соедини: Framework → современный .NET',
      pairs: [
        ['packages.config', 'PackageReference'],
        ['app.config', 'appsettings.json'],
        ['GAC', 'Зависимости рядом с программой'],
        ['AppDomain', 'AssemblyLoadContext']
      ]
    },
    {
      t: 'learn',
      title: 'Как переезжают',
      body: '<p>1. Перевести проекты в SDK-стиль.<br>2. Вынести общий код в библиотеку под netstandard2.0 — она работает и там, и там.<br>3. Найти несовместимые API (анализаторы, .NET Upgrade Assistant).<br>4. Заменить то, чего нет: WCF-сервер, Remoting, Web Forms.<br>5. Переключить приложение на net10.0 и прогнать тесты.</p>'
    },
    {
      t: 'order',
      q: 'Расставь шаги переезда',
      items: ['Перевести проекты в SDK-стиль', 'Вынести общий код под netstandard2.0', 'Найти несовместимые API', 'Заменить отсутствующие технологии', 'Переключить приложение на net10.0'],
      explain: 'Общая библиотека под стандарт позволяет переезжать по частям.'
    },
    {
      t: 'multi',
      q: 'Что придётся заменить при переезде с Framework? Отметь все.',
      options: ['Сервер WCF', '.NET Remoting', 'ASP.NET Web Forms', 'LINQ', 'async/await'],
      answer: [0, 1, 2],
      explain: 'LINQ и async есть везде.'
    },
    {
      t: 'choice',
      q: 'Можно ли писать на C# 12 под net48?',
      options: ['Многое из синтаксиса компилируется, но официально поддержан C# 7.3, и фичи, которым нужны новые API или рантайм, работать не будут', 'Нет, никак', 'Да, без ограничений'],
      answer: 0,
      explain: 'Например, методы интерфейсов по умолчанию требуют поддержки рантайма — во Framework их нет.'
    }
  ]
};
