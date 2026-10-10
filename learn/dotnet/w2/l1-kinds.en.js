/** Unit 2, lesson 1: value types and reference types. */
const CODE = 'Point p1 = new Point(1, 2);\nPoint p2 = p1;\np2.X = 100;\nConsole.WriteLine(p1.X);';

export default {
  id: 'dotnet.w2.l1',
  title: 'Value types and reference types',
  sub: 'Why the same line behaves differently',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Two kinds of types',
      body: '<p>Every type in C# is one of two kinds.</p><p><b>Value types</b>: <code>int</code>, <code>double</code>, <code>bool</code>, any <code>struct</code>. The variable holds the value itself.</p><p><b>Reference types</b>: any <code>class</code>, <code>string</code>, arrays. The variable holds only the object\'s address, a reference. The object itself lives elsewhere, on the heap.</p><p>A value type is like a note with a number on it: you hand over a copy and keep your own. A reference type is like a house address: give it to a friend, and you both walk into the same house.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through the program twice: once with Point as a struct and once as a class. Watch the stack and the heap.',
      goal: 'both',
      variants: {
        struct: {
          code: CODE,
          steps: [
            { line: 0, note: 'p1 is a struct: both fields live right in the variable, on the stack.', ops: [{ op: 'new', name: 'p1', type: 'Point', kind: 'val', fields: { X: 1, Y: 2 } }] },
            { line: 1, note: 'p2 = p1 copies the whole struct. Now there are two independent points.', ops: [{ op: 'copy', to: 'p2', from: 'p1' }] },
            { line: 2, note: 'We change p2. p1 is not affected.', ops: [{ op: 'set', target: 'p2', field: 'X', value: 100 }] },
            { line: 3, note: 'Prints 1: p1 has its own copy.', ops: [] }
          ]
        },
        class: {
          code: CODE,
          steps: [
            { line: 0, note: 'A Point object is created on the heap. p1 holds only a reference to it.', ops: [{ op: 'new', name: 'p1', type: 'Point', kind: 'ref', fields: { X: 1, Y: 2 } }] },
            { line: 1, note: 'p2 = p1 copies the reference. Both variables lead to the same object.', ops: [{ op: 'copy', to: 'p2', from: 'p1' }] },
            { line: 2, note: 'We change the object through p2. It\'s the same object p1 points to.', ops: [{ op: 'set', target: 'p2', field: 'X', value: 100 }] },
            { line: 3, note: 'Prints 100: p1 and p2 are the same object.', ops: [] }
          ]
        }
      },
      solve: ['step', 'step', 'step', 'step', 'variant:class', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point is a struct. What does the code print?',
      code: CODE,
      options: ['1', '100', '0', 'A compile error'],
      answer: 0,
      explain: 'Assigning a struct copies all of it. p2 is a separate copy, and changes to it don\'t show up in p1.'
    },
    {
      t: 'choice',
      q: 'And if Point is a class?',
      code: CODE,
      options: ['100', '1', '0', 'NullReferenceException'],
      answer: 0,
      explain: 'For a class, only the reference is copied. p1 and p2 lead to one object, so a change made through p2 is visible through p1.'
    },
    {
      t: 'multi',
      q: 'Which of these are value types? Select all that apply.',
      options: ['int', 'bool', 'DateTime', 'string', 'int[]', 'List<int>'],
      answer: [0, 1, 2],
      explain: 'DateTime is a struct. string and arrays are reference types, even if they hold nothing but numbers.'
    },
    {
      t: 'learn',
      title: 'How to tell which is which',
      body: '<p><code>struct</code> and <code>enum</code> are value types. <code>class</code>, <code>interface</code>, delegates, arrays and <code>string</code> are reference types.</p><p>Can\'t remember? Hover over the type in your IDE: it will say struct or class.</p>',
      deep: 'A <code>record struct</code> is a value type; a plain <code>record</code> (a record class) is a reference type. <code>int?</code> is <code>Nullable&lt;int&gt;</code>, also a struct: the value plus a HasValue flag.'
    },
    {
      t: 'choice',
      q: 'Point is a class with no Equals override. What does a.Equals(b) return?',
      code: 'var a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a.Equals(b));',
      options: ['False', 'True', 'A compile error'],
      answer: 0,
      explain: 'These are two different objects on the heap. A class\'s default Equals compares references. For a struct it would compare fields and return True.',
      wrong: { 1: 'A struct would give True: its default Equals compares fields.' }
    },
    {
      t: 'choice',
      q: 'When does a struct make sense?',
      options: ['A small value that behaves like a number: a coordinate, a color, a date', 'A big object with a dozen fields that gets passed around a lot', 'An object that is modified from many places in the program'],
      answer: 0,
      explain: 'A struct is copied on every assignment and every call. That\'s expensive for big data, and changes to a copy don\'t reach the original.',
      deep: 'Microsoft\'s guideline: a struct should be under 16 bytes, immutable, and logically represent a single value.'
    },
    {
      t: 'tapline',
      q: 'Point is a class. After which line does a.X become 50?',
      code: 'var a = new Point(1, 2);\nvar b = a;\nvar c = new Point(1, 2);\nc.X = 50;\nb.X = 50;',
      answer: 4,
      explain: 'b is a reference to the same object as a. c is a completely different object, even though it has the same values.'
    }
  ]
};
