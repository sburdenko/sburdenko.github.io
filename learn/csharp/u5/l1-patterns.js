/** C# глубже, раздел 5, урок 1: сопоставление с образцом. */
export default {
  id: 'cs.u5.l1',
  title: 'Pattern matching',
  sub: 'is, switch-выражения и порядок веток',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Проверить и достать за раз',
      body: '<p><code>is</code> проверяет тип и сразу объявляет переменную. Шаблоны свойств заглядывают внутрь объекта.</p>',
      code: 'if (shape is Circle { R: > 10 } big)\n    Console.WriteLine($"большой круг {big.R}");'
    },
    {
      t: 'learn',
      title: 'switch-выражение',
      body: '<p>Ветки проверяются <b>сверху вниз</b>, побеждает первая подходящая. <code>_</code> — «всё остальное», включая null. Компилятор ругается (CS8510), если ветку не достичь, потому что всё уже поймано выше.</p>',
      code: 'string Describe(Shape? s) => s switch\n{\n    Circle { R: 0 } => "точка",\n    Circle c        => "круг",\n    null            => "пусто",\n    _               => "что-то ещё"\n};'
    },
    {
      t: 'rig', rig: 'patterns',
      task: 'Ветки перепутаны: точка становится кругом, квадрат — прямоугольником, null — «что-то ещё». Расставь их кнопками ▲.',
      start: ['circle', 'point', 'rect', 'square', 'any', 'nul'],
      solve: ['up:point', 'up:square', 'up:nul']
    },
    {
      t: 'choice',
      q: 'Почему null попадал в «что-то ещё»?',
      options: ['_ ловит всё, включая null, а ветка null стояла ниже', 'null нельзя проверять в switch', 'Это баг'],
      answer: 0,
      explain: 'Частные случаи — выше, общие — ниже.'
    },
    {
      t: 'learn',
      title: 'Ещё шаблоны',
      body: '<p><b>Относительные</b>: <code>&lt; 0</code>, <code>&gt;= 18</code>.<br><b>Логические</b>: <code>and</code>, <code>or</code>, <code>not</code>.<br><b>Списковые</b> (C# 11): <code>[1, .., var last]</code>.</p>',
      code: 'string Grade(int score) => score switch\n{\n    < 0 or > 100 => "ошибка",\n    >= 90        => "отлично",\n    >= 60        => "сдал",\n    _            => "не сдал"\n};\n\nif (args is [var cmd, ..]) Run(cmd);'
    },
    {
      t: 'choice',
      q: 'Что вернёт Grade(95)?',
      options: ['"отлично"', '"сдал"', '"ошибка"'],
      answer: 0,
      explain: '95 не меньше 0 и не больше 100, зато ≥ 90 — первая подходящая ветка.'
    },
    {
      t: 'blanks',
      q: 'Не null и не пустая строка',
      code: 'if (name is ___ null ___ "") Greet(name);',
      tiles: ['not', 'and not', 'or', '!=', 'is'],
      answer: ['not', 'and not'],
      explain: 'name is not null and not "" — читается почти как текст.'
    },
    {
      t: 'match',
      q: 'Соедини шаблон и смысл',
      pairs: [
        ['Circle { R: 0 }', 'Шаблон свойства'],
        ['>= 18', 'Относительный шаблон'],
        ['[var first, ..]', 'Списковый шаблон'],
        ['_', 'Всё остальное']
      ]
    },
    {
      t: 'choice',
      q: 'Ветка Rect r стоит выше Rect { W: var w, H: var h } when w == h. Что скажет компилятор?',
      options: ['CS8510: вторую ветку не достичь — все Rect уже пойманы', 'Ничего', 'Выберет более точную ветку сам'],
      answer: 0,
      explain: 'Компилятор не переставляет ветки — побеждает первая.'
    }
  ]
};
