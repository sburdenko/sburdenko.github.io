/** Финал раздела «Устройство типа» курса «C# глубже». */
export default {
  id: 'cs.u6.boss',
  title: 'Финал: устройство типа',
  sub: 'Объект в куче, приведения, примитивы и dynamic',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'multi',
      q: 'Объект в куче 64-битного процесса. Что правда? Отметь все.',
      options: [
        'Ссылка в переменной указывает на слово с указателем на тип (MethodTable)',
        'Заголовок объекта лежит на 8 байт раньше этого слова',
        'Упакованный int занимает в куче 24 байта',
        'У структуры в локальной переменной тоже есть заголовок и указатель на тип',
        'GetType читает тип из заголовка объекта'
      ],
      answer: [0, 1, 2],
      explain: 'Упакованный int — обычный объект: 8 байт заголовка, 8 байт указателя на тип и 4 байта значения, дополненные до минимальных 24. У структуры вне коробки служебных слов нет. GetType читает указатель на тип, а заголовок хранит биты для lock и хеш-кода.'
    },
    {
      t: 'choice',
      q: 'Equals сравнивает поля, а GetHashCode у всех объектов возвращает 0. Что будет со словарём, где такие объекты — ключи?',
      code: 'public override bool Equals(object? o) =>\n    o is Point p && p.X == X && p.Y == Y;\n\npublic override int GetHashCode() => 0;',
      options: [
        'Ключи найдутся, но все лягут в одну корзину, и поиск станет линейным',
        'Контракт нарушен: словарь начнёт терять ключи',
        'Не скомпилируется: CS0659',
        'Ничего не изменится: хеш влияет только на Equals'
      ],
      answer: 0,
      explain: 'Контракт требует одного: равные объекты дают равные хеши. Ноль у всех его соблюдает. Но корзина одна на всех, и каждый поиск сравнивает ключ с каждым элементом через Equals — O(n) вместо O(1).',
      wrong: { 1: 'Потерять ключ можно, если равные объекты дают разные хеши. Здесь хеши равны всегда.', 2: 'CS0659 — предупреждение о том, что GetHashCode не переопределён вовсе. Здесь он есть.' }
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'int? x = 5;\nConsole.WriteLine(x.GetType());',
      options: ['System.Int32', 'System.Nullable`1[System.Int32]', 'System.Object', 'Бросит NullReferenceException'],
      answer: 0,
      explain: 'GetType не виртуальный и определён в object, поэтому int? сначала упаковывается. А упакованный int? со значением — это коробка с обычным int. Если бы x был null, упаковка дала бы null и вызов бросил бы NullReferenceException.'
    },
    {
      t: 'tapline',
      q: 'Какая строка бросит InvalidCastException?',
      code: 'object o = (short)7;\nint a = (short)o;\nint b = (int)o;\nDayOfWeek d = (DayOfWeek)(object)1;\nstring? s = o as string;',
      answer: 2,
      explain: 'В коробке Int16. (short)o распаковывает точный тип, а дальше short неявно расширяется до int. (int)o пытается распаковать Int32 из коробки с Int16 — исключение. Перечисление и его базовый тип распаковываются друг в друга, а as при неудаче возвращает null.'
    },
    {
      t: 'match',
      q: 'Соедини IL-инструкцию и выражение C#, из которого она получается',
      pairs: [
        ['castclass', '(Manager)o'],
        ['isinst', 'o as Manager'],
        ['unbox.any', '(int)o, где o — object'],
        ['add.ovf', 'checked(a + b) для int'],
        ['call op_Addition', 'a + b для decimal']
      ]
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'object a = 1;\nobject b = 1;\nConsole.WriteLine(a == b);\nConsole.WriteLine(a.Equals(b));',
      options: ['False и True', 'True и True', 'False и False', 'True и False'],
      answer: 0,
      explain: 'Каждая единица упакована в свою коробку. == для двух object сравнивает ссылки — коробки разные. Equals виртуальный: вызывается Int32.Equals, и он сравнивает значения.'
    },
    {
      t: 'choice',
      q: 'Проект с настройками по умолчанию. Что напечатает код?',
      code: 'checked\n{\n    int r = Add(int.MaxValue, 1);\n    Console.WriteLine(r);\n}\n\nstatic int Add(int a, int b) => a + b;',
      options: ['-2147483648', 'Бросит OverflowException', '2147483648', 'Не скомпилируется: CS0220'],
      answer: 0,
      explain: 'checked действует только на код, написанный внутри блока. Сложение стоит в Add, а Add скомпилирован в контексте проекта — unchecked, инструкция add без проверки.',
      wrong: { 1: 'checked не распространяется на вызванные методы: в Add обычная инструкция add.', 3: 'CS0220 — для константных выражений. Вызов метода константой не является.' }
    },
    {
      t: 'blanks',
      q: 'Нужно исключение вместо обрезки старших бит, а потом — проверка типа и распаковка за один шаг',
      code: 'long big = 5_000_000_000;\nint n = ___((int)big);\n\nif (o ___ int i) Use(i);',
      tiles: ['checked', 'unchecked', 'is', 'as', 'default'],
      answer: ['checked', 'is'],
      explain: 'checked превращает сужение в conv.ovf и бросает OverflowException. Шаблон is int i проверяет, что в коробке именно Int32, и распаковывает. as с int не работает: при неудаче ему нечего вернуть.'
    },
    {
      t: 'choice',
      q: 'Какой тип у n во время компиляции?',
      code: 'dynamic d = new List<int> { 1, 2 };\nvar n = d.Count;',
      options: ['dynamic', 'int', 'object', 'Не скомпилируется: у dynamic нет Count'],
      answer: 0,
      explain: 'Результат операции над dynamic — тоже dynamic: компилятор не знает, что вернёт Count. Поэтому n.Foo() скомпилируется и упадёт только при запуске. Чтобы вернуться к проверкам компилятора, пишут тип явно: int n = d.Count.'
    }
  ]
};
