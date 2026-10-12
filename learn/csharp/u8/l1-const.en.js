/** Deeper C#, unit "Type members and versioning", lesson 1: const versus static readonly and the "version 2" scenario. */
export default {
  id: 'cs.u8.l1',
  title: 'const and static readonly',
  sub: 'A constant is baked into the calling assembly, and version 2 makes it visible',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Two "constants" of different nature',
      body: '<p><code>const</code> is a value the compiler knows. It is stored in metadata as a literal, and such a field has no storage in memory. A <code>const</code> is always static: you cannot write <code>static const</code>.</p><p><code>static readonly</code> is an ordinary static field. An initializer or the static constructor fills it at run time, and code reads it at run time. You can assign it only during type initialization.</p><p>That gives the first difference: <code>const</code> accepts only numbers, <code>bool</code>, <code>char</code>, <code>string</code>, <code>decimal</code>, enums and <code>null</code>. <code>DateTime</code>, arrays, <code>TimeSpan</code> need <code>static readonly</code>.</p>',
      code: 'public static class Limits\n{\n    public const int MaxItems = 100;               // a literal in metadata\n    public static readonly int MaxUsers = 100;     // a field, read at run time\n    public static readonly DateTime Start = DateTime.UtcNow;\n    // public const DateTime Bad = ...;            // CS0283: not allowed\n}'
    },
    {
      t: 'learn',
      title: 'What the compiler writes at the call site',
      body: '<p>Look at the IL of code that reads both values. For the constant the compiler <b>substitutes the number</b> right into the calling method: the instruction <code>ldc.i4.s 100</code>. There is no reference to the <code>MaxItems</code> field in that code at all.</p><p>For <code>static readonly</code> the IL has <code>ldsfld</code>, "load static field". The value comes from the owning assembly on every run.</p><p>Substitution is both a plus and a minus. The plus: you can use a constant wherever a compile-time value is required. The minus is on the next card.</p>',
      code: '// C#\nConsole.WriteLine(Limits.MaxItems);\nConsole.WriteLine(Limits.MaxUsers);\n\n// IL of the calling code\nldc.i4.s   100                       // the number is baked in here\ncall       void Console::WriteLine(int32)\nldsfld     int32 Limits::MaxUsers    // a field read\ncall       void Console::WriteLine(int32)',
      deep: '<p>A string constant becomes <code>ldstr "..."</code> and lands in the string heap of the calling assembly. <code>const decimal</code> works differently: the CLR cannot store a decimal as a literal, so the field is marked with <code>DecimalConstantAttribute</code>, and at the call site the compiler builds the value through a <code>decimal</code> constructor. The substitution still happens.</p><p>Since there is no field reference, the source assembly is not needed at run time for that line. If code takes only constants from a library, the runtime may never load it at all.</p>'
    },
    {
      t: 'choice',
      q: 'Which IL instruction does the compiler emit at the call site to read public static readonly string Name?',
      options: ['ldsfld string Config::Name', 'ldstr with the string value', 'call string Config::get_Name()', 'ldc.i4 with the string address'],
      answer: 0,
      explain: 'static readonly is an ordinary field, read with ldsfld at run time. An ldstr with the ready value would be emitted for a const string.',
      wrong: { 1: 'That is what the compiler does for a const string: the value is baked in. It leaves static readonly alone.', 2: 'get_Name is a property accessor. This is a field, not a property.' }
    },
    {
      t: 'learn',
      title: 'Version 2: the library is updated, the app is not',
      body: '<p>The scenario this whole lesson is about. Library <code>Shop.Core.dll</code> version 1 declares <code>MaxItems = 100</code> and <code>MaxUsers = 100</code>. The app is compiled against it.</p><p>Version 2 ships: both values become 200. The new dll is dropped next to the app, and the app itself is <b>not recompiled</b>. That happens with plugins, shared packages, hotfixes.</p><ul><li><code>MaxUsers</code> is 200: the app reads the field from the new assembly.</li><li><code>MaxItems</code> is still 100: the number was baked into the app IL at build time.</li></ul><p>Inside the library itself it is already 200. Two parts of one program see different values, with no error at compile time or at run time.</p>',
      code: '// Shop.Core v2\npublic const int MaxItems = 200;\npublic static readonly int MaxUsers = 200;\n\n// App built against v1, running with v2:\nLimits.MaxItems   // 100 — the old value from the app IL\nLimits.MaxUsers   // 200 — read from the new dll'
    },
    {
      t: 'tapline',
      q: 'A plugin was built against Shop.Core v1, where DefaultPageSize = 20. In v2 both values became 50, the plugin was not rebuilt. Which plugin line still works with 20?',
      code: 'public static class Paging\n{\n    public const int DefaultPageSize = 50;\n    public static readonly int MaxPageSize = 50;\n}\n\n// plugin code\nvar max = Paging.MaxPageSize;\nvar size = Paging.DefaultPageSize;\nvar pages = total / max;',
      answer: 8,
      explain: 'DefaultPageSize is a const: when the plugin was built, 20 was written into its IL, and the new dll will not change that. MaxPageSize is read from the field, so it is already 50. The last line divides by max, also 50.'
    },
    {
      t: 'learn',
      title: 'Where a constant is required',
      body: '<p>Some places in the language demand a compile-time value, and <code>static readonly</code> will not pass there:</p><ul><li><code>case</code> labels in a <code>switch</code> and constant patterns (<code>x is Limits.MaxItems</code>);</li><li>attribute arguments: <code>[MaxLength(Limits.MaxItems)]</code>;</li><li>default values of optional parameters: <code>int size = Limits.MaxItems</code>.</li></ul><p>In all of these places the value is baked into the calling code too. A default parameter value lives at the call site on the same principle; more on that in the unit about parameters.</p>',
      code: 'switch (count)\n{\n    case Limits.MaxItems:     // needs a const\n        break;\n}\n\n[StringLength(Limits.MaxItems)]  // an attribute argument is a const too\npublic string Title { get; set; } = "";'
    },
    {
      t: 'multi',
      q: 'Where does static readonly int Max fail to compile? Select all.',
      options: ['case Max: in a switch', '[Range(0, Max)] on a property', 'void Load(int n = Max)', 'var arr = new int[Max];', 'if (x > Max) return;'],
      answer: [0, 1, 2],
      explain: 'case, an attribute argument and a default parameter value require a constant. An array size and a comparison are ordinary expressions; any value works there.'
    },
    {
      t: 'learn',
      title: 'Enums are constants too',
      body: '<p>Every <code>enum</code> member is a <code>const</code> of the underlying numeric type. <code>Status.Paid</code> in calling code turns into a number.</p><p>Version 2 with an enum breaks most quietly. In v1 it was <code>New, Paid, Shipped</code>, that is 0, 1, 2. In v2 someone inserted <code>Pending</code> second, and <code>Paid</code> became 2. The old app writes 1 to the database, meaning Paid, and the new library reads 1 as Pending.</p><p>The rule for public enums: <b>give the numbers explicitly</b> and add new values only at the end.</p>',
      code: '// v1\npublic enum Status { New, Paid, Shipped }               // 0, 1, 2\n\n// v2 — breaks old consumers\npublic enum Status { New, Pending, Paid, Shipped }      // Paid = 2\n\n// This is safe\npublic enum Status { New = 0, Paid = 1, Shipped = 2, Pending = 3 }'
    },
    {
      t: 'choice',
      q: 'The app was built against v1, where enum Color { Red, Green, Blue }. In v2 it is enum Color { Red, Yellow, Green, Blue }. The app was not rebuilt. What does library v2 receive if the app passes Color.Green?',
      options: ['Color.Yellow', 'Color.Green', 'ArgumentException', 'MissingFieldException'],
      answer: 0,
      explain: 'The app IL has the number 1 baked in, which is what Green was in v1. In v2, 1 is Yellow. Neither the compiler nor the runtime knows: to them it is just an int.',
      wrong: { 1: 'The name Green never reaches the library, only the number from the app IL.', 3: 'The Green field is not looked up at the call: the value is already substituted as a number.' }
    },
    {
      t: 'learn',
      title: 'What to choose',
      body: '<p><b>public const</b> only for what will never change: <code>int.MaxValue</code>, days in a week, codes from an external standard.</p><p><b>static readonly</b> for everything that may change in a future version: limits, timeouts, addresses, protocol versions.</p><p><b>private and internal const</b> are fine: only your own assembly sees them, and it is compiled as a whole, so the values have nowhere to diverge (unless there is <code>InternalsVisibleTo</code>).</p><p>Do not worry about speed: on a hot path the difference usually disappears, see "Deeper".</p>',
      deep: '<p>With tiered compilation a hot method is recompiled at tier 1 after the type static constructor has already run. The JIT sees that the value of a primitive <code>static readonly</code> field can no longer change and substitutes it as a constant, with constant folding and dead branch removal after that. That makes <code>static readonly bool</code> flags a cheap way to switch code off on hot paths.</p><p>.NET Framework had no such optimization: <code>static readonly</code> was honestly read from memory. Hence the old advice "const is faster", which has mostly lost its meaning in modern .NET.</p>'
    },
    {
      t: 'match',
      q: 'Match the value with how to declare it in a public library',
      pairs: [
        ['Milliseconds in a second', 'public const'],
        ['Default request timeout', 'public static readonly'],
        ['Service start date', 'static readonly, const is impossible'],
        ['A threshold inside one method', 'a local const'],
        ['A cache key visible only inside the assembly', 'private const']
      ]
    },
    {
      t: 'blanks',
      q: 'Declare the limit so consumers see the new value after the dll is replaced without a rebuild',
      code: 'public static class Api\n{\n    public ___ ___ int PageLimit = 500;\n}',
      tiles: ['static', 'readonly', 'const', 'volatile', 'sealed'],
      answer: ['static', 'readonly'],
      explain: 'static readonly is a field, read with ldsfld from the current assembly. A const would be baked into every consumer.'
    }
  ]
};
