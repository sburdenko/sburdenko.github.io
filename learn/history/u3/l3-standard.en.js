/** The history of .NET, unit 3, lesson 3: .NET Standard. */
export default {
  id: 'hs.u3.l3',
  title: '.NET Standard',
  sub: 'An API contract, not a runtime. And why 2.1 matters',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A zoo of runtimes',
      body: '<p>By 2016 .NET came in several flavors: Framework, Core, Mono, Xamarin, Unity, UWP. Each had its own set of APIs.</p><p>Library authors did not know what to target. Build a separate DLL for each one?</p>'
    },
    {
      t: 'learn',
      title: 'A standard is a list, not a program',
      body: '<p><b>.NET Standard</b> is a list of APIs a platform must provide. It runs nothing by itself.</p><p>Think of a power outlet standard: it does not supply electricity, but any device with the right plug fits any outlet that follows the standard.</p><p>A library built for <code>netstandard2.0</code> works anywhere .NET Standard 2.0 is implemented.</p>'
    },
    {
      t: 'choice',
      q: 'What is .NET Standard?',
      options: ['A contract: a list of APIs a platform must implement', 'Yet another runtime', 'A lightweight version of .NET Core'],
      answer: 0,
      explain: 'You cannot run an app "on .NET Standard". You can only build a library for it.'
    },
    {
      t: 'learn',
      title: '2.0 and 2.1',
      body: '<p><b>2.0</b> (2017) is a huge set, more than 30,000 APIs. It is implemented by Framework 4.6.1+ (reliably from 4.7.2), .NET Core 2.0+, Mono and Unity.</p><p><b>2.1</b> (2019) added <code>Span&lt;T&gt;</code>, <code>IAsyncEnumerable</code> and default interface methods. It is implemented by .NET Core 3.0+ and Unity 2021.2+. <b>.NET Framework does not</b> implement it. Its ceiling is 2.0.</p>'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'A teammate built a shared library for netstandard2.1. Make it work in both Revit 2024 and Unity with a single target.',
      hosts: ['revit24', 'unity'], start: ['ns21'],
      goal: { hosts: ['revit24', 'unity'], max: 1 },
      solve: ['tfm:ns21', 'tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Why did Framework never get .NET Standard 2.1?',
      options: ['The new APIs need changes in the runtime itself, and Framework is frozen and updated in place', 'Someone forgot', 'The license did not allow it'],
      answer: 0,
      explain: 'Default interface methods, for example, need CLR support. Changing a CLR that all of Windows shares is too risky.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Shared code for Unity, Revit 2025 and a .NET 10 app. You need Span<T> and IAsyncEnumerable without extra packages. One target.',
      hosts: ['unity', 'revit25', 'app10'],
      goal: { hosts: ['unity', 'revit25', 'app10'], max: 1, prefer: { unity: 'ns21' } },
      solve: ['tfm:ns21']
    },
    {
      t: 'learn',
      title: 'The standard has stopped growing',
      body: '<p>There will be no .NET Standard after 2.1. Since .NET 5 there is just one platform, and a target like <code>net8.0</code> or <code>net10.0</code> means "everything in that version".</p><p>.NET Standard remains a bridge to Framework and Unity: 2.0 for maximum reach, 2.1 for Unity and modern .NET.</p>'
    },
    {
      t: 'match',
      q: 'Match each target to who can load it',
      pairs: [
        ['netstandard2.0', 'Framework, Unity and modern .NET'],
        ['netstandard2.1', 'Unity and modern .NET, but not Framework'],
        ['net48', 'Only .NET Framework (no caveats)'],
        ['net10.0', 'Only .NET 10 and later']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Unity and .NET 10 support .NET Standard 2.1', '.NET Framework supports .NET Standard 2.0 at most', 'You can build an app for netstandard2.1 and run it', 'There will be no new .NET Standard versions'],
      answer: [0, 1, 3],
      explain: 'Only libraries are built for .NET Standard.'
    }
  ]
};
