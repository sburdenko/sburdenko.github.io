/** C# глубже, раздел 5, урок 3: nullable-ссылки. */
export default {
  id: 'cs.u5.l3',
  title: 'Nullable-ссылки',
  sub: 'string и string? — разные обещания',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Ошибка на миллиард',
      body: '<p>NullReferenceException — самая частая ошибка в .NET. С C# 8 можно включить <b>nullable-контекст</b>: тогда <code>string</code> значит «здесь никогда не null», а <code>string?</code> — «может быть null». Компилятор следит и предупреждает.</p><p>В новых проектах это включено по умолчанию: <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'На какой строке компилятор предупредит о возможном null?',
      code: 'string? FindName(int id) => …;\n\nvar name = FindName(42);\nConsole.WriteLine(name.Length);',
      answer: 3,
      explain: 'CS8602: name может быть null. Проверь или используй name?.Length.'
    },
    {
      t: 'learn',
      title: 'Как успокоить компилятор честно',
      body: '<p>Проверить: <code>if (name is not null)</code> — дальше компилятор знает, что не null.<br>Значение по умолчанию: <code>name ?? "гость"</code>.<br>Последнее средство: <code>name!</code> — «поверь, не null». Если ошибся, получишь то самое исключение.</p>'
    },
    {
      t: 'choice',
      q: 'Что делает оператор ! в name!.Length?',
      options: ['Только глушит предупреждение; во время работы ничего не проверяет', 'Проверяет на null и бросает понятное исключение', 'Превращает null в пустую строку'],
      answer: 0,
      explain: 'Он существует только для компилятора.'
    },
    {
      t: 'learn',
      title: 'required',
      body: '<p>Свойство не может быть null, но задаётся не в конструкторе, а инициализатором? <code>required</code> (C# 11) заставит указать его при создании.</p>',
      code: 'public class Order\n{\n    public required string Customer { get; init; }\n}\n\nvar o = new Order();   // ошибка: Customer не задан'
    },
    {
      t: 'blanks',
      q: 'Имя или «гость», если null',
      code: 'var shown = name ___ "гость";',
      tiles: ['??', '?.', '!', '||'],
      answer: ['??'],
      explain: 'Оператор объединения с null.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['string?', 'Может быть null'],
        ['name!', 'Заглушить предупреждение'],
        ['name ?? x', 'x, если name null'],
        ['required', 'Обязательно задать при создании']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда про nullable-ссылки? Отметь все.',
      options: ['Это проверка компилятора, а не рантайма', 'В новых проектах включены по умолчанию', 'После if (x is not null) компилятор считает x не null', 'string? — это Nullable<string>'],
      answer: [0, 1, 2],
      explain: 'Nullable<T> — только для значимых типов. string? — просто пометка для компилятора.'
    }
  ]
};
