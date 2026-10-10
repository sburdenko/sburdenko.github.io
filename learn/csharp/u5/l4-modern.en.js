/** Deeper C#, unit 5, lesson 4: C# 12–14. */
export default {
  id: 'cs.u5.l4',
  title: 'C# 12, 13 and 14',
  sub: 'What the latest versions added',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'C# 12: primary constructors',
      body: '<p>Constructor parameters go right in the class header. Key point: these are <b>not properties</b> but parameters available throughout the class body.</p>',
      code: 'public class OrderService(IOrderRepo repo, ILogger<OrderService> log)\n{\n    public void Place(Order o)\n    {\n        repo.Save(o);\n        log.LogInformation("order {Id}", o.Id);\n    }\n}'
    },
    {
      t: 'choice',
      q: 'Given class Service(IRepo repo), can outside code write service.repo?',
      options: ['No: repo is a parameter, not a public property', 'Yes', 'Read-only'],
      answer: 0,
      explain: 'In a record, positional parameters become properties; in a regular class they don\'t.'
    },
    {
      t: 'learn',
      title: 'C# 12: collection expressions',
      body: '<p>Square brackets create an array, a list, a Span — whatever the target type needs. <code>..</code> spreads another collection in.</p>',
      code: 'int[] a = [1, 2, 3];\nList<int> b = [0, ..a, 4];     // 0, 1, 2, 3, 4\nReadOnlySpan<char> sep = [\',\', \';\'];'
    },
    {
      t: 'blanks',
      q: 'A list of zero, the elements of a, and five',
      code: 'List<int> all = [0, ___a, 5];',
      tiles: ['..', '...', '*', '&'],
      answer: ['..'],
      explain: 'The spread is two dots.'
    },
    {
      t: 'learn',
      title: 'C# 13',
      body: '<p><b>params collections</b>: <code>params ReadOnlySpan&lt;int&gt;</code> instead of an array — no allocation.<br><b>A new lock type</b>, <code>System.Threading.Lock</code> (.NET 9): <code>lock</code> on it is faster than on an object.<br><b>ref struct in async methods</b> — between awaits.</p>',
      code: 'private readonly Lock _gate = new();\n\nlock (_gate) { _count++; }'
    },
    {
      t: 'learn',
      title: 'C# 14 (.NET 10)',
      body: '<p><b>field</b> — the hidden backing field of an auto-property.<br><b>extension blocks</b> — extension properties, not just methods.<br><b>?.=</b> — assign only if the left side is not null.<br><b>Implicit Span conversions</b>: an array turns into a Span by itself wherever one is expected.</p>',
      code: 'public string Title { get; set => field = value.Trim(); }\n\norder?.Status = Status.Paid;'
    },
    {
      t: 'match',
      q: 'Match the feature to the version',
      pairs: [
        ['Primary constructors for classes', 'C# 12'],
        ['Collection expressions [1, 2]', 'Also C# 12'],
        ['System.Threading.Lock', 'C# 13'],
        ['The field keyword', 'C# 14']
      ]
    },
    {
      t: 'choice',
      q: 'What does order?.Status = Status.Paid do if order == null?',
      options: ['Nothing — the assignment is skipped', 'NullReferenceException', 'Creates order'],
      answer: 0,
      explain: 'Null-conditional assignment, new in C# 14.'
    },
    {
      t: 'multi',
      q: 'What arrived in C# 12–14? Select all.',
      options: ['Collection expressions', 'The field keyword', 'params ReadOnlySpan<T>', 'async/await', 'LINQ'],
      answer: [0, 1, 2],
      explain: 'async is from C# 5, LINQ from C# 3.'
    }
  ]
};
