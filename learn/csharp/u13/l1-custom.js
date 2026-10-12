/** C# глубже, раздел «Атрибуты и рефлексия», урок 1: свой атрибут, где он хранится и как его читают. */
export default {
  id: 'cs.u13.l1',
  title: 'Свой атрибут',
  sub: 'Класс, AttributeUsage, blob в метаданных и псевдо-атрибуты',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Атрибут — это класс',
      body: '<p><b>Атрибут</b> (attribute) прикрепляет к типу, методу, полю или параметру данные, которые не выполняются, а читаются. Читать может компилятор (<code>[Obsolete]</code> → предупреждение при использовании), рантайм (<code>[StructLayout]</code>) или фреймворк: ASP.NET ищет <code>[Route]</code>, тестовый движок — <code>[Fact]</code>.</p><p>Свой атрибут — обычный класс, унаследованный от <code>System.Attribute</code>. Параметры конструктора дают <b>позиционные</b> аргументы, открытые поля и свойства с <code>set</code> — <b>именованные</b>. Суффикс <code>Attribute</code> в квадратных скобках можно не писать.</p>',
      code: '// Свой атрибут — обычный класс-наследник Attribute\npublic class RouteAttribute : Attribute\n{\n    public RouteAttribute(string path) => Path = path;\n    public string Path { get; }       // позиционный аргумент\n    public int Order { get; set; }    // именованный аргумент\n}\n\n[Route("/orders", Order = 2)]   // суффикс Attribute можно не писать\npublic class OrdersController { }',
      deep: '<p>С C# 11 атрибуты бывают обобщёнными: <code>class TagAttribute&lt;T&gt; : Attribute</code> и <code>[Tag&lt;int&gt;]</code>. Аргумент типа подчиняется тем же правилам, что <code>typeof</code>: нельзя <code>dynamic</code>, nullable-аннотации ссылочных типов, кортежи с именами.</p><p>Если на сам класс атрибута повесить <code>[Conditional("DEBUG")]</code>, компилятор будет записывать его в метаданные только там, где определён символ DEBUG. В Release-сборке такого атрибута просто нет.</p>'
    },
    {
      t: 'learn',
      title: 'Где живёт атрибут: байты, а не объект',
      body: '<p>Компилятор не создаёт объект атрибута. Он пишет в таблицу метаданных <b>CustomAttribute</b> одну строку: владельца (тип, метод, поле…), ссылку на конструктор атрибута и <b>blob</b> — аргументы, сериализованные в байты.</p><p>При загрузке сборки объект тоже не создаётся, конструктор не выполняется. Экземпляр появляется, только когда кто-то запросит его через рефлексию, — и при каждом запросе новый.</p><p>Отсюда главное: атрибут сам ничего не делает. <code>[Route]</code>, который никто не ищет, — просто байты в файле.</p>',
      flow: ['[Route("/orders")]', 'blob в CustomAttribute', 'GetCustomAttribute', 'new RouteAttribute(…)'],
      deep: '<p>Вот blob для <code>[Route("/orders", Order = 2)]</code>, как его пишет компилятор:</p><p><code>01 00</code> — пролог; <code>07 2F 6F 72 64 65 72 73</code> — строка с длиной в начале, UTF-8; <code>01 00</code> — один именованный аргумент; <code>54</code> — это свойство (<code>53</code> было бы полем), <code>08</code> — тип int32, <code>05 4F 72 64 65 72</code> — имя «Order»; <code>02 00 00 00</code> — значение.</p><p>Ссылок на константы, из которых значение посчитано, в blob нет — только итоговые значения. Как устроены токены и таблицы метаданных, разобрано в курсе «.NET изнутри».</p>'
    },
    {
      t: 'choice',
      q: 'Сколько раз напечатается ctor?',
      code: 'var a = new Order();\nvar b = new Order();\nvar x = typeof(Order).GetCustomAttribute<AuditAttribute>();\nvar y = typeof(Order).GetCustomAttribute<AuditAttribute>();\n\nclass AuditAttribute : Attribute\n{\n    public AuditAttribute() => Console.WriteLine("ctor");\n}\n\n[Audit] class Order { }',
      options: ['2', '0', '1', '4'],
      answer: 0,
      explain: 'new Order() атрибут не трогает: он лежит в метаданных и для создания объекта не нужен. Каждый GetCustomAttribute заново разбирает blob и вызывает конструктор — два вызова, два объекта, x и y — разные ссылки.',
      wrong: { 2: 'Рантайм не кэширует экземпляры атрибутов: каждый запрос создаёт новый объект.', 3: 'Создание Order не создаёт атрибут. Атрибут принадлежит типу, а не экземпляру.' }
    },
    {
      t: 'learn',
      title: 'Аргументы — только то, что влезет в blob',
      body: '<p>Аргументы записываются в байты при компиляции, значит, значение должно быть известно компилятору. Аргументом может быть:</p><ul><li>константное выражение: литерал, <code>const</code>, <code>nameof</code>, <code>"a" + "b"</code>;</li><li><code>typeof(…)</code>;</li><li>создание одномерного массива.</li></ul><p>И тип параметра — из короткого списка: <code>bool</code>, <code>char</code>, целые и <code>float</code>/<code>double</code>, <code>string</code>, <code>Type</code>, перечисления, <code>object</code> и одномерные массивы из них. <code>decimal</code>, <code>DateTime</code>, <code>Guid</code> нельзя: для формата метаданных это не примитивы.</p>',
      code: '[Timeout(Cfg.Ms * 2)]          // ok: константное выражение\n[Tags(new[] { "db", "slow" })] // ok: одномерный массив\n[Handler(typeof(List<int>))]   // ok: typeof\n[Price(9.99m)]                 // CS0181: decimal — не тип параметра атрибута\n[Retry(Cfg.Retries)]           // CS0182: static readonly — не константа',
      deep: '<p>Обход для <code>decimal</code> и дат — строка, которую разбирают при чтении. Так сделан <code>[DefaultValue(typeof(decimal), "9.99")]</code>.</p><p><code>typeof</code> попадает в blob строкой — полным именем типа, для типа из чужой сборки ещё и с её именем. При чтении рантайм загружает тип по этому имени, поэтому переименование типа в другой сборке ломает чтение уже собранного атрибута.</p><p>У параметра типа <code>object</code> перед значением в blob пишется тег его типа: <code>[Value(5)]</code> и <code>[Value("5")]</code> различаются при чтении.</p>'
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется?',
      code: 'static class Cfg\n{\n    public const int Ms = 500;\n    public static readonly int Retries = 3;\n}\n\n[Timeout(Cfg.Ms * 2)]\n[Name(nameof(Cfg))]\n[Retry(Cfg.Retries)]\n[Handler(typeof(List<int>))]\nclass Job { }',
      answer: 8,
      explain: 'static readonly — поле, которое заполняется при запуске, а не константа. Компилятору нечего записать в blob: ошибка CS0182. Cfg.Ms * 2 и nameof считаются при компиляции, typeof разрешён отдельным правилом.'
    },
    {
      t: 'learn',
      title: 'AttributeUsage: где и сколько раз',
      body: '<p><code>[AttributeUsage]</code> — атрибут на классе атрибута. Он задаёт три вещи:</p><ul><li><b>куда</b> можно вешать — флаги <code>AttributeTargets</code>: Class, Method, Property, Parameter, ReturnValue… Не туда — ошибка CS0592;</li><li><b>AllowMultiple</b> — можно ли повторить на одном элементе. По умолчанию нельзя: CS0579;</li><li><b>Inherited</b> — видят ли атрибут наследники, когда ищут с <code>inherit: true</code>. По умолчанию да.</li></ul><p>Без <code>[AttributeUsage]</code> действуют значения по умолчанию: <code>All</code>, <code>false</code>, <code>true</code>. Проверки мест и повторов делает компилятор — в рантайме их уже нет.</p>',
      code: '[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method,\n    AllowMultiple = true, Inherited = false)]\npublic class RouteAttribute : Attribute { /* … */ }',
      deep: '<p>Ловушка с <code>Inherited</code>: <code>PropertyInfo.GetCustomAttributes(true)</code> и то же у <code>EventInfo</code> параметр <code>inherit</code> <b>игнорируют</b> — атрибут с переопределённого в базе свойства не найдётся. Искать по цепочке нужно статическим <code>Attribute.GetCustomAttributes(member, true)</code>.</p><p>Атрибуты интерфейса не наследуются вообще: класс, реализующий интерфейс, их не получает, какой бы ни был <code>Inherited</code>. Цепочка идёт только по базовым классам.</p><p>Расширение <code>GetCustomAttribute&lt;T&gt;(member)</code> ищет с <code>inherit: true</code> по умолчанию, а <code>Type.GetCustomAttributes(bool)</code> требует указать явно.</p>'
    },
    {
      t: 'blanks',
      q: 'Разреши повесить маршрут на метод дважды',
      code: '[___(AttributeTargets.Method, AllowMultiple = ___)]\nclass RouteAttribute : ___\n{\n    public RouteAttribute(string path) => Path = path;\n    public string Path { get; }\n}\n\nclass OrdersApi\n{\n    [Route("/orders")]\n    [Route("/api/orders")]\n    public void List() { }\n}',
      tiles: ['AttributeUsage', 'true', 'Attribute', 'false', 'Serializable', 'object'],
      answer: ['AttributeUsage', 'true', 'Attribute'],
      explain: 'Класс атрибута наследуется от Attribute, а AttributeUsage с AllowMultiple = true разрешает повтор. Без этого второй [Route] даст CS0579.'
    },
    {
      t: 'learn',
      title: 'Чтение: GetCustomAttribute и его цена',
      body: '<p><code>GetCustomAttribute&lt;T&gt;()</code> находит строки CustomAttribute для элемента, отбирает нужный тип, разбирает blob, вызывает конструктор и присваивает именованные аргументы. Каждый вызов — заново: разбор и новая аллокация. Если подходящих атрибутов два — <code>AmbiguousMatchException</code>, тогда нужен <code>GetCustomAttributes</code>.</p><p>Дешевле:</p><ul><li><code>IsDefined</code> — только проверка, объект не создаётся;</li><li><code>GetCustomAttributesData()</code> — аргументы как данные, без вызова конструктора.</li></ul><p>Фреймворки читают атрибуты один раз при старте и кладут результат в кэш, например в <code>static readonly</code> или в словарь по <code>Type</code>.</p>',
      code: 'var t = typeof(OrdersController);\n\n// новый объект RouteAttribute на каждый вызов\nRouteAttribute? r = t.GetCustomAttribute<RouteAttribute>();\n\n// только проверка: объект не создаётся\nbool has = t.IsDefined(typeof(RouteAttribute));\n\n// аргументы без вызова конструктора\nforeach (var d in t.GetCustomAttributesData())\n    Console.WriteLine(d.ConstructorArguments[0].Value);   // /orders'
    },
    {
      t: 'multi',
      q: 'Что верно про чтение атрибутов? Отметь все.',
      options: ['Два вызова GetCustomAttribute возвращают два разных объекта', 'IsDefined проверяет наличие, не вызывая конструктор атрибута', 'Объект атрибута создаётся при загрузке сборки и хранится в кэше CLR', 'CustomAttributeData даёт аргументы без вызова конструктора', 'GetCustomAttribute видит только атрибуты из Debug-сборки'],
      answer: [0, 1, 3],
      explain: 'Экземпляр собирается из blob на каждый запрос, поэтому объекты разные, а читать в цикле дорого. IsDefined и CustomAttributeData работают с метаданными напрямую. Конфигурация сборки на запись атрибутов не влияет — кроме атрибутов с [Conditional].'
    },
    {
      t: 'learn',
      title: 'Псевдо-атрибуты: флаги, а не записи',
      body: '<p>Некоторые атрибуты компилятор не пишет в таблицу CustomAttribute. Он превращает их в биты и отдельные таблицы метаданных, которые загрузчик типов читает сам:</p><ul><li><code>[Serializable]</code> → бит в флагах типа;</li><li><code>[StructLayout]</code> → флаги раскладки типа и таблица ClassLayout (Pack, Size);</li><li><code>[FieldOffset]</code> → таблица FieldLayout;</li><li><code>[DllImport]</code> → флаг метода и таблица ImplMap;</li><li><code>[NonSerialized]</code>, <code>[MethodImpl]</code> → флаги поля и метода.</li></ul><p>Рефлексия возвращает их непоследовательно. <code>Serializable</code> и <code>DllImport</code> она восстанавливает по флагам, а <code>StructLayout</code> через <code>GetCustomAttribute</code> не найти — только через свойство <code>Type.StructLayoutAttribute</code>.</p>',
      code: '[Serializable]\n[StructLayout(LayoutKind.Sequential, Pack = 1)]\nstruct Header { public byte Kind; public int Size; }\n\nvar t = typeof(Header);\nvar pack = t.StructLayoutAttribute!.Pack;              // 1 — из таблицы ClassLayout\nvar sl = t.GetCustomAttribute<StructLayoutAttribute>(); // null\nvar sr = t.GetCustomAttribute<SerializableAttribute>(); // не null: восстановлен по флагу',
      deep: '<p>Поведение сверено на .NET 9. Рантайм собирает такие атрибуты в классе <code>PseudoCustomAttribute</code>, и какие из них возвращает <code>GetCustomAttribute</code> — деталь реализации. Не полагайся на <code>GetCustomAttribute</code> для псевдо-атрибутов, читай флаги и специальные свойства.</p><p>Флаг Serializable читается и через <code>Type.IsSerializable</code>, но с .NET 8 это свойство помечено устаревшим (SYSLIB0050) вместе со всей сериализацией через форматтеры.</p>'
    },
    {
      t: 'match',
      q: 'Соедини атрибут и куда он попадает в метаданных',
      pairs: [
        ['[Serializable]', 'Бит в флагах типа'],
        ['[StructLayout]', 'Флаги раскладки и таблица ClassLayout'],
        ['[DllImport]', 'Таблица ImplMap'],
        ['[FieldOffset]', 'Таблица FieldLayout'],
        ['[Obsolete]', 'Строка в таблице CustomAttribute']
      ]
    },
    {
      t: 'choice',
      q: 'В версии 2 библиотеки Shop.dll MaxItems стал 100. Shop.dll заменили, приложение не пересобирали. Какой максимум прочитает валидатор из атрибута?',
      code: '// Shop.dll, версия 1\npublic static class Limits { public const int MaxItems = 50; }\n\n// приложение, собранное против версии 1\npublic class Cart\n{\n    [Range(1, Limits.MaxItems)]\n    public int Count { get; set; }\n}',
      options: ['50', '100', 'Исключение при чтении атрибута', '0'],
      answer: 0,
      explain: 'Значение константы вычислено при компиляции приложения и лежит в blob атрибута внутри приложения. Ссылки на Limits.MaxItems в метаданных нет вообще, поэтому замена Shop.dll ничего не меняет. Новое значение появится только после пересборки.',
      wrong: { 1: 'Так было бы со static readonly, но его в атрибут не передать: CS0182.' }
    }
  ]
};
