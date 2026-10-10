/** Unit 1 final of the Avalonia course. */
export default {
  id: 'av.u1.boss',
  title: 'Final: getting started',
  sub: 'Avalonia, the project and the markup',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'What sets Avalonia apart among .NET UI frameworks?',
      options: ['It is cross-platform because it does its own rendering', 'It runs only in the browser', 'It uses WinForms under the hood'],
      answer: 0,
      explain: 'Skia draws everything. The platform only provides a window.'
    },
    {
      t: 'order',
      q: 'From command to window',
      items: ['dotnet new avalonia.mvvm', 'dotnet run', 'Main → BuildAvaloniaApp', 'App creates MainWindow', 'The window is on screen'],
      explain: 'The template sets up everything you need for a first window.'
    },
    {
      t: 'tapline',
      q: 'Where is the mistake?',
      code: '<Window xmlns="https://github.com/avaloniaui">\n  <Button Content="Save"/>\n  <Button Content="Cancel"/>\n</Window>',
      lang: 'xml',
      answer: 2,
      explain: 'A Window has a single piece of content. The second button is one too many: you need a panel.'
    },
    {
      t: 'blanks',
      q: 'A name you can use from code',
      code: '<TextBox ___="SearchBox"/>',
      lang: 'xml',
      tiles: ['x:Name', 'x:Class', 'Id', 'Key'],
      answer: ['x:Name'],
      explain: 'The code-behind gets a SearchBox field.'
    },
    {
      t: 'match',
      q: 'Match each term to its role',
      pairs: [
        ['Skia', 'Draws the UI'],
        ['.axaml', 'Markup file'],
        ['UsePlatformDetect', 'Picks the platform'],
        ['DataContext', 'Where the markup gets its data']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Much of your WPF experience carries over', 'Markup is compiled at build time', 'Avalonia runs on Linux', 'Avalonia is paid'],
      answer: [0, 1, 2],
      explain: 'Avalonia itself is MIT-licensed. Only the separate XPF product is paid.'
    },
    {
      t: 'choice',
      q: 'How does an Avalonia button on a Mac differ from a MAUI button on a Mac?',
      options: ['Avalonia draws its button itself, while the MAUI button is a real macOS button', 'No difference', 'Neither works on a Mac'],
      answer: 0,
      explain: 'Custom rendering versus native controls.'
    },
    {
      t: 'choice',
      q: 'What will the window show?',
      code: '<Window Title="Demo">\n  <TextBlock Text="Hello!"/>\n</Window>',
      options: ['The text "Hello!", with "Demo" in the window title', 'A "Hello!" button', 'An empty window'],
      answer: 0,
      explain: 'Title is the window title. TextBlock is the text inside.'
    }
  ]
};
