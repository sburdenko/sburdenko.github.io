/** .NET изнутри, раздел «Загрузка и хостинг», урок 1: цепочка хоста — muxer, apphost, hostfxr, hostpolicy, coreclr. */
export default {
  id: 'dotnet.w6.l1',
  title: 'Цепочка хоста',
  sub: 'Muxer, apphost, hostfxr, hostpolicy и coreclr',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Пять нативных библиотек до Main',
      body: '<p>В первом разделе цепочка запуска была схемой из пяти шагов. Теперь откроем каждый шаг. До твоего <code>Main</code> работают только нативные программы на C++, управляемого кода ещё нет:</p><ul><li><b>dotnet</b> (muxer) или <b>app.exe</b> (apphost) — точка входа;</li><li><b>hostfxr</b> — выбирает версию рантайма;</li><li><b>hostpolicy</b> — собирает список сборок;</li><li><b>coreclr</b> — сам рантайм: GC, JIT, загрузчик типов.</li></ul><p>У каждой части своя папка в установке .NET, и версии у них не обязаны совпадать.</p>',
      code: '/usr/share/dotnet/\n    dotnet                                  # muxer\n    host/fxr/8.0.17/libhostfxr.so\n    host/fxr/9.0.6/libhostfxr.so\n    shared/Microsoft.NETCore.App/8.0.17/    # libhostpolicy, libcoreclr, System.*.dll\n    shared/Microsoft.NETCore.App/9.0.6/\n    shared/Microsoft.AspNetCore.App/9.0.6/\n    sdk/9.0.301/',
      lang: 'plain',
      flow: ['dotnet / app.exe', 'hostfxr', 'hostpolicy', 'coreclr', 'Main()']
    },
    {
      t: 'learn',
      title: 'Muxer: один dotnet на все версии',
      body: '<p>Команда <code>dotnet</code> — это <b>muxer</b> (от multiplexer, «разветвитель»). Он один на всю установку и смотрит на аргументы: <code>dotnet app.dll</code> — запустить приложение, <code>dotnet build</code> — команда SDK.</p><p>Сам muxer почти ничего не умеет. Он берёт <b>hostfxr</b> из папки <code>host/fxr/&lt;самая новая версия&gt;</code> рядом с собой и передаёт ему всю работу. Новый hostfxr умеет запускать и старые рантаймы, поэтому достаточно самого свежего.</p><p>Версия рантайма для приложения выбирается позже, внутри hostfxr, и от версии hostfxr не зависит.</p>',
      deep: '<p>Для команд SDK hostfxr ищет <code>global.json</code>, вверх от текущей папки, и выбирает SDK из папки <code>sdk/</code>. Для запуска приложения global.json не читается: это настройка инструментов, а не рантайма.</p><p>Что установлено, показывают <code>dotnet --list-runtimes</code>, <code>dotnet --list-sdks</code> и <code>dotnet --info</code>. Последняя печатает и версию самого хоста.</p>'
    },
    {
      t: 'choice',
      q: 'Установлены рантаймы 8.0.17 и 9.0.6, в host/fxr — папки 8.0.17 и 9.0.6. Ты запускаешь dotnet app.dll, приложение собрано под net8.0. Чей hostfxr загрузится?',
      options: ['Из host/fxr/9.0.6', 'Из host/fxr/8.0.17', 'Из папки рядом с app.dll', 'Из shared/Microsoft.NETCore.App/8.0.17'],
      answer: 0,
      explain: 'Muxer всегда берёт hostfxr самой новой версии из host/fxr. Уже он прочитает runtimeconfig.json и выберет рантайм 8.0.17 для приложения.',
      wrong: { 1: 'Muxer ещё не знает, под какую версию собрано приложение: это выяснит hostfxr. Поэтому берётся самый новый.', 3: 'В папке фреймворка лежат hostpolicy и coreclr. hostfxr живёт отдельно, в host/fxr.' }
    },
    {
      t: 'learn',
      title: 'Apphost: app.exe — не твоя программа',
      body: '<p>Рядом с <code>app.dll</code> сборка кладёт <code>app.exe</code> (в Linux — <code>app</code>). Это <b>apphost</b> — маленький нативный запускатель из SDK. При сборке SDK копирует шаблон и вписывает в него имя <code>app.dll</code>. Твоего кода внутри нет.</p><p>Задача apphost — найти hostfxr. Для приложения, зависящего от фреймворка, он ищет установку .NET по порядку и берёт <b>первую найденную</b>:</p><ul><li>папка из <code>DOTNET_ROOT</code> (есть варианты по архитектуре, например <code>DOTNET_ROOT_X64</code>);</li><li>зарегистрированное место: в Windows — ключ реестра <code>HKLM\\SOFTWARE\\dotnet\\Setup\\InstalledVersions\\&lt;arch&gt;</code>, в Linux и macOS — файл <code>/etc/dotnet/install_location</code>;</li><li>место по умолчанию: <code>%ProgramFiles%\\dotnet</code>, <code>/usr/share/dotnet</code>, <code>/usr/local/share/dotnet</code>.</li></ul><p>Переменная <code>PATH</code> в этом поиске не участвует.</p>',
      deep: '<p>В шаблоне apphost есть место-заглушка: 32 байта SHA-256 от строки «foobar». SDK находит эту последовательность и записывает поверх путь к dll. Поэтому переименовать app.dll после сборки нельзя — apphost будет искать старое имя.</p><p>С .NET 9 порядок поиска можно задать при сборке: свойства <code>AppHostDotNetSearch</code> (AppLocal, AppRelative, EnvironmentVariable, Global) и <code>AppHostRelativeDotNet</code>. Отключить apphost — <code>UseAppHost=false</code>. Microsoft советует запускать через apphost: в списке процессов видно имя приложения, а не dotnet, и к exe можно приложить манифест и иконку.</p>'
    },
    {
      t: 'multi',
      q: 'app.exe собран как зависящий от фреймворка. Где он ищет установку .NET? Отметь все.',
      options: ['В папке из DOTNET_ROOT', 'В зарегистрированном месте установки', 'В месте установки по умолчанию', 'В каждой папке из PATH', 'В папке SDK, указанной в global.json'],
      answer: [0, 1, 2],
      explain: 'Порядок: DOTNET_ROOT, затем зарегистрированное место, затем стандартный путь. Берётся первая найденная установка. PATH нужен оболочке, чтобы найти команду dotnet, но apphost его не читает. global.json касается только SDK.'
    },
    {
      t: 'learn',
      title: 'hostfxr: какие фреймворки нужны',
      body: '<p>hostfxr читает <code>app.runtimeconfig.json</code>. Там записано, какие <b>общие фреймворки</b> (shared frameworks) нужны приложению и какой минимальной версии: всегда <code>Microsoft.NETCore.App</code>, а для веб-приложения ещё <code>Microsoft.AspNetCore.App</code>, для WPF и WinForms — <code>Microsoft.WindowsDesktop.App</code>.</p><p>Фреймворки лежат слоями: у ASP.NET Core свой runtimeconfig, который сам ссылается на NETCore.App. hostfxr разрешает всю цепочку, выбирает подходящие установленные версии по правилам roll-forward (о них — следующий урок) и загружает <b>hostpolicy</b> из папки выбранного <code>Microsoft.NETCore.App</code>.</p><p>Не нашёл подходящей версии — запуск заканчивается здесь, сообщением «You must install or update .NET» со списком того, что нашлось.</p>',
      deep: 'У приложения self-contained в runtimeconfig.json вместо раздела frameworks стоит includedFrameworks: рантайм лежит рядом, и hostfxr ничего не ищет. Тот же hostfxr — точка входа для нативных программ, которые хотят запустить .NET у себя внутри: функция hostfxr_initialize_for_runtime_config, а найти сам hostfxr помогает библиотека nethost (get_hostfxr_path).'
    },
    {
      t: 'order',
      q: 'Расставь шаги запуска app.exe (зависит от фреймворка) по порядку',
      items: ['apphost находит установку .NET и загружает hostfxr', 'hostfxr читает app.runtimeconfig.json и выбирает версию фреймворка', 'hostfxr загружает hostpolicy из папки этого фреймворка', 'hostpolicy читает deps.json и собирает список сборок', 'hostpolicy загружает coreclr и передаёт ему список', 'CLR загружает System.Private.CoreLib и вызывает Main'],
      explain: 'Каждый слой знает только свой файл: hostfxr — runtimeconfig.json, hostpolicy — deps.json. Управляемый код появляется только на последнем шаге.'
    },
    {
      t: 'learn',
      title: 'hostpolicy: список сборок до старта',
      body: '<p>hostpolicy читает <code>app.deps.json</code> и deps.json каждого фреймворка (что в них записано — в разделе «Сборки и версии») и превращает их в <b>полные пути</b> к файлам. Главный результат — <b>TPA</b> (Trusted Platform Assemblies), тот самый список всех сборок приложения и фреймворка из раздела «Сборки и версии». Теперь видно, кто и когда его строит.</p><p>Этот список и пути к нативным библиотекам hostpolicy передаёт в <code>coreclr_initialize</code> как свойства, а потом вызывает <code>coreclr_execute_assembly</code>.</p><p>Отсюда главное отличие от .NET Framework: CLR не обходит диск в поисках сборки. Контекст по умолчанию берёт путь из TPA по простому имени. Нет в списке — сборка не найдена, даже если файл лежит рядом.</p>',
      code: '// упрощённо: что hostpolicy передаёт рантайму\ncoreclr_initialize(exePath, ..., properties)\n    TRUSTED_PLATFORM_ASSEMBLIES   = .../System.Runtime.dll : /app/app.dll : /app/Dapper.dll\n    NATIVE_DLL_SEARCH_DIRECTORIES = /app/ : /usr/share/dotnet/shared/Microsoft.NETCore.App/8.0.17/\n    APP_CONTEXT_BASE_DIRECTORY    = /app/\ncoreclr_execute_assembly(..., "/app/app.dll", ...)',
      lang: 'plain',
      deep: '<p>Все эти свойства видно из кода: <code>AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")</code>, а список прочитанных deps.json — <code>AppContext.GetData("APP_CONTEXT_DEPS_FILES")</code>. Разделитель путей — «;» в Windows и «:» в остальных системах.</p><p>Если deps.json нет совсем, hostpolicy считает, что все зависимости лежат в папке приложения, и строит TPA из её содержимого. Переменная <code>DOTNET_ADDITIONAL_DEPS</code> добавляет ещё deps-файлы, но только для приложений, зависящих от фреймворка.</p>'
    },
    {
      t: 'choice',
      q: 'Ты вручную скопировал Extra.dll в папку приложения. Код ссылается на неё статически, но в app.deps.json её нет. Что произойдёт при первом обращении к типу из Extra?',
      options: ['FileNotFoundException: сборки нет в TPA', 'Сборка загрузится из папки приложения', 'Ошибка ещё при запуске, до Main', 'hostpolicy допишет её в deps.json'],
      answer: 0,
      explain: 'Когда deps.json есть, TPA строится только по нему. Контекст по умолчанию ищет сборку по имени в этом списке и по папке не ходит. Чини проектом (ссылкой на пакет или сборку) или свежей публикацией, а не копированием файлов.',
      wrong: { 1: 'Так было в .NET Framework: он пробовал папку приложения. В современном .NET папка читается, только если deps.json нет вовсе.', 2: 'hostpolicy не проверяет, на что ссылается код. Сборки грузятся лениво, при первом обращении.' }
    },
    {
      t: 'learn',
      title: 'coreclr: один рантайм на процесс',
      body: '<p><code>coreclr</code> поднимает сборщик мусора, загружает JIT (<code>clrjit</code>), читает <code>System.Private.CoreLib</code>, создаёт единственный AppDomain и контекст загрузки по умолчанию — и вызывает <code>Main</code>.</p><p>Важное ограничение: в одном процессе может работать <b>только один</b> рантайм. Нельзя держать .NET 8 и .NET 9 рядом. Нативная программа, которая запускает .NET у себя внутри (плагин для редактора, COM-сервер), получит уже загруженный рантайм, если он подходит, или ошибку.</p>',
      deep: 'Кроме muxer и apphost, в .NET есть и другие нативные хосты: comhost (управляемый COM-сервер), ijwhost (сборки C++/CLI), nethost (для произвольных нативных программ). Все они ведут к тому же hostfxr. В Native AOT этой цепочки нет вовсе: рантайм вкомпилирован в сам исполняемый файл.'
    },
    {
      t: 'match',
      q: 'Соедини компонент и его работу',
      pairs: [
        ['dotnet (muxer)', 'Решает: запуск приложения или команда SDK'],
        ['apphost', 'Ищет установку .NET для одного приложения'],
        ['hostfxr', 'Выбирает версию фреймворка по runtimeconfig.json'],
        ['hostpolicy', 'Собирает TPA по deps.json'],
        ['coreclr', 'GC, JIT и загрузчик типов']
      ]
    },
    {
      t: 'learn',
      title: 'Когда не запускается: трассировка хоста',
      body: '<p>Ошибки до <code>Main</code> не видны ни в логах приложения, ни в отладчике управляемого кода. Включи трассировку хоста: каждый слой напишет, что искал, где и что выбрал.</p>',
      code: '# Linux, macOS\nDOTNET_HOST_TRACE=1 DOTNET_HOST_TRACEFILE=host.txt ./app\n\n# что установлено\ndotnet --list-runtimes',
      lang: 'plain',
      deep: 'Старые имена переменных — COREHOST_TRACE, COREHOST_TRACEFILE, COREHOST_TRACE_VERBOSITY — тоже работают. Уровень подробности задаёт DOTNET_HOST_TRACE_VERBOSITY от 1 до 4. В трассе видно, какой hostfxr загружен, какой runtimeconfig.json прочитан, какие версии фреймворка рассматривались и полный TPA.'
    },
    {
      t: 'choice',
      q: 'Приложение опубликовано как self-contained. На сервере задан DOTNET_ROOT с установленным .NET 9. Какой рантайм запустится?',
      options: ['Тот, что лежит в папке приложения', 'Из DOTNET_ROOT — переменная важнее всего', 'Самый новый из установленных глобально', 'Запуск упадёт: два рантайма конфликтуют'],
      answer: 0,
      explain: 'Apphost self-contained приложения находит hostfxr рядом с собой, а runtimeconfig.json перечисляет includedFrameworks. Глобальные установки и DOTNET_ROOT в этом режиме не используются.'
    }
  ]
};
