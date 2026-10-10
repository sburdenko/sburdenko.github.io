/** Финал курса «Avalonia: основы». */
export default {
  id: 'av.u4.boss',
  title: 'Финал курса',
  sub: 'Раскладка, привязки, стили и поток',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'selectors',
      task: 'Выбери только кнопку удаления.',
      options: ['Button.primary', '.danger', '#Save', 'StackPanel > Button'],
      goal: { ids: [8] },
      solve: ['sel:.danger']
    },
    {
      t: 'rig', rig: 'grid',
      task: 'Подпись слева по содержимому (110 px), поле ввода — остальное.',
      labels: ['Подпись', 'Поле'], content: [110, 200],
      start: ['200', '200'],
      goal: { at: { 400: [110, 290], 800: [110, 690] } },
      solve: ['col:0:Auto', 'col:1:*']
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Ввод не доходит до модели, а модель молчит. Почини всё.',
      start: { mode: 'OneWay', notify: false },
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'notify', 'type', 'code']
    },
    {
      t: 'choice',
      q: 'Список заказов на экране не обновляется после Orders.Add(...). Orders — List<Order>. Что сделать?',
      options: ['Заменить на ObservableCollection<Order>', 'Вызвать Dispatcher.UIThread.Post', 'Включить TwoWay'],
      answer: 0,
      explain: 'Коллекция должна сообщать об изменениях.'
    },
    {
      t: 'choice',
      q: 'После переключения на тёмную тему одна панель осталась светлой. Что проверить?',
      options: ['StaticResource вместо DynamicResource', 'Режим привязки', 'Версию .NET'],
      answer: 0,
      explain: 'DynamicResource следит за ресурсом.'
    },
    {
      t: 'tapline',
      q: 'Что здесь нарушает MVVM?',
      code: 'public partial class MainViewModel : ObservableObject\n{\n    [ObservableProperty] private string _name = "";\n    public TextBox? NameBox { get; set; }\n}',
      answer: 3,
      explain: 'ViewModel не должна знать о контролах.'
    },
    {
      t: 'order',
      q: 'Расставь: пользователь нажал «Загрузить»',
      items: ['Кнопка вызывает LoadCommand', 'await уводит загрузку в сеть, UI свободен', 'Ответ пришёл, код продолжается в UI-потоке', 'Items = результат, PropertyChanged', 'ListBox показывает данные'],
      explain: 'Все темы курса в одной цепочке.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['DockPanel', 'Шапка, меню, контент'],
        ['ColumnDefinitions="Auto,*"', 'Подпись и поле'],
        ['[ObservableProperty]', 'Свойство с уведомлением'],
        ['Selector=".danger"', 'Стиль по классу']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда про Avalonia? Отметь все.',
      options: ['Рисует интерфейс сама и работает на многих платформах', 'Compiled bindings ловят опечатки при сборке', 'Стили выбирают элементы селекторами', 'Контролы можно трогать из любого потока'],
      answer: [0, 1, 2],
      explain: 'Только из UI-потока — или через Dispatcher.'
    }
  ]
};
