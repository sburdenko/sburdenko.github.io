/** Avalonia, unit 4, lesson 2: themes and resources. */
export default {
  id: 'av.u4.l2',
  title: 'Themes and resources',
  sub: 'Fluent, light and dark, StaticResource and DynamicResource',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A theme is a set of styles for every control',
      body: '<p><code>App.axaml</code> includes a theme, such as <b>FluentTheme</b>. It defines how every standard control looks.</p><p>A theme comes in variants: light and dark.</p>',
      code: '<Application RequestedThemeVariant="Default">\n  <Application.Styles>\n    <FluentTheme/>\n  </Application.Styles>\n</Application>',
      lang: 'xml'
    },
    {
      t: 'choice',
      q: 'RequestedThemeVariant="Default". Which theme will you get?',
      options: ['Whatever the system uses: light or dark', 'Always light', 'Always dark'],
      answer: 0,
      explain: 'Light or Dark must be set explicitly.'
    },
    {
      t: 'learn',
      title: 'Resources: define a color once',
      body: '<p>Colors, brushes and sizes go into resources under a key, and you use them by key. Change it in one place, and it changes everywhere.</p>',
      code: '<Application.Resources>\n  <SolidColorBrush x:Key="Accent" Color="#4f7cff"/>\n</Application.Resources>\n\n<Button Background="{DynamicResource Accent}"/>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Static or Dynamic',
      body: '<p><b>StaticResource</b> looks up the resource once, at load time.<br><b>DynamicResource</b> keeps watching it: if the resource changes (say, the theme switches), the element updates.</p><p>For theme-dependent colors, use DynamicResource.</p>'
    },
    {
      t: 'choice',
      q: 'The user switched to the dark theme, but one button stayed light. What is the likely cause?',
      options: ['Its color comes from StaticResource, which does not track changes', 'The button is broken', 'The dark theme does not support buttons'],
      answer: 0,
      explain: 'DynamicResource would have updated along with the theme.'
    },
    {
      t: 'learn',
      title: 'A separate color for each theme',
      body: '<p>You can define a resource separately for the light and dark themes with <code>ThemeDictionaries</code>.</p>',
      code: '<ResourceDictionary.ThemeDictionaries>\n  <ResourceDictionary x:Key="Light">\n    <SolidColorBrush x:Key="Panel" Color="#f3f3f3"/>\n  </ResourceDictionary>\n  <ResourceDictionary x:Key="Dark">\n    <SolidColorBrush x:Key="Panel" Color="#1e1e1e"/>\n  </ResourceDictionary>\n</ResourceDictionary.ThemeDictionaries>',
      lang: 'xml'
    },
    {
      t: 'blanks',
      q: 'A background that changes along with the theme',
      code: '<Border Background="{___ Panel}"/>',
      lang: 'xml',
      tiles: ['DynamicResource', 'StaticResource', 'Binding', 'Resource'],
      answer: ['DynamicResource'],
      explain: 'StaticResource would grab the color only once.'
    },
    {
      t: 'match',
      q: 'Match each term to what it does',
      pairs: [
        ['FluentTheme', 'A ready-made control theme'],
        ['RequestedThemeVariant', 'Light, dark or follow the system'],
        ['StaticResource', 'Look up a resource once'],
        ['DynamicResource', 'Keep watching a resource']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['A theme defines the look of every standard control', 'ThemeDictionaries set different values for Light and Dark', 'DynamicResource updates when the theme changes', 'A resource can be used in only one place'],
      answer: [0, 1, 2],
      explain: 'The whole point of a resource is to use it everywhere.'
    }
  ]
};
