/** The history of .NET, unit 2, lesson 3: Xamarin and MAUI. */
export default {
  id: 'hs.u2.l3',
  title: 'Xamarin and MAUI',
  sub: 'C# on phones',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Xamarin: C# for iOS and Android',
      body: '<p>Xamarin (2011) let you write mobile apps in C# and share code between iOS and Android. At first it cost money, and quite a lot of it.</p><p>In 2016 Microsoft bought Xamarin and made it free.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year Microsoft bought Xamarin. What else big happened that year?',
      goal: { year: 2016 },
      solve: ['year:2016']
    },
    {
      t: 'learn',
      title: 'Xamarin.Forms → .NET MAUI',
      body: '<p><b>Xamarin.Forms</b> gave you one XAML UI for every platform. In 2022 it was replaced by <b>.NET MAUI</b>: the same approach, but on modern .NET, plus Windows and macOS.</p><p>Xamarin support ended in May 2024.</p>'
    },
    {
      t: 'learn',
      title: 'Native controls vs drawing it yourself',
      body: '<p>MAUI turns your button into a real iOS or Android button: <b>native controls</b>. It looks and feels native, but differs slightly on each platform.</p><p><b>Avalonia</b> draws everything itself, like a game: pixel-identical everywhere. More on that in the Avalonia course.</p>'
    },
    {
      t: 'choice',
      q: 'How does MAUI\'s approach differ from Avalonia\'s?',
      options: ['MAUI uses the platform\'s native controls, Avalonia draws the UI itself', 'It does not differ', 'Avalonia runs only on Windows'],
      answer: 0,
      explain: 'Hence the trade-off: MAUI looks native, Avalonia looks the same everywhere.'
    },
    {
      t: 'order',
      q: 'Put these in chronological order',
      items: ['Xamarin is founded', 'Microsoft buys Xamarin', '.NET MAUI ships', 'Xamarin support ends'],
      explain: '2011, 2016, 2022, 2024.'
    },
    {
      t: 'match',
      q: 'Match each technology to what it is',
      pairs: [
        ['Xamarin', 'C# on iOS and Android, built on Mono'],
        ['Xamarin.Forms', 'Shared XAML UI'],
        ['.NET MAUI', 'Successor to Xamarin.Forms'],
        ['Avalonia', 'A UI that draws itself']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Xamarin is no longer supported', 'MAUI runs on modern .NET', 'MAUI supports Windows and macOS', 'MAUI is the new version of WPF'],
      answer: [0, 1, 2],
      explain: 'WPF is a separate, Windows-only technology.'
    }
  ]
};
