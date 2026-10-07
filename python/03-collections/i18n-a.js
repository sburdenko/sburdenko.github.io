/** PY-03 texts, chapters 00–05. */
export const CH_A = {
  'page.title': { en: 'Collections, deeply · PY-03', ru: 'Коллекции глубоко · PY-03' },
  'page.desc': {
    en: 'Lists and their growth, tuples, dict as a hash table, sets, stack and queue, heap, comprehensions, iterators and generators, stable sorting. Every example runs in the browser step by step.',
    ru: 'Списки и их рост, кортежи, dict как хэш-таблица, множества, стек и очередь, куча, включения, итераторы и генераторы, стабильная сортировка. Каждый пример выполняется в браузере по шагам.',
  },
  'py.osd.stand': { en: 'PYTHON', ru: 'PYTHON' },
  'py.foot.stand': { en: 'Python stand', ru: 'Стенд Python' },
  'py.foot.prev02': { en: '◀ PY-02 · Flow', ru: '◀ PY-02 · Поток' },
  'py.foot.next04': { en: 'Next: PY-04 · Strings, files, errors ►', ru: 'Дальше: PY-04 · Строки, файлы, ошибки ►' },
  'foot.stop': { en: '■ END OF TAPE', ru: '■ КОНЕЦ КАССЕТЫ' },
  'foot.src': { en: 'Source code and models:', ru: 'Исходный код и модели:' },
  'hero.eyebrow': { en: 'PY-03 · Python · stand B', ru: 'PY-03 · Python · стенд B' },
  'hero.title': { en: 'Collections', ru: 'Коллекции' },
  'hero.subtitle': { en: 'list, tuple, dict, set — and what they cost', ru: 'list, tuple, dict, set — и что они стоят' },
  'hero.lede': {
    en: 'Four containers do most of the work in Python. This tape shows how each one is built, which operations are cheap and which are secretly expensive, and the tricks around them: comprehensions, generators, stable sorting. The memory picture now draws lists with their spare room, dicts as key → value rows, and generators as frozen frames.',
    ru: 'Четыре контейнера делают в Python большую часть работы. Эта кассета показывает, как устроен каждый, какие операции дёшевы, а какие втайне дороги, и приёмы вокруг них: включения, генераторы, стабильную сортировку. Картинка памяти теперь рисует списки с запасом места, словари как строки ключ → значение, а генераторы — как замороженные кадры.',
  },
  'hero.mapH': { en: 'Chapters', ru: 'Главы' },

  /* ---------- 01 list ---------- */
  'ch.list.h2': { en: 'list: the workhorse', ru: 'list: рабочая лошадка' },
  'ch.list.short': { en: 'append, insert, pop, slices, copies — and why insert(0) is slow.', ru: 'append, insert, pop, срезы, копии — и почему insert(0) медленный.' },
  'ch.list.lede': { en: 'A list is an ordered row of references that can grow, shrink and change in place. Under the hood it is an array with spare room at the end.', ru: 'Список — упорядоченный ряд ссылок, который растёт, сжимается и меняется на месте. Под капотом это массив с запасом места в конце.' },
  'ch.list.body': {
    en: '<p>The everyday methods: <code>append(x)</code> adds at the end, <code>insert(i, x)</code> squeezes in at position i, <code>pop()</code> removes and returns the last (or <code>pop(i)</code> any position), <code>remove(x)</code> deletes the first equal value, <code>index(x)</code> finds it, <code>x in list</code> asks. Assigning <code>songs[0] = 7</code> replaces one slot; <code>reverse()</code> and <code>sort()</code> change the list in place and return <code>None</code> — a classic bug is <code>a = a.sort()</code>.</p>',
    ru: '<p>Повседневные методы: <code>append(x)</code> добавляет в конец, <code>insert(i, x)</code> втискивает на позицию i, <code>pop()</code> удаляет и возвращает последний (или <code>pop(i)</code> любой), <code>remove(x)</code> удаляет первое равное значение, <code>index(x)</code> находит его, <code>x in list</code> спрашивает. Присваивание <code>songs[0] = 7</code> заменяет одну ячейку; <code>reverse()</code> и <code>sort()</code> меняют список на месте и возвращают <code>None</code> — классический баг: <code>a = a.sort()</code>.</p>',
  },
  'ch.list.body2': {
    en: '<p>Copies, three depths. <code>b = a</code> is no copy (one list, two names). <code>c = a[:]</code> is a <b>shallow</b> copy: a new outer list whose items are the <i>same</i> inner objects — change an inner list and both see it. <code>copy.deepcopy(a)</code> copies all the way down. The memory picture makes this obvious: count the arrows into the inner lists.</p>',
    ru: '<p>Копии трёх глубин. <code>b = a</code> — не копия (один список, два имени). <code>c = a[:]</code> — <b>поверхностная</b> копия: новый внешний список, чьи элементы — <i>те же</i> внутренние объекты; измени внутренний список — увидят оба. <code>copy.deepcopy(a)</code> копирует до самого дна. Картинка памяти делает это очевидным: посчитай стрелки во внутренние списки.</p>',
  },
  'ch.list.hood': {
    en: '<p>A CPython list is a struct with a pointer to an array of object pointers, a length and an allocated capacity. <code>append</code> is amortised O(1): when the array is full, CPython allocates about 12.5 % more than needed (the pattern 0, 4, 8, 16, 24, 32, 40, 52, 64 …), so most appends just write into spare room. The rig below prints <code>sys.getsizeof</code> after each append: 56 bytes of header plus 8 per allocated slot — watch it jump only at the growth points, and watch the dashed free cells in the memory picture.</p><p><code>insert(0, x)</code> and <code>pop(0)</code> must shift every element: O(n). That is why a queue is a <code>deque</code> (chapter 05). Slicing copies: <code>a[1:]</code> is O(n). <code>x in list</code> is a linear scan — use a set when you ask often. C#’s <code>List&lt;T&gt;</code> is the same design (doubling instead of 12.5 %).</p>',
    ru: '<p>Список CPython — структура с указателем на массив указателей на объекты, длиной и выделенной ёмкостью. <code>append</code> амортизированно O(1): когда массив полон, CPython выделяет примерно на 12,5 % больше нужного (ряд 0, 4, 8, 16, 24, 32, 40, 52, 64 …), так что большинство append просто пишут в запас. Стенд ниже печатает <code>sys.getsizeof</code> после каждого append: 56 байт заголовка плюс 8 на выделенную ячейку — смотри, как число прыгает только в точках роста, и смотри на пунктирные свободные ячейки на картинке памяти.</p><p><code>insert(0, x)</code> и <code>pop(0)</code> должны сдвинуть все элементы: O(n). Поэтому очередь — это <code>deque</code> (глава 05). Срезы копируют: <code>a[1:]</code> — O(n). <code>x in list</code> — линейный просмотр; когда спрашиваешь часто, бери множество. <code>List&lt;T&gt;</code> в C# устроен так же (удвоение вместо 12,5 %).</p>',
  },
  'rig.listops.title': { en: 'Everyday list methods', ru: 'Повседневные методы списка' },
  'rig.listops.l3': { en: () => '<code>insert(0, …)</code> shifts every element one slot to the right: cheap here, O(n) in general.', ru: () => '<code>insert(0, …)</code> сдвигает все элементы на ячейку вправо: здесь дёшево, в общем случае O(n).' },
  'rig.listops.l10': { en: () => '<code>reverse()</code> works in place and returns None; do not write <code>songs = songs.reverse()</code>.', ru: () => '<code>reverse()</code> работает на месте и возвращает None; не пиши <code>songs = songs.reverse()</code>.' },
  'rig.listcopy.title': { en: 'Alias, shallow copy, deep copy', ru: 'Псевдоним, поверхностная копия, глубокая копия' },
  'rig.listcopy.l3': { en: () => 'A new outer list, but its two arrows point at the same inner lists as <code>a</code>.', ru: () => 'Новый внешний список, но его две стрелки указывают на те же внутренние списки, что и у <code>a</code>.' },
  'rig.listcopy.l5': { en: () => '<code>deepcopy</code>: inner lists are copied too — no shared arrows at all.', ru: () => '<code>deepcopy</code>: внутренние списки тоже скопированы — общих стрелок нет вовсе.' },
  'rig.listcopy.l6': { en: () => 'Changing an inner list through <code>a</code>: <code>b</code> and the shallow copy <code>c</code> see it, <code>d</code> does not.', ru: () => 'Меняем внутренний список через <code>a</code>: <code>b</code> и поверхностная копия <code>c</code> это видят, <code>d</code> — нет.' },
  'rig.listgrow.title': { en: 'Under the hood: how a list grows', ru: 'Под капотом: как растёт список' },
  'rig.listgrow.l4': { en: e => `${e.printed.trim()} — look at the dashed cells: spare slots allocated ahead of time.`, ru: e => `${e.printed.trim()} — смотри на пунктирные ячейки: запас выделен заранее.` },
  'rig.listcost.title': { en: 'Under the hood: the ends are not equal', ru: 'Под капотом: концы не равноправны' },
  'rig.listcost.l3': { en: () => '<code>insert(0, …)</code>: every cell was written (all highlighted) — O(n).', ru: () => '<code>insert(0, …)</code>: записана каждая ячейка (все подсвечены) — O(n).' },
  'rig.listcost.l5': { en: () => '<code>pop(0)</code> shifts everything left again. For a queue, use <code>deque</code>.', ru: () => '<code>pop(0)</code> снова сдвигает всё влево. Для очереди бери <code>deque</code>.' },

  /* ---------- 02 tuple ---------- */
  'ch.tuple.h2': { en: 'tuple: a fixed row', ru: 'tuple: неизменный ряд' },
  'ch.tuple.short': { en: 'Unpacking, swapping, returning several values, keys of a dict.', ru: 'Распаковка, обмен, возврат нескольких значений, ключи словаря.' },
  'ch.tuple.lede': { en: 'A tuple is a list that cannot change. That limitation is its superpower: it can be a dict key, and Python can pass it around without fear.', ru: 'Кортеж — список, который нельзя менять. Это ограничение — его суперсила: он может быть ключом словаря, и Python передаёт его без опаски.' },
  'ch.tuple.body': {
    en: '<p>Commas make the tuple, not the parentheses: <code>(5,)</code> is a tuple, <code>(5)</code> is just 5. <b>Unpacking</b> assigns several names at once: <code>x, y = point</code>; <code>x, y = y, x</code> swaps without a temporary; <code>first, *rest = …</code> takes the head and the tail. A function that “returns two things” returns one tuple, and the caller unpacks it.</p>',
    ru: '<p>Кортеж делают запятые, а не скобки: <code>(5,)</code> — кортеж, <code>(5)</code> — просто 5. <b>Распаковка</b> присваивает несколько имён сразу: <code>x, y = point</code>; <code>x, y = y, x</code> меняет местами без временной переменной; <code>first, *rest = …</code> берёт голову и хвост. Функция, «возвращающая две вещи», возвращает один кортеж, а вызывающий его распаковывает.</p>',
  },
  'ch.tuple.body2': {
    en: '<p>Dict keys and set members must be <b>hashable</b> — in practice, immutable. A tuple of coordinates <code>(row, col)</code> works as a key, a list does not: <code>TypeError</code>. <code>namedtuple</code> gives the positions names (<code>p.row</code>) while staying a tuple, which keeps code readable in grid problems (PY-06).</p>',
    ru: '<p>Ключи словаря и элементы множества должны быть <b>хэшируемыми</b> — на практике неизменяемыми. Кортеж координат <code>(row, col)</code> годится в ключи, список — нет: <code>TypeError</code>. <code>namedtuple</code> даёт позициям имена (<code>p.row</code>), оставаясь кортежем, что делает код в задачах на сетках читаемым (PY-06).</p>',
  },
  'ch.tuple.hood': {
    en: '<p>A tuple stores its item pointers inline in the object (no separate array), so it is smaller than a list of the same length (<code>sys.getsizeof((1, 2, 3))</code> is 64 bytes versus 88 for a list) and faster to create; CPython keeps free lists of small tuples to recycle them. Tuple hashing combines the item hashes, so a tuple is hashable only if all items are. Immutability is shallow: a tuple holding a list can still have that list changed. Since 3.11, <code>x, y = y, x</code> compiles to a SWAP instruction with no tuple built at all.</p>',
    ru: '<p>Кортеж хранит указатели на элементы прямо в объекте (без отдельного массива), поэтому он меньше списка той же длины (<code>sys.getsizeof((1, 2, 3))</code> — 64 байта против 88 у списка) и быстрее создаётся; CPython держит списки свободных маленьких кортежей для переиспользования. Хэш кортежа комбинирует хэши элементов, так что кортеж хэшируем, только если хэшируемы все элементы. Неизменяемость поверхностная: кортеж со списком внутри не мешает менять этот список. С 3.11 <code>x, y = y, x</code> компилируется в инструкцию SWAP, и кортеж вообще не создаётся.</p>',
  },
  'rig.tuples.title': { en: 'Unpacking and swapping', ru: 'Распаковка и обмен' },
  'rig.tuples.l4': { en: () => 'The right side builds (y, x) first, then both names are rebound: a swap with no temporary.', ru: () => 'Правая часть сначала строит (y, x), потом оба имени перепривязываются: обмен без временной переменной.' },
  'rig.tuples.l10': { en: () => 'No comma, no tuple: <code>(5)</code> is the int 5 in parentheses.', ru: () => 'Нет запятой — нет кортежа: <code>(5)</code> — это int 5 в скобках.' },
  'rig.tuplekey.title': { en: 'Tuples as keys; namedtuple', ru: 'Кортежи как ключи; namedtuple' },
  'rig.tuplekey.l7:except': { en: () => 'A list cannot be a key: it could change later and the dict would lose it.', ru: () => 'Список не может быть ключом: он может измениться, и словарь его потеряет.' },

  /* ---------- 03 dict ---------- */
  'ch.dict.h2': { en: 'dict: key → value', ru: 'dict: ключ → значение' },
  'ch.dict.short': { en: 'get, pop, items; grouping with setdefault, defaultdict and Counter. The hash table inside.', ru: 'get, pop, items; группировка через setdefault, defaultdict и Counter. Хэш-таблица внутри.' },
  'ch.dict.lede': { en: 'A dict answers “what belongs to this key?” in one step, no matter how big it is. Since Python 3.7 it also remembers insertion order.', ru: 'Словарь отвечает «что принадлежит этому ключу?» за один шаг, каким бы большим он ни был. С Python 3.7 он ещё и помнит порядок вставки.' },
  'ch.dict.body': {
    en: '<p><code>d[key] = value</code> stores, <code>d[key]</code> reads (and raises <code>KeyError</code> if missing), <code>d.get(key, default)</code> reads safely, <code>d.pop(key)</code> removes and returns. <code>d.items()</code> walks pairs, <code>d.keys()</code> and <code>d.values()</code> the halves. <code>max(scores, key=scores.get)</code> finds the key with the largest value — a line worth memorising.</p>',
    ru: '<p><code>d[key] = value</code> сохраняет, <code>d[key]</code> читает (и бросает <code>KeyError</code>, если нет), <code>d.get(key, default)</code> читает безопасно, <code>d.pop(key)</code> удаляет и возвращает. <code>d.items()</code> идёт по парам, <code>d.keys()</code> и <code>d.values()</code> — по половинкам. <code>max(scores, key=scores.get)</code> находит ключ с наибольшим значением — строка, которую стоит запомнить.</p>',
  },
  'ch.dict.body2': {
    en: '<p>Grouping is the most common dict pattern: “all words by first letter”. Plain dict: <code>setdefault(k, []).append(x)</code>. <code>defaultdict(list)</code> creates the empty list for you on first access. <code>Counter</code> is a dict that counts, with <code>most_common()</code> thrown in. All three are the same idea: a key that does not exist yet gets a sensible start value.</p>',
    ru: '<p>Группировка — самый частый паттерн словаря: «все слова по первой букве». Обычный dict: <code>setdefault(k, []).append(x)</code>. <code>defaultdict(list)</code> сам создаёт пустой список при первом обращении. <code>Counter</code> — словарь, который считает, с <code>most_common()</code> в придачу. Все три — одна идея: ключ, которого ещё нет, получает разумное начальное значение.</p>',
  },
  'ch.dict.hood': {
    en: '<p>A dict is a <b>hash table</b>. <code>hash(key)</code> turns the key into a number; the low bits pick a slot in an array; if the slot is taken by a different key, probing looks for another one. Lookup is O(1) on average because you jump straight to the slot instead of scanning. The rig below draws an illustrative 8-slot table with simple hashes so the probing is visible; real CPython uses a randomised string hash (so <code>hash("bow")</code> differs between runs — that is why set order of strings is unpredictable) and a smarter probe sequence.</p>',
    ru: '<p>dict — это <b>хэш-таблица</b>. <code>hash(key)</code> превращает ключ в число; младшие биты выбирают слот в массиве; если слот занят другим ключом, пробирование ищет следующий. Поиск в среднем O(1), потому что ты сразу прыгаешь в слот, а не сканируешь. Стенд ниже рисует иллюстративную таблицу из 8 слотов с простыми хэшами, чтобы пробирование было видно; настоящий CPython использует рандомизированный хэш строк (поэтому <code>hash("bow")</code> меняется от запуска к запуску — отсюда непредсказуемый порядок множества строк) и более хитрую последовательность проб.</p>',
  },
  'ch.dict.hood2': {
    en: '<p>CPython 3.6+ keeps two arrays: a compact entries array in insertion order (hash, key, value) and a sparse index array of small ints pointing into it. That is why dicts are ordered <i>and</i> use less memory than before. The table resizes when two thirds full (growth ×3 of used entries). Keys must define <code>__hash__</code> consistently with <code>__eq__</code>: equal objects must hash equal, so <code>1</code>, <code>1.0</code> and <code>True</code> are one key. Iterating while inserting raises <code>RuntimeError: dictionary changed size during iteration</code>. C#’s <code>Dictionary&lt;K,V&gt;</code> is the same idea with chaining instead of open addressing.</p>',
    ru: '<p>CPython 3.6+ держит два массива: компактный массив записей в порядке вставки (хэш, ключ, значение) и разреженный индексный массив маленьких int, указывающих в него. Поэтому словари упорядочены <i>и</i> занимают меньше памяти, чем раньше. Таблица растёт при заполнении на две трети (×3 от используемых записей). Ключи должны определять <code>__hash__</code> согласованно с <code>__eq__</code>: равные объекты обязаны хэшироваться одинаково, поэтому <code>1</code>, <code>1.0</code> и <code>True</code> — один ключ. Вставка во время итерации даёт <code>RuntimeError: dictionary changed size during iteration</code>. <code>Dictionary&lt;K,V&gt;</code> в C# — та же идея с цепочками вместо открытой адресации.</p>',
  },
  'rig.dictbasic.title': { en: 'The dict toolkit', ru: 'Набор инструментов словаря' },
  'rig.dictbasic.l6': { en: e => `<code>get</code> never raises: ${e.printed.trim()} — None by default, or the fallback you pass.`, ru: e => `<code>get</code> никогда не бросает: ${e.printed.trim()} — None по умолчанию или переданная замена.` },
  'rig.dictbasic.l8': { en: e => `<code>items()</code> yields (key, value) pairs, unpacked into two names: ${e.repr}.`, ru: e => `<code>items()</code> выдаёт пары (ключ, значение), распакованные в два имени: ${e.repr}.` },
  'rig.hashtable.title': { en: 'Under the hood: the hash table', ru: 'Под капотом: хэш-таблица' },
  'rig.hashtable.stage': { en: 'hash table (illustrative hashes)', ru: 'хэш-таблица (иллюстративные хэши)' },
  'rig.defaultdict.title': { en: 'Grouping three ways', ru: 'Группировка тремя способами' },
  'rig.defaultdict.l4': { en: () => '<code>setdefault</code>: return the existing list, or store and return a new empty one — then append.', ru: () => '<code>setdefault</code>: вернуть существующий список или сохранить и вернуть новый пустой — затем append.' },
  'rig.defaultdict.l9': { en: () => 'A missing key in a <code>defaultdict(list)</code> silently becomes an empty list.', ru: () => 'Отсутствующий ключ в <code>defaultdict(list)</code> молча становится пустым списком.' },

  /* ---------- 04 set ---------- */
  'ch.set.h2': { en: 'set: no duplicates, instant membership', ru: 'set: без дубликатов, мгновенная проверка' },
  'ch.set.short': { en: 'Union, intersection, difference; in is O(1); only hashable items.', ru: 'Объединение, пересечение, разность; in за O(1); только хэшируемые элементы.' },
  'ch.set.lede': { en: 'A set is a bag of unique hashable things. Two things it does brilliantly: remove duplicates, and answer <code>x in s</code> without scanning.', ru: 'Множество — мешок уникальных хэшируемых вещей. Две вещи оно делает блестяще: убирает дубликаты и отвечает на <code>x in s</code> без просмотра.' },
  'ch.set.body': {
    en: '<p>Operators read like maths: <code>a | b</code> union, <code>a &amp; b</code> intersection, <code>a - b</code> difference, <code>a ^ b</code> symmetric difference, <code>a &lt;= b</code> subset. <code>add</code>, <code>discard</code> (no error if absent), <code>remove</code> (KeyError if absent). <code>set("mississippi")</code> keeps one of each letter. Order is whatever the hash table gives — never rely on it; <code>sorted(s)</code> when you need order.</p>',
    ru: '<p>Операторы читаются как математика: <code>a | b</code> объединение, <code>a &amp; b</code> пересечение, <code>a - b</code> разность, <code>a ^ b</code> симметричная разность, <code>a &lt;= b</code> подмножество. <code>add</code>, <code>discard</code> (без ошибки, если нет), <code>remove</code> (KeyError, если нет). <code>set("mississippi")</code> оставляет по одной букве. Порядок — какой даст хэш-таблица; никогда не полагайся на него, нужен порядок — <code>sorted(s)</code>.</p>',
  },
  'ch.set.body2': {
    en: '<p>The rig below counts “looks”: finding the last of n items in a list takes n looks; in a set it takes one hash and one look, whether n is 20 or 20 million. Whenever code does <code>if x in some_list</code> inside a loop, think set. The price: items must be hashable — a set of lists is a <code>TypeError</code>; use tuples.</p>',
    ru: '<p>Стенд ниже считает «взгляды»: найти последний из n элементов в списке — n взглядов; в множестве — один хэш и один взгляд, будь n равно 20 или 20 миллионам. Когда код делает <code>if x in some_list</code> внутри цикла, думай о множестве. Цена: элементы должны быть хэшируемыми — множество списков даёт <code>TypeError</code>; бери кортежи.</p>',
  },
  'ch.set.hood': {
    en: '<p>A set is a hash table without values. CPython’s set table starts at 8 slots, grows ×4 while small, and probes with a mix of linear steps and a perturbation of the hash. For small ints the hash is the int itself, so <code>{8, 1}</code> prints as <code>{8, 1}</code> (8 mod 8 lands in slot 0) — the stand reproduces that table order exactly, so what you see here is what CPython prints. <code>frozenset</code> is the immutable, hashable variant — a set of sets needs it. Set operations run in O(len(smaller)) for intersection and O(len(a) + len(b)) for union.</p>',
    ru: '<p>Множество — хэш-таблица без значений. Таблица множества в CPython начинается с 8 слотов, растёт ×4, пока мала, и пробирует смесью линейных шагов и возмущения хэша. У маленьких int хэш — само число, поэтому <code>{8, 1}</code> печатается как <code>{8, 1}</code> (8 mod 8 попадает в слот 0) — стенд воспроизводит этот порядок таблицы точно, так что здесь ты видишь то же, что печатает CPython. <code>frozenset</code> — неизменяемый хэшируемый вариант; множество множеств требует его. Пересечение работает за O(len(меньшего)), объединение — за O(len(a) + len(b)).</p>',
  },
  'rig.setops.title': { en: 'Set algebra', ru: 'Алгебра множеств' },
  'rig.setops.l3': { en: e => `Union: everything from either set, each once — <code>${e.printed.trim()}</code>.`, ru: e => `Объединение: всё из обоих множеств, каждое по разу — <code>${e.printed.trim()}</code>.` },
  'rig.setops.l4': { en: e => `Intersection: only what both share — <code>${e.printed.trim()}</code>.`, ru: e => `Пересечение: только общее — <code>${e.printed.trim()}</code>.` },
  'rig.setvslist.title': { en: 'in: list versus set', ru: 'in: список против множества' },
  'rig.setvslist.l10': { en: e => `${e.printed.trim()}: the list had to look at every item before the last one.`, ru: e => `${e.printed.trim()}: списку пришлось посмотреть на все элементы до последнего.` },
  'rig.setvslist.l11': { en: () => 'The set hashes the value and jumps straight to its slot. One look, for any size.', ru: () => 'Множество хэширует значение и прыгает прямо в его слот. Один взгляд при любом размере.' },

  /* ---------- 05 stack and queue ---------- */
  'ch.stackq.h2': { en: 'Stack and queue', ru: 'Стек и очередь' },
  'ch.stackq.short': { en: 'append/pop for a stack, deque for a queue, and why list.pop(0) hurts.', ru: 'append/pop для стека, deque для очереди и почему list.pop(0) болит.' },
  'ch.stackq.lede': { en: 'A stack is last-in, first-out; a queue is first-in, first-out. A list is a perfect stack and a terrible queue.', ru: 'Стек — последним пришёл, первым ушёл; очередь — первым пришёл, первым ушёл. Список — отличный стек и ужасная очередь.' },
  'ch.stackq.body': {
    en: '<p>Stack: <code>append</code> to push, <code>pop()</code> to take the top, <code>stack[-1]</code> to peek. Queue: <code>collections.deque</code> with <code>append</code> at the back and <code>popleft()</code> from the front, both O(1); <code>appendleft</code> exists too. Stacks run function calls (PY-02), bracket matching and undo; queues run BFS and every “process things in arrival order” (PY-06).</p>',
    ru: '<p>Стек: <code>append</code> — положить, <code>pop()</code> — снять верхний, <code>stack[-1]</code> — подсмотреть. Очередь: <code>collections.deque</code> с <code>append</code> в конец и <code>popleft()</code> из начала, оба O(1); есть и <code>appendleft</code>. На стеках работают вызовы функций (PY-02), проверка скобок и undo; на очередях — BFS и любое «обрабатывать в порядке поступления» (PY-06).</p>',
  },
  'ch.stackq.body2': {
    en: '<p>Why not <code>list.pop(0)</code> for a queue? Watch the highlighted cells: removing the first element shifts every other one left — O(n) per operation, so a loop of n pops is O(n²). <code>deque.popleft()</code> touches nothing else. The difference is invisible with 8 items and painful with 100 000.</p>',
    ru: '<p>Почему не <code>list.pop(0)</code> для очереди? Смотри на подсвеченные ячейки: удаление первого элемента сдвигает все остальные влево — O(n) на операцию, значит цикл из n таких pop — O(n²). <code>deque.popleft()</code> ничего больше не трогает. На 8 элементах разницы не видно, на 100 000 она мучительна.</p>',
  },
  'ch.stackq.hood': {
    en: '<p><code>deque</code> is a doubly linked list of fixed-size blocks (64 pointers each), so both ends are O(1) and indexing in the middle is O(n). <code>deque(maxlen=k)</code> drops the oldest item automatically — a ring buffer for “last k events”. For thread-safe producer/consumer use <code>queue.Queue</code>, which blocks; for priority order use <code>heapq</code> (next chapter). C#: <code>Stack&lt;T&gt;</code> and <code>Queue&lt;T&gt;</code> are separate classes; Python gives you a list and a deque.</p>',
    ru: '<p><code>deque</code> — двусвязный список блоков фиксированного размера (по 64 указателя), поэтому оба конца O(1), а индексирование в середине O(n). <code>deque(maxlen=k)</code> сам выбрасывает самый старый элемент — кольцевой буфер «последние k событий». Для потокобезопасного producer/consumer есть <code>queue.Queue</code>, который блокирует; для приоритетного порядка — <code>heapq</code> (следующая глава). C#: <code>Stack&lt;T&gt;</code> и <code>Queue&lt;T&gt;</code> — отдельные классы; Python даёт список и deque.</p>',
  },
  'rig.stackq.title': { en: 'A stack and a queue side by side', ru: 'Стек и очередь рядом' },
  'rig.stackq.stage': { en: 'stack · queue', ru: 'стек · очередь' },
  'rig.stackq.l5': { en: e => `<code>pop()</code> takes from the top: the last pushed comes out first — ${e.printed.trim()}.`, ru: e => `<code>pop()</code> снимает сверху: положенное последним выходит первым — ${e.printed.trim()}.` },
  'rig.stackq.l10': { en: e => `<code>popleft()</code> takes from the front: the first added comes out first — ${e.printed.trim()}.`, ru: e => `<code>popleft()</code> берёт спереди: добавленное первым выходит первым — ${e.printed.trim()}.` },
  'rig.popzero.title': { en: 'pop(0) shifts everything', ru: 'pop(0) сдвигает всё' },
  'rig.popzero.l2': { en: () => 'Every remaining cell was rewritten one slot to the left.', ru: () => 'Каждая оставшаяся ячейка переписана на одну позицию влево.' },
  'rig.popzero.l6': { en: () => '<code>popleft</code> on a deque: only the front block changes.', ru: () => '<code>popleft</code> у deque: меняется только передний блок.' },
};
