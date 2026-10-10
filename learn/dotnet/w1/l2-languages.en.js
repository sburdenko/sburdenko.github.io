/** Lesson 2: many languages, one .NET; the compiler defines the syntax; the CLS. */
export default {
  id: 'dotnet.w1.l2',
  title: 'Many languages, one .NET',
  sub: 'Compilers, CIL and the shared CLS vocabulary',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'You can write for .NET in many languages',
      body: '<p>C#, F#, Visual Basic and others. Each has its own compiler, but they all produce the same thing: <b>CIL</b> and <b>metadata</b>, a description of the classes and methods.</p><p>That is why a library written in F# can be called from a C# program without any fuss.</p>',
      flow: ['C# · F# · VB', 'Its own compiler', 'CIL + metadata', 'CLR']
    },
    {
      t: 'learn',
      title: 'One method, three languages',
      body: '<p>They look different, but C# and F# produce the same CIL: <code>ldarg.0</code>, <code>ldarg.1</code>, <code>add</code>, <code>ret</code>. We\'ll see what those lines mean in the next lesson.</p>',
      code: '// C#\nstatic int Add(int a, int b) => a + b;\n\n// F#\nlet add a b = a + b\n\n// Visual Basic\nFunction Add(a As Integer, b As Integer) As Integer\n    Return a + b\nEnd Function'
    },
    {
      t: 'choice',
      q: 'Who decides how code is written: where semicolons go, how a method is declared?',
      options: ['The language compiler', 'The CLR', 'The CPU', 'The operating system'],
      answer: 0,
      explain: 'Syntax is the compiler\'s business. The CLR only sees CIL and has no idea which language you wrote in.',
      wrong: { 1: 'The CLR receives finished CIL. There are no semicolons in it.' }
    },
    {
      t: 'learn',
      title: 'Same "+", different meaning',
      body: '<p>Visual Basic checks for overflow by default: its <code>+</code> becomes the CIL instruction <code>add.ovf</code>, an add with a check. If the result doesn\'t fit in an <code>int</code>, you get an <code>OverflowException</code>.</p><p>C# doesn\'t check by default: the number silently wraps around. The compiler decided what plus means, not the CLR.</p>',
      code: 'int x = int.MaxValue;   // 2,147,483,647\nConsole.WriteLine(x + 1);',
      deep: 'In C# you turn the check on with the <code>checked</code> keyword or the <code>&lt;CheckForOverflowUnderflow&gt;</code> project property. In VB you turn it off with the "Remove integer overflow checks" option. C# rejects a constant expression like <code>int.MaxValue + 1</code> at compile time (CS0220), which is why the example uses a variable.'
    },
    {
      t: 'choice',
      q: 'What does this C# code print with default settings?',
      code: 'int x = int.MaxValue;\nConsole.WriteLine(x + 1);',
      options: ['-2147483648', '2147483648', 'An OverflowException', '0'],
      answer: 0,
      explain: 'Without checked, C# doesn\'t check for overflow: the top bit flips and you get the smallest int.',
      wrong: { 1: 'That number doesn\'t fit in an int. The maximum is 2,147,483,647.', 2: 'That\'s what Visual Basic would do. C# doesn\'t check by default.' }
    },
    {
      t: 'learn',
      title: 'The CLS: a shared vocabulary for languages',
      body: '<p>Languages have different features. C# has unsigned numbers like <code>uint</code>, but some .NET languages don\'t.</p><p>So that any language can use a library, there is the <b>CLS</b>, the Common Language Specification: rules for what you may expose publicly. The <code>[CLSCompliant(true)]</code> attribute asks the compiler to check those rules.</p>'
    },
    {
      t: 'tapline',
      q: 'The assembly is marked [assembly: CLSCompliant(true)]. Which line gets a compiler warning?',
      code: 'public class Counter\n{\n    private uint _hidden;\n    public int Total { get; set; }\n    public uint Count { get; set; }\n    public string Name { get; set; }\n}',
      answer: 4,
      explain: 'uint is not part of the CLS, and Count is a public property. The private field _hidden is fine: the CLS only covers what is visible outside the assembly.'
    },
    {
      t: 'choice',
      q: 'A public class has methods Run() and run(). Why is that bad from the CLS point of view?',
      options: ['Visual Basic is case-insensitive and can\'t tell which one to call', 'Similar names slow the program down', 'The CLR forbids such names', 'It isn\'t bad at all'],
      answer: 0,
      explain: 'Names that differ only in case break the CLS: for case-insensitive languages they are the same name.',
      wrong: { 2: 'The CLR doesn\'t mind. This is a rule for language interop, not a runtime restriction.' }
    },
    {
      t: 'match',
      q: 'Match each language to its compiler',
      pairs: [
        ['C#', 'csc (Roslyn)'],
        ['F#', 'fsc'],
        ['Visual Basic', 'vbc'],
        ['CLR', 'Runs the output of any of them']
      ]
    }
  ]
};
