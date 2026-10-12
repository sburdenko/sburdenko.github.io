/** C# глубже, раздел «Строки, перечисления, массивы», урок 4: массивы изнутри и Nullable<T>. */
export default {
  id: 'cs.u11.l4',
  title: 'Массивы и Nullable<T>',
  sub: 'Цена ковариантности, зубчатые и многомерные, InlineArray, выражения коллекций и упаковка int?',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'Ковариантность массивов стоит проверки',
      body: '<p>Ловушку <code>object[] arr = new string[2]; arr[0] = 42;</code> ты видел в разделе «Дженерики». Теперь — во что она обходится. Раз под <code>object[]</code> может прятаться <code>string[]</code>, CLR обязан проверять <b>каждую запись ссылки</b> в массив ссылочного типа. IL-инструкция <code>stelem.ref</code> вызывает помощник рантайма: он сравнивает тип значения с типом элементов настоящего массива и при несовпадении бросает <code>ArrayTypeMismatchException</code>.</p><p>JIT убирает проверку, когда может доказать, что она не нужна: записывают <code>null</code>, тип элемента <code>sealed</code> (у <code>string[]</code> наследников не бывает) или точный тип массива известен. В остальных случаях — лишний вызов на каждое присваивание.</p>',
      code: 'void Fill(Animal[] arr, Animal a)\n{\n    for (int i = 0; i < arr.Length; i++)\n        arr[i] = a;   // проверка: а вдруг arr — это Cat[]?\n}',
      deep: '<p>У массивов значимых типов ковариантности в C# нет: <code>object[] o = new int[3]</code> не скомпилируется. Но CLR считает совместимыми массивы целых одного размера: <code>(uint[])(object)new int[1]</code> пройдёт при запуске, как и массив перечисления в массив его базового типа. В горячих циклах проверку записи обходят обёрткой-структурой (<code>struct Ref { public Animal Value; }</code> и массив <code>Ref[]</code>) — у значимого типа ковариантности нет, и проверять нечего.</p>'
    },
    {
      t: 'choice',
      q: 'Что произойдёт на второй строке?',
      code: 'object[] arr = new string[2];\nSpan<object> span = arr;\nspan[0] = 42;',
      options: ['ArrayTypeMismatchException при создании Span', 'Ничего: исключение будет на третьей строке', 'Ошибка компиляции', 'Span скопирует элементы в новый object[]'],
      answer: 0,
      explain: 'Span<T> не делает проверку на каждую запись — ради скорости. Поэтому он проверяет один раз, в конструкторе: если массив ссылочного типа на самом деле не T[], сразу бросает ArrayTypeMismatchException.',
      wrong: { 1: 'Запись через Span — простая запись в память без stelem.ref. Чтобы она была безопасной, проверку перенесли в момент создания Span.' }
    },
    {
      t: 'learn',
      title: 'Зубчатые и многомерные',
      body: '<p><b>Зубчатый</b> массив (jagged) <code>int[][]</code> — массив ссылок на отдельные массивы. Каждая строка — свой объект в куче со своей длиной. 1000 строк — 1001 аллокация, а <code>a[i][j]</code> — два перехода по ссылкам и две проверки границ.</p><p><b>Многомерный</b> <code>int[,]</code> — один объект, данные прямоугольником подряд. Но для CLR он устроен иначе, чем <code>int[]</code>. Одномерный массив с нулевой нижней границей (SZ-массив) имеет свои IL-инструкции: <code>newarr</code>, <code>ldelem</code>, <code>stelem</code>. У многомерного их нет: создание — <code>newobj</code>, доступ — вызовы методов <code>Get</code>/<code>Set</code>/<code>Address</code>, которые рантайм создаёт для типа массива.</p><p>Исторически <code>int[,]</code> из-за этого был медленнее зубчатого. Начиная с .NET 7 JIT разворачивает такие вызовы в прямой доступ, и разрыв заметно сократился. Но оптимизаций для SZ-массивов (снятие проверок границ в циклах, векторизация, Span) у многомерных всё ещё меньше.</p>',
      code: 'int[][] jag = new int[3][];   // три null, строки — потом\njag[0] = new int[5];\n\nint[,] grid = new int[3, 5];  // один объект на 15 элементов\ngrid[1, 2] = 7;               // IL: call int32[,]::Set(...)',
      deep: '<p>Частый быстрый вариант — одномерный массив и ручной индекс: <code>data[row * width + col]</code>. Один объект, данные подряд, все оптимизации SZ-массива и <code>Span</code> на всю таблицу. В CLR бывают и одномерные массивы с ненулевой нижней границей (через <code>Array.CreateInstance</code>), их тип пишется <code>int[*]</code>; привести такой к <code>int[]</code> нельзя.</p>'
    },
    {
      t: 'match',
      q: 'Соедини объявление и как оно устроено',
      pairs: [
        ['int[]', 'Одномерный с нуля: свои инструкции newarr и ldelem'],
        ['int[,]', 'Один объект, доступ через методы Get и Set'],
        ['int[][]', 'Массив ссылок на отдельные строки'],
        ['[InlineArray(8)] struct', 'Восемь элементов прямо внутри структуры'],
        ['ReadOnlySpan<int> s = [1, 2, 3]', 'Взгляд на данные в сборке, без аллокации']
      ]
    },
    {
      t: 'learn',
      title: 'InlineArray (C# 12, .NET 8)',
      body: '<p>Иногда нужен буфер фиксированного размера <b>внутри</b> структуры — без отдельного массива в куче. Раньше для этого был только <code>fixed int buf[8]</code>: требует <code>unsafe</code>, работает лишь с примитивами и не проверяет границы.</p><p>Атрибут <code>[InlineArray(N)]</code> говорит рантайму: повтори единственное поле структуры N раз подряд. Язык с C# 12 разрешает индексировать такую структуру, перебирать её в <code>foreach</code> и превращать в <code>Span&lt;T&gt;</code>. Код безопасный, тип элемента любой, включая ссылки, границы проверяются.</p>',
      code: '[InlineArray(8)]\nstruct Buffer8<T>\n{\n    private T _first;   // ровно одно поле\n}\n\nvar buf = new Buffer8<int>();\nbuf[0] = 42;\nSpan<int> span = buf;   // 8 элементов, на стеке',
      deep: '<p>Размер структуры — N × размер поля, поэтому большой InlineArray в локальной переменной съедает стек. Сам компилятор C# использует эту возможность: для <code>params Span&lt;T&gt;</code> (C# 13) и выражений коллекций с целевым типом <code>Span</code> он может сгенерировать скрытую inline-структуру на стеке вместо массива. Внутри рантайма InlineArray заменил многие места, где раньше были <code>fixed</code>-буферы и ручные поля <code>_e0</code>, <code>_e1</code>…</p>'
    },
    {
      t: 'choice',
      q: 'Чем [InlineArray(8)] лучше fixed int buf[8]?',
      options: ['Не нужен unsafe, элементы могут быть любого типа, границы проверяются', 'Он размещается в куче и не занимает стек', 'Он быстрее, потому что не проверяет границы', 'Его можно растянуть во время работы'],
      answer: 0,
      explain: 'Оба лежат внутри структуры. Но fixed-буфер — это указатель без проверок и только для примитивов, а InlineArray — обычный безопасный тип, который превращается в Span.',
      wrong: { 3: 'Размер задан в атрибуте и фиксирован: это часть раскладки структуры.' }
    },
    {
      t: 'learn',
      title: 'Выражения коллекций: что генерирует компилятор',
      body: '<p>Синтаксис <code>[1, 2, 3]</code> (C# 12) ты видел в разделе «Современный C#». Интереснее, что под ним: компилятор выбирает код <b>по целевому типу</b>.</p><ul><li><code>int[] a = [1, 2, 3]</code> — новый массив, как <code>new[] { … }</code>;</li><li><code>int[] e = []</code> — <code>Array.Empty&lt;int&gt;()</code>, общий пустой массив без новой аллокации;</li><li><code>ReadOnlySpan&lt;int&gt; s = [1, 2, 3]</code> из констант — взгляд на данные в сборке, ноль аллокаций;</li><li><code>List&lt;int&gt; l = [1, 2, 3]</code> — список сразу нужной ёмкости;</li><li><code>IEnumerable&lt;int&gt; x = [1, 2]</code> — тип выбирает компилятор, часто скрытый класс только для чтения.</li></ul><p><code>..</code> (spread) вставляет элементы другой коллекции; если длины известны, компилятор считает итоговый размер заранее.</p>',
      deep: '<p>Свой тип подключается к выражениям коллекций атрибутом <code>[CollectionBuilder]</code> — так работают <code>ImmutableArray&lt;T&gt;</code> и другие неизменяемые коллекции. Для интерфейсов компилятор не обещает конкретный тип: полагаться на то, что <code>IEnumerable&lt;int&gt; x = [..]</code> — массив или список, и приводить его обратно нельзя.</p>'
    },
    {
      t: 'multi',
      q: 'Какие строки не выделяют новый объект в куче? Отметь все.',
      options: ['int[] a = [];', 'ReadOnlySpan<byte> b = [1, 2, 3];', 'List<int> c = [1, 2];', 'int[] d = [1, 2, 3];'],
      answer: [0, 1],
      explain: 'Пустой массив — общий Array.Empty<int>(). ReadOnlySpan из констант смотрит на данные в сборке. List и непустой массив — новые объекты в куче.'
    },
    {
      t: 'learn',
      title: 'Nullable<T> — обычная структура',
      body: '<p><code>int?</code> — это <code>Nullable&lt;int&gt;</code>: структура из двух полей, <code>bool hasValue</code> и <code>T value</code>. Никакой ссылки и кучи: <code>int?</code> занимает 8 байт (1 байт флага, выравнивание и 4 байта числа), <code>long?</code> — 16.</p><p>Ограничение <code>where T : struct</code> исключает сам Nullable, поэтому <code>int??</code> не бывает.</p><p>Операторы «поднимаются» (lifted): если хоть один операнд null, арифметика даёт null, а сравнения <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> дают <b>false</b>. <code>x == null</code> компилятор превращает в <code>!x.HasValue</code>.</p>',
      code: 'int? a = null;\nint? sum = a + 1;        // null\nbool gt = a > 0;         // false\nbool le = a <= 0;        // тоже false!\nint v = a.GetValueOrDefault(); // 0, без проверки\nint w = a.Value;         // InvalidOperationException',
      deep: '<p><code>GetValueOrDefault()</code> просто читает поле <code>value</code>, а <code>.Value</code> сначала проверяет флаг. <code>bool?</code> в операторах <code>&amp;</code> и <code>|</code> работает по трёхзначной логике: <code>null &amp; false</code> — false, <code>null | true</code> — true, а <code>null &amp; true</code> — null. В массиве <code>int?[]</code> каждый элемент — 8 байт против 4 у <code>int[]</code>: флаг удваивает размер.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'int? a = null;\nConsole.WriteLine(a > 0 || a <= 0);',
      options: ['False', 'True', 'Бросит InvalidOperationException', 'Не скомпилируется'],
      answer: 0,
      explain: 'С null любое сравнение порядка даёт false, поэтому «больше нуля или не больше» тоже ложно. Привычный закон «одно из двух» для Nullable не действует.'
    },
    {
      t: 'learn',
      title: 'Как упаковывается int?',
      body: '<p>Для <code>Nullable&lt;T&gt;</code> CLR делает исключение в инструкции <code>box</code>:</p><ul><li>если значения нет — получается <b>null</b>, а не коробка;</li><li>если есть — упаковывается сам <b>T</b>. Коробки с <code>Nullable&lt;int&gt;</code> не существует, есть только коробка с <code>int</code>.</li></ul><p>Отсюда следствия. <code>object o = (int?)null</code> честно равен null. Коробку с <code>int</code> можно распаковать и в <code>int</code>, и в <code>int?</code>. А <code>x.GetType()</code> у <code>int?</code> вызывается через упаковку и возвращает <code>System.Int32</code> — или бросает <code>NullReferenceException</code>, если значения нет.</p>',
      code: 'int? x = 5;\nobject o = x;               // коробка с Int32\nConsole.WriteLine(o.GetType()); // System.Int32\nint? back = (int?)o;        // распаковка в int? — можно\n\nint? none = null;\nobject n = none;            // null, не коробка',
      deep: '<p>Это правило появилось незадолго до выхода .NET 2.0: в бета-версиях упакованный пустой <code>int?</code> был ненулевым объектом, и <code>o == null</code> давало false. Изменили рантайм, а не только C#, чтобы null оставался null на любом языке. Интерфейсы тоже идут через упаковку T: <code>IComparable c = (int?)5</code> — коробка с <code>int</code>. Узнать, что тип — Nullable, можно через <code>Nullable.GetUnderlyingType(typeof(int?))</code>: у самого объекта эта информация теряется.</p>'
    },
    {
      t: 'tapline',
      q: 'Какая строка бросит исключение?',
      code: 'int? a = 5;\nint? b = null;\nobject oa = a;\nobject ob = b;\nConsole.WriteLine(oa.GetType());\nConsole.WriteLine(ob == null);\nConsole.WriteLine(b.GetType());',
      answer: 6,
      explain: 'GetType не виртуальный метод object, и чтобы его вызвать, b упаковывается. Пустой int? упаковывается в null — отсюда NullReferenceException. oa.GetType() напечатает System.Int32, а ob == null — True.'
    }
  ]
};
