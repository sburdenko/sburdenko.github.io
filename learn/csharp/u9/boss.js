/** Финал раздела «Параметры, свойства, кортежи» курса «C# глубже». */
export default {
  id: 'cs.u9.boss',
  title: 'Финал: параметры и кортежи',
  sub: 'ref, умолчания, params, свойства и ValueTuple',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Почему нельзя объявить рядом void M(ref int x) и void M(in int x)?',
      options: [
        'В IL оба параметра — int32&, сигнатуры совпадают',
        'in и ref нельзя использовать в одном классе',
        'Компилятор не сможет выбрать: у вызова модификатор необязателен',
        'CLR запрещает два метода с одинаковым именем'
      ],
      answer: 0,
      explain: 'ref, out, in и ref readonly — один управляемый указатель, отличаются только флаги и атрибуты. Перегрузка по ним невозможна, а пара M(int) и M(in int) законна.',
      wrong: { 3: 'Перегрузка по разным типам параметров для CLR нормальна. Проблема в том, что здесь типы одинаковые.' }
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется?',
      code: 'int[] arr = [1, 2, 3];\nref int r = ref arr[0];\nref readonly int ro = ref arr[1];\nr = 10;\nro = 20;\nint copy = ro;',
      answer: 4,
      explain: 'ref readonly — ссылка только для чтения: присвоить через неё нельзя. r — обычная ref-локальная, r = 10 меняет arr[0]. Прочитать ro в копию можно.'
    },
    {
      t: 'choice',
      q: 'Библиотека v1: Connect(int timeout = 30). В v2: Connect(int timeout = 30, bool tls = true). Приложение собрано против v1, DLL заменили. Что будет при вызове Connect()?',
      options: [
        'MissingMethodException: метода Connect(int32) больше нет',
        'Вызов с timeout = 30 и tls = true',
        'Вызов с timeout = 30 и tls = false',
        'Ошибка компиляции в приложении'
      ],
      answer: 0,
      explain: 'Добавленный необязательный параметр меняет сигнатуру. Старый IL ищет Connect(int32) — и не находит. Значения по умолчанию подставляет вызывающий при компиляции, а приложение не пересобирали. Лечится перегрузкой со старой сигнатурой.'
    },
    {
      t: 'match',
      q: 'Соедини конструкцию C# и что от неё остаётся в метаданных',
      pairs: [
        ['Свойство Age', 'Методы get_Age и set_Age'],
        ['Индексатор this[int]', 'get_Item и DefaultMember("Item")'],
        ['init-аксессор', 'modreq(IsExternalInit)'],
        ['ref readonly-параметр', 'RequiresLocationAttribute'],
        ['Имена элементов кортежа', 'TupleElementNames']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда про (int X, int Y)? Отметь все.',
      options: [
        'Это изменяемая структура ValueTuple<int, int>',
        'Во время работы у неё поля Item1 и Item2',
        '(X: 1, Y: 2) == (A: 1, B: 2) даёт True',
        'Это класс System.Tuple в куче',
        'Рефлексия видит поля X и Y'
      ],
      answer: [0, 1, 2],
      explain: 'Имена живут только в компиляторе и атрибуте TupleElementNames. Сравнение == поэлементное и имён не учитывает. System.Tuple — другой, старый тип-класс.'
    },
    {
      t: 'choice',
      q: 'Есть Join(params string[]) и Join(params ReadOnlySpan<string>). Какие перегрузки выберут Join("a", "b") и Join(arr), где arr — string[]?',
      options: [
        'Первый — span, второй — массив',
        'Оба — span',
        'Оба — массив',
        'Первый — массив, второй — span'
      ],
      answer: 0,
      explain: 'Join("a", "b") подходит обеим только в развёрнутой форме — тогда span лучше (C# 13). Join(arr) подходит обеим в обычной форме, и точное совпадение string[] лучше преобразования массива в span.'
    },
    {
      t: 'blanks',
      q: 'Метод отдаёт ссылку на первый элемент, вызывающий пишет через неё',
      code: 'static ___ int First(int[] a) => ___ a[0];\n\n___ int f = ref First(arr);\nf = 42;   // arr[0] == 42',
      tiles: ['ref', 'ref', 'ref', 'in', 'out', 'readonly'],
      answer: ['ref', 'ref', 'ref'],
      explain: 'ref в возвращаемом типе, ref в return и ref-локальная у вызывающего. Без ref слева f была бы копией, и arr не изменился бы.'
    },
    {
      t: 'choice',
      q: 'Проект на C# 10 вызывает new Order() из библиотеки, где у Order есть required-член. Что будет?',
      options: [
        'Ошибка компиляции: конструктор помечен Obsolete как ошибка',
        'Скомпилируется, Customer останется null',
        'Скомпилируется, при запуске будет исключение',
        'Скомпилируется с предупреждением'
      ],
      answer: 0,
      explain: 'Компилятор помечает конструкторы типа с required-членами атрибутами Obsolete (как ошибку) и CompilerFeatureRequired. Старый компилятор не понимает required, зато понимает Obsolete — и не даст создать объект в обход проверки.'
    },
    {
      t: 'choice',
      q: 'Чему равно new Temp().C?',
      code: 'class Temp\n{\n    public int C { get; set => field = Math.Max(value, -273); } = -500;\n}',
      options: ['-500', '-273', '0', 'Не скомпилируется'],
      answer: 0,
      explain: 'Инициализатор свойства пишет прямо в скрытое поле (field), сеттер не вызывается. Проверка сработает только на присваивании C = ....'
    }
  ]
};
