/** История .NET, раздел 3, урок 4: мульти-таргетинг. */
export default {
  id: 'hs.u3.l4',
  title: 'Одна библиотека — несколько сборок',
  sub: 'TargetFrameworks, выбор NuGet и #if',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'TargetFrameworks во множественном числе',
      body: '<p>Проект можно собрать сразу под несколько целей. Получится несколько DLL, а NuGet положит их в пакет по папкам.</p>',
      code: '<PropertyGroup>\n  <TargetFrameworks>net8.0;netstandard2.0</TargetFrameworks>\n</PropertyGroup>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Кто какую сборку возьмёт',
      body: '<p>Каждый проект-потребитель берёт <b>самую близкую</b> подходящую сборку. Приложение на .NET 10 из пары «net8.0 и netstandard2.0» возьмёт net8.0 — она ближе и использует больше возможностей. Revit 2024 возьмёт netstandard2.0.</p>'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Revit 2025 должен получить сборку net8.0 с новыми API, а Revit 2024 и Unity — тоже работать. Не больше двух целей.',
      hosts: ['revit24', 'revit25', 'unity'],
      goal: { hosts: ['revit24', 'revit25', 'unity'], max: 2, prefer: { revit25: 'net8' } },
      solve: ['tfm:net8', 'tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Цели net8.0 и netstandard2.0. Какую сборку возьмёт приложение на .NET 10?',
      options: ['net8.0', 'netstandard2.0', 'Обе сразу'],
      answer: 0,
      explain: 'net8.0 совместима с .NET 10 и ближе к нему, чем стандарт.'
    },
    {
      t: 'learn',
      title: 'Разный код для разных целей',
      body: '<p>Где API различаются, помогают символы препроцессора. SDK задаёт их сам по каждой цели.</p>',
      code: '#if NET8_0_OR_GREATER\n    var hash = SHA256.HashData(bytes);           // новый API\n#else\n    using var sha = SHA256.Create();\n    var hash = sha.ComputeHash(bytes);           // работает везде\n#endif'
    },
    {
      t: 'blanks',
      q: 'Код только для сборки под .NET Framework',
      code: '#if ___\n    LegacyInit();\n#endif',
      tiles: ['NETFRAMEWORK', 'NET8_0_OR_GREATER', 'NETSTANDARD2_1', 'DEBUG'],
      answer: ['NETFRAMEWORK'],
      explain: 'NETFRAMEWORK задан для net48 и других целей Framework.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Плагин с отдельным кодом под Revit 2024 (net48) и Revit 2025 (net8.0), плюс общая часть должна работать в Unity.',
      hosts: ['revit24', 'revit25', 'unity'],
      goal: { hosts: ['revit24', 'revit25', 'unity'], max: 3, prefer: { revit24: 'net48', revit25: 'net8' } },
      solve: ['tfm:net48', 'tfm:net8', 'tfm:ns21']
    },
    {
      t: 'learn',
      title: 'Плагины Revit на практике',
      body: '<p>Для плагина под несколько версий Revit обычно делают один проект с целями <code>net48</code> и <code>net8.0-windows</code> (суффикс -windows нужен для WPF). Ссылки на RevitAPI.dll подключают по условию — своя версия для каждой цели.</p>'
    },
    {
      t: 'match',
      q: 'Соедини символ и когда он задан',
      pairs: [
        ['NETFRAMEWORK', 'Сборка под .NET Framework'],
        ['NETSTANDARD2_0', 'Сборка под .NET Standard 2.0'],
        ['NET8_0_OR_GREATER', '.NET 8 и новее'],
        ['DEBUG', 'Отладочная конфигурация']
      ]
    },
    {
      t: 'choice',
      q: 'Зачем вообще несколько целей, если netstandard2.0 работает везде?',
      options: ['Чтобы на новых платформах использовать новые, более быстрые API, а старые не терять', 'Так требует NuGet', 'netstandard2.0 работает медленно'],
      answer: 0,
      explain: 'Сам по себе стандарт не медленный — просто в нём нет API, появившихся позже.'
    }
  ]
};
