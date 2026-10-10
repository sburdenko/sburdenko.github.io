/** Unit 3 final: garbage collection and resources. */
export default {
  id: 'dotnet.w3.boss',
  title: 'Final: the big cleanup',
  sub: 'GC, finalizers and resources: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'gc',
      task: 'Clean up everything: the session with its cart, and the logger with its finalizer.',
      objects: [{ id: 'Session', refs: ['Cart'] }, { id: 'Cart', refs: ['Item'] }, { id: 'Item' }, { id: 'Logger', fin: true }],
      roots: [{ name: 'user', to: 'Session' }, { name: 'logger', to: 'Logger' }],
      gen1: true,
      goal: { kind: 'dead', ids: ['Session', 'Cart', 'Item', 'Logger'] },
      solve: ['root:user', 'root:logger', 'gc:0', 'fin', 'gc:1']
    },
    {
      t: 'choice',
      q: 'An object is in Gen 2. A Gen 0 collection just ran. What happened to it?',
      options: ['Nothing', 'It was removed', 'It moved to Gen 3'],
      answer: 0,
      explain: 'A Gen 0 collection doesn\'t look at older generations. And there is no Gen 3.'
    },
    {
      t: 'multi',
      q: 'What counts as a root? Select all that apply.',
      options: ['A static field', 'A local variable of a running method', 'A field of a garbage object', 'An object in Gen 2'],
      answer: [0, 1],
      explain: 'A generation doesn\'t make an object a root. Roots are thread stacks and static fields.'
    },
    {
      t: 'choice',
      q: 'From what size does an object go to the LOH?',
      options: ['85,000 bytes and up', '1 KB and up', '1 MB and up', 'Only string arrays'],
      answer: 0,
      explain: 'The LOH threshold is 85,000 bytes.'
    },
    {
      t: 'blanks',
      q: 'The connection must close even if Count throws an exception',
      code: '___ var conn = new SqlConnection(cs);\nconn.Open();\nreturn Count(conn);',
      lang: 'cs',
      tiles: ['using', 'lock', 'await', 'fixed'],
      answer: ['using'],
      explain: 'using var calls Dispose at the end of the block, however you leave it.'
    },
    {
      t: 'choice',
      q: 'Why is SafeHandle better than your own finalizer?',
      options: ['Critical finalization and protection against closing a handle mid-call', 'It opens files faster', 'It isn\'t needed in .NET 8'],
      answer: 0,
      explain: 'SafeHandle closes the handle reliably and won\'t let the number be reused while a call is in progress.'
    },
    {
      t: 'choice',
      q: 'A references B, B references A, and nothing else references them. What happens during a collection?',
      options: ['Both are removed', 'Both stay forever', 'Only A is removed'],
      answer: 0,
      explain: 'They can\'t be reached from the roots, so they\'re garbage. The cycle doesn\'t save them.'
    },
    {
      t: 'tapline',
      q: 'Where is the memory leak here?',
      code: 'class PriceView\n{\n    public PriceView()\n    {\n        Market.PriceChanged += OnPrice;\n    }\n    void OnPrice(decimal p) => Render(p);\n}',
      answer: 4,
      explain: 'Market is static and lives forever. The subscription holds on to every PriceView. You need to unsubscribe, for example in Dispose().'
    },
    {
      t: 'choice',
      q: 'An object with a finalizer became garbage. What\'s the minimum number of collections before its memory is freed?',
      options: ['Two', 'One', 'None'],
      answer: 0,
      explain: 'The first puts it on the finalization queue, the second frees it.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Gen 0', 'New objects, frequent fast collections'],
        ['LOH', 'Objects of 85,000 bytes and up'],
        ['Finalizer', 'Runs at some point later'],
        ['Dispose()', 'Releases the resource right away']
      ]
    }
  ]
};
