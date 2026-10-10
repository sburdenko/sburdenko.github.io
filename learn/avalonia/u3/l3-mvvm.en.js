/** Avalonia, unit 3, lesson 3: MVVM and CommunityToolkit.Mvvm. */
export default {
  id: 'av.u3.l3',
  title: 'MVVM without the boilerplate',
  sub: 'CommunityToolkit.Mvvm and compiled bindings',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Model, View, ViewModel',
      body: '<p><b>View</b>: the markup, only how things look.<br><b>ViewModel</b>: what to show and what to do. Properties and commands, not a single control.<br><b>Model</b>: data and business logic.</p><p>A ViewModel is easy to test: no windows, just C#.</p>'
    },
    {
      t: 'choice',
      q: 'In MVVM, where should the "email is valid" check live?',
      options: ['In the ViewModel (or Model), where there are no controls and testing is easy', 'In the AXAML markup', 'In a click handler in code-behind'],
      answer: 0,
      explain: 'The View only displays. Logic lives in C# classes with no UI.'
    },
    {
      t: 'learn',
      title: 'A generator writes the code for you',
      body: '<p>Writing <code>OnPropertyChanged</code> in every property gets old fast. The <b>CommunityToolkit.Mvvm</b> package generates it at build time.</p>',
      code: 'public partial class MainViewModel : ObservableObject\n{\n    [ObservableProperty]\n    private string _name = "World";\n    // generates a Name property with PropertyChanged\n}'
    },
    {
      t: 'blanks',
      q: 'A notifying property in one line',
      code: '[___]\nprivate string _title = "";',
      tiles: ['ObservableProperty', 'RelayCommand', 'Binding', 'Notify'],
      answer: ['ObservableProperty'],
      explain: 'The generator creates a Title property.'
    },
    {
      t: 'choice',
      q: 'Why is the class marked partial?',
      options: ['The generator writes the second half of the class: the properties and notifications', 'It runs faster', 'Avalonia requires it for windows'],
      answer: 0,
      explain: 'Your half has the fields and logic. The generated half has the properties.'
    },
    {
      t: 'learn',
      title: 'Compiled bindings',
      body: '<p>A regular binding finds the property through reflection at run time: one typo, and the field is just empty. With <code>x:DataType</code>, Avalonia checks bindings <b>at build time</b> and generates fast code.</p><p>Avalonia 11 templates turn them on by default.</p>',
      code: '<Window x:DataType="vm:MainViewModel">\n  <TextBox Text="{Binding Nmae}"/>   <!-- build error: no property Nmae -->\n</Window>',
      lang: 'xml'
    },
    {
      t: 'multi',
      q: 'What do compiled bindings give you? Select all that apply.',
      options: ['Mistakes in property names show up at build time', 'Faster: no reflection', 'They work with Native AOT and trimming', 'No DataContext needed'],
      answer: [0, 1, 2],
      explain: 'You still need a DataContext. x:DataType just tells the compiler its type.'
    },
    {
      t: 'match',
      q: 'Match each term to its role',
      pairs: [
        ['View', 'How it looks'],
        ['ViewModel', 'What to show and what to do'],
        ['[ObservableProperty]', 'A notifying property'],
        ['x:DataType', 'Binding checks at build time']
      ]
    },
    {
      t: 'choice',
      q: 'The Avalonia template offers CommunityToolkit.Mvvm or ReactiveUI. What is the difference?',
      options: ['The Toolkit is source generators and simple attributes; ReactiveUI is a reactive approach built on event streams (Rx)', 'They are the same thing', 'ReactiveUI works only in WPF'],
      answer: 0,
      explain: 'The Toolkit is easier to start with. ReactiveUI shines in complex reactive logic.'
    }
  ]
};
