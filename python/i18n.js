/** Strings of the stand landing page and the six cassette cards (also used on the main shelf). */
export const TAPE_CARDS = {
  'tape.01.title': { en: 'How Python thinks', ru: 'Как Python думает' },
  'tape.01.desc': { en: 'print, names → objects, numbers, strings, types, truthiness, input, tracebacks, mutable vs immutable. Every line steps with a live memory picture.', ru: 'print, имена → объекты, числа, строки, типы, истинность, ввод, traceback, изменяемое и неизменяемое. Каждая строка по шагам с живой картинкой памяти.' },
  'tape.02.title': { en: 'Flow: conditions, loops, functions', ru: 'Поток: условия, циклы, функции' },
  'tape.02.desc': { en: 'if/elif/else, while and for, range, enumerate and zip, functions and their frames, arguments, scope (LEGB), recursion with a visible call stack, closures and lambda.', ru: 'if/elif/else, while и for, range, enumerate и zip, функции и их кадры, аргументы, область видимости (LEGB), рекурсия с видимым стеком вызовов, замыкания и lambda.' },
  'tape.03.title': { en: 'Collections, deeply', ru: 'Коллекции глубоко' },
  'tape.03.desc': { en: 'list growth, tuples, dict as a hash table, sets, stack and queue, heap, comprehensions, iterators and generators, Timsort stability — with the cost of each operation.', ru: 'Рост списка, кортежи, dict как хэш-таблица, множества, стек и очередь, куча, включения, итераторы и генераторы, стабильность Timsort — с ценой каждой операции.' },
  'tape.04.title': { en: 'Strings, files, errors, modules', ru: 'Строки, файлы, ошибки, модули' },
  'tape.04.desc': { en: 'string methods, f-string format specs, Unicode and bytes, regular expressions, try/except/else/finally, with and context managers, files, import and the standard library tour.', ru: 'Методы строк, спецификаторы f-строк, Unicode и байты, регулярные выражения, try/except/else/finally, with и контекстные менеджеры, файлы, import и тур по стандартной библиотеке.' },
  'tape.05.title': { en: 'Classes and advanced Python', ru: 'Классы и продвинутый Python' },
  'tape.05.desc': { en: 'classes and instances, dunders, property, inheritance and MRO, dataclasses, decorators, generators in depth, typing, match, GIL versus asyncio, bytecode.', ru: 'Классы и экземпляры, дандеры, property, наследование и MRO, dataclass, декораторы, генераторы глубже, типизация, match, GIL против asyncio, байткод.' },
  'tape.06.title': { en: '30 problems: algorithms in Python', ru: '30 задач: алгоритмы на Python' },
  'tape.06.desc': { en: 'FizzBuzz to N-Queens: sorting (bubble, selection, insertion, merge, quick, counting), binary search, sieve, Euclid, Hanoi, brackets, BFS maze, islands, flood fill, Life, coin change, minimax.', ru: 'От FizzBuzz до N ферзей: сортировки (пузырьком, выбором, вставками, слиянием, быстрая, подсчётом), бинарный поиск, решето, Евклид, Ханой, скобки, BFS в лабиринте, острова, заливка, «Жизнь», размен монет, минимакс.' },
};

export const STAND = {
  ...TAPE_CARDS,
  'page.title': { en: 'Python stand · six tapes', ru: 'Стенд Python · шесть кассет' },
  'page.desc': {
    en: 'Stand B: an interactive Python textbook in six tapes. Every example runs in the browser step by step with a live picture of memory; thirty algorithm problems with their own rigs; quizzes and progress.',
    ru: 'Стенд B: интерактивный учебник Python из шести кассет. Каждый пример выполняется в браузере по шагам с живой картинкой памяти; тридцать алгоритмических задач со своими стендами; квизы и прогресс.',
  },
  'foot.stop': { en: '■ END OF STAND', ru: '■ КОНЕЦ СТЕНДА' },
  'foot.src': { en: 'Source code and models:', ru: 'Исходный код и модели:' },
  'hub.go': { en: 'INSERT TAPE ►', ru: 'ВСТАВИТЬ КАССЕТУ ►' },
  'stand.soon': { en: 'RECORDING…', ru: 'ЗАПИСЫВАЕТСЯ…' },
  'stand.eyebrow': { en: 'Stand B · Python · six tapes', ru: 'Стенд B · Python · шесть кассет' },
  'stand.title': { en: 'Python', ru: 'Python' },
  'stand.subtitle': { en: 'a textbook you can step through', ru: 'учебник, который можно перематывать' },
  'stand.lede': {
    en: 'Six tapes from the first <code>print</code> to the GIL. The rule of the stand: nothing is explained with a static picture. Every snippet is real Python executed right here, one line at a time, and the diagram shows what sits in memory after each step. Short theory, a rig, a quiz, then <b>⚙ Under the hood</b> for the grown-ups.',
    ru: 'Шесть кассет от первого <code>print</code> до GIL. Правило стенда: ничего не объясняется статичной картинкой. Каждый фрагмент — настоящий Python, выполненный прямо здесь по одной строке, а схема показывает, что лежит в памяти после каждого шага. Короткая теория, стенд, квиз, затем <b>⚙ Под капотом</b> для взрослых.',
  },
  'stand.howto': {
    en: '<p><b>Where to start.</b> PY-01 and PY-02 are the base: do them in order, press “✓ Got it” at the end of every chapter and answer the quizzes. Then jump to PY-06 for the problems — the first nineteen (with all the sorts) need only PY-01 and PY-02. PY-03 to PY-05 go deeper and can be read in any order.</p><p><b>Together.</b> Each rig has a speed slider; at 1 step per second it is slow enough to narrate. The ▶ RUN IT YOURSELF button under a rig opens a real Python where the code can be changed and re-run.</p>',
    ru: '<p><b>С чего начать.</b> PY-01 и PY-02 — база: проходи их по порядку, нажимай «✓ Понятно» в конце каждой главы и отвечай на квизы. Потом переходи к PY-06 за задачами — первым девятнадцати (со всеми сортировками) хватает PY-01 и PY-02. PY-03 … PY-05 идут глубже, их можно читать в любом порядке.</p><p><b>Вместе.</b> У каждого стенда есть ползунок скорости; на 1 шаге в секунду хватает времени проговаривать. Кнопка ▶ ЗАПУСТИТЬ САМОМУ под стендом открывает настоящий Python, где код можно менять и запускать снова.</p>',
  },
  'stand.progressH': { en: 'Progress across the stand', ru: 'Прогресс по всему стенду' },
  'stand.progressLede': { en: 'Chapters marked “got it”, quizzes answered right, problems played to the end on your own input.', ru: 'Главы с «понятно», квизы с правильным ответом, задачи, доигранные до конца на своих данных.' },
  'stand.chapters': { en: 'chapters', ru: 'главы' },
  'stand.quizzes': { en: 'quizzes', ru: 'квизы' },
  'stand.problems': { en: 'problems', ru: 'задачи' },
  'stand.setupH': { en: 'Python on your own computer', ru: 'Python на своём компьютере' },
  'stand.setup': {
    en: '<p>Everything on the stand works without installing anything. To write programs of your own:</p><ol><li>Download Python 3.12 or newer from <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads</a>. On Windows tick “Add python.exe to PATH”. On a Mac it is already there as <code>python3</code>.</li><li>Install an editor: <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VS Code</a> with the Python extension, or the IDLE that comes with Python.</li><li>Save a file <code>hello.py</code> with <code>print("Hello, Varvara!")</code> and run it from a terminal: <code>python3 hello.py</code> (Windows: <code>py hello.py</code>).</li><li>Typing <code>python3</code> alone opens the REPL — a prompt <code>&gt;&gt;&gt;</code> where each line runs at once. Perfect for experiments; <code>exit()</code> leaves.</li></ol>',
    ru: '<p>Всё на стенде работает без установки. Чтобы писать свои программы:</p><ol><li>Скачай Python 3.12 или новее с <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads</a>. На Windows поставь галочку «Add python.exe to PATH». На Mac он уже есть как <code>python3</code>.</li><li>Поставь редактор: <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VS Code</a> с расширением Python или IDLE, который идёт вместе с Python.</li><li>Сохрани файл <code>hello.py</code> со строкой <code>print("Hello, Varvara!")</code> и запусти из терминала: <code>python3 hello.py</code> (Windows: <code>py hello.py</code>).</li><li>Просто <code>python3</code> открывает REPL — приглашение <code>&gt;&gt;&gt;</code>, где каждая строка выполняется сразу. Идеально для экспериментов; <code>exit()</code> выходит.</li></ol>',
  },
};
