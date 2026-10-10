/** Unit 2 final of the Avalonia course. */
export default {
  id: 'av.u2.boss',
  title: 'Final: layout',
  sub: 'Panels and Grid',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'grid',
      task: 'An editor: a 200 px tree on the left, a 100 px panel on the right, and the preview in the middle takes the rest.',
      labels: ['Tree', 'Preview', 'Panel'], content: [0, 0, 0],
      start: ['*', '*', '*'],
      goal: { at: { 400: [200, 100, 100], 800: [200, 500, 100] } },
      solve: ['col:0:200', 'col:2:100']
    },
    {
      t: 'rig', rig: 'panels',
      task: 'Build the window to match the sample.',
      start: 'wrap',
      goal: { panel: 'dock' },
      solve: ['panel:dock']
    },
    {
      t: 'choice',
      q: 'Photo tiles should fill a row and wrap to the next one. Which panel?',
      options: ['WrapPanel', 'StackPanel', 'DockPanel'],
      answer: 0,
      explain: 'Wrapping into rows is what WrapPanel does.'
    },
    {
      t: 'choice',
      q: 'Columns are "Auto,*". The first column\'s content is 120 px, the window is 500 px. What are the widths?',
      options: ['120 and 380', '250 and 250', '120 and 500'],
      answer: 0,
      explain: 'Auto takes 120, the star takes the rest.'
    },
    {
      t: 'tapline',
      q: 'Which line makes the status bar sit to the right of the menu instead of spanning the full width at the bottom?',
      code: '<DockPanel>\n  <Border DockPanel.Dock="Top"> Header </Border>\n  <Border DockPanel.Dock="Left"> Menu </Border>\n  <Border DockPanel.Dock="Bottom"> Status </Border>\n  <Border> Content </Border>\n</DockPanel>',
      lang: 'xml',
      answer: 2,
      explain: 'The menu is docked before the status bar, so it took the left strip all the way down. Move the status bar above the menu.'
    },
    {
      t: 'blanks',
      q: 'Three columns: fit to content, the rest, exactly 150',
      code: '<Grid ColumnDefinitions="___,___,___">',
      lang: 'xml',
      tiles: ['Auto', '*', '150', '2*', 'Fill'],
      answer: ['Auto', '*', '150'],
      explain: 'Columns go from left to right.'
    },
    {
      t: 'match',
      q: 'Match each task to its solution',
      pairs: [
        ['Space between buttons', 'Margin'],
        ['Space between text and border', 'Padding'],
        ['Fixed-width sidebar', 'A 200 column'],
        ['Header, menu, content', 'DockPanel']
      ]
    },
    {
      t: 'choice',
      q: 'Who decides how big a button will be?',
      options: ['The button says how much it needs, and the parent panel hands out the final rectangle', 'Only the button itself', 'Only the window'],
      answer: 0,
      explain: 'Measure is a request. Arrange is the parent\'s decision.'
    }
  ]
};
