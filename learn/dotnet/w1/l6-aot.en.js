/** Lesson 6: compiling ahead of time: NGen, ReadyToRun, Native AOT. */
export default {
  id: 'dotnet.w1.l6',
  title: 'Compiling ahead of time',
  sub: 'NGen, ReadyToRun and Native AOT',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'The JIT has a cost',
      body: '<p>On every launch the program spends time turning CIL into machine code. Usually you don\'t notice, but for large apps and cloud services that restart often, startup time matters.</p><p>The fix is to compile in advance: <b>AOT</b> (ahead-of-time).</p>'
    },
    {
      t: 'learn',
      title: 'NGen: the approach from the Microsoft article',
      body: '<p>Classic .NET Framework had <b>NGen.exe</b> for this. It differs from the JIT in three ways:</p><p>1. It compiles <b>before</b> launch, not during.<br>2. It compiles the whole assembly at once, not one method at a time.<br>3. It saves the code to disk, in the <b>Native Image Cache</b>, and different processes can share it.</p>'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['JIT', 'Compiles a method on its first call'],
        ['NGen', 'Compiles the whole assembly in advance'],
        ['Native Image Cache', 'Disk location for NGen output'],
        ['Stub', 'Hands the first call to the JIT']
      ]
    },
    {
      t: 'learn',
      title: 'And in modern .NET',
      body: '<p>NGen exists only in .NET Framework. .NET 5 and later offer two options:</p><p><b>ReadyToRun</b>: the file contains precompiled machine code plus CIL, just in case. Startup is faster, and the JIT can later reoptimize hot methods. Property: <code>&lt;PublishReadyToRun&gt;</code>.</p><p><b>Native AOT</b>: the whole program becomes a single native file. There is no JIT in it at all, and you don\'t need .NET installed. Property: <code>&lt;PublishAot&gt;</code>.</p>',
      deep: 'Native AOT requires trimming: the compiler throws away everything it can\'t reach statically. Hence the limits: no Assembly.LoadFrom or Reflection.Emit, and reflection over types never mentioned in code may fail to find them. Analyzers flag the risky spots with IL2xxx and IL3xxx warnings.'
    },
    {
      t: 'rig', rig: 'race',
      task: 'Press "Start" and see who prints 42 first.'
    },
    {
      t: 'choice',
      q: 'Why is a ReadyToRun file bigger than a regular one?',
      options: ['It holds both precompiled machine code and CIL', 'All of .NET is built into it', 'It isn\'t compressed', 'It stores the source code'],
      answer: 0,
      explain: 'The CIL is kept so the JIT can recompile code if the precompiled version doesn\'t fit or the method gets hot.',
      wrong: { 1: 'Native AOT carries the whole runtime inside. ReadyToRun still relies on the installed .NET.' }
    },
    {
      t: 'choice',
      q: 'An app loads plugins from a folder at run time (Assembly.LoadFrom) and generates code (Reflection.Emit). Will Native AOT work?',
      options: ['No: Native AOT can\'t load or create code at run time', 'Yes, with no limits', 'Yes, if you turn on ReadyToRun'],
      answer: 0,
      explain: 'Native AOT has no JIT, so there is nothing to compile new code at run time.'
    },
    {
      t: 'choice',
      q: 'You want faster startup but don\'t want to change your code. What do you turn on?',
      options: ['ReadyToRun', 'Native AOT', 'NGen', 'Disable the JIT'],
      answer: 0,
      explain: 'ReadyToRun is compatible with everything: if the precompiled code isn\'t enough, the regular JIT steps in.',
      wrong: { 1: 'Native AOT may need code changes: reflection and dynamic loading are limited.', 2: 'NGen only works in .NET Framework.' }
    },
    {
      t: 'blanks',
      q: 'Turn on Native AOT in the project file',
      code: '<PropertyGroup>\n  <___>true</___>\n</PropertyGroup>',
      lang: 'plain',
      tiles: ['PublishAot', 'PublishReadyToRun', 'PublishAot', 'Optimize'],
      answer: ['PublishAot', 'PublishAot'],
      explain: 'Set PublishAot=true, and dotnet publish builds a native file for the target platform.'
    },
    {
      t: 'match',
      q: 'Which is which',
      pairs: [
        ['JIT', 'Compiles on first call'],
        ['ReadyToRun', 'Precompiled code and CIL in one file'],
        ['Native AOT', 'No JIT, one native file'],
        ['NGen', '.NET Framework only']
      ]
    }
  ]
};
