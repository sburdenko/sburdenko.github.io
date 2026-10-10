/** Avalonia, unit 1, lesson 1: what Avalonia is. */
export default {
  id: 'av.u1.l1',
  title: 'What is Avalonia',
  sub: 'One C# and XAML UI for every system',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'C# windows, everywhere',
      body: '<p><b>Avalonia</b> is a framework for apps with windows, buttons and lists. Write it once in C# and XAML, and run it on Windows, macOS and Linux, plus iOS, Android and the browser.</p><p>It is open source under the MIT license.</p>'
    },
    {
      t: 'learn',
      title: 'It draws itself',
      body: '<p>Usually a button in an app is an operating system button. Avalonia works differently: it <b>draws every pixel itself</b> with the Skia graphics library, like a game engine.</p><p>That is why an app looks the same everywhere, and supporting a new platform comes down to "learn to open a window and draw in it".</p>'
    },
    {
      t: 'choice',
      q: 'Why does an Avalonia app look the same on Windows and macOS?',
      options: ['Avalonia draws every element itself with Skia instead of using system buttons', 'It copies the Windows style onto the Mac', 'It is a coincidence'],
      answer: 0,
      explain: 'Custom rendering is the core idea behind Avalonia.'
    },
    {
      t: 'learn',
      title: 'The neighbors',
      body: '<p><b>WPF</b>: Microsoft\'s XAML framework, Windows only. Avalonia is similar in many ways, and WPF experience carries over.<br><b>WinForms</b>: the old forms, Windows only.<br><b>.NET MAUI</b>: also cross-platform, but builds the UI from each system\'s <b>native</b> controls.</p>'
    },
    {
      t: 'match',
      q: 'Match each framework to its key trait',
      pairs: [
        ['Avalonia', 'Cross-platform, draws itself'],
        ['WPF', 'XAML, Windows only'],
        ['.NET MAUI', 'Cross-platform, native controls'],
        ['WinForms', 'Old forms, Windows only']
      ]
    },
    {
      t: 'multi',
      q: 'Where can an Avalonia app run? Select all that apply.',
      options: ['Windows', 'macOS', 'Linux', 'Browser (WebAssembly)', 'Windows 11 only'],
      answer: [0, 1, 2, 3],
      explain: 'Plus iOS, Android and embedded Linux with no windowing system.'
    },
    {
      t: 'choice',
      q: 'You know WPF. What will feel familiar in Avalonia?',
      options: ['XAML, bindings, styles, MVVM: same ideas, different details', 'Nothing', 'Only the C# language'],
      answer: 0,
      explain: 'There are differences too: a different selector-based style system and different names for some properties. We will cover them along the way.'
    },
    {
      t: 'learn',
      title: 'The price of custom rendering',
      body: '<p>The look is not fully native: a button on a Mac looks like an Avalonia button, not a macOS one. For many apps, such as editors, tools and CAD, that is actually a plus: every user gets the same interface.</p>',
      deep: 'For porting large WPF apps there is the commercial Avalonia XPF. It runs almost unchanged WPF code on macOS and Linux.'
    },
    {
      t: 'choice',
      q: 'How does MAUI differ from Avalonia?',
      options: ['MAUI turns elements into the system\'s native controls, Avalonia draws them itself', 'MAUI runs only on Windows', 'No difference'],
      answer: 0,
      explain: 'Hence the trade-off: MAUI looks native, Avalonia looks the same everywhere.'
    }
  ]
};
