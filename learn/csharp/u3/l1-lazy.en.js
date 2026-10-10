/** Deeper C#, unit 3, lesson 1: deferred execution. */
export default {
  id: 'cs.u3.l1',
  title: 'Lazy LINQ',
  sub: 'A query is a recipe, not a result',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Describing ≠ running',
      body: '<p>The line <code>var q = numbers.Where(…).Select(…)</code> computes nothing. It only builds a chain. The work starts when something enumerates the result: foreach, ToList, Count, First…</p>'
    },
    {
      t: 'rig', rig: 'linq',
      task: 'Step through the query. Watch the order in which Where and Select are called and where the query stops.',
      lock: ['orderBy', 'toList', 'twice'],
      goal: { max: { read: 4 } },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Why were only four of the six numbers read?',
      options: ['Take(2) got two elements and stopped asking for more', 'Where dropped the last two', 'LINQ only reads half'],
      answer: 0,
      explain: 'The chain pulls elements one at a time. Once it has enough, it stops pulling.'
    },
    {
      t: 'choice',
      q: 'In what order do the calls happen?',
      options: ['Each element goes through the whole chain before the next is taken: Where(1), Where(5), Select(5)…', 'Where for all of them first, then Select for all', 'In random order'],
      answer: 0,
      explain: 'This is what streaming means.'
    },
    {
      t: 'learn',
      title: 'Trap: the data changed',
      body: '<p>Since the query runs when it is enumerated, it sees the data <b>as of enumeration</b>, not as of when you wrote it.</p>',
      code: 'var list = new List<int> { 1, 2, 3 };\nvar big = list.Where(x => x > 1);\nlist.Add(10);\nConsole.WriteLine(big.Count());   // 3, not 2'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'var list = new List<int> { 1, 2, 3 };\nvar big = list.Where(x => x > 1);\nlist.Add(10);\nConsole.WriteLine(big.Count());',
      options: ['3', '2', '4'],
      answer: 0,
      explain: '2, 3 and 10 — the query ran after the Add.'
    },
    {
      t: 'multi',
      q: 'What triggers the query to run? Select all.',
      options: ['foreach', 'ToList()', 'Count()', 'Where(...)', 'Select(...)'],
      answer: [0, 1, 2],
      explain: 'Where and Select only add links to the chain.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Where', 'Filter, lazily'],
        ['Select', 'Transform, lazily'],
        ['Take', 'Stop after N'],
        ['ToList', 'Run now and store']
      ]
    }
  ]
};
