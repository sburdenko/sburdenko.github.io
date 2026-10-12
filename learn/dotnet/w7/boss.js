/** .NET изнутри, финал раздела «Дженерики и рефлексия изнутри». */
export default {
  id: 'dotnet.w7.boss',
  title: 'Финал: дженерики и рефлексия изнутри',
  sub: '__Canon, словари, токены, Invoke, call site и генераторы',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Метод Echo<T>(T x) вызывают с int, double, string и Uri. Сколько вариантов его машинного кода сделает JIT (без учёта перекомпиляции по уровням)?',
      options: ['3', '4', '2', '1'],
      answer: 0,
      explain: 'Echo<int> и Echo<double> — по своей копии, string и Uri делят канонический Echo<__Canon>. Итого три.',
      wrong: { 1: 'string и Uri — ссылочные типы, для обоих код один: Echo<__Canon>.' }
    },
    {
      t: 'tapline',
      q: 'Какая строка напечатает False?',
      code: 'class Cache<T>\n{\n    public static readonly Guid Id = Guid.NewGuid();\n}\n\nvar a = Cache<string>.Id;\nvar b = Cache<object>.Id;\nvar c = Cache<string>.Id;\nConsole.WriteLine(a == c);\nConsole.WriteLine(a == b);',
      answer: 9,
      explain: 'Cache<string> и Cache<object> исполняют общий код, но у каждого свой блок статики и свой статический конструктор. Значит, и Guid у них разные. А два чтения Cache<string>.Id дают одно и то же значение.'
    },
    {
      t: 'multi',
      q: 'T — ссылочный тип, код общий (__Canon). Каким операциям внутри метода нужен поиск в словаре дженерика? Отметь все.',
      options: ['new List<T>()', 'o is T', 'return default(T);', 'typeof(T)', 'if (x == null)'],
      answer: [0, 1, 3],
      explain: 'Создать List<T>, проверить тип и получить Type можно только зная точный T. default(T) для ссылочного T — просто null, а сравнение с null не зависит от типа.'
    },
    {
      t: 'choice',
      q: 'Библиотека в версии 2 поменяла void Log(string s) на void Log(string s, int level = 0). Старое приложение не пересобрали. Что будет при вызове Log("hi")?',
      options: ['MissingMethodException: в MemberRef приложения сигнатура с одним параметром', 'Работает: level подставится как 0', 'Предупреждение при запуске, вызов пройдёт', 'Рантайм найдёт ближайшую перегрузку по имени'],
      answer: 0,
      explain: 'Токен MemberRef хранит имя и полную сигнатуру. Метода Log(string) в новой сборке нет, а значение по умолчанию подставляет компилятор вызывающего кода — старое приложение о нём не знает.',
      wrong: { 1: 'Значение 0 подставил бы компилятор при сборке приложения. Приложение собрано со старой версией, и в его IL вызов метода с одним параметром.' }
    },
    {
      t: 'order',
      q: 'Расставь способы вызвать метод от самого быстрого к самому медленному (в целом, для метода с параметрами int)',
      items: ['Прямой вызов', 'Делегат из CreateDelegate', 'MethodInvoker.Invoke (.NET 8)', 'MethodInfo.Invoke с закэшированным MethodInfo', 'GetMethod по имени и Invoke на каждом вызове'],
      explain: 'Прямой вызов можно встроить. Делегат — косвенный вызов без проверок. MethodInvoker экономит массив, но упаковывает аргументы. Invoke ещё и создаёт массив. Поиск по имени каждый раз добавляет работу кэша рефлексии.'
    },
    {
      t: 'match',
      q: 'Соедини часть dynamic и её роль',
      pairs: [
        ['L0', 'Правило в делегате site.Target'],
        ['L1', 'До 10 недавних правил этого call site'],
        ['L2', 'Общий кэш правил binder'],
        ['Binder', 'Разбор вызова по правилам C# при запуске'],
        ['CallSite<T>', 'Объект в скрытом статическом поле на каждую операцию']
      ]
    },
    {
      t: 'multi',
      q: 'Что верно про source generators и Native AOT? Отметь все.',
      options: ['Генератор только добавляет код, менять существующий не может', 'JSON-генератор убирает разбор типов рефлексией при запуске', 'В Native AOT MakeGenericType со структурой, не встреченной при компиляции, может упасть', 'Генератор запускается при первом вызове метода'],
      answer: [0, 1, 2],
      explain: 'Генератор работает внутри компилятора и только добавляет файлы, поэтому опирается на partial. Без JIT копию кода для нового значимого T создать некому.'
    },
    {
      t: 'blanks',
      q: 'Достань приватное поле _count без рефлексии (.NET 8)',
      code: 'class Counter { private int _count; }\n\n[___(UnsafeAccessorKind.Field, Name = "_count")]\nstatic ___ ref int CountOf(Counter c);',
      tiles: ['UnsafeAccessor', 'extern', 'DllImport', 'abstract', 'partial'],
      answer: ['UnsafeAccessor', 'extern'],
      explain: 'static extern метод с [UnsafeAccessor] рантайм при JIT заменяет прямым доступом к полю: ни MethodInfo, ни упаковки, и работает в Native AOT.'
    }
  ]
};
