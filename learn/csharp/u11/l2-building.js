/** C# глубже, раздел «Строки, перечисления, массивы», урок 2: как собрать строку без лишних аллокаций. */
export default {
  id: 'cs.u11.l2',
  title: 'Собрать строку дёшево',
  sub: 'Concat, StringBuilder изнутри, обработчик интерполяции, string.Create и UTF-8-литералы',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Что компилятор делает с плюсом',
      body: '<p>Цепочку <code>a + b + c</code> компилятор не превращает в два сложения. Он собирает все операнды в <b>один вызов</b> <code>string.Concat(a, b, c)</code>. Concat сначала суммирует длины, выделяет итоговую строку один раз и копирует в неё куски. Промежуточной строки <code>a + b</code> не появляется.</p><p>У Concat есть перегрузки на 2, 3 и 4 строки. Если операндов больше, компилятор передаёт их массивом — это ещё одна аллокация, но итоговая строка всё равно одна.</p><p>Значит, склейка фиксированного числа частей в одном выражении — уже оптимальна. Проблема только в цикле: там каждое <code>+=</code> — отдельный вызов и отдельная строка.</p>',
      code: 'string s = first + " " + last + "!";\n// компилятор:\n// string s = string.Concat(first, " ", last, "!");',
      deep: '<p>Если операнд не строка, например <code>"id=" + n</code> с <code>int n</code>, старые компиляторы выбирали <code>Concat(object, object)</code> и упаковывали число. Современный Roslyn для значимых типов вызывает <code>n.ToString()</code> и берёт строковую перегрузку: упаковки нет, но временная строка для числа остаётся. Интерполяция из следующих карточек обходится и без неё.</p>'
    },
    {
      t: 'choice',
      q: 'first и last — строки. Сколько новых строк создаст эта строка кода?',
      code: 'string s = first + " " + last + "!";',
      options: ['1', '3', '4', '2'],
      answer: 0,
      explain: 'Один вызов Concat с четырьмя аргументами: длины известны заранее, итоговая строка выделяется один раз. Литералы " " и "!" уже лежат в пуле.',
      wrong: { 1: 'Так было бы, если бы каждый + выполнялся отдельно. Компилятор сворачивает цепочку в один Concat.' }
    },
    {
      t: 'learn',
      title: 'StringBuilder изнутри',
      body: '<p><code>StringBuilder</code> хранит текст в изменяемых кусках — <b>чанках</b> (chunks), массивах <code>char[]</code>. Начальная ёмкость по умолчанию — 16 символов. Когда место кончилось, он не копирует старый текст в массив побольше, а добавляет новый чанк и связывает его с предыдущим. Так длинная сборка не переписывает уже накопленное.</p><p><code>ToString()</code> выделяет итоговую строку и копирует в неё все чанки.</p><p>Цена: объект StringBuilder, его чанки и итоговая копия. Для двух-трёх частей это дороже, чем один Concat. Билдер окупается, когда частей много или их число заранее неизвестно — цикл, условия, рекурсивный обход.</p>',
      code: 'var sb = new StringBuilder(capacity: 256); // знаешь размер — скажи\nforeach (var row in rows)\n    sb.Append(row.Id).Append(\';\').AppendLine(row.Name);\nstring csv = sb.ToString();',
      deep: '<p>В .NET Framework 4.0 StringBuilder переделали со «строки, которую дописывают» на связный список чанков; максимальный размер нового чанка — 8000 символов, чтобы массивы не попадали в кучу больших объектов. Цепочка хранится от последнего чанка к первому, поэтому <code>sb[i]</code> для начала длинного билдера идёт по списку назад — индексатор у него не O(1). Если нужно много раз читать и менять текст по индексу, проще работать с <code>char[]</code> или <code>Span&lt;char&gt;</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Где StringBuilder действительно нужен? Отметь все.',
      options: ['Собрать отчёт из строк в цикле по коллекции неизвестной длины', 'string full = name + " " + surname;', 'Построить CSV на 10 000 строк', 'Соединить список через запятую, когда есть string.Join'],
      answer: [0, 2],
      explain: 'Фиксированная склейка — один Concat. string.Join сам считает длину и выделяет строку один раз. Билдер нужен там, где частей много и они появляются по ходу работы.'
    },
    {
      t: 'learn',
      title: 'Интерполяция: обработчик вместо Format',
      body: '<p>До C# 10 <code>$"Order {id}: {total}"</code> превращался в <code>string.Format</code>: аргументы уходили в <code>object[]</code>, числа упаковывались, формат разбирался при каждом вызове.</p><p>С C# 10 и .NET 6 компилятор разворачивает интерполяцию в вызовы <b>обработчика</b> <code>DefaultInterpolatedStringHandler</code>. Это <code>ref struct</code> на стеке. Он арендует буфер у <code>ArrayPool&lt;char&gt;</code>, пишет туда литералы и значения, а в конце создаёт одну строку и возвращает буфер в пул.</p><p><code>AppendFormatted&lt;T&gt;</code> — дженерик, поэтому <code>int</code> не упаковывается. Если тип умеет <code>ISpanFormattable</code> (числа, даты, Guid), он форматирует себя прямо в буфер, без временной строки.</p>',
      code: '// $"Order {id}: {total}" компилятор превращает в:\nvar h = new DefaultInterpolatedStringHandler(8, 2);\nh.AppendLiteral("Order ");\nh.AppendFormatted(id);\nh.AppendLiteral(": ");\nh.AppendFormatted(total);\nstring s = h.ToStringAndClear();',
      deep: '<p>Первые два аргумента конструктора — суммарная длина литералов (здесь 6 + 2 = 8) и число дырок; по ним обработчик оценивает начальный размер буфера. Если все дырки — строки, компилятор обходится обычным <code>string.Concat</code>.</p><p>Тот же механизм принимают и другие методы: <code>StringBuilder.Append($"...")</code> пишет прямо в билдер через свой обработчик, а <code>Debug.Assert(cond, $"...")</code> вообще не форматирует сообщение, если условие истинно. Свой обработчик помечают атрибутом <code>[InterpolatedStringHandler]</code>.</p>'
    },
    {
      t: 'order',
      q: 'Расставь вызовы, в которые компилятор развернёт $"Hi {name}, you are {age}" (age — int)',
      items: ['new DefaultInterpolatedStringHandler(13, 2)', 'AppendLiteral("Hi ")', 'AppendFormatted(name)', 'AppendLiteral(", you are ")', 'AppendFormatted(age)', 'ToStringAndClear()'],
      explain: 'Сначала обработчик с длиной литералов (3 + 10 = 13) и числом дырок, потом литералы и значения слева направо, в конце — одна итоговая строка. Буфер возвращается в ArrayPool.'
    },
    {
      t: 'learn',
      title: 'string.Create: писать прямо в новую строку',
      body: '<p>Строка неизменяема для всех, кто её <b>видит</b>. Пока её никто не видел, писать в неё можно. На этом построен <code>string.Create(length, state, action)</code>: рантайм выделяет строку нужной длины и отдаёт тебе <code>Span&lt;char&gt;</code> на её символы. Ты заполняешь его, и строка уходит наружу уже готовой.</p><p>Никаких промежуточных буферов и копий: одна аллокация. Данные передают через <code>state</code>, а лямбду делают <code>static</code>, чтобы не появилось замыкание.</p><p>Есть и вторая форма — <code>string.Create(IFormatProvider, $"...")</code>: интерполяция с заданной культурой без лишних строк.</p>',
      code: 'string Hex(byte[] data) =>\n    string.Create(data.Length * 2, data, static (span, bytes) =>\n    {\n        for (int i = 0; i < bytes.Length; i++)\n            bytes[i].TryFormat(span[(i * 2)..], out _, "x2");\n    });',
      deep: '<p>Для частного случая шестнадцатеричной записи уже есть <code>Convert.ToHexString</code> (.NET 5) и <code>ToHexStringLower</code> (.NET 9), они внутри работают так же. Ещё один вариант для небольших строк — собрать текст в <code>stackalloc char[]</code> и вызвать <code>new string(span)</code>: это тоже одна аллокация, но с копией из стека.</p>'
    },
    {
      t: 'blanks',
      q: 'Замаскируй номер карты, оставив четыре последние цифры, одной аллокацией',
      code: 'string Mask(string card) =>\n    string.___(card.Length, card, static (span, src) =>\n    {\n        src.AsSpan().CopyTo(span);\n        span[..^4].___(\'*\');\n    });',
      tiles: ['Create', 'Fill', 'Concat', 'Clear', 'Copy'],
      answer: ['Create', 'Fill'],
      explain: 'string.Create выделяет строку и даёт Span на её символы. CopyTo переносит номер, Fill закрашивает всё, кроме последних четырёх. Снаружи появляется уже готовая строка.'
    },
    {
      t: 'learn',
      title: 'UTF-8-литералы',
      body: '<p>Строки в .NET — UTF-16, а сеть, HTTP, JSON и файлы почти всегда в UTF-8. Раньше байты получали так: <code>Encoding.UTF8.GetBytes("...")</code> — новый массив на каждый вызов — или заводили <code>static readonly byte[]</code>.</p><p>С C# 11 есть суффикс <code>u8</code>. Компилятор кодирует литерал в UTF-8 при сборке и кладёт байты в секцию данных сборки. Выражение <code>"HTTP/1.1"u8</code> имеет тип <code>ReadOnlySpan&lt;byte&gt;</code> и смотрит прямо на эти байты: аллокаций нет совсем.</p><p>Ограничения: это не константа (нельзя в <code>const</code> и в значение по умолчанию параметра), интерполяции нет, а <code>.ToArray()</code> создаёт массив в куче. Два u8-литерала можно сложить через <code>+</code> — склейка тоже делается при сборке.</p>',
      code: 'ReadOnlySpan<byte> crlf = "\\r\\n"u8;\nReadOnlySpan<byte> get = "GET "u8 + "/"u8;\nstream.Write("HTTP/1.1 200 OK"u8);'
    },
    {
      t: 'choice',
      q: 'Какой тип у выражения "ok"u8?',
      options: ['ReadOnlySpan<byte>', 'byte[]', 'string', 'Span<byte>'],
      answer: 0,
      explain: 'Span только для чтения над байтами в данных сборки. byte[] пришлось бы выделять в куче, а Span<byte> позволил бы испортить общие данные.',
      wrong: { 3: 'Через Span<byte> можно было бы записать в байты литерала, общие для всей программы. Поэтому он только для чтения.' }
    },
    {
      t: 'learn',
      title: 'Интерполяция помнит о культуре',
      body: '<p>Обработчик интерполяции форматирует значения по <b>текущей культуре</b>, как и <code>ToString()</code>. На немецкой машине <code>$"{1.5}"</code> даст «1,5», а дата — в местном формате. Для текста на экране это правильно. Для JSON, логов, SQL и имён файлов — ошибка, которая проявится только у части пользователей.</p><p>Для машинного текста задай культуру явно:</p><ul><li><code>value.ToString(CultureInfo.InvariantCulture)</code>;</li><li><code>string.Create(CultureInfo.InvariantCulture, $"...")</code> — интерполяция с культурой и без лишних аллокаций;</li><li>есть и старый <code>FormattableString.Invariant($"...")</code>, но он создаёт объект FormattableString и упаковывает аргументы.</li></ul>',
      deep: '<p>Анализатор <b>CA1305</b> подсвечивает вызовы форматирования без <code>IFormatProvider</code>. В проектах, где весь текст машинный, проще всего включить <code>InvariantGlobalization</code> — тогда любая культура ведёт себя как инвариантная.</p>'
    },
    {
      t: 'tapline',
      q: 'Программу запустили с культурой de-DE. Какая строка даст «1,5» вместо «1.5»?',
      code: 'double price = 1.5;\nstring a = price.ToString(CultureInfo.InvariantCulture);\nstring b = $"{price}";\nstring c = string.Create(CultureInfo.InvariantCulture, $"{price}");\nstring d = "1.5";',
      answer: 2,
      explain: 'Интерполяция без провайдера берёт текущую культуру, а в немецкой дробная часть отделяется запятой. Строки с InvariantCulture дают точку на любой машине.'
    }
  ]
};
