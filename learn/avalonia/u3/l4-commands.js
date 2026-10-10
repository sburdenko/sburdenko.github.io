/** Avalonia, раздел 3, урок 4: команды. */
export default {
  id: 'av.u3.l4',
  title: 'Команды',
  sub: 'ICommand, RelayCommand и CanExecute',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Кнопка вызывает метод модели',
      body: '<p>В MVVM кнопка не вызывает обработчик в code-behind. Её свойство <code>Command</code> привязано к команде во ViewModel.</p>',
      code: '[RelayCommand]\nprivate void Save() => _repo.Save(Name);\n// сгенерируется свойство SaveCommand',
    },
    {
      t: 'learn',
      title: 'В разметке',
      body: '<p>Сгенерированная команда называется по методу плюс «Command».</p>',
      code: '<Button Content="Сохранить" Command="{Binding SaveCommand}"/>',
      lang: 'xml'
    },
    {
      t: 'blanks',
      q: 'Привяжи кнопку к методу Delete()',
      code: '<Button Command="{Binding ___}"/>',
      lang: 'xml',
      tiles: ['DeleteCommand', 'Delete', 'OnDelete', 'Delete()'],
      answer: ['DeleteCommand'],
      explain: '[RelayCommand] над Delete() создаёт DeleteCommand.'
    },
    {
      t: 'learn',
      title: 'Когда кнопка недоступна',
      body: '<p>Команда умеет говорить «сейчас меня нельзя выполнить» — <code>CanExecute</code>. Кнопка сама станет серой.</p>',
      code: '[RelayCommand(CanExecute = nameof(CanSave))]\nprivate void Save() { … }\n\nprivate bool CanSave() => !string.IsNullOrWhiteSpace(Name);\n\n[ObservableProperty]\n[NotifyCanExecuteChangedFor(nameof(SaveCommand))]\nprivate string _name = "";'
    },
    {
      t: 'choice',
      q: 'Зачем [NotifyCanExecuteChangedFor(nameof(SaveCommand))] на свойстве Name?',
      options: ['Когда Name меняется, кнопка заново спрашивает CanSave и включается или выключается', 'Чтобы Name сохранялся', 'Без этого не скомпилируется'],
      answer: 0,
      explain: 'Иначе кнопка не узнает, что условие изменилось.'
    },
    {
      t: 'learn',
      title: 'Асинхронные команды',
      body: '<p>Если метод <code>async Task</code>, генератор создаст <code>AsyncRelayCommand</code>. Пока он выполняется, у команды <code>IsRunning = true</code>, и повторно нажать нельзя.</p>',
      code: '[RelayCommand]\nprivate async Task LoadAsync()\n{\n    Items = await _api.GetItemsAsync();   // UI не замирает\n}'
    },
    {
      t: 'choice',
      q: 'Как назовётся команда для метода LoadAsync()?',
      options: ['LoadCommand — суффикс Async отбрасывается', 'LoadAsyncCommand', 'LoadAsync'],
      answer: 0,
      explain: 'Генератор убирает Async из имени.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Кнопка с командой сама выключается, когда CanExecute = false', 'async Task-метод даёт AsyncRelayCommand', 'Команды живут во ViewModel', 'Команды нужно вызывать из code-behind'],
      answer: [0, 1, 2],
      explain: 'Code-behind в MVVM почти пустой.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['ICommand', 'Интерфейс команды'],
        ['[RelayCommand]', 'Сгенерировать команду из метода'],
        ['CanExecute', 'Можно ли выполнить сейчас'],
        ['IsRunning', 'Асинхронная команда ещё работает']
      ]
    }
  ]
};
