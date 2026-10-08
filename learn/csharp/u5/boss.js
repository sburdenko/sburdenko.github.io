/** Финал курса «C# глубже». */
export default {
  id: 'cs.u5.boss',
  title: 'Финал курса',
  sub: 'Всё вместе',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'patterns',
      task: 'Почини switch: каждая фигура должна получить свою ветку.',
      start: ['rect', 'square', 'circle', 'point', 'nul', 'any'],
      solve: ['up:point', 'up:point', 'up:point', 'up:circle', 'up:circle', 'up:square']
    },
    {
      t: 'rig', rig: 'generics',
      task: 'Метод кладёт T в буфер на стеке и сортирует. Подойти должен int.',
      sig: 'void SortSmall<T>(T a, T b)', ops: ['stack', 'cmp'],
      goal: { allow: ['int'] },
      solve: ['c:unmanaged', 'c:cmp']
    },
    {
      t: 'rig', rig: 'closures',
      task: 'Пусть напечатается 0 1 2, а цикл останется for.',
      start: 'for', variants: ['for', 'copy'],
      goal: { out: '0 1 2', variants: ['copy'] },
      solve: ['variant:copy', 'end']
    },
    {
      t: 'choice',
      q: 'Сколько раз выполнится запрос?',
      code: 'var q = users.Where(u => u.IsActive);\nif (q.Any()) Console.WriteLine(q.Count());',
      options: ['Два', 'Один', 'Ноль'],
      answer: 0,
      explain: 'Any и Count — два перебора.'
    },
    {
      t: 'tapline',
      q: 'Где ошибка компиляции?',
      code: 'public record Point(int X, int Y);\nvar p = new Point(1, 2);\nvar q = p with { X = 5 };\np.Y = 3;',
      answer: 3,
      explain: 'Свойства позиционного record — init.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и инструмент',
      pairs: [
        ['Разобрать строку без мусора', 'ReadOnlySpan<char>'],
        ['Большая структура без копий', 'readonly struct + in'],
        ['Неизменяемое значение с равенством', 'record'],
        ['Сумма для любых чисел', 'INumber<T>']
      ]
    },
    {
      t: 'multi',
      q: 'Что проверяет компилятор, а не рантайм? Отметь все.',
      options: ['Nullable-предупреждения', 'Ограничения where', 'Недостижимые ветки switch', 'Выход за границы Span'],
      answer: [0, 1, 2],
      explain: 'Границы Span проверяются при работе — IndexOutOfRangeException.'
    },
    {
      t: 'choice',
      q: 'Почему List<string> нельзя присвоить List<object>, а IEnumerable<string> в IEnumerable<object> — можно?',
      options: ['IEnumerable только отдаёт элементы (out T), а в List можно положить чужой тип', 'Так исторически сложилось', 'Можно и то и другое'],
      answer: 0,
      explain: 'Вариантность — про безопасность типов.'
    },
    {
      t: 'blanks',
      q: 'Свойство с обрезкой пробелов в C# 14',
      code: 'public string Name { get; set => ___ = value.Trim(); }',
      tiles: ['field', 'value', 'this.Name', '_name'],
      answer: ['field'],
      explain: 'this.Name ушёл бы в бесконечную рекурсию.'
    }
  ]
};
