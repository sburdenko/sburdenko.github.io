/** История .NET, раздел 4, урок 3: где .NET сейчас. */
export default {
  id: 'hs.u4.l3',
  title: 'Где .NET сейчас',
  sub: 'Сервера, десктоп, игры, САПР',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Карта на 2026 год',
      body: '<p><b>Сервера и облако</b>: ASP.NET Core, на Linux и в контейнерах.<br><b>Десктоп</b>: WPF и WinForms (Windows), Avalonia и MAUI (кросс-платформенно).<br><b>Браузер</b>: Blazor на WebAssembly.<br><b>Игры</b>: Unity (Mono и IL2CPP, переход на CoreCLR), Godot 4 на .NET.<br><b>САПР и BIM</b>: плагины Revit, AutoCAD, Navisworks.</p>'
    },
    {
      t: 'learn',
      title: 'Autodesk переехал на .NET 8',
      body: '<p>До версии 2024 включительно Revit и AutoCAD работали на .NET Framework 4.8. С 2025 — на .NET 8.</p><p>Значит, плагин для обеих эпох — это две сборки: net48 и net8.0-windows. Следующие версии хостов пойдут за новыми LTS — какой рантайм у конкретной версии, смотри в «What\'s New» к её API.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Найди год, когда Revit и AutoCAD перешли на .NET 8.',
      goal: { year: 2024 },
      solve: ['year:2024']
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Плагин для Revit 2024 и Revit 2025: каждому — родная сборка.',
      hosts: ['revit24', 'revit25'],
      goal: { hosts: ['revit24', 'revit25'], max: 2, prefer: { revit24: 'net48', revit25: 'net8' } },
      solve: ['tfm:net48', 'tfm:net8']
    },
    {
      t: 'choice',
      q: 'Почему плагину для Revit 2025 нельзя просто остаться на net48?',
      options: ['Revit 2025 работает на .NET 8; сборка Framework загрузится разве что с оговорками и может упасть на отсутствующих API', 'Revit 2025 запрещает DLL', 'net48 работает только в Revit 2020'],
      answer: 0,
      explain: 'Autodesk прямо требует пересобрать плагины под .NET 8.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и технологию',
      pairs: [
        ['Веб-API в контейнере', 'ASP.NET Core'],
        ['Кросс-платформенный десктоп', 'Avalonia'],
        ['Игра на телефон', 'Unity'],
        ['Плагин для Revit 2025', '.NET 8']
      ]
    },
    {
      t: 'multi',
      q: 'Где сегодня работает C#? Отметь все.',
      options: ['На Linux-серверах', 'В браузере через WebAssembly', 'На iPhone и Android', 'Только на Windows'],
      answer: [0, 1, 2],
      explain: 'Ровно то, чего не было в 2002 году.'
    },
    {
      t: 'choice',
      q: 'Godot 4 пишет C#-скрипты на…',
      options: ['современном .NET', 'Mono, как старый Unity', '.NET Framework'],
      answer: 0,
      explain: 'Godot 4 перешёл на современный .NET, в отличие от Godot 3 на Mono.'
    }
  ]
};
