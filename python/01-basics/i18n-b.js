/** PY-01 texts, chapters 06–10 and the quiz texts. */
export const CH_B = {
  /* ---------- 06 truth ---------- */
  'ch.truth.h2': { en: 'True, False and the in-betweens', ru: 'True, False и всё между' },
  'ch.truth.short': { en: 'Every object is truthy or falsy. and / or return an operand, not a bool.', ru: 'Любой объект истинен или ложен. and / or возвращают операнд, а не bool.' },
  'ch.truth.lede': { en: 'Conditions do not need a real <code>bool</code>. Python asks any object “are you empty?” and treats empty as <code>False</code>.', ru: 'Условиям не нужен настоящий <code>bool</code>. Python спрашивает любой объект «ты пустой?» и считает пустое за <code>False</code>.' },
  'ch.truth.body': {
    en: '<p>Falsy values: <code>0</code>, <code>0.0</code>, <code>""</code> (empty string), <code>[]</code> (empty list), <code>None</code>, <code>False</code>. Everything else is truthy — including <code>"0"</code> (a non-empty string), <code>" "</code> (a space) and <code>[0]</code> (a list with one item). <code>bool(x)</code> shows the verdict.</p>',
    ru: '<p>Ложные значения: <code>0</code>, <code>0.0</code>, <code>""</code> (пустая строка), <code>[]</code> (пустой список), <code>None</code>, <code>False</code>. Всё остальное истинно — включая <code>"0"</code> (непустая строка), <code>" "</code> (пробел) и <code>[0]</code> (список с одним элементом). <code>bool(x)</code> показывает вердикт.</p>',
  },
  'ch.truth.body2': {
    en: '<p><code>and</code> and <code>or</code> are lazy and they return one of their operands, not <code>True</code>/<code>False</code>. <code>a or b</code> gives <code>a</code> if it is truthy, otherwise <code>b</code> — so <code>name or "guest"</code> is the classic default. <code>a and b</code> gives <code>a</code> if it is falsy (and never even looks at <code>b</code>), otherwise <code>b</code>. <code>not x</code> is the only one that always returns a real bool. Change <code>hp</code> to 0 and <code>item</code> to an empty string and watch what each line prints.</p>',
    ru: '<p><code>and</code> и <code>or</code> ленивы и возвращают один из операндов, а не <code>True</code>/<code>False</code>. <code>a or b</code> даёт <code>a</code>, если оно истинно, иначе <code>b</code> — так <code>name or "guest"</code> становится классическим значением по умолчанию. <code>a and b</code> даёт <code>a</code>, если оно ложно (и даже не смотрит на <code>b</code>), иначе <code>b</code>. Только <code>not x</code> всегда возвращает настоящий bool. Поставь <code>hp</code> в 0, а <code>item</code> сделай пустой строкой и смотри, что печатает каждая строка.</p>',
  },
  'ch.truth.hood': {
    en: '<p>Truthiness is a protocol: Python calls <code>__bool__()</code> if the class defines it, otherwise <code>__len__()</code> and treats zero length as false, otherwise the object is true. That is why your own classes can take part in <code>if obj:</code> (PY-05). Short-circuiting makes <code>x and x.name</code> a safe guard against <code>None</code>, and <code>or</code> is the usual default-value idiom — careful: <code>count or 10</code> replaces a legitimate 0 with 10; use <code>count if count is not None else 10</code> when 0 is meaningful.</p><p>Comparison chains are a Python special: <code>1 &lt; x &lt; 10</code> means <code>1 &lt; x and x &lt; 10</code>, evaluating <code>x</code> once. In C# <code>&amp;&amp;</code>/<code>||</code> always produce <code>bool</code>, and the <code>??</code> operator plays the role of <code>or</code> for null only.</p>',
    ru: '<p>Истинность — протокол: Python вызывает <code>__bool__()</code>, если класс его определяет, иначе <code>__len__()</code> и считает нулевую длину ложью, иначе объект истинен. Поэтому твои классы могут участвовать в <code>if obj:</code> (PY-05). Короткое замыкание делает <code>x and x.name</code> безопасной защитой от <code>None</code>, а <code>or</code> — привычной идиомой значения по умолчанию. Осторожно: <code>count or 10</code> заменит честный 0 на 10; когда 0 значим, пиши <code>count if count is not None else 10</code>.</p><p>Цепочки сравнений — особенность Python: <code>1 &lt; x &lt; 10</code> значит <code>1 &lt; x and x &lt; 10</code>, причём <code>x</code> вычисляется один раз. В C# <code>&amp;&amp;</code>/<code>||</code> всегда дают <code>bool</code>, а оператор <code>??</code> играет роль <code>or</code> только для null.</p>',
  },
  'rig.truth.title': { en: 'Which values are falsy?', ru: 'Какие значения ложны?' },
  'rig.truth.l3': { en: e => `<code>${e.printed.trim().replace(/\s+/g, ' ')}</code>: ${/False$/.test(e.printed.trim()) ? 'empty or zero → falsy.' : 'not empty → truthy, even if it looks like “nothing”.'}`, ru: e => `<code>${e.printed.trim().replace(/\s+/g, ' ')}</code>: ${/False$/.test(e.printed.trim()) ? 'пусто или ноль → ложь.' : 'не пусто → истина, даже если выглядит как «ничего».'}` },
  'rig.andor.title': { en: 'and / or return an operand', ru: 'and / or возвращают операнд' },
  'rig.andor.l3': { en: e => `<code>hp and item</code> → <code>${e.printed.trim()}</code>: <code>and</code> stops at the first falsy operand, or returns the last one.`, ru: e => `<code>hp and item</code> → <code>${e.printed.trim()}</code>: <code>and</code> останавливается на первом ложном операнде или возвращает последний.` },
  'rig.andor.l4': { en: e => `<code>hp or item</code> → <code>${e.printed.trim()}</code>: <code>or</code> returns the first truthy operand, or the last one.`, ru: e => `<code>hp or item</code> → <code>${e.printed.trim()}</code>: <code>or</code> возвращает первый истинный операнд или последний.` },
  'rig.andor.l5': { en: () => 'The default-value idiom: an empty <code>item</code> becomes "nothing".', ru: () => 'Идиома значения по умолчанию: пустой <code>item</code> становится "nothing".' },
  'rig.andor.l6': { en: () => '<code>not</code> always gives a real <code>bool</code>.', ru: () => '<code>not</code> всегда даёт настоящий <code>bool</code>.' },

  /* ---------- 07 input ---------- */
  'ch.input.h2': { en: 'Input from a human', ru: 'Ввод от человека' },
  'ch.input.short': { en: 'input() always returns a string. Convert before you count.', ru: 'input() всегда возвращает строку. Преобразуй, прежде чем считать.' },
  'ch.input.lede': { en: '<code>input("prompt")</code> prints the prompt, waits for the Enter key and gives you what was typed — <b>as a string</b>, even if it looks like a number.', ru: '<code>input("подсказка")</code> печатает подсказку, ждёт Enter и отдаёт то, что набрали, — <b>строкой</b>, даже если это похоже на число.' },
  'ch.input.body': {
    en: '<p>On this stand the field at the top plays the role of the keyboard: two lines, one per <code>input()</code>. Watch the type of <code>age</code>: it is <code>str</code>. <code>int(age) + 1</code> works; <code>age + 1</code> is the first real bug most people write. When you run it yourself, type the answers in the stdin box.</p>',
    ru: '<p>На этом стенде поле вверху играет роль клавиатуры: две строки, по одной на каждый <code>input()</code>. Смотри на тип <code>age</code>: это <code>str</code>. <code>int(age) + 1</code> работает; <code>age + 1</code> — первый настоящий баг, который пишет почти каждый. Когда запускаешь сам, набери ответы в поле stdin.</p>',
  },
  'ch.input.hood': {
    en: '<p><code>input()</code> reads one line from <code>sys.stdin</code> and strips the trailing newline. At end of input it raises <code>EOFError</code> — that is what happens when a script is fed an empty file. Validation is on you: <code>int("12 ")</code> tolerates spaces, <code>int("twelve")</code> raises <code>ValueError</code>, which is the normal way to ask again in a loop (PY-02, PY-04). In the browser console <code>input()</code> cannot pause the page, so the stand supplies the lines up front.</p>',
    ru: '<p><code>input()</code> читает одну строку из <code>sys.stdin</code> и отрезает перевод строки в конце. На конце ввода он бросает <code>EOFError</code> — это происходит, когда скрипту скормили пустой файл. Проверка — на тебе: <code>int("12 ")</code> терпит пробелы, <code>int("twelve")</code> бросает <code>ValueError</code>, и это нормальный способ переспросить в цикле (PY-02, PY-04). В браузерной консоли <code>input()</code> не может остановить страницу, поэтому стенд подаёт строки заранее.</p>',
  },
  'rig.inputage.title': { en: 'input() gives a string', ru: 'input() отдаёт строку' },
  'rig.inputage.l3': { en: () => 'Even "12" typed at the keyboard arrives as <code>str</code>.', ru: () => 'Даже набранное на клавиатуре "12" приходит как <code>str</code>.' },
  'rig.inputage.l4': { en: () => '<code>int(age) + 1</code> computes; <code>str(...)</code> turns the result back into text for gluing.', ru: () => '<code>int(age) + 1</code> считает; <code>str(...)</code> превращает результат обратно в текст для склейки.' },
  'rig.inputage.l5:error': { en: () => 'Text plus number: <code>TypeError</code>. This exact line is in every beginner’s first program.', ru: () => 'Текст плюс число: <code>TypeError</code>. Ровно эта строка есть в первой программе каждого новичка.' },

  /* ---------- 08 errors ---------- */
  'ch.errors.h2': { en: 'Errors are friends', ru: 'Ошибки — друзья' },
  'ch.errors.short': { en: 'Read a traceback bottom-up. The ten errors you will meet first.', ru: 'Читай traceback снизу вверх. Десять ошибок, которые встретишь первыми.' },
  'ch.errors.lede': { en: 'A red traceback is not a punishment. It is Python telling you <b>exactly where</b> and <b>exactly why</b> it had to stop.', ru: 'Красный traceback — не наказание. Это Python сообщает <b>ровно где</b> и <b>ровно почему</b> ему пришлось остановиться.' },
  'ch.errors.body': {
    en: '<p>Read it from the <b>bottom</b>: the last line names the error and says why (<code>ZeroDivisionError: division by zero</code>). Above it is the chain of calls that led there — “most recent call last”, so the lowest <code>File … line N, in function</code> is where it exploded, and the ones above are who called whom. In the rig the second <code>report([])</code> passes an empty list; <code>len([])</code> is 0 and the division fails. Notice that <code>print("done")</code> never runs: an uncaught error stops the program.</p>',
    ru: '<p>Читай <b>снизу</b>: последняя строка называет ошибку и причину (<code>ZeroDivisionError: division by zero</code>). Над ней — цепочка вызовов, которая туда привела: «most recent call last», так что самая нижняя <code>File … line N, in function</code> — место взрыва, а выше — кто кого вызвал. На стенде второй <code>report([])</code> передаёт пустой список; <code>len([])</code> равен 0, и деление падает. Заметь, что <code>print("done")</code> так и не выполнился: непойманная ошибка останавливает программу.</p>',
  },
  'ch.errors.body2': {
    en: '<p>A gallery of the classics. Pick a number from 1 to 8 and read the message. <b>NameError</b>: a typo or a name used before it is set. <b>TypeError</b>: wrong kind of thing (<code>"age: " + 12</code>). <b>IndexError</b>: a list has no item 3 when it has three items (0, 1, 2). <b>KeyError</b>: no such key in a dict. <b>ValueError</b>: right type, wrong content (<code>int("twelve")</code>). <b>ZeroDivisionError</b>. <b>AttributeError</b>: that object has no such method. <b>TypeError</b> again: <code>len(5)</code> — numbers have no length.</p>',
    ru: '<p>Галерея классики. Выбери число от 1 до 8 и прочитай сообщение. <b>NameError</b>: опечатка или имя использовано до присваивания. <b>TypeError</b>: не тот вид вещи (<code>"age: " + 12</code>). <b>IndexError</b>: у списка из трёх элементов (0, 1, 2) нет элемента 3. <b>KeyError</b>: в словаре нет такого ключа. <b>ValueError</b>: тип правильный, содержимое — нет (<code>int("twelve")</code>). <b>ZeroDivisionError</b>. <b>AttributeError</b>: у объекта нет такого метода. Снова <b>TypeError</b>: <code>len(5)</code> — у чисел нет длины.</p>',
  },
  'ch.errors.hood': {
    en: '<p>Exceptions are objects; their classes form a tree rooted at <code>BaseException</code>. <code>Exception</code> is the branch you normally catch; <code>KeyboardInterrupt</code> and <code>SystemExit</code> sit beside it so that <code>except Exception</code> does not swallow Ctrl-C. <code>LookupError</code> is the parent of <code>IndexError</code> and <code>KeyError</code>; <code>ArithmeticError</code> of <code>ZeroDivisionError</code> and <code>OverflowError</code>; <code>UnboundLocalError</code> is a <code>NameError</code>. Catching a parent catches all children. <code>try/except</code> itself is the subject of PY-04.</p><p>The traceback object walks the frame stack; each frame knows its code object and current line. Python 3.11+ even underlines the exact sub-expression that failed. In C# the analogue is the exception stack trace, printed top-down (most recent first) — the opposite order.</p>',
    ru: '<p>Исключения — объекты; их классы образуют дерево с корнем <code>BaseException</code>. <code>Exception</code> — ветка, которую обычно ловят; <code>KeyboardInterrupt</code> и <code>SystemExit</code> стоят рядом, чтобы <code>except Exception</code> не глотал Ctrl-C. <code>LookupError</code> — родитель <code>IndexError</code> и <code>KeyError</code>; <code>ArithmeticError</code> — у <code>ZeroDivisionError</code> и <code>OverflowError</code>; <code>UnboundLocalError</code> — это <code>NameError</code>. Поймать родителя — поймать всех детей. Сам <code>try/except</code> — тема PY-04.</p><p>Объект traceback идёт по стеку кадров; каждый кадр знает свой объект кода и текущую строку. Python 3.11+ даже подчёркивает точное подвыражение, которое упало. В C# аналог — stack trace исключения, но печатается он сверху вниз (самое свежее первым) — в обратном порядке.</p>',
  },
  'rig.traceback.title': { en: 'Anatomy of a traceback', ru: 'Анатомия traceback' },
  'rig.traceback.l3:error': { en: () => 'Division by zero inside <code>average</code>. Look at the console: the traceback lists <code>&lt;module&gt;</code> → <code>report</code> → <code>average</code>, most recent last.', ru: () => 'Деление на ноль внутри <code>average</code>. Смотри в консоль: traceback перечисляет <code>&lt;module&gt;</code> → <code>report</code> → <code>average</code>, самое свежее последним.' },
  'rig.errgallery.title': { en: 'Gallery of beginner errors', ru: 'Галерея ошибок новичка' },

  /* ---------- 09 mutable ---------- */
  'ch.mutable.h2': { en: 'Mutable and immutable', ru: 'Изменяемое и неизменяемое' },
  'ch.mutable.short': { en: 'Lists change in place, tuples and strings never do. Why two names can surprise you.', ru: 'Списки меняются на месте, кортежи и строки — никогда. Почему два имени могут удивить.' },
  'ch.mutable.lede': { en: 'Numbers, strings and tuples are <b>immutable</b>: operations make new objects. Lists and dicts are <b>mutable</b>: they change in place — and every name pointing at them sees the change.', ru: 'Числа, строки и кортежи <b>неизменяемы</b>: операции создают новые объекты. Списки и словари <b>изменяемы</b>: они меняются на месте — и каждое имя, указывающее на них, видит изменение.' },
  'ch.mutable.body': {
    en: '<p>Combine chapter 02 with this and you get the one trap everybody falls into once: <code>b = a</code> for a list makes a second label on the <i>same</i> list, so <code>b.append(3)</code> changes what <code>a</code> sees too. If you wanted a separate copy, say so: <code>c = a[:]</code> or <code>c = list(a)</code>. For tuples there is nothing to worry about — <code>u = u + (3,)</code> builds a new tuple and moves only <code>u</code>. In the picture: dashed border = mutable, solid = immutable.</p>',
    ru: '<p>Соедини главу 02 с этой — и получишь ловушку, в которую каждый попадает один раз: <code>b = a</code> для списка — вторая бирка на <i>том же</i> списке, поэтому <code>b.append(3)</code> меняет и то, что видит <code>a</code>. Если нужна отдельная копия, скажи это: <code>c = a[:]</code> или <code>c = list(a)</code>. С кортежами волноваться не о чем — <code>u = u + (3,)</code> строит новый кортеж и переставляет только <code>u</code>. На картинке: пунктирная рамка — изменяемый, сплошная — неизменяемый.</p>',
  },
  'ch.mutable.body2': {
    en: '<p>The same rule explains functions. A function receives the <i>object</i>, not a copy. <code>add_coin(bag)</code> appends to the caller’s list — the caller sees the coin. <code>add_score(points)</code> gets the int 5, computes 15 and binds its <i>local</i> name <code>score</code> to it; the caller’s <code>points</code> never moves. Nothing is copied in either case; the difference is purely whether the object can change in place.</p>',
    ru: '<p>То же правило объясняет функции. Функция получает <i>объект</i>, а не копию. <code>add_coin(bag)</code> дописывает в список вызывающего — тот видит монету. <code>add_score(points)</code> получает int 5, считает 15 и привязывает к нему свой <i>локальный</i> <code>score</code>; <code>points</code> снаружи не сдвигается. Ничего не копируется ни там, ни там; разница только в том, может ли объект измениться на месте.</p>',
  },
  'ch.mutable.hood': {
    en: '<p>Python’s calling convention is “call by object reference” (sometimes “call by sharing”): the callee’s parameter is a new name bound to the same object. Immutable objects therefore behave like C# value parameters and mutable ones like reference parameters — but the mechanism is one and the same. There is no <code>ref</code>/<code>out</code>; to “return two things” you return a tuple.</p><p>Immutable: <code>int, float, str, bytes, tuple, frozenset, bool, None</code>. Mutable: <code>list, dict, set, bytearray</code> and instances of your classes. Only immutable (hashable) objects can be dict keys or set members (PY-03). A tuple can hold a mutable list — then the tuple is “immutable” but its content is not: <code>t = ([],); t[0].append(1)</code> works.</p><p>The mutable-default trap <code>def f(x=[])</code> is in PY-02; shallow versus deep copies (<code>copy.deepcopy</code>) are in PY-03.</p>',
    ru: '<p>Соглашение о вызове в Python — «передача по ссылке на объект» (иногда «call by sharing»): параметр функции — новое имя, привязанное к тому же объекту. Поэтому неизменяемые объекты ведут себя как параметры-значения в C#, а изменяемые — как ссылочные, но механизм один и тот же. <code>ref</code>/<code>out</code> нет; чтобы «вернуть две вещи», возвращают кортеж.</p><p>Неизменяемые: <code>int, float, str, bytes, tuple, frozenset, bool, None</code>. Изменяемые: <code>list, dict, set, bytearray</code> и экземпляры твоих классов. Ключами словаря и элементами множества могут быть только неизменяемые (хэшируемые) объекты (PY-03). Кортеж может держать изменяемый список — тогда кортеж «неизменяем», а содержимое нет: <code>t = ([],); t[0].append(1)</code> работает.</p><p>Ловушка изменяемого значения по умолчанию <code>def f(x=[])</code> — в PY-02; поверхностные и глубокие копии (<code>copy.deepcopy</code>) — в PY-03.</p>',
  },
  'rig.mutable.title': { en: 'Two labels, one list', ru: 'Две бирки, один список' },
  'rig.mutable.l3': { en: () => '<code>b.append(3)</code> changed the list in place. <code>a</code> points at the same list — it sees 3 too.', ru: () => '<code>b.append(3)</code> изменил список на месте. <code>a</code> указывает на тот же список — и тоже видит 3.' },
  'rig.mutable.l6': { en: () => '<code>a[:]</code> is a slice of everything: a <b>new</b> list with the same items.', ru: () => '<code>a[:]</code> — срез «всё»: <b>новый</b> список с теми же элементами.' },
  'rig.mutable.l11': { en: () => 'Tuples cannot change: <code>u + (3,)</code> is a new object, and only <code>u</code> moves.', ru: () => 'Кортежи не меняются: <code>u + (3,)</code> — новый объект, и переезжает только <code>u</code>.' },
  'rig.funcmut.title': { en: 'What a function can and cannot change', ru: 'Что функция может и не может изменить' },
  'rig.funcmut.l2': { en: () => 'The parameter <code>inventory</code> is another label on the caller’s list: appending changes it for everyone.', ru: () => 'Параметр <code>inventory</code> — ещё одна бирка на списке вызывающего: добавление меняет его для всех.' },
  'rig.funcmut.l6': { en: () => '<code>score = score + 10</code> binds the <i>local</i> name to a new int. The caller’s <code>points</code> is untouched.', ru: () => '<code>score = score + 10</code> привязывает <i>локальное</i> имя к новому int. <code>points</code> снаружи не тронут.' },
  'rig.aliasdict.title': { en: 'The same with a dict', ru: 'То же самое со словарём' },
  'rig.aliasdict.l3': { en: () => '<code>backup</code> and <code>player</code> are one dict; the “backup” just got destroyed with the original.', ru: () => '<code>backup</code> и <code>player</code> — один словарь; «резервная копия» погибла вместе с оригиналом.' },
  'rig.aliasdict.l5': { en: () => '<code>dict(player)</code> makes a real (shallow) copy: now there are two boxes.', ru: () => '<code>dict(player)</code> делает настоящую (поверхностную) копию: теперь коробок две.' },

  /* ---------- 10 cheat ---------- */
  'ch.cheat.h2': { en: 'Cheat sheet PY-01', ru: 'Шпаргалка PY-01' },
  'ch.cheat.short': { en: 'Everything from this tape in one table.', ru: 'Всё с этой кассеты в одной таблице.' },
  'ch.cheat.lede': { en: 'Print it, stick it next to the keyboard.', ru: 'Распечатай и повесь рядом с клавиатурой.' },
  'ch.cheat.table': {
    en: `<table><thead><tr><th>Thing</th><th>Example</th><th>Result / note</th></tr></thead><tbody>
<tr><td>print</td><td><code>print("a", 1, sep="-", end="!")</code></td><td><code>a-1!</code> — sep between, end after</td></tr>
<tr><td>assignment</td><td><code>a = 5; b = a</code></td><td>two names, one object; <code>a = 6</code> moves only <code>a</code></td></tr>
<tr><td>is / ==</td><td><code>a == b</code>, <code>a is b</code></td><td>equal values / the very same object; use <code>is</code> only with <code>None</code></td></tr>
<tr><td>int</td><td><code>2 ** 100</code>, <code>7 // 2</code>, <code>7 % 2</code></td><td>unlimited; floor 3; remainder 1</td></tr>
<tr><td>float</td><td><code>7 / 2</code>, <code>0.1 + 0.2</code></td><td><code>3.5</code>; <code>0.30000000000000004</code> → <code>math.isclose</code></td></tr>
<tr><td>round</td><td><code>round(2.5)</code>, <code>round(3.14159, 2)</code></td><td><code>2</code> (to even), <code>3.14</code></td></tr>
<tr><td>str index</td><td><code>s[0]</code>, <code>s[-1]</code></td><td>first, last; past the end → IndexError</td></tr>
<tr><td>slice</td><td><code>s[1:4]</code>, <code>s[::-1]</code>, <code>s[::2]</code></td><td>1,2,3; reversed; every second</td></tr>
<tr><td>str methods</td><td><code>s.upper()</code>, <code>s.title()</code>, <code>"a" in s</code></td><td>new strings; membership</td></tr>
<tr><td>immutable</td><td><code>s[0] = "x"</code></td><td>TypeError — build a new string</td></tr>
<tr><td>type</td><td><code>type(x)</code>, <code>isinstance(x, int)</code></td><td>the class; subtype-aware check</td></tr>
<tr><td>convert</td><td><code>int("12")</code>, <code>str(12)</code>, <code>float("2.5")</code></td><td><code>"12" + 3</code> is TypeError</td></tr>
<tr><td>falsy</td><td><code>0, 0.0, "", [], None, False</code></td><td>everything else is truthy (<code>"0"</code>, <code>[0]</code>)</td></tr>
<tr><td>and / or</td><td><code>name or "guest"</code>, <code>x and x.y</code></td><td>return an operand; short-circuit</td></tr>
<tr><td>input</td><td><code>age = int(input("Age? "))</code></td><td>always a str until converted</td></tr>
<tr><td>traceback</td><td>read bottom-up</td><td>last line: type and reason; lowest frame: where</td></tr>
<tr><td>mutable</td><td><code>b = a; b.append(1)</code></td><td>list/dict change in place for every name; copy with <code>a[:]</code>, <code>dict(a)</code></td></tr>
</tbody></table>`,
    ru: `<table><thead><tr><th>Что</th><th>Пример</th><th>Результат / заметка</th></tr></thead><tbody>
<tr><td>print</td><td><code>print("a", 1, sep="-", end="!")</code></td><td><code>a-1!</code> — sep между, end после</td></tr>
<tr><td>присваивание</td><td><code>a = 5; b = a</code></td><td>два имени, один объект; <code>a = 6</code> двигает только <code>a</code></td></tr>
<tr><td>is / ==</td><td><code>a == b</code>, <code>a is b</code></td><td>равные значения / тот же объект; <code>is</code> только с <code>None</code></td></tr>
<tr><td>int</td><td><code>2 ** 100</code>, <code>7 // 2</code>, <code>7 % 2</code></td><td>без предела; вниз 3; остаток 1</td></tr>
<tr><td>float</td><td><code>7 / 2</code>, <code>0.1 + 0.2</code></td><td><code>3.5</code>; <code>0.30000000000000004</code> → <code>math.isclose</code></td></tr>
<tr><td>round</td><td><code>round(2.5)</code>, <code>round(3.14159, 2)</code></td><td><code>2</code> (к чётному), <code>3.14</code></td></tr>
<tr><td>индекс строки</td><td><code>s[0]</code>, <code>s[-1]</code></td><td>первый, последний; за концом → IndexError</td></tr>
<tr><td>срез</td><td><code>s[1:4]</code>, <code>s[::-1]</code>, <code>s[::2]</code></td><td>1,2,3; задом наперёд; каждый второй</td></tr>
<tr><td>методы str</td><td><code>s.upper()</code>, <code>s.title()</code>, <code>"a" in s</code></td><td>новые строки; проверка вхождения</td></tr>
<tr><td>неизменяемость</td><td><code>s[0] = "x"</code></td><td>TypeError — собери новую строку</td></tr>
<tr><td>тип</td><td><code>type(x)</code>, <code>isinstance(x, int)</code></td><td>класс; проверка с учётом подтипов</td></tr>
<tr><td>преобразование</td><td><code>int("12")</code>, <code>str(12)</code>, <code>float("2.5")</code></td><td><code>"12" + 3</code> — TypeError</td></tr>
<tr><td>ложные</td><td><code>0, 0.0, "", [], None, False</code></td><td>всё остальное истинно (<code>"0"</code>, <code>[0]</code>)</td></tr>
<tr><td>and / or</td><td><code>name or "guest"</code>, <code>x and x.y</code></td><td>возвращают операнд; короткое замыкание</td></tr>
<tr><td>input</td><td><code>age = int(input("Age? "))</code></td><td>всегда str, пока не преобразуешь</td></tr>
<tr><td>traceback</td><td>читай снизу вверх</td><td>последняя строка: тип и причина; нижний кадр: где</td></tr>
<tr><td>изменяемое</td><td><code>b = a; b.append(1)</code></td><td>list/dict меняются на месте для всех имён; копия — <code>a[:]</code>, <code>dict(a)</code></td></tr>
</tbody></table>`,
  },

  /* ---------- quizzes ---------- */
  'quiz.q-print.why': { en: '<code>sep="-"</code> joins a and b with a dash, <code>end="!"</code> replaces the line break, so <code>c</code> continues the same line.', ru: '<code>sep="-"</code> соединяет a и b дефисом, <code>end="!"</code> заменяет перевод строки, поэтому <code>c</code> продолжает ту же строку.' },
  'quiz.q-rebind.why': { en: '<code>y = x</code> points y at the object 10. <code>x = x + 1</code> creates 11 and moves only x. Ints never change in place.', ru: '<code>y = x</code> направляет y на объект 10. <code>x = x + 1</code> создаёт 11 и двигает только x. Int никогда не меняется на месте.' },
  'quiz.q-floordiv.why': { en: '<code>//</code> floors to 4, <code>%</code> leaves 1, and <code>/</code> always produces a float — even when it divides evenly: <code>3.0</code>.', ru: '<code>//</code> округляет вниз до 4, <code>%</code> оставляет 1, а <code>/</code> всегда даёт float — даже когда делится нацело: <code>3.0</code>.' },
  'quiz.q-float.why': { en: 'Neither 0.1 nor 0.2 is exact in binary; the sum is 0.30000000000000004. Compare with <code>math.isclose</code>.', ru: 'Ни 0.1, ни 0.2 не точны в двоичном виде; сумма — 0.30000000000000004. Сравнивай через <code>math.isclose</code>.' },
  'quiz.q-slice.why': { en: '<code>[1:4]</code> is positions 1–3 → "yth"; <code>[-2:]</code> is the last two → "on"; <code>[::-1]</code> reverses to "nohtyp", whose first char is "n".', ru: '<code>[1:4]</code> — позиции 1–3 → "yth"; <code>[-2:]</code> — последние две → "on"; <code>[::-1]</code> даёт "nohtyp", первый символ — "n".' },
  'quiz.q-strimm.why': { en: 'Strings are immutable: item assignment raises <code>TypeError</code>. Build a new one: <code>"b" + s[1:]</code>.', ru: 'Строки неизменяемы: присваивание по индексу бросает <code>TypeError</code>. Собери новую: <code>"b" + s[1:]</code>.' },
  'quiz.q-concat.why': { en: '<code>str + int</code> is not allowed; Python will not guess. Use <code>"age " + str(age)</code> or an f-string.', ru: '<code>str + int</code> нельзя; Python не угадывает. Пиши <code>"age " + str(age)</code> или f-строку.' },
  'quiz.q-truth.why': { en: '<code>"0"</code> is a non-empty string → True; <code>0</code> and <code>[]</code> are empty/zero → False; <code>[0]</code> has one item → True.', ru: '<code>"0"</code> — непустая строка → True; <code>0</code> и <code>[]</code> — ноль/пусто → False; <code>[0]</code> содержит элемент → True.' },
  'quiz.q-or.why': { en: '<code>or</code> returns the first truthy operand ("guest"); <code>and</code> returns the first falsy one (0) or the last one ("x").', ru: '<code>or</code> возвращает первый истинный операнд ("guest"); <code>and</code> — первый ложный (0) или последний ("x").' },
  'quiz.q-input.why': { en: '<code>input()</code> returns the string "5"; <code>"5" + 1</code> is a <code>TypeError</code>. Convert first: <code>int(n) + 1</code>.', ru: '<code>input()</code> возвращает строку "5"; <code>"5" + 1</code> — это <code>TypeError</code>. Сначала преобразуй: <code>int(n) + 1</code>.' },
  'quiz.q-alias.why': { en: '<code>a</code> and <code>b</code> are the same list, so the append shows in both. <code>a + [4]</code> builds a new list without touching the shared one.', ru: '<code>a</code> и <code>b</code> — один список, поэтому append виден в обоих. <code>a + [4]</code> строит новый список, не трогая общий.' },
  'quiz.q-funcmut.why': { en: 'The list is changed in place through the parameter; the int is rebound locally only, so <code>count</code> stays 0.', ru: 'Список меняется на месте через параметр; int перепривязан только локально, поэтому <code>count</code> остаётся 0.' },
  'quiz.q-fill-len.why': { en: '<code>len(word)</code> counts the characters.', ru: '<code>len(word)</code> считает символы.' },
  'quiz.q-fill-int.why': { en: '<code>int(answer)</code> turns the typed text into a number; only then can you add 8.', ru: '<code>int(answer)</code> превращает набранный текст в число; только после этого можно прибавить 8.' },
};
