/** Unit 3 final of the "Deeper C#" course. */
export default {
  id: 'cs.u3.boss',
  title: 'Final: LINQ',
  sub: 'Laziness, materialization and SQL',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'linq',
      task: 'The query is enumerated twice, and an extra OrderBy gets in the way. Make the source read at most 6 times and Where run at most 6 times.',
      start: { twice: true, orderBy: true }, lock: ['twice'],
      goal: { max: { read: 6, where: 6 }, o: { twice: true } },
      solve: ['orderBy', 'toList', 'end']
    },
    {
      t: 'choice',
      q: 'How many times does the query run?',
      code: 'var q = items.Where(Check);\nvar n = q.Count();\nvar first = q.First();\nvar list = q.ToList();',
      options: ['Three times', 'Once', 'Never'],
      answer: 0,
      explain: 'Count, First and ToList each run the chain from scratch.'
    },
    {
      t: 'choice',
      q: 'What does OrderBy do when Take(1) follows it?',
      options: ['Reads and sorts everything, then hands out one', 'Reads one element', 'Reads nothing'],
      answer: 0,
      explain: 'For the minimum, Min() or MinBy() is better — one pass, no sorting.'
    },
    {
      t: 'tapline',
      q: 'Which line pulls extra data from the database?',
      code: 'var vip = db.Customers\n    .ToList()\n    .Where(c => c.Total > 1000)\n    .Take(10);',
      answer: 1,
      explain: 'ToList loaded every customer into memory, so the filter and Take ran in C#.'
    },
    {
      t: 'multi',
      q: 'Which of these run the query? Select all.',
      options: ['First()', 'Any()', 'ToArray()', 'OrderBy()', 'Where()'],
      answer: [0, 1, 2],
      explain: 'OrderBy and Where only describe steps.'
    },
    {
      t: 'match',
      q: 'Match the symptom to the cause',
      pairs: [
        ['The database query ran twice', 'Enumerated twice without ToList'],
        ['Take saves nothing', 'ToList or OrderBy comes earlier'],
        ['Count sees new elements', 'Deferred execution'],
        ['"could not be translated" exception', 'Your own method inside IQueryable']
      ]
    },
    {
      t: 'blanks',
      q: 'Check for a match without scanning everything',
      code: 'if (orders.___(o => o.IsLate)) Warn();',
      tiles: ['Any', 'Count', 'All', 'Where'],
      answer: ['Any'],
      explain: 'Any with a condition stops at the first match.'
    },
    {
      t: 'choice',
      q: 'When is it worth rewriting LINQ as a loop?',
      options: ['When the profiler shows a hot path with LINQ and its allocations', 'Always', 'Never'],
      answer: 0,
      explain: 'Measure first, optimize second.'
    }
  ]
};
