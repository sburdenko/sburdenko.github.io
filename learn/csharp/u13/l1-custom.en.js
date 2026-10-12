/** Deeper C#, unit "Attributes and reflection", lesson 1: a custom attribute, where it is stored and how it is read. */
export default {
  id: 'cs.u13.l1',
  title: 'A custom attribute',
  sub: 'The class, AttributeUsage, the metadata blob and pseudo-attributes',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'An attribute is a class',
      body: '<p>An <b>attribute</b> attaches data to a type, method, field or parameter — data that is not executed but read. The reader can be the compiler (<code>[Obsolete]</code> → a warning at the use site), the runtime (<code>[StructLayout]</code>) or a framework: ASP.NET looks for <code>[Route]</code>, a test runner for <code>[Fact]</code>.</p><p>A custom attribute is an ordinary class derived from <code>System.Attribute</code>. Constructor parameters give <b>positional</b> arguments; public fields and properties with a <code>set</code> give <b>named</b> ones. Inside square brackets you can drop the <code>Attribute</code> suffix.</p>',
      code: '// A custom attribute is an ordinary class derived from Attribute\npublic class RouteAttribute : Attribute\n{\n    public RouteAttribute(string path) => Path = path;\n    public string Path { get; }       // positional argument\n    public int Order { get; set; }    // named argument\n}\n\n[Route("/orders", Order = 2)]   // the Attribute suffix is optional\npublic class OrdersController { }',
      deep: '<p>Since C# 11 attributes can be generic: <code>class TagAttribute&lt;T&gt; : Attribute</code> and <code>[Tag&lt;int&gt;]</code>. The type argument follows the same rules as <code>typeof</code>: no <code>dynamic</code>, no nullable reference annotations, no tuples with element names.</p><p>Put <code>[Conditional("DEBUG")]</code> on the attribute class itself, and the compiler records the attribute in metadata only where the DEBUG symbol is defined. A Release build simply does not have it.</p>'
    },
    {
      t: 'learn',
      title: 'Where an attribute lives: bytes, not an object',
      body: '<p>The compiler does not create an attribute object. It writes one row into the <b>CustomAttribute</b> metadata table: the owner (a type, method, field…), a reference to the attribute constructor and a <b>blob</b> — the arguments serialized to bytes.</p><p>Loading the assembly does not create an object either, and the constructor does not run. An instance appears only when someone asks for it through reflection — and every request gets a new one.</p><p>The key consequence: an attribute does nothing on its own. A <code>[Route]</code> that nobody looks for is just bytes in a file.</p>',
      flow: ['[Route("/orders")]', 'blob in CustomAttribute', 'GetCustomAttribute', 'new RouteAttribute(…)'],
      deep: '<p>Here is the blob the compiler writes for <code>[Route("/orders", Order = 2)]</code>:</p><p><code>01 00</code> — the prolog; <code>07 2F 6F 72 64 65 72 73</code> — a length-prefixed UTF-8 string; <code>01 00</code> — one named argument; <code>54</code> — it is a property (<code>53</code> would be a field), <code>08</code> — type int32, <code>05 4F 72 64 65 72</code> — the name "Order"; <code>02 00 00 00</code> — the value.</p><p>The blob has no references to the constants the value was computed from — only the final values. How metadata tokens and tables work is covered in the ".NET inside out" course.</p>'
    },
    {
      t: 'choice',
      q: 'How many times is ctor printed?',
      code: 'var a = new Order();\nvar b = new Order();\nvar x = typeof(Order).GetCustomAttribute<AuditAttribute>();\nvar y = typeof(Order).GetCustomAttribute<AuditAttribute>();\n\nclass AuditAttribute : Attribute\n{\n    public AuditAttribute() => Console.WriteLine("ctor");\n}\n\n[Audit] class Order { }',
      options: ['2', '0', '1', '4'],
      answer: 0,
      explain: 'new Order() does not touch the attribute: it sits in metadata and is not needed to create an object. Each GetCustomAttribute parses the blob again and calls the constructor — two calls, two objects; x and y are different references.',
      wrong: { 2: 'The runtime does not cache attribute instances: every request creates a new object.', 3: 'Creating an Order does not create the attribute. The attribute belongs to the type, not to an instance.' }
    },
    {
      t: 'learn',
      title: 'Arguments: only what fits in the blob',
      body: '<p>Arguments are written to bytes at compile time, so the compiler must know the value. An argument can be:</p><ul><li>a constant expression: a literal, a <code>const</code>, <code>nameof</code>, <code>"a" + "b"</code>;</li><li><code>typeof(…)</code>;</li><li>a single-dimensional array creation.</li></ul><p>And the parameter type comes from a short list: <code>bool</code>, <code>char</code>, the integer types and <code>float</code>/<code>double</code>, <code>string</code>, <code>Type</code>, enums, <code>object</code> and single-dimensional arrays of these. <code>decimal</code>, <code>DateTime</code> and <code>Guid</code> are out: the metadata format does not treat them as primitives.</p>',
      code: '[Timeout(Cfg.Ms * 2)]          // ok: a constant expression\n[Tags(new[] { "db", "slow" })] // ok: a single-dimensional array\n[Handler(typeof(List<int>))]   // ok: typeof\n[Price(9.99m)]                 // CS0181: decimal is not an attribute parameter type\n[Retry(Cfg.Retries)]           // CS0182: static readonly is not a constant',
      deep: '<p>The workaround for <code>decimal</code> and dates is a string parsed on read. That is how <code>[DefaultValue(typeof(decimal), "9.99")]</code> works.</p><p><code>typeof</code> goes into the blob as a string — the full type name, plus the assembly name for a type from another assembly. On read the runtime loads the type by that name, so renaming the type in the other assembly breaks reading an already compiled attribute.</p><p>For an <code>object</code> parameter the blob stores a type tag before the value: <code>[Value(5)]</code> and <code>[Value("5")]</code> read back differently.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line does not compile?',
      code: 'static class Cfg\n{\n    public const int Ms = 500;\n    public static readonly int Retries = 3;\n}\n\n[Timeout(Cfg.Ms * 2)]\n[Name(nameof(Cfg))]\n[Retry(Cfg.Retries)]\n[Handler(typeof(List<int>))]\nclass Job { }',
      answer: 8,
      explain: 'static readonly is a field filled in at run time, not a constant. The compiler has nothing to write into the blob: error CS0182. Cfg.Ms * 2 and nameof are computed at compile time, and typeof is allowed by a separate rule.'
    },
    {
      t: 'learn',
      title: 'AttributeUsage: where and how many times',
      body: '<p><code>[AttributeUsage]</code> is an attribute on the attribute class. It sets three things:</p><ul><li><b>where</b> it may be applied — <code>AttributeTargets</code> flags: Class, Method, Property, Parameter, ReturnValue… The wrong place is error CS0592;</li><li><b>AllowMultiple</b> — whether it may repeat on one element. By default it may not: CS0579;</li><li><b>Inherited</b> — whether derived types see it when searched with <code>inherit: true</code>. Yes by default.</li></ul><p>Without <code>[AttributeUsage]</code> the defaults apply: <code>All</code>, <code>false</code>, <code>true</code>. Placement and repetition are checked by the compiler — the runtime no longer checks them.</p>',
      code: '[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method,\n    AllowMultiple = true, Inherited = false)]\npublic class RouteAttribute : Attribute { /* … */ }',
      deep: '<p>A trap with <code>Inherited</code>: <code>PropertyInfo.GetCustomAttributes(true)</code>, and the same on <code>EventInfo</code>, <b>ignores</b> the <code>inherit</code> parameter — an attribute on the overridden base property is not found. To walk the chain, use the static <code>Attribute.GetCustomAttributes(member, true)</code>.</p><p>Interface attributes are never inherited: a class implementing an interface does not get them, whatever <code>Inherited</code> says. The chain follows base classes only.</p><p>The extension <code>GetCustomAttribute&lt;T&gt;(member)</code> searches with <code>inherit: true</code> by default, while <code>Type.GetCustomAttributes(bool)</code> makes you say it explicitly.</p>'
    },
    {
      t: 'blanks',
      q: 'Allow a route to be applied to a method twice',
      code: '[___(AttributeTargets.Method, AllowMultiple = ___)]\nclass RouteAttribute : ___\n{\n    public RouteAttribute(string path) => Path = path;\n    public string Path { get; }\n}\n\nclass OrdersApi\n{\n    [Route("/orders")]\n    [Route("/api/orders")]\n    public void List() { }\n}',
      tiles: ['AttributeUsage', 'true', 'Attribute', 'false', 'Serializable', 'object'],
      answer: ['AttributeUsage', 'true', 'Attribute'],
      explain: 'The attribute class derives from Attribute, and AttributeUsage with AllowMultiple = true allows repetition. Without it the second [Route] is CS0579.'
    },
    {
      t: 'learn',
      title: 'Reading: GetCustomAttribute and its cost',
      body: '<p><code>GetCustomAttribute&lt;T&gt;()</code> finds the CustomAttribute rows for the element, picks the right type, parses the blob, calls the constructor and assigns named arguments. Every call does it again: parsing plus a fresh allocation. If two matching attributes exist, you get <code>AmbiguousMatchException</code> and need <code>GetCustomAttributes</code>.</p><p>Cheaper options:</p><ul><li><code>IsDefined</code> — a check only, no object is created;</li><li><code>GetCustomAttributesData()</code> — arguments as data, without calling the constructor.</li></ul><p>Frameworks read attributes once at startup and cache the result, for example in a <code>static readonly</code> field or a dictionary keyed by <code>Type</code>.</p>',
      code: 'var t = typeof(OrdersController);\n\n// a new RouteAttribute object on every call\nRouteAttribute? r = t.GetCustomAttribute<RouteAttribute>();\n\n// a check only: no object is created\nbool has = t.IsDefined(typeof(RouteAttribute));\n\n// arguments without calling the constructor\nforeach (var d in t.GetCustomAttributesData())\n    Console.WriteLine(d.ConstructorArguments[0].Value);   // /orders'
    },
    {
      t: 'multi',
      q: 'What is true about reading attributes? Select all.',
      options: ['Two GetCustomAttribute calls return two different objects', 'IsDefined checks presence without calling the attribute constructor', 'The attribute object is created when the assembly loads and kept in a CLR cache', 'CustomAttributeData gives the arguments without calling the constructor', 'GetCustomAttribute only sees attributes from a Debug build'],
      answer: [0, 1, 3],
      explain: 'An instance is built from the blob on every request, so the objects differ and reading in a loop is expensive. IsDefined and CustomAttributeData work with metadata directly. The build configuration does not affect how attributes are recorded — except attributes marked [Conditional].'
    },
    {
      t: 'learn',
      title: 'Pseudo-attributes: flags, not rows',
      body: '<p>The compiler does not write some attributes into the CustomAttribute table. It turns them into bits and dedicated metadata tables that the type loader reads itself:</p><ul><li><code>[Serializable]</code> → a bit in the type flags;</li><li><code>[StructLayout]</code> → type layout flags and the ClassLayout table (Pack, Size);</li><li><code>[FieldOffset]</code> → the FieldLayout table;</li><li><code>[DllImport]</code> → a method flag and the ImplMap table;</li><li><code>[NonSerialized]</code>, <code>[MethodImpl]</code> → field and method flags.</li></ul><p>Reflection returns them inconsistently. It rebuilds <code>Serializable</code> and <code>DllImport</code> from the flags, but <code>StructLayout</code> cannot be found through <code>GetCustomAttribute</code> — only through the <code>Type.StructLayoutAttribute</code> property.</p>',
      code: '[Serializable]\n[StructLayout(LayoutKind.Sequential, Pack = 1)]\nstruct Header { public byte Kind; public int Size; }\n\nvar t = typeof(Header);\nvar pack = t.StructLayoutAttribute!.Pack;              // 1 — from the ClassLayout table\nvar sl = t.GetCustomAttribute<StructLayoutAttribute>(); // null\nvar sr = t.GetCustomAttribute<SerializableAttribute>(); // not null: rebuilt from the flag',
      deep: '<p>This behaviour was checked on .NET 9. The runtime synthesizes such attributes in the <code>PseudoCustomAttribute</code> class, and which of them <code>GetCustomAttribute</code> returns is an implementation detail. Do not rely on <code>GetCustomAttribute</code> for pseudo-attributes; read the flags and the dedicated properties.</p><p>The Serializable flag can also be read through <code>Type.IsSerializable</code>, but since .NET 8 that property is marked obsolete (SYSLIB0050) together with all formatter-based serialization.</p>'
    },
    {
      t: 'match',
      q: 'Match the attribute with where it ends up in metadata',
      pairs: [
        ['[Serializable]', 'A bit in the type flags'],
        ['[StructLayout]', 'Layout flags and the ClassLayout table'],
        ['[DllImport]', 'The ImplMap table'],
        ['[FieldOffset]', 'The FieldLayout table'],
        ['[Obsolete]', 'A row in the CustomAttribute table']
      ]
    },
    {
      t: 'choice',
      q: 'In version 2 of Shop.dll MaxItems became 100. Shop.dll was replaced, the app was not rebuilt. What maximum does a validator read from the attribute?',
      code: '// Shop.dll, version 1\npublic static class Limits { public const int MaxItems = 50; }\n\n// the app, built against version 1\npublic class Cart\n{\n    [Range(1, Limits.MaxItems)]\n    public int Count { get; set; }\n}',
      options: ['50', '100', 'An exception when reading the attribute', '0'],
      answer: 0,
      explain: 'The constant was evaluated when the app was compiled and sits in the attribute blob inside the app. Metadata has no reference to Limits.MaxItems at all, so replacing Shop.dll changes nothing. The new value appears only after a rebuild.',
      wrong: { 1: 'That would be the case with static readonly, but you cannot pass one to an attribute: CS0182.' }
    }
  ]
};
