/** C# глубже, раздел «Параметры, свойства, кортежи», урок 3: свойства, индексаторы, init/required, анонимные типы, ValueTuple и деконструкция. */
export default {
  id: 'cs.u9.l3',
  title: 'Свойства и кортежи изнутри',
  sub: 'get_/set_, field, init, анонимные типы и ValueTuple',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Свойство — это два метода',
      body: '<p>Для CLR свойства как «переменной» нет. Есть методы <code>get_Age()</code> и <code>set_Age(int)</code> плюс запись в метаданных, которая связывает их под именем <code>Age</code> — её читают компилятор, отладчик и рефлексия.</p><p>У автосвойства (auto-property) компилятор ещё заводит закрытое поле <code>&lt;Age&gt;k__BackingField</code>. Угловые скобки не пускают это имя в C#, так что обратиться к полю напрямую нельзя.</p><p>Обращение <code>p.Age = 5</code> — это <code>call set_Age</code>. Простой геттер JIT в Release встраивает, и он стоит как чтение поля. А вот свой метод с именем <code>get_Age</code> рядом со свойством <code>Age</code> объявить нельзя — имя занято (CS0082).</p>',
      code: 'public int Age { get; set; }\n\n// что сделал компилятор\nprivate int <Age>k__BackingField;   // [CompilerGenerated]\npublic int get_Age() => <Age>k__BackingField;\npublic void set_Age(int value) => <Age>k__BackingField = value;',
      deep: '<p>Сценарий «версия 2»: поле <code>public int Count;</code> превратили в свойство <code>public int Count { get; set; }</code>. Исходники вызывающих компилируются почти без изменений, но бинарно это <b>другой член</b>: старый IL делает <code>ldfld Count</code>, а поля больше нет — <code>MissingFieldException</code>. Ещё ломается исходник там, где поле передавали как <code>ref</code>/<code>out</code>: свойство — не переменная. Поэтому в публичных типах поля не выставляют, даже «пока простые».</p>'
    },
    {
      t: 'choice',
      q: 'В библиотеке v2 публичное поле Count стало свойством. Приложение собрано против v1, DLL просто заменили. Что будет при чтении lib.Count?',
      options: ['MissingFieldException', 'Всё работает: синтаксис чтения тот же', 'Прочитается 0', 'Ошибка компиляции'],
      answer: 0,
      explain: 'IL приложения читает поле инструкцией ldfld по имени и типу. В v2 на этом месте методы get_Count/set_Count, поля нет. Синтаксис в C# одинаковый, а скомпилированный код — разный.',
      wrong: { 3: 'Приложение уже скомпилировано, ошибка будет при запуске. После пересборки всё скомпилируется.' }
    },
    {
      t: 'learn',
      title: 'field (C# 14): своя логика без своего поля',
      body: '<p>Раньше, чтобы добавить в сеттер одну проверку, приходилось отказываться от автосвойства и объявлять поле вручную. В C# 14 внутри аксессора есть контекстное слово <code>field</code> — это скрытое поле, которое заведёт компилятор.</p><ul><li>Можно смешивать: один аксессор автоматический, другой с телом.</li><li>Работает и в <code>init</code>.</li><li>Инициализатор свойства пишет <b>прямо в поле</b>, минуя сеттер.</li></ul><p>Ломающее изменение: если в типе уже есть член с именем <code>field</code>, внутри аксессоров слово теперь означает скрытое поле. К своему члену обращайся через <code>this.field</code> или <code>@field</code>.</p>',
      code: 'public string Name\n{\n    get;\n    set => field = value.Trim();\n}\n\npublic int Percent\n{\n    get;\n    set => field = Math.Clamp(value, 0, 100);\n}'
    },
    {
      t: 'choice',
      q: 'Чему равно new User().Name?',
      code: 'class User\n{\n    public string Name { get; set => field = value.Trim(); } = "  Bob  ";\n}',
      options: ['"  Bob  " — с пробелами', '"Bob"', 'null', 'Не скомпилируется: у свойства с телом сеттера нет инициализатора'],
      answer: 0,
      explain: 'Инициализатор свойства записывает значение прямо в скрытое поле, сеттер не вызывается. Trim сработает только при присваивании через Name = ....',
      wrong: { 3: 'В C# 14 инициализатор разрешён у любого свойства, для которого компилятор заводит поле, — и при field тоже.' }
    },
    {
      t: 'learn',
      title: 'init и required: что попадает в метаданные',
      body: '<p>Что такое <code>init</code> и <code>required</code>, ты видел в разделе «Современный C#». Теперь — как это устроено.</p><p><b>init</b> — это обычный метод <code>set_Name</code>, но тип его результата помечен <code>modreq(IsExternalInit)</code>. modreq — обязательный модификатор: компилятор, который его не понимает, такой метод вызвать откажется. Вот почему старый C# не может «обойти» init. Рантайм же ничего не проверяет: через рефлексию init-свойство меняется и после создания.</p><p><b>required</b> — атрибут <code>RequiredMemberAttribute</code> на члене и на типе. Конструкторы типа получают <code>[Obsolete]</code> с флагом ошибки и <code>CompilerFeatureRequired("RequiredMembers")</code>: новый компилятор понимает и проверяет инициализатор, старый просто не даст вызвать конструктор.</p>',
      code: 'public class Order\n{\n    public required string Customer { get; init; }\n\n    public Order() { }\n\n    [SetsRequiredMembers]   // «я задаю всё сам» — проверка снимается\n    public Order(string customer) => Customer = customer;\n}',
      deep: '<p><code>required</code> проверяется <b>только компилятором</b> у вызова <code>new</code>. Десериализатор, рефлексия, <code>Activator.CreateInstance</code> обходят его. System.Text.Json с .NET 7 сам учитывает <code>required</code> и бросает исключение, если в JSON нет свойства, — но это решение сериализатора, а не CLR.</p><p>Сценарий «версия 2»: добавить <code>required</code>-член в уже выпущенный тип — сломать исходники всех, кто создаёт его через <code>new</code> без этого члена.</p>'
    },
    {
      t: 'multi',
      q: 'Что компилятор делает для класса Order с членом public required string Customer { get; init; }? Отметь все.',
      options: [
        'Ставит RequiredMemberAttribute на свойство',
        'Ставит RequiredMemberAttribute на сам тип Order',
        'Помечает конструкторы Order атрибутом Obsolete для старых компиляторов',
        'Добавляет в конструктор проверку, что Customer не null',
        'Помечает set_Customer модификатором modreq(IsExternalInit)'
      ],
      answer: [0, 1, 2, 4],
      explain: 'Всё это — метаданные для компилятора. Проверки во время работы нет: если обойти new (рефлексией или десериализатором), Customer останется null.'
    },
    {
      t: 'learn',
      title: 'Индексатор — свойство по имени Item',
      body: '<p><code>this[int i]</code> компилируется в свойство с параметром по имени <b>Item</b>: методы <code>get_Item(int)</code> и <code>set_Item(int, T)</code>. На тип вешается <code>[DefaultMember("Item")]</code> — по нему VB и рефлексия понимают, что это индексатор по умолчанию. Другое имя задаёт <code>[IndexerName("Cell")]</code>.</p><p>Индексаторы перегружаются по типам параметров, как методы. Индексатор может возвращать <code>ref T</code> — так сделано у <code>Span&lt;T&gt;</code>.</p><p>Бесплатный бонус: если у типа есть <code>Length</code> или <code>Count</code> и индексатор по <code>int</code>, работают <code>^1</code> — компилятор сам перепишет его в <code>[Count - 1]</code>. А с методом <code>Slice(int, int)</code> заработают диапазоны <code>[1..3]</code>.</p>',
      code: 'public class Grid\n{\n    private readonly int[] _cells = new int[9];\n    public int Count => _cells.Length;\n    public ref int this[int i] => ref _cells[i];\n}\n\nvar g = new Grid();\ng[^1] = 7;   // компилятор: g[g.Count - 1]'
    },
    {
      t: 'learn',
      title: 'Анонимный тип — класс, который пишет компилятор',
      body: '<p><code>new { Name = "Ann", Age = 30 }</code> — компилятор создаёт <b>internal sealed class</b> с именем вроде <code>&lt;&gt;f__AnonymousType0`2</code>, обобщённый по типам свойств. В нём:</p><ul><li>свойства только для чтения;</li><li><code>Equals</code> и <code>GetHashCode</code> по значениям всех свойств;</li><li><code>ToString</code> вида <code>{ Name = Ann, Age = 30 }</code>.</li></ul><p>Одинаковые имена, типы и <b>порядок</b> свойств в одной сборке — один и тот же тип. Другой порядок — уже другой тип. С C# 10 работает <code>with</code>. Выйти из метода анонимный тип может только как <code>object</code> или <code>dynamic</code> — у него нет имени в C#.</p>',
      deep: '<p>Это ссылочный тип: каждое <code>new { }</code> — объект в куче. Оператор <code>==</code> у анонимного типа не переопределён и сравнивает ссылки, а <code>Equals</code> — значения. В LINQ to Objects анонимный тип в <code>GroupBy</code> и <code>Distinct</code> работает как составной ключ именно благодаря этому <code>Equals</code>/<code>GetHashCode</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var a = new { X = 1, Y = 2 };\nvar b = new { X = 1, Y = 2 };\nvar c = new { Y = 2, X = 1 };\nConsole.Write($"{a.Equals(b)} {a == b} {a.Equals(c)}");',
      options: ['True False False', 'True True True', 'True True False', 'False False False'],
      answer: 0,
      explain: 'a и b — один анонимный тип, Equals сравнивает значения: True. == не переопределён и сравнивает ссылки: False. c — другой тип (другой порядок свойств), Equals с ним: False.'
    },
    {
      t: 'learn',
      title: 'ValueTuple: изменяемая структура без имён',
      body: '<p><code>(string Name, int Age)</code> — это <code>System.ValueTuple&lt;string, int&gt;</code>: <b>изменяемая структура</b> с публичными <b>полями</b> <code>Item1</code>, <code>Item2</code>. После седьмого элемента — поле <code>Rest</code> с вложенным кортежем. Не путай со старым <code>System.Tuple</code> — тот класс, в куче и неизменяемый.</p><p>Имена <code>Name</code> и <code>Age</code> существуют <b>только для компилятора</b>. В IL везде <code>Item1</code>/<code>Item2</code>. Чтобы имена пережили границу сборки, в сигнатуру метода, поля или свойства компилятор пишет атрибут <code>[TupleElementNames]</code>.</p><p>Сравнение <code>==</code> (C# 7.3) идёт поэлементно и имена не учитывает.</p>',
      code: '(int min, int max) MinMax(int[] a) => (a.Min(), a.Max());\n\n// в метаданных:\n// [return: TupleElementNames(new[] { "min", "max" })]\n// ValueTuple<int, int> MinMax(int[] a)',
      deep: '<p>Всё, что смотрит рефлексией, имён не видит. System.Text.Json по умолчанию не сериализует поля, поэтому кортеж превращается в <code>{}</code>, а с <code>IncludeFields</code> — в <code>{"Item1":...,"Item2":...}</code>. Для DTO и публичных контрактов бери record.</p><p>Сценарий «версия 2»: переименовать элементы кортежа в возвращаемом типе — бинарно безопасно (поменялся только атрибут), но ломает исходники тех, кто обращался по старым именам.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var t = (Name: "Ann", Age: 30);\nforeach (var f in t.GetType().GetFields())\n    Console.Write(f.Name + " ");',
      options: ['Item1 Item2', 'Name Age', 'Ничего: у кортежа свойства, а не поля', 'Rest'],
      answer: 0,
      explain: 'Имена Name и Age есть только у компилятора. Тип во время работы — ValueTuple<string, int>, у него публичные поля Item1 и Item2.'
    },
    {
      t: 'learn',
      title: 'Деконструкция и Deconstruct',
      body: '<p><code>var (name, age) = person;</code> компилятор превращает в вызов метода <code>Deconstruct</code> с <code>out</code>-параметрами. Метод ищется по имени и числу параметров — экземплярный или метод расширения. Интерфейса нет, это соглашение (как <code>GetEnumerator</code> у <code>foreach</code>).</p><p>Кортежи деконструируются без метода — компилятор берёт поля напрямую. Позиционные record генерируют <code>Deconstruct</code> сами, у <code>KeyValuePair</code> он тоже есть. Позиционный шаблон <code>p is (0, var y)</code> использует тот же <code>Deconstruct</code>.</p><p>Обмен <code>(a, b) = (b, a)</code> компилятор обычно раскладывает во временные переменные, кортеж при этом не создаётся.</p>',
      code: 'var (x, _) = new Point { X = 3, Y = 4 };   // _ — отбросить Y\n\npublic readonly struct Point\n{\n    public int X { get; init; }\n    public int Y { get; init; }\n    public void Deconstruct(out int x, out int y) { x = X; y = Y; }\n}'
    },
    {
      t: 'blanks',
      q: 'Научи класс Size деконструироваться: var (w, h) = size;',
      code: 'public void ___(___ int width, ___ int height)\n{\n    width = Width;\n    height = Height;\n}',
      tiles: ['Deconstruct', 'out', 'out', 'ref', 'in', 'Destruct'],
      answer: ['Deconstruct', 'out', 'out'],
      explain: 'Компилятор ищет метод с точным именем Deconstruct и out-параметрами по числу переменных слева. ref или in не подойдут.'
    }
  ]
};
