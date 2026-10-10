/** The history of .NET, unit 4, lesson 3: where .NET is today. */
export default {
  id: 'hs.u4.l3',
  title: 'Where .NET is today',
  sub: 'Servers, desktop, games, CAD',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'The map in 2026',
      body: '<p><b>Servers and cloud</b>: ASP.NET Core, on Linux and in containers.<br><b>Desktop</b>: WPF and WinForms (Windows), Avalonia and MAUI (cross-platform).<br><b>Browser</b>: Blazor on WebAssembly.<br><b>Games</b>: Unity (Mono and IL2CPP, moving to CoreCLR), Godot 4 on .NET.<br><b>CAD and BIM</b>: plugins for Revit, AutoCAD, Navisworks.</p>'
    },
    {
      t: 'learn',
      title: 'Autodesk moved to .NET 8',
      body: '<p>Up to and including version 2024, Revit and AutoCAD ran on .NET Framework 4.8. Since 2025 they run on .NET 8.</p><p>So a plugin for both eras means two builds: net48 and net8.0-windows. Future host versions will follow new LTS releases. To learn the runtime of a specific version, check the "What\'s New" notes for its API.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year Revit and AutoCAD moved to .NET 8.',
      goal: { year: 2024 },
      solve: ['year:2024']
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'A plugin for Revit 2024 and Revit 2025: give each one its native build.',
      hosts: ['revit24', 'revit25'],
      goal: { hosts: ['revit24', 'revit25'], max: 2, prefer: { revit24: 'net48', revit25: 'net8' } },
      solve: ['tfm:net48', 'tfm:net8']
    },
    {
      t: 'choice',
      q: 'Why can\'t a Revit 2025 plugin just stay on net48?',
      options: ['Revit 2025 runs on .NET 8. A Framework build might load with caveats at best and can crash on missing APIs', 'Revit 2025 bans DLLs', 'net48 works only in Revit 2020'],
      answer: 0,
      explain: 'Autodesk explicitly requires plugins to be rebuilt for .NET 8.'
    },
    {
      t: 'match',
      q: 'Match each task to a technology',
      pairs: [
        ['Web API in a container', 'ASP.NET Core'],
        ['Cross-platform desktop', 'Avalonia'],
        ['Mobile game', 'Unity'],
        ['Revit 2025 plugin', '.NET 8']
      ]
    },
    {
      t: 'multi',
      q: 'Where does C# run today? Select all that apply.',
      options: ['On Linux servers', 'In the browser via WebAssembly', 'On iPhone and Android', 'Only on Windows'],
      answer: [0, 1, 2],
      explain: 'Exactly what was missing in 2002.'
    },
    {
      t: 'choice',
      q: 'Godot 4 runs C# scripts on...',
      options: ['modern .NET', 'Mono, like old Unity', '.NET Framework'],
      answer: 0,
      explain: 'Godot 4 moved to modern .NET, unlike Godot 3, which used Mono.'
    }
  ]
};
