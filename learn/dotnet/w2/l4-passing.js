/** Раздел 2, урок 4: передача аргументов — копия, ref, out, in. */
const MOVE = 'static void Main()\n{\n    var p = new Point(1, 1);\n    Move(p);\n    Console.WriteLine(p.X);\n}\nstatic void Move(Point q)\n{\n    q.X = 99;\n}';
const moveSteps = kind => [
  { line: 2, note: kind === 'val' ? 'p — структура в кадре Main.' : 'p — ссылка на объект в куче.', ops: [{ op: 'new', name: 'p', type: 'Point', kind, fields: { X: 1, Y: 1 } }] },
  { line: 3, note: kind === 'val' ? 'Move получил копию всей структуры.' : 'Move получил копию ссылки — на тот же объект.', ops: [{ op: 'call', fn: 'Move', params: [{ name: 'q', from: 'p' }] }] },
  { line: 8, note: kind === 'val' ? 'Меняем копию в кадре Move.' : 'Меняем объект в куче — общий для p и q.', ops: [{ op: 'set', target: 'q', field: 'X', value: 99 }] },
  { line: 9, note: kind === 'val' ? 'Кадр Move исчез вместе с копией.' : 'Кадр Move исчез, объект остался изменённым.', ops: [{ op: 'ret' }] },
  { line: 4, note: kind === 'val' ? 'Выведет 1.' : 'Выведет 99.', ops: [] }
];

export default {
  id: 'dotnet.w2.l4',
  title: 'Передача в метод',
  sub: 'Копия, ref, out и in',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'По умолчанию — копия',
      body: '<p>При вызове метода каждый аргумент копируется в его параметр.</p><p>Для структуры копируется вся структура. Для класса — только ссылка: метод получает адрес того же объекта.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Пройди вызов Move в обоих вариантах.',
      goal: 'both',
      variants: { struct: { code: MOVE, steps: moveSteps('val') }, class: { code: MOVE, steps: moveSteps('ref') } },
      solve: ['step', 'step', 'step', 'step', 'step', 'variant:class', 'step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point — структура. Что выведет программа?',
      code: MOVE,
      options: ['1', '99', '0'],
      answer: 0,
      explain: 'Move менял свою копию. Переменная p в Main осталась прежней.'
    },
    {
      t: 'learn',
      title: 'ref — передать саму переменную',
      body: '<p>С <code>ref</code> метод получает не копию, а доступ к переменной вызывающего кода.</p><p><code>out</code> — то же, но метод обязан записать значение (как в <code>int.TryParse</code>).<br><code>in</code> — по ссылке, но только для чтения: большую структуру не нужно копировать.</p>',
      code: 'static void Move(ref Point q) => q.X = 99;\nMove(ref p);',
      deep: 'in с обычной (не readonly) структурой может заставить компилятор делать «защитные копии» при вызове её методов — вдруг метод меняет поля. Поэтому большие структуры объявляют <code>readonly struct</code>.'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Теперь Move(ref p). Посмотри, на что указывает q.',
      goal: 'end',
      code: 'static void Main()\n{\n    var p = new Point(1, 1);\n    Move(ref p);\n    Console.WriteLine(p.X);\n}\nstatic void Move(ref Point q)\n{\n    q.X = 99;\n}',
      steps: [
        { line: 2, note: 'p — структура в кадре Main.', ops: [{ op: 'new', name: 'p', type: 'Point', kind: 'val', fields: { X: 1, Y: 1 } }] },
        { line: 3, note: 'q — не копия, а ссылка на переменную p из Main.', ops: [{ op: 'call', fn: 'Move', params: [{ name: 'q', from: 'p', ref: true }] }] },
        { line: 8, note: 'Меняется сама p в кадре Main.', ops: [{ op: 'set', target: 'q', field: 'X', value: 99 }] },
        { line: 9, note: 'Move закончился.', ops: [{ op: 'ret' }] },
        { line: 4, note: 'Выведет 99.', ops: [] }
      ],
      solve: ['step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point — класс, p = (5, 5). Чему равно p.X после Reset(p)?',
      code: 'static void Reset(Point q)\n{\n    q = new Point(0, 0);\n}',
      options: ['5', '0', 'NullReferenceException'],
      answer: 0,
      explain: 'Метод заменил свою копию ссылки на новый объект. Переменная p по-прежнему ведёт к старому объекту. Чтобы заменить p, нужен ref.',
      wrong: { 1: 'Так было бы с ref Point q. Без ref метод меняет только свою копию ссылки.' }
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Проверь на стенде: что происходит с q внутри Reset.',
      goal: 'end',
      code: 'static void Main()\n{\n    var p = new Point(5, 5);\n    Reset(p);\n}\nstatic void Reset(Point q)\n{\n    q = new Point(0, 0);\n}',
      steps: [
        { line: 2, note: 'Объект (5, 5) в куче.', ops: [{ op: 'new', name: 'p', type: 'Point', kind: 'ref', fields: { X: 5, Y: 5 } }] },
        { line: 3, note: 'q — копия ссылки p.', ops: [{ op: 'call', fn: 'Reset', params: [{ name: 'q', from: 'p' }] }] },
        { line: 7, note: 'q теперь ведёт к новому объекту. p — к старому.', ops: [{ op: 'new', name: 'q', type: 'Point', kind: 'ref', fields: { X: 0, Y: 0 } }] },
        { line: 8, note: 'Кадр Reset исчез. Новый объект стал мусором, p не изменилась.', ops: [{ op: 'ret' }] }
      ],
      solve: ['step', 'step', 'step', 'step']
    },
    {
      t: 'match',
      q: 'Соедини модификатор и смысл',
      pairs: [
        ['ref', 'Метод читает и меняет переменную вызывающего'],
        ['out', 'Метод обязан записать значение'],
        ['in', 'По ссылке, но только для чтения'],
        ['без модификатора', 'Метод получает копию']
      ]
    },
    {
      t: 'choice',
      q: 'Зачем передавать большую структуру как in?',
      options: ['Чтобы не копировать её при каждом вызове и запретить изменения', 'Чтобы метод мог её изменить', 'Чтобы она переехала в кучу'],
      answer: 0,
      explain: 'in передаёт адрес вместо копии всех полей, а компилятор не даст методу её изменить.'
    }
  ]
};
