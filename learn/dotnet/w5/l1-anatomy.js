/** .NET изнутри, раздел «Сборки и версии», урок 1: что лежит в сборке — манифест, модули, ресурсы, переадресация типов. */
const MANIFEST = '.assembly extern Shop.Core\n{\n  .ver 2:0:0:0\n}\n.assembly Shop\n{\n  .ver 1:2:0:0\n}\n.mresource public Shop.Data.prices.json\n{\n}\n.class extern forwarder Shop.Money\n{\n  .assembly extern Shop.Core\n}';

export default {
  id: 'dotnet.w5.l1',
  title: 'Что внутри сборки',
  sub: 'Манифест, модули, ресурсы и переадресация типов',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Сборка — не просто файл',
      body: '<p>В разделе «Как запускается код .NET» ты видел, что в .dll лежат CIL и метаданные. Теперь важнее другое: сборка (assembly) — это <b>единица развёртывания и версии</b>. У неё есть <b>идентичность</b> (identity) из четырёх частей: простое имя, версия, культура и открытый ключ.</p><p>Тип принадлежит сборке. Для CLR класс <code>Shop.Order</code> из сборки Shop и класс <code>Shop.Order</code> из сборки Shop.Legacy — два разных типа, хоть имена и совпадают.</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.FullName);\n// Shop, Version=1.2.0.0, Culture=neutral, PublicKeyToken=null\nConsole.WriteLine(typeof(string).Assembly.GetName().Name);\n// System.Private.CoreLib',
      deep: '<p>Отсюда известная загадка: <code>InvalidCastException: Unable to cast object of type \'Shop.Order\' to type \'Shop.Order\'</code>. Это значит, что одна и та же сборка загружена дважды (например, из двух путей или в два контекста загрузки), и полное имя типа совпадает, а сам тип — нет. Как сборки попадают в разные контексты — тема следующего раздела.</p><p><code>PublicKeyToken=null</code> значит, что у сборки нет строгого имени. О строгих именах — урок 3.</p>'
    },
    {
      t: 'learn',
      title: 'Манифест: паспорт сборки',
      body: '<p><b>Манифест</b> (manifest) — часть метаданных, которая описывает сборку целиком, а не отдельные типы. Это несколько таблиц:</p><ul><li><b>Assembly</b> — своя идентичность: имя, версия, культура, открытый ключ;</li><li><b>AssemblyRef</b> — от каких сборок зависим и <b>каких версий</b> ждём;</li><li><b>ManifestResource</b> — встроенные ресурсы;</li><li><b>ExportedType</b> — типы, которые сборка отдаёт за другую сборку;</li><li><b>File</b> — другие файлы сборки (была нужна многофайловым сборкам).</li></ul><p>Так манифест выглядит в дизассемблере:</p>',
      code: '.assembly extern System.Runtime\n{\n  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )\n  .ver 9:0:0:0\n}\n.assembly Shop\n{\n  .ver 1:2:0:0\n}\n.module Shop.dll',
      lang: 'il',
      deep: 'Строка .ver в .assembly extern — версия, против которой компилятор собрал код. Он записал её в AssemblyRef навсегда: пересобрать зависимость можно, а ссылка в Shop.dll останется 9.0.0.0, пока не пересоберёшь сам Shop. Что загрузчик делает с этим числом — урок 2.'
    },
    {
      t: 'choice',
      q: 'Что входит в идентичность сборки?',
      options: ['Имя, версия, культура и открытый ключ', 'Имя файла и дата компиляции', 'Имя, AssemblyVersion и FileVersion', 'Путь к файлу и хеш IL'],
      answer: 0,
      explain: 'Эти четыре части записаны в таблице Assembly и в каждой ссылке AssemblyRef. Имя файла, путь и дата в идентичность не входят.',
      wrong: { 2: 'FileVersion — ресурс для Проводника Windows, в идентичность он не входит. Подробнее — в уроке 2.' }
    },
    {
      t: 'learn',
      title: 'Модули: тогда и сейчас',
      body: '<p><b>Модуль</b> (module) — один PE-файл с метаданными. Сборка состоит из модулей, и в одном из них лежит манифест.</p><p><b>Тогда.</b> В .NET Framework сборка могла быть многофайловой: <code>csc -target:module</code> давал файл <code>.netmodule</code> без манифеста, а таблица File главного модуля перечисляла остальные с хешами. Так склеивали в одну сборку код на разных языках или докачивали редкие части по сети.</p><p><b>Сейчас.</b> Современный .NET многофайловые сборки не поддерживает: одна сборка — один модуль — один файл. Публикация в один файл (single-file) — совсем другой механизм, о нём в следующем разделе.</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.ManifestModule.Name);  // Shop.dll\nConsole.WriteLine(asm.GetModules().Length);  // 1',
      deep: 'У каждого модуля в метаданных есть свой тип &lt;Module&gt; — в нём живут глобальные функции и инициализатор модуля ([ModuleInitializer] в C# 9). Метаданные адресуются токенами в пределах модуля, поэтому ссылки между модулями одной сборки шли через отдельную таблицу ModuleRef. В современных проектах это наследство почти не встречается.'
    },
    {
      t: 'multi',
      q: 'Что есть в любой сборке современного .NET? Отметь все.',
      options: ['Манифест с её идентичностью', 'Ровно один модуль — сам файл', 'Метаданные', 'Встроенные ресурсы', 'Файл .netmodule рядом'],
      answer: [0, 1, 2],
      explain: 'Ресурсы есть не всегда. Файлы .netmodule были частью многофайловых сборок .NET Framework, современный рантайм их не грузит.'
    },
    {
      t: 'learn',
      title: 'Ресурсы внутри сборки',
      body: '<p>Файл с действием сборки <b>EmbeddedResource</b> компилятор кладёт прямо в PE-файл, а в таблицу ManifestResource — его имя. Имя строится так: корневое пространство имён проекта, путь к файлу через точки, имя файла.</p><p>Читают ресурс потоком, без распаковки на диск.</p>',
      code: '// в Shop.csproj: <EmbeddedResource Include="Data\\prices.json" />\nvar asm = typeof(Order).Assembly;\nforeach (var name in asm.GetManifestResourceNames())\n    Console.WriteLine(name);   // Shop.Data.prices.json\n\nusing var s = asm.GetManifestResourceStream("Shop.Data.prices.json")!;',
      deep: '<p>Файлы <code>.resx</code> при сборке превращаются в двоичные <code>.resources</code> и встраиваются так же; читает их <code>ResourceManager</code>.</p><p>Переводы на другие языки идут в <b>сателлитные сборки</b> (satellite assemblies): <code>ru/Shop.resources.dll</code>. У такой сборки в идентичности культура <code>ru</code>, кода в ней нет — только ресурсы. <code>ResourceManager</code> ищет сборку для текущей культуры интерфейса, потом для родительской культуры, и в конце берёт ресурсы из главной сборки.</p>'
    },
    {
      t: 'blanks',
      q: 'Выведи имена всех встроенных ресурсов и открой каждый',
      code: 'var asm = typeof(Order).Assembly;\nforeach (var name in asm.___())\n{\n    using var s = asm.___(name)!;\n    Console.WriteLine($"{name}: {s.Length} байт");\n}',
      tiles: ['GetManifestResourceNames', 'GetManifestResourceStream', 'GetFiles', 'GetTypes', 'GetManifestResourceInfo'],
      answer: ['GetManifestResourceNames', 'GetManifestResourceStream'],
      explain: 'Имена берутся из таблицы ManifestResource, поток читает байты ресурса из PE-файла. GetFiles — про файлы многофайловой сборки, к встроенным ресурсам он не относится.'
    },
    {
      t: 'learn',
      title: 'Версия 2: тип переехал в другую сборку',
      body: '<p>В версии 2 класс <code>Money</code> переносят из Shop.dll в новую Shop.Core.dll. Старое приложение не пересобирали, и в его IL записано <code>[Shop]Shop.Money</code>: CLR пойдёт за типом в Shop и не найдёт его — <code>TypeLoadException</code>.</p><p>Решение — <b>переадресация типа</b> (type forwarding). Shop.dll ссылается на Shop.Core и объявляет атрибут. Компилятор пишет строку в таблицу ExportedType, и CLR, не найдя тип в Shop, идёт туда, куда она указывает.</p>',
      code: '// Shop.dll, версия 2: Money теперь живёт в Shop.Core.dll\nusing System.Runtime.CompilerServices;\n\n[assembly: TypeForwardedTo(typeof(Shop.Money))]',
      deep: '<p>На переадресации держится вся современная BCL. Твой код скомпилирован против <code>System.Runtime</code>, а в рантайме System.Runtime.dll — почти пустая сборка, которая переадресует <code>Object</code>, <code>String</code> и остальное в <code>System.Private.CoreLib</code>. Так же устроен <code>netstandard.dll</code> из курса истории: фасад, который на каждой платформе переадресует типы туда, где они реально живут.</p><p>Обратный атрибут <code>TypeForwardedFrom</code> нужен не загрузчику, а сериализаторам, которые записали старое имя сборки в данные.</p>'
    },
    {
      t: 'choice',
      q: 'Money перенесли из Shop.dll в Shop.Core.dll без TypeForwardedTo. Старое App.exe не пересобирали. Что будет?',
      options: ['TypeLoadException, когда понадобится тип Money', 'Всё заработает: CLR найдёт тип по имени в любой загруженной сборке', 'App.exe не запустится: ошибка проверки при старте процесса', 'Money загрузится из старой копии Shop.dll в кэше'],
      answer: 0,
      explain: 'Ссылка на тип в IL включает сборку. CLR ищет Money только в Shop и падает, как только JIT компилирует метод, которому нужен этот тип.',
      wrong: { 1: 'Такого поиска «по всем сборкам» нет: имя сборки — часть ссылки на тип.' }
    },
    {
      t: 'tapline',
      q: 'Манифест Shop.dll версии 2. Какая строка позволит старому коду найти Money?',
      code: MANIFEST,
      lang: 'il',
      answer: 11,
      explain: '.class extern forwarder — строка таблицы ExportedType: «тип Shop.Money ищи в Shop.Core». Её создаёт атрибут TypeForwardedTo.'
    },
    {
      t: 'learn',
      title: 'Ref-сборки: компилируем против одного, запускаем другое',
      body: '<p>Компилятору нужны только сигнатуры, а не тела методов. Поэтому есть <b>ref-сборки</b> (reference assemblies): те же публичные типы и методы, но вместо тел — <code>throw null</code>.</p><p>Твой проект компилируется против ref-сборок из пакета <code>Microsoft.NETCore.App.Ref</code>, а запускается с настоящими сборками установленного рантайма. Связывает их только идентичность: имя и версия в AssemblyRef.</p>',
      code: '// так выглядит метод в ref-сборке\npublic static int Parse(string s) => throw null;',
      deep: 'Ref-сборка помечена атрибутом ReferenceAssemblyAttribute, и рантайм отказывается её исполнять: BadImageFormatException. SDK строит ref-сборку и для твоих проектов (obj/…/ref/): если публичный API не изменился, зависимые проекты не перекомпилируются. Отсюда же быстрые инкрементальные сборки в больших решениях.'
    },
    {
      t: 'match',
      q: 'Соедини таблицу манифеста и что в ней',
      pairs: [
        ['Assembly', 'Собственная идентичность сборки'],
        ['AssemblyRef', 'Зависимость и версия, против которой собирали'],
        ['ManifestResource', 'Встроенный файл'],
        ['ExportedType', 'Тип, переадресованный в другую сборку'],
        ['File', 'Другие модули многофайловой сборки']
      ]
    }
  ]
};
