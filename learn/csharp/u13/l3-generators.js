/** C# глубже, раздел «Атрибуты и рефлексия», урок 3: source generators вместо рефлексии, trimming и Native AOT. */
export default {
  id: 'cs.u13.l3',
  title: 'Генераторы, trimming и AOT',
  sub: 'Код при компиляции вместо рефлексии при запуске',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Что не так с рефлексией при запуске',
      body: '<p>Сериализатор, DI-контейнер, логгер на рефлексии делают свою работу <b>при каждом запуске</b>: обходят свойства, читают атрибуты, компилируют делегаты. Это время старта и память. И этого кода не видит никто, кроме рантайма: ни компилятор, ни инструмент, который выкидывает неиспользуемый код.</p><p><b>Source generator</b> переносит эту работу в компиляцию. Это компонент Roslyn: он запускается внутри сборки проекта, видит синтаксис и типы и <b>добавляет</b> новые файлы C#. Менять существующий код он не может — поэтому генераторы работают через <code>partial</code>-классы и <code>partial</code>-методы: ты объявляешь, генератор дописывает тело.</p>',
      deep: '<p>Генераторы появились в .NET 5 (C# 9), а в .NET 6 — инкрементальные (<code>IIncrementalGenerator</code>): IDE перезапускает только ту часть, чьи входные данные изменились. Сгенерированные файлы видны в Solution Explorer под Dependencies → Analyzers, а с <code>&lt;EmitCompilerGeneratedFiles&gt;true&lt;/EmitCompilerGeneratedFiles&gt;</code> ложатся на диск в <code>obj</code>.</p><p>Атрибуты генератор видит как символы (<code>AttributeData</code>): аргументы из blob, без создания объекта и без запуска твоего кода.</p>'
    },
    {
      t: 'choice',
      q: 'Что может source generator?',
      options: ['Добавить новые файлы C# в компиляцию', 'Изменить тело уже написанного метода', 'Выполниться при запуске приложения', 'Создать объект атрибута через GetCustomAttribute'],
      answer: 0,
      explain: 'Генератор только добавляет код, и только во время компиляции. Чтобы встроиться в твой тип, нужен partial: ты пишешь объявление, генератор — реализацию. Атрибуты он читает как метаданные компилятора, а не как объекты.',
      wrong: { 1: 'Существующий код генератору доступен только для чтения. Поэтому все генераторы .NET требуют partial.' }
    },
    {
      t: 'learn',
      title: 'System.Text.Json: контекст вместо разбора типа',
      body: '<p>Без подсказок <code>JsonSerializer</code> при первой встрече с типом обходит его свойства рефлексией, строит метаданные и кэширует. Первый вызов заметно дороже следующих.</p><p>С генератором ты объявляешь <code>partial</code>-класс-наследник <code>JsonSerializerContext</code> и перечисляешь типы атрибутами <code>[JsonSerializable]</code>. Генератор пишет для каждого готовый <code>JsonTypeInfo&lt;T&gt;</code>: список свойств, геттеры и сеттеры как обычный код. Передаёшь его в <code>Serialize</code> — рефлексии нет.</p>',
      code: '[JsonSerializable(typeof(Order))]\ninternal partial class AppJson : JsonSerializerContext { }\n\nstring json = JsonSerializer.Serialize(order, AppJson.Default.Order);\nOrder? back = JsonSerializer.Deserialize(json, AppJson.Default.Order);',
      deep: '<p>Генератор System.Text.Json появился в .NET 6. Режимы: <b>metadata</b> — генерирует описание типа, а сериализатор работает по нему; <b>serialization</b> (fast path) — генерирует прямой код записи в <code>Utf8JsonWriter</code>, только для сериализации. Выбор — через <code>[JsonSourceGenerationOptions(GenerationMode = …)]</code>.</p><p>С .NET 8 есть свойство проекта <code>JsonSerializerIsReflectionEnabledByDefault=false</code>: сериализация без контекста бросает <code>InvalidOperationException</code> с понятным текстом. Так забытый вызов найдётся при обычной отладке, а не после публикации в AOT.</p>'
    },
    {
      t: 'blanks',
      q: 'Подключи генератор System.Text.Json для Order',
      code: '[___(typeof(Order))]\ninternal ___ class AppJson : JsonSerializerContext { }\n\nvar json = JsonSerializer.Serialize(order, AppJson.___.Order);',
      tiles: ['JsonSerializable', 'partial', 'Default', 'Serializable', 'sealed', 'Instance'],
      answer: ['JsonSerializable', 'partial', 'Default'],
      explain: 'Типы перечисляют атрибутом [JsonSerializable], класс обязан быть partial, чтобы генератор его дописал. Готовый экземпляр контекста — статическое свойство Default, в нём по свойству JsonTypeInfo на каждый тип. [Serializable] — псевдо-атрибут старой сериализации, генератор на него не смотрит.'
    },
    {
      t: 'learn',
      title: 'Regex и логирование: тот же приём',
      body: '<p><code>new Regex(p, RegexOptions.Compiled)</code> разбирает шаблон при запуске и генерирует IL через Reflection.Emit — это дорого на старте. <code>[GeneratedRegex]</code> (.NET 7) пишет код сопоставления C# при компиляции: старт бесплатный, а сгенерированный код можно прочитать и пройти отладчиком.</p><p><code>logger.LogInformation("Order {Id} paid", id)</code> на каждом вызове разбирает шаблон (с кэшем), упаковывает <code>id</code> в <code>params object[]</code> и выделяет массив — даже если уровень отключён. <code>[LoggerMessage]</code> (.NET 6) генерирует строго типизированный метод: проверка <code>IsEnabled</code>, без массива и упаковки.</p>',
      code: 'static partial class Patterns\n{\n    [GeneratedRegex(@"^\\d{4}-\\d{2}-\\d{2}$")]\n    public static partial Regex IsoDate();\n}\n\nstatic partial class Log\n{\n    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Order {Id} paid")]\n    public static partial void OrderPaid(ILogger logger, int id);\n}',
      deep: '<p>С C# 13 и .NET 9 <code>[GeneratedRegex]</code> можно повесить и на <code>partial</code>-свойство: <code>public static partial Regex IsoDate { get; }</code>.</p><p>Там, где нет генерации кода при запуске, <code>RegexOptions.Compiled</code> молча игнорируется и работает интерпретатор. С <code>[GeneratedRegex]</code> такой просадки нет.</p><p>Другие генераторы из .NET 8: привязка конфигурации (<code>EnableConfigurationBindingGenerator</code>), проверка опций, Request Delegate Generator для Minimal API.</p>'
    },
    {
      t: 'match',
      q: 'Соедини инструмент и работу, которую он убирает со времени запуска',
      pairs: [
        ['JsonSerializerContext', 'Обход свойств типа при первом Serialize'],
        ['[GeneratedRegex]', 'Генерация IL для RegexOptions.Compiled'],
        ['[LoggerMessage]', 'params object[] и упаковка на каждом вызове'],
        ['UnsafeAccessor', 'FieldInfo.GetValue для приватного поля']
      ]
    },
    {
      t: 'learn',
      title: 'Trimming и Native AOT',
      body: '<p><b>Trimming</b> при публикации выкидывает код, до которого не дойти по статическому анализу. Вызов по строке анализ не видит: метод могут удалить, и при запуске будет <code>MissingMethodException</code> или <code>null</code> из <code>GetMethod</code>.</p><p><b>Native AOT</b> компилирует всю программу в машинный код заранее и всегда включает trimming. JIT при запуске нет — значит, нет <code>Reflection.Emit</code>, а для дженерика, собранного через <code>MakeGenericType</code>, может не оказаться готового машинного кода. Сама рефлексия работает — для того, что сохранилось.</p><p>Опасные места анализатор помечает предупреждениями: <b>IL2xxx</b> — trimming, <b>IL3xxx</b> — AOT. Включаются <code>&lt;IsAotCompatible&gt;true&lt;/IsAotCompatible&gt;</code> в библиотеке или <code>PublishAot</code> в приложении.</p>',
      code: 'string a = JsonSerializer.Serialize(order);    // IL2026 + IL3050\nvar t = typeof(List<>).MakeGenericType(type);  // IL3050\nType? u = Type.GetType(Console.ReadLine()!);   // IL2057',
      deep: '<p><b>IL2026</b> — вызов члена с <code>[RequiresUnreferencedCode]</code>, <b>IL3050</b> — с <code>[RequiresDynamicCode]</code>. Так в .NET 8+ размечены API, которые без рефлексии по неизвестным типам или генерации кода не работают. Свой такой метод помечай этими же атрибутами — предупреждение уйдёт к вызывающим.</p><p><code>[UnconditionalSuppressMessage]</code> заглушает предупреждение насовсем, в том числе при публикации. Ставь его, только если доказал, что нужные члены сохранятся.</p>'
    },
    {
      t: 'multi',
      q: 'Что даст предупреждение анализатора при PublishAot? Отметь все.',
      options: ['JsonSerializer.Serialize(order) без контекста', 'new DynamicMethod("x", typeof(int), Type.EmptyTypes)', 'JsonSerializer.Serialize(order, AppJson.Default.Order)', 'typeof(Order).GetMethod("Calc")', 'Type.GetType(name), где name прочитан из файла'],
      answer: [0, 1, 4],
      explain: 'Serialize без контекста размечен RequiresUnreferencedCode и RequiresDynamicCode (IL2026, IL3050), DynamicMethod — RequiresDynamicCode (IL3050), неизвестная строка в Type.GetType — IL2057. А typeof и строку-константу анализатор понимает: метод Calc сохранится.'
    },
    {
      t: 'learn',
      title: 'DynamicallyAccessedMembers: договор о том, что сохранить',
      body: '<p>Когда метод принимает <code>Type</code> и что-то с ним делает рефлексией, анализатор не знает, какие члены сохранить. Аннотация <code>[DynamicallyAccessedMembers]</code> на параметре говорит: «у этого типа нужны публичные конструкторы» (или методы, свойства…).</p><p>Требование идёт вверх по цепочке. Кто передаёт <code>typeof(Order)</code> — анализатор сохранит нужное. Кто передаёт свой параметр <code>Type</code> — тоже обязан его разметить. А если на вершине тип пришёл из строки — предупреждение будет там.</p>',
      code: '// IL2067: неизвестно, есть ли у t конструктор\nstatic object Make(Type t) => Activator.CreateInstance(t)!;\n\n// аннотация: «сохрани публичный конструктор без параметров»\nstatic object Make2(\n    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicParameterlessConstructor)]\n    Type t) => Activator.CreateInstance(t)!;\n\nMake2(typeof(Order));   // ok: конструктор Order() сохранится'
    },
    {
      t: 'tapline',
      q: 'На какой строке анализатор trimming выдаст предупреждение?',
      code: 'static void Run(\n    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)] Type t)\n    => t.GetMethod("Start")?.Invoke(null, null);\n\nRun(typeof(Job));\nType j = typeof(Job);\nRun(j);\nRun(Type.GetType(Console.ReadLine()!)!);',
      answer: 7,
      explain: 'Внутри Run всё чисто: параметр размечен, GetMethod разрешён. typeof(Job) анализатор видит и сохранит публичные методы Job — и через локальную переменную тоже. А тип из введённой строки неизвестен: IL2057 на последней строке.'
    },
    {
      t: 'learn',
      title: 'Тогда и сейчас',
      body: '<p>В .NET Framework рефлексия была нормой: <code>XmlSerializer</code> генерировал сборки при запуске, <code>BinaryFormatter</code> писал любые объекты через рефлексию, DI-контейнеры сканировали сборки, а <code>RegexOptions.Compiled</code> генерировал IL. JIT был всегда, trimming — нет.</p><p>Сейчас библиотеки .NET размечены для trimming и AOT, а горячие места переходят на генераторы. <code>BinaryFormatter</code> в .NET 9 удалён: его методы бросают <code>PlatformNotSupportedException</code>.</p><p>Правило: рефлексия по известным типам при старте или в инструментах — нормально. В горячем пути — делегат, <code>UnsafeAccessor</code> или генератор. Под AOT — генератор.</p>'
    },
    {
      t: 'choice',
      q: 'Мини-фреймворк при старте находит все классы с [Handler] через Assembly.GetTypes() и создаёт их через Activator. Приложение нужно опубликовать с Native AOT. Что лучше?',
      options: ['Генератор: собрать при компиляции список обработчиков и код их создания', 'Подавить предупреждения через UnconditionalSuppressMessage', 'Заменить GetCustomAttribute на CustomAttributeData', 'Кэшировать найденные типы в static-поле'],
      answer: 0,
      explain: 'Классы, на которые никто не ссылается в коде, trimming удалит, и GetTypes их просто не вернёт — тихо, без ошибки. Генератор находит [Handler] при компиляции и пишет new HandlerA(), new HandlerB(): анализатор видит прямые ссылки, рефлексии при запуске нет.',
      wrong: { 1: 'Предупреждение пропадёт, а проблема останется: удалённые классы не найдутся при запуске.', 3: 'Кэш ускоряет повторный поиск, но не возвращает удалённые типы.' }
    }
  ]
};
