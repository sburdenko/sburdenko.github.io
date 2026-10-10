/** Deeper C#, unit 2, lesson 1: delegates and lambdas. */
export default {
  id: 'cs.u2.l1',
  title: 'Delegates and lambdas',
  sub: 'A method as a value',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A variable that holds a method',
      body: '<p>A <b>delegate</b> is an object that holds a reference to a method. You can pass it to another method, put it in a list, or call it later.</p>',
      code: 'Func<int, int, int> op = Add;\nConsole.WriteLine(op(2, 3));   // 5\n\nstatic int Add(int a, int b) => a + b;'
    },
    {
      t: 'learn',
      title: 'Func, Action, Predicate',
      body: '<p><b>Func&lt;…, TResult&gt;</b> — takes arguments and returns a result (the last type parameter is the result type).<br><b>Action&lt;…&gt;</b> — returns nothing.<br><b>Predicate&lt;T&gt;</b> — returns bool.</p>'
    },
    {
      t: 'match',
      q: 'Match the signature to the delegate',
      pairs: [
        ['int F(string s)', 'Func<string, int>'],
        ['void F(string s)', 'Action<string>'],
        ['bool F(int x)', 'Predicate<int>'],
        ['void F()', 'Action']
      ]
    },
    {
      t: 'learn',
      title: 'A lambda is a method without a name',
      body: '<p>You can write a method right where you need it: <code>x =&gt; x * 2</code>. The compiler infers the types from where the lambda is passed.</p>',
      code: 'var evens = numbers.Where(x => x % 2 == 0);\nFunc<int, int> twice = x => x * 2;'
    },
    {
      t: 'blanks',
      q: 'A delegate that takes a string and returns bool',
      code: '___<string, ___> isEmpty = s => s.Length == 0;',
      tiles: ['Func', 'bool', 'Action', 'int', 'Predicate'],
      answer: ['Func', 'bool'],
      explain: 'Predicate<string> would work too, but there are two gaps here — Func<string, bool>.'
    },
    {
      t: 'learn',
      title: 'One delegate, several methods',
      body: '<p>Delegates are <b>multicast</b>: <code>+=</code> adds a method to the invocation list. Calling the delegate runs them all in order. If it returns a value, you get the result of the last one.</p>',
      code: 'Action log = () => Console.Write("A");\nlog += () => Console.Write("B");\nlog();   // AB'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'Func<int> f = () => 1;\nf += () => 2;\nConsole.WriteLine(f());',
      options: ['2', '1', '3'],
      answer: 0,
      explain: 'Both run, but you get the result of the last one in the list.'
    },
    {
      t: 'choice',
      q: 'How is Action different from Func?',
      options: ['Action returns nothing, Func returns a result', 'Action is asynchronous', 'They are the same'],
      answer: 0,
      explain: 'Func<int> returns an int; Action<int> takes an int and returns nothing.'
    },
    {
      t: 'multi',
      q: 'Which are true about delegates? Select all.',
      options: ['A delegate is an object on the heap', 'You can pass a delegate to a method', '+= adds a method to the invocation list', 'A lambda cannot be a delegate'],
      answer: [0, 1, 2],
      explain: 'A lambda is exactly what turns into a delegate (or an expression tree).'
    }
  ]
};
