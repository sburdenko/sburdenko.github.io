/** The history of .NET, unit 3, lesson 2: .NET Core. */
export default {
  id: 'hs.u3.l2',
  title: '.NET Core',
  sub: 'A rewrite to move forward',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Not a new Framework version, but a new .NET',
      body: '<p>Framework could not be changed: all of Windows shares it. So .NET Core was built as a separate platform. The team kept the best parts, rewrote a lot and dropped the rest.</p>'
    },
    {
      t: 'learn',
      title: 'What changed',
      body: '<p><b>Cross-platform</b>: Windows, Linux, macOS.<br><b>Side-by-side versions</b>: .NET 6, 8 and 10 live on one machine, and each app uses its own.<br><b>Self-contained</b>: you can ship the runtime with your app.<br><b>The dotnet command</b>: <code>dotnet new</code>, <code>dotnet build</code>, <code>dotnet run</code>.<br><b>Speed</b>: release after release, .NET Core gets noticeably faster than Framework.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Follow the path of .NET Core: 1.0 (2016), 2.0 (2017) and 3.x (2019).',
      goal: { visit: [2016, 2017, 2019] },
      solve: ['year:2016', 'year:2017', 'year:2019']
    },
    {
      t: 'learn',
      title: 'What was left behind',
      body: '<p>Some parts of Framework never made it into Core:</p><p><b>AppDomain</b> (isolation inside a process) → <code>AssemblyLoadContext</code>.<br><b>.NET Remoting</b> → gRPC and HTTP.<br><b>WCF server</b> → gRPC or the community-run CoreWCF.<br><b>ASP.NET Web Forms</b> → Razor Pages and Blazor.</p><p>WPF and WinForms came back in .NET Core 3.0, but only on Windows.</p>'
    },
    {
      t: 'choice',
      q: 'One server needs apps on both .NET 8 and .NET 10. What is the problem?',
      options: ['None: versions install side by side, and each app uses its own', 'You have to pick one', '.NET 10 will break the .NET 8 apps'],
      answer: 0,
      explain: 'That is the difference from Framework, where 4.8 replaces 4.5.'
    },
    {
      t: 'match',
      q: 'Match the old thing to its replacement',
      pairs: [
        ['AppDomain', 'AssemblyLoadContext'],
        ['.NET Remoting', 'gRPC'],
        ['Web Forms', 'Blazor'],
        ['Shared Framework', 'Side-by-side versions']
      ]
    },
    {
      t: 'multi',
      q: 'What can .NET Core do that Framework could not? Select all that apply.',
      options: ['Run on Linux and macOS', 'Install several versions side by side', 'Ship the runtime together with the app', 'Run Web Forms'],
      answer: [0, 1, 2],
      explain: 'Core has no Web Forms.'
    },
    {
      t: 'choice',
      q: 'Does WPF on .NET 8 run on Linux?',
      options: ['No, WPF and WinForms in modern .NET are Windows-only', 'Yes', 'Only in Docker'],
      answer: 0,
      explain: 'For cross-platform UI, there are Avalonia and MAUI.'
    }
  ]
};
