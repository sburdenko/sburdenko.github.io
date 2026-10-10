/** Avalonia, unit 2, lesson 2: panels. */
export default {
  id: 'av.u2.l2',
  title: 'Panels',
  sub: 'StackPanel, WrapPanel, DockPanel: how each one lays out',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'The panel decides who goes where',
      body: '<p><b>StackPanel</b>: one after another, top to bottom or left to right.<br><b>WrapPanel</b>: in a row, and whatever does not fit moves to the next line, like words in text.<br><b>DockPanel</b>: docks children to the edges, and the last one fills the rest.<br><b>Grid</b>: rows and columns. That is the next lesson.</p>'
    },
    {
      t: 'rig', rig: 'panels',
      task: 'Build a classic window: header at the top, menu on the left, status at the bottom, content takes the rest.',
      start: 'stack-v',
      goal: { panel: 'dock' },
      solve: ['panel:dock']
    },
    {
      t: 'choice',
      q: 'Why does the menu in a DockPanel reach all the way down, while the status bar only sits to its right?',
      options: ['The menu is docked before the status bar: DockPanel hands out space in child order', 'The designer drew it that way', 'The status bar is shorter'],
      answer: 0,
      explain: 'Swap the children in the markup, and the status bar spans the whole bottom while the menu gets shorter.'
    },
    {
      t: 'rig', rig: 'panels',
      task: 'The window is narrow, 220 px. Make the items wrap to a new line when they do not fit.',
      start: 'stack-h',
      goal: { panel: 'wrap', w: 220 },
      solve: ['w:220', 'panel:wrap']
    },
    {
      t: 'choice',
      q: 'What does a horizontal StackPanel do when its children do not fit the width?',
      options: ['Nothing: they run off the edge of the window', 'Wraps them to a new line', 'Shrinks them'],
      answer: 0,
      explain: 'Wrapping is WrapPanel\'s job. StackPanel gives children as much as they ask for in its direction.'
    },
    {
      t: 'rig', rig: 'panels',
      task: 'A toolbar: everything in one row, left to right, at full height.',
      start: 'dock',
      goal: { panel: 'stack-h' },
      solve: ['panel:stack-h']
    },
    {
      t: 'blanks',
      q: 'Dock the menu to the left edge',
      code: '<DockPanel>\n  <Border DockPanel.Dock="___"> Menu </Border>\n  <Border> Content </Border>\n</DockPanel>',
      lang: 'xml',
      tiles: ['Left', 'Top', 'Fill', 'Start'],
      answer: ['Left'],
      explain: 'The content comes last, so it fills the rest.'
    },
    {
      t: 'match',
      q: 'Match each panel to its behavior',
      pairs: [
        ['StackPanel', 'One after another'],
        ['WrapPanel', 'Wraps to new lines'],
        ['DockPanel', 'To the edges, last one fills the rest'],
        ['Canvas', 'At exact coordinates']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Child order matters in a DockPanel', 'The last child of a DockPanel fills the rest', 'StackPanel wraps items to a new line', 'WrapPanel wraps items to a new line'],
      answer: [0, 1, 3],
      explain: 'The last child fills the rest unless LastChildFill is turned off.'
    }
  ]
};
