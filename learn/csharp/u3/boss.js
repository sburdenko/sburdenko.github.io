/** Финал раздела 3 курса «C# глубже». */
export default {
  id: 'cs.u3.boss',
  title: 'Финал: LINQ',
  sub: 'Ленивость, материализация и SQL',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'linq',
      task: 'Перебор двойной, а лишний OrderBy мешает. Добейся: источник читается не больше 6 раз, Where — не больше 6.',
      start: { twice: true, orderBy: true }, lock: ['twice'],
      goal: { max: { read: 6, where: 6 }, o: { twice: true } },
      solve: ['orderBy', 'toList', 'end']
    },
    {
      t: 'choice',
      q: 'Сколько раз выполнится запрос?',
      code: 'var q = items.Where(Check);\nvar n = q.Count();\nvar first = q.First();\nvar list = q.ToList();',
      options: ['Три раза', 'Один раз', 'Ни разу'],
      answer: 0,
      explain: 'Count, First и ToList — каждый запускает цепочку заново.'
    },
    {
      t: 'choice',
      q: 'Что делает OrderBy с Take(1) после него?',
      options: ['Читает и сортирует всё, потом отдаёт один', 'Читает один элемент', 'Ничего не читает'],
      answer: 0,
      explain: 'Для минимума лучше Min() или MinBy() — один проход без сортировки.'
    },
    {
      t: 'tapline',
      q: 'Какая строка тянет из базы лишние данные?',
      code: 'var vip = db.Customers\n    .ToList()\n    .Where(c => c.Total > 1000)\n    .Take(10);',
      answer: 1,
      explain: 'ToList загрузил всех клиентов в память, и фильтр с Take выполнились в C#.'
    },
    {
      t: 'multi',
      q: 'Что запускает запрос? Отметь все.',
      options: ['First()', 'Any()', 'ToArray()', 'OrderBy()', 'Where()'],
      answer: [0, 1, 2],
      explain: 'OrderBy и Where только описывают шаги.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину',
      pairs: [
        ['Запрос к базе выполнился дважды', 'Двойной перебор без ToList'],
        ['Take не экономит', 'ToList или OrderBy раньше'],
        ['Count видит новые элементы', 'Ленивое выполнение'],
        ['Исключение «could not be translated»', 'Свой метод в IQueryable']
      ]
    },
    {
      t: 'blanks',
      q: 'Проверь наличие, не перебирая всё',
      code: 'if (orders.___(o => o.IsLate)) Warn();',
      tiles: ['Any', 'Count', 'All', 'Where'],
      answer: ['Any'],
      explain: 'Any с условием остановится на первом совпадении.'
    },
    {
      t: 'choice',
      q: 'Когда LINQ стоит переписать на цикл?',
      options: ['Когда профайлер показал горячий путь с LINQ и его аллокациями', 'Всегда', 'Никогда'],
      answer: 0,
      explain: 'Сначала измерение, потом оптимизация.'
    }
  ]
};
