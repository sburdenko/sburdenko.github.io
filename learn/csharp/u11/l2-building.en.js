/** Deeper C#, unit "Strings, enums, arrays", lesson 2: building a string without extra allocations. */
export default {
  id: 'cs.u11.l2',
  title: 'Building strings cheaply',
  sub: 'Concat, StringBuilder inside, the interpolation handler, string.Create and UTF-8 literals',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What the compiler does with plus',
      body: '<p>The compiler does not turn <code>a + b + c</code> into two additions. It gathers all operands into <b>one call</b> to <code>string.Concat(a, b, c)</code>. Concat first sums the lengths, allocates the result once and copies the pieces into it. No intermediate <code>a + b</code> string ever appears.</p><p>Concat has overloads for 2, 3 and 4 strings. With more operands the compiler passes them as an array — one more allocation, but still a single result string.</p><p>So joining a fixed number of parts in one expression is already optimal. The problem is only a loop: there every <code>+=</code> is a separate call and a separate string.</p>',
      code: 'string s = first + " " + last + "!";\n// the compiler emits:\n// string s = string.Concat(first, " ", last, "!");',
      deep: '<p>If an operand is not a string, for example <code>"id=" + n</code> with <code>int n</code>, older compilers picked <code>Concat(object, object)</code> and boxed the number. Modern Roslyn calls <code>n.ToString()</code> for value types and uses the string overload: no boxing, but a temporary string for the number remains. The interpolation from the next cards avoids even that.</p>'
    },
    {
      t: 'choice',
      q: 'first and last are strings. How many new strings does this line create?',
      code: 'string s = first + " " + last + "!";',
      options: ['1', '3', '4', '2'],
      answer: 0,
      explain: 'One Concat call with four arguments: the lengths are known up front, so the result is allocated once. The literals " " and "!" already live in the pool.',
      wrong: { 1: 'That would happen if each + ran separately. The compiler folds the chain into one Concat.' }
    },
    {
      t: 'learn',
      title: 'StringBuilder inside',
      body: '<p><code>StringBuilder</code> keeps text in mutable pieces — <b>chunks</b>, which are <code>char[]</code> arrays. The default initial capacity is 16 characters. When it runs out of room, it does not copy the old text into a bigger array; it adds a new chunk and links it to the previous one. So a long build never rewrites what it has already collected.</p><p><code>ToString()</code> allocates the result string and copies all chunks into it.</p><p>The cost: the StringBuilder object, its chunks and the final copy. For two or three parts that is more than one Concat. A builder pays off when there are many parts or their number is unknown in advance — loops, conditions, recursive walks.</p>',
      code: 'var sb = new StringBuilder(capacity: 256); // know the size — say so\nforeach (var row in rows)\n    sb.Append(row.Id).Append(\';\').AppendLine(row.Name);\nstring csv = sb.ToString();',
      deep: '<p>In .NET Framework 4.0 StringBuilder was reworked from "a string you append to" into a linked list of chunks; a new chunk is at most 8000 characters, so the arrays stay out of the large object heap. The chain is stored from the last chunk back to the first, so <code>sb[i]</code> near the start of a long builder walks the list backwards — its indexer is not O(1). If you need to read and change text by index many times, work with a <code>char[]</code> or a <code>Span&lt;char&gt;</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Where is StringBuilder really needed? Select all.',
      options: ['Building a report line by line in a loop over a collection of unknown length', 'string full = name + " " + surname;', 'Building a CSV with 10,000 rows', 'Joining a list with commas when string.Join is available'],
      answer: [0, 2],
      explain: 'A fixed concatenation is one Concat. string.Join computes the length itself and allocates the string once. A builder is needed where there are many parts and they show up as the work goes on.'
    },
    {
      t: 'learn',
      title: 'Interpolation: a handler instead of Format',
      body: '<p>Before C# 10, <code>$"Order {id}: {total}"</code> became <code>string.Format</code>: arguments went into an <code>object[]</code>, numbers were boxed, and the format string was parsed on every call.</p><p>Since C# 10 and .NET 6 the compiler expands interpolation into calls on a <b>handler</b>, <code>DefaultInterpolatedStringHandler</code>. It is a <code>ref struct</code> on the stack. It rents a buffer from <code>ArrayPool&lt;char&gt;</code>, writes literals and values into it, creates one string at the end and returns the buffer to the pool.</p><p><code>AppendFormatted&lt;T&gt;</code> is generic, so an <code>int</code> is not boxed. If the type implements <code>ISpanFormattable</code> (numbers, dates, Guid), it formats itself straight into the buffer, with no temporary string.</p>',
      code: '// the compiler turns $"Order {id}: {total}" into:\nvar h = new DefaultInterpolatedStringHandler(8, 2);\nh.AppendLiteral("Order ");\nh.AppendFormatted(id);\nh.AppendLiteral(": ");\nh.AppendFormatted(total);\nstring s = h.ToStringAndClear();',
      deep: '<p>The first two constructor arguments are the total length of the literals (here 6 + 2 = 8) and the number of holes; the handler uses them to size its initial buffer. If every hole is a string, the compiler just uses <code>string.Concat</code>.</p><p>Other methods accept the same mechanism: <code>StringBuilder.Append($"...")</code> writes straight into the builder through its own handler, and <code>Debug.Assert(cond, $"...")</code> does not format the message at all when the condition is true. A custom handler is marked with the <code>[InterpolatedStringHandler]</code> attribute.</p>'
    },
    {
      t: 'order',
      q: 'Put in order the calls the compiler generates for $"Hi {name}, you are {age}" (age is an int)',
      items: ['new DefaultInterpolatedStringHandler(13, 2)', 'AppendLiteral("Hi ")', 'AppendFormatted(name)', 'AppendLiteral(", you are ")', 'AppendFormatted(age)', 'ToStringAndClear()'],
      explain: 'First the handler with the literal length (3 + 10 = 13) and the number of holes, then literals and values left to right, and finally one result string. The buffer goes back to ArrayPool.'
    },
    {
      t: 'learn',
      title: 'string.Create: write straight into a new string',
      body: '<p>A string is immutable for everyone who can <b>see</b> it. Until anyone has seen it, writing is fine. That is the idea behind <code>string.Create(length, state, action)</code>: the runtime allocates a string of the right length and hands you a <code>Span&lt;char&gt;</code> over its characters. You fill it in, and the string goes out already finished.</p><p>No intermediate buffers or copies: one allocation. Pass data through <code>state</code> and make the lambda <code>static</code> so no closure is created.</p><p>There is a second form — <code>string.Create(IFormatProvider, $"...")</code>: interpolation with a given culture and no extra strings.</p>',
      code: 'string Hex(byte[] data) =>\n    string.Create(data.Length * 2, data, static (span, bytes) =>\n    {\n        for (int i = 0; i < bytes.Length; i++)\n            bytes[i].TryFormat(span[(i * 2)..], out _, "x2");\n    });',
      deep: '<p>For hexadecimal in particular there is already <code>Convert.ToHexString</code> (.NET 5) and <code>ToHexStringLower</code> (.NET 9); inside they work the same way. Another option for short strings is to build the text in a <code>stackalloc char[]</code> and call <code>new string(span)</code>: also one allocation, but with a copy from the stack.</p>'
    },
    {
      t: 'blanks',
      q: 'Mask a card number, keeping the last four digits, with one allocation',
      code: 'string Mask(string card) =>\n    string.___(card.Length, card, static (span, src) =>\n    {\n        src.AsSpan().CopyTo(span);\n        span[..^4].___(\'*\');\n    });',
      tiles: ['Create', 'Fill', 'Concat', 'Clear', 'Copy'],
      answer: ['Create', 'Fill'],
      explain: 'string.Create allocates the string and gives a Span over its characters. CopyTo moves the number in, Fill paints over everything except the last four. What comes out is an already finished string.'
    },
    {
      t: 'learn',
      title: 'UTF-8 literals',
      body: '<p>.NET strings are UTF-16, while the network, HTTP, JSON and files are almost always UTF-8. You used to get the bytes like this: <code>Encoding.UTF8.GetBytes("...")</code> — a new array per call — or by keeping a <code>static readonly byte[]</code>.</p><p>Since C# 11 there is the <code>u8</code> suffix. The compiler encodes the literal as UTF-8 at build time and puts the bytes into the assembly\'s data section. The expression <code>"HTTP/1.1"u8</code> has type <code>ReadOnlySpan&lt;byte&gt;</code> and points straight at those bytes: no allocation at all.</p><p>Limits: it is not a constant (not allowed in <code>const</code> or as a parameter default), there is no interpolation, and <code>.ToArray()</code> creates a heap array. Two u8 literals can be joined with <code>+</code> — that is done at build time too.</p>',
      code: 'ReadOnlySpan<byte> crlf = "\\r\\n"u8;\nReadOnlySpan<byte> get = "GET "u8 + "/"u8;\nstream.Write("HTTP/1.1 200 OK"u8);'
    },
    {
      t: 'choice',
      q: 'What is the type of the expression "ok"u8?',
      options: ['ReadOnlySpan<byte>', 'byte[]', 'string', 'Span<byte>'],
      answer: 0,
      explain: 'A read-only span over bytes in the assembly data. A byte[] would have to be allocated on the heap, and a Span<byte> would let you corrupt shared data.',
      wrong: { 3: 'A Span<byte> would let you write into the literal bytes shared by the whole program. That is why it is read-only.' }
    },
    {
      t: 'learn',
      title: 'Interpolation remembers the culture',
      body: '<p>The interpolation handler formats values using the <b>current culture</b>, just like <code>ToString()</code>. On a German machine <code>$"{1.5}"</code> gives "1,5", and a date comes out in the local format. For text on screen that is right. For JSON, logs, SQL and file names it is a bug that shows up only for some users.</p><p>For machine text set the culture explicitly:</p><ul><li><code>value.ToString(CultureInfo.InvariantCulture)</code>;</li><li><code>string.Create(CultureInfo.InvariantCulture, $"...")</code> — interpolation with a culture and no extra allocations;</li><li>there is also the older <code>FormattableString.Invariant($"...")</code>, but it creates a FormattableString object and boxes the arguments.</li></ul>',
      deep: '<p>The analyzer <b>CA1305</b> flags formatting calls without an <code>IFormatProvider</code>. In projects where all text is machine text, the simplest fix is to turn on <code>InvariantGlobalization</code> — then every culture behaves like the invariant one.</p>'
    },
    {
      t: 'tapline',
      q: 'The program runs with the de-DE culture. Which line gives "1,5" instead of "1.5"?',
      code: 'double price = 1.5;\nstring a = price.ToString(CultureInfo.InvariantCulture);\nstring b = $"{price}";\nstring c = string.Create(CultureInfo.InvariantCulture, $"{price}");\nstring d = "1.5";',
      answer: 2,
      explain: 'Interpolation without a provider uses the current culture, and German separates the fraction with a comma. The lines with InvariantCulture give a dot on any machine.'
    }
  ]
};
