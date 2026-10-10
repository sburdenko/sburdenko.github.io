/** Avalonia, unit 2, lesson 1: how elements take up space. */
export default {
  id: 'av.u2.l1',
  title: 'How elements take up space',
  sub: 'Measure and Arrange, alignment, Margin and Padding',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Two passes',
      body: '<p>Before drawing, Avalonia asks every element: <b>"How much space do you need?"</b> That is Measure. Then the parent decides and says: <b>"Here is your rectangle."</b> That is Arrange.</p><p>A button needs room for its text. How much it actually gets is up to the panel it sits in.</p>'
    },
    {
      t: 'order',
      q: 'Put the layout steps in order',
      items: ['The parent asks its children how much they need (Measure)', 'The children answer with their desired size', 'The parent gives each one a rectangle (Arrange)', 'Elements draw inside their rectangles'],
      explain: 'Requests go up, space is handed down.'
    },
    {
      t: 'learn',
      title: 'Alignment',
      body: '<p>If the rectangle is bigger than the element needs, alignment decides: <code>HorizontalAlignment</code> = Left, Center, Right or <b>Stretch</b> (fill the space). Most elements default to Stretch.</p>'
    },
    {
      t: 'rig', rig: 'panels',
      task: 'Right now the children sit in a row. Make each one stretch across the full window width, one below another.',
      start: 'stack-h',
      goal: { panel: 'stack-v' },
      solve: ['panel:stack-v']
    },
    {
      t: 'learn',
      title: 'Margin and Padding',
      body: '<p><b>Margin</b> is space outside: from the element to its neighbors.<br><b>Padding</b> is space inside: from the border to the content.</p><p>Syntax: <code>"10"</code> means all sides, <code>"10,5"</code> means horizontal and vertical, <code>"10,5,10,0"</code> means left, top, right, bottom.</p>',
      code: '<Button Margin="8" Padding="16,6" Content="Save"/>',
      lang: 'xml'
    },
    {
      t: 'choice',
      q: 'The buttons are stuck together. What do you add to each one to get a gap?',
      options: ['Margin', 'Padding', 'Width'],
      answer: 0,
      explain: 'Padding would push the text inside the button apart, not the buttons themselves.'
    },
    {
      t: 'choice',
      q: 'What does Margin="10,5" mean?',
      options: ['10 left and right, 5 top and bottom', '10 top, 5 bottom', '10 left, 5 right'],
      answer: 0,
      explain: 'Two numbers mean horizontal and vertical.'
    },
    {
      t: 'blanks',
      q: 'A centered button with 12 of space around it',
      code: '<Button HorizontalAlignment="___" ___="12" Content="OK"/>',
      lang: 'xml',
      tiles: ['Center', 'Margin', 'Padding', 'Middle', 'Stretch'],
      answer: ['Center', 'Margin'],
      explain: 'Margin is outside, Padding is inside.'
    },
    {
      t: 'match',
      q: 'Match each term to its meaning',
      pairs: [
        ['Measure', 'How much space is needed'],
        ['Arrange', 'Hand out the rectangle'],
        ['Margin', 'Space outside'],
        ['Padding', 'Space inside']
      ]
    }
  ]
};
