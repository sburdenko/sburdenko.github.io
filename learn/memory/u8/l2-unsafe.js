/** Курс «Память в .NET», раздел «Продвинутое», урок 2: unsafe и указатели, NativeMemory, Unsafe и MemoryMarshal. */
export default {
  id: 'mem.u8.l2',
  title: 'unsafe и указатели',
  sub: 'Указатели, нативная память, Unsafe и MemoryMarshal',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Что разрешает unsafe',
      body: '<p>Слово <code>unsafe</code> открывает указатели (pointers): <code>T*</code>, взятие адреса <code>&amp;</code>, разыменование <code>*</code>, <code>-&gt;</code> и арифметику. Проект должен разрешить это явно: <code>&lt;AllowUnsafeBlocks&gt;true&lt;/AllowUnsafeBlocks&gt;</code>.</p><p>Указатель бывает только на <b>неуправляемый</b> (unmanaged) тип: числа, <code>bool</code>, <code>char</code>, перечисления, другие указатели и структуры из них. На класс или строку указатель не возьмёшь.</p><p>Что пропадает: проверка границ, проверка типа и — главное — участие сборщика. Указатель для GC просто число.</p>',
      code: 'static unsafe long Sum(int[] data)\n{\n    long sum = 0;\n    fixed (int* start = data)\n    {\n        int* p = start;\n        int* end = start + data.Length;\n        while (p < end)\n            sum += *p++;\n    }\n    return sum;\n}',
      deep: '<p><code>unsafe</code> не меняет IL радикально: арифметика указателей — обычные <code>add</code> и <code>ldind</code>/<code>stind</code>. Меняется то, что код становится <b>непроверяемым</b> (unverifiable): гарантию безопасности памяти теперь даёшь ты. В .NET Framework это имело значение для частичного доверия (CAS); в .NET Core частичного доверия нет, и <code>unsafe</code> — только флаг компилятора.</p>'
    },
    {
      t: 'learn',
      title: 'ref видит сборщик, указатель — нет',
      body: '<p>В .NET два вида «адреса»:</p><ul><li><b>Управляемый указатель</b> — <code>ref T</code>, <code>Span&lt;T&gt;</code> внутри. JIT сообщает сборщику, где лежат такие ссылки. Если объект сдвинулся, сборщик обновит и ссылку на его середину. Закреплять не нужно.</li><li><b>Неуправляемый указатель</b> — <code>T*</code>, <code>nint</code>, <code>IntPtr</code>. Сборщик о нём не знает. На объект в куче его можно держать только пока объект закреплён.</li></ul><p>Отсюда правило: для работы с управляемой памятью бери <code>ref</code> и <code>Span</code>. Указатели — для памяти, которую сборщик не двигает: стек, <code>stackalloc</code>, нативная память, POH.</p>',
      deep: '<p>Указатель на объект в куче без закрепления — классическая «дыра для GC» (GC hole). Код работает тысячи раз, пока сборка со сжатием не попадёт ровно между взятием адреса и записью. Такие ошибки почти не воспроизводятся в отладке. Для их поиска у рантайма есть отладочный режим GC Stress: он запускает сборку в каждой точке, где она возможна. Им пользуются в основном разработчики самого CLR.</p>'
    },
    {
      t: 'choice',
      q: 'Нужно хранить в локальной переменной «адрес» пятого элемента массива из кучи и писать через него. Что безопасно без закрепления?',
      options: ['ref int', 'int*', 'IntPtr', 'nint'],
      answer: 0,
      explain: 'ref int — управляемый указатель: сборщик знает о нём и при сжатии сдвинет его вместе с массивом. int*, IntPtr и nint — просто числа, после переезда массива они указывают в никуда.'
    },
    {
      t: 'learn',
      title: 'NativeMemory: память мимо сборщика',
      body: '<p>С .NET 6 нативную память берут через <code>NativeMemory</code>: <code>Alloc</code>, <code>AllocZeroed</code>, <code>Realloc</code>, <code>Free</code>, выровненные <code>AlignedAlloc</code> и <code>AlignedFree</code>. Это тонкая обёртка над <code>malloc</code>/<code>free</code> из библиотеки C.</p><p>Что важно понимать:</p><ul><li>сборщик эту память не видит: её нет в размере кучи, и он её не освободит;</li><li>забыл <code>Free</code> — утечка, которую покажет только private bytes (как в разделе «Как измерять»);</li><li>освобождать — в <code>finally</code>, а если память живёт с объектом — через <code>SafeHandle</code>.</li></ul>',
      code: 'unsafe\n{\n    nuint size = 1024 * 1024;\n    byte* p = (byte*)NativeMemory.Alloc(size);\n    try\n    {\n        var span = new Span<byte>(p, (int)size);\n        span.Fill(0xFF);\n    }\n    finally\n    {\n        NativeMemory.Free(p);\n    }\n}',
      deep: '<p>До .NET 6 брали <code>Marshal.AllocHGlobal</code>: на Windows это <code>LocalAlloc</code>, на Unix — <code>malloc</code>. В .NET 7 добавились <code>NativeMemory.Clear</code>, <code>Copy</code> и <code>Fill</code>. <code>Alloc</code> при нехватке памяти бросает <code>OutOfMemoryException</code>, а не возвращает null. Работать с такой памятью удобнее всего через <code>Span&lt;T&gt;</code>: он даёт проверку границ поверх сырого указателя.</p>'
    },
    {
      t: 'blanks',
      q: 'Возьми нативный буфер и гарантированно верни его',
      code: 'byte* buf = (byte*)NativeMemory.___(4096);\ntry\n{\n    Process(buf, 4096);\n}\nfinally\n{\n    NativeMemory.___(buf);\n}',
      tiles: ['Alloc', 'Free', 'Clear', 'Release', 'Realloc'],
      answer: ['Alloc', 'Free'],
      explain: 'Alloc выделяет, Free возвращает память куче библиотеки C. Clear только обнуляет байты, Realloc меняет размер, а метода Release у NativeMemory нет.'
    },
    {
      t: 'learn',
      title: 'Unsafe: небезопасно без слова unsafe',
      body: '<p>Класс <code>System.Runtime.CompilerServices.Unsafe</code> делает то же, что указатели, но через <code>ref</code> — и не требует <code>unsafe</code> в коде. Сборщик ссылки видит, а вот типы и границы — на тебе.</p><ul><li><code>Unsafe.As&lt;T&gt;(object)</code> — считать ссылку ссылкой на T без проверки типа;</li><li><code>Unsafe.Add(ref x, n)</code> — сдвинуть ref на n элементов без проверки границ;</li><li><code>Unsafe.SizeOf&lt;T&gt;()</code>, <code>ReadUnaligned</code>, <code>SkipInit</code>;</li><li><code>Unsafe.BitCast&lt;TFrom, TTo&gt;</code> (.NET 8) — переосмыслить биты значения.</li></ul>',
      code: 'int[] arr = { 1, 2, 3, 4 };\nref int first = ref MemoryMarshal.GetArrayDataReference(arr);\nref int fourth = ref Unsafe.Add(ref first, 3);   // без проверки границ\n\nobject o = "hello";\nstring s = Unsafe.As<string>(o);                 // без проверки типа\nfloat one = Unsafe.BitCast<int, float>(0x3F800000);   // 1.0f',
      deep: '<p>Методы <code>Unsafe</code> — JIT-интринсики: большинство из них компилируется в одну-две инструкции или вовсе исчезает. В исходниках CoreLib у многих тело — заглушка с IL в комментарии, а настоящую реализацию подставляет JIT. Сама библиотека .NET широко ими пользуется во внутренних циклах <code>Span</code>, строк и коллекций.</p>'
    },
    {
      t: 'learn',
      title: 'MemoryMarshal: Span без церемоний',
      body: '<p><code>System.Runtime.InteropServices.MemoryMarshal</code> снимает ограничения со <code>Span</code>:</p><ul><li><code>GetReference(span)</code> и <code>GetArrayDataReference(array)</code> — ref на первый элемент без проверки границ;</li><li><code>Cast&lt;TFrom, TTo&gt;(span)</code> — увидеть байты как <code>int</code> или структуры без копирования;</li><li><code>AsBytes</code>, <code>Read&lt;T&gt;</code>, <code>Write&lt;T&gt;</code> — читать и писать структуры в буфер байтов;</li><li><code>CreateSpan(ref x, length)</code> — сделать Span из одного ref.</li></ul><p>Типичный случай — разбор бинарного формата прямо в буфере, без копий и аллокаций.</p>',
      code: 'ReadOnlySpan<byte> bytes = File.ReadAllBytes("data.bin");\nint count = MemoryMarshal.Read<int>(bytes);          // первые 4 байта\nReadOnlySpan<int> ints = MemoryMarshal.Cast<byte, int>(bytes[4..]);\n// ints — те же байты, без копии',
      deep: '<p><code>Cast</code> и <code>Read</code> работают только с типами без ссылок — иначе <code>ArgumentException</code>: превратить байты в ссылку значило бы подделать адрес объекта. Порядок байтов — машинный (на x64 и ARM64 — little-endian); для переносимых форматов есть <code>BinaryPrimitives.ReadInt32LittleEndian</code>. Невыровненные чтения на x64 и ARM64 работают.</p>'
    },
    {
      t: 'match',
      q: 'Соедини API и что оно делает',
      pairs: [
        ['Unsafe.As<T>(obj)', 'Ссылка на другой тип без проверки'],
        ['Unsafe.Add(ref x, n)', 'Сдвиг ref без проверки границ'],
        ['MemoryMarshal.Cast<byte, int>(span)', 'Те же байты как другой тип'],
        ['NativeMemory.Alloc(n)', 'Память, которую сборщик не видит'],
        ['MemoryMarshal.GetArrayDataReference(arr)', 'ref на первый элемент массива']
      ]
    },
    {
      t: 'learn',
      title: 'Чем это кончается',
      body: '<p>Ошибка в небезопасном коде редко падает сразу. Типичный сценарий:</p><ul><li>запись за конец массива затирает заголовок или указатель на тип соседнего объекта;</li><li>программа работает дальше — до ближайшей сборки;</li><li>сборщик при маркировке идёт по испорченному указателю на тип и падает. Процесс завершается с внутренней ошибкой CLR, и стек показывает GC, а не твой код.</li></ul><p>Поэтому правила простые: небезопасный код — только в горячих местах, после замера; маленькие изолированные методы; тесты на границы; везде, где можно, — <code>Span</code> с проверками.</p>',
      deep: '<p>По дампу такую порчу ищут командой SOS <code>!verifyheap</code>: она проходит кучу и показывает первый испорченный объект. Сосед, который оказался перед ним, — первый подозреваемый. <code>Unsafe.As</code> с неверным типом даёт тот же эффект тоньше: вызов виртуального метода через «не тот» указатель на тип прыгает по чужой таблице методов.</p>'
    },
    {
      t: 'tapline',
      q: 'В какой строке ошибка, из-за которой код пишет за конец массива?',
      code: 'int[] a = new int[4];\nref int first = ref MemoryMarshal.GetArrayDataReference(a);\nfor (int i = 0; i <= a.Length; i++)\n    Unsafe.Add(ref first, i) = i;',
      answer: 2,
      explain: 'Условие i <= a.Length даёт пять итераций для четырёх элементов. Обычная индексация бросила бы IndexOutOfRangeException, а Unsafe.Add молча запишет число в память после массива — скорее всего, в заголовок следующего объекта.'
    },
    {
      t: 'choice',
      q: 'Цикл переписали с a[i] на Unsafe.Add, чтобы убрать проверку границ. Замер не показал разницы. Почему?',
      code: 'for (int i = 0; i < a.Length; i++)\n    sum += a[i];',
      options: [
        'JIT сам убирает проверку границ в цикле от 0 до a.Length',
        'Unsafe.Add тоже проверяет границы',
        'Проверка границ выполняется только в Debug',
        'Сумма long медленнее любой проверки'
      ],
      answer: 0,
      explain: 'JIT доказывает, что i всегда в пределах массива, и не вставляет проверку (bounds check elimination). Поэтому простой цикл по массиву или Span уже быстрый. Unsafe окупается там, где JIT доказать не может: обход с шагом, индексы из другого массива.',
      wrong: { 2: 'Проверка границ есть и в Release: это часть безопасности памяти, а не отладочная функция.' }
    },
    {
      t: 'multi',
      q: 'Когда небезопасный код оправдан? Отметь все.',
      options: [
        'Горячий цикл, где замер показал, что проверки границ стоят заметно',
        'Буфер для нативной библиотеки, который сборщик не должен видеть',
        'Разбор бинарного протокола в буфере без копирования',
        'Чтобы «на всякий случай» ускорить любой код',
        'Чтобы обойти ошибку приведения типа InvalidCastException'
      ],
      answer: [0, 1, 2],
      explain: 'Небезопасный код — инструмент для узких мест и взаимодействия с нативным миром. Без замера он только добавляет риск, а Unsafe.As вместо честного приведения превращает понятное исключение в порчу памяти.'
    }
  ]
};
