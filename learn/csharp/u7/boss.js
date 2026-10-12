/** Финал раздела «Значимые типы до конца» курса «C# глубже». */
export default {
  id: 'cs.u7.boss',
  title: 'Финал: значимые типы',
  sub: 'Скрытые коробки, копии и равенство',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Counter — изменяемая структура, реализует ICounter с методом Inc. Что напечатает код?',
      code: 'var arr = new Counter[1];\n((ICounter)arr[0]).Inc();\narr[0].Inc();\nICounter i = arr[0];\ni.Inc();\nConsole.WriteLine(arr[0].Value);',
      options: ['1', '0', '2', '3'],
      answer: 0,
      explain: 'Первое приведение упаковывает копию элемента — изменение теряется. arr[0].Inc() меняет сам элемент массива: 1. Строка ICounter i = arr[0] упаковывает копию со значением 1, i.Inc() доводит коробку до 2, а элемент остаётся 1.',
      wrong: { 2: 'i — коробка с копией элемента. Её изменение до массива не доходит.' }
    },
    {
      t: 'multi',
      q: 'S — структура без переопределений, реализует IDisposable и IComparable<S>. Где будет упаковка, если JIT её не уберёт? Отметь все.',
      options: [
        's.GetType();',
        's.Equals(other);',
        'using (s) { }',
        'Max(s, other);  // where T : IComparable<T>',
        's.GetHashCode();'
      ],
      answer: [0, 1, 4],
      explain: 'GetType — метод Object, ему нужен объект. Equals и GetHashCode не переопределены — уходят в ValueType с коробкой (у Equals упаковывается ещё и аргумент). Dispose в using и CompareTo в дженерике с ограничением вызываются через constrained без коробки.'
    },
    {
      t: 'tapline',
      q: 'Point — изменяемая структура с методом Offset. Какая строка компилируется, но ничего не меняет в данных?',
      code: 'var list = new List<Point> { default };\nvar arr = new Point[1];\narr[0].Offset(1);\nlist[0] = list[0] with { X = 2 };\nlist[0].Offset(1);\nforeach (ref var p in CollectionsMarshal.AsSpan(list)) p.Offset(1);',
      answer: 4,
      explain: 'Индексатор List<T> возвращает копию: Offset меняет временную переменную. Массив отдаёт сам элемент, with с присваиванием записывает новое значение, а ref через AsSpan даёт ссылку прямо во внутренний массив списка.'
    },
    {
      t: 'choice',
      q: 'struct Key { string City; int Id; } — ключ словаря, ничего не переопределено. Чем это плохо, если у многих ключей один город?',
      options: [
        'Хеш по умолчанию берётся только от City: такие ключи падают в одну корзину, а Equals идёт через отражение',
        'Equals сравнит только City, и разные Id перезапишут друг друга',
        'Словарь не примет структуру со ссылкой в качестве ключа',
        'Ничем: ValueType.GetHashCode смешивает все поля'
      ],
      answer: 0,
      explain: 'Из-за ссылки быстрый путь закрыт. Медленный GetHashCode хеширует первое непустое поле — City. Equals при этом сравнивает все поля, так что данные не путаются, но поиск становится перебором с отражением.',
      wrong: { 1: 'Equals через отражение сравнивает все поля. Ключи не путаются — просто всё медленно.' }
    },
    {
      t: 'blanks',
      q: 'Структура-ключ: равенство без коробок и отражения, одной строкой',
      code: 'public ___ record ___ Key(string City, int Id);',
      tiles: ['readonly', 'struct', 'class', 'ref', 'sealed'],
      answer: ['readonly', 'struct'],
      explain: 'readonly record struct генерирует IEquatable<Key>, Equals, GetHashCode по всем полям и ==, а readonly делает свойства init — ключ нельзя испортить после вставки. record class тоже дал бы равенство, но это уже ссылочный тип с аллокацией на каждый ключ.'
    },
    {
      t: 'match',
      q: 'Соедини структуру и как её сравнит ValueType.Equals',
      pairs: [
        ['struct { int A; int B; }', 'Побайтово'],
        ['struct { byte A; int B; }', 'Отражением: дыра выравнивания'],
        ['struct { double X; }', 'Отражением: double'],
        ['struct { string S; }', 'Отражением: ссылка'],
        ['struct с override Equals', 'Своим Equals, ValueType не участвует']
      ]
    },
    {
      t: 'choice',
      q: 'Что вернёт Unsafe.SizeOf<R>() на x64?',
      code: 'struct R\n{\n    public byte Kind;\n    public double Value;\n    public int Id;\n}',
      options: ['24', '13', '16', '17'],
      answer: 0,
      explain: 'Sequential: Kind в 0, затем 7 байт дыры до выровненного double в 8, Id в 16, всего 20 — и округление до кратного 8: 24. Если поставить double первым, а byte последним, будет 16.',
      wrong: { 1: '13 — сумма размеров полей без выравнивания. Так было бы только с Pack = 1.', 2: '16 получится, если переставить поля: double, int, byte.' }
    },
    {
      t: 'choice',
      q: 'HashSet<P>, где P — структура без IEquatable<P>, но с переопределёнными Equals(object) и GetHashCode. Что происходит в Contains?',
      options: [
        'Отражения нет, но аргумент упаковывается при каждом вызове Equals(object)',
        'Ни коробок, ни отражения — override достаточно',
        'Сравнение через ValueType.Equals с отражением',
        'Не скомпилируется: HashSet требует IEquatable<T>'
      ],
      answer: 0,
      explain: 'Без IEquatable<P> EqualityComparer<P>.Default вызывает Equals(object): свой override, так что отражения нет, но аргумент — object, значит, коробка на каждое сравнение. IEquatable<P> убирает и её.',
      wrong: { 3: 'HashSet работает с любым T: без IEquatable<T> он просто уходит в Equals(object).' }
    }
  ]
};
