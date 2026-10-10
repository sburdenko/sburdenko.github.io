/** The history of .NET, unit 1, lesson 1: why Microsoft built .NET. */
export default {
  id: 'hs.u1.l1',
  title: 'Why .NET was born',
  sub: 'Windows programs before 2002 and what went wrong',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Writing Windows apps in the 90s',
      body: '<p>Serious apps were written in C++ against the raw Win32 API. Quick forms were built in Visual Basic 6. Components written in different languages talked to each other through COM.</p><p>It worked, but it hurt: manual memory management, leaks and crashes. Installing one app could break another.</p>'
    },
    {
      t: 'learn',
      title: 'DLL hell',
      body: '<p>Apps shared DLLs in a system folder. A new app would install its own version of a library over the old one, and an older app would stop starting.</p><p>People called this <b>DLL hell</b>.</p>'
    },
    {
      t: 'choice',
      q: 'What is DLL hell?',
      options: ['One app replaces a shared library with its own version and breaks other apps', 'Too many DLLs in an app folder', 'Viruses hidden in DLLs'],
      answer: 0,
      explain: '.NET fixed this with versioned, strong-named assemblies, and later by letting each app carry its own dependencies.'
    },
    {
      t: 'learn',
      title: 'Meanwhile, there was Java',
      body: '<p>Since 1995 Java had promised "write once, run anywhere". Code compiles to bytecode, a virtual machine runs it, and a garbage collector cleans up memory.</p><p>Microsoft built its own Java (J++), added Windows-only extensions and lost a lawsuit to Sun. It needed a platform of its own.</p>'
    },
    {
      t: 'learn',
      title: '2002: .NET Framework 1.0',
      body: '<p>The ideas are close to Java, but built for Windows and for many languages:</p><p><b>CLR</b>: the runtime. JIT, garbage collection, type safety.<br><b>BCL</b>: a large standard library.<br><b>C#</b>: a new language. Its lead designer is Anders Hejlsberg, who had already created Turbo Pascal and Delphi.</p>',
      deep: 'C# and the CLI (Common Language Infrastructure) were standardized at ECMA (ECMA-334 and ECMA-335) back in 2001-2002. That let others build their own implementation, and that is how Mono appeared.'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year .NET Framework 1.0 came out and see which systems it ran on.',
      goal: { year: 2002 },
      solve: ['year:2002']
    },
    {
      t: 'match',
      q: 'Match each part of .NET to its role',
      pairs: [
        ['CLR', 'Runs code: JIT, garbage collection'],
        ['BCL', 'Standard class library'],
        ['C#', 'A new language for the platform'],
        ['COM', 'The old way to connect components']
      ]
    },
    {
      t: 'multi',
      q: 'Which problems did .NET solve? Select all that apply.',
      options: ['Manual memory management and leaks', 'Version conflicts in shared DLLs', 'Different languages could not easily work together', 'Apps did not run on Linux'],
      answer: [0, 1, 2],
      explain: 'For its first 14 years, official .NET ran only on Windows. Linux came later, first through Mono.'
    },
    {
      t: 'choice',
      q: 'Who is the lead designer of C#?',
      options: ['Anders Hejlsberg', 'James Gosling', 'Bjarne Stroustrup'],
      answer: 0,
      explain: 'Gosling created Java, and Stroustrup created C++.'
    }
  ]
};
