/** Avalonia, раздел 4, урок 4: UI-поток и Dispatcher. */
export default {
  id: 'av.u4.l4',
  title: 'UI-поток',
  sub: 'Dispatcher.UIThread и async в командах',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Один поток для интерфейса',
      body: '<p>Как в WPF и Unity, контролы Avalonia можно трогать только из <b>UI-потока</b>. Из другого потока получишь исключение <code>InvalidOperationException: Call from invalid thread</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Фоновый поток пишет в TextBlock.Text. Что будет?',
      options: ['InvalidOperationException: Call from invalid thread', 'Текст обновится', 'Текст обновится с задержкой'],
      answer: 0,
      explain: 'Контролы проверяют, из какого потока к ним обращаются.'
    },
    {
      t: 'learn',
      title: 'Попросить UI-поток',
      body: '<p><code>Dispatcher.UIThread</code> — очередь UI-потока.</p>',
      code: '// поставить в очередь и не ждать\nDispatcher.UIThread.Post(() => Status = "Готово");\n\n// поставить и дождаться\nawait Dispatcher.UIThread.InvokeAsync(() => Status = "Готово");\n\n// мы уже в UI-потоке?\nif (Dispatcher.UIThread.CheckAccess()) { … }'
    },
    {
      t: 'learn',
      title: 'Чаще всего Dispatcher не нужен',
      body: '<p>В async-команде await сам возвращает тебя в UI-поток: Avalonia ставит свой SynchronizationContext. Тяжёлый расчёт отдай в <code>Task.Run</code>, результат присвой после await.</p>',
      code: '[RelayCommand]\nprivate async Task BuildAsync()\n{\n    var mesh = await Task.Run(() => Heavy(points));  // в пуле\n    Mesh = mesh;                                       // снова UI-поток\n}'
    },
    {
      t: 'choice',
      q: 'Команда считает 3 секунды прямо в UI-потоке, и окно замирает. Как исправить?',
      options: ['Отдать расчёт в Task.Run и дождаться через await', 'Добавить Dispatcher.UIThread.Post вокруг расчёта', 'Сделать метод async void'],
      answer: 0,
      explain: 'Post тоже выполнит расчёт в UI-потоке — окно всё равно замрёт.'
    },
    {
      t: 'blanks',
      q: 'Из фонового потока обнови статус',
      code: 'Dispatcher.___.___(() => Status = "Готово");',
      tiles: ['UIThread', 'Post', 'Current', 'Run', 'Invoke'],
      answer: ['UIThread', 'Post'],
      explain: 'Post ставит действие в очередь UI-потока.'
    },
    {
      t: 'tapline',
      q: 'Какая строка упадёт?',
      code: 'timer.Elapsed += (_, _) =>\n{\n    var now = DateTime.Now;\n    ClockText.Text = now.ToString("T");\n};',
      answer: 3,
      explain: 'System.Timers.Timer вызывает обработчик в пуле потоков. Нужен Dispatcher.UIThread.Post или DispatcherTimer.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Dispatcher.UIThread.Post', 'В очередь UI, не ждать'],
        ['InvokeAsync', 'В очередь UI и дождаться'],
        ['CheckAccess', 'Мы уже в UI-потоке?'],
        ['DispatcherTimer', 'Таймер, который тикает в UI-потоке']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['После await в команде код продолжается в UI-потоке', 'Task.Run уводит тяжёлую работу с UI-потока', '.Result в UI-потоке может повесить приложение', 'Контролы можно трогать из любого потока'],
      answer: [0, 1, 2],
      explain: 'Подробно про deadlock с .Result — в курсе «Async/await до дна».'
    }
  ]
};
