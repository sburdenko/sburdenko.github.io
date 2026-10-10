/** Avalonia, unit 4, lesson 1: styles and selectors. */
export default {
  id: 'av.u4.l1',
  title: 'Styles and selectors',
  sub: 'Like CSS, but for controls',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'The selector picks, the setter changes',
      body: '<p>An Avalonia style looks a lot like a CSS rule: the <b>selector</b> says which elements it applies to, and the <b>setters</b> say what to change.</p>',
      code: '<Style Selector="Button.primary">\n  <Setter Property="Background" Value="#4f7cff"/>\n  <Setter Property="Foreground" Value="White"/>\n</Style>\n\n<Button Classes="primary" Content="Save"/>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Selector basics',
      body: '<p><code>Button</code>: by type.<br><code>.primary</code>: by class (<code>Classes="primary"</code>).<br><code>#Save</code>: by name (<code>x:Name="Save"</code>).<br><code>StackPanel Button</code>: a button anywhere inside a StackPanel.<br><code>StackPanel &gt; Button</code>: direct children only.</p>'
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Select every button in the window.',
      options: ['#Save', 'Button', '.primary', 'StackPanel > Button'],
      goal: { ids: [2, 3, 5, 8] },
      solve: ['sel:Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Only the buttons sitting directly in the toolbar (not inside the Border).',
      options: ['StackPanel Button', 'StackPanel > Button', '.toolbar Button', 'Button.primary'],
      goal: { ids: [2, 3] },
      solve: ['sel:StackPanel > Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'All buttons inside the toolbar, at any depth.',
      options: ['.toolbar > Button', '.toolbar Button', 'Border > Button', 'Window > Button'],
      goal: { ids: [2, 3, 5] },
      solve: ['sel:.toolbar Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Only the heading.',
      options: ['TextBlock', '#h1', 'TextBlock.h1', '.toolbar TextBlock'],
      goal: { ids: [6] },
      solve: ['sel:TextBlock.h1']
    },
    {
      t: 'learn',
      title: 'Pseudo-classes',
      body: '<p>Element states use a colon: <code>:pointerover</code> (the mouse is over the element), <code>:pressed</code>, <code>:disabled</code>, <code>:focus</code>.</p>',
      code: '<Style Selector="Button.primary:pointerover /template/ ContentPresenter">\n  <Setter Property="Background" Value="#6b93ff"/>\n</Style>',
      lang: 'xml',
      deep: 'Why /template/ ContentPresenter? The Fluent theme paints the hover background on an inner element of the button\'s template. A style on the button itself loses, so you need to target the same part of the template.'
    },
    {
      t: 'choice',
      q: 'How does "StackPanel Button" differ from "StackPanel > Button"?',
      options: ['The first matches buttons at any depth inside, the second only direct children', 'No difference', 'The second selects the StackPanel'],
      answer: 0,
      explain: 'Just like CSS: a space means descendant, > means child.'
    },
    {
      t: 'match',
      q: 'Match each selector to what it selects',
      pairs: [
        ['Button', 'All buttons'],
        ['.primary', 'Elements with the primary class'],
        ['#Save', 'The element with x:Name="Save"'],
        [':disabled', 'The disabled state']
      ]
    },
    {
      t: 'multi',
      q: 'Which selectors match <Button Classes="primary danger"/>? Select all that apply.',
      options: ['Button', '.danger', 'Button.primary.danger', 'Button.warning'],
      answer: [0, 1, 2],
      explain: 'Several classes in a row means the element must have all of them. The button has no warning class.'
    },
    {
      t: 'blanks',
      q: 'Give the button the Button.danger style',
      code: '<Button ___="danger" Content="Delete"/>',
      lang: 'xml',
      tiles: ['Classes', 'Class', 'Style', 'x:Name'],
      answer: ['Classes'],
      explain: 'The Classes property is a space-separated list of classes.'
    }
  ]
};
