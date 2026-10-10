/** Avalonia, раздел 3, урок 3: MVVM и CommunityToolkit.Mvvm. */
export default {
  id: 'av.u3.l3',
  title: 'MVVM без рутины',
  sub: 'CommunityToolkit.Mvvm и compiled bindings',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Model — View — ViewModel',
      body: '<p><b>View</b> — разметка, только как выглядит.<br><b>ViewModel</b> — что показать и что делать: свойства и команды, без единого контрола.<br><b>Model</b> — данные и бизнес-логика.</p><p>ViewModel легко тестировать: в ней нет окон, только C#.</p>'
    },
    {
      t: 'choice',
      q: 'Где по MVVM должна быть проверка «email указан правильно»?',
      options: ['Во ViewModel (или Model) — там, где нет контролов и легко тестировать', 'В разметке AXAML', 'В обработчике клика в code-behind'],
      answer: 0,
      explain: 'View только показывает. Логика — в C#-классах без UI.'
    },
    {
      t: 'learn',
      title: 'Генератор пишет код за тебя',
      body: '<p>Писать <code>OnPropertyChanged</code> в каждом свойстве скучно. Пакет <b>CommunityToolkit.Mvvm</b> генерирует это при сборке.</p>',
      code: 'public partial class MainViewModel : ObservableObject\n{\n    [ObservableProperty]\n    private string _name = "Мир";\n    // сгенерируется свойство Name с PropertyChanged\n}'
    },
    {
      t: 'blanks',
      q: 'Свойство с уведомлением в одну строку',
      code: '[___]\nprivate string _title = "";',
      tiles: ['ObservableProperty', 'RelayCommand', 'Binding', 'Notify'],
      answer: ['ObservableProperty'],
      explain: 'Генератор создаст свойство Title.'
    },
    {
      t: 'choice',
      q: 'Почему класс помечен partial?',
      options: ['Генератор дописывает вторую часть класса — свойства и уведомления', 'Так быстрее работает', 'Это требование Avalonia для окон'],
      answer: 0,
      explain: 'Твоя половина — поля и логика, сгенерированная — свойства.'
    },
    {
      t: 'learn',
      title: 'Compiled bindings',
      body: '<p>Обычная привязка ищет свойство через рефлексию во время работы: опечатка — и поле просто пустое. С <code>x:DataType</code> Avalonia проверяет привязки <b>при сборке</b> и генерирует быстрый код.</p><p>В шаблонах Avalonia 11 они включены по умолчанию.</p>',
      code: '<Window x:DataType="vm:MainViewModel">\n  <TextBox Text="{Binding Nmae}"/>   <!-- ошибка сборки: нет свойства Nmae -->\n</Window>',
      lang: 'xml'
    },
    {
      t: 'multi',
      q: 'Что дают compiled bindings? Отметь все.',
      options: ['Ошибки в именах свойств видны при сборке', 'Быстрее: без рефлексии', 'Работают с Native AOT и обрезкой (trimming)', 'Не нужен DataContext'],
      answer: [0, 1, 2],
      explain: 'DataContext всё равно нужен — x:DataType лишь говорит компилятору его тип.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['View', 'Как выглядит'],
        ['ViewModel', 'Что показать и что делать'],
        ['[ObservableProperty]', 'Свойство с уведомлением'],
        ['x:DataType', 'Проверка привязок при сборке']
      ]
    },
    {
      t: 'choice',
      q: 'Шаблон Avalonia предлагает CommunityToolkit.Mvvm или ReactiveUI. В чём разница?',
      options: ['Toolkit — генераторы и простые атрибуты; ReactiveUI — реактивный подход на потоках событий (Rx)', 'Это одно и то же', 'ReactiveUI работает только в WPF'],
      answer: 0,
      explain: 'Для старта проще Toolkit; ReactiveUI сильна в сложной реактивной логике.'
    }
  ]
};
