/** Unit 3 final of the Avalonia course. */
export default {
  id: 'av.u3.boss',
  title: 'Final: bindings and MVVM',
  sub: 'Data finds its own way to the screen',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'bind',
      task: 'Everything is broken: OneTime mode and a model with no notifications. Make both typing and changes from code show up everywhere.',
      start: { mode: 'OneTime', notify: false },
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'notify', 'type', 'code']
    },
    {
      t: 'choice',
      q: 'A binding points to the property Nmae (a typo). What happens with compiled bindings?',
      options: ['A build error', 'An empty field at run time', 'The app crashes'],
      answer: 0,
      explain: 'Without x:DataType you would get a silently empty field.'
    },
    {
      t: 'tapline',
      q: 'Why won\'t the screen update when code changes Count?',
      code: 'public partial class CounterViewModel : ObservableObject\n{\n    public int Count { get; set; }\n\n    [RelayCommand]\n    private void Add() => Count++;\n}',
      answer: 2,
      explain: 'A plain auto-property does not raise PropertyChanged. You need [ObservableProperty] private int _count;'
    },
    {
      t: 'blanks',
      q: 'Wire the "Add" button to the Add() method',
      code: '<Button Content="Add" ___="{Binding ___}"/>',
      lang: 'xml',
      tiles: ['Command', 'AddCommand', 'Click', 'Add'],
      answer: ['Command', 'AddCommand'],
      explain: 'Click is an event for code-behind. In MVVM you use Command.'
    },
    {
      t: 'multi',
      q: 'What belongs in a ViewModel? Select all that apply.',
      options: ['Properties to display', 'Commands', 'Input validation', 'References to TextBox and Button'],
      answer: [0, 1, 2],
      explain: 'A ViewModel knows nothing about controls.'
    },
    {
      t: 'match',
      q: 'Match each symptom to its cause',
      pairs: [
        ['Code changes a property, the screen stays put', 'No PropertyChanged'],
        ['Input never reaches the model', 'OneWay or OneTime mode'],
        ['The button never enables', 'NotifyCanExecuteChanged not called'],
        ['Field is empty with no errors', 'A typo without compiled bindings']
      ]
    },
    {
      t: 'choice',
      q: 'What is the default mode for TextBox.Text?',
      options: ['TwoWay', 'OneWay', 'OneTime'],
      answer: 0,
      explain: 'The whole point of an input field is to send data back to the model.'
    },
    {
      t: 'order',
      q: 'The path of a value as the user types',
      items: ['The user types into the TextBox', 'The TwoWay binding writes the value to Name', 'The Name setter raises PropertyChanged', 'Other bindings to Name update the screen'],
      explain: 'Without step three, there is no step four.'
    }
  ]
};
