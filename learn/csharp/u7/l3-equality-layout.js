/** C# глубже, раздел «Значимые типы до конца», урок 3: ValueType.Equals, IEquatable<T>, размер и раскладка структуры. */
export default {
  id: 'cs.u7.l3',
  title: 'Равенство и раскладка',
  sub: 'ValueType.Equals, IEquatable<T>, record struct и байты структуры',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'Как работает ValueType.Equals',
      body: '<p>Структура без своего <code>Equals</code> сравнивается по значению — это делает <code>ValueType.Equals(object)</code>. Он не знает твоих полей заранее и действует так:</p><ul><li>аргумент null или другого типа (сверка через <code>GetType</code>) — false;</li><li>если структуру можно сравнить <b>побайтово</b> — сравнивает память обоих значений как массивы байт. Это быстро;</li><li>иначе — <b>отражение</b>: получает список полей через <code>GetFields</code> и для каждого вызывает <code>FieldInfo.GetValue</code> у обоих значений. Каждое значимое поле при этом упаковывается, затем сравнивается через <code>Equals</code>.</li></ul><p>Медленный путь в разы, а то и на порядок медленнее ручного сравнения и аллоцирует на каждом вызове.</p>',
      deep: '<p>Исходники: <code>ValueType.cs</code> в dotnet/runtime (CoreLib) и проверка <code>CanCompareBitsOrUseFastGetHashCode</code> в рантайме. Результат проверки кэшируется в данных типа (MethodTable), так что решение «быстро или медленно» принимается один раз на тип.</p>'
    },
    {
      t: 'learn',
      title: 'Когда сравнение побайтовое',
      body: '<p>Быстрый путь включается, только если выполнены все условия:</p><ul><li>в структуре <b>нет ссылок</b>: две разные строки с одинаковым текстом — разные адреса, байты не совпадут;</li><li>структура <b>плотно упакована</b> — без дыр выравнивания. В дырах может лежать что угодно, байты там не определены;</li><li>нет полей <code>float</code> и <code>double</code>: <code>0.0</code> и <code>-0.0</code> равны, а байты у них разные; у NaN — наоборот;</li><li>ни сама структура, ни типы её полей не переопределяют <code>Equals</code> или <code>GetHashCode</code>.</li></ul><p>Нарушено хоть одно — отражение.</p>',
      code: 'struct Fast { public int X, Y; }            // байты\nstruct Slow1 { public int Id; public string Name; } // ссылка\nstruct Slow2 { public byte Flag; public int Value; } // 3 байта дыры\nstruct Slow3 { public double X, Y; }        // double',
      deep: '<p>Проверку на <code>float</code>/<code>double</code> добавили не сразу: в старых версиях рантайма структура с <code>double</code> сравнивалась побайтово, и <code>new S(0.0).Equals(new S(-0.0))</code> давал false, хотя поля равны. Отражение сравнивает поля через <code>double.Equals</code>, а для него <code>0.0</code> и <code>-0.0</code> равны и NaN равен NaN.</p>'
    },
    {
      t: 'multi',
      q: 'Какие структуры ValueType.Equals в современном .NET сравнит побайтово? Ни одна ничего не переопределяет. Отметь все.',
      options: [
        'struct A { int X; int Y; }',
        'struct B { int Id; string Name; }',
        'struct C { float X; float Y; }',
        'struct D { byte Flag; int Value; }',
        'struct E { long Ticks; int Kind; int Extra; }'
      ],
      answer: [0, 4],
      explain: 'A — 8 байт без дыр. E — 8 + 4 + 4 = 16 байт, выравнивание соблюдено без пустот. B содержит ссылку, C — float, а у D после byte три байта выравнивания перед int: все три идут через отражение.'
    },
    {
      t: 'learn',
      title: 'ValueType.GetHashCode: хеш по одному полю',
      body: '<p>Хеш по умолчанию тоже два пути. Быстрый (те же условия) — хеш от всех байт структуры. Медленный — хеш <b>только одного поля</b>: первого, которое не null. Остальные поля в хеш не входят вовсе.</p><p>Equals при этом сравнивает все поля, так что контракт формально соблюдён. Но если первое поле у многих ключей одинаковое, все они попадают в одну корзину словаря. Поиск из O(1) превращается в перебор цепочки.</p>',
      code: 'struct Key { public string Region; public int Id; }\n\n// Region у всех "EU" → у всех ключей один хеш\nvar map = new Dictionary<Key, Order>();',
      deep: '<p>Медленный путь выбирает поле в рантайме (<code>GetHashCodeStrategy</code>): ссылка — её <code>GetHashCode</code>, <code>double</code>/<code>float</code> — их хеш, вложенная структура — рекурсивно по тем же правилам. Тип структуры подмешивается к хешу всегда. В .NET Framework было то же «первое поле», поэтому совет «переопредели GetHashCode у структуры-ключа» не устарел.</p>'
    },
    {
      t: 'choice',
      q: 'В словаре миллион ключей Key { Region, Id }, Region у всех "EU". Equals и GetHashCode не переопределены. Что будет с поиском?',
      options: [
        'Все ключи в одной корзине: каждый поиск — длинный перебор со сравнением через отражение',
        'Работает как обычно: хеш учитывает и Id',
        'Словарь бросит исключение при вставке дубля хеша',
        'Поиск быстрый, но съест много памяти на коробки'
      ],
      answer: 0,
      explain: 'Хеш медленного пути берётся от первого непустого поля — строки "EU". Хеши всех ключей совпали, корзина одна. Каждое сравнение в цепочке — ValueType.Equals через отражение с упаковкой полей.',
      wrong: { 2: 'Одинаковые хеши — обычная коллизия, Dictionary к ней готов. Он просто становится медленным.' }
    },
    {
      t: 'learn',
      title: 'IEquatable<T>: зачем он коллекциям',
      body: '<p><code>Dictionary</code>, <code>HashSet</code>, <code>List.Contains</code>, <code>Array.IndexOf</code>, <code>Distinct</code> сравнивают через <code>EqualityComparer&lt;T&gt;.Default</code>. Он один раз на тип выбирает реализацию:</p><ul><li>если <code>T : IEquatable&lt;T&gt;</code> — вызывает <code>Equals(T)</code>: без коробок, обычный метод, его можно встроить;</li><li>если нет — вызывает <code>Equals(object)</code>: аргумент упаковывается, а без override дальше <code>ValueType.Equals</code>.</li></ul><p>Полный набор для структуры: <code>IEquatable&lt;T&gt;</code>, <code>Equals(object)</code>, который зовёт его, <code>GetHashCode</code> по тем же полям и операторы <code>==</code>/<code>!=</code>.</p>',
      code: 'readonly struct Key : IEquatable<Key>\n{\n    public readonly string Region; public readonly int Id;\n    public bool Equals(Key o) => Region == o.Region && Id == o.Id;\n    public override bool Equals(object? o) => o is Key k && Equals(k);\n    public override int GetHashCode() => HashCode.Combine(Region, Id);\n}',
      deep: '<p>Для значимого <code>T</code> JIT знает точный тип <code>EqualityComparer&lt;T&gt;.Default</code> и в .NET Core 2.1+ девиртуализирует вызов: <code>Dictionary&lt;int, …&gt;</code> сравнивает ключи почти как ручной код. Поэтому <code>Dictionary</code> для значимых ключей без своего компаратора даже идёт отдельной веткой кода.</p>'
    },
    {
      t: 'blanks',
      q: 'Допиши равенство без коробок и без отражения',
      code: 'struct Point : ___<Point>\n{\n    public int X, Y;\n    public bool Equals(Point o) => X == o.X && Y == o.Y;\n    public override bool Equals(object? o) => o is Point p && ___(p);\n    public override int GetHashCode() => HashCode.Combine(X, Y);\n}',
      tiles: ['IEquatable', 'Equals', 'IComparable', 'ReferenceEquals', 'IEqualityComparer'],
      answer: ['IEquatable', 'Equals'],
      explain: 'IEquatable<Point> даёт коллекциям Equals(Point) без упаковки. Equals(object) просто делегирует ему, чтобы оба метода не разошлись. ReferenceEquals для структуры всегда false: две коробки — два объекта.'
    },
    {
      t: 'learn',
      title: 'record struct пишет это за тебя',
      body: '<p>С C# 10 <code>record struct</code> генерирует всё из предыдущей карточки: <code>IEquatable&lt;T&gt;</code>, <code>Equals(T)</code> по всем полям через <code>EqualityComparer&lt;TField&gt;.Default</code>, <code>Equals(object)</code>, <code>GetHashCode</code>, <code>==</code>, <code>!=</code> и <code>ToString</code> с содержимым. Ни отражения, ни коробок.</p><p>Разница с обычной структурой видна сразу: у обычной <b>нет оператора ==</b>, <code>a == b</code> не скомпилируется (CS0019). Компилятор не берётся угадать, что значит равенство значений.</p><p>Помни: позиционные свойства <code>record struct</code> изменяемые (<code>get; set;</code>). Неизменяемый вариант — <code>readonly record struct</code>.</p>',
      code: 'public readonly record struct Key(string Region, int Id);\n\nvar a = new Key("EU", 1);\nvar b = new Key("EU", 1);\nConsole.WriteLine(a == b);   // True — сгенерированный ==',
      deep: '<p>Сгенерированное равенство сравнивает <code>double</code>-поля через <code>double.Equals</code>, а не через <code>==</code>. Поэтому две записи с полем <code>double.NaN</code> равны (<code>a == b</code> — True), хотя <code>NaN == NaN</code> — false. Так задумано: иначе запись нельзя было бы найти в словаре.</p>'
    },
    {
      t: 'choice',
      q: 'P — обычная структура с полями X и Y, без операторов. Что будет?',
      code: 'var a = new P { X = 1, Y = 2 };\nvar b = new P { X = 1, Y = 2 };\nConsole.WriteLine(a == b);',
      options: ['Ошибка компиляции CS0019', 'True', 'False', 'True, но через упаковку'],
      answer: 0,
      explain: 'Для структуры оператор == не определён, пока ты его не напишешь (или не объявишь record struct). Equals есть всегда — его даёт ValueType, а оператора нет.',
      wrong: { 2: 'False для двух разных объектов дал бы == у класса — он сравнивает ссылки. У структуры == просто нет.' }
    },
    {
      t: 'learn',
      title: 'Раскладка: поля выравниваются',
      body: '<p>Для структур компилятор C# ставит <code>[StructLayout(LayoutKind.Sequential)]</code>: поля идут в порядке объявления. Но каждое поле выравнивается по своему размеру: <code>long</code> — на адрес, кратный 8, <code>int</code> — 4. А размер всей структуры округляется до самого строгого выравнивания, чтобы в массиве каждый элемент тоже был выровнен.</p><p>Порядок полей меняет размер. Узнать его без <code>unsafe</code> — <code>Unsafe.SizeOf&lt;T&gt;()</code>.</p>',
      code: 'struct Loose { byte A; long B; byte C; }   // 1 + 7 дыра + 8 + 1 + 7 дыра\nstruct Tight { long B; byte A; byte C; }   // 8 + 1 + 1 + 6 дыра\n\nUnsafe.SizeOf<Loose>();   // 24\nUnsafe.SizeOf<Tight>();   // 16',
      deep: '<p>Цифры — для x64. Пустая структура занимает 1 байт: у каждого значения должен быть свой адрес. <code>sizeof(T)</code> для своих структур в C# требует <code>unsafe</code>-контекст, <code>Unsafe.SizeOf&lt;T&gt;</code> — нет, это интринсик JIT.</p>'
    },
    {
      t: 'order',
      q: 'Расставь поля структуры так, чтобы при Sequential-раскладке не было дыр между полями: от самого большого к самому маленькому',
      items: ['long Ticks', 'int Count', 'short Code', 'byte Flag'],
      explain: '8 + 4 + 2 + 1 = 15 байт данных, каждое поле уже на выровненном адресе. Размер округлится до 16 — одна дыра в конце. Порядок от большего к меньшему — простой способ не терять байты.'
    },
    {
      t: 'learn',
      title: 'StructLayout, ссылки и маршалинг',
      body: '<ul><li><code>LayoutKind.Auto</code> — рантайм сам переставляет поля, обычно плотнее. Но такую структуру нельзя передать в неуправляемый код.</li><li><code>Pack = 1</code> — без выравнивания: <code>Loose</code> станет 10 байт, зато чтение невыровненного <code>long</code> может стоить дороже.</li><li><code>LayoutKind.Explicit</code> + <code>[FieldOffset]</code> — поле по точному смещению, можно накладывать поля друг на друга.</li></ul><p>Важная оговорка из документации: если в структуре есть <b>ссылки</b>, Sequential не управляет раскладкой в управляемой памяти — рантайм раскладывает такие поля как Auto. Sequential тогда влияет только на маршалинг.</p><p>И связь с началом урока: дыры выравнивания отключают побайтовое <code>ValueType.Equals</code>.</p>',
      deep: '<p><code>Marshal.SizeOf&lt;T&gt;()</code> — размер при маршалинге, а не в памяти .NET. У <code>struct { bool A; bool B; }</code> <code>Unsafe.SizeOf</code> — 2, а <code>Marshal.SizeOf</code> — 8: по умолчанию <code>bool</code> маршалится как 4-байтовый Win32 BOOL.</p><p>Сценарий «версия 2»: переставил поля Sequential-структуры, которая уходит в P/Invoke или пишется в файл как байты, — нативный код и старые файлы читают уже не те поля. Для таких структур порядок полей — часть контракта.</p>'
    },
    {
      t: 'match',
      q: 'Соедини инструмент и что он даёт',
      pairs: [
        ['Unsafe.SizeOf<T>()', 'Размер в управляемой памяти'],
        ['Marshal.SizeOf<T>()', 'Размер при передаче в неуправляемый код'],
        ['[StructLayout(LayoutKind.Auto)]', 'Рантайм сам выбирает порядок полей'],
        ['[StructLayout(LayoutKind.Sequential, Pack = 1)]', 'Поля подряд без выравнивания'],
        ['[FieldOffset(8)]', 'Поле по точному смещению']
      ]
    }
  ]
};
