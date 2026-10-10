/** Avalonia, unit 1, lesson 3: AXAML. */
export default {
  id: 'av.u1.l3',
  title: 'AXAML: the markup',
  sub: 'Tags are objects, attributes are properties',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Markup creates objects',
      body: '<p>Each tag is an object, each attribute is one of its properties, and a nested tag is its content.</p>',
      code: '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        x:Class="MyApp.Views.MainWindow"\n        Title="Hello" Width="400" Height="200">\n  <Button Content="Click me" HorizontalAlignment="Center"/>\n</Window>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'The same thing in C#',
      body: '<p>Markup is just a convenient notation. You can write the same thing in code:</p>',
      code: 'var window = new Window { Title = "Hello", Width = 400, Height = 200 };\nwindow.Content = new Button\n{\n    Content = "Click me",\n    HorizontalAlignment = HorizontalAlignment.Center\n};'
    },
    {
      t: 'choice',
      q: 'What does the tag <Button Content="Click me"/> do?',
      options: ['Creates a Button object and sets its Content property to "Click me"', 'Describes the button\'s style', 'Calls a method named Click me'],
      answer: 0,
      explain: 'Attribute = object property.'
    },
    {
      t: 'tapline',
      q: 'Which line links the markup to a C# class?',
      code: '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        x:Class="MyApp.Views.MainWindow"\n        Title="Hello">',
      lang: 'xml',
      answer: 2,
      explain: 'x:Class says: this markup is the other half of the partial class MainWindow.'
    },
    {
      t: 'learn',
      title: 'x:Name and code-behind',
      body: '<p>Give an element a name, and C# gets a field with that name. Markup is compiled at build time, so a typo in the name is a compile error, not a crash at run time.</p>',
      code: '<TextBox x:Name="NameBox"/>\n\n// MainWindow.axaml.cs\nNameBox.Text = "Anna";'
    },
    {
      t: 'blanks',
      q: 'A window with a centered button',
      code: '<Window Title="Demo">\n  <___ Content="OK" HorizontalAlignment="___"/>\n</Window>',
      lang: 'xml',
      tiles: ['Button', 'Center', 'Middle', 'Click', 'Stretch'],
      answer: ['Button', 'Center'],
      explain: 'Avalonia has no Middle. The center is called Center.'
    },
    {
      t: 'match',
      q: 'Match each markup piece to what it means',
      pairs: [
        ['Tag', 'Object'],
        ['Attribute', 'Property'],
        ['x:Class', 'Link to the C# class'],
        ['x:Name', 'A field you can use from code']
      ]
    },
    {
      t: 'multi',
      q: 'What is true about AXAML? Select all that apply.',
      options: ['It is compiled at build time', 'Any markup can be rewritten as C# code', 'Its namespace is https://github.com/avaloniaui', 'It runs as a script in the browser'],
      answer: [0, 1, 2],
      explain: 'XAML turns into ordinary code at compile time.'
    },
    {
      t: 'choice',
      q: 'A Window has a single Content property. How do you put several elements in a window?',
      options: ['Put a panel (StackPanel, Grid...) in the window, and the elements in the panel', 'Write several Content attributes', 'You can\'t'],
      answer: 0,
      explain: 'Panels lay out their children. That is the next unit.'
    }
  ]
};
