/** Avalonia, unit 3, lesson 4: commands. */
export default {
  id: 'av.u3.l4',
  title: 'Commands',
  sub: 'ICommand, RelayCommand and CanExecute',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A button calls a model method',
      body: '<p>In MVVM, a button does not call a handler in code-behind. Its <code>Command</code> property is bound to a command in the ViewModel.</p>',
      code: '[RelayCommand]\nprivate void Save() => _repo.Save(Name);\n// generates a SaveCommand property',
    },
    {
      t: 'learn',
      title: 'In the markup',
      body: '<p>The generated command is named after the method plus "Command".</p>',
      code: '<Button Content="Save" Command="{Binding SaveCommand}"/>',
      lang: 'xml'
    },
    {
      t: 'blanks',
      q: 'Bind the button to the Delete() method',
      code: '<Button Command="{Binding ___}"/>',
      lang: 'xml',
      tiles: ['DeleteCommand', 'Delete', 'OnDelete', 'Delete()'],
      answer: ['DeleteCommand'],
      explain: '[RelayCommand] on Delete() creates DeleteCommand.'
    },
    {
      t: 'learn',
      title: 'When the button is unavailable',
      body: '<p>A command can say "I can\'t run right now" through <code>CanExecute</code>. The button grays itself out.</p>',
      code: '[RelayCommand(CanExecute = nameof(CanSave))]\nprivate void Save() { … }\n\nprivate bool CanSave() => !string.IsNullOrWhiteSpace(Name);\n\n[ObservableProperty]\n[NotifyCanExecuteChangedFor(nameof(SaveCommand))]\nprivate string _name = "";'
    },
    {
      t: 'choice',
      q: 'Why put [NotifyCanExecuteChangedFor(nameof(SaveCommand))] on the Name property?',
      options: ['When Name changes, the button asks CanSave again and enables or disables itself', 'So that Name gets saved', 'It will not compile without it'],
      answer: 0,
      explain: 'Otherwise the button never learns that the condition changed.'
    },
    {
      t: 'learn',
      title: 'Async commands',
      body: '<p>If the method is <code>async Task</code>, the generator creates an <code>AsyncRelayCommand</code>. While it runs, the command has <code>IsRunning = true</code>, and you cannot press it again.</p>',
      code: '[RelayCommand]\nprivate async Task LoadAsync()\n{\n    Items = await _api.GetItemsAsync();   // the UI does not freeze\n}'
    },
    {
      t: 'choice',
      q: 'What will the command for the LoadAsync() method be called?',
      options: ['LoadCommand: the Async suffix is dropped', 'LoadAsyncCommand', 'LoadAsync'],
      answer: 0,
      explain: 'The generator strips Async from the name.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['A button with a command disables itself when CanExecute = false', 'An async Task method gives you an AsyncRelayCommand', 'Commands live in the ViewModel', 'Commands must be called from code-behind'],
      answer: [0, 1, 2],
      explain: 'In MVVM, code-behind is nearly empty.'
    },
    {
      t: 'match',
      q: 'Match each term to its meaning',
      pairs: [
        ['ICommand', 'The command interface'],
        ['[RelayCommand]', 'Generate a command from a method'],
        ['CanExecute', 'Can it run right now'],
        ['IsRunning', 'The async command is still running']
      ]
    }
  ]
};
