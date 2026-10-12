/** Deeper C#, final of the unit "Strings, enums, arrays". */
export default {
  id: 'cs.u11.boss',
  title: 'Final: strings, enums, arrays',
  sub: 'String comparison, allocation-free building, flags, covariance and int?',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'multi',
      q: 'Which calls compare using the current culture by default? Select all.',
      options: ['a.StartsWith("id")', 'string.Compare(a, b)', 'a == b', 'a.Contains("id")', 'names.Sort() on a List<string>'],
      answer: [0, 1, 4],
      explain: '== and Contains are ordinal. StartsWith(string), Compare and sorting through Comparer<string>.Default use the thread culture, and with ICU or tr-TR the result can surprise you.'
    },
    {
      t: 'choice',
      q: 'A cache key is built as url.ToLower(). On servers with the tr-TR culture some requests miss the cache. Which fix is right?',
      options: ['url.ToLowerInvariant() or a dictionary with StringComparer.OrdinalIgnoreCase', 'string.Intern(url.ToLower())', 'Replace ToLower with ToUpper', 'Compare keys with string.Compare(a, b, true)'],
      answer: 0,
      explain: 'In tr-TR "I" turns into the dotless "ı", and the keys drift apart. Identifiers are compared without language rules. Intern does not change the text, ToUpper breaks on the same letter, and Compare with ignoreCase still depends on the culture.',
      wrong: { 3: 'The Compare(a, b, ignoreCase) overload still uses the current culture.' }
    },
    {
      t: 'choice',
      q: 'id is an int, name is a string. What does C# 12 turn $"{id}: {name}" into?',
      options: ['DefaultInterpolatedStringHandler: AppendFormatted(id) without boxing, one result string', 'string.Format with an object[] and boxing of id', 'A StringBuilder with three Append calls', 'string.Concat(id, ": ", name) with boxing of id'],
      answer: 0,
      explain: 'Since C# 10 and .NET 6 interpolation goes through a ref struct handler with a buffer from ArrayPool. AppendFormatted<T> is generic, so the int is written straight into the buffer. string.Format was the pre-C# 10 way.'
    },
    {
      t: 'match',
      q: 'Match the construct with what is behind it',
      pairs: [
        ['"hel" + "lo"', 'One literal at build time'],
        ['"GET "u8', 'ReadOnlySpan<byte> over assembly data'],
        ['arr[i] = x in an Animal[]', 'A type check on every store'],
        ['p.HasFlag(f) in .NET 8', 'Same as (p & f) == f'],
        ['object o = (int?)5', 'A box with Int32']
      ]
    },
    {
      t: 'choice',
      q: 'enum Light { Red, Yellow, Green }. A method is a switch expression with arms for the three names and no _. What happens on Act((Light)7)?',
      options: ['SwitchExpressionException; the compiler warned with CS8524 in advance', 'It returns null', 'It does not compile: (Light)7 is out of range', 'The Green arm runs as the last one'],
      answer: 0,
      explain: 'An enum is the whole int range; the names are just points in it. The compiler warns about unnamed values, and the generated code throws SwitchExpressionException when no arm matches.'
    },
    {
      t: 'blanks',
      q: 'A default value without an exception, and parsing with a check that the member is declared',
      code: 'int? n = TryReadAge();\nint age = n.___();\n\nbool ok = Enum.___<Color>(text, out var c)\n    && Enum.IsDefined(c);',
      tiles: ['GetValueOrDefault', 'Value', 'TryParse', 'Parse', 'HasValue'],
      answer: ['GetValueOrDefault', 'TryParse'],
      explain: '.Value throws InvalidOperationException when there is no value. TryParse also accepts "42", so the IsDefined after it is not redundant.'
    },
    {
      t: 'multi',
      q: 'What is true about arrays? Select all.',
      options: ['Rows of a jagged array can have different lengths', 'int[,] is a single heap object', 'object[] o = new int[3]; compiles', '[InlineArray] works only in unsafe code', 'int[] a = []; does not create a new array'],
      answer: [0, 1, 4],
      explain: 'Only arrays of reference types are covariant. InlineArray is the safe alternative to a fixed buffer. An empty collection expression for an array is the shared Array.Empty<int>().'
    },
    {
      t: 'tapline',
      q: 'Which line throws at run time?',
      code: 'string[] names = { "a", "b" };\nobject[] objs = names;\nobjs[0] = "c";\nobjs[1] = null;\nReadOnlySpan<object> ro = objs;\nSpan<object> span = objs;',
      answer: 5,
      explain: 'Storing a string and null into a string[] is legal. A ReadOnlySpan does not allow writes, so covariance does not hurt it. A Span<object> could write a non-string there — its constructor sees that the array is really a string[] and throws ArrayTypeMismatchException.'
    },
    {
      t: 'choice',
      q: 'Public library: enum Level { Low, High }. In v2 they want to add Medium, which logically sits between them. How do you avoid breaking consumers that are already built?',
      options: ['Keep Low = 0, High = 1 and add Medium = 2 at the end', 'Insert Medium in the middle: the names did not change', 'Turn Level into a class with static fields', 'Mark the enum with [Flags]'],
      answer: 0,
      explain: 'Consumers keep numbers in their IL, not names. Inserting in the middle moves High from 1 to 2, and old code starts mixing up levels. New members go only at the end, with explicit values.'
    }
  ]
};
