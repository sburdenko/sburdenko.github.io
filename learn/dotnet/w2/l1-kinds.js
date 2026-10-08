/** Раздел 2, урок 1: значимые и ссылочные типы. */
const CODE = 'Point p1 = new Point(1, 2);\nPoint p2 = p1;\np2.X = 100;\nConsole.WriteLine(p1.X);';

export default {
  id: 'dotnet.w2.l1',
  title: 'Значимые и ссылочные типы',
  sub: 'Почему одна и та же строчка ведёт себя по-разному',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Два вида типов',
      body: '<p>Все типы в C# делятся на два вида.</p><p><b>Значимые</b> (value types): <code>int</code>, <code>double</code>, <code>bool</code>, любые <code>struct</code>. Переменная хранит само значение.</p><p><b>Ссылочные</b> (reference types): любые <code>class</code>, <code>string</code>, массивы. Переменная хранит только адрес объекта — ссылку. Сам объект лежит отдельно, в куче.</p><p>Значимый тип — как записка с числом: отдал копию, у тебя осталась своя. Ссылочный — как адрес дома: дал адрес другу, и вы оба ходите в один дом.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Пройди программу по шагам дважды: когда Point — структура и когда класс. Следи за стеком и кучей.',
      goal: 'both',
      variants: {
        struct: {
          code: CODE,
          steps: [
            { line: 0, note: 'p1 — структура: оба поля лежат прямо в переменной, в стеке.', ops: [{ op: 'new', name: 'p1', type: 'Point', kind: 'val', fields: { X: 1, Y: 2 } }] },
            { line: 1, note: 'p2 = p1 копирует всю структуру. Теперь это две независимые точки.', ops: [{ op: 'copy', to: 'p2', from: 'p1' }] },
            { line: 2, note: 'Меняем p2. p1 это не касается.', ops: [{ op: 'set', target: 'p2', field: 'X', value: 100 }] },
            { line: 3, note: 'Выведет 1: у p1 своя копия.', ops: [] }
          ]
        },
        class: {
          code: CODE,
          steps: [
            { line: 0, note: 'Объект Point создан в куче. В p1 — только ссылка на него.', ops: [{ op: 'new', name: 'p1', type: 'Point', kind: 'ref', fields: { X: 1, Y: 2 } }] },
            { line: 1, note: 'p2 = p1 копирует ссылку. Обе переменные ведут к одному объекту.', ops: [{ op: 'copy', to: 'p2', from: 'p1' }] },
            { line: 2, note: 'Меняем объект через p2 — это тот же объект, что у p1.', ops: [{ op: 'set', target: 'p2', field: 'X', value: 100 }] },
            { line: 3, note: 'Выведет 100: p1 и p2 — один и тот же объект.', ops: [] }
          ]
        }
      },
      solve: ['step', 'step', 'step', 'step', 'variant:class', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point — структура (struct). Что выведет код?',
      code: CODE,
      options: ['1', '100', '0', 'Ошибку компиляции'],
      answer: 0,
      explain: 'Присваивание структуры копирует её целиком. p2 — отдельная копия, изменения в ней не видны в p1.'
    },
    {
      t: 'choice',
      q: 'А если Point — класс (class)?',
      code: CODE,
      options: ['100', '1', '0', 'NullReferenceException'],
      answer: 0,
      explain: 'У класса копируется только ссылка. p1 и p2 ведут к одному объекту, поэтому изменение через p2 видно через p1.'
    },
    {
      t: 'multi',
      q: 'Какие из этих типов — значимые? Отметь все.',
      options: ['int', 'bool', 'DateTime', 'string', 'int[]', 'List<int>'],
      answer: [0, 1, 2],
      explain: 'DateTime — структура. А string и массивы — ссылочные, даже если внутри одни числа.'
    },
    {
      t: 'learn',
      title: 'Как узнать, что перед тобой',
      body: '<p><code>struct</code> и <code>enum</code> — значимые. <code>class</code>, <code>interface</code>, делегаты, массивы и <code>string</code> — ссылочные.</p><p>Не помнишь — наведи курсор на тип в IDE: там будет написано struct или class.</p>',
      deep: '<code>record struct</code> — значимый, обычный <code>record</code> (он же record class) — ссылочный. <code>int?</code> — это <code>Nullable&lt;int&gt;</code>, тоже структура: значение плюс флаг HasValue.'
    },
    {
      t: 'choice',
      q: 'Point — класс без своего Equals. Что вернёт a.Equals(b)?',
      code: 'var a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a.Equals(b));',
      options: ['False', 'True', 'Ошибку компиляции'],
      answer: 0,
      explain: 'Это два разных объекта в куче. Стандартный Equals у класса сравнивает ссылки. У структуры он сравнил бы поля и вернул True.',
      wrong: { 1: 'True было бы у структуры: её стандартный Equals сравнивает поля.' }
    },
    {
      t: 'choice',
      q: 'Когда уместна структура?',
      options: ['Маленькое значение, которое ведёт себя как число: координата, цвет, дата', 'Большой объект с десятком полей, который часто передают', 'Объект, который меняют из разных мест программы'],
      answer: 0,
      explain: 'Структура копируется при каждом присваивании и передаче. Для больших данных это дорого, а изменения в копии не видны оригиналу.',
      deep: 'Рекомендация Microsoft: структура до 16 байт, неизменяемая и логически представляет одно значение.'
    },
    {
      t: 'tapline',
      q: 'Point — класс. После какой строки a.X станет 50?',
      code: 'var a = new Point(1, 2);\nvar b = a;\nvar c = new Point(1, 2);\nc.X = 50;\nb.X = 50;',
      answer: 4,
      explain: 'b — это ссылка на тот же объект, что и a. c — совсем другой объект, хоть и с теми же значениями.'
    }
  ]
};
