/** Avalonia, раздел 4, урок 3: списки. */
export default {
  id: 'av.u4.l3',
  title: 'Списки',
  sub: 'ItemsSource, ObservableCollection и DataTemplate',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Список из коллекции',
      body: '<p><code>ListBox</code> показывает коллекцию из ViewModel. Как выглядит один элемент — описывает <code>DataTemplate</code>.</p>',
      code: '<ListBox ItemsSource="{Binding People}">\n  <ListBox.ItemTemplate>\n    <DataTemplate x:DataType="m:Person">\n      <StackPanel Orientation="Horizontal" Spacing="8">\n        <TextBlock Text="{Binding Name}"/>\n        <TextBlock Text="{Binding Age}"/>\n      </StackPanel>\n    </DataTemplate>\n  </ListBox.ItemTemplate>\n</ListBox>',
      lang: 'xml'
    },
    {
      t: 'choice',
      q: 'Внутри DataTemplate привязка {Binding Name} ищет Name где?',
      options: ['В текущем элементе списка — объекте Person', 'Во ViewModel окна', 'В ListBox'],
      answer: 0,
      explain: 'DataContext каждой строки — свой элемент коллекции.'
    },
    {
      t: 'learn',
      title: 'Добавил — а в списке нет',
      body: '<p>Обычный <code>List&lt;T&gt;</code> не сообщает, что в него добавили элемент. <code>ObservableCollection&lt;T&gt;</code> сообщает — событием <code>CollectionChanged</code>, и ListBox сразу показывает новую строку.</p>',
      code: 'public ObservableCollection<Person> People { get; } = new();\n\n[RelayCommand]\nprivate void Add() => People.Add(new Person("Аня", 30));'
    },
    {
      t: 'choice',
      q: 'People — это List<Person>. Команда добавляет человека, но список на экране не меняется. Почему?',
      options: ['List<T> не сообщает об изменениях; нужна ObservableCollection<T>', 'ListBox не умеет показывать людей', 'Нужно перезапустить окно'],
      answer: 0,
      explain: 'Та же идея, что с PropertyChanged, но для коллекций.'
    },
    {
      t: 'learn',
      title: 'Тысячи строк',
      body: '<p>ListBox по умолчанию <b>виртуализирует</b>: создаёт контролы только для видимых строк и переиспользует их при прокрутке. Поэтому список на 100 000 элементов не тормозит.</p>',
      deep: 'Виртуализация ломается, если положить ListBox в StackPanel: тот даёт ребёнку бесконечную высоту, и ListBox создаёт контролы для всех строк. Дай списку ограниченную высоту — например, звёздочную строку Grid.'
    },
    {
      t: 'blanks',
      q: 'Покажи коллекцию Orders',
      code: '<ListBox ___="{Binding Orders}"/>',
      lang: 'xml',
      tiles: ['ItemsSource', 'Items', 'DataContext', 'Source'],
      answer: ['ItemsSource'],
      explain: 'В Avalonia 11 — ItemsSource; Items остался для элементов, добавленных прямо в разметке.'
    },
    {
      t: 'tapline',
      q: 'Из-за какой строки список на 100 000 строк начнёт тормозить?',
      code: '<StackPanel>\n  <TextBlock Text="Заказы"/>\n  <ListBox ItemsSource="{Binding Orders}"/>\n</StackPanel>',
      lang: 'xml',
      answer: 0,
      explain: 'StackPanel даёт списку бесконечную высоту — виртуализация отключается. Используй Grid с RowDefinitions="Auto,*".'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['ItemsSource', 'Коллекция для списка'],
        ['DataTemplate', 'Как выглядит один элемент'],
        ['ObservableCollection', 'Сообщает о добавлении и удалении'],
        ['Виртуализация', 'Контролы только для видимых строк']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['DataContext строки — элемент коллекции', 'ObservableCollection обновляет ListBox при Add и Remove', 'Изменение свойства внутри Person тоже требует PropertyChanged у Person', 'List<T> обновляет ListBox сам'],
      answer: [0, 1, 2],
      explain: 'ObservableCollection следит за составом, а не за свойствами элементов.'
    }
  ]
};
