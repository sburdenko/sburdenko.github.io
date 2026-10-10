/** C# глубже, раздел 2, урок 1: делегаты и лямбды. */
export default {
  id: 'cs.u2.l1',
  title: 'Делегаты и лямбды',
  sub: 'Метод как значение',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Переменная, в которой лежит метод',
      body: '<p><b>Делегат</b> — объект, который хранит ссылку на метод. Его можно передать в другой метод, положить в список, вызвать позже.</p>',
      code: 'Func<int, int, int> op = Add;\nConsole.WriteLine(op(2, 3));   // 5\n\nstatic int Add(int a, int b) => a + b;'
    },
    {
      t: 'learn',
      title: 'Func, Action, Predicate',
      body: '<p><b>Func&lt;…, TResult&gt;</b> — принимает аргументы и возвращает результат (последний параметр — тип результата).<br><b>Action&lt;…&gt;</b> — ничего не возвращает.<br><b>Predicate&lt;T&gt;</b> — возвращает bool.</p>'
    },
    {
      t: 'match',
      q: 'Соедини сигнатуру и делегат',
      pairs: [
        ['int F(string s)', 'Func<string, int>'],
        ['void F(string s)', 'Action<string>'],
        ['bool F(int x)', 'Predicate<int>'],
        ['void F()', 'Action']
      ]
    },
    {
      t: 'learn',
      title: 'Лямбда — метод без имени',
      body: '<p>Метод можно описать прямо на месте: <code>x =&gt; x * 2</code>. Компилятор сам выведет типы из того, куда лямбду передают.</p>',
      code: 'var evens = numbers.Where(x => x % 2 == 0);\nFunc<int, int> twice = x => x * 2;'
    },
    {
      t: 'blanks',
      q: 'Делегат: принимает string, возвращает bool',
      code: '___<string, ___> isEmpty = s => s.Length == 0;',
      tiles: ['Func', 'bool', 'Action', 'int', 'Predicate'],
      answer: ['Func', 'bool'],
      explain: 'Можно и Predicate<string>, но здесь пропусков два — Func<string, bool>.'
    },
    {
      t: 'learn',
      title: 'Делегат на несколько методов',
      body: '<p>Делегаты <b>многоадресные</b>: <code>+=</code> добавляет метод в список вызова. При вызове выполняются все по порядку. Если делегат возвращает значение, останется результат последнего.</p>',
      code: 'Action log = () => Console.Write("A");\nlog += () => Console.Write("B");\nlog();   // AB'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'Func<int> f = () => 1;\nf += () => 2;\nConsole.WriteLine(f());',
      options: ['2', '1', '3'],
      answer: 0,
      explain: 'Вызываются оба, но возвращается результат последнего в списке.'
    },
    {
      t: 'choice',
      q: 'Чем Action отличается от Func?',
      options: ['Action ничего не возвращает, Func возвращает результат', 'Action асинхронный', 'Ничем'],
      answer: 0,
      explain: 'Func<int> — возвращает int; Action<int> — принимает int и ничего не возвращает.'
    },
    {
      t: 'multi',
      q: 'Что правда про делегаты? Отметь все.',
      options: ['Делегат — объект в куче', 'Делегат можно передать в метод', '+= добавляет метод в список вызова', 'Лямбда не может быть делегатом'],
      answer: [0, 1, 2],
      explain: 'Лямбда как раз и превращается в делегат (или в дерево выражений).'
    }
  ]
};
