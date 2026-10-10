/** The history of .NET, unit 4, lesson 1: .NET 5 and one .NET. */
export default {
  id: 'hs.u4.l1',
  title: 'One .NET',
  sub: '.NET 5, LTS and STS, November releases',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: '2020: just .NET',
      body: '<p>After .NET Core 3.1 came <b>.NET 5</b>. The word "Core" was dropped: this is now the main .NET. Version 4 was skipped to avoid confusion with .NET Framework 4.x.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year .NET 5 came out.',
      goal: { year: 2020 },
      solve: ['year:2020']
    },
    {
      t: 'choice',
      q: 'Why did .NET Core 3.1 jump straight to .NET 5 instead of 4?',
      options: ['To avoid confusion with .NET Framework 4.x', 'Version 4 turned out to be buggy', 'Pure coincidence'],
      answer: 0,
      explain: '".NET 4" would have sounded like yet another Framework.'
    },
    {
      t: 'learn',
      title: 'A new version every November',
      body: '<p>Even-numbered versions are <b>LTS</b> (Long Term Support), supported for 3 years. Odd-numbered ones are <b>STS</b> (Standard Term Support): 2 years since .NET 9 (18 months before that).</p><p>.NET 8 (LTS) and .NET 9 (STS) lose support on the same day: November 10, 2026. .NET 10 (LTS) is supported until November 2028.</p>'
    },
    {
      t: 'choice',
      q: 'It is October 2026, and your server runs .NET 8. What should you do?',
      options: ['Move to .NET 10 (LTS): .NET 8 support ends on November 10, 2026', 'Nothing, LTS lasts forever', 'Roll back to .NET Framework'],
      answer: 0,
      explain: 'Once support ends, security fixes stop coming.'
    },
    {
      t: 'match',
      q: 'Match each version to its support type',
      pairs: [
        ['.NET 8', 'LTS, until November 2026'],
        ['.NET 9', 'STS, also until November 2026'],
        ['.NET 10', 'LTS, until November 2028'],
        ['.NET 11', 'Expected in November 2026']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Even-numbered versions are LTS', 'New versions ship in November', 'LTS is supported for 3 years', '.NET 5 was the successor to .NET Framework'],
      answer: [0, 1, 2],
      explain: '.NET 5 continued .NET Core, not Framework.'
    },
    {
      t: 'blanks',
      q: 'Target an app at the latest LTS',
      code: '<TargetFramework>___</TargetFramework>',
      lang: 'xml',
      tiles: ['net10.0', 'net9.0', 'netcoreapp10', 'net4.10'],
      answer: ['net10.0'],
      explain: 'Since .NET 5, targets are named netN.0.'
    },
    {
      t: 'choice',
      q: 'Why is LTS a better fit for plugins and enterprise systems?',
      options: ['Longer support, so you upgrade the runtime less often', 'LTS is faster', 'STS has no C#'],
      answer: 0,
      explain: 'Autodesk and other big hosts move from one LTS to the next.'
    }
  ]
};
