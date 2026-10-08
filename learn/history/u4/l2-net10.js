/** История .NET, раздел 4, урок 2: что нового в .NET 10 и C# 14. */
export default {
  id: 'hs.u4.l2',
  title: '.NET 10 и C# 14',
  sub: 'Что действительно новое, а что давно есть',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: '.NET 10 — LTS ноября 2025',
      body: '<p>Главное в каждой версии последних лет — скорость. JIT убирает больше выделений памяти и виртуальных вызовов, библиотеки получают API на <code>Span&lt;T&gt;</code> без лишних копий.</p><p>И новый язык — C# 14.</p>'
    },
    {
      t: 'learn',
      title: 'Что не ново, хотя часто так думают',
      body: '<p><b>Nullable-ссылки</b> — C# 8 (2019). В шаблонах проектов включены по умолчанию с .NET 6.<br><b>Records</b> — C# 9 (2020).<br><b>Span&lt;T&gt;</b> — 2018 (.NET Core 2.1 и C# 7.2).</p><p>В .NET 10 они не появились, а стали удобнее и шире используются в библиотеках.</p>'
    },
    {
      t: 'match',
      q: 'Соедини возможность и версию C#, где она появилась',
      pairs: [
        ['Nullable-ссылки', 'C# 8'],
        ['Records', 'C# 9'],
        ['Primary constructors для классов', 'C# 12'],
        ['Ключевое слово field', 'C# 14']
      ]
    },
    {
      t: 'learn',
      title: 'C# 14: field',
      body: '<p>Раньше, чтобы добавить логику в сеттер, приходилось объявлять поле руками. Теперь <code>field</code> — это скрытое поле автосвойства.</p>',
      code: 'public string Name\n{\n    get;\n    set => field = value.Trim();\n}'
    },
    {
      t: 'learn',
      title: 'C# 14: члены-расширения и ?.=',
      body: '<p>Блок <code>extension</code> добавляет к чужому типу не только методы, но и свойства.</p><p>Присваивание через <code>?.</code>: если слева null — ничего не происходит.</p>',
      code: 'static class StringExt\n{\n    extension(string s)\n    {\n        public bool IsBlank => string.IsNullOrWhiteSpace(s);\n    }\n}\n\ncustomer?.Order = GetOrder();   // если customer == null, GetOrder() не вызовется'
    },
    {
      t: 'blanks',
      q: 'Свойство с обрезкой пробелов без своего поля',
      code: 'public string Name { get; set => ___ = value.Trim(); }',
      tiles: ['field', 'value', 'this', '_name'],
      answer: ['field'],
      explain: '_name сработал бы, только если объявить поле самому.'
    },
    {
      t: 'learn',
      title: 'Запуск одного файла',
      body: '<p>В .NET 10 программу из одного файла можно запустить без проекта: <code>dotnet run app.cs</code>. Пакеты подключаются директивой прямо в файле. Удобно для скриптов и экспериментов.</p>',
      code: '#:package Humanizer@2.14.1\nusing Humanizer;\n\nConsole.WriteLine(DateTime.Now.AddHours(-3).Humanize());'
    },
    {
      t: 'choice',
      q: 'Что делает customer?.Order = GetOrder(), если customer равен null?',
      options: ['Ничего: присваивания не будет, и GetOrder() не вызовется', 'Бросит NullReferenceException', 'Создаст нового customer'],
      answer: 0,
      explain: 'Правая часть вычисляется, только если слева не null.'
    },
    {
      t: 'multi',
      q: 'Что появилось именно в C# 14 / .NET 10? Отметь все.',
      options: ['Ключевое слово field', 'Блоки extension со свойствами-расширениями', 'Присваивание через ?.', 'Records', 'Nullable-ссылки'],
      answer: [0, 1, 2],
      explain: 'Records и nullable — давние возможности, C# 9 и C# 8.'
    },
    {
      t: 'choice',
      q: 'Где обычно самый ощутимый выигрыш от перехода на новый .NET без изменения кода?',
      options: ['В скорости: JIT и библиотеки становятся быстрее с каждой версией', 'В размере исходников', 'В синтаксисе'],
      answer: 0,
      explain: 'Многие команды видят прирост, просто сменив цель и пересобрав.'
    }
  ]
};
