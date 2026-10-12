/** C# глубже, раздел «Атрибуты и рефлексия», урок 2: цена рефлексии и способы вызвать метод быстрее. */
export default {
  id: 'cs.u13.l2',
  title: 'Цена рефлексии',
  sub: 'Invoke, делегат, Expression, UnsafeAccessor и Activator',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Рефлексия: тип как данные',
      body: '<p><b>Рефлексия</b> (reflection) — API, который отдаёт метаданные как объекты: <code>Type</code>, <code>MethodInfo</code>, <code>PropertyInfo</code>, <code>FieldInfo</code>. Через них можно найти член по имени, прочитать и записать значение, вызвать метод, создать объект.</p><p>Цена складывается из двух частей. <b>Поиск</b>: <code>GetMethod("WithTax")</code> сравнивает строки и проверяет <code>BindingFlags</code>. <b>Вызов</b>: компилятор не знает типов, поэтому аргументы едут в <code>object[]</code>, а рантайм проверяет их при каждом вызове.</p>',
      code: 'Type t = typeof(Order);                // известен компилятору: дёшево\nType? u = Type.GetType("Shop.Order");  // по строке: поиск при запуске\n\nMethodInfo m = t.GetMethod("WithTax")!;\nPropertyInfo p = t.GetProperty("Total")!;\n\nobject o = Activator.CreateInstance(t)!;\np.SetValue(o, 100m);                    // 100m упакован в object\nvar r = (decimal)m.Invoke(o, new object[] { 0.2m })!;',
      deep: '<p>Объекты <code>MethodInfo</code> рантайм кэширует внутри типа, поэтому повторный <code>GetMethod</code> дешевле первого, но поиск по строке и проверка флагов остаются. Как устроены эти кэши и токены метаданных, разобрано в курсе «.NET изнутри».</p><p><code>typeof(Order)</code> компилируется в загрузку токена типа и вызов <code>Type.GetTypeFromHandle</code>; JIT обычно сворачивает это в константу.</p>'
    },
    {
      t: 'choice',
      q: 'Тип Shop.Order лежит в Shop.dll, она уже загружена. Код в App.dll вызывает Type.GetType("Shop.Order"). Что вернётся?',
      options: ['null', 'Тип Shop.Order', 'TypeLoadException', 'Зависит от порядка загрузки сборок'],
      answer: 0,
      explain: 'По имени без сборки Type.GetType ищет только в вызывающей сборке и в System.Private.CoreLib. Для типа из другой сборки нужно имя с указанием сборки: "Shop.Order, Shop". Исключение будет, только если передать throwOnError: true.',
      wrong: { 3: 'Загруженность Shop.dll не важна: без имени сборки её просто не просматривают.' }
    },
    {
      t: 'learn',
      title: 'Пять способов вызвать метод',
      body: '<p>Порядки для вызова маленького метода на типичном x64 (точные числа зависят от машины и версии — меряй BenchmarkDotNet):</p><ul><li><b>прямой вызов</b> — около наносекунды и меньше: JIT может встроить метод;</li><li><b>UnsafeAccessor</b> (.NET 8) — как прямой вызов, даже к private-члену;</li><li><b>делегат</b> из <code>CreateDelegate</code> или скомпилированного <code>Expression</code> — единицы наносекунд: косвенный вызов без встраивания;</li><li><b>MethodInfo.Invoke</b> — десятки наносекунд плюс аллокации на каждый вызов;</li><li><b>GetMethod + Invoke</b> на каждой итерации — ещё дороже.</li></ul><p>Разница — на порядки, а не на проценты. В горячем цикле это заметно, при старте приложения для пары вызовов — нет.</p>'
    },
    {
      t: 'order',
      q: 'Расставь от самого быстрого к самому медленному. Метод маленький, всё подготовлено заранее, вызов — в горячем цикле.',
      items: ['Прямой вызов o.WithTax(r)', 'Вызов делегата из CreateDelegate', 'MethodInfo.Invoke с готовым MethodInfo', 'GetMethod по имени и Invoke на каждой итерации'],
      explain: 'Прямой вызов JIT может встроить. Делегат — косвенный вызов. Invoke упаковывает аргументы, выделяет массив и проверяет типы. Поиск по имени добавляет к этому ещё и сравнение строк.'
    },
    {
      t: 'learn',
      title: 'Почему Invoke дорогой',
      body: '<p>На каждый вызов <code>MethodInfo.Invoke</code>:</p><ul><li>выделяется <code>object[]</code> под аргументы;</li><li>значимые аргументы и результат упаковываются;</li><li>рантайм проверяет число и типы аргументов и доступность метода;</li><li>исключение из метода заворачивается в <code>TargetInvocationException</code>, настоящее — в <code>InnerException</code>.</li></ul><p>Ничего из этого не нужно, если сигнатура известна заранее: тогда рефлексию используют один раз — чтобы получить делегат.</p>',
      deep: '<p>С .NET 7 после первых вызовов рантайм генерирует для метода заглушку на IL, и Invoke стал заметно быстрее, чем в .NET Framework. В .NET 8 появились <code>MethodInvoker</code> и <code>ConstructorInvoker</code>: аргументы передаются без <code>object[]</code>, но значимые всё равно упаковываются.</p><p>Флаг <code>BindingFlags.DoNotWrapExceptions</code> отключает обёртку: исключение из метода летит как есть.</p>'
    },
    {
      t: 'choice',
      q: 'Метод Pay бросает InvalidOperationException. Что напечатает код?',
      code: 'try\n{\n    typeof(Order).GetMethod("Pay")!.Invoke(order, null);\n}\ncatch (InvalidOperationException)\n{\n    Console.WriteLine("A");\n}\ncatch (Exception e)\n{\n    Console.WriteLine("B " + e.GetType().Name);\n}',
      options: ['B TargetInvocationException', 'A', 'B InvalidOperationException', 'B AmbiguousMatchException'],
      answer: 0,
      explain: 'Invoke заворачивает исключение вызванного метода в TargetInvocationException, поэтому первый catch не срабатывает. Исходное исключение лежит в e.InnerException. Без обёртки — флаг BindingFlags.DoNotWrapExceptions.',
      wrong: { 1: 'Так было бы при прямом вызове. Invoke ставит между тобой и методом свою обёртку.' }
    },
    {
      t: 'learn',
      title: 'CreateDelegate: рефлексия один раз',
      body: '<p>Если сигнатура известна при компиляции, превращаешь <code>MethodInfo</code> в делегат. Цена — один раз, при создании; дальше это обычный вызов делегата: без массива, без упаковки, без проверок.</p><p><b>Открытый</b> делегат принимает экземпляр первым параметром: один делегат на все объекты. <b>Закрытый</b> привязан к одному объекту: <code>m.CreateDelegate&lt;Func&lt;decimal, decimal&gt;&gt;(order)</code>.</p><p>Свойство — это пара методов: делегат строят от <code>p.GetMethod</code> или <code>p.SetMethod</code>.</p>',
      code: 'MethodInfo m = typeof(Order).GetMethod("WithTax")!;\n\n// открытый делегат: экземпляр — первый параметр\nvar withTax = m.CreateDelegate<Func<Order, decimal, decimal>>();\n\ndecimal sum = 0;\nforeach (var o in orders)\n    sum += withTax(o, 0.2m);   // обычный вызов делегата',
      deep: '<p>Обобщённый <code>CreateDelegate&lt;T&gt;()</code> появился в .NET 5; раньше писали <code>(Func&lt;…&gt;)Delegate.CreateDelegate(typeof(Func&lt;…&gt;), m)</code>.</p><p>Тип делегата должен точно совпадать с сигнатурой, с поправкой на вариантность ссылочных типов. Для метода структуры открытый делегат принимает экземпляр по ссылке — нужен свой тип делегата с <code>ref</code>-параметром.</p>'
    },
    {
      t: 'blanks',
      q: 'Сделай быстрый геттер свойства Total',
      code: 'PropertyInfo p = typeof(Order).GetProperty("Total")!;\nvar get = p.___!.CreateDelegate<___<Order, decimal>>();\ndecimal t = get(order);',
      tiles: ['GetMethod', 'Func', 'SetMethod', 'Action', 'GetValue', 'Predicate'],
      answer: ['GetMethod', 'Func'],
      explain: 'Геттер — метод get_Total, его MethodInfo лежит в p.GetMethod. Он принимает Order (открытый делегат) и возвращает decimal — это Func<Order, decimal>. GetValue — тот же медленный путь через object.'
    },
    {
      t: 'learn',
      title: 'Expression.Compile: когда типы известны только при запуске',
      body: '<p>Сериализатору или маппингу нужен геттер для <b>любого</b> свойства, а тип становится известен только при запуске. Тогда <code>Func&lt;object, object?&gt;</code> собирают из дерева выражений (expression tree) и компилируют.</p><p><code>Compile()</code> генерирует IL через <code>DynamicMethod</code>, и его JIT превращает в машинный код. Это дорого: от сотен микросекунд до миллисекунд. Зато вызов потом — как у делегата. Поэтому результат обязательно кэшируют, например по <code>PropertyInfo</code>.</p>',
      code: 'static Func<object, object?> Getter(PropertyInfo p)\n{\n    var obj = Expression.Parameter(typeof(object));\n    var body = Expression.Convert(\n        Expression.Property(Expression.Convert(obj, p.DeclaringType!), p),\n        typeof(object));\n    return Expression.Lambda<Func<object, object?>>(body, obj).Compile();\n}',
      deep: '<p>Где нет генерации кода при запуске — Native AOT, iOS, — <code>Compile()</code> не падает, а возвращает делегат над <b>интерпретатором</b> дерева. Работает, но во много раз медленнее, и выигрыш против Invoke пропадает.</p><p>Значимое свойство в таком геттере упаковывается при возврате <code>object</code> — это цена универсальной сигнатуры, а не рефлексии.</p>'
    },
    {
      t: 'learn',
      title: 'UnsafeAccessor: доступ к private без рефлексии',
      body: '<p>В .NET 8 появился <code>[UnsafeAccessor]</code>. Объявляешь <code>extern static</code>-метод, говоришь, к какому члену он даёт доступ, — и рантайм сам генерирует тело. Виды: <code>Constructor</code>, <code>Method</code>, <code>StaticMethod</code>, <code>Field</code>, <code>StaticField</code>.</p><p>Цена — как у прямого вызова: JIT может его встроить. Член указан статически, поэтому это работает с trimming и Native AOT.</p><p>Минусы: имя — строка. Опечатка всплывёт при первом вызове как <code>MissingFieldException</code> или <code>MissingMethodException</code>. И ты привязан к приватным деталям чужого типа — в следующей версии их могут переименовать.</p>',
      code: 'static class ListAccess\n{\n    // доступ к приватному полю List<int>._size\n    [UnsafeAccessor(UnsafeAccessorKind.Field, Name = "_size")]\n    public static extern ref int Size(List<int> list);\n}\n\nvar list = new List<int> { 1, 2, 3 };\nListAccess.Size(list) = 1;   // list.Count теперь 1',
      deep: '<p>Для поля метод возвращает <code>ref</code> — можно и читать, и писать. Первый параметр — экземпляр (для статических членов — тоже, его значение игнорируется, а тип показывает, где искать).</p><p>В .NET 9 добавили поддержку дженериков: объявляешь метод в обобщённом классе с теми же параметрами типа. В .NET 10 — <code>[UnsafeAccessorType]</code> для случая, когда сам тип недоступен при компиляции.</p>'
    },
    {
      t: 'match',
      q: 'Соедини способ и когда за него платишь',
      pairs: [
        ['MethodInfo.Invoke', 'Аллокации и проверки на каждом вызове'],
        ['CreateDelegate', 'Один раз при создании, сигнатура известна'],
        ['Expression.Compile', 'Дорогая компиляция, потом вызов как у делегата'],
        ['UnsafeAccessor', 'Почти ничего: доступ как прямой вызов'],
        ['GetMethod("Name")', 'Поиск члена по строке']
      ]
    },
    {
      t: 'learn',
      title: 'Activator и new T()',
      body: '<p><code>Activator.CreateInstance(Type)</code> создаёт объект конструктором без параметров. <code>new T()</code> в обобщённом методе с ограничением <code>new()</code> компилятор превращает в вызов <code>Activator.CreateInstance&lt;T&gt;()</code> — отдельной инструкции IL для этого нет.</p><p>В современном .NET рантайм кэширует найденный конструктор, и цена близка к обычному <code>new</code> плюс несколько наносекунд. В .NET Framework разница была заметно больше — оттуда советы «кэшируй фабрику через Expression».</p><p>Дорогой вариант — <code>CreateInstance(type, args)</code> с аргументами: подбор конструктора по типам аргументов, массив и упаковка на каждом вызове.</p>',
      code: 'object a = Activator.CreateInstance(typeof(Order))!;   // по Type\nOrder b = Activator.CreateInstance<Order>();           // по T\n\n// в IL: call Activator.CreateInstance<T>()\nstatic T Make<T>() where T : new() => new T();'
    },
    {
      t: 'choice',
      q: 'Во что компилятор превращает new T() в методе Make<T>() where T : new()?',
      options: ['В вызов Activator.CreateInstance<T>()', 'В инструкцию newobj для T', 'В поиск конструктора через GetConstructor', 'В вызов статического метода T.New()'],
      answer: 0,
      explain: 'Для newobj нужен конкретный конструктор, а у T его нет до запуска: для ссылочных типов JIT вообще делит один код на всех. Поэтому компилятор вызывает Activator.CreateInstance<T>(), а тот находит и кэширует конструктор нужного типа.'
    }
  ]
};
