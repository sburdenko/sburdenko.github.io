/** .NET изнутри, раздел «Сборки и версии», урок 2: AssemblyVersion, FileVersion, InformationalVersion и что из них смотрит загрузчик. */
export default {
  id: 'dotnet.w5.l2',
  title: 'Три версии сборки',
  sub: 'Какую из них смотрит загрузчик — и чем это кончается',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Один номер в проекте — четыре в итоге',
      body: '<p>У библиотеки на самом деле несколько версий, и живут они в разных местах:</p><ul><li><b>AssemblyVersion</b> — в метаданных, часть идентичности. Её же компилятор запишет в AssemblyRef каждого потребителя;</li><li><b>FileVersion</b> — в ресурсе Win32 VERSIONINFO, её показывает Проводник в свойствах файла;</li><li><b>InformationalVersion</b> — атрибут со свободной строкой: версия продукта;</li><li><b>PackageVersion</b> — в .nuspec пакета, её видит только NuGet.</li></ul><p>В SDK-проекте обычно задают одно свойство <code>Version</code>, остальные SDK выводит из него сам.</p>',
      code: '<PropertyGroup>\n  <Version>2.4.1-beta.2</Version>\n</PropertyGroup>\n<!-- SDK выведет:\n     AssemblyVersion      2.4.1.0\n     FileVersion          2.4.1.0\n     InformationalVersion 2.4.1-beta.2+a1b2c3d\n     PackageVersion       2.4.1-beta.2 -->',
      lang: 'xml',
      deep: '<p>SDK генерирует атрибуты в файл <code>obj/…/Shop.AssemblyInfo.cs</code> (свойство <code>GenerateAssemblyInfo</code>). Суффикс <code>+a1b2c3d</code> — хеш коммита: начиная с .NET 8 SDK Source Link встроен и дописывает его в InformationalVersion по умолчанию. Отключается свойством <code>IncludeSourceRevisionInInformationalVersion=false</code>.</p><p>Каждая из четырёх частей — 16-битное число, в AssemblyVersion не больше 65 534. Номер сборки CI вроде 70 000 туда не влезет.</p>'
    },
    {
      t: 'match',
      q: 'Соедини версию и кто её читает',
      pairs: [
        ['AssemblyVersion', 'Загрузчик CLR: часть идентичности'],
        ['FileVersion', 'Проводник Windows в свойствах файла'],
        ['InformationalVersion', 'Люди: строка продукта с хешем коммита'],
        ['PackageVersion', 'NuGet при restore']
      ]
    },
    {
      t: 'learn',
      title: 'AssemblyVersion вшивается в потребителя',
      body: '<p>Приложение собрали против Shop 2.4.1.0 — в его манифесте навсегда записано <code>.assembly extern Shop { .ver 2:4:1:0 }</code>. Потом файл Shop.dll в папке заменили новым. Примет ли его рантайм — решает сравнение этого числа с версией в найденной сборке.</p><p>Остальные версии читаются только кодом, вручную:</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.GetName().Version);  // 2.4.1.0\nConsole.WriteLine(asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()\n    ?.InformationalVersion);               // 2.4.1-beta.2+a1b2c3d\nConsole.WriteLine(FileVersionInfo.GetVersionInfo(asm.Location).FileVersion);\n                                           // 2.4.1.0',
      deep: 'Старый приём AssemblyVersion("1.0.*") — версия от даты и времени сборки — в SDK-проектах даёт ошибку CS8357: детерминированная компиляция (Deterministic, включена по умолчанию) не совместима с подстановкой. И хорошо: версия, меняющаяся при каждой сборке, в .NET Framework ломала бы привязку строго именованных сборок. Учти ещё, что в single-file приложении Location пустая строка, и FileVersionInfo так не прочитать.'
    },
    {
      t: 'choice',
      q: 'Какую из версий сравнивает загрузчик CLR, когда ищет зависимость?',
      options: ['AssemblyVersion', 'FileVersion', 'InformationalVersion', 'Версию NuGet-пакета'],
      answer: 0,
      explain: 'Только AssemblyVersion входит в идентичность и записана в AssemblyRef. Остальные версии загрузчику не нужны.',
      wrong: { 1: 'FileVersion — ресурс Win32 для Проводника. Загрузчик CLR его не сравнивает.', 3: 'Версия пакета остаётся в NuGet. В сборку и в AssemblyRef она не попадает.' }
    },
    {
      t: 'learn',
      title: 'Тогда: точное совпадение. Сейчас: не ниже',
      body: '<p><b>.NET Framework</b> для строго именованной сборки требует <b>точного</b> совпадения версии из AssemblyRef. Нашлась другая — <code>FileLoadException</code> («The located assembly\'s manifest definition does not match the assembly reference»), если в конфигурации нет binding redirect. У сборки без строгого имени версию Framework не проверяет вовсе.</p><p><b>.NET Core и .NET 5+</b> строгой привязки нет: годится сборка с версией <b>не ниже</b> запрошенной. Ниже — тот же <code>FileLoadException</code>.</p><ul><li>запрошена 12.0.0.0, найдена 13.0.0.0: Framework — ошибка (без redirect), .NET 8 — загрузит;</li><li>запрошена 13.0.0.0, найдена 12.0.0.0: ошибка везде.</li></ul>',
      deep: 'Ты пользуешься этим правилом каждый день: приложение под net8.0 ссылается на System.Runtime 8.0.0.0, а при запуске на рантайме 9 (через rollForward) получает System.Runtime 9.0.0.0 — и это нормально. В Framework аналогичную задачу для своих сборок решала «унификация»: ссылки на любые версии системных сборок автоматически переводились на версию установленного Framework.'
    },
    {
      t: 'choice',
      q: 'Библиотека Reports собрана против Newtonsoft.Json 12.0.0.0. В папке приложения на .NET 8 лежит Newtonsoft.Json с AssemblyVersion 13.0.0.0. Что будет?',
      options: ['Загрузится 13.0.0.0: версия не ниже запрошенной', 'FileLoadException: версия не совпадает', 'Нужен binding redirect в app.config', 'Загрузятся обе версии рядом'],
      answer: 0,
      explain: 'Современный загрузчик принимает версию не ниже запрошенной. Совместима ли 13 с кодом, собранным против 12, — уже ответственность автора библиотеки.',
      wrong: { 1: 'Так было бы в .NET Framework со строго именованной сборкой.', 2: 'Binding redirect из app.config современный рантайм не читает: он ему не нужен.' }
    },
    {
      t: 'learn',
      title: 'Почему у библиотек AssemblyVersion «круглая»',
      body: '<p>Рекомендация Microsoft для библиотек: в AssemblyVersion держать <b>только мажорную</b> версию. Пакеты 3.0, 3.1 и 3.7.2 получают AssemblyVersion <code>3.0.0.0</code>, версия 4 — <code>4.0.0.0</code>. Так потребителям на Framework реже нужны binding redirect. Номер сборки CI уходит в FileVersion: там он никому не мешает.</p><p>Но не фиксируй AssemblyVersion навсегда: в GAC тогда помещается только одна версия, и обновление ломает всех, кто на неё ссылается.</p>',
      code: '<PropertyGroup>\n  <Version>3.7.2</Version>\n  <AssemblyVersion>3.0.0.0</AssemblyVersion>\n  <FileVersion>3.7.2.41</FileVersion>\n</PropertyGroup>',
      lang: 'xml',
      deep: 'У этой схемы есть цена в современном .NET. Приложение собрано против 3.7.2, а при развёртывании в папку попала 3.5.0 — у обеих AssemblyVersion 3.0.0.0, и проверка «не ниже» пройдёт молча. Если код вызывает метод, появившийся в 3.7, получишь MissingMethodException при JIT-компиляции вызывающего метода, а не понятную ошибку загрузки. От этого защищает restore: NuGet не опустит версию пакета ниже требуемой без предупреждения NU1605. Но файл, скопированный в папку руками, он не видит.'
    },
    {
      t: 'blanks',
      q: 'GenerateAssemblyInfo выключен, атрибуты пишешь сам. Расставь: идентичность, номер файла с номером сборки CI, строка продукта',
      code: '[assembly: ___("3.0.0.0")]\n[assembly: ___("3.7.2.41")]\n[assembly: ___("3.7.2+a1b2c3d")]',
      tiles: ['AssemblyVersion', 'AssemblyFileVersion', 'AssemblyInformationalVersion', 'AssemblyProduct', 'AssemblyTitle'],
      answer: ['AssemblyVersion', 'AssemblyFileVersion', 'AssemblyInformationalVersion'],
      explain: 'Если оставить GenerateAssemblyInfo включённым и написать эти атрибуты вручную, компилятор выдаст CS0579: атрибут повторяется. Обычно версии задают свойствами в .csproj.'
    },
    {
      t: 'learn',
      title: 'Версия 2: «не ниже» не значит «совместима»',
      body: '<p>Загрузчик сверяет только число. Что внутри — он не проверяет. Автор Shop в версии 3.1 удалил метод <code>Order.Total()</code> и оставил AssemblyVersion <code>3.0.0.0</code>. Reports.dll собрана против 3.0 и вызывает <code>Total</code>.</p><p>Сборка загрузится без ошибок. Упадёт позже — <code>MissingMethodException</code>, когда JIT будет компилировать метод с этим вызовом. Поэтому ломающие изменения выпускают только с новой мажорной версией: SemVer — это договор, который рантайм за тебя не проверит.</p>',
      code: '// Reports.dll собран против Shop 3.0: вызывает Order.Total()\n// в папке Shop 3.1 (AssemblyVersion 3.0.0.0), Total удалён\nreport.Print(order);  // MissingMethodException при JIT метода Print'
    },
    {
      t: 'choice',
      q: 'Что загрузчик .NET 8 проверяет у найденной зависимости?',
      options: ['Имя и что версия не ниже запрошенной', 'Что набор публичных методов совпадает с ожидаемым', 'Что FileVersion совпадает с записанной в ссылке', 'Подпись строгого имени'],
      answer: 0,
      explain: 'Совместимость API загрузчик не проверяет, FileVersion в ссылке не хранится, а подпись строгого имени современный рантайм не проверяет вовсе.'
    },
    {
      t: 'tapline',
      q: 'В окне «О программе» нужна версия с суффиксом beta. Какая строка её даёт?',
      code: 'var asm = Assembly.GetEntryAssembly()!;\nstring a = asm.GetName().Version!.ToString();\nstring b = FileVersionInfo.GetVersionInfo(asm.Location).FileVersion!;\nstring c = asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()!\n    .InformationalVersion;\nstring d = asm.ImageRuntimeVersion;',
      answer: 3,
      explain: 'Суффиксы вроде -beta.2 и хеш коммита есть только в InformationalVersion. AssemblyVersion и FileVersion — четыре числа, а ImageRuntimeVersion — версия формата метаданных, у современных сборок это «v4.0.30319».'
    },
    {
      t: 'multi',
      q: 'Что правда про версии? Отметь все.',
      options: ['FileVersion можно менять в каждой сборке CI без последствий для потребителей', 'Смена AssemblyVersion строго именованной сборки требует redirect у потребителей на .NET Framework', 'InformationalVersion участвует в привязке на .NET 8', 'На .NET 8 сборка с AssemblyVersion ниже, чем в ссылке, не загрузится', 'Версия NuGet-пакета записывается в AssemblyRef потребителя'],
      answer: [0, 1, 3],
      explain: 'Из всех версий привязка смотрит только AssemblyVersion. Версия пакета живёт в NuGet и в сборку не попадает.'
    }
  ]
};
