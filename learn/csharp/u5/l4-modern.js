/** C# глубже, раздел 5, урок 4: C# 12–14. */
export default {
  id: 'cs.u5.l4',
  title: 'C# 12, 13 и 14',
  sub: 'Что появилось в последних версиях',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'C# 12: primary constructors',
      body: '<p>Параметры конструктора — прямо в заголовке класса. Важно: это <b>не свойства</b>, а параметры, доступные во всём теле класса.</p>',
      code: 'public class OrderService(IOrderRepo repo, ILogger<OrderService> log)\n{\n    public void Place(Order o)\n    {\n        repo.Save(o);\n        log.LogInformation("заказ {Id}", o.Id);\n    }\n}'
    },
    {
      t: 'choice',
      q: 'У class Service(IRepo repo) можно ли снаружи написать service.repo?',
      options: ['Нет: repo — параметр, а не публичное свойство', 'Да', 'Только для чтения'],
      answer: 0,
      explain: 'У record позиционные параметры становятся свойствами, а у обычного класса — нет.'
    },
    {
      t: 'learn',
      title: 'C# 12: выражения коллекций',
      body: '<p>Квадратные скобки создают массив, список, Span — что нужно по типу. <code>..</code> распаковывает другую коллекцию.</p>',
      code: 'int[] a = [1, 2, 3];\nList<int> b = [0, ..a, 4];     // 0, 1, 2, 3, 4\nReadOnlySpan<char> sep = [\',\', \';\'];'
    },
    {
      t: 'blanks',
      q: 'Список из нуля, элементов a и пятёрки',
      code: 'List<int> all = [0, ___a, 5];',
      tiles: ['..', '...', '*', '&'],
      answer: ['..'],
      explain: 'Spread — две точки.'
    },
    {
      t: 'learn',
      title: 'C# 13',
      body: '<p><b>params для коллекций</b>: <code>params ReadOnlySpan&lt;int&gt;</code> вместо массива — без аллокации.<br><b>Новый тип замка</b> <code>System.Threading.Lock</code> (.NET 9): <code>lock</code> на нём быстрее, чем на object.<br><b>ref struct в async-методах</b> — между await.</p>',
      code: 'private readonly Lock _gate = new();\n\nlock (_gate) { _count++; }'
    },
    {
      t: 'learn',
      title: 'C# 14 (.NET 10)',
      body: '<p><b>field</b> — скрытое поле автосвойства.<br><b>Блоки extension</b> — свойства-расширения, а не только методы.<br><b>?.=</b> — присвоить, если слева не null.<br><b>Неявные преобразования в Span</b>: массив сам превращается в Span там, где его ждут.</p>',
      code: 'public string Title { get; set => field = value.Trim(); }\n\norder?.Status = Status.Paid;'
    },
    {
      t: 'match',
      q: 'Соедини фичу и версию',
      pairs: [
        ['Primary constructors у классов', 'C# 12'],
        ['Выражения коллекций [1, 2]', 'Тоже C# 12'],
        ['System.Threading.Lock', 'C# 13'],
        ['Ключевое слово field', 'C# 14']
      ]
    },
    {
      t: 'choice',
      q: 'Что делает order?.Status = Status.Paid, если order == null?',
      options: ['Ничего — присваивание пропускается', 'NullReferenceException', 'Создаёт order'],
      answer: 0,
      explain: 'Null-условное присваивание из C# 14.'
    },
    {
      t: 'multi',
      q: 'Что появилось в C# 12–14? Отметь все.',
      options: ['Выражения коллекций', 'Ключевое слово field', 'params ReadOnlySpan<T>', 'async/await', 'LINQ'],
      answer: [0, 1, 2],
      explain: 'async — C# 5, LINQ — C# 3.'
    }
  ]
};
