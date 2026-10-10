/** Unit 1 final of "The history of .NET". */
export default {
  id: 'hs.u1.boss',
  title: 'Final: the Framework era',
  sub: '2002-2019 in one go',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Walk through the key Framework years: 2002, 2005, 2007, 2012 and 2019.',
      goal: { visit: [2002, 2005, 2007, 2012, 2019] },
      solve: ['year:2002', 'year:2005', 'year:2007', 'year:2012', 'year:2019']
    },
    {
      t: 'order',
      q: 'Put these in chronological order',
      items: ['.NET Framework 1.0', 'Generics', 'LINQ', 'async/await', 'Framework 4.8'],
      explain: '2002, 2005, 2007, 2012, 2019.'
    },
    {
      t: 'choice',
      q: 'Which 90s problem did .NET solve with versioned assemblies?',
      options: ['DLL hell', 'Slow internet', 'No IDE'],
      answer: 0,
      explain: 'An assembly knows its version, and an app asks for the one it needs.'
    },
    {
      t: 'choice',
      q: 'Why will Framework 4.8 get no new APIs?',
      options: ['It is shared by all of Windows and updated in place, so changing it is risky, and development moved to the new .NET', 'Microsoft deleted it', 'It does not support C#'],
      answer: 0,
      explain: 'Only modern .NET gets new features.'
    },
    {
      t: 'multi',
      q: 'Where is Framework 4.8 still needed today? Select all that apply.',
      options: ['Plugins for Revit 2024 and older', 'Older enterprise apps on Windows', 'A new server on Linux', 'Plugins for Revit 2025'],
      answer: [0, 1],
      explain: 'Revit 2025 is already on .NET 8, and Framework does not run on Linux.'
    },
    {
      t: 'match',
      q: 'Match each year to what it brought',
      pairs: [
        ['2002', 'Framework 1.0 and C# 1.0'],
        ['2005', 'Generics'],
        ['2007', 'LINQ'],
        ['2012', 'async/await']
      ]
    },
    {
      t: 'choice',
      q: 'A plugin runs on the runtime of...',
      options: ['the host that loaded it', 'whatever was installed last on the system', 'the newest one installed'],
      answer: 0,
      explain: 'A plugin lives in the host\'s process, so it lives in the host\'s runtime too.'
    },
    {
      t: 'blanks',
      q: 'A plugin for AutoCAD 2024',
      code: '<TargetFramework>___</TargetFramework>',
      lang: 'xml',
      tiles: ['net48', 'net8.0', 'netstandard2.1'],
      answer: ['net48'],
      explain: 'AutoCAD 2024, like Revit 2024, runs on Framework 4.8.'
    }
  ]
};
