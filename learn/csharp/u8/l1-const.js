/** C# глубже, раздел «Члены типа и версии», урок 1: const против static readonly и сценарий «версия 2». */
export default {
  id: 'cs.u8.l1',
  title: 'const и static readonly',
  sub: 'Значение константы вшивается в вызывающую сборку — и это видно на версии 2',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Две «константы» с разной природой',
      body: '<p><code>const</code> — значение, известное компилятору. Оно хранится в метаданных как литерал, и места в памяти у такого поля нет. <code>const</code> всегда статическое: писать <code>static const</code> нельзя.</p><p><code>static readonly</code> — обычное статическое поле. Его заполняет инициализатор или статический конструктор при запуске, а читают его во время работы. Присвоить ему можно только при инициализации типа.</p><p>Отсюда первое отличие: в <code>const</code> годятся только числа, <code>bool</code>, <code>char</code>, <code>string</code>, <code>decimal</code>, перечисления и <code>null</code>. <code>DateTime</code>, массив, <code>TimeSpan</code> — только <code>static readonly</code>.</p>',
      code: 'public static class Limits\n{\n    public const int MaxItems = 100;               // литерал в метаданных\n    public static readonly int MaxUsers = 100;     // поле, читается при работе\n    public static readonly DateTime Start = DateTime.UtcNow;\n    // public const DateTime Bad = ...;            // CS0283: так нельзя\n}'
    },
    {
      t: 'learn',
      title: 'Что компилятор пишет у вызывающего',
      body: '<p>Посмотри на IL у кода, который читает оба значения. Для константы компилятор <b>подставляет число</b> прямо в вызывающий метод: инструкция <code>ldc.i4.s 100</code>. Ссылки на поле <code>MaxItems</code> в этом коде нет вообще.</p><p>Для <code>static readonly</code> в IL стоит <code>ldsfld</code> — «загрузи статическое поле». Значение берётся из сборки-владельца при каждом запуске.</p><p>Подстановка — это и плюс, и минус. Плюс: константу можно использовать там, где нужно значение на этапе компиляции. Минус — в следующей карточке.</p>',
      code: '// C#\nConsole.WriteLine(Limits.MaxItems);\nConsole.WriteLine(Limits.MaxUsers);\n\n// IL вызывающего кода\nldc.i4.s   100                       // число вшито сюда\ncall       void Console::WriteLine(int32)\nldsfld     int32 Limits::MaxUsers    // чтение поля\ncall       void Console::WriteLine(int32)',
      deep: '<p>Строковая константа превращается в <code>ldstr "..."</code> и попадает в таблицу строк вызывающей сборки. <code>const decimal</code> устроен иначе: CLR не умеет хранить decimal как литерал, поэтому поле помечается атрибутом <code>DecimalConstantAttribute</code>, а у вызывающего компилятор собирает значение через конструктор <code>decimal</code>. Подстановка всё равно происходит.</p><p>Раз ссылки на поле нет, сборка-источник для этой строки не нужна во время работы. Если код берёт из библиотеки только константы, рантайм может её вообще не загрузить.</p>'
    },
    {
      t: 'choice',
      q: 'Какую инструкцию IL компилятор поставит у вызывающего для чтения public static readonly string Name?',
      options: ['ldsfld string Config::Name', 'ldstr со значением строки', 'call string Config::get_Name()', 'ldc.i4 с адресом строки'],
      answer: 0,
      explain: 'static readonly — обычное поле, его читают инструкцией ldsfld во время работы. ldstr с готовым значением был бы у const string.',
      wrong: { 1: 'Так компилятор поступает с const string: значение вшивается. static readonly он не трогает.', 2: 'get_Name — это аксессор свойства. Здесь поле, а не свойство.' }
    },
    {
      t: 'learn',
      title: 'Версия 2: библиотеку обновили, приложение — нет',
      body: '<p>Сценарий, ради которого весь урок. Библиотека <code>Shop.Core.dll</code> версии 1 объявляет <code>MaxItems = 100</code> и <code>MaxUsers = 100</code>. Приложение скомпилировано с ней.</p><p>Выходит версия 2: оба значения стали 200. Новую dll кладут рядом с приложением, а само приложение <b>не перекомпилируют</b> — так бывает с плагинами, общими пакетами, горячими исправлениями.</p><ul><li><code>MaxUsers</code> — 200: приложение читает поле из новой сборки.</li><li><code>MaxItems</code> — по-прежнему 100: число вшито в IL приложения ещё при сборке.</li></ul><p>Внутри самой библиотеки при этом уже 200. Две части одной программы видят разные значения, и ошибки нет ни при компиляции, ни при запуске.</p>',
      code: '// Shop.Core v2\npublic const int MaxItems = 200;\npublic static readonly int MaxUsers = 200;\n\n// Приложение, собранное с v1, запущено с v2:\nLimits.MaxItems   // 100 — старое значение из IL приложения\nLimits.MaxUsers   // 200 — прочитано из новой dll'
    },
    {
      t: 'tapline',
      q: 'Плагин собран с Shop.Core v1, где DefaultPageSize = 20. В v2 оба значения стали 50, плагин не пересобирали. Какая строка плагина всё ещё работает с 20?',
      code: 'public static class Paging\n{\n    public const int DefaultPageSize = 50;\n    public static readonly int MaxPageSize = 50;\n}\n\n// код плагина\nvar max = Paging.MaxPageSize;\nvar size = Paging.DefaultPageSize;\nvar pages = total / max;',
      answer: 8,
      explain: 'DefaultPageSize — const: при сборке плагина в его IL вписали 20, и новая dll этого не изменит. MaxPageSize читается из поля, поэтому уже 50. Последняя строка делит на max — тоже 50.'
    },
    {
      t: 'learn',
      title: 'Где константа обязательна',
      body: '<p>Есть места, где язык требует значение на этапе компиляции — и туда <code>static readonly</code> не пройдёт:</p><ul><li>метки <code>case</code> в <code>switch</code> и константные шаблоны (<code>x is Limits.MaxItems</code>);</li><li>аргументы атрибутов: <code>[MaxLength(Limits.MaxItems)]</code>;</li><li>значения необязательных параметров: <code>int size = Limits.MaxItems</code>.</li></ul><p>Во всех этих местах значение тоже вшивается в вызывающий код. Значение по умолчанию у параметра живёт у вызывающего по тому же принципу — подробнее о нём в разделе про параметры.</p>',
      code: 'switch (count)\n{\n    case Limits.MaxItems:     // нужен const\n        break;\n}\n\n[StringLength(Limits.MaxItems)]  // аргумент атрибута — тоже const\npublic string Title { get; set; } = "";'
    },
    {
      t: 'multi',
      q: 'Где static readonly int Max не скомпилируется? Отметь все.',
      options: ['case Max: в switch', '[Range(0, Max)] на свойстве', 'void Load(int n = Max)', 'var arr = new int[Max];', 'if (x > Max) return;'],
      answer: [0, 1, 2],
      explain: 'case, аргумент атрибута и значение параметра по умолчанию требуют константу. Размер массива и сравнение — обычные выражения, им подходит любое значение.'
    },
    {
      t: 'learn',
      title: 'Перечисления — это тоже константы',
      body: '<p>Каждый член <code>enum</code> — это <code>const</code> соответствующего числового типа. <code>Status.Paid</code> в вызывающем коде превращается в число.</p><p>Версия 2 с перечислением ломается тише всего. В v1 было <code>New, Paid, Shipped</code> — то есть 0, 1, 2. В v2 вставили <code>Pending</code> вторым — и <code>Paid</code> стал 2. Старое приложение пишет в базу 1, думая, что это Paid, а новая библиотека читает 1 как Pending.</p><p>Правило для публичных перечислений: <b>задавай числа явно</b> и добавляй новые значения только в конец.</p>',
      code: '// v1\npublic enum Status { New, Paid, Shipped }               // 0, 1, 2\n\n// v2 — ломает старых потребителей\npublic enum Status { New, Pending, Paid, Shipped }      // Paid = 2\n\n// Так безопасно\npublic enum Status { New = 0, Paid = 1, Shipped = 2, Pending = 3 }'
    },
    {
      t: 'choice',
      q: 'Приложение собрано с v1, где enum Color { Red, Green, Blue }. В v2 стало enum Color { Red, Yellow, Green, Blue }. Приложение не пересобирали. Что получит библиотека v2, если приложение передаст ей Color.Green?',
      options: ['Color.Yellow', 'Color.Green', 'ArgumentException', 'MissingFieldException'],
      answer: 0,
      explain: 'В IL приложения вшито число 1 — так Green значился в v1. В v2 единица — это Yellow. Ни компилятор, ни рантайм об этом не знают: для них это просто int.',
      wrong: { 1: 'Имя Green до библиотеки не доходит — только число из IL приложения.', 3: 'Поле Green при вызове не ищется: значение уже подставлено числом.' }
    },
    {
      t: 'learn',
      title: 'Что выбирать',
      body: '<p><b>public const</b> — только для того, что не изменится никогда: <code>int.MaxValue</code>, число дней в неделе, коды из внешнего стандарта.</p><p><b>static readonly</b> — для всего, что может поменяться в будущей версии: лимиты, таймауты, адреса, версии протокола.</p><p><b>private и internal const</b> — пожалуйста: такие константы видит только своя сборка, а она компилируется целиком, поэтому разъехаться значениям негде (если нет <code>InternalsVisibleTo</code>).</p><p>Про скорость можно не думать: на горячем пути разница обычно исчезает, см. «Глубже».</p>',
      deep: '<p>С многоуровневой компиляцией (tiered compilation) горячий метод перекомпилируется на tier 1, когда статический конструктор типа уже отработал. JIT видит, что значение <code>static readonly</code> поля примитивного типа больше не изменится, и подставляет его как константу — с последующим сворачиванием выражений и выбрасыванием мёртвых веток. Поэтому <code>static readonly bool</code>-флаги — дешёвый способ отключать код в горячих путях.</p><p>В .NET Framework такой оптимизации не было: <code>static readonly</code> честно читался из памяти. Отсюда старый совет «const быстрее», который в современном .NET почти потерял смысл.</p>'
    },
    {
      t: 'match',
      q: 'Соедини значение и как его лучше объявить в публичной библиотеке',
      pairs: [
        ['Число миллисекунд в секунде', 'public const'],
        ['Таймаут запроса по умолчанию', 'public static readonly'],
        ['Дата запуска сервиса', 'static readonly, const невозможен'],
        ['Порог внутри одного метода', 'локальный const'],
        ['Ключ кэша, видимый только в сборке', 'private const']
      ]
    },
    {
      t: 'blanks',
      q: 'Объяви лимит так, чтобы потребители увидели новое значение после замены dll без пересборки',
      code: 'public static class Api\n{\n    public ___ ___ int PageLimit = 500;\n}',
      tiles: ['static', 'readonly', 'const', 'volatile', 'sealed'],
      answer: ['static', 'readonly'],
      explain: 'static readonly — поле, его читают через ldsfld из актуальной сборки. const вшился бы в каждого потребителя.'
    }
  ]
};
