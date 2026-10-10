/** История .NET, раздел 3, урок 2: .NET Core. */
export default {
  id: 'hs.u3.l2',
  title: '.NET Core',
  sub: 'Переписать заново, чтобы двигаться дальше',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Не новая версия Framework, а новый .NET',
      body: '<p>Framework нельзя было менять: он общий для всей Windows. Поэтому .NET Core сделали отдельной платформой — взяли лучшее, переписали многое и выбросили лишнее.</p>'
    },
    {
      t: 'learn',
      title: 'Что стало иначе',
      body: '<p><b>Кросс-платформенность</b>: Windows, Linux, macOS.<br><b>Версии рядом</b>: на одной машине стоят .NET 6, 8 и 10, каждая программа берёт свою.<br><b>Self-contained</b>: можно принести рантайм с собой.<br><b>Команда dotnet</b>: <code>dotnet new</code>, <code>dotnet build</code>, <code>dotnet run</code>.<br><b>Скорость</b>: из версии в версию .NET Core заметно быстрее Framework.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Пройди путь .NET Core: 1.0 (2016), 2.0 (2017) и 3.x (2019).',
      goal: { visit: [2016, 2017, 2019] },
      solve: ['year:2016', 'year:2017', 'year:2019']
    },
    {
      t: 'learn',
      title: 'Что не взяли',
      body: '<p>Часть Framework в Core не попала:</p><p><b>AppDomain</b> (изоляция внутри процесса) → <code>AssemblyLoadContext</code>.<br><b>.NET Remoting</b> → gRPC и HTTP.<br><b>Сервер WCF</b> → gRPC или сообщество CoreWCF.<br><b>ASP.NET Web Forms</b> → Razor Pages и Blazor.</p><p>WPF и WinForms вернулись в .NET Core 3.0 — но только на Windows.</p>'
    },
    {
      t: 'choice',
      q: 'На одном сервере нужны программы на .NET 8 и .NET 10. В чём проблема?',
      options: ['Ни в чём: версии ставятся рядом, каждая программа берёт свою', 'Придётся выбрать одну', '.NET 10 сломает программы на .NET 8'],
      answer: 0,
      explain: 'В этом и отличие от Framework, где 4.8 заменяет 4.5.'
    },
    {
      t: 'match',
      q: 'Соедини старое и замену',
      pairs: [
        ['AppDomain', 'AssemblyLoadContext'],
        ['.NET Remoting', 'gRPC'],
        ['Web Forms', 'Blazor'],
        ['Общий Framework', 'Версии рядом']
      ]
    },
    {
      t: 'multi',
      q: 'Что умеет .NET Core, чего не умел Framework? Отметь все.',
      options: ['Работать на Linux и macOS', 'Ставить несколько версий рядом', 'Приносить рантайм вместе с программой', 'Запускать Web Forms'],
      answer: [0, 1, 2],
      explain: 'Web Forms в Core нет.'
    },
    {
      t: 'choice',
      q: 'WPF в .NET 8 работает на Linux?',
      options: ['Нет, WPF и WinForms в современном .NET — только Windows', 'Да', 'Только в Docker'],
      answer: 0,
      explain: 'Для кросс-платформенного UI есть Avalonia и MAUI.'
    }
  ]
};
