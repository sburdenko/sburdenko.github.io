/** Final of "The history of .NET". */
export default {
  id: 'hs.u4.boss',
  title: 'Course final',
  sub: 'From 2002 to 2026',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Walk through the turning-point years: 2002, 2004, 2014, 2016, 2020 and 2025.',
      goal: { visit: [2002, 2004, 2014, 2016, 2020, 2025] },
      solve: ['year:2002', 'year:2004', 'year:2014', 'year:2016', 'year:2020', 'year:2025']
    },
    {
      t: 'order',
      q: 'Put these in chronological order',
      items: ['.NET Framework 1.0', 'Mono 1.0', 'Source code opened', '.NET Core 1.0', '.NET 5', '.NET 10'],
      explain: '2002, 2004, 2014, 2016, 2020, 2025.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'One shared library build for Revit 2024, Revit 2025, Unity and .NET 10.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 1 },
      solve: ['tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Why .NET Standard 2.1 rather than 2.0 for code shared by Unity and .NET 10?',
      options: ['2.1 has Span<T>, IAsyncEnumerable and default interface methods, and you do not need Framework here', '2.1 works everywhere', '2.0 is outdated and will not load'],
      answer: 0,
      explain: 'If you also need Framework, it is 2.0 or a separate net48 build.'
    },
    {
      t: 'multi',
      q: 'What is true in October 2026? Select all that apply.',
      options: ['.NET 10 is the current LTS', '.NET 8 support ends in November', 'Revit 2025 runs on .NET 8', '.NET Framework got C# 14 and .NET Standard 2.1'],
      answer: [0, 1, 2],
      explain: 'Framework is frozen: .NET Standard 2.0 at most.'
    },
    {
      t: 'match',
      q: 'Match each platform to its status',
      pairs: [
        ['Framework 4.8', 'Windows only, fixes only'],
        ['.NET Standard', 'An API contract'],
        ['.NET 10', 'The current LTS'],
        ['Mono', 'Runtime of old Unity and Xamarin']
      ]
    },
    {
      t: 'choice',
      q: 'C# 14 introduced...',
      options: ['field, extension members and ?.=', 'records and nullable', 'async and await'],
      answer: 0,
      explain: 'Records came in C# 9, nullable in C# 8, async in C# 5.'
    },
    {
      t: 'blanks',
      q: 'A plugin for Revit 2024 and Revit 2025',
      code: '<TargetFrameworks>___;___</TargetFrameworks>',
      lang: 'xml',
      tiles: ['net48', 'net8.0-windows', 'netstandard2.1', 'net10.0'],
      answer: ['net48', 'net8.0-windows'],
      explain: '-windows because the plugin needs WPF.'
    },
    {
      t: 'choice',
      q: 'What is the takeaway from the whole story?',
      options: ['Code lives in the host\'s runtime: first find out where it will run, then pick the target', 'Always use the newest version', 'Always use .NET Standard'],
      answer: 0,
      explain: 'Revit, Unity and the server dictate the runtime. The TFM just answers them.'
    }
  ]
};
