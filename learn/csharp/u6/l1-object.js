/** C# глубже, раздел «Устройство типа», урок 1: System.Object и что есть у любого объекта. */
export default {
  id: 'cs.u6.l1',
  title: 'System.Object изнутри',
  sub: 'Шесть методов, заголовок объекта и контракт Equals/GetHashCode',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Что достаётся каждому типу',
      body: '<p>Любой тип в .NET — класс, структура, запись, массив — в конце цепочки наследуется от <code>System.Object</code>. Поэтому у любого значения есть одни и те же методы:</p><p><b>Публичные:</b> <code>Equals</code>, <code>GetHashCode</code>, <code>ToString</code> — виртуальные, их можно переопределить; <code>GetType</code> — не виртуальный.<br><b>Защищённые:</b> <code>MemberwiseClone</code> — поверхностная копия; <code>Finalize</code> — его вызывает сборщик мусора.<br><b>Статические:</b> <code>ReferenceEquals</code> и <code>Equals(a, b)</code>.</p>',
      code: 'class Order { }\n\nvar o = new Order();\no.ToString();     // "Shop.Order" — полное имя типа\no.GetHashCode();  // число, своё у каждого объекта\no.Equals(o);      // true: сравнение ссылок\no.GetType();      // typeof(Order)'
    },
    {
      t: 'learn',
      title: 'Объект в куче: два служебных слова',
      body: '<p>Когда пишешь <code>new Order()</code>, в куче появляется не только место под поля. Перед полями лежат два служебных слова:</p><p><b>Заголовок объекта</b> — биты для <code>lock</code>, хеш-кода по умолчанию и ссылка на sync block, если он понадобился.<br><b>Указатель на тип</b> (MethodTable) — адрес структуры, где CLR хранит всё о типе: размер, родителя, интерфейсы, таблицу виртуальных методов.</p><p>Ссылка в переменной указывает как раз на указатель на тип. Именно по нему работают <code>GetType</code>, приведения и вызов виртуальных методов.</p>',
      flow: ['заголовок', 'указатель на тип', 'поля'],
      deep: '<p>На 64-битной платформе заголовок и указатель на тип занимают по 8 байт. Заголовок лежит по отрицательному смещению: ссылка указывает на слово MethodTable, а заголовок — на 8 байт раньше. Даже у пустого класса минимальный размер объекта — <b>24 байта</b>: сборщику нужно место хотя бы под одно поле размером с указатель.</p><p>У структуры в стеке или внутри другого объекта этих слов нет — только поля. Они появляются, когда структуру <b>упаковывают</b>: коробка — обычный объект в куче со своим заголовком и указателем на тип.</p>'
    },
    {
      t: 'choice',
      q: 'Сколько байт займёт в куче объект пустого класса class Empty { } в 64-битном процессе?',
      options: ['24', '0', '8', '16'],
      answer: 0,
      explain: '8 байт заголовка, 8 байт указателя на тип и минимальное место под одно поле размером с указатель. Меньше 24 байт объект на x64 не бывает.',
      wrong: { 1: 'Полей нет, но служебные слова есть у каждого объекта.', 3: '16 — это только заголовок и указатель на тип. CLR всё равно резервирует место ещё под одно слово.' }
    },
    {
      t: 'learn',
      title: 'Почему GetType нельзя переопределить',
      body: '<p><code>GetType</code> ничего не вычисляет: он берёт указатель на тип из самого объекта и отдаёт соответствующий <code>Type</code>. Будь метод виртуальным, класс мог бы соврать: «я — <code>string</code>». А на правде об этом указателе стоит вся безопасность типов: приведения, <code>is</code>, вызов нужного метода.</p><p>Поэтому <code>GetType</code> не виртуальный. Скрыть его словом <code>new</code> можно, но код, который смотрит через <code>object</code>, всё равно получит настоящий тип.</p>',
      code: 'class Liar\n{\n    public new Type GetType() => typeof(string);\n}\n\nvar l = new Liar();\nl.GetType();            // string — вызван метод Liar\n((object)l).GetType();  // Liar — настоящий тип',
      deep: '<p>Отличие от <code>typeof(T)</code>: <code>typeof</code> — тип, известный компилятору, <code>GetType()</code> — тип конкретного объекта во время работы. У <code>Animal a = new Cat()</code> статический тип Animal, а <code>a.GetType()</code> вернёт Cat.</p><p>Нюанс с <code>Nullable</code>: <code>int? x = 5; x.GetType()</code> вернёт <code>System.Int32</code>. Вызов идёт через упаковку, а упакованный <code>int?</code> — это просто упакованный <code>int</code>. Если же <code>x</code> равен null, будет <code>NullReferenceException</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Какие методы System.Object можно переопределить через override? Отметь все.',
      options: ['ToString', 'Equals', 'GetHashCode', 'GetType', 'MemberwiseClone'],
      answer: [0, 1, 2],
      explain: 'GetType и MemberwiseClone не виртуальные. Ещё виртуальный Finalize, но в C# его пишут не через override, а синтаксисом финализатора ~Имя().'
    },
    {
      t: 'learn',
      title: 'Как словарь ищет ключ',
      body: '<p><code>Dictionary</code> и <code>HashSet</code> ищут в два шага: <b>GetHashCode</b> выбирает корзину, а <b>Equals</b> сравнивает с элементами этой корзины. Отсюда контракт:</p><p>1. Если <code>a.Equals(b)</code>, то хеши <b>обязаны</b> совпадать. Обратное не нужно: одинаковые хеши у разных объектов — нормальная коллизия.<br>2. Пока объект лежит в словаре ключом, его хеш не должен меняться.<br>3. Equals рефлексивен, симметричен, транзитивен и для null возвращает false.</p><p>По умолчанию у класса Equals сравнивает ссылки, а GetHashCode у каждого объекта свой. Переопределил только Equals — нарушил пункт 1. Компилятор предупредит: <b>CS0659</b>.</p>',
      code: 'class Point\n{\n    public int X, Y;\n    public override bool Equals(object? o) =>\n        o is Point p && p.X == X && p.Y == Y;\n    // GetHashCode забыт → предупреждение CS0659\n}'
    },
    {
      t: 'choice',
      q: 'У Point переопределён только Equals. Что напечатает код?',
      code: 'var set = new HashSet<Point> { new Point { X = 1, Y = 2 } };\nConsole.WriteLine(set.Contains(new Point { X = 1, Y = 2 }));',
      options: ['Почти всегда False', 'True', 'Бросит исключение', 'Не скомпилируется'],
      answer: 0,
      explain: 'У двух разных объектов хеши по умолчанию разные. Поиск идёт не в ту корзину (или отсеивается по несовпадению хеша), и до Equals дело не доходит. True возможно только при случайном совпадении хешей.',
      wrong: { 3: 'CS0659 — это предупреждение, а не ошибка. Код соберётся и будет тихо работать неправильно.' }
    },
    {
      t: 'tapline',
      q: 'В Point теперь переопределены и Equals, и GetHashCode по полям X и Y. Какая строка напечатает False?',
      code: 'var p = new Point { X = 1, Y = 2 };\nvar set = new HashSet<Point> { p };\nConsole.WriteLine(set.Contains(p));\np.X = 10;\nConsole.WriteLine(set.Contains(p));',
      answer: 4,
      explain: 'После p.X = 10 хеш стал другим, а объект лежит в корзине, вычисленной по старому хешу. Набор ищет в новой корзине и не находит — хотя это тот же самый объект. Ключи словаря делают неизменяемыми.'
    },
    {
      t: 'blanks',
      q: 'Допиши пару методов так, чтобы контракт соблюдался',
      code: 'public override bool Equals(object? o) =>\n    o ___ Point p && p.X == X && p.Y == Y;\n\npublic override int GetHashCode() => ___.Combine(X, Y);',
      tiles: ['is', 'HashCode', 'as', 'Object', 'RuntimeHelpers'],
      answer: ['is', 'HashCode'],
      explain: 'Шаблон is Point p проверяет тип и заодно отсекает null. HashCode.Combine смешивает хеши полей. Ещё проще — record: компилятор сам напишет Equals и GetHashCode по всем полям.'
    },
    {
      t: 'learn',
      title: 'MemberwiseClone и Finalize: что они стоят',
      body: '<p><b>MemberwiseClone</b> создаёт новый объект того же типа и копирует поля побитно. Конструктор не вызывается, а ссылочные поля копируются как ссылки: оригинал и копия делят один и тот же список. Метод защищённый — снаружи объект так не скопировать, только изнутри типа.</p><p><b>Finalize</b> в C# пишут как <code>~Имя()</code>. Это не деструктор в смысле C++: время вызова решает сборщик мусора. У такого объекта дороже создание (его регистрируют в очереди финализации), и он переживает лишнюю сборку мусора.</p>',
      code: 'class Doc\n{\n    public List<string> Tags = new();\n    public Doc Copy() => (Doc)MemberwiseClone();\n}\n\nvar a = new Doc();\nvar b = a.Copy();\nb.Tags.Add("x");   // a.Tags тоже содержит "x"',
      deep: '<p>Финализатор компилятор превращает в <code>protected override void Finalize()</code> с вызовом <code>base.Finalize()</code> в <code>finally</code>. В современном .NET финализаторы <b>не запускаются при завершении процесса</b> (в .NET Framework запускались), так что на них нельзя полагаться даже «под конец». Для ресурсов — <code>IDisposable</code> и <code>SafeHandle</code>.</p><p>Выражение <code>with</code> у записей не использует <code>MemberwiseClone</code>: компилятор генерирует копирующий конструктор и скрытый метод клонирования. Копия по-прежнему поверхностная.</p>'
    },
    {
      t: 'match',
      q: 'Соедини метод и что он делает',
      pairs: [
        ['ReferenceEquals(a, b)', 'Это один и тот же объект?'],
        ['MemberwiseClone()', 'Поверхностная копия без конструктора'],
        ['GetType()', 'Читает указатель на тип'],
        ['ToString() по умолчанию', 'Полное имя типа'],
        ['Finalize()', 'Вызывается сборщиком мусора']
      ]
    },
    {
      t: 'choice',
      q: 'Что вернёт object.ReferenceEquals(42, 42)?',
      options: ['False', 'True', 'Не скомпилируется', 'Зависит от JIT'],
      answer: 0,
      explain: 'ReferenceEquals принимает object, поэтому каждое 42 упаковывается в свою коробку. Две разные коробки — две разные ссылки. Для значимых типов ReferenceEquals всегда false.'
    }
  ]
};
