/** PY-03 texts, chapters 06–10 and quizzes. */
export const CH_B = {
  /* ---------- 06 heap ---------- */
  'ch.heap.h2': { en: 'heap: the smallest is always on top', ru: 'Куча: наименьший всегда сверху' },
  'ch.heap.short': { en: 'heapq on a plain list; a tree hidden in an array; nlargest and nsmallest.', ru: 'heapq на обычном списке; дерево, спрятанное в массиве; nlargest и nsmallest.' },
  'ch.heap.lede': { en: 'A heap keeps a pile of values so that the smallest can be taken out in O(log n) — a priority queue. Python stores it in a plain list.', ru: 'Куча держит набор значений так, что наименьшее достаётся за O(log n) — приоритетная очередь. Python хранит её в обычном списке.' },
  'ch.heap.body': {
    en: '<p>The list <i>is</i> a binary tree: the children of index i are 2i + 1 and 2i + 2, and every parent is ≤ its children. <code>heappush</code> appends and lets the value “sift up” while it is smaller than its parent; <code>heappop</code> takes the root, moves the last item to the top and sifts it down. The tree view and the list view below are the same data — follow the swaps in both. <code>nsmallest</code>/<code>nlargest</code> use a heap of size k.</p>',
    ru: '<p>Список <i>и есть</i> двоичное дерево: дети индекса i — это 2i + 1 и 2i + 2, и каждый родитель ≤ своих детей. <code>heappush</code> добавляет в конец и даёт значению «всплыть», пока оно меньше родителя; <code>heappop</code> берёт корень, переносит последний элемент наверх и «просеивает» вниз. Вид дерева и вид списка ниже — одни и те же данные; следи за обменами в обоих. <code>nsmallest</code>/<code>nlargest</code> используют кучу размера k.</p>',
  },
  'ch.heap.hood': {
    en: '<p><code>heapq</code> is a min-heap only; for a max-heap push <code>-value</code> or <code>(-priority, item)</code> tuples. Tuples compare by first element, so <code>(priority, counter, task)</code> is the standard way to break ties without comparing the tasks themselves. <code>heapify</code> builds a heap in O(n), not n log n. Dijkstra, event simulation and “top k of a stream” all live on this module. C# has <code>PriorityQueue&lt;TElement, TPriority&gt;</code> since .NET 6.</p>',
    ru: '<p><code>heapq</code> — только min-куча; для max-кучи клади <code>-value</code> или кортежи <code>(-priority, item)</code>. Кортежи сравниваются по первому элементу, поэтому <code>(priority, counter, task)</code> — стандартный способ разрешать ничьи, не сравнивая сами задачи. <code>heapify</code> строит кучу за O(n), а не n log n. Дейкстра, событийное моделирование и «top k из потока» живут на этом модуле. В C# с .NET 6 есть <code>PriorityQueue&lt;TElement, TPriority&gt;</code>.</p>',
  },
  'rig.heap.title': { en: 'heappush and heappop', ru: 'heappush и heappop' },
  'rig.heap.stage': { en: 'tree · list', ru: 'дерево · список' },
  'rig.heap.l4': { en: () => 'Append at the end, then swap upward while smaller than the parent — the highlighted cells are the path.', ru: () => 'Добавить в конец, затем меняться с родителем, пока меньше него — подсвеченные ячейки и есть путь.' },
  'rig.heap.l6': { en: e => `Two pops give the two smallest in order: ${e.printed.trim()}. After each pop the last item sifts down from the root.`, ru: e => `Два pop дают два наименьших по порядку: ${e.printed.trim()}. После каждого pop последний элемент просеивается вниз от корня.` },

  /* ---------- 07 comprehensions ---------- */
  'ch.comp.h2': { en: 'Comprehensions', ru: 'Включения' },
  'ch.comp.short': { en: '[expr for x in xs if cond] for lists, dicts and sets; nested loops in one line.', ru: '[expr for x in xs if cond] для списков, словарей и множеств; вложенные циклы в одну строку.' },
  'ch.comp.lede': { en: 'A comprehension is a loop that builds a collection, written as one expression: <i>what</i> to collect, <i>from where</i>, <i>under which condition</i>.', ru: 'Включение — цикл, строящий коллекцию, записанный одним выражением: <i>что</i> собирать, <i>откуда</i>, <i>при каком условии</i>.' },
  'ch.comp.body': {
    en: '<p>Compare the four-line loop with the one-liner in the rig: same result, and the one-liner says what it means at a glance. Two <code>for</code> clauses nest left to right. <code>[[0] * 3 for _ in range(2)]</code> is the right way to make a grid — unlike <code>[[0] * 3] * 2</code>, which repeats one inner list (chapter 01 quiz). Dict comprehensions <code>{k: v for …}</code> and set comprehensions <code>{x for …}</code> use the same shape.</p>',
    ru: '<p>Сравни цикл из четырёх строк и однострочник на стенде: результат тот же, а однострочник сразу говорит, что значит. Два <code>for</code> вкладываются слева направо. <code>[[0] * 3 for _ in range(2)]</code> — правильный способ сделать сетку, в отличие от <code>[[0] * 3] * 2</code>, который повторяет один внутренний список (квиз главы 01). Включения словарей <code>{k: v for …}</code> и множеств <code>{x for …}</code> — той же формы.</p>',
  },
  'ch.comp.hood': {
    en: '<p>A list comprehension runs about 30 % faster than the equivalent <code>append</code> loop: the loop body is a specialised bytecode sequence (LIST_APPEND) with no method lookup. Since 3.12 comprehensions are inlined into the enclosing function (PEP 709) but the loop variable still does not leak. Keep them to one or two clauses; a comprehension with side effects or three nested loops is a loop in disguise and should be written as one. A generator expression <code>(x for …)</code> is the lazy sibling (next chapter): <code>sum(x * x for x in big)</code> never builds a list.</p>',
    ru: '<p>Включение списка работает примерно на 30 % быстрее эквивалентного цикла с <code>append</code>: тело — специализированная последовательность байткода (LIST_APPEND) без поиска метода. С 3.12 включения встраиваются в объемлющую функцию (PEP 709), но переменная цикла по-прежнему не утекает. Держи их в один-два пункта; включение с побочными эффектами или тремя вложенными циклами — это замаскированный цикл, и писать его надо как цикл. Генераторное выражение <code>(x for …)</code> — ленивый близнец (следующая глава): <code>sum(x * x for x in big)</code> никогда не строит список.</p>',
  },
  'rig.listcomp.title': { en: 'Loop versus comprehension', ru: 'Цикл против включения' },
  'rig.listcomp.l7': { en: e => `One expression, same list: <code>${e.printed.trim()}</code>. The loop variable <code>x</code> did not leak into the names.`, ru: e => `Одно выражение, тот же список: <code>${e.printed.trim()}</code>. Переменная <code>x</code> не вытекла в имена.` },
  'rig.listcomp.l9': { en: () => 'A fresh inner list per row: changing one row will not change the others.', ru: () => 'Свежий внутренний список на каждую строку: изменение одной строки не тронет остальные.' },
  'rig.dictcomp.title': { en: 'Dict and set comprehensions', ru: 'Включения словарей и множеств' },
  'rig.dictcomp.l8': { en: () => 'Swapping keys and values: if two words had the same length, the later one would win the key.', ru: () => 'Меняем ключи и значения местами: если бы два слова имели одну длину, ключ достался бы последнему.' },

  /* ---------- 08 iterators and generators ---------- */
  'ch.iter.h2': { en: 'Iterators and generators', ru: 'Итераторы и генераторы' },
  'ch.iter.short': { en: 'What for does behind the scenes; yield freezes a frame; lazy pipelines; itertools.', ru: 'Что делает for за кулисами; yield замораживает кадр; ленивые конвейеры; itertools.' },
  'ch.iter.lede': { en: 'Everything a <code>for</code> can walk is an <b>iterable</b>; <code>iter()</code> turns it into an <b>iterator</b>, and <code>next()</code> pulls items until <code>StopIteration</code>.', ru: 'Всё, по чему может идти <code>for</code>, — <b>итерируемое</b>; <code>iter()</code> превращает его в <b>итератор</b>, а <code>next()</code> тянет элементы до <code>StopIteration</code>.' },
  'ch.iter.body': {
    en: '<p>The rig does by hand what <code>for</code> does automatically: <code>it = iter(songs)</code>, then <code>next(it)</code> three times, then <code>StopIteration</code>. A <code>for</code> loop is exactly this plus catching the exception. Files, dict views, <code>range</code>, <code>zip</code> and your own classes all speak this protocol.</p>',
    ru: '<p>Стенд делает руками то, что <code>for</code> делает автоматически: <code>it = iter(songs)</code>, потом три раза <code>next(it)</code>, потом <code>StopIteration</code>. Цикл <code>for</code> — ровно это плюс перехват исключения. Файлы, представления словаря, <code>range</code>, <code>zip</code> и твои классы говорят на этом протоколе.</p>',
  },
  'ch.iter.body2': {
    en: '<p>A function with <code>yield</code> is a <b>generator</b>. Calling it runs nothing — it returns a generator object. Each <code>next()</code> runs the body up to the next <code>yield</code>, hands out the value and <b>freezes the frame</b> with all its locals; the next <code>next()</code> thaws it right there. Watch “ignition” print only at the first <code>next</code>, and “liftoff” only when the body finally runs out. The memory picture shows the frozen frame as a generator box.</p>',
    ru: '<p>Функция с <code>yield</code> — <b>генератор</b>. Вызов ничего не выполняет — он возвращает объект-генератор. Каждый <code>next()</code> выполняет тело до следующего <code>yield</code>, отдаёт значение и <b>замораживает кадр</b> со всеми локальными; следующий <code>next()</code> размораживает его ровно там. Смотри: «ignition» печатается только на первом <code>next</code>, а «liftoff» — только когда тело наконец кончается. На картинке памяти замороженный кадр — коробка генератора.</p>',
  },
  'ch.iter.body3': {
    en: '<p>Laziness is the point. <code>range(10 ** 9)</code> is created instantly; <code>(x * x for x in …)</code> computes a square only when asked; <code>next(x for x in squares if x &gt; 50)</code> stops at the first hit. Iterators are one-shot: the second <code>list(evens)</code> is empty because the first one drained it. <code>itertools</code> is a box of lazy building blocks: chain, product, permutations, combinations, islice, count.</p>',
    ru: '<p>Лень — главное. <code>range(10 ** 9)</code> создаётся мгновенно; <code>(x * x for x in …)</code> считает квадрат только по запросу; <code>next(x for x in squares if x &gt; 50)</code> останавливается на первом попадании. Итераторы одноразовые: второй <code>list(evens)</code> пуст, потому что первый всё выкачал. <code>itertools</code> — коробка ленивых кирпичей: chain, product, permutations, combinations, islice, count.</p>',
  },
  'ch.iter.hood': {
    en: '<p>Protocol: <code>iter(x)</code> calls <code>x.__iter__()</code>; the result must have <code>__next__()</code> raising <code>StopIteration</code> when done; an iterator’s own <code>__iter__</code> returns <code>self</code>. A generator object implements both on top of a suspended frame — its <code>gi_frame</code> keeps the locals and the instruction pointer. <code>yield</code> is also an expression: <code>received = yield value</code> gets what the caller passes to <code>gen.send()</code> — the basis of coroutines and <code>asyncio</code> (PY-05). <code>yield from sub</code> delegates to another iterator. Memory: a list of a million ints is ~36 MB; the generator producing them is ~200 bytes. C#’s <code>IEnumerable</code>/<code>yield return</code> is the same machinery.</p>',
    ru: '<p>Протокол: <code>iter(x)</code> вызывает <code>x.__iter__()</code>; результат должен иметь <code>__next__()</code>, бросающий <code>StopIteration</code> в конце; собственный <code>__iter__</code> итератора возвращает <code>self</code>. Объект-генератор реализует оба поверх приостановленного кадра — его <code>gi_frame</code> хранит локальные и указатель инструкции. <code>yield</code> — ещё и выражение: <code>received = yield value</code> получает то, что вызывающий передал в <code>gen.send()</code>, — основа сопрограмм и <code>asyncio</code> (PY-05). <code>yield from sub</code> делегирует другому итератору. Память: список из миллиона int — ~36 МБ; генератор, который их порождает, — ~200 байт. <code>IEnumerable</code>/<code>yield return</code> в C# — та же машинерия.</p>',
  },
  'rig.iterproto.title': { en: 'What for does by hand', ru: 'Что for делает вручную' },
  'rig.iterproto.l2': { en: () => '<code>iter()</code> makes an iterator: a cursor that remembers where it is in the list.', ru: () => '<code>iter()</code> создаёт итератор: курсор, который помнит, где он в списке.' },
  'rig.iterproto.l8': { en: () => 'Nothing left: <code>next</code> raises <code>StopIteration</code>; a <code>for</code> loop catches exactly this to stop.', ru: () => 'Ничего не осталось: <code>next</code> бросает <code>StopIteration</code>; цикл <code>for</code> ловит ровно это, чтобы остановиться.' },
  'rig.generator.title': { en: 'yield freezes the frame', ru: 'yield замораживает кадр' },
  'rig.generator.l8': { en: () => 'Calling a generator function runs <b>nothing</b>: “ignition” has not printed. You get a generator object.', ru: () => 'Вызов генераторной функции <b>ничего</b> не выполняет: «ignition» ещё не напечатано. Ты получаешь объект-генератор.' },
  'rig.generator.l4:yield': { en: e => `<code>yield ${e.repr}</code>: the value goes out, the frame with <code>n=${e.repr}</code> is frozen right here.`, ru: e => `<code>yield ${e.repr}</code>: значение уходит наружу, кадр с <code>n=${e.repr}</code> замораживается прямо здесь.` },
  'rig.lazy.title': { en: 'Lazy things cost nothing until used', ru: 'Ленивое ничего не стоит, пока не используется' },
  'rig.lazy.l2': { en: () => 'A billion-element range: no memory, instant len and indexing — it only stores start, stop, step.', ru: () => 'Диапазон на миллиард: без памяти, мгновенные len и индекс — он хранит только start, stop, step.' },
  'rig.lazy.l8': { en: () => 'The first <code>list(evens)</code> drained the iterator; the second gets nothing. One-shot.', ru: () => 'Первый <code>list(evens)</code> выкачал итератор; второму ничего не досталось. Одноразовый.' },
  'rig.itertools.title': { en: 'itertools in five lines', ru: 'itertools в пять строк' },

  /* ---------- 09 sorting ---------- */
  'ch.sorting.h2': { en: 'sorted, key and stability', ru: 'sorted, key и стабильность' },
  'ch.sorting.short': { en: 'sorted() returns new, .sort() changes in place; key functions; sort by several fields.', ru: 'sorted() возвращает новый, .sort() меняет на месте; функции-ключи; сортировка по нескольким полям.' },
  'ch.sorting.lede': { en: '<code>sorted(things, key=f)</code> sorts by whatever <code>f</code> returns, and never compares two things that <code>f</code> maps to equal keys — it keeps their original order. That is <b>stability</b>.', ru: '<code>sorted(things, key=f)</code> сортирует по тому, что возвращает <code>f</code>, и никогда не переставляет две вещи, которые <code>f</code> отображает в равные ключи, — сохраняет их исходный порядок. Это <b>стабильность</b>.' },
  'ch.sorting.body': {
    en: '<p><code>sorted()</code> works on anything iterable and returns a new list; <code>list.sort()</code> sorts in place and returns <code>None</code>. Uppercase letters sort before lowercase (“Luna” before “nova” before “pixel” — but “Kira” before “Luna”), so <code>key=str.lower</code> is the usual fix. <code>key=len</code>, <code>key=lambda kv: kv[1]</code>, and a tuple key <code>(len(s), s.lower())</code> for “by length, then alphabetically”. <code>reverse=True</code> flips the order and keeps stability.</p>',
    ru: '<p><code>sorted()</code> работает с любым итерируемым и возвращает новый список; <code>list.sort()</code> сортирует на месте и возвращает <code>None</code>. Заглавные буквы идут раньше строчных («Luna» раньше «nova» раньше «pixel», но «Kira» раньше «Luna»), поэтому обычное лекарство — <code>key=str.lower</code>. <code>key=len</code>, <code>key=lambda kv: kv[1]</code> и кортеж-ключ <code>(len(s), s.lower())</code> для «по длине, затем по алфавиту». <code>reverse=True</code> разворачивает порядок и сохраняет стабильность.</p>',
  },
  'ch.sorting.body2': {
    en: '<p>Stability lets you sort by several fields in rounds: first by the <i>secondary</i> key (name), then by the primary (score) — equal scores keep the name order from round one. A tuple key does it in one go: <code>key=lambda c: (c[1], c[0])</code>. To sort one field descending and another ascending, negate the number: <code>(-c[1], c[0])</code>.</p>',
    ru: '<p>Стабильность позволяет сортировать по нескольким полям раундами: сначала по <i>вторичному</i> ключу (имя), затем по главному (очки) — равные очки сохраняют порядок имён из первого раунда. Кортеж-ключ делает это за раз: <code>key=lambda c: (c[1], c[0])</code>. Чтобы одно поле шло по убыванию, а другое по возрастанию, отрицай число: <code>(-c[1], c[0])</code>.</p>',
  },
  'ch.sorting.hood': {
    en: '<p>Python uses Timsort: it finds already-sorted “runs” in the data, extends short ones with insertion sort, and merges runs with galloping when one side is winning. Result: O(n log n) worst case, O(n) on sorted or reversed input, stable, and it calls the key function exactly once per element (the keys are precomputed — “decorate, sort, undecorate”). Comparing mixed types raises <code>TypeError</code>; <code>functools.cmp_to_key</code> adapts an old-style comparison function. Since 3.11 the sort is also faster on lists of ints or strings thanks to type-specialised comparisons. C#’s <code>List.Sort</code> is an unstable introsort; <code>OrderBy</code> in LINQ is stable.</p>',
    ru: '<p>Python использует Timsort: он находит в данных уже отсортированные «прогоны», удлиняет короткие сортировкой вставками и сливает прогоны с «галопом», когда одна сторона выигрывает. Итог: O(n log n) в худшем случае, O(n) на отсортированном или обратном входе, стабильность, и функция-ключ вызывается ровно по разу на элемент (ключи предвычисляются — «decorate, sort, undecorate»). Сравнение разных типов даёт <code>TypeError</code>; <code>functools.cmp_to_key</code> адаптирует старую функцию сравнения. С 3.11 сортировка списков int или строк ещё быстрее благодаря специализированным сравнениям. <code>List.Sort</code> в C# — нестабильный introsort; <code>OrderBy</code> в LINQ стабилен.</p>',
  },
  'rig.sortkey.title': { en: 'key= decides the order', ru: 'key= решает порядок' },
  'rig.sortkey.l2': { en: e => `Default order compares code points: uppercase first — <code>${e.printed.trim()}</code>.`, ru: e => `Порядок по умолчанию сравнивает кодовые точки: заглавные раньше — <code>${e.printed.trim()}</code>.` },
  'rig.sortkey.l3': { en: () => '<code>key=str.lower</code>: each name is compared by its lowercase version; the list still holds the originals.', ru: () => '<code>key=str.lower</code>: каждое имя сравнивается по своей строчной версии; в списке по-прежнему оригиналы.' },
  'rig.stable.title': { en: 'Stable sort, several keys', ru: 'Стабильная сортировка, несколько ключей' },
  'rig.stable.l2': { en: () => 'Equal scores keep their original order: Nova before Zed, Luna before Kira. That is stability.', ru: () => 'Равные очки сохраняют исходный порядок: Nova раньше Zed, Luna раньше Kira. Это стабильность.' },
  'rig.stable.l5': { en: () => 'Two rounds: by name first, then by score — stability keeps the names sorted within equal scores.', ru: () => 'Два раунда: сначала по имени, потом по очкам — стабильность сохраняет имена отсортированными внутри равных очков.' },

  /* ---------- 10 cheat ---------- */
  'ch.cheat.h2': { en: 'Cheat sheet PY-03: what each operation costs', ru: 'Шпаргалка PY-03: сколько стоит каждая операция' },
  'ch.cheat.short': { en: 'Big-O for list, dict, set, deque, heap in one table.', ru: 'O-оценки для list, dict, set, deque, heap в одной таблице.' },
  'ch.cheat.lede': { en: 'n is the size of the container. “Amortised” means usually cheap, occasionally a resize.', ru: 'n — размер контейнера. «Амортизированно» значит обычно дёшево, изредка — перестройка.' },
  'ch.cheat.table': {
    en: `<table><thead><tr><th>Operation</th><th>list</th><th>dict</th><th>set</th><th>deque</th><th>heapq</th></tr></thead><tbody>
<tr><td>x in c</td><td>O(n)</td><td>O(1)</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr>
<tr><td>c[i] / c[key]</td><td>O(1)</td><td>O(1)</td><td>—</td><td>O(n) middle, O(1) ends</td><td>c[0] = min</td></tr>
<tr><td>append / add</td><td>O(1) amortised</td><td>O(1) amortised</td><td>O(1) amortised</td><td>O(1) both ends</td><td>push O(log n)</td></tr>
<tr><td>insert(0) / appendleft</td><td>O(n)</td><td>—</td><td>—</td><td>O(1)</td><td>—</td></tr>
<tr><td>pop() / pop(0) / popleft</td><td>O(1) / O(n)</td><td>pop(key) O(1)</td><td>O(1)</td><td>O(1) both ends</td><td>pop O(log n)</td></tr>
<tr><td>remove(x) / del</td><td>O(n)</td><td>O(1)</td><td>O(1)</td><td>O(n)</td><td>—</td></tr>
<tr><td>len</td><td>O(1)</td><td>O(1)</td><td>O(1)</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>slice c[a:b]</td><td>O(b − a)</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td>iterate</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n), not sorted</td></tr>
<tr><td>sort / sorted</td><td>O(n log n), stable</td><td>sorted(d) keys</td><td>sorted(s)</td><td>sorted(d)</td><td>heapify O(n)</td></tr>
<tr><td>copy</td><td>c[:] O(n)</td><td>dict(d) O(n)</td><td>set(s) O(n)</td><td>deque(d) O(n)</td><td>c[:]</td></tr>
<tr><td>keys must be</td><td>—</td><td>hashable</td><td>hashable</td><td>—</td><td>comparable</td></tr>
</tbody></table>`,
    ru: `<table><thead><tr><th>Операция</th><th>list</th><th>dict</th><th>set</th><th>deque</th><th>heapq</th></tr></thead><tbody>
<tr><td>x in c</td><td>O(n)</td><td>O(1)</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr>
<tr><td>c[i] / c[key]</td><td>O(1)</td><td>O(1)</td><td>—</td><td>O(n) середина, O(1) края</td><td>c[0] = min</td></tr>
<tr><td>append / add</td><td>O(1) амортиз.</td><td>O(1) амортиз.</td><td>O(1) амортиз.</td><td>O(1) с обоих концов</td><td>push O(log n)</td></tr>
<tr><td>insert(0) / appendleft</td><td>O(n)</td><td>—</td><td>—</td><td>O(1)</td><td>—</td></tr>
<tr><td>pop() / pop(0) / popleft</td><td>O(1) / O(n)</td><td>pop(key) O(1)</td><td>O(1)</td><td>O(1) с обоих концов</td><td>pop O(log n)</td></tr>
<tr><td>remove(x) / del</td><td>O(n)</td><td>O(1)</td><td>O(1)</td><td>O(n)</td><td>—</td></tr>
<tr><td>len</td><td>O(1)</td><td>O(1)</td><td>O(1)</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>срез c[a:b]</td><td>O(b − a)</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td>обход</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td><td>O(n), не по порядку</td></tr>
<tr><td>sort / sorted</td><td>O(n log n), стабильно</td><td>sorted(d) — ключи</td><td>sorted(s)</td><td>sorted(d)</td><td>heapify O(n)</td></tr>
<tr><td>копия</td><td>c[:] O(n)</td><td>dict(d) O(n)</td><td>set(s) O(n)</td><td>deque(d) O(n)</td><td>c[:]</td></tr>
<tr><td>ключи должны быть</td><td>—</td><td>хэшируемые</td><td>хэшируемые</td><td>—</td><td>сравнимые</td></tr>
</tbody></table>`,
  },

  /* ---------- quizzes ---------- */
  'quiz.q-listalias.why': { en: '<code>b</code> is the same list as <code>a</code>, so the append shows in both; <code>c</code> is a slice copy made before the append.', ru: '<code>b</code> — тот же список, что <code>a</code>, поэтому append виден в обоих; <code>c</code> — копия срезом, сделанная до append.' },
  'quiz.q-shallow.why': { en: '<code>[[0] * 2] * 2</code> repeats one inner list twice; changing it changes “both” rows. Use a comprehension to get separate rows.', ru: '<code>[[0] * 2] * 2</code> дважды повторяет один внутренний список; его изменение меняет «обе» строки. Используй включение, чтобы строки были разными.' },
  'quiz.q-tuple.why': { en: '<code>t += (3,)</code> builds a new tuple (no error); <code>(4)</code> is just the int 4 — a tuple needs a comma.', ru: '<code>t += (3,)</code> строит новый кортеж (без ошибки); <code>(4)</code> — просто int 4, кортежу нужна запятая.' },
  'quiz.q-dictget.why': { en: '<code>get</code> returns None or the given default; <code>setdefault</code> stores 5 under "c" and returns it.', ru: '<code>get</code> возвращает None или переданное значение по умолчанию; <code>setdefault</code> сохраняет 5 под "c" и возвращает его.' },
  'quiz.q-dictkey.why': { en: 'A list is mutable and therefore unhashable; dict keys must be hashable. Use a tuple.', ru: 'Список изменяем и потому нехэшируем; ключи словаря должны быть хэшируемыми. Бери кортеж.' },
  'quiz.q-set.why': { en: 'Intersection {3}, difference {1, 2}, union has four distinct values.', ru: 'Пересечение {3}, разность {1, 2}, в объединении четыре разных значения.' },
  'quiz.q-popzero.why': { en: '<code>appendleft(0)</code> puts 0 at the front, <code>append(4)</code> at the back; popping both ends leaves [1, 2, 3].', ru: '<code>appendleft(0)</code> ставит 0 вперёд, <code>append(4)</code> — назад; снятие с обоих концов оставляет [1, 2, 3].' },
  'quiz.q-heap.why': { en: 'After <code>heapify</code> the smallest is at index 0; the two pops return the two smallest in order: 1, then 3.', ru: 'После <code>heapify</code> наименьший в индексе 0; два pop возвращают два наименьших по порядку: 1, затем 3.' },
  'quiz.q-comp.why': { en: '<code>x % 2</code> is truthy for odd x: 1 and 3, doubled → [2, 6].', ru: '<code>x % 2</code> истинно для нечётных x: 1 и 3, удвоенные → [2, 6].' },
  'quiz.q-gen.why': { en: '<code>next</code> takes 1; <code>list(it)</code> drains the rest [2]; the generator is exhausted, so the second list is empty.', ru: '<code>next</code> берёт 1; <code>list(it)</code> выкачивает остаток [2]; генератор исчерпан, второй список пуст.' },
  'quiz.q-stable.why': { en: 'Sorting by the number keeps the original order of equal numbers: b before c (both 1), then a.', ru: 'Сортировка по числу сохраняет исходный порядок равных чисел: b раньше c (у обоих 1), затем a.' },
  'quiz.q-fill-comp.why': { en: '<code>[n.upper() for n in names]</code> applies the method to each item and collects the results.', ru: '<code>[n.upper() for n in names]</code> применяет метод к каждому элементу и собирает результаты.' },
  'quiz.q-order-gen.why': { en: 'def, then the loop, then the condition, then yield inside it; the print comes last and consumes the generator.', ru: 'def, затем цикл, затем условие, затем yield внутри него; print в конце и потребляет генератор.' },
};
