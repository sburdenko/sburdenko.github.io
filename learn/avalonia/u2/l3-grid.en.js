/** Avalonia, unit 2, lesson 3: Grid. */
export default {
  id: 'av.u2.l3',
  title: 'Grid',
  sub: 'Auto, pixels and stars',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Rows and columns',
      body: '<p>Grid splits space into rows and columns. There are three ways to set a column\'s width:</p><p><b>200</b>: exactly 200 pixels.<br><b>Auto</b>: as much as the content needs.<br><b>*</b>: a share of the remaining space. <code>2*</code> gets twice as much as <code>*</code>.</p>',
      code: '<Grid ColumnDefinitions="Auto,*,2*" RowDefinitions="Auto,*">\n  <TextBlock Grid.Row="0" Grid.Column="0" Text="Icons"/>\n  <ListBox   Grid.Row="1" Grid.Column="1"/>\n</Grid>',
      lang: 'xml'
    },
    {
      t: 'rig', rig: 'grid',
      task: 'The menu on the left is always 200 px, and the content takes everything else. Check it at both window widths.',
      labels: ['Menu', 'Content'], content: [90, 300],
      start: ['*', '*'],
      goal: { at: { 400: [200, 200], 800: [200, 600] } },
      solve: ['col:0:200']
    },
    {
      t: 'choice',
      q: 'The window is 800 px, columns are "200,*". How much does the second column get?',
      options: ['600', '400', '200'],
      answer: 0,
      explain: 'The star takes whatever is left after fixed and Auto columns: 800 − 200.'
    },
    {
      t: 'rig', rig: 'grid',
      task: 'The icon column fits its content exactly (48 px), and the list is twice as wide as the properties panel.',
      labels: ['Icons', 'List', 'Properties'], content: [48, 0, 0],
      start: ['100', '*', '*'],
      goal: { at: { 400: [48, 234.7, 117.3], 800: [48, 501.3, 250.7] } },
      solve: ['col:0:Auto', 'col:1:2*']
    },
    {
      t: 'choice',
      q: 'Columns "*,2*,*" in an 800 px window. What are the widths?',
      options: ['200, 400, 200', '266, 266, 266', '100, 600, 100'],
      answer: 0,
      explain: 'There are 4 shares in total, so one share is 200 px.'
    },
    {
      t: 'learn',
      title: 'The short syntax is an Avalonia perk',
      body: '<p>In WPF, columns take a lot of typing: one ColumnDefinition tag each. In Avalonia you can use a string: <code>ColumnDefinitions="Auto,*,2*"</code>.</p><p>You place an element in a cell with <code>Grid.Row</code> and <code>Grid.Column</code> (counting from zero), and span several with <code>Grid.ColumnSpan</code>.</p>'
    },
    {
      t: 'blanks',
      q: 'A button in the second column of the first row',
      code: '<Button Grid.___="0" Grid.___="1" Content="OK"/>',
      lang: 'xml',
      tiles: ['Row', 'Column', 'Span', 'Cell'],
      answer: ['Row', 'Column'],
      explain: 'Counting starts at zero: the second column is Column="1".'
    },
    {
      t: 'choice',
      q: 'What happens to an Auto column if its content gets wider?',
      options: ['The column grows, and the star columns get narrower', 'The content gets clipped', 'Nothing'],
      answer: 0,
      explain: 'Auto adapts to its content; stars share what is left.'
    },
    {
      t: 'match',
      q: 'Match each value to its meaning',
      pairs: [
        ['200', 'Exactly 200 px'],
        ['Auto', 'Fit to content'],
        ['*', 'One share of the rest'],
        ['2*', 'Two shares of the rest']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['ColumnDefinitions can be set with a string', 'Grid.Row counts from zero', 'Stars share the space left after fixed and Auto columns', 'Auto is always 100 px'],
      answer: [0, 1, 2],
      explain: 'Auto fits the content. It is not a fixed number.'
    }
  ]
};
