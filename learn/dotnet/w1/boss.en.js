/** Unit final: everything mixed together, one trap from each lesson. */
export default {
  id: 'dotnet.w1.boss',
  title: 'Final: the journey of a byte',
  sub: 'Everything mixed: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'order',
      q: 'The full path of a .NET program',
      items: ['C# code', 'Compiler', 'CIL and metadata in a .dll', 'The host starts the CLR', 'JIT on first call', 'Machine code runs'],
      explain: 'Managed execution from start to finish.'
    },
    {
      t: 'blanks',
      q: 'Build the CIL for return (a + b) * c;',
      code: 'ldarg.0\nldarg.1\n___\nldarg.2\n___\nret',
      lang: 'il',
      tiles: ['mul', 'add', 'sub', 'ldarg.0'],
      answer: ['add', 'mul'],
      explain: 'Parentheses first: a + b means add. Then push c and multiply with mul.'
    },
    {
      t: 'choice',
      q: 'Hello.dll and a Native AOT build of hello were copied to a computer without .NET. What runs?',
      options: ['Only the Native AOT build', 'Both', 'Only Hello.dll', 'Neither'],
      answer: 0,
      explain: 'Native AOT is a standalone native file. Hello.dll needs the CLR, and there isn\'t one.'
    },
    {
      t: 'tapline',
      q: 'Where is the method declared in this same assembly described?',
      code: 'AssemblyRef System.Console\nMemberRef   System.Console::WriteLine(int32)\nTypeDef     Program\nMethodDef   Add(int32, int32) : int32',
      lang: 'plain',
      answer: 3,
      explain: 'MethodDef is for your own methods. MemberRef is for references to other code\'s.'
    },
    {
      t: 'choice',
      q: 'How many times does the JIT compile a method that was never called?',
      options: ['0', '1', '2'],
      answer: 0,
      explain: 'The JIT only works on demand. A method nobody calls stays a stub.'
    },
    {
      t: 'multi',
      q: 'What\'s inside a regular .NET assembly? Select all that apply.',
      options: ['CIL', 'Metadata', 'A PE header', 'Machine code for every CPU at once', 'The C# source code'],
      answer: [0, 1, 2],
      explain: 'A regular assembly has no machine code: the JIT will produce it. No source code either.'
    },
    {
      t: 'choice',
      q: 'A public method in a C# library takes a uint. Someone wants to call it from a language without unsigned numbers. What would have warned you in advance?',
      options: ['[assembly: CLSCompliant(true)]: the compiler would issue a warning', 'The JIT on the first call', 'The garbage collector', 'Nothing, the CLR converts it on its own'],
      answer: 0,
      explain: 'The CLS is a set of rules for public APIs, and CLSCompliant turns on the check.'
    },
    {
      t: 'choice',
      q: 'What exists only in .NET Framework?',
      options: ['NGen', 'ReadyToRun', 'Native AOT', 'JIT'],
      answer: 0,
      explain: '.NET 5+ uses ReadyToRun and Native AOT instead of NGen.'
    },
    {
      t: 'choice',
      q: 'What happens?',
      code: 'object o = 42;\nstring s = (string)o;',
      options: ['InvalidCastException', 's becomes "42"', 'The code won\'t compile', 's becomes null'],
      answer: 0,
      explain: 'A cast is not a conversion. The CLR sees that o holds a number, not a string, and throws. o.ToString() would give you a string.',
      wrong: { 1: 'That takes o.ToString(). A (string) cast only checks the type.' }
    },
    {
      t: 'match',
      q: 'Who does this?',
      pairs: [
        ['Garbage collector', 'Frees memory nobody needs'],
        ['JIT', 'Translates CIL to machine code'],
        ['hostfxr', 'Picks the .NET version at startup'],
        ['C# compiler', 'Translates C# to CIL']
      ]
    },
    {
      t: 'choice',
      q: 'Why does the same Hello.dll run on both x64 and ARM64?',
      options: ['It contains CIL, and there\'s a JIT for each CPU', 'It contains machine code for both', 'ARM64 can run x64 code', 'It doesn\'t'],
      answer: 0,
      explain: 'The big idea from lesson 1: CIL is shared, machine code is produced on the spot.'
    },
    {
      t: 'choice',
      q: 'Tiered JIT is on. A method has been called 5 times. What state is it in?',
      options: ['Tier 0: it\'s nowhere near the "hot" threshold yet', 'Tier 1', 'Still a stub', 'Native AOT'],
      answer: 0,
      explain: 'Tier 0 appeared on the first call. Tier 1 comes after about 30 calls.'
    }
  ]
};
