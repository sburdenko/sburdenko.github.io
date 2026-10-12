/** .NET изнутри, финал раздела «Загрузка и хостинг». */
export default {
  id: 'dotnet.w6.boss',
  title: 'Финал: загрузка и хостинг',
  sub: 'Хост, версии рантайма, контексты, выгрузка и падения',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'order',
      q: 'Собери запуск dotnet app.dll от команды до Main',
      items: ['Muxer берёт hostfxr самой новой версии из host/fxr', 'hostfxr читает runtimeconfig.json и выбирает версию Microsoft.NETCore.App', 'hostpolicy из папки фреймворка строит TPA по deps.json', 'coreclr поднимает GC и JIT и загружает System.Private.CoreLib', 'Контекст по умолчанию загружает app.dll, вызывается Main'],
      explain: 'Версию рантайма выбирает hostfxr, а не muxer. Список сборок готов до старта CLR, и контекст по умолчанию берёт сборки из него.'
    },
    {
      t: 'choice',
      q: 'Приложение просит 8.0.0. Установлены 8.0.17, 9.0.6 и 10.0.2. В runtimeconfig.json стоит rollForward = Major, но сервис запускают с DOTNET_ROLL_FORWARD=LatestMajor. Какой рантайм выберется?',
      options: ['10.0.2', '8.0.17', '9.0.6', 'Запуск упадёт: настройки противоречат друг другу'],
      answer: 0,
      explain: 'Переменная окружения перекрывает runtimeconfig.json, а LatestMajor берёт самую новую версию, даже когда своя старшая есть. С Major из файла выбралась бы 8.0.17.',
      wrong: { 1: 'Так решил бы Major из runtimeconfig.json. Но DOTNET_ROLL_FORWARD главнее файла.', 2: 'Ближайшую следующую старшую взял бы Major — и только если бы 8.x не было вовсе.' }
    },
    {
      t: 'multi',
      q: 'Что верно про хостинг? Отметь все.',
      options: ['DOTNET_ROOT перекрывает зарегистрированное место установки для apphost', 'global.json влияет на выбор рантайма для dotnet app.dll', 'В одном процессе можно держать .NET 8 и .NET 9', 'У self-contained приложения hostfxr лежит в папке приложения'],
      answer: [0, 3],
      explain: 'Apphost смотрит DOTNET_ROOT раньше реестра или /etc/dotnet и берёт первую найденную установку. global.json выбирает только SDK. Рантайм в процессе всегда один.'
    },
    {
      t: 'choice',
      q: 'В TPA хоста есть Newtonsoft.Json 13. Плагин грузится в PluginLoadContext с AssemblyDependencyResolver, а в его папке и plugin.deps.json — Newtonsoft.Json 12. Какую версию получит код плагина?',
      options: ['12 — Load плагина нашёл её раньше, чем дошло до Default', '13 — сборка из TPA всегда важнее', 'Обе: каждый вызов получит свою', 'FileLoadException: две версии одного имени в процессе'],
      answer: 0,
      explain: 'Активный контекст для ссылок плагина — его собственный. Сначала его кэш, потом его Load: резолвер вернул путь к версии 12, и она загружена в контекст плагина. До Default и TPA дело не дошло.',
      wrong: { 1: 'TPA важнее пути только внутри контекста по умолчанию. В своём контексте решает его Load.', 3: 'Две версии в процессе — нормально, если они в разных контекстах. Ровно для этого контексты и нужны.' }
    },
    {
      t: 'tapline',
      q: 'Create — метод хоста, который грузит плагин в alc. После Run и цикла GC.Collect контекст жив. Какая строка мешает выгрузке?',
      code: '[MethodImpl(MethodImplOptions.NoInlining)]\nstatic WeakReference Run(string path)\n{\n    var alc = new PluginLoadContext(path);\n    IPlugin plugin = Create(alc, path);\n    string report = plugin.BuildReport();\n    Host.Settings.Changed += plugin.OnSettingsChanged;\n    Console.WriteLine(report);\n    alc.Unload();\n    return new WeakReference(alc);\n}',
      answer: 6,
      explain: 'Событие долгоживущего объекта хоста хранит делегат, а делегат — ссылку на объект плагина. Через него держатся тип, сборка и контекст. Строка report — обычный System.String, контекст она не держит.'
    },
    {
      t: 'choice',
      q: 'Сервис на .NET 8 упал ночью. В логе из обработчика UnhandledException — исключение из колбэка System.Threading.Timer. Как сделать, чтобы такие ошибки не роняли сервис?',
      options: ['Ловить исключения внутри колбэка таймера', 'Ставить e.IsTerminating = false в обработчике UnhandledException', 'Включить legacyUnhandledExceptionPolicy в runtimeconfig.json', 'Создавать таймер внутри отдельного AssemblyLoadContext'],
      answer: 0,
      explain: 'Колбэк таймера работает в пуле потоков, выше него обработчика нет. Единственное место, где исключение можно обработать, — сам колбэк: try/catch с логом и решением, что делать дальше.',
      wrong: { 1: 'IsTerminating только сообщает, что процесс завершается. Свойство нельзя изменить, и падение не отменить.', 2: 'Этот флаг был в app.config .NET Framework. В современном .NET его нет.', 3: 'Контекст загрузки изолирует имена сборок, а не потоки и не исключения.' }
    },
    {
      t: 'blanks',
      q: 'Нужен один исполняемый файл с рантаймом внутри, обрезанный по размеру. Допиши проект.',
      code: '<PropertyGroup>\n  <RuntimeIdentifier>linux-x64</RuntimeIdentifier>\n  <SelfContained>true</SelfContained>\n  <___>true</___>\n  <PublishTrimmed>true</PublishTrimmed>\n</PropertyGroup>',
      lang: 'xml',
      tiles: ['PublishSingleFile', 'PublishSingleFile', 'PublishReadyToRun', 'UseAppHost', 'EnableDynamicLoading'],
      answer: ['PublishSingleFile', 'PublishSingleFile'],
      explain: 'PublishSingleFile дописывает сборки к apphost одним бандлом. SelfContained кладёт внутрь рантайм, PublishTrimmed выкидывает неиспользуемый код. Помни: у сборок из бандла Assembly.Location пустая.'
    },
    {
      t: 'match',
      q: 'Симптом и его причина',
      pairs: [
        ['InvalidCastException между «одинаковыми» типами', 'Контракт загружен в два контекста'],
        ['Assembly.Location — пустая строка', 'Публикация single-file'],
        ['MissingMethodException в плагине', 'Обрезка удалила API фреймворка'],
        ['Контекст не выгружается', 'Сильная ссылка из хоста'],
        ['«You must install or update .NET»', 'hostfxr не нашёл версию по rollForward']
      ]
    },
    {
      t: 'choice',
      q: 'Вышел патч безопасности .NET 8, админ поставил его на сервер. На сервере два приложения под net8.0: одно зависит от фреймворка, другое self-contained. Кто получит исправление после перезапуска?',
      options: ['Только зависимое от фреймворка', 'Только self-contained', 'Оба', 'Ни одно, пока их не пересоберут'],
      answer: 0,
      explain: 'Зависимое приложение при старте берёт самый свежий установленный патч своей версии. Self-contained несёт рантайм в своей папке и обновится только новой публикацией.'
    }
  ]
};
