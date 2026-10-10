/** Unit 2, lesson 3: boxing and unboxing. */
const CODE = 'int n = 42;\nobject o = n;      // boxing\nn = 7;\nint m = (int)o;    // unboxing';

export default {
  id: 'dotnet.w2.l3',
  title: 'Boxing',
  sub: 'When a number suddenly ends up on the heap',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A number in an object variable',
      body: '<p><code>object</code> is a reference type. If you put a number into it, .NET creates a "box" on the heap with a copy of the number and stores a reference to it in the variable. That\'s <b>boxing</b>.</p><p>Getting the number back out is <b>unboxing</b>.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through and see where the box appears.',
      goal: 'end',
      code: CODE,
      steps: [
        { line: 0, note: 'A plain number on the stack.', ops: [{ op: 'int', name: 'n', value: 42 }] },
        { line: 1, note: 'Boxing: a box with a copy of 42 appeared on the heap, and o holds a reference to it.', ops: [{ op: 'box', name: 'o', from: 'n' }] },
        { line: 2, note: 'We change n. The box doesn\'t change: it has its own copy.', ops: [{ op: 'set', target: 'n', value: 7 }] },
        { line: 3, note: 'Unboxing: the copy from the box is back on the stack. m = 42.', ops: [{ op: 'unbox', name: 'm', from: 'o' }] }
      ],
      solve: ['step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'What is m?',
      code: CODE,
      options: ['42', '7', '0', 'An exception is thrown'],
      answer: 0,
      explain: 'The box got a copy of 42. Changing n after boxing doesn\'t touch it.'
    },
    {
      t: 'choice',
      q: 'What happens?',
      code: 'object o = 42;\nlong x = (long)o;',
      options: ['InvalidCastException', 'x = 42', 'A compile error'],
      answer: 0,
      explain: 'You can only unbox to the exact same type. The box holds an int, not a long. The right way: (long)(int)o.',
      wrong: { 1: 'That would work for a plain int: (long)n. But unboxing requires the exact type.', 2: 'The compiler allows it: an object could be anything. The error happens at run time.' }
    },
    {
      t: 'learn',
      title: 'Where boxing hides',
      body: '<p>A number becomes an object when you put it where an <code>object</code> or an interface is expected:</p><p><code>IComparable c = 5;</code><br>old collections like <code>ArrayList</code>;<br>methods with an <code>object</code> parameter, such as <code>Console.WriteLine("{0}", n)</code>.</p><p>Every boxing is a new object on the heap and more work for the garbage collector. Generic collections (<code>List&lt;int&gt;</code>) store numbers without boxes.</p>',
      deep: 'Boxing in a hot loop is a classic source of extra allocations, and it shows up in a profiler. String interpolation <code>$"{n}"</code> in C# 10+ goes through an interpolation handler with generic methods and usually avoids boxing.'
    },
    {
      t: 'multi',
      q: 'Where does boxing happen? Select all that apply.',
      options: ['object o = 5;', 'IComparable c = 5;', 'arrayList.Add(5);', 'list.Add(5);  // List<int>', 'int x = 5 + 5;'],
      answer: [0, 1, 2],
      explain: 'object, an interface and ArrayList all expect a reference, so a box is needed. List<int> stores the int as is.'
    },
    {
      t: 'tapline',
      q: 'Which line creates an object on the heap?',
      code: 'int a = 10;\nint b = a * 2;\nobject c = b;\nint d = (int)c;',
      answer: 2,
      explain: 'object c = b is boxing: a box appears on the heap. Unboxing on line 4 creates no new objects.'
    },
    {
      t: 'choice',
      q: 'Why is List<int> better than ArrayList for numbers?',
      options: ['It stores int as is: no boxing and no casts', 'It\'s thread-safe', 'It compresses numbers'],
      answer: 0,
      explain: 'ArrayList stores object: every number is boxed on the way in and unboxed on the way out. The generic knows the exact type.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Boxing', 'A copy of the value moves to the heap'],
        ['Unboxing', 'The copy comes back from the box into a variable'],
        ['List<int>', 'Numbers without boxes'],
        ['InvalidCastException', 'Unboxing to the wrong type']
      ]
    }
  ]
};
