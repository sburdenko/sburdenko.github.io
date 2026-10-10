/** Unit 2 final: types and memory, all mixed together. */
export default {
  id: 'dotnet.w2.boss',
  title: 'Final: where data lives',
  sub: 'Everything about types and memory: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Size is a struct. What is a.W?',
      code: 'var a = new Size(2, 3);\nvar b = a;\nb.W = 10;',
      options: ['2', '10', '0'],
      answer: 0,
      explain: 'A struct is copied whole: b is an independent copy.'
    },
    {
      t: 'choice',
      q: 'And if Size is a class?',
      code: 'var a = new Size(2, 3);\nvar b = a;\nb.W = 10;',
      options: ['10', '2', '0'],
      answer: 0,
      explain: 'For a class, the reference is copied: a and b are one object.'
    },
    {
      t: 'multi',
      q: 'What ends up on the heap? Select all that apply.',
      options: ['new List<int>()', 'A local int variable', 'An int field inside a class instance', 'object o = 3.14;', 'bool flag = true;'],
      answer: [0, 2, 3],
      explain: 'Class instances, everything inside them, and boxes from boxing live on the heap. Local value-type variables live on the stack.'
    },
    {
      t: 'choice',
      q: 'Point is a class, p = (5, 5). What happens to p.X after the call?',
      code: 'static void Reset(Point q) => q = new Point(0, 0);\nReset(p);',
      options: ['It stays 5', 'It becomes 0', 'NullReferenceException'],
      answer: 0,
      explain: 'The method replaced its own copy of the reference. Without ref, the variable p doesn\'t change.'
    },
    {
      t: 'choice',
      q: 'What happens?',
      code: 'object o = 1;\ndouble d = (double)o;',
      options: ['InvalidCastException', 'd = 1.0', 'A compile error'],
      answer: 0,
      explain: 'The box holds an int. You can only unbox to int and convert afterwards: (double)(int)o.'
    },
    {
      t: 'tapline',
      q: 'Which line changes nothing?',
      code: 'string s = "hi";\ns.ToUpper();\ns = s + "!";\nConsole.WriteLine(s);',
      answer: 1,
      explain: 'ToUpper returns a new string, and the result is thrown away. The program prints "hi!".'
    },
    {
      t: 'choice',
      q: 'An array of 100 Point class instances, all filled. How many objects are on the heap?',
      options: ['101', '100', '1'],
      answer: 0,
      explain: 'The array itself plus 100 separate points.'
    },
    {
      t: 'choice',
      q: 'What is n?',
      code: 'static void Inc(ref int x) => x++;\nint n = 1;\nInc(ref n);',
      options: ['2', '1', '0'],
      answer: 0,
      explain: 'With ref, the method works with the variable n itself.'
    },
    {
      t: 'choice',
      q: 'A method returned. What disappeared immediately?',
      options: ['Its stack frame with all local variables', 'All the objects it created', 'Nothing; the garbage collector cleans up everything'],
      answer: 0,
      explain: 'The frame is discarded instantly. Objects on the heap live as long as something references them.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['struct', 'Copied whole on assignment'],
        ['class', 'Only the reference is copied'],
        ['string', 'A reference type, but immutable'],
        ['object o = 5', 'Boxing: a box on the heap']
      ]
    },
    {
      t: 'blanks',
      q: 'Pass a big struct without copying it and without permission to change it',
      code: 'static double Length(___ Vector3 v) =>\n    Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);',
      lang: 'cs',
      tiles: ['in', 'ref', 'out', 'params'],
      answer: ['in'],
      explain: 'in passes by reference, read-only.'
    }
  ]
};
