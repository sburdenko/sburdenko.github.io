/** Unit 3 final of "The history of .NET". */
export default {
  id: 'hs.u3.boss',
  title: 'Final: Core and Standard',
  sub: 'Compatibility without guesswork',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tfm',
      task: 'One target that all four hosts load with no caveats.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 1 },
      solve: ['tfm:ns20']
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'All four hosts, but the .NET 10 app must get a net10.0 build and Unity must get netstandard2.1. Three targets at most.',
      goal: { hosts: ['revit24', 'revit25', 'unity', 'app10'], max: 3, prefer: { app10: 'net10', unity: 'ns21' } },
      solve: ['tfm:net10', 'tfm:ns21', 'tfm:net48']
    },
    {
      t: 'choice',
      q: 'Why does .NET Standard 2.1 work in Unity and .NET 10 but not in .NET Framework?',
      options: ['Framework stopped at 2.0: the new APIs need runtime changes, and Framework is frozen', 'Unity and .NET 10 are the same runtime', '2.1 is a paid version'],
      answer: 0,
      explain: 'Unity (Mono) and .NET 10 (CoreCLR) are different runtimes, but both implement 2.1.'
    },
    {
      t: 'multi',
      q: 'What came with .NET Core? Select all that apply.',
      options: ['Cross-platform support', 'Side-by-side versions on one machine', 'Open development on GitHub', 'AppDomain'],
      answer: [0, 1, 2],
      explain: 'AppDomain is exactly what was left behind.'
    },
    {
      t: 'blanks',
      q: 'Build a library for .NET 8 and for Framework',
      code: '<___>net8.0;netstandard2.0</TargetFrameworks>',
      lang: 'xml',
      tiles: ['TargetFrameworks', 'TargetFramework', 'Frameworks', 'Platforms'],
      answer: ['TargetFrameworks'],
      explain: 'Several targets mean TargetFrameworks, plural.'
    },
    {
      t: 'match',
      q: 'Match each year to what happened',
      pairs: [
        ['2014', 'Source code opened'],
        ['2016', '.NET Core 1.0'],
        ['2017', '.NET Standard 2.0'],
        ['2019', '.NET Standard 2.1']
      ]
    },
    {
      t: 'choice',
      q: 'Targets are net48 and netstandard2.0. Which build does Revit 2024 take?',
      options: ['net48, since it is closer to Framework', 'netstandard2.0', 'Both'],
      answer: 0,
      explain: 'NuGet picks the nearest target.'
    },
    {
      t: 'choice',
      q: 'What is .NET Standard, in one word?',
      options: ['A contract', 'A runtime', 'A compiler'],
      answer: 0,
      explain: 'It is a list of APIs. An actual runtime executes the code.'
    }
  ]
};
