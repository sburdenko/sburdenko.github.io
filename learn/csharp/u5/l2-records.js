/** C# глубже, раздел 5, урок 2: records. */
export default {
  id: 'cs.u5.l2',
  title: 'Records',
  sub: 'Равенство по значению и with',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Тип-значение в одну строку',
      body: '<p><code>record</code> (C# 9) — класс, у которого компилятор сам пишет конструктор, свойства, равенство по содержимому, <code>ToString</code> и деконструкцию.</p>',
      code: 'public record Point(int X, int Y);\n\nvar a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a == b);   // True\nConsole.WriteLine(a);        // Point { X = 1, Y = 2 }'
    },
    {
      t: 'choice',
      q: 'a и b — два разных объекта record Point(1, 2). Что вернёт a == b?',
      options: ['True: record сравнивает содержимое', 'False: это разные объекты', 'Ошибку'],
      answer: 0,
      explain: 'У обычного класса было бы False — сравнивались бы ссылки.'
    },
    {
      t: 'learn',
      title: 'with: копия с изменением',
      body: '<p>Свойства позиционного record — <code>init</code>: после создания не меняются. Нужна изменённая версия — делают копию.</p>',
      code: 'var moved = a with { X = 10 };   // Point { X = 10, Y = 2 }, a не изменился'
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется?',
      code: 'public record User(string Name, int Age);\n\nvar u = new User("Аня", 30);\nvar older = u with { Age = 31 };\nu.Age = 32;',
      answer: 4,
      explain: 'Age — init-свойство. Меняют через with.'
    },
    {
      t: 'learn',
      title: 'record struct',
      body: '<p>С C# 10 бывает <code>record struct</code> — значимый тип с теми же удобствами. Его свойства по умолчанию изменяемые; <code>readonly record struct</code> делает их init.</p>'
    },
    {
      t: 'multi',
      q: 'Что record генерирует сам? Отметь все.',
      options: ['Равенство по значению', 'ToString с содержимым', 'Деконструкцию var (x, y) = p', 'Сохранение в базу данных'],
      answer: [0, 1, 2],
      explain: 'Сохранение — дело ORM, а не языка.'
    },
    {
      t: 'choice',
      q: 'Где record особенно хорош?',
      options: ['DTO, сообщения, ключи словарей, неизменяемые значения', 'Сущности EF с изменяемым состоянием и идентичностью', 'Контролы UI'],
      answer: 0,
      explain: 'Сущность с Id обычно сравнивают по Id, а не по всем полям.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['record', 'Ссылочный тип, равенство по значению'],
        ['record struct', 'Значимый тип с теми же удобствами'],
        ['with', 'Копия с изменением'],
        ['init', 'Можно задать только при создании']
      ]
    }
  ]
};
