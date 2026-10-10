/** The history of .NET, unit 1, lesson 3: Framework 4.8, the end of the road. */
export default {
  id: 'hs.u1.l3',
  title: 'Framework 4.8: the end of the road',
  sub: 'Why it stopped evolving and why you still need it',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Framework is part of Windows',
      body: '<p>.NET Framework is installed once per system and shared by everyone. Version 4.x <b>replaces</b> the previous 4.x in place: install 4.8, and every app built for 4.5 now runs on 4.8.</p><p>So any change in behavior risks breaking thousands of other people\'s apps. Serious changes became almost impossible.</p>'
    },
    {
      t: 'choice',
      q: 'Why is Framework so hard to evolve?',
      options: ['One shared copy for the whole system: a change can break every installed app', 'It ran out of programmers', 'Its source code was lost'],
      answer: 0,
      explain: 'Modern .NET versions install side by side, and each app picks its own.'
    },
    {
      t: 'learn',
      title: '2019: the last major version',
      body: '<p>.NET Framework 4.8 shipped in 2019, and 4.8.1 added ARM64 support in 2022. No new features are coming, only security fixes.</p><p>It is supported for as long as the Windows version it ships with. So "legacy" does not mean "dead".</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year .NET Framework 4.8 came out. What else shipped that year?',
      goal: { year: 2019 },
      solve: ['year:2019']
    },
    {
      t: 'learn',
      title: 'Why you still need it: plugins',
      body: '<p>A plugin is a DLL that a host app loads into <b>its own</b> process. That means the plugin runs on whatever runtime the host runs on.</p><p>Revit 2024 and AutoCAD 2024 run on .NET Framework 4.8, so their plugins must target Framework 4.8 too. Revit and AutoCAD 2025 moved to .NET 8.</p>'
    },
    {
      t: 'choice',
      q: 'A Revit 2024 plugin is built for net8.0. What happens?',
      options: ['Revit will not load it: Revit 2024 runs on .NET Framework 4.8', 'It loads, since .NET 8 is newer', 'Revit upgrades itself to .NET 8'],
      answer: 0,
      explain: 'The host decides the runtime. The plugin adapts to the host, not the other way around.'
    },
    {
      t: 'multi',
      q: 'What is true about .NET Framework 4.8? Select all that apply.',
      options: ['It runs only on Windows', 'It gets security fixes', 'It will get new C# versions and new APIs', 'Plugins for older Revit and AutoCAD need it'],
      answer: [0, 1, 3],
      explain: 'Officially, Framework supports C# up to 7.3. Many newer language features still compile for it, but it will never get new APIs.'
    },
    {
      t: 'blanks',
      q: 'A plugin project for Revit 2024',
      code: '<TargetFramework>___</TargetFramework>',
      lang: 'xml',
      tiles: ['net48', 'net8.0', 'net10.0', 'netcoreapp3.1'],
      answer: ['net48'],
      explain: 'net48 is how a project names .NET Framework 4.8.'
    },
    {
      t: 'match',
      q: 'Match each item to what it means',
      pairs: [
        ['Revit 2024', '.NET Framework 4.8'],
        ['Revit 2025', '.NET 8'],
        ['Framework 4.8.1', 'The last Framework release, 2022'],
        ['In-place update', '4.8 replaces 4.5 in place']
      ]
    }
  ]
};
