/** Avalonia, unit 3, lesson 1: DataContext and bindings. */
export default {
  id: 'av.u3.l1',
  title: 'Bindings',
  sub: 'DataContext and {Binding}',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Hands off the controls',
      body: '<p>You could write <code>NameBox.Text = user.Name</code> and then copy it back. But with a dozen fields, the code turns into endless shuffling of values.</p><p>A <b>binding</b> links a control\'s property to a property of a data object. Avalonia moves the values back and forth for you.</p>'
    },
    {
      t: 'learn',
      title: 'Where the data comes from',
      body: '<p>Every element has a <b>DataContext</b>: an object with data. If it is not set, the element takes its parent\'s. Usually you set it on the window, and every element inside sees the same view model.</p>',
      code: '<TextBox Text="{Binding Name}"/>\n<TextBlock Text="{Binding Name, StringFormat=\'Hello, {0}!\'}"/>',
      lang: 'xml'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Everything is already set up. Type a name into the TextBox and watch it reach the model and come back in the greeting.',
      start: { mode: 'TwoWay', notify: true }, lock: ['mode', 'notify'],
      goal: { sync: ['type'] },
      solve: ['type']
    },
    {
      t: 'choice',
      q: 'The window has DataContext = new MainViewModel(). What is the DataContext of a TextBox inside the window if you do not set it?',
      options: ['The same MainViewModel, inherited from the parent', 'null', 'The TextBox itself'],
      answer: 0,
      explain: 'DataContext flows down the tree until someone overrides it.'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Now change the name from code and check whether the screen updated.',
      start: { mode: 'TwoWay', notify: true }, lock: ['mode', 'notify'],
      goal: { sync: ['code'] },
      solve: ['code']
    },
    {
      t: 'blanks',
      q: 'Bind the text to the Title property',
      code: '<TextBlock Text="{___ ___}"/>',
      lang: 'xml',
      tiles: ['Binding', 'Title', 'Bind', 'DataContext', 'this'],
      answer: ['Binding', 'Title'],
      explain: 'The binding path is the name of a property on the DataContext.'
    },
    {
      t: 'multi',
      q: 'What is true about bindings? Select all that apply.',
      options: ['A binding looks up the property on the DataContext', 'DataContext is inherited from the parent', 'Bindings spare you from copying values by hand', 'Bindings work only with string'],
      answer: [0, 1, 2],
      explain: 'You can bind any property: numbers, flags, collections, colors.'
    },
    {
      t: 'match',
      q: 'Match each term to its meaning',
      pairs: [
        ['DataContext', 'The data object for an element'],
        ['{Binding Name}', 'A link to the Name property'],
        ['StringFormat', 'How to display the value'],
        ['View model', 'A class holding the window\'s data']
      ]
    }
  ]
};
