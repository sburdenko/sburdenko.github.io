/** C# глубже, раздел 1, урок 2: ограничения. */
export default {
  id: 'cs.u1.l2',
  title: 'Ограничения where',
  sub: 'class, struct, new(), unmanaged и интерфейсы',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Что можно потребовать от T',
      body: '<p><b>class</b> — ссылочный тип (можно null).<br><b>struct</b> — значимый тип.<br><b>unmanaged</b> — значимый тип без ссылок внутри (можно в stackalloc и указатели).<br><b>new()</b> — есть публичный конструктор без параметров.<br><b>Интерфейс</b> — у T есть его методы.</p>'
    },
    {
      t: 'rig', rig: 'generics',
      task: 'Фабрика создаёт новый объект типа T. Должна работать с List<int> и Point.',
      sig: 'T Create<T>()', ops: ['newT'],
      goal: { allow: ['list', 'point'] },
      solve: ['c:new']
    },
    {
      t: 'choice',
      q: 'Почему string не подходит под new()?',
      options: ['У string нет публичного конструктора без параметров', 'string — значимый тип', 'string запрещён в дженериках'],
      answer: 0,
      explain: 'new string() не скомпилируется — значит, и new() string не удовлетворяет.'
    },
    {
      t: 'rig', rig: 'generics',
      task: 'Кэш хранит значение T и умеет сбросить его в null. Должен работать со string и List<int>, а с int — нет.',
      sig: 'class Cache<T>', ops: ['nullT'],
      goal: { allow: ['string', 'list'], deny: ['int'] },
      solve: ['c:class']
    },
    {
      t: 'rig', rig: 'generics',
      task: 'Быстрый буфер на стеке через stackalloc. Должен работать с int и Point.',
      sig: 'void Fill<T>(T value)', ops: ['stack'],
      goal: { allow: ['int', 'point'] },
      solve: ['c:unmanaged']
    },
    {
      t: 'learn',
      title: 'Что не сочетается',
      body: '<p><code>class</code> и <code>struct</code> вместе нельзя. <code>unmanaged</code> уже значит «значимый тип», поэтому с <code>struct</code>, <code>class</code> и <code>new()</code> его не пишут. Порядок: сначала class/struct/unmanaged, потом интерфейсы, <code>new()</code> — последним.</p>'
    },
    {
      t: 'blanks',
      q: 'Порядок ограничений',
      code: 'T Make<T>() where T : ___, IDisposable, ___',
      tiles: ['class', 'new()', 'struct', 'unmanaged'],
      answer: ['class', 'new()'],
      explain: 'new() всегда в конце списка.'
    },
    {
      t: 'choice',
      q: 'Что вернёт default(T) для T = int и T = string?',
      options: ['0 и null', 'null и null', '0 и ""'],
      answer: 0,
      explain: 'default — «нули»: для значимых типов — нулевое значение, для ссылочных — null.'
    },
    {
      t: 'match',
      q: 'Соедини ограничение и что оно разрешает',
      pairs: [
        ['new()', 'new T()'],
        ['class', 'T x = null'],
        ['unmanaged', 'stackalloc T[n]'],
        ['IComparable<T>', 'a.CompareTo(b)']
      ]
    },
    {
      t: 'multi',
      q: 'Какие T подойдут под where T : struct? Отметь все.',
      options: ['int', 'DateTime', 'Point (struct)', 'string', 'int?'],
      answer: [0, 1, 2],
      explain: 'string — ссылочный тип. int? — Nullable<int>: он значимый, но struct-ограничение специально его не принимает.'
    }
  ]
};
