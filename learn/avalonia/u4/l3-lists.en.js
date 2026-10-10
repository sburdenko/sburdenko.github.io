/** Avalonia, unit 4, lesson 3: lists. */
export default {
  id: 'av.u4.l3',
  title: 'Lists',
  sub: 'ItemsSource, ObservableCollection and DataTemplate',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A list from a collection',
      body: '<p>A <code>ListBox</code> shows a collection from the ViewModel. A <code>DataTemplate</code> describes how a single item looks.</p>',
      code: '<ListBox ItemsSource="{Binding People}">\n  <ListBox.ItemTemplate>\n    <DataTemplate x:DataType="m:Person">\n      <StackPanel Orientation="Horizontal" Spacing="8">\n        <TextBlock Text="{Binding Name}"/>\n        <TextBlock Text="{Binding Age}"/>\n      </StackPanel>\n    </DataTemplate>\n  </ListBox.ItemTemplate>\n</ListBox>',
      lang: 'xml'
    },
    {
      t: 'choice',
      q: 'Inside a DataTemplate, where does {Binding Name} look for Name?',
      options: ['On the current list item, the Person object', 'On the window\'s ViewModel', 'On the ListBox'],
      answer: 0,
      explain: 'Each row\'s DataContext is its own item from the collection.'
    },
    {
      t: 'learn',
      title: 'Added it, but the list did not change',
      body: '<p>A plain <code>List&lt;T&gt;</code> does not announce that an item was added. <code>ObservableCollection&lt;T&gt;</code> does, through the <code>CollectionChanged</code> event, and the ListBox shows the new row right away.</p>',
      code: 'public ObservableCollection<Person> People { get; } = new();\n\n[RelayCommand]\nprivate void Add() => People.Add(new Person("Anna", 30));'
    },
    {
      t: 'choice',
      q: 'People is a List<Person>. A command adds a person, but the list on screen does not change. Why?',
      options: ['List<T> does not announce changes; you need ObservableCollection<T>', 'ListBox cannot display people', 'The window needs a restart'],
      answer: 0,
      explain: 'Same idea as PropertyChanged, but for collections.'
    },
    {
      t: 'learn',
      title: 'Thousands of rows',
      body: '<p>ListBox <b>virtualizes</b> by default: it creates controls only for visible rows and reuses them as you scroll. That is why a list of 100,000 items stays smooth.</p>',
      deep: 'Virtualization breaks if you put a ListBox inside a StackPanel: the panel gives its child infinite height, so the ListBox creates controls for every row. Give the list a bounded height, such as a star row in a Grid.'
    },
    {
      t: 'blanks',
      q: 'Show the Orders collection',
      code: '<ListBox ___="{Binding Orders}"/>',
      lang: 'xml',
      tiles: ['ItemsSource', 'Items', 'DataContext', 'Source'],
      answer: ['ItemsSource'],
      explain: 'In Avalonia 11 it is ItemsSource. Items remains for items added directly in markup.'
    },
    {
      t: 'tapline',
      q: 'Which line makes a 100,000-row list slow?',
      code: '<StackPanel>\n  <TextBlock Text="Orders"/>\n  <ListBox ItemsSource="{Binding Orders}"/>\n</StackPanel>',
      lang: 'xml',
      answer: 0,
      explain: 'StackPanel gives the list infinite height, which turns virtualization off. Use a Grid with RowDefinitions="Auto,*".'
    },
    {
      t: 'match',
      q: 'Match each term to its meaning',
      pairs: [
        ['ItemsSource', 'The collection for the list'],
        ['DataTemplate', 'How a single item looks'],
        ['ObservableCollection', 'Announces adds and removes'],
        ['Virtualization', 'Controls only for visible rows']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['A row\'s DataContext is an item from the collection', 'ObservableCollection updates the ListBox on Add and Remove', 'Changing a property inside Person also needs PropertyChanged on Person', 'List<T> updates the ListBox on its own'],
      answer: [0, 1, 2],
      explain: 'ObservableCollection tracks which items are in it, not the properties of those items.'
    }
  ]
};
