/** C# глубже, раздел «Значимые типы до конца», урок 1: упаковка, которой не видно в коде. */
export default {
  id: 'cs.u7.l1',
  title: 'Упаковка, которой не видно',
  sub: 'Интерфейсы, GetType, методы ValueType и constrained-вызов',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Где компилятор ставит box без спроса',
      body: '<p>Правило из курса «.NET изнутри» простое: значение упаковывается, когда его кладут туда, где ждут ссылку, — в <code>object</code> или интерфейс. Там упаковка видна: слева стоит <code>object o =</code>.</p><p>Сложнее, когда ссылку ждёт не переменная, а <b>метод</b>. Метод, объявленный в классе (<code>Object</code>, <code>ValueType</code>), получает <code>this</code> как ссылку на объект в куче. У структуры такой ссылки нет, и чтобы вызвать такой метод, нужна коробка. В C# этого не видно — видно в IL (<code>box</code>) и в счётчике аллокаций.</p><p>В этом уроке — четыре места, где это случается: вызов через интерфейс, <code>GetType</code>, непереопределённые <code>ToString</code>/<code>Equals</code>/<code>GetHashCode</code> и перечислители.</p>'
    },
    {
      t: 'learn',
      title: 'Интерфейс у структуры: три способа вызвать',
      body: '<p>Структура может реализовать интерфейс, но коробка появится не всегда. Решает то, <b>через что</b> идёт вызов:</p><ul><li>через переменную самой структуры — обычный <code>call</code> её метода, коробки нет;</li><li>через переменную интерфейсного типа — значение сначала упаковано, вызов идёт по коробке;</li><li>в дженерике с ограничением <code>where T : IShape</code> — коробки нет, о чём ниже.</li></ul><p>Если метод реализован <b>явно</b> (<code>double IShape.Area()</code>), через структуру его не вызвать: придётся привести к интерфейсу, а это упаковка.</p>',
      code: 'interface IShape { double Area(); }\n\nstruct Square : IShape\n{\n    public double Side;\n    public double Area() => Side * Side;\n}\n\nvar s = new Square { Side = 2 };\ns.Area();          // call Square::Area — без коробки\nIShape sh = s;     // box: копия s уехала в кучу\nsh.Area();         // вызов по коробке через интерфейс',
      deep: '<p>Методы структуры JIT считает запечатанными: наследников у структуры нет, поэтому вызов <code>s.Area()</code> — прямой и легко встраивается. Вызов через <code>IShape</code> — интерфейсная диспетчеризация по указателю на тип коробки.</p><p>Явной реализацией прячут редко нужные члены: так <code>int</code> прячет методы <code>IConvertible</code> (<code>ToBoolean</code>, <code>ToChar</code>…). Вызвать их можно, но только через интерфейс — то есть с упаковкой, если JIT её не уберёт.</p>'
    },
    {
      t: 'multi',
      q: 'Temp — структура, реализует IComparable<Temp>, переопределяет GetHashCode, но не ToString. Где будет упаковка? Отметь все.',
      options: [
        'IComparable<Temp> c = t;',
        't.CompareTo(other);',
        't.ToString();',
        't.GetHashCode();',
        'list.Sort();  // List<Temp>'
      ],
      answer: [0, 2],
      explain: 'Интерфейсная переменная требует коробку. ToString не переопределён — вызов уходит в ValueType.ToString, которому нужен this-объект. CompareTo и GetHashCode свои — прямой вызов. List<Temp>.Sort идёт через Comparer<Temp>.Default и дженерик-код без коробок.'
    },
    {
      t: 'learn',
      title: 'Непереопределённые ToString, Equals, GetHashCode',
      body: '<p>У структуры эти три метода есть всегда: их даёт базовый класс <code>System.ValueType</code>. Но это методы класса, им нужен <code>this</code>-объект.</p><p>Вызов <code>p.ToString()</code> компилятор оформляет через префикс <code>constrained.</code>. При запуске рантайм смотрит: если <b>структура переопределила</b> метод — вызывает его прямо, без коробки. Если нет — упаковывает значение и вызывает версию <code>ValueType</code>.</p><p>С <code>Equals(object)</code> ещё хуже: аргумент тоже <code>object</code>, его упакуют в любом случае. А сам <code>ValueType.Equals</code>, как увидишь в уроке 3, может пойти через отражение.</p>',
      code: 'struct P { public int X, Y; }   // ничего не переопределено\n\nvar a = new P { X = 1 };\nvar b = new P { X = 1 };\na.ToString();    // коробка a → ValueType.ToString → "P"\na.Equals(b);     // коробка b (аргумент object) и коробка a (this)',
      deep: '<p>IL для <code>a.ToString()</code>:</p><p><code>ldloca.s a</code><br><code>constrained. P</code><br><code>callvirt instance string System.Object::ToString()</code></p><p>По спецификации ECMA-335 префикс <code>constrained.</code> делает так: если тип значимый и сам реализует метод — прямой <code>call</code> по адресу; если нет — <code>box</code> и виртуальный вызов. Решение принимает JIT при компиляции метода, поэтому переопределённый <code>ToString</code> у структуры ничего не стоит сверх самого метода.</p>'
    },
    {
      t: 'choice',
      q: 'P — структура из двух int, ничего не переопределяет. Сколько коробок создаёт по IL строка a.Equals(b)?',
      options: ['2', '0', '1', '3'],
      answer: 0,
      explain: 'Аргумент b упаковывается, потому что параметр Equals — object. И сам a упаковывается, потому что Equals не переопределён и его this должен быть объектом ValueType. Две коробки на одно сравнение.',
      wrong: {
        1: 'Это верно только для структуры, которая реализует Equals(P) — тогда перегрузка выберет его, и коробок нет.',
        2: 'Аргумент — не единственная коробка: метод ValueType.Equals вызывается на объекте, значит, упакуют и a.'
      }
    },
    {
      t: 'learn',
      title: 'GetType: всегда через коробку',
      body: '<p><code>GetType</code> — не виртуальный метод <code>Object</code>: он читает указатель на тип из заголовка объекта (раздел «Устройство типа»). У структуры в стеке нет ни заголовка, ни указателя на тип. Поэтому для <code>s.GetType()</code> компилятор сначала пишет <code>box</code>, а потом <code>call Object::GetType</code>.</p><p>Тип структуры известен уже при компиляции, так что вместо <code>s.GetType()</code> честнее писать <code>typeof(Square)</code>. В дженерике, где тип ещё не известен, — <code>typeof(T)</code>: для значимых <code>T</code> JIT компилирует отдельный код, и <code>typeof(T)</code> там — просто константа.</p>',
      code: 'Square s = default;\nType t1 = s.GetType();     // IL: box Square; call GetType\nType t2 = typeof(Square);  // IL: ldtoken — без объектов',
      deep: '<p>Современный JIT распознаёт пару <code>box</code> + <code>GetType</code> для точно известного типа и часто сворачивает её в константу без аллокации. Это оптимизация, а не гарантия: в отладочной сборке и на старом рантайме коробка будет. Особенно популярна проверка <code>value.GetType() == typeof(X)</code> — её JIT тоже умеет складывать.</p>'
    },
    {
      t: 'learn',
      title: 'Вызов через интерфейс меняет коробку, а не оригинал',
      body: '<p>Если метод интерфейса <b>меняет</b> структуру, упаковка превращается из лишней аллокации в ошибку логики. Коробка — копия. Метод меняет поле внутри коробки, а исходная переменная остаётся как была.</p><p>Особенно коварно приведение «на лету»: <code>((ICounter)c).Inc()</code>. Создаётся коробка, в ней меняется счётчик, и коробка тут же становится мусором. Компилятор не предупредит.</p>',
      code: 'interface ICounter { void Inc(); int Value { get; } }\n\nstruct Counter : ICounter\n{\n    public int Value { get; private set; }\n    public void Inc() => Value++;\n}'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var c = new Counter();\nICounter i = c;\ni.Inc();\n((ICounter)c).Inc();\nc.Inc();\nConsole.WriteLine($"{c.Value} {i.Value}");',
      options: ['1 1', '3 3', '2 1', '1 2'],
      answer: 0,
      explain: 'i — своя коробка с копией: после i.Inc() в ней 1. ((ICounter)c).Inc() создаёт ещё одну коробку и меняет её — результат теряется. c.Inc() — прямой вызов на самой переменной: c.Value = 1.',
      wrong: {
        1: 'Так было бы, если бы Counter был классом: тогда c, i и приведение указывали бы на один объект.',
        2: 'Приведение к ICounter не даёт ссылку на c — оно упаковывает копию. Изменение уходит в коробку, которую никто не хранит.'
      }
    },
    {
      t: 'learn',
      title: 'Дженерик с ограничением: интерфейс без коробки',
      body: '<p>Для значимого <code>T</code> JIT компилирует отдельную версию метода (раздел «Дженерики»). Вызов <code>x.Inc()</code> при <code>where T : ICounter</code> компилятор пишет как <code>constrained. T callvirt ICounter::Inc</code>. Для <code>T = Counter</code> это превращается в прямой вызов <code>Counter.Inc</code> на самой переменной — <b>без коробки</b>.</p><p>Две ловушки рядом:</p><ul><li>параметр без <code>ref</code> — метод меняет свою копию, а не переменную вызывающего;</li><li>необобщённый интерфейс: <code>where T : IComparable</code> не спасает, у <code>CompareTo(object)</code> аргумент всё равно упакуется. Нужен <code>IComparable&lt;T&gt;</code>.</li></ul>',
      code: 'static void BumpRef<T>(ref T x) where T : ICounter => x.Inc(); // меняет оригинал\nstatic void Bump<T>(T x) where T : ICounter => x.Inc();         // меняет копию\nstatic void BumpI(ICounter x) => x.Inc();                       // коробка при вызове',
      deep: '<p>Тот же механизм у <code>using</code> и <code>foreach</code>: <code>Dispose</code> у структуры-ресурса и <code>MoveNext</code> у структуры-перечислителя компилятор вызывает без упаковки, хотя формально это методы интерфейсов <code>IDisposable</code> и <code>IEnumerator&lt;T&gt;</code>.</p><p>Для общих (shared) инстанциаций по ссылочным <code>T</code> тот же <code>constrained.</code> просто превращается в обычный <code>callvirt</code>: один IL работает для обоих случаев.</p>'
    },
    {
      t: 'blanks',
      q: 'Допиши ограничение, чтобы Max<int> сравнивал без упаковки',
      code: 'static T Max<T>(T a, T b) where T : ___\n    => a.CompareTo(b) >= 0 ? a : b;',
      tiles: ['IComparable<T>', 'IComparable', 'struct', 'IEquatable<T>'],
      answer: ['IComparable<T>'],
      explain: 'С IComparable<T> вызывается CompareTo(T): constrained-вызов на a и аргумент b типа T — ни одной коробки. С необобщённым IComparable код тоже соберётся, но b уйдёт в CompareTo(object) и упакуется на каждом сравнении.'
    },
    {
      t: 'match',
      q: 'Соедини выражение и что в нём происходит. list — это List<int>.',
      pairs: [
        ['foreach (var x in list)', 'Перечислитель-структура, без кучи'],
        ['foreach (var x in (IEnumerable<int>)list)', 'Перечислитель упакован в кучу'],
        ['x.CompareTo(y) при where T : IComparable<T>', 'constrained-вызов без коробки'],
        ['p.ToString() у структуры без override', 'Коробка ради ValueType.ToString'],
        ['flags.HasFlag(Opt.A) в .NET 8', 'Интринсик JIT, коробок нет']
      ]
    },
    {
      t: 'learn',
      title: 'Тогда и сейчас: JIT убирает часть коробок',
      body: '<p>То, что <code>box</code> есть в IL, ещё не значит, что в куче появится объект. JIT со временем научился убирать частые случаи:</p><ul><li><code>Enum.HasFlag</code> в .NET Framework упаковывал и значение, и аргумент. С .NET Core 2.1 это интринсик JIT — одна битовая операция;</li><li><code>box</code> сразу за которым идёт распаковка или проверка типа JIT сокращает;</li><li>в .NET 9–10 анализ «объект не покидает метод» (escape analysis) распространили на коробки: в части случаев коробка размещается на стеке или исчезает.</li></ul><p>Отсюда правило: о коробках в горячем коде судят <b>по замеру</b>, а не по IL. И наоборот: отсутствие видимого <code>object</code> в коде не значит, что коробок нет.</p>',
      deep: '<p>Замер без профайлера: <code>GC.GetAllocatedBytesForCurrentThread()</code> до и после цикла. В BenchmarkDotNet — атрибут <code>[MemoryDiagnoser]</code>, колонка Allocated. Оптимизации JIT работают в Release и после повышения уровня (tiered compilation), так что мерить надо после прогрева и не в Debug.</p>'
    },
    {
      t: 'choice',
      q: 'Нужно понять, упаковывает ли горячий цикл значения на .NET 9. Что надёжнее?',
      options: [
        'Замерить выделенную память в Release после прогрева',
        'Найти в IL все инструкции box',
        'Поискать в C#-коде приведения к object',
        'Запустить в Debug под отладчиком и посмотреть кучу'
      ],
      answer: 0,
      explain: 'IL показывает, где коробка может быть, но JIT часть из них убирает. В C#-коде многие коробки не видны вовсе. Debug отключает оптимизации и покажет коробки, которых в Release нет. Решает только замер аллокаций в реальной конфигурации.',
      wrong: { 1: 'box в IL — верхняя оценка. После оптимизаций JIT реальных аллокаций может быть меньше.' }
    }
  ]
};
