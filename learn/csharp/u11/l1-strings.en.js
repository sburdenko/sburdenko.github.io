/** Deeper C#, unit "Strings, enums, arrays", lesson 1: a string in memory, interning and comparison. */
export default {
  id: 'cs.u11.l1',
  title: 'Strings inside and comparison',
  sub: 'Heap layout, the literal pool, ordinal versus culture and the Turkish i',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What sits on the heap',
      body: '<p>You already know strings are immutable. Now let us look at how one is built. A <code>string</code> object is a header, a type pointer, a length field (<code>int</code>) and, right after it, the characters in UTF-16, 2 bytes per <code>char</code>. The CLR puts a null character at the end, so the string can be handed to native code without copying.</p><p>The length lives in the object and so do the characters — apart from arrays, it is the only variable-size type. That is why a string cannot "grow in place": any operation that changes the text allocates a new object and copies characters.</p><p>Immutability pays off later: a string can be shared between threads without locks, used as a dictionary key, and identical text can be stored once.</p>',
      code: 'string s = "abc";\n// [header 8][type pointer 8][length 4]\n// [\'a\' 2][\'b\' 2][\'c\' 2][\'\\0\' 2]\n// 28 bytes, aligned to 8: 32',
      deep: '<p>In the runtime sources this is the <code>String</code> class with fields <code>_stringLength</code> and <code>_firstChar</code>: the address of the first character is just the address of that field. That is how <code>fixed (char* p = s)</code> and <code>MemoryMarshal.GetReference(s.AsSpan())</code> work.</p><p>Starting with .NET 8, string literals are usually allocated in a separate heap the collector does not walk (the NonGC heap). Such an object never moves, so the JIT embeds its address straight into machine code instead of loading it through a table.</p>'
    },
    {
      t: 'choice',
      q: 'How many bytes does the string "abc" take on the heap in a 64-bit process?',
      options: ['32', '6', '24', '28'],
      answer: 0,
      explain: '16 bytes of bookkeeping, 4 bytes of length, 3 × 2 bytes of characters and 2 bytes of the null character — 28. Objects are aligned to 8 bytes, which gives 32.',
      wrong: { 1: '6 bytes is just the characters. A string is an object with a header, a type pointer and a length.', 3: '28 is the sum of the fields, but on x64 the object size is rounded up to a multiple of 8.' }
    },
    {
      t: 'learn',
      title: 'Interning: what goes into the pool',
      body: '<p>The IL instruction <code>ldstr</code> loads a literal. The CLR guarantees that identical literals across the whole process are <b>one object</b>, even when they live in different assemblies. For that the runtime keeps an intern pool — a hash table from text to string.</p><p>The compiler folds constants itself: <code>"hel" + "lo"</code> becomes a single literal <code>"hello"</code> at build time (constant folding).</p><p>Strings built at run time do not go into the pool. You can put them there with <code>string.Intern(s)</code>: it returns the pooled string, adding it if it is not there yet.</p>',
      code: 'string a = "hello";\nstring b = "hel" + "lo";           // one literal\nstring c = "hel" + Console.ReadLine(); // a heap string\nstring d = string.Intern(c);       // from the pool',
      deep: '<p>The cost of <code>Intern</code>: a hash over the whole text and a lookup in a shared runtime table. Pooled strings live until the process ends — the collector never frees them. Interning arbitrary input (names from requests, lines from a file) is a way to build a memory leak.</p><p>If you need to deduplicate repeated strings, say while parsing a large CSV, use your own dictionary or <code>HashSet&lt;string&gt;</code> that you can drop later. <code>string.IsInterned(s)</code> checks whether the text is pooled without adding it.</p>'
    },
    {
      t: 'multi',
      q: 'The user typed "lo". Which expressions return true? Select all.',
      code: 'string a = "hello";\nstring b = "hel" + "lo";\nstring c = "hel" + Console.ReadLine();\nstring d = string.Intern(c);',
      options: ['ReferenceEquals(a, b)', 'ReferenceEquals(a, c)', 'ReferenceEquals(a, d)', 'ReferenceEquals(c, d)'],
      answer: [0, 2],
      explain: 'b is the same literal after constant folding. c is built at run time — a new object. Intern found the literal "hello" in the pool and returned it, so d is a, not c.'
    },
    {
      t: 'learn',
      title: 'Two ways to compare strings',
      body: '<p><b>Ordinal</b> comparison goes by UTF-16 code units, one character at a time. It is fast and predictable: the result does not depend on the machine.</p><p><b>Linguistic</b> (culture-sensitive) comparison applies language rules: "ß" and "ss" may compare equal, accented letters sort next to plain ones, invisible characters are ignored. The rules come from the ICU library (on Linux, macOS and recent Windows) or from NLS (on older Windows).</p><p>The catch is in the defaults:</p><ul><li><code>==</code>, <code>Equals</code>, <code>Contains</code>, <code>Replace</code>, <code>IndexOf(char)</code> — ordinal;</li><li><code>CompareTo</code>, <code>string.Compare</code>, <code>StartsWith(string)</code>, <code>EndsWith(string)</code>, <code>IndexOf(string)</code>, <code>ToUpper()</code>, <code>ToLower()</code> — by the thread\'s <b>current culture</b>.</li></ul>',
      deep: '<p>Sorting is linguistic too: <code>List&lt;string&gt;.Sort()</code> and <code>OrderBy(s =&gt; s)</code> go through <code>Comparer&lt;string&gt;.Default</code>, that is, through <code>CompareTo</code>. The analyzers <b>CA1307</b> and <b>CA1310</b> flag calls where the comparison mode is not explicit, and <b>CA1309</b> suggests ordinal.</p>'
    },
    {
      t: 'match',
      q: 'Match the StringComparison value with what it does',
      pairs: [
        ['Ordinal', 'Compares UTF-16 code units one to one'],
        ['OrdinalIgnoreCase', 'Code units, case folded without language rules'],
        ['CurrentCulture', 'Language rules of the current thread'],
        ['InvariantCulture', 'Language rules that are the same on every machine'],
        ['CurrentCultureIgnoreCase', 'Thread language, case does not matter']
      ]
    },
    {
      t: 'learn',
      title: 'The Turkish i',
      body: '<p>Turkish has two letters i: dotted (i → <b>İ</b>) and dotless (ı → <b>I</b>). So in the tr-TR culture <code>"i".ToUpper()</code> gives "İ" (U+0130), not the Latin "I".</p><p>Code that compares commands, keys or header names through <code>ToUpper()</code> breaks on a Turkish machine. There is no error — the comparison just quietly returns false.</p><p>The rule: compare <b>identifiers</b> (keys, protocols, paths, config names) ordinally — <code>StringComparison.OrdinalIgnoreCase</code> or <code>ToUpperInvariant()</code>. Compare <b>text for humans</b> (sorting names in the UI) by culture.</p>',
      code: 'CultureInfo.CurrentCulture = new CultureInfo("tr-TR");\n\n"file".ToUpper();           // "FİLE"\n"file".ToUpperInvariant();  // "FILE"\n"file".Equals("FILE",\n    StringComparison.OrdinalIgnoreCase); // true'
    },
    {
      t: 'choice',
      q: 'The server runs with the tr-TR culture. A client sends the command "quit". What happens?',
      code: 'if (cmd.ToUpper() == "QUIT")\n    Stop();',
      options: ['Stop is not called: ToUpper returns "QUİT"', 'Stop is called: == ignores case', 'It throws CultureNotFoundException', 'Stop is called: ToUpper always uses Latin letters'],
      answer: 0,
      explain: 'ToUpper() with no arguments uses the current culture, and i turns into İ. Then == honestly compares code units — and they differ. The reliable way: cmd.Equals("quit", StringComparison.OrdinalIgnoreCase).',
      wrong: { 1: '== on strings is ordinal and case-sensitive.' }
    },
    {
      t: 'learn',
      title: 'ICU surprises since .NET 5',
      body: '<p>Before .NET 5, linguistic comparison on Windows went through NLS — the Windows library. Since .NET 5, <b>ICU</b> is used wherever it is available. Its Unicode rules are stricter, and old code started behaving differently.</p><p>The best-known example is .NET 5: for ICU the pair <code>\\r\\n</code> was one indivisible text element, and a culture-sensitive <code>"\\r\\n".IndexOf("\\n")</code> returned -1. .NET 6 fixed that behavior, but the lesson stays: the result of a linguistic search depends on the runtime and library version.</p><p>What still holds: linguistic comparison skips zero-width characters and <code>\\0</code>, so <code>s.IndexOf("\\0")</code> returns 0 for any string. Meanwhile <code>IndexOf(\'\\0\')</code> with a char is ordinal and honestly returns -1.</p>',
      deep: '<p>If the app does not need language rules, build it with <code>&lt;InvariantGlobalization&gt;true&lt;/InvariantGlobalization&gt;</code>: ICU is not loaded, and linguistic operations become ordinal. By default no culture other than the invariant one can be created in this mode: since .NET 8 <code>new CultureInfo("de-DE")</code> throws <code>CultureNotFoundException</code>. This is the usual choice for containers and Native AOT — smaller size and no libicu dependency. You can bring NLS back on Windows with the <code>System.Globalization.UseNls</code> setting, but that is a migration aid, not a path for new code.</p>'
    },
    {
      t: 'tapline',
      q: '.NET 9 on Linux (ICU), culture en-US. The string has no \\0 character. Which line still returns 0?',
      code: 'string s = "line1\\r\\nline2";\nint a = s.IndexOf(\'\\0\');\nint b = s.IndexOf("\\0");\nint c = s.IndexOf("\\0", StringComparison.Ordinal);\nbool d = s.Contains("\\0");',
      answer: 2,
      explain: 'IndexOf(string) without a StringComparison is linguistic, and ICU skips \\0: nothing is left of the pattern, so it is "found" at the very start. IndexOf(char), Contains and explicit Ordinal compare code units: they give -1 and false.'
    },
    {
      t: 'learn',
      title: 'Dictionaries, hashes and sorting',
      body: '<p>Dictionary keys are compared through an <code>IEqualityComparer&lt;string&gt;</code>. By default that is ordinal and case-sensitive. Need another mode — pass a comparer to the constructor: <code>StringComparer.OrdinalIgnoreCase</code>. That is faster than upper-casing every key: no new strings are created.</p><p>To sort a list of names for the UI use <code>StringComparer.CurrentCulture</code>; for a stable order in a file or protocol use <code>StringComparer.Ordinal</code>.</p>',
      code: 'var headers = new Dictionary<string, string>(\n    StringComparer.OrdinalIgnoreCase);\nheaders["Content-Type"] = "text/html";\nheaders["content-type"];  // found\n\nnames.Sort(StringComparer.Ordinal);',
      deep: '<p><code>string.GetHashCode()</code> in .NET Core and .NET 5+ is <b>randomized</b>: the same string gets a different hash in different runs of the process (the Marvin algorithm with a random seed). This protects hash tables from collision-flooding attacks. In .NET Framework the default hash was stable, and old code sometimes saved it to a file or a database — after migration such code breaks. Never store a string hash outside the process.</p>'
    },
    {
      t: 'blanks',
      q: 'Make the header dictionary case-insensitive and the key culture-independent',
      code: 'var map = new Dictionary<string, int>(\n    StringComparer.___);\nstring key = header.ToUpper___();',
      tiles: ['OrdinalIgnoreCase', 'Invariant', 'CurrentCulture', 'Ordinal', 'Culture'],
      answer: ['OrdinalIgnoreCase', 'Invariant'],
      explain: 'StringComparer.OrdinalIgnoreCase compares without case and without language rules. ToUpperInvariant changes case the same way on every machine — the Turkish i will not get in the way.'
    }
  ]
};
