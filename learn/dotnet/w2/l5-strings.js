/** Раздел 2, урок 5: string — ссылочный, но неизменяемый. */
const CODE = 'string a = "кот";\nstring b = a;\nb += "ик";\nConsole.WriteLine(a);';

export default {
  id: 'dotnet.w2.l5',
  title: 'string — особый тип',
  sub: 'Ссылочный, но ведёт себя как значение',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Строку нельзя изменить',
      body: '<p><code>string</code> — ссылочный тип: текст лежит в куче. Но строка <b>неизменяемая</b> (immutable). Любая «правка» создаёт новую строку, а старая остаётся как была.</p><p>Поэтому строки безопасно передавать куда угодно: никто не испортит твой текст.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Пройди по шагам и посмотри, что делает +=.',
      goal: 'end',
      code: CODE,
      steps: [
        { line: 0, note: 'Строка «кот» в куче, в a — ссылка.', ops: [{ op: 'str', name: 'a', text: 'кот' }] },
        { line: 1, note: 'b ведёт к той же строке.', ops: [{ op: 'copy', to: 'b', from: 'a' }] },
        { line: 2, note: '+= не меняет «кот»: создаётся новая строка «котик», и b теперь ведёт к ней.', ops: [{ op: 'concat', name: 'b', from: 'b', text: 'ик' }] },
        { line: 3, note: 'Выведет «кот».', ops: [] }
      ],
      solve: ['step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Что выведет код?',
      code: CODE,
      options: ['кот', 'котик', 'ик'],
      answer: 0,
      explain: 'Строка «кот» не изменилась. b получила ссылку на новую строку, a — нет.'
    },
    {
      t: 'choice',
      q: 'Две строки с одинаковым текстом собраны по-разному. Что вернёт a == b?',
      code: 'string a = "ко" + Console.ReadLine(); // ввели «т»\nstring b = "кот";\nConsole.WriteLine(a == b);',
      options: ['True', 'False'],
      answer: 0,
      explain: 'Оператор == у string сравнивает текст, а не ссылки. Это разные объекты, но текст одинаковый.'
    },
    {
      t: 'learn',
      title: 'Склеивать строки в цикле — плохо',
      body: '<p><code>s += x</code> в цикле каждый раз создаёт новую строку и копирует в неё весь накопленный текст. 10 000 итераций — 10 000 строк-мусора и работа, которая растёт квадратично.</p><p><code>StringBuilder</code> копит текст в изменяемом буфере и собирает строку один раз в конце.</p>',
      code: 'var sb = new StringBuilder();\nfor (int i = 0; i < 10_000; i++)\n    sb.Append(i);\nstring s = sb.ToString();'
    },
    {
      t: 'choice',
      q: 'Сколько новых строк создаст этот цикл?',
      code: 'string s = "";\nfor (int i = 0; i < 1000; i++)\n    s += "x";',
      options: ['1 000', '1', '0', '2'],
      answer: 0,
      explain: 'Каждое += создаёт новую строку. Литерал «x» при этом один — он интернирован.'
    },
    {
      t: 'learn',
      title: 'Интернирование',
      body: '<p>Одинаковые строковые литералы в программе — это один и тот же объект: CLR хранит их в пуле интернирования.</p><p>Строки, собранные во время работы, туда не попадают, если не вызвать <code>string.Intern</code>.</p>',
      deep: 'Поэтому <code>ReferenceEquals("abc", "abc")</code> обычно true, а для строки из StringBuilder с тем же текстом — false. Сравнивать строки по ссылке — ошибка: используй == или string.Equals с нужным StringComparison.'
    },
    {
      t: 'multi',
      q: 'Что правда про string? Отметь все.',
      options: ['Это ссылочный тип', 'После создания строку нельзя изменить', '== сравнивает текст', 'Текст строки лежит в стеке', 's.Replace("a", "b") меняет исходную строку'],
      answer: [0, 1, 2],
      explain: 'Replace, ToUpper и другие методы возвращают новую строку. Если результат не сохранить, ничего не изменится.'
    },
    {
      t: 'blanks',
      q: 'Собери быструю склейку слов',
      code: 'var sb = new ___();\nforeach (var w in words)\n    sb.___(w);\nreturn sb.ToString();',
      tiles: ['StringBuilder', 'Append', 'string', 'Concat', 'Add'],
      answer: ['StringBuilder', 'Append'],
      explain: 'StringBuilder.Append дописывает в буфер без создания промежуточных строк.'
    }
  ]
};
