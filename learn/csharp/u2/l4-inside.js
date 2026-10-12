/** C# глубже, раздел «Делегаты, события и замыкания», урок 4: как делегат устроен внутри. */
export default {
  id: 'cs.u2.l4',
  title: 'Делегаты изнутри',
  sub: 'Класс делегата, цепочки, исключения и явные add/remove',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Строка delegate — это целый класс',
      body: '<p>Объявление <code>delegate int Op(int a, int b);</code> — не «тип функции», а <b>класс</b>. Компилятор генерирует запечатанный класс <code>Op</code>, наследник <code>System.MulticastDelegate</code>, с четырьмя методами:</p><ul><li>конструктор <code>(object, IntPtr)</code> — объект и адрес метода;</li><li><code>Invoke(int a, int b)</code> — с той же сигнатурой, что у делегата;</li><li><code>BeginInvoke</code> и <code>EndInvoke</code> — асинхронный вызов в старом стиле.</li></ul><p>Тел у этих методов нет: они помечены <code>runtime managed</code>, код для них даёт CLR. <code>Func</code> и <code>Action</code> — такие же классы, просто уже объявленные в библиотеке.</p>',
      code: '.class public auto ansi sealed Op\n    extends [System.Runtime]System.MulticastDelegate\n{\n    .method public specialname rtspecialname instance void\n        .ctor(object, native int) runtime managed { }\n    .method public virtual instance int32\n        Invoke(int32 a, int32 b) runtime managed { }\n    // BeginInvoke и EndInvoke — так же, без тела\n}',
      deep: '<p>Вызов <code>op(2, 3)</code> компилятор переводит в <code>callvirt Op::Invoke</code>. JIT не вызывает Invoke как обычный метод: он читает из делегата объект и адрес кода и делает косвенный вызов — по цене это близко к виртуальному вызову. Встроить цель делегата JIT обычно не может; с динамическим PGO (.NET 8+) он иногда вставляет проверку «это тот самый метод» и прямой вызов — защищённую девиртуализацию делегатов.</p><p><code>BeginInvoke</code> в .NET Framework выполнял делегат в пуле потоков через инфраструктуру remoting. В .NET Core и новее метод остался в метаданных, но бросает <code>PlatformNotSupportedException</code>. Замена — <code>Task.Run(() =&gt; op(2, 3))</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Во что компилятор превращает строку op(2, 3), где op — переменная типа Op?',
      options: ['op.Invoke(2, 3)', 'op.DynamicInvoke(2, 3)', 'Прямой call целевого метода', 'op.BeginInvoke(2, 3, null, null)'],
      answer: 0,
      explain: 'Вызов делегата — это всегда его метод Invoke. Что окажется внутри делегата, компилятор не знает: это решается при запуске.',
      wrong: { 1: 'DynamicInvoke — медленный вызов через рефлексию с массивом аргументов. Компилятор сам его не использует.', 2: 'Какой метод лежит в делегате, станет известно только при запуске.' }
    },
    {
      t: 'learn',
      title: 'Внутри: объект и адрес кода',
      body: '<p>Экземпляр делегата — объект в куче. Два главных поля он наследует от <code>System.Delegate</code>:</p><ul><li><code>_target</code> — объект, на котором вызывать метод экземпляра;</li><li><code>_methodPtr</code> — адрес машинного кода метода.</li></ul><p>Снаружи их видно через свойства <code>Target</code> и <code>Method</code>. Для статического метода <code>Target</code> возвращает null. Создание делегата в IL — <code>ldftn</code> (взять адрес метода) и <code>newobj</code> конструктора: одна аллокация.</p>',
      code: 'class Greeter\n{\n    public string Name = "Аня";\n    public void Hello() => Console.WriteLine($"Привет, {Name}");\n}\n\nvar g = new Greeter();\nAction a = g.Hello;                    // newobj Action(g, адрес Hello)\nConsole.WriteLine(a.Target == g);      // True\nConsole.WriteLine(a.Method.Name);      // Hello',
      deep: '<p>У делегата на статический метод внутри хитрее: настоящий адрес лежит в <code>_methodPtrAux</code>, а в <code>_methodPtr</code> — маленький переходник (shuffle thunk), который сдвигает аргументы, ведь объекта-получателя нет. Свойство <code>Target</code> при этом отдаёт null. Из-за переходника делегат на статический метод вызывается чуть дороже, чем на метод экземпляра.</p><p>Поэтому компилятор C# делает лямбды без захвата методами экземпляра скрытого класса-синглтона <code>&lt;&gt;c</code> и кэширует сам делегат в статическом поле: повторное создание не аллоцирует. С C# 11 так же кэшируется и преобразование группы статического метода в делегат (<code>Func&lt;int, int&gt; f = Math.Abs;</code>).</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'Func<int, int> twice = x => x * 2;\nConsole.WriteLine(twice.Target is null);',
      options: ['False: Target — экземпляр скрытого класса <>c', 'True: лямбда без захвата компилируется в статический метод', 'False: Target — сам делегат twice', 'Не скомпилируется: у лямбды нет Target'],
      answer: 0,
      explain: 'Компилятор C# кладёт лямбды без захвата в методы экземпляра синглтона <>c: вызов делегата на метод экземпляра обходится без переходника для аргументов. Target — этот синглтон.',
      wrong: { 1: 'Логично, но компилятор нарочно так не делает: делегат на статический метод вызывается через переходник и чуть медленнее.' }
    },
    {
      t: 'learn',
      title: 'Цепочка — это новый объект',
      body: '<p><code>a += b</code> — это <code>a = (Action)Delegate.Combine(a, b)</code>. Combine не меняет ни <code>a</code>, ни <code>b</code>: делегаты <b>неизменяемы</b>. Он создаёт новый делегат, у которого внутри массив — <b>список вызова</b> (invocation list) из всех методов по порядку.</p><p><code>-=</code> — это <code>Delegate.Remove</code>: тоже новый объект, без последнего вхождения метода. Убрал последний метод — получил null.</p><p>Два следствия. Каждое <code>+=</code> — аллокация, а у цепочки ещё и массив. И копия делегата в другой переменной не видит новых подписок: она ссылается на старый объект.</p>',
      code: 'Action a = () => Console.Write("A");\nAction snapshot = a;\na += () => Console.Write("B");\n\na();          // AB\nsnapshot();   // A — старый объект не изменился\nConsole.WriteLine(a.GetInvocationList().Length);   // 2',
      deep: '<p>В <code>MulticastDelegate</code> цепочка хранится в полях <code>_invocationList</code> (массив <code>object[]</code> с делегатами) и <code>_invocationCount</code>. Combine с null возвращает второй аргумент без аллокации. При добавлении в конец рантайм может переиспользовать массив с запасом, если следующая ячейка в нём ещё свободна, — поэтому серия <code>+=</code> не копирует весь список каждый раз.</p><p>Неизменяемость делает вызов потокобезопасным: <code>handler?.Invoke()</code> работает с одним снимком цепочки, даже если другой поток прямо сейчас отписывается. Поэтому старый совет «скопируй событие в локальную переменную перед проверкой на null» сегодня сводится к <code>?.</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'Action log = () => Console.Write("1");\nAction copy = log;\nlog += () => Console.Write("2");\ncopy += () => Console.Write("3");\nlog();\ncopy();',
      options: ['1213', '123123', '1212', '12313'],
      answer: 0,
      explain: 'copy = log копирует ссылку на делегат из одного метода. Каждое += создаёт новую цепочку и записывает её только в свою переменную: log — это 1 и 2, copy — 1 и 3.',
      wrong: { 1: 'Так было бы, если бы += дописывал метод в общий объект. Но делегаты неизменяемы.' }
    },
    {
      t: 'learn',
      title: 'Исключение и результат в цепочке',
      body: '<p><code>Invoke</code> у цепочки — это цикл по списку вызова. Отсюда поведение, которое легко забыть:</p><ul><li><b>Исключение</b> во втором методе прерывает цикл. Третий и дальше <b>не вызываются</b>, а исключение улетает к тому, кто вызвал делегат.</li><li><b>Возвращаемое значение</b> — от последнего метода, результаты остальных выбрасываются. <code>ref</code>- и <code>out</code>-параметры каждый следующий метод видит уже изменёнными предыдущим.</li></ul><p>Нужно вызвать всех независимо или собрать все результаты — перебирай <code>GetInvocationList()</code> сам.</p>',
      code: 'EventHandler? saved = null;\nsaved += (s, e) => Console.WriteLine("в лог");\nsaved += (s, e) => throw new IOException("диск полон");\nsaved += (s, e) => Console.WriteLine("в кэш");   // при saved(...) не вызовется\n\nforeach (EventHandler h in saved.GetInvocationList())\n{\n    try { h(null, EventArgs.Empty); }\n    catch (Exception ex) { Console.WriteLine(ex.Message); }\n}'
    },
    {
      t: 'tapline',
      q: 'В какой строке Console.WriteLine не выполнится ни разу?',
      code: 'Action steps = () => Console.WriteLine("шаг 1");\nsteps += () => throw new InvalidOperationException();\nsteps += () => Console.WriteLine("шаг 3");\ntry { steps(); }\ncatch (InvalidOperationException) { Console.WriteLine("ошибка"); }\nConsole.WriteLine("конец");',
      answer: 2,
      explain: 'Цепочка вызывает методы по очереди: «шаг 1», потом исключение. Третий метод уже не вызывается — исключение вышло из Invoke. catch печатает «ошибка», затем «конец».'
    },
    {
      t: 'blanks',
      q: 'Собери результаты всех проверок, а не только последней',
      code: 'Func<string, bool> rules = IsNotEmpty;\nrules += IsShort;\nvar results = new List<bool>();\nforeach (Func<string, bool> r in rules.___())\n    results.Add(r.___("abc"));',
      tiles: ['GetInvocationList', 'Invoke', 'DynamicInvoke', 'Combine', 'BeginInvoke'],
      answer: ['GetInvocationList', 'Invoke'],
      explain: 'GetInvocationList возвращает массив делегатов по одному методу в каждом. Их Invoke отдаёт свой bool. DynamicInvoke вернул бы object — в List<bool> без приведения не положить, да и вызов через рефлексию медленный.'
    },
    {
      t: 'learn',
      title: 'Событие с явными add и remove',
      body: '<p>Обычное событие <code>public event EventHandler? Changed;</code> компилятор разворачивает в приватное поле-делегат и два метода-аксессора: <code>add_Changed</code> и <code>remove_Changed</code>. Их и вызывают <code>+=</code> и <code>-=</code> снаружи.</p><p>Аксессоры можно написать самому — как <code>get</code> и <code>set</code> у свойства. Тогда поле компилятор не создаёт, и где хранить подписчиков, решаешь ты: в одном словаре на все события, в другом объекте, в слабых ссылках.</p>',
      code: 'class Panel\n{\n    private readonly Dictionary<string, Delegate?> _handlers = new();\n\n    public event EventHandler? Resized\n    {\n        add => _handlers["Resized"] = Delegate.Combine(_handlers.GetValueOrDefault("Resized"), value);\n        remove => _handlers["Resized"] = Delegate.Remove(_handlers.GetValueOrDefault("Resized"), value);\n    }\n\n    protected void OnResized() =>\n        (_handlers.GetValueOrDefault("Resized") as EventHandler)?.Invoke(this, EventArgs.Empty);\n}',
      deep: '<p>Сгенерированный <code>add</code> у обычного события с C# 4 не берёт <code>lock</code>: в цикле читает поле, делает <code>Delegate.Combine</code> и пытается записать результат через <code>Interlocked.CompareExchange</code>, пока никто не вмешался. Подписка из разных потоков безопасна. В своих аксессорах о потоках заботишься сам — словарь в примере этого не даёт.</p><p>Зачем такое: у класса с сотней событий, на которые обычно никто не подписан, было бы по полю на каждое событие в каждом объекте. Элементы управления Windows Forms поэтому хранят подписчиков в одном <code>EventHandlerList</code>. В метаданных событие — запись <code>.event</code>, которая связывает имя с методами <code>add_</code> и <code>remove_</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Какая строка внутри класса Panel не скомпилируется?',
      code: 'class Panel\n{\n    private EventHandler? _resized;\n\n    public event EventHandler? Resized\n    {\n        add => _resized += value;\n        remove => _resized -= value;\n    }\n\n    void Raise()\n    {\n        _resized?.Invoke(this, EventArgs.Empty);\n        Resized?.Invoke(this, EventArgs.Empty);\n    }\n}',
      answer: 13,
      explain: 'У события с явными аксессорами нет поля, к которому вело бы имя Resized. Даже внутри класса оно годится только слева от += и -= (ошибка CS0079). Вызывают делегат, который хранишь сам, — _resized.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['_target', 'Объект, на котором вызывать метод'],
        ['_methodPtr', 'Адрес кода метода'],
        ['Delegate.Combine', 'Новый делегат со списком вызова'],
        ['GetInvocationList()', 'Массив делегатов цепочки по одному'],
        ['add и remove', 'Аксессоры, которые вызывают += и -=']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['+= на делегате создаёт новый объект, старый не меняется', 'Если второй метод цепочки бросил исключение, третий всё равно выполнится', 'Класс делегата наследует MulticastDelegate и запечатан', 'В .NET 8 BeginInvoke запускает делегат в пуле потоков', 'Событие с явными add и remove нельзя вызвать по имени'],
      answer: [0, 2, 4],
      explain: 'Исключение прерывает цепочку: остальные методы не вызываются. BeginInvoke в .NET Core и новее бросает PlatformNotSupportedException — вместо него Task.Run.'
    }
  ]
};
