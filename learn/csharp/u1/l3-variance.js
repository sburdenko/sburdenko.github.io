/** C# глубже, раздел 1, урок 3: вариантность и generic math. */
export default {
  id: 'cs.u1.l3',
  title: 'Вариантность и обобщённая математика',
  sub: 'out T, in T и INumber<T>',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Почему List<string> — не List<object>',
      body: '<p>Если бы можно было так присвоить, в список строк через «список объектов» положили бы число — и сломали бы его.</p>',
      code: 'List<object> objs = new List<string>();   // ошибка компиляции\nobjs.Add(42);                              // вот почему'
    },
    {
      t: 'learn',
      title: 'Ковариантность: out T',
      body: '<p>А <code>IEnumerable&lt;T&gt;</code> только <b>отдаёт</b> T, ничего не принимает. Поэтому последовательность строк безопасно считать последовательностью объектов. Это помечено <code>out</code>: <code>IEnumerable&lt;out T&gt;</code>.</p>',
      code: 'IEnumerable<object> objs = new List<string> { "a", "b" };   // можно'
    },
    {
      t: 'learn',
      title: 'Контравариантность: in T',
      body: '<p><code>Action&lt;in T&gt;</code> только <b>принимает</b> T. Действие, которое умеет печатать любой object, подойдёт и там, где ждут действие для string.</p>',
      code: 'Action<object> print = o => Console.WriteLine(o);\nAction<string> printText = print;   // можно'
    },
    {
      t: 'choice',
      q: 'Какое присваивание скомпилируется?',
      options: ['IEnumerable<object> x = new List<string>();', 'List<object> x = new List<string>();', 'IList<object> x = new List<string>();'],
      answer: 0,
      explain: 'IList принимает элементы (Add), поэтому он инвариантен.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['IEnumerable<out T>', 'Ковариантный: только отдаёт'],
        ['Action<in T>', 'Контравариантный: только принимает'],
        ['List<T>', 'Инвариантный'],
        ['Func<in T, out R>', 'Принимает T, отдаёт R']
      ]
    },
    {
      t: 'learn',
      title: 'Ловушка массивов',
      body: '<p>Массивы ковариантны с .NET 1.0 — ещё до дженериков. Компилятор пропустит, а упадёт при запуске:</p>',
      code: 'object[] arr = new string[2];\narr[0] = 42;   // ArrayTypeMismatchException'
    },
    {
      t: 'learn',
      title: 'Обобщённая математика (C# 11, .NET 7)',
      body: '<p>Раньше нельзя было написать Sum&lt;T&gt; для любых чисел: у T нет оператора +. Теперь интерфейсы могут требовать <b>статические</b> члены, и <code>INumber&lt;T&gt;</code> даёт +, −, Zero и остальное.</p>',
      code: 'T Sum<T>(T[] xs) where T : INumber<T>\n{\n    T total = T.Zero;\n    foreach (var x in xs) total += x;\n    return total;\n}\n\nSum(new[] { 1, 2, 3 });        // int\nSum(new[] { 1.5, 2.5 });       // double'
    },
    {
      t: 'blanks',
      q: 'Сумма для любых чисел',
      code: 'T Sum<T>(T[] xs) where T : ___<T>\n{\n    T total = T.___;',
      tiles: ['INumber', 'Zero', 'IComparable', 'Default', 'IEquatable'],
      answer: ['INumber', 'Zero'],
      explain: 'Zero — статическое свойство из интерфейса, поэтому пишут T.Zero.'
    },
    {
      t: 'choice',
      q: 'Почему компилятор пропускает object[] arr = new string[2], хотя это опасно?',
      options: ['Ковариантность массивов осталась с .NET 1.0 ради совместимости; проверка — при запуске', 'Это безопасно', 'Это ошибка компиляции'],
      answer: 0,
      explain: 'Дженерик-интерфейсы сделали вариантность безопасной, а массивы так и остались.'
    }
  ]
};
