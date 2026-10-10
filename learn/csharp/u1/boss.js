/** Финал раздела 1 курса «C# глубже». */
export default {
  id: 'cs.u1.boss',
  title: 'Финал: дженерики',
  sub: 'Ограничения, JIT и вариантность',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'generics',
      task: 'Метод создаёт T и сравнивает. Должен работать с int, а string ему нельзя давать.',
      sig: 'T MaxOrNew<T>(T a, T b)', ops: ['newT', 'cmp'],
      goal: { allow: ['int'], deny: ['string'] },
      solve: ['c:struct', 'c:cmp']
    },
    {
      t: 'choice',
      q: 'where T : struct, new() — что скажет компилятор?',
      options: ['Ошибка: у struct конструктор без параметров есть всегда, new() с ним не пишут', 'Всё хорошо', 'Предупреждение'],
      answer: 0,
      explain: 'new T() с struct и так разрешён.'
    },
    {
      t: 'choice',
      q: 'IEnumerable<Cat> передают туда, где ждут IEnumerable<Animal>. Получится?',
      options: ['Да: IEnumerable ковариантен (out T)', 'Нет: дженерики инвариантны', 'Только через Cast<Animal>()'],
      answer: 0,
      explain: 'Ковариантность работает для ссылочных типов в интерфейсах и делегатах.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['List<int> хранит int без упаковки', 'Для ссылочных T JIT делает общий код', 'object[] arr = new string[1]; arr[0] = 1; упадёт при запуске', 'where T : unmanaged разрешает string'],
      answer: [0, 1, 2],
      explain: 'string ссылочный и не unmanaged.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и ограничение',
      pairs: [
        ['Сортировка', 'IComparable<T>'],
        ['Фабрика', 'new()'],
        ['Буфер на стеке', 'unmanaged'],
        ['Сумма чисел', 'INumber<T>']
      ]
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется?',
      code: 'void Reset<T>(ref T value)\n{\n    value = default;\n    value = null;\n}',
      answer: 3,
      explain: 'Для неограниченного T null нельзя — T может быть int. default подходит всегда.'
    },
    {
      t: 'blanks',
      q: 'Ограничение для T x = null',
      code: 'class Box<T> where T : ___',
      tiles: ['class', 'struct', 'new()', 'notnull'],
      answer: ['class'],
      explain: 'null бывает только у ссылочных типов (и Nullable<T>).'
    },
    {
      t: 'choice',
      q: 'Зачем в C# 11 появились static abstract члены интерфейсов?',
      options: ['Чтобы дженерик мог требовать операторы и статические свойства — например, + и Zero у чисел', 'Чтобы интерфейсы хранили поля', 'Для async'],
      answer: 0,
      explain: 'На этом построен INumber<T> и вся обобщённая математика.'
    }
  ]
};
