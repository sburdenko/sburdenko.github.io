/** Final of the "Avalonia basics" course. */
export default {
  id: 'av.u4.boss',
  title: 'Course final',
  sub: 'Layout, bindings, styles and threads',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'selectors',
      task: 'Select only the delete button.',
      options: ['Button.primary', '.danger', '#Save', 'StackPanel > Button'],
      goal: { ids: [8] },
      solve: ['sel:.danger']
    },
    {
      t: 'rig', rig: 'grid',
      task: 'A label on the left sized to its content (110 px), and the input field takes the rest.',
      labels: ['Label', 'Field'], content: [110, 200],
      start: ['200', '200'],
      goal: { at: { 400: [110, 290], 800: [110, 690] } },
      solve: ['col:0:Auto', 'col:1:*']
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Input never reaches the model, and the model stays silent. Fix everything.',
      start: { mode: 'OneWay', notify: false },
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'notify', 'type', 'code']
    },
    {
      t: 'choice',
      q: 'The order list on screen does not update after Orders.Add(...). Orders is a List<Order>. What do you do?',
      options: ['Replace it with ObservableCollection<Order>', 'Call Dispatcher.UIThread.Post', 'Turn on TwoWay'],
      answer: 0,
      explain: 'The collection has to announce its changes.'
    },
    {
      t: 'choice',
      q: 'After switching to the dark theme, one panel stayed light. What do you check?',
      options: ['StaticResource instead of DynamicResource', 'The binding mode', 'The .NET version'],
      answer: 0,
      explain: 'DynamicResource keeps watching the resource.'
    },
    {
      t: 'tapline',
      q: 'What breaks MVVM here?',
      code: 'public partial class MainViewModel : ObservableObject\n{\n    [ObservableProperty] private string _name = "";\n    public TextBox? NameBox { get; set; }\n}',
      answer: 3,
      explain: 'A ViewModel should not know about controls.'
    },
    {
      t: 'order',
      q: 'Put it in order: the user clicked "Load"',
      items: ['The button invokes LoadCommand', 'await hands the download off to the network, the UI stays free', 'The response arrives, and the code continues on the UI thread', 'Items = the result, PropertyChanged fires', 'The ListBox shows the data'],
      explain: 'Every topic of the course in one chain.'
    },
    {
      t: 'match',
      q: 'Match each tool to its job',
      pairs: [
        ['DockPanel', 'Header, menu, content'],
        ['ColumnDefinitions="Auto,*"', 'A label and a field'],
        ['[ObservableProperty]', 'A notifying property'],
        ['Selector=".danger"', 'A style by class']
      ]
    },
    {
      t: 'multi',
      q: 'What is true about Avalonia? Select all that apply.',
      options: ['It draws the UI itself and runs on many platforms', 'Compiled bindings catch typos at build time', 'Styles pick elements with selectors', 'Controls can be touched from any thread'],
      answer: [0, 1, 2],
      explain: 'Only from the UI thread, or through the Dispatcher.'
    }
  ]
};
