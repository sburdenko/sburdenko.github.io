/** C# глубже, финал раздела «Строки, перечисления, массивы». */
export default {
  id: 'cs.u11.boss',
  title: 'Финал: строки, перечисления, массивы',
  sub: 'Сравнение строк, сборка без аллокаций, флаги, ковариантность и int?',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'multi',
      q: 'Какие вызовы по умолчанию сравнивают по правилам текущей культуры? Отметь все.',
      options: ['a.StartsWith("id")', 'string.Compare(a, b)', 'a == b', 'a.Contains("id")', 'names.Sort() для List<string>'],
      answer: [0, 1, 4],
      explain: '== и Contains — порядковые. StartsWith(string), Compare и сортировка через Comparer<string>.Default идут по культуре потока, и на ICU или в tr-TR результат может удивить.'
    },
    {
      t: 'choice',
      q: 'Ключ кэша строится как url.ToLower(). На серверах с культурой tr-TR часть запросов идёт мимо кэша. Какое исправление верное?',
      options: ['url.ToLowerInvariant() или словарь с StringComparer.OrdinalIgnoreCase', 'string.Intern(url.ToLower())', 'Заменить ToLower на ToUpper', 'Сравнивать ключи через string.Compare(a, b, true)'],
      answer: 0,
      explain: 'В tr-TR «I» превращается в «ı» без точки, и ключи разъезжаются. Идентификаторы сравнивают без правил языка. Intern ничего не меняет в тексте, ToUpper ломается на той же букве, а Compare с ignoreCase всё ещё зависит от культуры.',
      wrong: { 3: 'Перегрузка Compare(a, b, ignoreCase) по-прежнему использует текущую культуру.' }
    },
    {
      t: 'choice',
      q: 'id — int, name — string. Во что C# 12 превратит $"{id}: {name}"?',
      options: ['DefaultInterpolatedStringHandler: AppendFormatted(id) без упаковки, одна итоговая строка', 'string.Format с object[] и упаковкой id', 'StringBuilder с тремя Append', 'string.Concat(id, ": ", name) с упаковкой id'],
      answer: 0,
      explain: 'С C# 10 и .NET 6 интерполяция идёт через обработчик-ref struct с буфером из ArrayPool. AppendFormatted<T> — дженерик, int пишется прямо в буфер. string.Format был до C# 10.'
    },
    {
      t: 'match',
      q: 'Соедини конструкцию и что за ней стоит',
      pairs: [
        ['"hel" + "lo"', 'Один литерал ещё при сборке'],
        ['"GET "u8', 'ReadOnlySpan<byte> на данные сборки'],
        ['arr[i] = x в Animal[]', 'Проверка типа при каждой записи'],
        ['p.HasFlag(f) в .NET 8', 'То же, что (p & f) == f'],
        ['object o = (int?)5', 'Коробка с Int32']
      ]
    },
    {
      t: 'choice',
      q: 'enum Light { Red, Yellow, Green }. Метод — switch-выражение с ветками для трёх имён, без _. Что будет при вызове Act((Light)7)?',
      options: ['SwitchExpressionException; компилятор заранее предупредил CS8524', 'Вернёт null', 'Не скомпилируется: (Light)7 вне диапазона', 'Сработает ветка Green как последняя'],
      answer: 0,
      explain: 'Перечисление — весь диапазон int, имена — лишь точки в нём. Компилятор предупреждает о неименованных значениях, а сгенерированный код бросает SwitchExpressionException, если ни одна ветка не подошла.'
    },
    {
      t: 'blanks',
      q: 'Значение по умолчанию без исключения и разбор с проверкой, что член объявлен',
      code: 'int? n = TryReadAge();\nint age = n.___();\n\nbool ok = Enum.___<Color>(text, out var c)\n    && Enum.IsDefined(c);',
      tiles: ['GetValueOrDefault', 'Value', 'TryParse', 'Parse', 'HasValue'],
      answer: ['GetValueOrDefault', 'TryParse'],
      explain: '.Value бросит InvalidOperationException, если значения нет. TryParse примет и «42», поэтому IsDefined после него не лишний.'
    },
    {
      t: 'multi',
      q: 'Что правда про массивы? Отметь все.',
      options: ['Строки зубчатого массива могут быть разной длины', 'int[,] — один объект в куче', 'object[] o = new int[3]; компилируется', '[InlineArray] работает только в unsafe-коде', 'int[] a = []; не создаёт новый массив'],
      answer: [0, 1, 4],
      explain: 'Ковариантность есть только у массивов ссылочных типов. InlineArray — безопасная альтернатива fixed-буферу. Пустое выражение коллекции для массива — общий Array.Empty<int>().'
    },
    {
      t: 'tapline',
      q: 'Какая строка бросит исключение при запуске?',
      code: 'string[] names = { "a", "b" };\nobject[] objs = names;\nobjs[0] = "c";\nobjs[1] = null;\nReadOnlySpan<object> ro = objs;\nSpan<object> span = objs;',
      answer: 5,
      explain: 'Записи строки и null в string[] законны. ReadOnlySpan запись не позволяет, поэтому ковариантность ему не страшна. Span<object> мог бы записать туда не строку — его конструктор видит, что массив на деле string[], и бросает ArrayTypeMismatchException.'
    },
    {
      t: 'choice',
      q: 'Публичная библиотека: enum Level { Low, High }. В v2 хотят добавить Medium между ними по смыслу. Как не сломать уже собранных потребителей?',
      options: ['Оставить Low = 0, High = 1 и добавить Medium = 2 в конец', 'Вставить Medium в середину: имена ведь не поменялись', 'Сделать Level классом со статическими полями', 'Пометить перечисление [Flags]'],
      answer: 0,
      explain: 'Потребители хранят в IL числа, а не имена. Вставка в середину сдвинет High с 1 на 2, и старый код начнёт путать уровни. Новые члены — только в конец, значения задаются явно.'
    }
  ]
};
