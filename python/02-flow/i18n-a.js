/** PY-02 texts, chapters 00–05. */
export const CH_A = {
  'page.title': { en: 'Flow: conditions, loops, functions · PY-02', ru: 'Поток: условия, циклы, функции · PY-02' },
  'page.desc': {
    en: 'if/elif/else, while and for, range, functions and their frames, arguments, scope, recursion with a visible call stack, closures and lambda. Every example runs in the browser step by step.',
    ru: 'if/elif/else, while и for, range, функции и их кадры, аргументы, область видимости, рекурсия с видимым стеком вызовов, замыкания и lambda. Каждый пример выполняется в браузере по шагам.',
  },
  'py.osd.stand': { en: 'PYTHON', ru: 'PYTHON' },
  'py.foot.stand': { en: 'Python stand', ru: 'Стенд Python' },
  'py.foot.prev01': { en: '◀ PY-01 · How Python thinks', ru: '◀ PY-01 · Как Python думает' },
  'py.foot.next06': { en: 'Next: PY-06 · Problems ►', ru: 'Дальше: PY-06 · Задачи ►' },
  'foot.stop': { en: '■ END OF TAPE', ru: '■ КОНЕЦ КАССЕТЫ' },
  'foot.src': { en: 'Source code and models:', ru: 'Исходный код и модели:' },
  'hero.eyebrow': { en: 'PY-02 · Python · stand B', ru: 'PY-02 · Python · стенд B' },
  'hero.title': { en: 'Flow', ru: 'Поток' },
  'hero.subtitle': { en: 'conditions, loops, functions, recursion', ru: 'условия, циклы, функции, рекурсия' },
  'hero.lede': {
    en: 'PY-01 ran every line in order. This tape is about <b>choosing</b> and <b>repeating</b>: <code>if</code> picks a path, <code>while</code> and <code>for</code> go round, <code>def</code> packs steps into a function you can call by name. The memory picture grows a new box each time a function is called — a <b>frame</b> — and the call stack view shows frames piling up during recursion.',
    ru: 'В PY-01 каждая строка выполнялась по порядку. Эта кассета про <b>выбор</b> и <b>повторение</b>: <code>if</code> выбирает путь, <code>while</code> и <code>for</code> ходят по кругу, <code>def</code> упаковывает шаги в функцию, которую можно звать по имени. Картинка памяти получает новую коробку при каждом вызове функции — <b>кадр</b>, а вид стека вызовов показывает, как кадры громоздятся при рекурсии.',
  },
  'hero.mapH': { en: 'Chapters', ru: 'Главы' },

  /* ---------- 01 if ---------- */
  'ch.cond.h2': { en: 'if, elif, else', ru: 'if, elif, else' },
  'ch.cond.short': { en: 'One path out of several; indentation is the block.', ru: 'Один путь из нескольких; отступ и есть блок.' },
  'ch.cond.lede': { en: 'Python checks the conditions <b>top to bottom</b> and runs the first block whose condition is true. The rest are skipped, even if they would also be true.', ru: 'Python проверяет условия <b>сверху вниз</b> и выполняет первый блок, чьё условие истинно. Остальные пропускаются, даже если тоже были бы истинны.' },
  'ch.cond.body': {
    en: '<p>Try the rig with <code>hp = 35, potions = 2</code>: the first condition (<code>hp == 0</code>) is False, the second (<code>hp &lt; 50 and potions &gt; 0</code>) is True, so the potion is drunk and the third branch is never even checked. Set potions to 0 and the third branch wins. <code>else</code> has no condition: it is “everything else”.</p>',
    ru: '<p>Попробуй стенд с <code>hp = 35, potions = 2</code>: первое условие (<code>hp == 0</code>) ложно, второе (<code>hp &lt; 50 and potions &gt; 0</code>) истинно, так что зелье выпито, а третья ветка даже не проверяется. Поставь potions = 0 — победит третья ветка. У <code>else</code> условия нет: это «всё остальное».</p>',
  },
  'ch.cond.body2': {
    en: '<p>Where does a block end? Python has no braces: the <b>indentation</b> is the block. Lines indented under the <code>if</code> belong to it; the first line back at the old indentation is outside. Four spaces is the convention. In the ladder rig, line 6 is still inside the first <code>if</code> even though the inner <code>if</code> ended, and line 7 is outside everything. Mixing tabs and spaces is a classic way to get a confusing <code>IndentationError</code> — set your editor to spaces.</p>',
    ru: '<p>Где кончается блок? В Python нет фигурных скобок: блок — это <b>отступ</b>. Строки, сдвинутые под <code>if</code>, принадлежат ему; первая строка на старом отступе — уже снаружи. Четыре пробела — соглашение. На стенде-лесенке строка 6 всё ещё внутри первого <code>if</code>, хотя внутренний <code>if</code> закончился, а строка 7 — снаружи всего. Смешать табы и пробелы — классический способ получить странную <code>IndentationError</code>; настрой редактор на пробелы.</p>',
  },
  'ch.cond.hood': {
    en: '<p>The tokenizer turns indentation into INDENT/DEDENT tokens, so blocks are structural, not cosmetic. Any consistent indentation works per block, but PEP 8 says four spaces. A condition is evaluated with the truthiness rules of PY-01, so <code>if items:</code> is the idiomatic “if not empty”. Python has no <code>switch</code>; use <code>elif</code> chains, a dict of functions, or <code>match</code> (PY-05). The conditional expression <code>a if cond else b</code> is the ternary operator; <code>cond ? a : b</code> does not exist.</p>',
    ru: '<p>Токенизатор превращает отступы в токены INDENT/DEDENT, так что блоки структурны, а не косметичны. Внутри блока подойдёт любой постоянный отступ, но PEP 8 требует четыре пробела. Условие вычисляется по правилам истинности из PY-01, поэтому <code>if items:</code> — идиоматичное «если не пусто». В Python нет <code>switch</code>: используют цепочки <code>elif</code>, словарь функций или <code>match</code> (PY-05). Условное выражение <code>a if cond else b</code> — тернарный оператор; записи <code>cond ? a : b</code> нет.</p>',
  },
  'rig.ifelse.title': { en: 'Top to bottom, first true wins', ru: 'Сверху вниз, побеждает первое истинное' },
  'rig.ifelse.l3': { en: e => (e.result ? 'hp is 0 → the first branch runs, the rest are skipped.' : 'hp is not 0 → skip this block and test the next condition.'), ru: e => (e.result ? 'hp равно 0 → выполняется первая ветка, остальные пропускаются.' : 'hp не 0 → пропускаем блок и проверяем следующее условие.') },
  'rig.ifelse.l5': { en: e => (e.result ? 'Both halves are true → this branch runs and the later ones are not even checked.' : '<code>and</code> needs both halves; at least one is False → next condition.'), ru: e => (e.result ? 'Обе половины истинны → выполняется эта ветка, дальнейшие даже не проверяются.' : '<code>and</code> требует обе половины; хотя бы одна ложна → следующее условие.') },
  'rig.ifelse.l11': { en: () => 'Nothing above matched, so <code>else</code> runs.', ru: () => 'Ничего выше не подошло, поэтому выполняется <code>else</code>.' },
  'rig.indent.title': { en: 'Indentation is the block', ru: 'Отступ и есть блок' },
  'rig.indent.l6': { en: () => 'Still indented under the first <code>if</code>: it belongs to it, even after the inner <code>if</code> ended.', ru: () => 'Всё ещё под отступом первого <code>if</code>: строка принадлежит ему, хотя внутренний <code>if</code> уже кончился.' },
  'rig.indent.l7': { en: () => 'Back at column 0 → outside every if. This line always runs.', ru: () => 'Снова в колонке 0 → вне всех if. Эта строка выполняется всегда.' },

  /* ---------- 02 while ---------- */
  'ch.while.h2': { en: 'while: repeat until', ru: 'while: повторяй, пока' },
  'ch.while.short': { en: 'Check, run, check again. break leaves early, infinite loops exist.', ru: 'Проверь, выполни, проверь снова. break выходит раньше, бесконечные циклы бывают.' },
  'ch.while.lede': { en: '<code>while condition:</code> checks the condition, runs the body if it is true, and comes back to check again — until the condition is false or <code>break</code> jumps out.', ru: '<code>while условие:</code> проверяет условие, выполняет тело, если оно истинно, и возвращается проверить снова — пока условие не станет ложным или <code>break</code> не выпрыгнет.' },
  'ch.while.body': {
    en: '<p>Something inside the body must move the condition towards False (<code>fuel -= 1</code>), otherwise the loop never ends. Count the checks in the rig: with <code>fuel = 5</code> the condition is tested 4 times before <code>break</code> fires at distance 30, and the fifth check never happens. <code>break</code> leaves the loop at once; the lines after the loop continue.</p>',
    ru: '<p>Что-то внутри тела должно двигать условие к False (<code>fuel -= 1</code>), иначе цикл не закончится. Посчитай проверки на стенде: при <code>fuel = 5</code> условие проверяется 4 раза, пока на расстоянии 30 не сработает <code>break</code>, а пятой проверки уже не будет. <code>break</code> покидает цикл сразу; строки после цикла продолжаются.</p>',
  },
  'ch.while.body2': {
    en: '<p><code>while True:</code> is an intentional endless loop: the only way out is <code>break</code>. That is the shape of every game loop and every “ask until the answer is valid”. The guessing game below reads guesses from the stdin field — edit them and see how many tries it takes. Halving the range each time is the binary search of PY-06.</p>',
    ru: '<p><code>while True:</code> — намеренно бесконечный цикл: выход только через <code>break</code>. Такова форма любого игрового цикла и любого «спрашивай, пока ответ не станет правильным». Игра «угадай число» ниже читает попытки из поля stdin — поменяй их и посмотри, сколько попыток уйдёт. Делить диапазон пополам каждый раз — это бинарный поиск из PY-06.</p>',
  },
  'ch.while.hood': {
    en: '<p>Each iteration re-evaluates the condition from scratch; there is no “do … while”, write <code>while True: … if done: break</code>. A <code>while</code> may have an <code>else</code> that runs only when the condition became false (not after a <code>break</code>) — rarely used, same rule as for <code>for</code> in chapter 04. CPython compiles loops to jumps in bytecode; a tight loop of a million iterations costs about 50 ms, which is why heavy numeric work goes to NumPy or comprehensions (PY-03). The walrus operator <code>while (line := input()) != "quit":</code> assigns and tests in one go.</p>',
    ru: '<p>Каждый виток заново вычисляет условие; «do … while» нет, пишут <code>while True: … if done: break</code>. У <code>while</code> может быть <code>else</code>, который выполняется только когда условие стало ложным (не после <code>break</code>) — редкость, правило то же, что у <code>for</code> в главе 04. CPython компилирует циклы в переходы байткода; плотный цикл на миллион итераций стоит около 50 мс, поэтому тяжёлую арифметику отдают NumPy или включениям (PY-03). «Морж» <code>while (line := input()) != "quit":</code> присваивает и проверяет за один раз.</p>',
  },
  'rig.whileloop.title': { en: 'Check, run, check again', ru: 'Проверь, выполни, проверь снова' },
  'rig.whileloop.l3': { en: e => (e.result ? `Check #${e.iteration + 1}: fuel is still positive → run the body.` : `Check #${e.iteration + 1}: fuel ran out → the loop ends normally.`), ru: e => (e.result ? `Проверка №${e.iteration + 1}: топливо ещё есть → выполняем тело.` : `Проверка №${e.iteration + 1}: топливо кончилось → цикл заканчивается обычным путём.`) },
  'rig.whileloop.l8': { en: () => '<code>break</code>: out of the loop right now, no further checks.', ru: () => '<code>break</code>: выходим из цикла прямо сейчас, без дальнейших проверок.' },
  'rig.guess.title': { en: 'while True + break: the guessing game', ru: 'while True + break: угадай число' },
  'rig.guess.l3': { en: () => '<code>while True</code>: the condition is always true; only <code>break</code> can end this loop.', ru: () => '<code>while True</code>: условие всегда истинно; закончить цикл может только <code>break</code>.' },
  'rig.guess.l4': { en: () => '<code>int(input(...))</code>: the typed text is converted to a number right away.', ru: () => '<code>int(input(...))</code>: набранный текст сразу превращается в число.' },

  /* ---------- 03 for ---------- */
  'ch.forloop.h2': { en: 'for and range', ru: 'for и range' },
  'ch.forloop.short': { en: 'Walk over anything that has items: range, list, string. enumerate and zip.', ru: 'Пройти по всему, у чего есть элементы: range, список, строка. enumerate и zip.' },
  'ch.forloop.lede': { en: '<code>for x in things:</code> takes the items one by one, binds <code>x</code> to each, runs the body. No counter, no index arithmetic — unless you ask for it.', ru: '<code>for x in things:</code> берёт элементы по одному, привязывает к каждому <code>x</code>, выполняет тело. Ни счётчика, ни арифметики индексов — пока сам не попросишь.' },
  'ch.forloop.body': {
    en: '<p><code>range(start, stop, step)</code> produces the numbers from start up to <b>but not including</b> stop. <code>range(4)</code> is 0, 1, 2, 3; <code>range(1, 5)</code> is 1, 2, 3, 4; a negative step counts down. It is lazy: <code>range(10 ** 9)</code> costs nothing until you walk it, and <code>len(range(...))</code> is computed, not counted. Play with the three numbers.</p>',
    ru: '<p><code>range(start, stop, step)</code> выдаёт числа от start до stop, <b>не включая</b> stop. <code>range(4)</code> — это 0, 1, 2, 3; <code>range(1, 5)</code> — 1, 2, 3, 4; отрицательный шаг считает вниз. Он ленивый: <code>range(10 ** 9)</code> ничего не стоит, пока по нему не идёшь, а <code>len(range(...))</code> вычисляется, а не пересчитывается. Покрути три числа.</p>',
  },
  'ch.forloop.body2': {
    en: '<p>Looping over a list gives the items, not positions. When you need the position too, <code>enumerate(list, start=1)</code> hands out pairs <code>(i, item)</code>; when you need two lists side by side, <code>zip(a, b)</code> hands out pairs <code>(a_i, b_i)</code> and stops at the shorter one. Unpacking <code>for name, score in zip(...)</code> splits each pair into two names. <code>max(zip(scores, names))</code> compares the pairs tuple-wise: by score first.</p>',
    ru: '<p>Цикл по списку даёт элементы, а не позиции. Когда нужна и позиция, <code>enumerate(list, start=1)</code> выдаёт пары <code>(i, item)</code>; когда нужны два списка бок о бок, <code>zip(a, b)</code> выдаёт пары <code>(a_i, b_i)</code> и останавливается на более коротком. Распаковка <code>for name, score in zip(...)</code> разбивает каждую пару на два имени. <code>max(zip(scores, names))</code> сравнивает пары как кортежи: сначала по очкам.</p>',
  },
  'ch.forloop.hood': {
    en: '<p><code>for</code> calls <code>iter(things)</code> once and then <code>next()</code> until <code>StopIteration</code> — the iterator protocol of PY-03. That is why you can loop over files, generators, dict keys and your own classes. Modifying a list while looping over it skips elements; loop over a copy (<code>for x in list(a):</code>) or build a new list. The loop variable is an ordinary name in the enclosing scope and survives after the loop with its last value — unlike C# where <code>for (int i …)</code> is scoped to the loop. There is no C-style <code>for (init; cond; step)</code>; <code>range</code> covers 95% of those, <code>while</code> the rest.</p>',
    ru: '<p><code>for</code> один раз вызывает <code>iter(things)</code>, а потом <code>next()</code> до <code>StopIteration</code> — протокол итератора из PY-03. Поэтому можно идти по файлам, генераторам, ключам словаря и своим классам. Менять список во время цикла по нему — значит пропускать элементы; иди по копии (<code>for x in list(a):</code>) или строй новый список. Переменная цикла — обычное имя в объемлющей области и после цикла живёт с последним значением, в отличие от C#, где <code>for (int i …)</code> ограничен циклом. C-образного <code>for (init; cond; step)</code> нет; <code>range</code> покрывает 95 % таких случаев, <code>while</code> — остальное.</p>',
  },
  'rig.rangelab.title': { en: 'range lab', ru: 'Лаборатория range' },
  'rig.rangelab.l1': { en: () => 'A <code>range</code> object stores just start, stop and step — the numbers are produced on demand.', ru: () => 'Объект <code>range</code> хранит только start, stop и step — числа порождаются по запросу.' },
  'rig.rangelab.l2': { en: e => `<code>list(r)</code> materialises them: <code>${e.printed.trim()}</code>. stop is not included.`, ru: e => `<code>list(r)</code> материализует их: <code>${e.printed.trim()}</code>. stop не входит.` },
  'rig.forlist.title': { en: 'for over a list, then with enumerate', ru: 'for по списку, потом с enumerate' },
  'rig.forlist.l3': { en: e => `<code>song</code> is bound to item ${e.index + 1}: <code>${e.repr}</code>. No index needed.`, ru: e => `<code>song</code> привязано к элементу ${e.index + 1}: <code>${e.repr}</code>. Индекс не нужен.` },
  'rig.forlist.l7': { en: e => `<code>enumerate</code> hands out a pair, unpacked into <code>i</code> and <code>song</code>: ${e.repr}.`, ru: e => `<code>enumerate</code> выдаёт пару, распакованную в <code>i</code> и <code>song</code>: ${e.repr}.` },
  'rig.enumzip.title': { en: 'zip: two lists side by side', ru: 'zip: два списка бок о бок' },
  'rig.enumzip.l3': { en: e => `<code>zip</code> pairs the i-th name with the i-th score: <code>${e.repr}</code>.`, ru: e => `<code>zip</code> соединяет i-е имя с i-ми очками: <code>${e.repr}</code>.` },
  'rig.enumzip.l7': { en: () => 'Tuples compare element by element, so the best score wins; its name comes along.', ru: () => 'Кортежи сравниваются поэлементно, поэтому побеждает лучший счёт; имя идёт в придачу.' },

  /* ---------- 04 loop extras ---------- */
  'ch.loopextra.h2': { en: 'Nested loops, continue, for … else', ru: 'Вложенные циклы, continue, for … else' },
  'ch.loopextra.short': { en: 'A loop inside a loop paints a table; else runs when nothing was found.', ru: 'Цикл внутри цикла рисует таблицу; else выполняется, когда ничего не нашли.' },
  'ch.loopextra.lede': { en: 'The inner loop runs completely for each step of the outer one. A 3 × 3 table is 9 inner iterations.', ru: 'Внутренний цикл прокручивается целиком на каждом шаге внешнего. Таблица 3 × 3 — это 9 внутренних витков.' },
  'ch.loopextra.body': {
    en: '<p>Watch <code>row</code> and <code>col</code> in the names strip: <code>col</code> runs 1, 2, 3 while <code>row</code> stays 1, then <code>row</code> becomes 2 and <code>col</code> starts over. <code>str(...).rjust(3)</code> pads each number to three characters so the columns line up. Nested loops are how you walk a grid, compare every pair, or draw patterns — and they are the reason some algorithms in PY-06 are slow: n × n steps.</p>',
    ru: '<p>Следи за <code>row</code> и <code>col</code> в полоске имён: <code>col</code> пробегает 1, 2, 3, пока <code>row</code> равен 1, потом <code>row</code> становится 2, а <code>col</code> начинает заново. <code>str(...).rjust(3)</code> дополняет каждое число до трёх символов, чтобы колонки выровнялись. Вложенные циклы — способ обойти сетку, сравнить все пары или нарисовать узор, и именно из-за них некоторые алгоритмы в PY-06 медленные: n × n шагов.</p>',
  },
  'ch.loopextra.body2': {
    en: '<p>Two more tools. <code>continue</code> skips the rest of the body and jumps to the next iteration — “not this one, next”. And a loop can have an <code>else</code>: it runs <b>only if the loop was not stopped by <code>break</code></b>. That is exactly the shape of a search: break when found, else report “not found”. Remove the key from the inventory in the rig and watch the <code>else</code> fire.</p>',
    ru: '<p>Ещё два инструмента. <code>continue</code> пропускает остаток тела и прыгает к следующему витку — «не этот, следующий». А у цикла может быть <code>else</code>: он выполняется <b>только если цикл не был остановлен через <code>break</code></b>. Ровно так устроен поиск: break, когда нашли, иначе сообщить «не найдено». Убери ключ из инвентаря на стенде и смотри, как срабатывает <code>else</code>.</p>',
  },
  'ch.loopextra.hood': {
    en: '<p>Nested loops multiply: two loops over n items are O(n²), three are O(n³). The comparison-based sorts in PY-06 (bubble, selection, insertion) are all nested loops, which is why 10 000 items take seconds while <code>sorted()</code> takes milliseconds. <code>for … else</code> is unique to Python and reads better as “<code>nobreak</code>”; many teams avoid it for clarity and use a flag or a function with an early <code>return</code> instead. <code>break</code> and <code>continue</code> only affect the innermost loop; to leave two loops at once, put them in a function and <code>return</code>.</p>',
    ru: '<p>Вложенные циклы перемножаются: два цикла по n элементов — O(n²), три — O(n³). Сортировки сравнением из PY-06 (пузырьком, выбором, вставками) — сплошь вложенные циклы, поэтому 10 000 элементов занимают секунды, а <code>sorted()</code> — миллисекунды. <code>for … else</code> есть только в Python и лучше читается как «<code>nobreak</code>»; многие команды избегают его ради ясности и берут флаг или функцию с ранним <code>return</code>. <code>break</code> и <code>continue</code> действуют только на ближайший цикл; чтобы выйти из двух сразу, заверни их в функцию и сделай <code>return</code>.</p>',
  },
  'rig.nested.title': { en: 'A multiplication table from two loops', ru: 'Таблица умножения из двух циклов' },
  'rig.nested.l4': { en: e => `Inner loop: <code>col</code> = ${e.repr} while <code>row</code> stays the same.`, ru: e => `Внутренний цикл: <code>col</code> = ${e.repr}, пока <code>row</code> не меняется.` },
  'rig.nested.l2': { en: e => `Outer loop: <code>row</code> = ${e.repr}; the whole inner loop will now run again.`, ru: e => `Внешний цикл: <code>row</code> = ${e.repr}; сейчас внутренний цикл прокрутится целиком ещё раз.` },
  'rig.forelse.title': { en: 'Search with for … else', ru: 'Поиск через for … else' },
  'rig.forelse.l9': { en: () => 'The loop finished without <code>break</code> → <code>else</code> runs: nothing was found.', ru: () => 'Цикл закончился без <code>break</code> → выполняется <code>else</code>: ничего не нашли.' },
  'rig.forelse.l6': { en: () => '<code>break</code>: found it, leave the loop — and skip the <code>else</code>.', ru: () => '<code>break</code>: нашли, выходим из цикла — и пропускаем <code>else</code>.' },

  /* ---------- 05 functions ---------- */
  'ch.functions.h2': { en: 'Functions and frames', ru: 'Функции и кадры' },
  'ch.functions.short': { en: 'def packs steps under a name; a call opens a frame; return closes it.', ru: 'def упаковывает шаги под именем; вызов открывает кадр; return закрывает его.' },
  'ch.functions.lede': { en: '<code>def</code> does <b>not</b> run the body. It creates a function object and binds the name. The body runs later, each time you <b>call</b> the function with parentheses.', ru: '<code>def</code> <b>не</b> выполняет тело. Он создаёт объект-функцию и привязывает имя. Тело выполняется позже, каждый раз, когда ты <b>вызываешь</b> функцию со скобками.' },
  'ch.functions.body': {
    en: '<p>Watch the memory picture: at the call <code>area(w, h)</code> a new box appears on the left — the <b>frame</b> of <code>area</code> — holding the parameters <code>width</code> and <code>height</code> bound to the same objects the caller passed. The body computes <code>result</code>, and <code>return</code> sends the value back to the caller and throws the frame away, locals included. The caller then binds <code>room</code>. A function without <code>return</code> (or with a bare <code>return</code>) gives back <code>None</code>.</p>',
    ru: '<p>Смотри на картинку памяти: при вызове <code>area(w, h)</code> слева появляется новая коробка — <b>кадр</b> функции <code>area</code> — с параметрами <code>width</code> и <code>height</code>, привязанными к тем же объектам, что передал вызывающий. Тело вычисляет <code>result</code>, а <code>return</code> отправляет значение обратно и выбрасывает кадр вместе с локальными именами. Вызывающий затем привязывает <code>room</code>. Функция без <code>return</code> (или с голым <code>return</code>) возвращает <code>None</code>.</p>',
  },
  'ch.functions.body2': {
    en: '<p>Functions call functions. The frames stack up: <code>greet</code> is waiting while <code>shout</code> works, and the call stack panel shows them bottom to top. When <code>shout</code> returns, its frame disappears and <code>greet</code> continues from where it stopped. This stack is the same thing the traceback of PY-01 prints — and the engine of recursion in chapter 08.</p>',
    ru: '<p>Функции вызывают функции. Кадры громоздятся: <code>greet</code> ждёт, пока работает <code>shout</code>, а панель стека вызовов показывает их снизу вверх. Когда <code>shout</code> возвращается, её кадр исчезает, и <code>greet</code> продолжает с того места, где остановилась. Этот стек — то самое, что печатает traceback из PY-01, и двигатель рекурсии в главе 08.</p>',
  },
  'ch.functions.hood': {
    en: '<p>A function object holds a code object (bytecode, constants, local-variable names), its defaults, its globals dict and, if needed, closure cells. Calling it allocates a frame object with an array of “fast locals”; name lookup inside functions is an array index, not a dict lookup — one reason code inside functions runs faster than module-level code. Frames are on a heap-allocated stack; the default recursion limit of 1000 guards the C stack beneath.</p><p>Docstrings: a string as the first statement becomes <code>f.__doc__</code>. Type hints <code>def area(width: int, height: int) -> int:</code> are stored in <code>__annotations__</code> and not enforced. Compared with C#: no overloads (use defaults/<code>*args</code>), no <code>void</code> (it is <code>None</code>), functions are first-class values you can pass around (delegates for free).</p>',
    ru: '<p>Объект-функция держит объект кода (байткод, константы, имена локальных переменных), значения по умолчанию, словарь globals и при необходимости ячейки замыкания. Вызов выделяет объект кадра с массивом «быстрых локальных»; поиск имени внутри функции — индекс массива, а не поиск в словаре, одна из причин, почему код внутри функций быстрее кода уровня модуля. Кадры лежат в стеке в куче; лимит рекурсии 1000 по умолчанию защищает C-стек под ним.</p><p>Докстринги: строка первой инструкцией становится <code>f.__doc__</code>. Подсказки типов <code>def area(width: int, height: int) -> int:</code> хранятся в <code>__annotations__</code> и не проверяются. В сравнении с C#: нет перегрузок (значения по умолчанию и <code>*args</code>), нет <code>void</code> (это <code>None</code>), функции — полноценные значения, которые можно передавать (делегаты бесплатно).</p>',
  },
  'rig.funcframe.title': { en: 'A call opens a frame, return closes it', ru: 'Вызов открывает кадр, return закрывает' },
  'rig.funcframe.l1:def': { en: () => '<code>def</code> only creates the function object. Nothing inside runs yet.', ru: () => '<code>def</code> лишь создаёт объект-функцию. Внутри пока ничего не выполняется.' },
  'rig.funcframe.l1:call': { en: e => `New frame for <code>area</code>: ${e.args.map(([k, v]) => `<code>${k}=${v}</code>`).join(', ')}. The parameters point at the caller's objects.`, ru: e => `Новый кадр для <code>area</code>: ${e.args.map(([k, v]) => `<code>${k}=${v}</code>`).join(', ')}. Параметры указывают на объекты вызывающего.` },
  'rig.funcframe.l3': { en: e => `<code>return ${e.repr}</code>: the value goes back to the call site, the frame and its <code>result</code> vanish.`, ru: e => `<code>return ${e.repr}</code>: значение уходит в место вызова, кадр и его <code>result</code> исчезают.` },
  'rig.stackdepth.title': { en: 'Functions calling functions', ru: 'Функции вызывают функции' },
  'rig.stackdepth.stage': { en: 'call stack', ru: 'стек вызовов' },
  'rig.stackdepth.l4:call': { en: () => '<code>greet</code> is paused mid-expression while <code>shout</code> runs on top of it.', ru: () => '<code>greet</code> замерла посреди выражения, пока поверх неё работает <code>shout</code>.' },
  'rig.stackdepth.l6': { en: () => '<code>shout</code> returns; its frame is gone and <code>greet</code> can finish its own <code>return</code>.', ru: () => '<code>shout</code> возвращается; её кадр исчез, и <code>greet</code> может закончить свой <code>return</code>.' },
};
