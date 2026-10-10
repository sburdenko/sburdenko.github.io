/** The history of .NET, unit 2, lesson 1: Mono. */
export default {
  id: 'hs.u2.l1',
  title: 'Mono: .NET without Microsoft',
  sub: 'How C# reached Linux long before .NET Core',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'An open standard invites new implementations',
      body: '<p>Microsoft submitted the C# and CLI specs to ECMA as a standard. That meant anyone could write their own runtime from the spec.</p><p>Miguel de Icaza and his company Ximian did exactly that: in 2004 they released <b>Mono 1.0</b>, .NET for Linux.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year Mono 1.0 came out and see where you could now run C#.',
      goal: { year: 2004 },
      solve: ['year:2004']
    },
    {
      t: 'choice',
      q: 'How could Mono be built without Microsoft\'s source code?',
      options: ['C# and the CLI are described in an open ECMA standard', 'The source code leaked', 'Mono is just a renamed Framework'],
      answer: 0,
      explain: 'It is an independent implementation of an open spec.'
    },
    {
      t: 'learn',
      title: 'Mono\'s journey',
      body: '<p>Novell bought Ximian (2003). In 2011 Novell laid off the team, and they founded <b>Xamarin</b>: C# for iOS and Android, built on Mono. In 2016 Microsoft bought Xamarin.</p><p>In 2024 Microsoft handed the Mono project over to the WineHQ community. The Mono runtime also lives on inside modern .NET, for mobile platforms and WebAssembly.</p>'
    },
    {
      t: 'order',
      q: 'Put Mono\'s journey in order',
      items: ['Ximian starts Mono', 'Novell buys Ximian', 'The team founds Xamarin', 'Microsoft buys Xamarin', 'Mono is handed to WineHQ'],
      explain: 'Mono started in 2001, Novell bought Ximian in 2003, Xamarin was founded in 2011, Microsoft bought it in 2016, and WineHQ took over in 2024.'
    },
    {
      t: 'multi',
      q: 'Where did Mono run? Select all that apply.',
      options: ['Linux', 'macOS', 'Inside Unity games', 'Windows only'],
      answer: [0, 1, 2],
      explain: 'Linux and macOS were the whole point. Unity also embedded it in its engine.'
    },
    {
      t: 'match',
      q: 'Match each name to what it is',
      pairs: [
        ['Mono', 'An open implementation of .NET'],
        ['Ximian', 'The company that started Mono'],
        ['Xamarin', 'C# for iOS and Android'],
        ['WineHQ', 'Mono\'s new home since 2024']
      ]
    },
    {
      t: 'choice',
      q: 'What does the Mono runtime do inside modern .NET today?',
      options: ['Runs .NET on mobile platforms and in WebAssembly', 'Nothing, it was removed', 'Replaces the JIT on Windows'],
      answer: 0,
      explain: 'It is small, so it fits well where CoreCLR is too heavy.'
    }
  ]
};
