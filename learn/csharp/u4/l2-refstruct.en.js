/** Deeper C#, unit 4, lesson 2: ref struct and Memory<T>. */
export default {
  id: 'cs.u4.l2',
  title: 'ref struct: the rules of Span',
  sub: 'Why a Span can\'t be a field or cross an await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A Span lives only on the stack',
      body: '<p>A Span can point into stack memory. If a Span ended up on the heap, it would outlive its method — and point into a stack that now belongs to someone else. That is why Span is a <b>ref struct</b>: the compiler won\'t let it reach the heap.</p>'
    },
    {
      t: 'learn',
      title: 'What you can\'t do',
      body: '<p>You can\'t store a Span in a class field, box it (into object or an interface), capture it in a lambda, or hold it across <code>await</code> or <code>yield</code>.</p><p>Since C# 13 you can declare a Span in an async method — but only between awaits, not across them.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line will not compile?',
      code: 'class Parser\n{\n    private Span<byte> _buffer;\n    public int Count;\n}',
      answer: 2,
      explain: 'A class field lives on the heap, and a Span is not allowed there.'
    },
    {
      t: 'tapline',
      q: 'Where is the error?',
      code: 'async Task ProcessAsync(byte[] data)\n{\n    Span<byte> head = data.AsSpan(0, 4);\n    await SendAsync();\n    Use(head);\n}',
      answer: 4,
      explain: 'head is used after the await — so it would have to survive the suspension and move to the heap. Not allowed.'
    },
    {
      t: 'learn',
      title: 'Memory<T> — for the heap and async',
      body: '<p>Need a window you can store in a field or pass across an await? Use <code>Memory&lt;T&gt;</code>: a regular struct that can live anywhere, and <code>.Span</code> gives you a Span for work right here, right now.</p>',
      code: 'async Task SendAsync(ReadOnlyMemory<byte> data)\n{\n    await _stream.WriteAsync(data);\n    Log(data.Span[0]);\n}'
    },
    {
      t: 'choice',
      q: 'You need to keep a slice of a buffer in a class field. What do you choose?',
      options: ['Memory<T>', 'Span<T>', 'ref Span<T>'],
      answer: 0,
      explain: 'Memory<T> is a regular struct with none of the ref struct restrictions.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Span<T>', 'Stack only, fast'],
        ['Memory<T>', 'Fine in a field and across await'],
        ['ref struct', 'Can never reach the heap'],
        ['.Span', 'Get a Span from a Memory']
      ]
    },
    {
      t: 'multi',
      q: 'What can\'t you do with a Span<T>? Select all.',
      options: ['Store it in a class field', 'Capture it in a lambda', 'Hold it across an await', 'Pass it as a parameter to a regular method'],
      answer: [0, 1, 2],
      explain: 'Passing it as a parameter is fine — that is still the stack.'
    }
  ]
};
