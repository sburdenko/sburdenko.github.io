/** .NET изнутри, раздел «Дженерики и рефлексия изнутри», урок 2: токены метаданных, дескрипторы, MethodInfo и цена Invoke. */
export default {
  id: 'dotnet.w7.l2',
  title: 'Рефлексия изнутри',
  sub: 'Токены метаданных, RuntimeTypeHandle, кэши MethodInfo и во что обходится Invoke',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'В IL нет имён — есть токены',
      body: '<p>Метаданные сборки — набор таблиц: типы, методы, поля, ссылки на чужие члены. Инструкция IL никогда не содержит имя метода. Она содержит <b>токен</b> (metadata token) — 4 байта:</p><ul><li><b>старший байт</b> — номер таблицы: <code>0x02</code> TypeDef, <code>0x06</code> MethodDef, <code>0x0A</code> MemberRef, <code>0x01</code> TypeRef, <code>0x70</code> строковый литерал;</li><li><b>младшие три байта</b> — номер строки в таблице, с единицы.</li></ul><p>Имена, которые показывают ildasm и ILSpy, они сами достают по токену из метаданных.</p>',
      code: '// C#: Console.WriteLine(Add(2, 3));\nIL_0000: ldc.i4.2\nIL_0001: ldc.i4.3\nIL_0002: call int32 Program::Add(int32, int32)        // токен 0x06000002: MethodDef, строка 2\nIL_0007: call void [System.Console]System.Console::WriteLine(int32)   // 0x0A00000C: MemberRef\nIL_000c: ret',
      deep: '<p>Номера строк в примере условные — они зависят от сборки. <b>MethodDef</b> — метод, определённый в этой же сборке. <b>MemberRef</b> — ссылка по имени: родитель (TypeRef чужого типа или TypeSpec), имя и блоб сигнатуры. Вызов метода у инстанциации дженерика, например <code>List&lt;int&gt;.Add</code>, — это MemberRef с родителем-TypeSpec (<code>0x1B</code>), а вызов generic-метода <code>Foo&lt;int&gt;()</code> — токен <b>MethodSpec</b> (<code>0x2B</code>).</p><p>Из кода токен виден как <code>MemberInfo.MetadataToken</code>, а обратно его превращает в объект <code>Module.ResolveMethod</code>. Таблицы и их коды описаны в стандарте ECMA-335.</p>'
    },
    {
      t: 'match',
      q: 'Соедини старший байт токена и таблицу',
      pairs: [
        ['0x02', 'TypeDef — тип из этой сборки'],
        ['0x06', 'MethodDef — метод из этой сборки'],
        ['0x0A', 'MemberRef — ссылка на член по имени и сигнатуре'],
        ['0x01', 'TypeRef — ссылка на тип из другой сборки'],
        ['0x70', 'Строковый литерал из кучи #US']
      ]
    },
    {
      t: 'learn',
      title: 'Как JIT превращает токен в метод',
      body: '<p>Компилируя метод, JIT встречает <code>call</code> с токеном и спрашивает рантайм: что это?</p><ul><li><b>MethodDef</b> — строка своей таблицы, рантайм сразу находит дескриптор метода (MethodDesc).</li><li><b>MemberRef</b> — дольше: по AssemblyRef найти и загрузить сборку, найти в ней тип по имени, а в типе — метод по имени <b>и сигнатуре</b>.</li></ul><p>Результат запоминается в таблицах модуля, так что разрешение идёт один раз. Но из механизма следует сценарий «версия 2»: сигнатура в MemberRef включает типы параметров и <b>тип возврата</b>. Поменял их в библиотеке — у потребителя, собранного со старой версией, совпадения не будет.</p>',
      deep: '<p>Ошибка всплывает не при загрузке сборки, а когда JIT компилирует метод, в котором стоит вызов: <code>MissingMethodException</code> (или <code>MissingFieldException</code> для полей). Поэтому старый код может долго работать, пока не дойдёт до ветки с устаревшим вызовом.</p><p>Отсюда же правило для авторов библиотек: в публичном API не меняют сигнатуры — добавляют перегрузку рядом. Даже необязательный параметр меняет сигнатуру: значение по умолчанию подставляет вызывающий компилятор, а в метаданных у метода просто на один параметр больше.</p>'
    },
    {
      t: 'choice',
      q: 'В версии 2 библиотеки public int Count() стал public long Count(). Приложение не пересобрали, подложили новую dll. Что будет?',
      options: ['MissingMethodException, когда JIT компилирует вызывающий метод', 'Работает: long урежется до int', 'Ошибка при загрузке сборки библиотеки', 'Вызовется новый метод и вернёт long'],
      answer: 0,
      explain: 'В MemberRef приложения записана сигнатура «() → int32». В новой сборке метода с такой сигнатурой нет: тип возврата — часть сигнатуры. Рантайм не находит метод при разрешении токена.',
      wrong: { 2: 'Сборка загрузится нормально. Ошибка будет позже — при разрешении конкретного MemberRef.' }
    },
    {
      t: 'learn',
      title: 'Дескрипторы: Handle — это указатель рантайма',
      body: '<p>Внутри рантайма тип — это MethodTable, метод — MethodDesc, поле — FieldDesc. Управляемому коду они доступны как обёртки-дескрипторы:</p><ul><li><code>RuntimeTypeHandle</code> — указатель на MethodTable;</li><li><code>RuntimeMethodHandle</code> — на MethodDesc;</li><li><code>RuntimeFieldHandle</code> — на FieldDesc.</li></ul><p><code>typeof(X)</code> компилируется в <code>ldtoken</code> (токен → дескриптор) и вызов <code>Type.GetTypeFromHandle</code>. JIT знает эту пару и заменяет её константой. Объект <code>Type</code> (на деле <code>RuntimeType</code>) на каждый тип один: рантайм создаёт его при первой надобности и дальше отдаёт тот же.</p>',
      code: 'Type t = typeof(string);\n// IL:\n// ldtoken    [System.Runtime]System.String\n// call       class System.Type System.Type::GetTypeFromHandle(valuetype System.RuntimeTypeHandle)\n\nIntPtr mt = typeof(string).TypeHandle.Value;   // адрес MethodTable',
      deep: '<p>Проверка <code>obj.GetType() == typeof(Circle)</code> в оптимизированном коде вообще не создаёт объектов <code>Type</code>: JIT сравнивает указатель на MethodTable из заголовка объекта с константой. Когда нужен точный тип без наследников, это дешевле <code>is Circle</code> у незапечатанного класса: не нужен обход иерархии.</p><p>Начиная с .NET 8 объекты <code>RuntimeType</code> обычно размещаются в неперемещаемой куче (NonGC heap), и JIT может вшить их адрес прямо в машинный код.</p>'
    },
    {
      t: 'multi',
      q: 'Что верно про typeof в оптимизированном коде? Отметь все.',
      options: ['obj.GetType() == typeof(X) сводится к сравнению указателей на MethodTable', 'Каждый typeof(X) ищет тип по имени в метаданных', 'Объект RuntimeType для типа один — typeof возвращает тот же объект', 'typeof(X) создаёт новый объект Type при каждом вызове'],
      answer: [0, 2],
      explain: 'Токен в ldtoken разрешается один раз, при компиляции метода, — поиска по имени при каждом вызове нет. И объект Type у типа единственный, поэтому typeof(X) == typeof(X) можно сравнивать по ссылке.'
    },
    {
      t: 'learn',
      title: 'MethodInfo и кэши рефлексии',
      body: '<p><code>GetMethod("Parse")</code> идёт в <b>кэш типа</b> (RuntimeTypeCache), который <code>RuntimeType</code> заводит при первом запросе рефлексии. На первом поиске кэш обходит методы MethodTable, создаёт объекты <code>RuntimeMethodInfo</code> (внутри каждого — RuntimeMethodHandle) и сохраняет их.</p><p>Повторный поиск дешевле, но не бесплатен: сравнение имени, фильтр по <code>BindingFlags</code>, выбор перегрузки по типам параметров. А <code>GetMethods()</code> каждый раз возвращает новую копию массива.</p><p>Правило: ищи <code>MethodInfo</code> один раз и храни в <code>static readonly</code> поле.</p>',
      code: 'static readonly MethodInfo s_parse =\n    typeof(int).GetMethod("Parse", [typeof(string)])!;\n\n// плохо: поиск по имени на каждом вызове\nint Slow(string s) =>\n    (int)typeof(int).GetMethod("Parse", [typeof(string)])!.Invoke(null, [s])!;',
      deep: '<p>Кэш типа <code>RuntimeType</code> держит через слабую ссылку (GC handle), поэтому при нехватке памяти сборщик может его выбросить, и следующий запрос построит всё заново. Отсюда совет хранить нужные <code>MethodInfo</code> самому, а не надеяться, что повторный <code>GetMethod</code> вернёт тот же объект.</p><p>Тогда и сейчас: в .NET Framework рядом стояли проверки Code Access Security — их в современном .NET нет, но проверки видимости и аргументов при вызове остались.</p>'
    },
    {
      t: 'order',
      q: 'Расставь, что происходит при mi.Invoke(obj, [42]) у метода void Set(int v)',
      items: ['42 упаковывается в object и кладётся в массив object[]', 'Проверка: obj подходящего типа и число аргументов совпадает', 'Проверка типа каждого аргумента и распаковка 42 в int', 'Вызов метода через заглушку', 'Результат возвращается как object (здесь null)'],
      explain: 'На один вызов — массив, упаковка аргумента, проверки и косвенный вызов. Если метод бросит исключение, Invoke обернёт его в TargetInvocationException.'
    },
    {
      t: 'learn',
      title: 'Цена Invoke: тогда и сейчас',
      body: '<p>Способы вызвать метод через рефлексию разобраны в разделе «Атрибуты и рефлексия» курса «C# глубже»; здесь — что внутри. До .NET 7 каждый <code>Invoke</code> шёл по универсальному пути внутри рантайма: разобрать сигнатуру, разложить аргументы из массива, вызвать. В <b>.NET 7</b> Invoke стал в разы быстрее: после первого вызова рантайм генерирует для метода IL-заглушку, которая раскладывает аргументы как обычный код.</p><p><b>.NET 8</b> добавил <code>MethodInvoker</code> и <code>ConstructorInvoker</code>: до четырёх аргументов передаются без массива, нет совместимой с Invoke обработки значений по умолчанию. Упаковка значимых аргументов остаётся — параметры типа <code>object?</code>.</p><p>Быстрее всего — <code>CreateDelegate</code>: один раз сделать делегат, дальше вызов стоит как вызов делегата.</p>',
      code: 'MethodInfo mi = typeof(Calc).GetMethod(nameof(Calc.Add))!;\n\nobject? r1 = mi.Invoke(calc, [2, 3]);           // массив + 2 упаковки + упаковка результата\n\nMethodInvoker inv = MethodInvoker.Create(mi);   // .NET 8\nobject? r2 = inv.Invoke(calc, 2, 3);            // без массива, но с упаковкой\n\nvar add = mi.CreateDelegate<Func<Calc, int, int, int>>();\nint r3 = add(calc, 2, 3);                       // как обычный вызов делегата',
      deep: '<p>Первый вызов в .NET 7+ идёт по старому пути без генерации кода: для разового вызова создавать заглушку дороже, чем вызвать медленно. Где генерация кода невозможна (Native AOT, <code>RuntimeFeature.IsDynamicCodeSupported == false</code>), используется путь без эмиссии. Исключения из вызванного метода <code>Invoke</code> оборачивает в <code>TargetInvocationException</code>; флаг <code>BindingFlags.DoNotWrapExceptions</code> это отключает.</p><p><code>CreateDelegate</code> для метода экземпляра без цели даёт «открытый» делегат: первым параметром идёт объект. Сколько точно стоит каждый вариант, зависит от версии и сигнатуры — меряй BenchmarkDotNet.</p>'
    },
    {
      t: 'choice',
      q: 'Метод известен заранее, но его надо вызвать через рефлексию миллион раз. Что выбрать?',
      options: ['Один раз CreateDelegate, дальше вызывать делегат', 'MethodInfo.Invoke с закэшированным MethodInfo', 'MethodInvoker из .NET 8', 'dynamic: кэш call site всё ускорит'],
      answer: 0,
      explain: 'Делегат после создания не проверяет аргументы и не упаковывает их: это обычный косвенный вызов. Invoke и MethodInvoker на каждом вызове платят за проверки и упаковку значимых аргументов.',
      wrong: { 2: 'MethodInvoker быстрее Invoke — нет массива, — но значимые аргументы всё равно упаковываются, а проверки остаются.' }
    },
    {
      t: 'learn',
      title: 'UnsafeAccessor изнутри: тело пишет рантайм',
      body: '<p>Как пользоваться <code>[UnsafeAccessor]</code> (.NET 8), разобрано в разделе «Атрибуты и рефлексия» курса «C# глубже». Изнутри это родственник MemberRef: ты объявляешь <code>static extern</code> метод, у которого нет тела. Когда JIT доходит до него, рантайм ищет целевой член по имени из атрибута и по сигнатуре аксессора — один раз, как при разрешении токена, — и сам создаёт тело: IL с прямым <code>ldflda</code> или <code>call</code>.</p><p>Дальше это обычный код: его можно встроить, в нём нет <code>MethodInfo</code>, массива и упаковки. А раз тело известно ещё до запуска, Native AOT компилирует его заранее.</p>',
      code: 'class Account { private decimal _balance; }\n\n[UnsafeAccessor(UnsafeAccessorKind.Field, Name = "_balance")]\nstatic extern ref decimal Balance(Account a);\n\nvar acc = new Account();\nBalance(acc) = 100m;   // прямая запись в приватное поле',
      deep: '<p>Член ищется по имени и сигнатуре при компиляции метода-аксессора; нет такого — <code>MissingFieldException</code> или <code>MissingMethodException</code>. Виды: <code>Constructor</code>, <code>Method</code>, <code>StaticMethod</code>, <code>Field</code>, <code>StaticField</code>. Поддержка дженериков в аксессорах появилась в .NET 9. Цена — хрупкость: приватный член могут переименовать в любой версии.</p>'
    },
    {
      t: 'blanks',
      q: 'Найди метод один раз и превращи его в делегат',
      code: 'static ___ Func<Calc, int, int, int> s_add =\n    typeof(Calc).GetMethod("Add")!\n        .___<Func<Calc, int, int, int>>();\n\nint r = s_add(calc, 2, 3);',
      tiles: ['readonly', 'CreateDelegate', 'Invoke', 'MakeGenericMethod', 'const', 'volatile'],
      answer: ['readonly', 'CreateDelegate'],
      explain: 'static readonly — поиск и создание делегата один раз при инициализации типа. CreateDelegate<TDelegate>() даёт открытый делегат: первым параметром идёт объект Calc. Invoke вернул бы object и платил бы за проверки на каждом вызове.'
    }
  ]
};
