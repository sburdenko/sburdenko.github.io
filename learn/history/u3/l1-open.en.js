/** The history of .NET, unit 3, lesson 1: open source. */
export default {
  id: 'hs.u3.l1',
  title: '2014: Microsoft opens the code',
  sub: 'Roslyn, the .NET Foundation and MIT',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A U-turn',
      body: '<p>In the early 2000s Microsoft called open source a threat. In 2014, under new CEO Satya Nadella, it open-sourced .NET.</p><p>The reason was practical: servers increasingly ran Linux, and a Windows-only platform was losing to Java, Node.js and Go.</p>'
    },
    {
      t: 'learn',
      title: 'What was opened',
      body: '<p><b>Roslyn</b>: the C# and VB compiler, written in C# itself. Analyzers and IDE hints use its API.</p><p><b>.NET Foundation</b>: an independent foundation for open-source projects.</p><p><b>.NET Core</b>: a new cross-platform .NET under the MIT license, developed in the open on GitHub.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year Microsoft open-sourced .NET.',
      goal: { year: 2014 },
      solve: ['year:2014']
    },
    {
      t: 'choice',
      q: 'What is Roslyn?',
      options: ['The C# and VB compiler with an open API, written in C#', 'A new runtime', 'An IDE'],
      answer: 0,
      explain: 'Analyzers, refactorings and source generators all run on Roslyn.'
    },
    {
      t: 'choice',
      q: 'What does the MIT license allow?',
      options: ['You can use, change and sell the code as long as you keep the copyright notice', 'You can only read the code', 'You can use it only in non-commercial projects'],
      answer: 0,
      explain: 'It is one of the most permissive licenses around.'
    },
    {
      t: 'multi',
      q: 'Why did Microsoft open up .NET? Select all that apply.',
      options: ['Servers and clouds ran Linux at scale', 'Competitors (Java, Node.js, Go) were open and cross-platform', 'The community can send in fixes', 'It ran out of money for development'],
      answer: [0, 1, 2],
      explain: 'Today a noticeable share of changes in dotnet/runtime comes from people outside Microsoft.'
    },
    {
      t: 'match',
      q: 'Match each name to what it is',
      pairs: [
        ['Roslyn', 'Open-source compiler'],
        ['.NET Foundation', 'Foundation for open projects'],
        ['MIT', 'Permissive license'],
        ['dotnet/runtime', 'The runtime repo on GitHub']
      ]
    },
    {
      t: 'choice',
      q: 'Where can you read the source of List<T> or the garbage collector today?',
      options: ['In the open dotnet repos on GitHub', 'Nowhere, it is a secret', 'Only Microsoft partners can'],
      answer: 0,
      explain: 'You can even step through it in a debugger: Source Link fetches the sources for you.'
    }
  ]
};
