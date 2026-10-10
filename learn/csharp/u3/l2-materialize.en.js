/** Deeper C#, unit 3, lesson 2: ToList and multiple enumeration. */
export default {
  id: 'cs.u3.l2',
  title: 'ToList and multiple enumeration',
  sub: 'When to store the result, and when not to',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Every enumeration starts over',
      body: '<p>A query does not remember its result. Enumerate it twice and the whole chain runs twice: reading again, Where again, Select again. If the source is a database or a file, that is two trips to it.</p>'
    },
    {
      t: 'rig', rig: 'linq',
      task: 'The query is enumerated twice: Count() and foreach. Make the source read at most 6 times in total.',
      start: { twice: true }, lock: ['orderBy', 'twice'],
      goal: { max: { read: 6 }, o: { twice: true } },
      solve: ['toList', 'end']
    },
    {
      t: 'choice',
      q: 'With ToList, why is the source read only once even though it is still enumerated twice?',
      options: ['ToList ran the chain once and stored a list; Count() and foreach work on that list', 'ToList caches the query forever', 'Count() stopped working'],
      answer: 0,
      explain: 'Once materialized, you enumerate the list, not the query.'
    },
    {
      t: 'rig', rig: 'linq',
      task: 'Here ToList is unnecessary: because of it, Where runs for all six numbers. Get Where down to at most 4 calls.',
      start: { toList: true }, lock: ['orderBy', 'twice'],
      goal: { max: { where: 4 } },
      solve: ['toList', 'end']
    },
    {
      t: 'choice',
      q: 'With ToList before Take, why did Where run 6 times?',
      options: ['ToList needs every element, so Take can no longer stop the reading', 'ToList calls Where twice', 'Take broke'],
      answer: 0,
      explain: 'ToList is a wall: everything before it runs to completion.'
    },
    {
      t: 'learn',
      title: 'The rule',
      body: '<p><b>Materialize</b> (ToList, ToArray) if the result is enumerated several times or the source is expensive.<br><b>Don\'t materialize</b> if you enumerate once or a Take/First comes later — laziness saves work.</p><p>The IDE warns you: "Possible multiple enumeration".</p>'
    },
    {
      t: 'tapline',
      q: 'Where does the database query run a second time?',
      code: 'var active = db.Users.Where(u => u.IsActive);\nif (active.Any())\n{\n    foreach (var u in active)\n        Notify(u);\n}',
      answer: 3,
      explain: 'Any() ran the query, and foreach runs it again. If you need all the users, call ToList() right away.'
    },
    {
      t: 'multi',
      q: 'When should you call ToList()? Select all.',
      options: ['The result is enumerated several times', 'The source is a slow database or file, and you need the result later', 'You need to freeze the data before the source changes', 'Right after Where, before First()'],
      answer: [0, 1, 2],
      explain: 'Before First(), ToList only forces reading everything.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Enumerating a query twice', 'Double the work'],
        ['ToList', 'Run once and store'],
        ['ToList before Take', 'Take no longer saves anything'],
        ['First()', 'Stops at the first one']
      ]
    }
  ]
};
