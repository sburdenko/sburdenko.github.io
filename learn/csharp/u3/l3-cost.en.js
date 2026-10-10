/** Deeper C#, unit 3, lesson 3: the cost of LINQ and IQueryable. */
export default {
  id: 'cs.u3.l3',
  title: 'The cost of LINQ, and IQueryable',
  sub: 'Buffering, allocations and SQL from lambdas',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Not every operator streams',
      body: '<p>To hand out the first element, <code>OrderBy</code> has to see them all — the smallest one might be last. Operators like this <b>buffer</b>: OrderBy, GroupBy, Reverse, Distinct (partly).</p>'
    },
    {
      t: 'rig', rig: 'linq',
      task: 'Add OrderBy before Where and step to the end. How many numbers have to be read?',
      lock: ['toList', 'twice'],
      goal: { o: { orderBy: true }, min: { read: 6 } },
      solve: ['orderBy', 'end']
    },
    {
      t: 'choice',
      q: 'Take(2) comes after OrderBy. Does Take save you from reading every element?',
      options: ['No: OrderBy reads and sorts everything before handing out the first one', 'Yes, Take stops OrderBy', 'Only if there is little data'],
      answer: 0,
      explain: 'Sorting is a buffering operation.'
    },
    {
      t: 'learn',
      title: 'Where LINQ costs you',
      body: '<p>Every capturing lambda is an object; every operator has its own enumerator. In everyday code this does not matter. In a hot loop that spins millions of times a second (a game, a server under load), a plain for loop can be several times faster.</p><p>LINQ gets faster with every .NET release — profile first, rewrite second.</p>'
    },
    {
      t: 'choice',
      q: 'What is faster for checking "is there at least one element"?',
      options: ['Any() — stops at the first one', 'Count() > 0 — counts everything', 'Same either way'],
      answer: 0,
      explain: 'For a list Count is cheap, but for a query or a database Any() does not scan everything.'
    },
    {
      t: 'learn',
      title: 'IQueryable: a lambda becomes SQL',
      body: '<p>In Entity Framework, queries are <code>IQueryable</code>. A lambda there is not compiled into a method; it becomes an <b>expression tree</b> that EF translates into SQL.</p>',
      code: 'db.Users.Where(u => u.Age > 18).Select(u => u.Name)\n// SELECT Name FROM Users WHERE Age > 18'
    },
    {
      t: 'choice',
      q: 'Inside an EF Where you call your own C# method IsVip(u), which SQL knows nothing about. What happens in EF Core?',
      options: ['An exception: the expression cannot be translated to SQL', 'EF quietly loads the whole table', 'The method runs on the database server'],
      answer: 0,
      explain: 'Since EF Core 3.0, untranslatable expressions are no longer run quietly in memory — EF fails loudly.'
    },
    {
      t: 'tapline',
      q: 'After which line does filtering happen in memory instead of in the database?',
      code: 'var names = db.Orders\n    .Where(o => o.Total > 100)\n    .AsEnumerable()\n    .Where(o => IsVip(o.Customer))\n    .Select(o => o.Id);',
      answer: 2,
      explain: 'AsEnumerable switches to LINQ to Objects: from there on everything runs in C#, and the database sends every order over 100.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IEnumerable', 'The lambda is a regular method'],
        ['IQueryable', 'The lambda is an expression tree'],
        ['OrderBy', 'Buffers everything'],
        ['Any()', 'Stops at the first one']
      ]
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['OrderBy reads the whole sequence', 'EF Core translates Where lambdas into SQL', 'AsEnumerable moves the rest of the work into memory', 'LINQ is always 100 times slower than for'],
      answer: [0, 1, 2],
      explain: 'There is a difference, but it is usually small and matters only on hot paths.'
    }
  ]
};
