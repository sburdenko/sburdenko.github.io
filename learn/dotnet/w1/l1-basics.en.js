/** Lesson 1: how a computer understands code, and why .NET translates it in two steps. */
export default {
  id: 'dotnet.w1.l1',
  title: 'How a computer understands code',
  sub: 'The CPU, the compiler and the .NET trick',
  minutes: 4,
  cards: [
    {
      t: 'learn',
      title: 'The CPU only understands machine code',
      body: '<p>The CPU is the computer\'s "brain". It can only do very simple things: add two numbers, compare them, jump to another instruction. These instructions are stored as numbers. That is <b>machine code</b>.</p><p>Writing in numbers is painful for people, so we write in programming languages such as C#:</p>',
      code: 'Console.WriteLine(40 + 2);',
      deep: 'A CPU\'s instruction set is called its ISA. x64 and ARM64 have different ones: the same operation is encoded with different bytes. That is why a native binary is always built for a specific architecture and OS.'
    },
    {
      t: 'learn',
      title: 'A compiler is a translator',
      body: '<p>A program that turns source code into instructions for the machine is called a <b>compiler</b>.</p>',
      flow: ['C# source', 'Compiler', 'Machine instructions']
    },
    {
      t: 'choice',
      q: 'What can the CPU run directly?',
      options: ['Machine code', 'C# source', 'Any programming language', 'Only what was typed in Notepad'],
      answer: 0,
      explain: 'The CPU only understands its own machine code. Everything else has to be translated first.',
      wrong: { 1: 'C# is text for people. The CPU can\'t read it, so it needs a translation.', 2: 'The CPU reads no programming language at all, only machine code.' }
    },
    {
      t: 'learn',
      title: 'The catch: CPUs differ',
      body: '<p>Most Windows laptops have an <b>x64</b> CPU. M-series MacBooks and phones use <b>ARM</b>. These are different "machine languages".</p><p>A program translated for x64 won\'t run on ARM. It\'s like a manual in Japanese handed to someone who only reads English.</p>'
    },
    {
      t: 'choice',
      q: 'A game was compiled to x64 machine code and launched on a phone with an ARM CPU. What happens?',
      options: ['It won\'t start', 'It starts, but runs slower', 'It translates itself to ARM', 'It runs as usual'],
      answer: 0,
      explain: 'x64 machine code is made of instructions an ARM CPU simply doesn\'t know.',
      wrong: { 2: 'Machine code doesn\'t translate itself. That takes special programs called emulators.' }
    },
    {
      t: 'learn',
      title: 'The .NET trick: translate in two steps',
      body: '<p>First the compiler turns C# not into machine code but into an <b>intermediate language called CIL</b>. It is the same for every CPU.</p><p>Then, on the actual computer and at startup, CIL is translated into machine code for that exact CPU.</p><p>Think of sheet music: the composer writes it once, and it can be played on any instrument.</p>',
      flow: ['C#', 'CIL, shared by all', 'x64 or ARM machine code'],
      deep: 'Java works in a similar way with JVM bytecode. The difference is that the CLR was designed from day one for many languages (C#, F#, VB.NET) with a shared type system, the CTS.'
    },
    {
      t: 'learn',
      title: 'Managed code: code with a supervisor',
      body: '<p>A program that runs inside .NET is called <b>managed</b>. It is launched and looked after by the <b>CLR</b>, the Common Language Runtime: it translates CIL into machine code, manages memory and catches errors.</p><p>Code that is compiled straight to machine code and runs on its own is called <b>native</b>.</p>'
    },
    {
      t: 'match',
      q: 'Match each term to its meaning',
      pairs: [
        ['CPU', 'Runs machine code'],
        ['Compiler', 'Translates program source'],
        ['CIL', 'Intermediate language shared by all CPUs'],
        ['CLR', 'Runtime that launches .NET programs']
      ]
    },
    {
      t: 'order',
      q: 'Put the path of a .NET program in order',
      items: ['We write C# code', 'The compiler translates it to CIL', 'At startup, CIL is translated to machine code', 'The CPU runs the machine code'],
      explain: 'These are the four steps from the Microsoft article: compiler, CIL, machine code, execution.'
    },
    {
      t: 'choice',
      q: 'Hello.dll was built on an x64 laptop and copied to an ARM Mac that has .NET installed. What happens?',
      options: ['It runs', 'It won\'t run', 'It runs only after a rebuild on the Mac'],
      answer: 0,
      explain: 'Hello.dll contains CIL, not machine code. The ARM machine code is produced right at startup.',
      wrong: { 1: 'That would be true for a native program. But the .dll holds CIL, which works on any CPU.' }
    }
  ]
};
