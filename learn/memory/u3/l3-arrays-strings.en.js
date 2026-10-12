/** Memory in .NET, unit "Inside the heap", lesson 3: arrays and strings in memory. */
export default {
  id: 'mem.u3.l3',
  title: 'Arrays and strings',
  sub: 'The length inside the object, the terminator and the cost of small strings',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'An array: the length before the elements',
      body: '<p>An array is a variable-size object. After the type pointer comes the <b>length</b>: a 4-byte <code>int</code> and, on x64, 4 more bytes of padding. Right after them come the elements, back to back, with no gaps.</p><ul><li><code>new byte[0]</code> — 24 bytes: header, type, length;</li><li><code>new byte[10]</code> — 24 + 10 = 34 → <b>40</b>;</li><li><code>new int[4]</code> — 24 + 16 = <b>40</b>;</li><li><code>new object[3]</code> — 24 + 3 × 8 = <b>48</b>: the slots hold references, the objects themselves live elsewhere.</li></ul><p>The element type is not stored in the object: <code>int[]</code> and <code>string[]</code> have their own MethodTables, and the element size (ComponentSize) is recorded there too.</p>',
      code: '// new int[4] in memory, x64:\n// ref - 8      header\n// ref + 0      pointer to the MethodTable of int[]\n// ref + 8      length = 4 (int) + 4 bytes of padding\n// ref + 16     [0] [1] [2] [3] — 4 bytes each',
      deep: '<p>In the runtime this is <code>ArrayBase</code> from <code>object.h</code>: the <code>m_NumComponents</code> field and, on a 64-bit platform, <code>pad</code>. The length is 32-bit, so there are at most <code>Array.MaxLength</code> elements (2,147,483,591, .NET 6+). The array can still exceed 2 GB in bytes: modern .NET allows large objects on 64-bit by default, while .NET Framework needed <code>gcAllowVeryLargeObjects</code>.</p>'
    },
    {
      t: 'choice',
      q: 'How many bytes does new long[3] take on x64?',
      options: ['48', '40', '24', '56'],
      answer: 0,
      explain: '24 bytes of bookkeeping (header, type, length with padding) plus 3 × 8 bytes of elements — 48.',
      wrong: { 1: 'That is 16 + 24: you forgot the 8 bytes for the length.', 2: 'The elements live inside the array object, not separately.' }
    },
    {
      t: 'learn',
      title: 'Multidimensional and jagged',
      body: '<p><code>int[2, 3]</code> is <b>one</b> object. After the total length (6) it stores the length of each dimension and the lower bounds, and then all 6 elements back to back, row by row. In total 16 + 8 + 8 + 8 + 24 = <b>64 bytes</b>.</p><p><code>int[2][]</code> with two rows of 3 is <b>three</b> objects: an outer array of references (40 bytes) and two 40-byte arrays somewhere in the heap. 120 bytes in total, plus an extra hop through a reference on every access.</p>',
      code: 'var grid = new int[2, 3];   // 1 object, 64 bytes\n\nvar rows = new int[2][];    // 40 bytes: two references\nrows[0] = new int[3];       // + 40 bytes\nrows[1] = new int[3];       // + 40 bytes',
      deep: '<p>A one-dimensional array with a zero lower bound (an SZ array in CLR terms) has its own IL instructions <code>ldelem</code>/<code>stelem</code>, and in simple loops the JIT often removes the bounds check. Access to a multidimensional array goes through the array type\'s <code>Get</code>/<code>Set</code>/<code>Address</code> methods; since .NET 7 the JIT expands them into direct code, but every index is still checked against its lower bound.</p>'
    },
    {
      t: 'match',
      q: 'Match the expression to the object size on x64',
      pairs: [
        ['new byte[0]', '24 bytes'],
        ['new string(\'a\', 3)', '32 bytes'],
        ['new byte[10]', '40 bytes'],
        ['new object[3]', '48 bytes'],
        ['new int[2, 3]', '64 bytes']
      ]
    },
    {
      t: 'learn',
      title: 'A string: length, characters and a zero at the end',
      body: '<p>A string also keeps its length inside: after the type pointer there is an <code>int</code> with the character count, followed by the UTF-16 characters, 2 bytes each. And after the last character the CLR puts one more: the <b>null terminator</b> <code>\'\\0\'</code>. It is not counted in <code>Length</code>.</p><p>The base size of a string is 8 + 8 + 4 + 2 = <b>22 bytes</b> (header, type, length, terminator). Then 2 bytes per character and rounding to 8:</p><ul><li><code>"a"</code> — 22 + 2 = 24;</li><li><code>"abc"</code> — 22 + 6 = 28 → 32;</li><li><code>"hello"</code> — 22 + 10 = 32.</li></ul>',
      deep: '<p>In the runtime this is <code>StringObject</code>: the fields <code>m_StringLength</code> and <code>m_FirstChar</code>. Strings and arrays are the only variable-size objects: their MethodTable has a non-zero ComponentSize. A string in memory is always UTF-16. A UTF-8 literal <code>"..."u8</code> from C# 11 is not a string but a <code>ReadOnlySpan&lt;byte&gt;</code> over data in the assembly itself; it creates no heap object.</p>'
    },
    {
      t: 'choice',
      q: 'How many heap bytes does new string(\'x\', 0) allocate?',
      options: ['0 — it returns string.Empty', '22', '24', '32'],
      answer: 0,
      explain: 'For a zero length the constructor returns the ready-made empty string and allocates nothing. Likewise Substring(0) and ToString() on a string return the string itself.',
      wrong: { 2: 'That is what an empty string would weigh if one were actually created. But there is only one empty string in the process.' }
    },
    {
      t: 'learn',
      title: 'The cost of small strings',
      body: '<p>Let us count a million distinct strings of 10 Latin characters — keys from a file, say.</p><ul><li>each string: 22 + 20 = 42 → <b>48 bytes</b>;</li><li>a million strings — <b>48 MB</b>;</li><li>a <code>string[]</code> holding them — another <b>8 MB</b> of references.</li></ul><p>The useful text is 10 MB in ASCII. The rest is UTF-16 (twice the bytes for Latin text), the bookkeeping of every object and alignment. With millions of strings this is where most of the memory goes. Remedies: do not keep several copies of equal strings, store data as UTF-8 in a <code>byte[]</code>, parse input through <code>Span&lt;char&gt;</code> without creating substrings.</p>',
      deep: '<p>For deduplication, use your own pool on a <code>HashSet&lt;string&gt;</code> or a <code>Dictionary</code> with lookup by <code>ReadOnlySpan&lt;char&gt;</code> via <code>GetAlternateLookup</code> (.NET 9): a string is created only if there is no such one yet. <code>string.Intern</code> is worse for this: interned strings live until the process ends.</p>'
    },
    {
      t: 'choice',
      q: 'Roughly how much memory does a string[] with a million distinct 10-character strings take?',
      options: ['About 56 MB', 'About 20 MB', 'About 10 MB', 'About 28 MB'],
      answer: 0,
      explain: 'Each string is 48 bytes (22 + 20, rounded to 8), a million strings is 48 MB, plus 8 MB of references in the array.',
      wrong: { 1: 'That is just the characters in UTF-16. You forgot the bookkeeping of every string and the array of references.', 2: 'That is what the text would weigh in a single-byte encoding without a single object.' }
    },
    {
      t: 'learn',
      title: 'Why the terminator',
      body: '<p>Native APIs (Win32, libc) expect a string with a zero at the end. Thanks to the terminator .NET can hand them a string <b>without copying</b>: <code>fixed</code> pins the string and gives a pointer to the first character, and a zero already sits after the last one.</p><p>The marshaller does the same for <code>LPWStr</code> parameters: it passes a pointer straight into the string if the string does not need to change. The trap: a .NET string may contain <code>\'\\0\'</code> inside — for C# it is an ordinary character, but native code sees the end of the string there.</p>',
      code: 'string s = "hello";\nunsafe\n{\n    fixed (char* p = s)   // pinned, no copy\n    {\n        // p[0] == \'h\', p[5] == \'\\0\' — the terminator\n    }\n}',
      deep: '<p>Never write into a string through such a pointer: strings are immutable, and literals are also shared by the whole process (interned). For a buffer that native code will fill, use a <code>char[]</code>, a <code>Span&lt;char&gt;</code> from <code>stackalloc</code>, or <code>string.Create</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line allocates a new heap object every time it runs?',
      code: 'string a = "abc";\nstring b = new string(\'x\', 0);\nstring c = a.Substring(0);\nstring d = a.Substring(1);\nstring e = a.ToString();',
      answer: 3,
      explain: 'A literal is created once per process. The empty string is the ready-made string.Empty. Substring(0) and ToString() return the same string. But Substring(1) copies "bc" into a new 32-byte object.'
    },
    {
      t: 'multi',
      q: 'What is true about arrays and strings in CoreCLR? Select all.',
      options: ['The length is stored inside the object, before the elements', 'A \'\\0\' sits after the last character of a string, and Length does not count it', 'int[2, 3] stores the dimension lengths and lower bounds in the object itself', 'An int[][] with two rows is a single heap object', 'A string stores its text in UTF-8'],
      answer: [0, 1, 2],
      explain: 'A jagged array is an outer array of references plus one object per row. The text of a string in memory is always UTF-16.'
    },
    {
      t: 'blanks',
      q: 'Complete the string size formula for x64',
      code: 'static long StringSize(int length) =>\n    (___ + 2L * length + 7) & ~7L;  // round up to 8',
      tiles: ['22', '24', '16', '20'],
      answer: ['22'],
      explain: '22 = 8 bytes of header + 8 of type pointer + 4 of length + 2 of terminator. For "abc": 22 + 6 = 28 → 32.'
    }
  ]
};
