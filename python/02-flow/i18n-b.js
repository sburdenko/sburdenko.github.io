/** PY-02 texts, chapters 06–10 and quizzes. */
export const CH_B = {
  /* ---------- 06 arguments ---------- */
  'ch.arguments.h2': { en: 'Arguments', ru: 'Аргументы' },
  'ch.arguments.short': { en: 'Positional, keyword, defaults, *args, **kwargs — and the mutable-default trap.', ru: 'Позиционные, именованные, по умолчанию, *args, **kwargs — и ловушка изменяемого значения по умолчанию.' },
  'ch.arguments.lede': { en: 'Arguments are matched to parameters by <b>position</b> first, then by <b>name</b>; what is missing takes its default; what is extra lands in <code>*extras</code> or <code>**tags</code>.', ru: 'Аргументы сопоставляются с параметрами сначала по <b>позиции</b>, потом по <b>имени</b>; чего не хватает — берётся по умолчанию; что лишнее — попадает в <code>*extras</code> или <code>**tags</code>.' },
  'ch.arguments.body': {
    en: '<p>Read the six calls in the rig. <code>craft("sword")</code>: count takes its default 1, extras is an empty tuple, tags an empty dict. <code>craft("arrow", 20, "feather", "flint")</code>: the two leftovers go into <code>extras</code> as a tuple. <code>color</code> sits after <code>*extras</code>, so it can only be given by name — a <b>keyword-only</b> parameter. <code>craft(count=3, item="gem")</code>: by name, order does not matter. Unknown names like <code>rare=True</code> collect in <code>tags</code>.</p>',
    ru: '<p>Прочитай шесть вызовов на стенде. <code>craft("sword")</code>: count берёт своё значение по умолчанию 1, extras — пустой кортеж, tags — пустой словарь. <code>craft("arrow", 20, "feather", "flint")</code>: два лишних уходят в <code>extras</code> кортежем. <code>color</code> стоит после <code>*extras</code>, поэтому передаётся только по имени — <b>keyword-only</b> параметр. <code>craft(count=3, item="gem")</code>: по имени порядок не важен. Незнакомые имена вроде <code>rare=True</code> собираются в <code>tags</code>.</p>',
  },
  'ch.arguments.body2': {
    en: '<p>The most famous Python trap. Defaults are evaluated <b>once</b>, when <code>def</code> runs — look at the memory picture: the function object carries one list as its default, and every call without a bag appends to <i>that same list</i>. So the second call shows two items. The fix is the idiom <code>bag=None</code> plus <code>if bag is None: bag = []</code>, which creates a fresh list per call.</p>',
    ru: '<p>Самая известная ловушка Python. Значения по умолчанию вычисляются <b>один раз</b>, когда выполняется <code>def</code> — смотри на картинку памяти: объект-функция несёт один список как значение по умолчанию, и каждый вызов без bag дописывает в <i>тот же список</i>. Поэтому второй вызов показывает два предмета. Лекарство — идиома <code>bag=None</code> плюс <code>if bag is None: bag = []</code>, которая создаёт свежий список на каждый вызов.</p>',
  },
  'ch.arguments.hood': {
    en: '<p>Binding order: positional arguments fill parameters left to right; <code>*args</code> swallows the rest; keyword arguments fill by name; <code>**kwargs</code> swallows unknown names; then defaults fill the gaps; any gap left is <code>TypeError: missing required positional argument</code>. A bare <code>*</code> in the signature (<code>def f(a, *, b)</code>) makes everything after it keyword-only; a <code>/</code> (<code>def f(a, /, b)</code>) makes everything before it positional-only, like most C builtins (<code>len(obj=…)</code> fails). On the call side <code>f(*list)</code> and <code>f(**dict)</code> unpack into arguments.</p><p>Defaults live in <code>f.__defaults__</code>, a tuple attached to the function object — that is the box the rig shows. Any mutable default (list, dict, set) shares state across calls. C# evaluates default parameter values at compile time and they must be constants, so this trap cannot exist there.</p>',
    ru: '<p>Порядок связывания: позиционные аргументы заполняют параметры слева направо; <code>*args</code> забирает остаток; именованные заполняют по имени; <code>**kwargs</code> забирает незнакомые имена; затем значения по умолчанию закрывают пробелы; оставшийся пробел — <code>TypeError: missing required positional argument</code>. Голая <code>*</code> в сигнатуре (<code>def f(a, *, b)</code>) делает всё после неё keyword-only; <code>/</code> (<code>def f(a, /, b)</code>) — всё до неё positional-only, как у большинства C-встроек (<code>len(obj=…)</code> не работает). На стороне вызова <code>f(*list)</code> и <code>f(**dict)</code> распаковывают в аргументы.</p><p>Значения по умолчанию лежат в <code>f.__defaults__</code> — кортеже, прикреплённом к объекту-функции; это та коробка, которую показывает стенд. Любое изменяемое значение по умолчанию (список, словарь, множество) делит состояние между вызовами. В C# значения параметров по умолчанию вычисляются при компиляции и обязаны быть константами, так что этой ловушки там нет.</p>',
  },
  'rig.args.title': { en: 'How arguments land on parameters', ru: 'Как аргументы ложатся на параметры' },
  'rig.args.l1:call': { en: e => `Bound: ${e.args.map(([k, v]) => `<code>${k}=${v}</code>`).join(', ')}.`, ru: e => `Связано: ${e.args.map(([k, v]) => `<code>${k}=${v}</code>`).join(', ')}.` },
  'rig.mutdefault.title': { en: 'The mutable default trap', ru: 'Ловушка изменяемого значения по умолчанию' },
  'rig.mutdefault.l1:def': { en: () => 'The default <code>[]</code> is created now, once, and stored inside the function object.', ru: () => 'Значение по умолчанию <code>[]</code> создаётся сейчас, один раз, и хранится внутри объекта-функции.' },
  'rig.mutdefault.l6': { en: () => 'Second call, same default list: it already contains "sword". Surprise!', ru: () => 'Второй вызов, тот же список по умолчанию: в нём уже лежит "sword". Сюрприз!' },
  'rig.mutdefault.l10': { en: () => '<code>bag is None</code> → make a fresh list for this call only.', ru: () => '<code>bag is None</code> → создаём свежий список только для этого вызова.' },

  /* ---------- 07 scope ---------- */
  'ch.scope.h2': { en: 'Scope: where a name lives', ru: 'Область видимости: где живёт имя' },
  'ch.scope.short': { en: 'LEGB: local, enclosing, global, builtins. global and nonlocal. The UnboundLocalError.', ru: 'LEGB: локальная, объемлющая, глобальная, встроенная. global и nonlocal. UnboundLocalError.' },
  'ch.scope.lede': { en: 'When Python reads a name it looks in four places, inside out: the current function (<b>L</b>ocal), the functions around it (<b>E</b>nclosing), the module (<b>G</b>lobal), and the <b>B</b>uiltins like <code>len</code>.', ru: 'Когда Python читает имя, он ищет в четырёх местах изнутри наружу: текущая функция (<b>L</b>ocal), функции вокруг неё (<b>E</b>nclosing), модуль (<b>G</b>lobal) и встроенные (<b>B</b>uiltins) вроде <code>len</code>.' },
  'ch.scope.body': {
    en: '<p>Three different objects named <code>level</code> live happily side by side because they are in different scopes: <code>inner</code> sees its own local, <code>outer</code> its own, the module its own. A function can <i>read</i> names from outside, but an <i>assignment</i> inside a function always creates a local — it never touches the outer name.</p>',
    ru: '<p>Три разных объекта с именем <code>level</code> мирно живут рядом, потому что они в разных областях: <code>inner</code> видит свою локальную, <code>outer</code> — свою, модуль — свою. Функция может <i>читать</i> имена снаружи, но <i>присваивание</i> внутри функции всегда создаёт локальное имя — внешнее оно не трогает.</p>',
  },
  'ch.scope.body2': {
    en: '<p>To change an outer name you must say so: <code>global coins</code> means “the module’s coins”, <code>nonlocal count</code> means “the count of the function around me”. The second one is how a function can keep private state between calls — <code>make_counter</code> returns <code>tick</code>, and <code>count</code> survives inside the closure (chapter 09). The last rig is the error everybody meets once: <code>lives = lives - 1</code> makes <code>lives</code> local for the <i>whole</i> function, so the earlier <code>print(lives)</code> reads a local that has no value yet.</p>',
    ru: '<p>Чтобы изменить внешнее имя, нужно сказать об этом: <code>global coins</code> значит «coins модуля», <code>nonlocal count</code> — «count функции вокруг меня». Второе — способ хранить в функции приватное состояние между вызовами: <code>make_counter</code> возвращает <code>tick</code>, и <code>count</code> живёт внутри замыкания (глава 09). Последний стенд — ошибка, которую каждый встречает один раз: <code>lives = lives - 1</code> делает <code>lives</code> локальным для <i>всей</i> функции, поэтому более ранний <code>print(lives)</code> читает локальное имя, у которого ещё нет значения.</p>',
  },
  'ch.scope.hood': {
    en: '<p>Scope is decided at compile time: the compiler scans a function body, and every name that is assigned anywhere in it (including <code>for</code> targets, <code>import</code>, <code>def</code>) becomes a fast local for the whole body — hence <code>UnboundLocalError</code> before the assignment line. Names declared <code>global</code>/<code>nonlocal</code> are exempt. Free variables (read from an enclosing function) are compiled into cell references; <code>f.__closure__</code> holds the cells. Class bodies are a scope of their own that methods do <i>not</i> see (PY-05). Comprehensions have their own scope too, which is why the loop variable of <code>[x for x in …]</code> does not leak.</p><p>Builtins are a module (<code>builtins</code>) consulted last, so a local named <code>list</code> or <code>sum</code> shadows the builtin — a common bug. C# has block scope and compile errors for these cases; Python has function scope and runtime errors.</p>',
    ru: '<p>Область видимости решается при компиляции: компилятор сканирует тело функции, и каждое имя, которому где-то в нём присваивают (включая переменные <code>for</code>, <code>import</code>, <code>def</code>), становится быстрым локальным для всего тела — отсюда <code>UnboundLocalError</code> до строки присваивания. Имена, объявленные <code>global</code>/<code>nonlocal</code>, исключение. Свободные переменные (читаемые из объемлющей функции) компилируются в ссылки на ячейки; <code>f.__closure__</code> хранит эти ячейки. Тело класса — собственная область, которую методы <i>не</i> видят (PY-05). У включений тоже своя область, поэтому переменная цикла в <code>[x for x in …]</code> не вытекает наружу.</p><p>Встроенные — это модуль <code>builtins</code>, к которому обращаются последним, так что локальное имя <code>list</code> или <code>sum</code> затеняет встроенное — частый баг. В C# блочная область видимости и ошибки компиляции на эти случаи; в Python — область функции и ошибки во время выполнения.</p>',
  },
  'rig.legb.title': { en: 'Four places, inside out', ru: 'Четыре места, изнутри наружу' },
  'rig.legb.l7': { en: () => '<code>inner</code> finds <code>level</code> in its own frame first (L) — the enclosing and global ones are never consulted.', ru: () => '<code>inner</code> находит <code>level</code> сначала в своём кадре (L) — объемлющее и глобальное имена даже не проверяются.' },
  'rig.legb.l13': { en: () => '<code>len</code> is not in globals, so the lookup reaches the builtins (B).', ru: () => '<code>len</code> нет в globals, поэтому поиск доходит до встроенных (B).' },
  'rig.globalkw.title': { en: 'global and nonlocal', ru: 'global и nonlocal' },
  'rig.globalkw.l4': { en: () => '<code>global coins</code>: inside this function, <code>coins</code> means the module-level name.', ru: () => '<code>global coins</code>: внутри этой функции <code>coins</code> — имя уровня модуля.' },
  'rig.globalkw.l10': { en: () => '<code>nonlocal count</code>: the <code>count</code> of <code>make_counter</code>, kept alive by the closure.', ru: () => '<code>nonlocal count</code>: тот самый <code>count</code> из <code>make_counter</code>, которого держит замыкание.' },
  'rig.unbound.title': { en: 'UnboundLocalError explained', ru: 'UnboundLocalError объясняется' },
  'rig.unbound.l4:error': { en: () => 'Because line 5 assigns <code>lives</code>, the compiler made it local for the whole function — and here it has no value yet.', ru: () => 'Так как строка 5 присваивает <code>lives</code>, компилятор сделал его локальным для всей функции — а здесь у него ещё нет значения.' },

  /* ---------- 08 recursion ---------- */
  'ch.recursion.h2': { en: 'Recursion', ru: 'Рекурсия' },
  'ch.recursion.short': { en: 'A function calling itself: frames pile up, then unwind with answers. Base case or bust.', ru: 'Функция вызывает себя: кадры громоздятся, затем сворачиваются с ответами. База или крах.' },
  'ch.recursion.lede': { en: 'A recursive function solves a big problem by calling <b>itself</b> on a smaller one, and stops at a <b>base case</b> that needs no call at all.', ru: 'Рекурсивная функция решает большую задачу, вызывая <b>саму себя</b> для меньшей, и останавливается на <b>базовом случае</b>, где вызов не нужен.' },
  'ch.recursion.body': {
    en: '<p><code>factorial(4)</code> cannot answer until it knows <code>factorial(3)</code>, which waits for <code>factorial(2)</code>, which waits for <code>factorial(1)</code> — the base case, which simply returns 1. Watch the call stack grow to four frames and then shrink as each frame multiplies the answer it receives and returns. Every frame has its own <code>n</code>; they do not interfere.</p>',
    ru: '<p><code>factorial(4)</code> не может ответить, пока не узнает <code>factorial(3)</code>, который ждёт <code>factorial(2)</code>, который ждёт <code>factorial(1)</code> — базовый случай, который просто возвращает 1. Смотри, как стек вызовов вырастает до четырёх кадров, а потом сжимается: каждый кадр умножает полученный ответ и возвращает его. У каждого кадра свой <code>n</code>; они не мешают друг другу.</p>',
  },
  'ch.recursion.body2': {
    en: '<p>Two branches instead of one: <code>fib(n)</code> calls itself twice, so the number of calls doubles with each level — <code>fib(4)</code> already makes 9 calls, and <code>fib(30)</code> would make over a million, mostly recomputing the same values. The <code>calls</code> counter makes it visible. PY-06 fixes this with memoisation (<code>lru_cache</code>) and a loop. The third rig forgets the base case: every call makes another until Python refuses at the recursion limit (lowered to 14 here so you can watch it).</p>',
    ru: '<p>Две ветки вместо одной: <code>fib(n)</code> вызывает себя дважды, поэтому число вызовов удваивается с каждым уровнем — <code>fib(4)</code> делает уже 9 вызовов, а <code>fib(30)</code> сделал бы больше миллиона, в основном пересчитывая одно и то же. Счётчик <code>calls</code> делает это видимым. PY-06 лечит это мемоизацией (<code>lru_cache</code>) и циклом. Третий стенд забывает базовый случай: каждый вызов рождает следующий, пока Python не откажет на лимите рекурсии (здесь он снижен до 14, чтобы было видно).</p>',
  },
  'ch.recursion.hood': {
    en: '<p>Every call costs a frame; CPython caps the depth at <code>sys.getrecursionlimit()</code> (1000) and raises <code>RecursionError</code> beyond it. Raising the limit is possible but the C stack underneath can still overflow and crash the process, so deep recursion (linked lists of 100 000 nodes, naive DFS on big graphs) is rewritten as a loop with an explicit stack — exactly what the BFS/DFS tape on the main shelf does. Python has no tail-call optimisation on purpose (Guido wants real tracebacks), so <code>return f(n - 1)</code> still grows the stack.</p><p>Recursion fits problems that are recursive by nature: trees, nested structures, divide-and-conquer sorts (merge sort, quicksort in PY-06), backtracking (N-Queens). Memoise overlapping subproblems with <code>functools.lru_cache</code>; the exponential <code>fib</code> becomes linear.</p>',
    ru: '<p>Каждый вызов стоит кадр; CPython ограничивает глубину <code>sys.getrecursionlimit()</code> (1000) и выше бросает <code>RecursionError</code>. Лимит можно поднять, но C-стек под ним всё равно может переполниться и уронить процесс, поэтому глубокую рекурсию (связные списки на 100 000 узлов, наивный DFS на больших графах) переписывают циклом с явным стеком — ровно так делает кассета BFS/DFS на главной полке. В Python нарочно нет оптимизации хвостовых вызовов (Гвидо хочет настоящие трейсбеки), так что <code>return f(n - 1)</code> всё равно растит стек.</p><p>Рекурсия подходит задачам, рекурсивным по природе: деревья, вложенные структуры, сортировки «разделяй и властвуй» (слиянием, быстрая в PY-06), перебор с откатом (N ферзей). Перекрывающиеся подзадачи мемоизируют через <code>functools.lru_cache</code>; экспоненциальный <code>fib</code> становится линейным.</p>',
  },
  'rig.factorial.title': { en: 'factorial: down the stack and back up', ru: 'factorial: вниз по стеку и обратно' },
  'rig.factorial.stage': { en: 'call stack', ru: 'стек вызовов' },
  'rig.factorial.l1:call': { en: e => `A new frame with <code>n=${e.args[0][1]}</code> on top of ${e.depth - 1} waiting frame${e.depth - 1 === 1 ? '' : 's'}.`, ru: e => `Новый кадр с <code>n=${e.args[0][1]}</code> поверх ${e.depth - 1} ожидающих.` },
  'rig.factorial.l3': { en: () => 'Base case: no further call. This answer starts the way back up.', ru: () => 'Базовый случай: дальше вызовов нет. Этот ответ начинает путь наверх.' },
  'rig.factorial.l5': { en: e => `This frame multiplies its <code>n</code> by the answer from below and returns <code>${e.repr}</code>.`, ru: e => `Этот кадр умножает свой <code>n</code> на ответ снизу и возвращает <code>${e.repr}</code>.` },
  'rig.fibtree.title': { en: 'fib: two branches, exploding calls', ru: 'fib: две ветки, лавина вызовов' },
  'rig.fibtree.stage': { en: 'call stack', ru: 'стек вызовов' },
  'rig.fibtree.l8': { en: () => 'Two recursive calls per frame; the left one runs to the bottom before the right one even starts.', ru: () => 'Два рекурсивных вызова на кадр; левый доходит до дна прежде, чем правый вообще начнётся.' },
  'rig.norecbase.title': { en: 'No base case → RecursionError', ru: 'Нет базового случая → RecursionError' },
  'rig.norecbase.stage': { en: 'call stack', ru: 'стек вызовов' },
  'rig.norecbase.l6:error': { en: () => 'The stack hit the limit. Nothing ever returned, because nothing ever stopped calling.', ru: () => 'Стек упёрся в лимит. Ничего не вернулось, потому что никто не переставал вызывать.' },

  /* ---------- 09 closures ---------- */
  'ch.closures.h2': { en: 'Closures and lambda', ru: 'Замыкания и lambda' },
  'ch.closures.short': { en: 'A function that remembers where it was born. Small anonymous functions as values.', ru: 'Функция, которая помнит, где родилась. Маленькие безымянные функции как значения.' },
  'ch.closures.lede': { en: 'A function defined inside another one keeps access to the outer variables <b>even after the outer function has returned</b>. That package of function + remembered variables is a <b>closure</b>.', ru: 'Функция, определённая внутри другой, сохраняет доступ к внешним переменным <b>даже после того, как внешняя функция вернулась</b>. Такой пакет из функции и запомненных переменных — <b>замыкание</b>.' },
  'ch.closures.body': {
    en: '<p><code>make_greeter("Hello")</code> returns a <i>new</i> function each time. The memory picture shows the function box with its closure: <code>greeting → "Hello"</code>. The frame of <code>make_greeter</code> is gone, but the variable it needed was captured. Two greeters, two different captured strings. Closures are how callbacks, decorators (PY-05) and counters without classes work.</p>',
    ru: '<p><code>make_greeter("Hello")</code> каждый раз возвращает <i>новую</i> функцию. На картинке памяти у коробки функции видно замыкание: <code>greeting → "Hello"</code>. Кадр <code>make_greeter</code> исчез, но нужная переменная захвачена. Два приветствия — две разные захваченные строки. На замыканиях держатся колбэки, декораторы (PY-05) и счётчики без классов.</p>',
  },
  'ch.closures.body2': {
    en: '<p><code>lambda x: x * 2</code> is a one-expression function without a name, handy as an argument: <code>sorted(pairs, key=lambda pair: pair[1])</code> sorts by the second element. If a lambda needs more than one line, give it a <code>def</code> and a name. The last rig is the classic trap: all three lambdas capture the <i>variable</i> <code>i</code>, not its value at creation, and after the loop <code>i</code> is 2 for all of them. Freeze the value with a default argument <code>i=i</code>.</p>',
    ru: '<p><code>lambda x: x * 2</code> — функция из одного выражения без имени, удобна как аргумент: <code>sorted(pairs, key=lambda pair: pair[1])</code> сортирует по второму элементу. Если lambda нужно больше одной строки, дай ей <code>def</code> и имя. Последний стенд — классическая ловушка: все три lambda захватывают <i>переменную</i> <code>i</code>, а не её значение в момент создания, и после цикла <code>i</code> равно 2 для всех. Заморозь значение аргументом по умолчанию <code>i=i</code>.</p>',
  },
  'ch.closures.hood': {
    en: '<p>Captured variables live in cell objects shared between the outer frame and the inner function; <code>inner.__closure__[0].cell_contents</code> reads one. Capture is by variable, not by value — late binding — which is the lambda-in-a-loop trap; C# had the same issue with <code>foreach</code> before C# 5 and fixed it by giving the loop variable a fresh binding per iteration. The idioms: a default argument, <code>functools.partial</code>, or a factory function.</p><p><code>lambda</code> is syntactically an expression, cannot contain statements, and shows up as <code>&lt;lambda&gt;</code> in tracebacks — prefer <code>def</code> when debugging matters. For <code>key=</code> functions that only fetch an attribute or an item, <code>operator.attrgetter</code> and <code>itemgetter</code> are faster and clearer.</p>',
    ru: '<p>Захваченные переменные живут в объектах-ячейках, общих для внешнего кадра и внутренней функции; <code>inner.__closure__[0].cell_contents</code> читает одну. Захват по переменной, а не по значению — позднее связывание — и есть ловушка lambda в цикле; в C# та же проблема была с <code>foreach</code> до C# 5, и её починили, давая переменной цикла свежую привязку на каждой итерации. Идиомы: аргумент по умолчанию, <code>functools.partial</code> или функция-фабрика.</p><p><code>lambda</code> синтаксически выражение, не может содержать инструкций и в трейсбеках выглядит как <code>&lt;lambda&gt;</code> — когда важна отладка, бери <code>def</code>. Для <code>key=</code>, которые лишь достают атрибут или элемент, <code>operator.attrgetter</code> и <code>itemgetter</code> быстрее и яснее.</p>',
  },
  'rig.closure.title': { en: 'A function that remembers', ru: 'Функция, которая помнит' },
  'rig.closure.l4': { en: e => `<code>make_greeter</code> returns the inner function <code>${e.repr.includes('greet') ? 'greet' : e.repr}</code>; its frame dies, but <code>greeting</code> is captured.`, ru: e => `<code>make_greeter</code> возвращает внутреннюю функцию <code>${e.repr.includes('greet') ? 'greet' : e.repr}</code>; её кадр умирает, но <code>greeting</code> захвачен.` },
  'rig.closure.l3': { en: () => '<code>greeting</code> is not local here: it is found in the closure, exactly the value captured at creation.', ru: () => '<code>greeting</code> здесь не локальное: оно найдено в замыкании, ровно то значение, что захвачено при создании.' },
  'rig.lambdasort.title': { en: 'lambda as a sort key', ru: 'lambda как ключ сортировки' },
  'rig.lambdasort.l5': { en: () => 'The key function is called once per pair; sorting compares the keys, the pairs follow.', ru: () => 'Функция-ключ вызывается по разу на пару; сортировка сравнивает ключи, пары следуют за ними.' },
  'rig.lambdaloop.title': { en: 'The lambda-in-a-loop trap', ru: 'Ловушка lambda в цикле' },
  'rig.lambdaloop.l4': { en: () => 'All three lambdas look up <code>i</code> only when called — and by now <code>i</code> is 2.', ru: () => 'Все три lambda ищут <code>i</code> только при вызове — а к этому моменту <code>i</code> равно 2.' },
  'rig.lambdaloop.l8': { en: () => '<code>i=i</code> evaluates the default now, freezing the current value inside each lambda.', ru: () => '<code>i=i</code> вычисляет значение по умолчанию сейчас, замораживая текущее значение внутри каждой lambda.' },

  /* ---------- 10 cheat ---------- */
  'ch.cheat.h2': { en: 'Cheat sheet PY-02', ru: 'Шпаргалка PY-02' },
  'ch.cheat.short': { en: 'Control flow and functions in one table.', ru: 'Поток управления и функции в одной таблице.' },
  'ch.cheat.lede': { en: 'Print it, stick it next to PY-01.', ru: 'Распечатай и повесь рядом с PY-01.' },
  'ch.cheat.table': {
    en: `<table><thead><tr><th>Thing</th><th>Example</th><th>Note</th></tr></thead><tbody>
<tr><td>if</td><td><code>if a: … elif b: … else: …</code></td><td>top to bottom, first true wins; indentation is the block</td></tr>
<tr><td>ternary</td><td><code>x = "big" if n > 5 else "small"</code></td><td>expression, not statement</td></tr>
<tr><td>while</td><td><code>while cond: …</code></td><td>re-check each time; <code>while True: … break</code> for “until”</td></tr>
<tr><td>for</td><td><code>for x in items: …</code></td><td>items, not indexes</td></tr>
<tr><td>range</td><td><code>range(5)</code>, <code>range(1, 10, 2)</code>, <code>range(10, 0, -1)</code></td><td>stop excluded; lazy</td></tr>
<tr><td>enumerate / zip</td><td><code>for i, x in enumerate(a, 1)</code>, <code>for a, b in zip(xs, ys)</code></td><td>pairs; zip stops at the shorter</td></tr>
<tr><td>break / continue</td><td><code>break</code>, <code>continue</code></td><td>leave the loop / next iteration; innermost loop only</td></tr>
<tr><td>for … else</td><td><code>for x in a: … break … else: …</code></td><td>else runs only without break</td></tr>
<tr><td>def</td><td><code>def f(a, b=2): return a + b</code></td><td>body runs on call; no return → None</td></tr>
<tr><td>*args / **kwargs</td><td><code>def f(*args, **kw)</code>, <code>f(*lst, **dct)</code></td><td>tuple of extras / dict of named extras</td></tr>
<tr><td>keyword-only</td><td><code>def f(a, *, flag=False)</code></td><td>flag must be passed by name</td></tr>
<tr><td>mutable default</td><td><code>def f(x=None): if x is None: x = []</code></td><td>never <code>def f(x=[])</code></td></tr>
<tr><td>scope</td><td>L → E → G → B</td><td>assignment makes a local; <code>global</code> / <code>nonlocal</code> to write outward</td></tr>
<tr><td>recursion</td><td><code>def fact(n): return 1 if n <= 1 else n * fact(n - 1)</code></td><td>base case first; limit 1000 frames</td></tr>
<tr><td>closure</td><td><code>def make(k): return lambda x: x * k</code></td><td>captures the variable, late binding</td></tr>
<tr><td>lambda</td><td><code>sorted(a, key=lambda p: p[1])</code></td><td>one expression; use def for more</td></tr>
</tbody></table>`,
    ru: `<table><thead><tr><th>Что</th><th>Пример</th><th>Заметка</th></tr></thead><tbody>
<tr><td>if</td><td><code>if a: … elif b: … else: …</code></td><td>сверху вниз, побеждает первое истинное; блок — отступ</td></tr>
<tr><td>тернарный</td><td><code>x = "big" if n > 5 else "small"</code></td><td>выражение, а не инструкция</td></tr>
<tr><td>while</td><td><code>while cond: …</code></td><td>проверка каждый раз; <code>while True: … break</code> для «пока не»</td></tr>
<tr><td>for</td><td><code>for x in items: …</code></td><td>элементы, а не индексы</td></tr>
<tr><td>range</td><td><code>range(5)</code>, <code>range(1, 10, 2)</code>, <code>range(10, 0, -1)</code></td><td>stop не входит; ленивый</td></tr>
<tr><td>enumerate / zip</td><td><code>for i, x in enumerate(a, 1)</code>, <code>for a, b in zip(xs, ys)</code></td><td>пары; zip останавливается на коротком</td></tr>
<tr><td>break / continue</td><td><code>break</code>, <code>continue</code></td><td>выйти из цикла / следующий виток; только ближайший цикл</td></tr>
<tr><td>for … else</td><td><code>for x in a: … break … else: …</code></td><td>else только без break</td></tr>
<tr><td>def</td><td><code>def f(a, b=2): return a + b</code></td><td>тело выполняется при вызове; без return → None</td></tr>
<tr><td>*args / **kwargs</td><td><code>def f(*args, **kw)</code>, <code>f(*lst, **dct)</code></td><td>кортеж лишних / словарь именованных лишних</td></tr>
<tr><td>keyword-only</td><td><code>def f(a, *, flag=False)</code></td><td>flag только по имени</td></tr>
<tr><td>изменяемое по умолчанию</td><td><code>def f(x=None): if x is None: x = []</code></td><td>никогда <code>def f(x=[])</code></td></tr>
<tr><td>область видимости</td><td>L → E → G → B</td><td>присваивание создаёт локальное; <code>global</code> / <code>nonlocal</code>, чтобы писать наружу</td></tr>
<tr><td>рекурсия</td><td><code>def fact(n): return 1 if n <= 1 else n * fact(n - 1)</code></td><td>сначала база; лимит 1000 кадров</td></tr>
<tr><td>замыкание</td><td><code>def make(k): return lambda x: x * k</code></td><td>захватывает переменную, позднее связывание</td></tr>
<tr><td>lambda</td><td><code>sorted(a, key=lambda p: p[1])</code></td><td>одно выражение; для большего — def</td></tr>
</tbody></table>`,
  },

  /* ---------- quizzes ---------- */
  'quiz.q-elif.why': { en: 'The first true condition wins and the rest are skipped, even though <code>x > 6</code> is also true.', ru: 'Побеждает первое истинное условие, остальные пропускаются, хотя <code>x > 6</code> тоже верно.' },
  'quiz.q-indent.why': { en: 'Both indented lines belong to the <code>if</code>, which is False; only the unindented <code>print("done")</code> runs.', ru: 'Обе строки с отступом принадлежат <code>if</code>, который ложен; выполняется только <code>print("done")</code> без отступа.' },
  'quiz.q-while.why': { en: '<code>continue</code> skips the print when n is 2; 1 and 3 are printed.', ru: '<code>continue</code> пропускает печать при n = 2; печатаются 1 и 3.' },
  'quiz.q-range.why': { en: 'Start at 10, step −3, stop before 0: 10, 7, 4, 1.', ru: 'Старт 10, шаг −3, остановка перед 0: 10, 7, 4, 1.' },
  'quiz.q-forelse.why': { en: 'No element is odd, so <code>break</code> never fires and the <code>else</code> branch runs.', ru: 'Нечётных нет, <code>break</code> не срабатывает, и выполняется ветка <code>else</code>.' },
  'quiz.q-return.why': { en: '<code>return</code> ends the function immediately; the print after it is unreachable.', ru: '<code>return</code> сразу завершает функцию; print после него недостижим.' },
  'quiz.q-noreturn.why': { en: 'The function computes <code>total</code> but never returns it, so the call evaluates to <code>None</code>.', ru: 'Функция считает <code>total</code>, но не возвращает его, поэтому вызов даёт <code>None</code>.' },
  'quiz.q-kwargs.why': { en: '1 → a, 5 → b, the leftover 6 → rest as a tuple, k=7 → kw.', ru: '1 → a, 5 → b, лишняя 6 → rest кортежем, k=7 → kw.' },
  'quiz.q-mutdefault.why': { en: 'The default list is shared between calls: 1, then 2; the third call brings its own empty list.', ru: 'Список по умолчанию общий для вызовов: 1, потом 2; третий вызов приносит свой пустой список.' },
  'quiz.q-scope.why': { en: '<code>count += 1</code> assigns, so <code>count</code> is local to <code>bump</code> and has no value when read. Needs <code>global count</code>.', ru: '<code>count += 1</code> присваивает, поэтому <code>count</code> локален в <code>bump</code> и не имеет значения при чтении. Нужен <code>global count</code>.' },
  'quiz.q-recursion.why': { en: '4 + 3 + 2 + 1 + 0 = 10, with the base case at n == 0.', ru: '4 + 3 + 2 + 1 + 0 = 10, база при n == 0.' },
  'quiz.q-closure.why': { en: 'Each <code>make()</code> creates its own <code>n</code>; <code>a</code> counts 1, 2 and <code>b</code> starts from its own 1.', ru: 'Каждый <code>make()</code> создаёт свой <code>n</code>; <code>a</code> считает 1, 2, а <code>b</code> начинает со своей 1.' },
  'quiz.q-lambda.why': { en: 'The lambdas capture the variable <code>i</code>, not its value; after the loop <code>i</code> is 2 for all of them.', ru: 'Lambda захватывают переменную <code>i</code>, а не значение; после цикла <code>i</code> равно 2 для всех.' },
  'quiz.q-fill-range.why': { en: '<code>range(1, 10, 2)</code>: start 1, step 2, stop before 10.', ru: '<code>range(1, 10, 2)</code>: старт 1, шаг 2, остановка перед 10.' },
  'quiz.q-order-func.why': { en: 'Define first, then call, then print: a function must exist before it is used.', ru: 'Сначала определить, потом вызвать, потом напечатать: функция должна существовать до использования.' },
};
