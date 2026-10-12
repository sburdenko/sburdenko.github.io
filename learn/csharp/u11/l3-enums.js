/** C# глубже, раздел «Строки, перечисления, массивы», урок 3: перечисления и флаги. */
export default {
  id: 'cs.u11.l3',
  title: 'Перечисления и флаги',
  sub: 'Структура над целым, вшитые значения, неопределённые значения, [Flags] и HasFlag',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'enum для CLR — структура над целым',
      body: '<p>Перечисление (enum) — это значимый тип, наследник <code>System.Enum</code>. Внутри у него ровно одно поле экземпляра — <code>value__</code> базового целого типа (по умолчанию <code>int</code>). Имена членов — это <b>константы</b>: статические литеральные поля с числом.</p><p>Значит, переменная <code>Color</code> занимает столько же, сколько её базовый тип, и в машинном коде это просто число. Базовый тип можно выбрать: <code>byte</code>, <code>short</code>, <code>long</code> и их беззнаковые пары.</p>',
      code: 'enum Color : byte { Red, Green, Blue = 10 }\n\n// IL:\n// .class sealed Color extends System.Enum\n//   .field public specialname rtspecialname uint8 value__\n//   .field public static literal valuetype Color Red = uint8(0)\n//   .field public static literal valuetype Color Green = uint8(1)\n//   .field public static literal valuetype Color Blue = uint8(10)',
      deep: '<p>Раз это обычное целое внутри, упакованное перечисление распаковывается в свой базовый тип и обратно: <code>(int)(object)DayOfWeek.Monday</code> работает — мы видели это в разделе «Устройство типа». Методы вроде <code>ToString</code> объявлены в <code>System.Enum</code>, а это ссылочный тип, поэтому их вызов на значении перечисления обычно требует упаковки.</p><p>Ограничение <code>where T : struct, Enum</code> доступно с C# 7.3; на нём построены дженерик-версии API: <code>Enum.Parse&lt;T&gt;</code>, <code>Enum.GetValues&lt;T&gt;()</code> (.NET 5).</p>'
    },
    {
      t: 'choice',
      q: 'enum Color { Red, Green, Blue }. Что сделает строка Color c = (Color)42;?',
      options: ['Скомпилируется и сработает: в c будет число 42', 'Бросит InvalidCastException', 'Не скомпилируется', 'Сработает, в c окажется Blue'],
      answer: 0,
      explain: 'Приведение целого к перечислению — просто смена типа числа. CLR не проверяет, есть ли такой член. c.ToString() вернёт "42".',
      wrong: { 1: 'Проверки при приведении нет: перечисление — то же целое.', 3: 'Значение не «прижимается» к ближайшему члену, оно остаётся 42.' }
    },
    {
      t: 'learn',
      title: 'Значения вшиваются в вызывающий код',
      body: '<p>Член перечисления — константа. Когда приложение пишет <code>Status.Blocked</code>, компилятор подставляет в его IL <b>число</b>, а не ссылку на поле. После сборки приложение не знает имени, только 1.</p><p>Сценарий «версия 2»: библиотека вставила новый член в начало, и все неявные номера сдвинулись. Приложение, собранное со старой версией, продолжает сравнивать с прежними числами — и теперь они означают другое. Ошибки загрузки нет, есть тихий неправильный результат.</p><p>Правила для публичных перечислений: задавай значения явно, новые члены добавляй в конец, старые не перенумеровывай и не удаляй.</p>',
      code: '// библиотека v1\nenum Status { Active, Blocked }           // Blocked = 1\n\n// библиотека v2\nenum Status { Pending, Active, Blocked }  // Blocked = 2, 1 — это Active\n\n// приложение, собранное с v1, в IL:\n// if ((int)user.Status == 1) ...'
    },
    {
      t: 'choice',
      q: 'Библиотеку обновили до v2 из карточки выше, а приложение не пересобрали. Что делает его проверка if (user.Status == Status.Blocked)?',
      options: ['Сравнивает с 1 и считает заблокированными активных', 'Сравнивает с Blocked по имени и работает верно', 'Падает с MissingFieldException', 'Сравнивает с 2'],
      answer: 0,
      explain: 'В IL приложения записано число 1 — значение Blocked на момент сборки. В v2 единица означает Active. Поле по имени никто не ищет, поэтому и исключения нет.',
      wrong: { 2: 'MissingFieldException возможен, когда код обращается к полю. Константу компилятор уже подставил числом.' }
    },
    {
      t: 'learn',
      title: 'Неопределённые значения',
      body: '<p>В переменной перечисления может оказаться любое число: из приведения, из базы, из JSON, из <code>default</code>. Важные детали:</p><ul><li><code>default(Color)</code> и неинициализированные поля — всегда <b>0</b>, даже если члена со значением 0 нет. Поэтому первым членом делают <code>None</code> или <code>Unknown = 0</code>.</li><li><code>Enum.TryParse&lt;Color&gt;("42", out c)</code> вернёт <b>true</b>: числовая строка разбирается в число, есть такой член или нет.</li><li><code>Enum.IsDefined(c)</code> проверяет, есть ли член с ровно таким значением.</li><li><code>switch</code>-оператор без <code>default</code> просто пропустит неизвестное значение. <code>switch</code>-выражение, перечисляющее все имена, даст предупреждение <b>CS8524</b>, а на неизвестном значении бросит <code>SwitchExpressionException</code>.</li></ul>',
      code: 'string Act(Light l) => l switch\n{\n    Light.Red => "stop",\n    Light.Green => "go",\n    _ => throw new ArgumentOutOfRangeException(nameof(l))\n};',
      deep: '<p>Почему компилятор требует ветку <code>_</code>, хотя все имена перечислены: для него <code>Light</code> — это весь диапазон <code>int</code>, а имена — лишь некоторые точки. Отдельное предупреждение CS8524 (а не обычное CS8509) говорит именно о неименованных значениях — чтобы его можно было подавить, если данные точно проверены на входе.</p><p><code>Enum.IsDefined</code> в .NET 5+ есть в дженерик-форме <code>IsDefined&lt;T&gt;(T)</code> без упаковки; значения членов рантайм кэширует, но это всё же поиск, а не одно сравнение. В горячем пути проверку диапазона пишут вручную: <code>(uint)l &lt;= (uint)Light.Green</code>, если значения идут подряд.</p>'
    },
    {
      t: 'multi',
      q: 'enum Color { Red = 1, Green = 2 }. Что правда? Отметь все.',
      options: ['Enum.TryParse<Color>("42", out var c) вернёт true', 'Enum.IsDefined((Color)42) вернёт false', 'default(Color) равен 0, хотя такого члена нет', '(Color)42 бросит исключение при запуске', 'switch-выражение с ветками Red и Green без _ даст предупреждение'],
      answer: [0, 1, 2, 4],
      explain: 'Приведение к перечислению ничего не проверяет — поэтому и нужны IsDefined и ветка _ в switch. TryParse принимает любую числовую строку, которая помещается в базовый тип.'
    },
    {
      t: 'learn',
      title: 'Флаги и что делает [Flags]',
      body: '<p>Флаги — перечисление, где каждый член — отдельный бит: значения 1, 2, 4, 8… Комбинации собираются через <code>|</code>, проверяются через <code>&amp;</code>, снимаются через <code>&amp; ~</code>.</p><p>Атрибут <code>[Flags]</code> степени двойки <b>не назначает</b> — их пишешь сам, иначе у None, Read, Write, Exec неявная нумерация даст 0, 1, 2, 3, и Read | Write совпадёт с Exec. Атрибут меняет только текстовое представление: <code>ToString</code> выводит комбинацию по именам, а <code>Enum.Parse</code> понимает «Read, Write».</p>',
      code: '[Flags]\nenum Perm { None = 0, Read = 1, Write = 2, Exec = 4 }\n\nvar p = Perm.Read | Perm.Write;   // 3\np &= ~Perm.Write;                 // снять Write\nbool canRead = (p & Perm.Read) != 0;\nConsole.WriteLine(Perm.Read | Perm.Exec); // "Read, Exec"',
      deep: '<p>Если число нельзя целиком разложить на определённые флаги, <code>ToString</code> вернёт его цифрами: для <code>(Perm)9</code> — «9». Удобные комбинации можно объявить членами: <code>ReadWrite = Read | Write</code>; <code>ToString</code> предпочтёт такое имя. Для 64 и меньше флагов хватает <code>long</code>/<code>ulong</code>; больше — уже <code>BitArray</code> или своя структура.</p>'
    },
    {
      t: 'choice',
      q: 'В Perm убрали атрибут [Flags], значения оставили. Что напечатает Console.WriteLine(Perm.Read | Perm.Write)?',
      options: ['3', 'Read, Write', 'Read | Write', 'Write'],
      answer: 0,
      explain: 'Без [Flags] ToString ищет член ровно со значением 3, не находит и печатает число. Сами битовые операции работают одинаково с атрибутом и без.'
    },
    {
      t: 'learn',
      title: 'HasFlag: тогда и сейчас',
      body: '<p>Сигнатура — <code>bool HasFlag(Enum flag)</code>. Параметр имеет тип <code>System.Enum</code>, а это ссылочный тип: аргумент упаковывается. Сам метод объявлен в <code>System.Enum</code>, так что упаковывается и значение, на котором его вызвали. Внутри ещё проверка, что типы совпадают, иначе <code>ArgumentException</code>.</p><p>В .NET Framework каждый вызов стоил двух аллокаций, и в горячем коде его заменяли на <code>(p &amp; f) == f</code>. С .NET Core 2.1 JIT распознаёт <code>HasFlag</code> как встроенную операцию (intrinsic) и генерирует то же битовое сравнение — без упаковок.</p><p>Ловушка по смыслу осталась: <code>p.HasFlag(Perm.None)</code> всегда true — любое число «содержит» ноль бит.</p>',
      deep: '<p>Оптимизация срабатывает, когда JIT видит оба типа точно. В коде, где значение уже лежит как <code>Enum</code> или <code>object</code>, упаковка уже случилась раньше, и чуда не будет. Ещё одна тонкость: <code>Enum.IsDefined</code> для комбинации флагов вернёт false, если комбинация не объявлена отдельным членом, — проверять флаги через IsDefined нельзя.</p>'
    },
    {
      t: 'tapline',
      q: 'Какая из переменных b–e получит true?',
      code: '[Flags] enum Perm { None = 0, Read = 1, Write = 2, Exec = 4 }\nPerm p = Perm.Read;\nbool b = p.HasFlag(Perm.None);\nbool c = (p & Perm.Write) == Perm.Write;\nbool d = Enum.IsDefined(Perm.Read | Perm.Write);\nbool e = p.HasFlag(Perm.Exec);',
      answer: 2,
      explain: 'HasFlag(None) проверяет (p & 0) == 0 — это истинно всегда. Write и Exec в p нет, а значение 3 не объявлено членом, поэтому IsDefined вернёт false.'
    },
    {
      t: 'learn',
      title: 'Цена: где перечисление стоит денег',
      body: '<p>Сравнения, <code>switch</code>, битовые операции — бесплатно: это работа с целым. JIT часто превращает <code>switch</code> по плотным значениям в таблицу переходов.</p><p>Платишь там, где нужно имя или отражение:</p><ul><li><code>ToString()</code> и интерполяция — поиск имени по значению (рантайм кэширует имена и для объявленного члена возвращает готовую строку, но вызов через <code>System.Enum</code> обычно стоит упаковки, а для комбинаций флагов и неизвестных значений строка собирается заново);</li><li><code>Enum.Parse</code>, <code>GetNames</code>, <code>GetValues</code> — разбор строки и новые массивы на каждый вызов;</li><li>необобщённые API (<code>Enum.IsDefined(typeof(T), value)</code>, <code>HasFlag</code> до .NET Core 2.1) — упаковка.</li></ul><p>Если имена нужны в горячем пути (логи, JSON), заводят свой <code>switch</code> со строковыми литералами или кэш-массив имён.</p>',
      deep: '<p>Сериализаторы решают это так же: <code>System.Text.Json</code> с <code>JsonStringEnumConverter</code> кэширует имена, а его генератор исходников (source generator) выдаёт код без отражения. Для Native AOT дженерик-версии <code>Enum.GetValues&lt;T&gt;()</code> предпочтительнее версий с <code>Type</code>: необобщённый <code>GetValues(Type)</code> создаёт массив типа, который AOT-компилятор может не предусмотреть, и помечен предупреждением.</p>'
    },
    {
      t: 'blanks',
      q: 'Допиши дженерик-проверку, что значение — объявленный член перечисления',
      code: 'static bool IsKnown<T>(T value) where T : struct, ___\n    => Enum.___(value);',
      tiles: ['Enum', 'IsDefined', 'IConvertible', 'TryParse', 'class'],
      answer: ['Enum', 'IsDefined'],
      explain: 'Ограничение struct, Enum (C# 7.3) пускает только перечисления. Enum.IsDefined<T>(T) из .NET 5 работает без упаковки и без typeof.'
    }
  ]
};
