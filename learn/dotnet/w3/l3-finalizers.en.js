/** Unit 3, lesson 3: finalizers and what they cost. */
export default {
  id: 'dotnet.w3.l3',
  title: 'Finalizers',
  sub: 'A last resort you can\'t rely on',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A finalizer is a last resort',
      body: '<p>A class can declare a <b>finalizer</b>, <code>~Name()</code>. The GC calls it before freeing the object\'s memory.</p><p>It was invented for things the GC doesn\'t know about: file handles, sockets, OS memory.</p>',
      code: 'class NativeBuffer\n{\n    ~NativeBuffer()\n    {\n        // give the memory back to the OS\n    }\n}'
    },
    {
      t: 'learn',
      title: 'What a finalizer costs',
      body: '<p>An object with a finalizer can\'t be removed right away. The GC puts it on the <b>finalization queue</b>, a separate thread calls the finalizer at some later point, and only the next collection frees the memory.</p><p>The object lives longer and has time to get promoted to an older generation.</p>',
      flow: ['Becomes garbage', 'Finalization queue', 'Finalizer thread', 'Next collection', 'Memory freed']
    },
    {
      t: 'rig', rig: 'gc',
      task: 'Clear both references and make sure F is really removed. Count how many steps it took.',
      objects: [{ id: 'F', fin: true }, { id: 'Plain' }],
      roots: [{ name: 'f', to: 'F' }, { name: 'p', to: 'Plain' }],
      goal: { kind: 'dead', ids: ['F', 'Plain'] },
      solve: ['root:f', 'root:p', 'gc:0', 'fin', 'gc:2']
    },
    {
      t: 'choice',
      q: 'How many garbage collections does it take to free the memory of an object with a finalizer?',
      options: ['At least two: the first queues it, the second frees it', 'One', 'None: the finalizer frees the memory itself'],
      answer: 0,
      explain: 'The first collection finds the object and queues it. The finalizer runs. The next collection of its generation frees the memory.'
    },
    {
      t: 'choice',
      q: 'When does the finalizer run?',
      options: ['Unknown: once the GC finds the object and the finalizer thread gets to it', 'Right when the method returns', 'Right after you assign null'],
      answer: 0,
      explain: 'The timing isn\'t guaranteed: maybe in a millisecond, maybe in a minute.'
    },
    {
      t: 'learn',
      title: 'What you can\'t trust a finalizer with',
      body: '<p>The timing isn\'t guaranteed.<br>The order between objects isn\'t guaranteed: a neighboring object may already be finalized.<br>In .NET Core and .NET 5+, finalizers <b>aren\'t run at all</b> when the program exits.</p><p>A file that only the finalizer closes may never be fully written.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about finalizers? Select all that apply.',
      options: ['An object with a finalizer lives longer', 'The order of calls between objects isn\'t guaranteed', 'They run on a separate thread', 'They run the instant an object becomes garbage', 'In .NET 8 they\'re guaranteed to run on program exit'],
      answer: [0, 1, 2],
      explain: 'A finalizer is a backup mechanism. For timely cleanup there\'s Dispose, the next lesson.'
    },
    {
      t: 'tapline',
      q: 'Which line in this finalizer is dangerous?',
      code: 'class Logger\n{\n    private StreamWriter _writer;\n    ~Logger()\n    {\n        _writer.Flush();\n    }\n}',
      answer: 5,
      explain: '_writer is another managed object. By the time ~Logger runs, it may already be finalized and closed. A finalizer should touch only unmanaged resources.'
    },
    {
      t: 'choice',
      q: 'A regular class with no native resources. Does it need a finalizer?',
      options: ['No: it would only slow collection down', 'Yes, just in case', 'Yes, otherwise the memory won\'t be freed'],
      answer: 0,
      explain: 'The GC frees managed memory on its own. An unneeded finalizer means an extra queue and an extra collection.'
    }
  ]
};
