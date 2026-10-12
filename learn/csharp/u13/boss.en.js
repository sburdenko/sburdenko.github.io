/** Final of the "Attributes and reflection" unit of the "Deeper C#" course. */
export default {
  id: 'cs.u13.boss',
  title: 'Final: attributes and reflection',
  sub: 'Metadata, call cost and AOT',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Type t has one [Route] attribute. How many RouteAttribute objects does the loop create?',
      code: 'for (int i = 0; i < 1000; i++)\n{\n    if (t.IsDefined(typeof(RouteAttribute)))\n        Use(t.GetCustomAttribute<RouteAttribute>()!);\n}',
      options: ['1000', '1', '2000', '0'],
      answer: 0,
      explain: 'IsDefined looks at metadata and creates no object. GetCustomAttribute parses the blob and calls the constructor anew every time — 1000 calls, 1000 objects. Read once and cache.',
      wrong: { 2: 'IsDefined does not call the constructor — it only checks that the row exists.' }
    },
    {
      t: 'tapline',
      q: 'Which line does not compile? The attribute constructor parameters match the argument types.',
      code: 'enum Level { Low, High }\n\n[Priority(Level.High)]\n[Since("2026-01-01")]\n[Owner(nameof(Billing))]\n[Limit(1.5m)]\n[Types(new[] { typeof(int), typeof(string) })]\nclass Billing { }',
      answer: 5,
      explain: 'decimal is not on the list of attribute parameter types: CS0181. An enum, a string, nameof and a single-dimensional Type array are all allowed. Pass a fractional value as a double or a string.'
    },
    {
      t: 'multi',
      q: 'Which attributes does the compiler turn into flags and dedicated metadata tables rather than a CustomAttribute row? Select all.',
      options: ['[Serializable]', '[DllImport]', '[Obsolete]', '[StructLayout]', '[Flags]'],
      answer: [0, 1, 3],
      explain: 'Serializable is a bit in the type flags, DllImport is the ImplMap table, StructLayout is layout flags plus ClassLayout. The type loader reads them. Obsolete and Flags are ordinary attributes: the compiler and Enum.ToString read them.'
    },
    {
      t: 'order',
      q: 'Put in order what happens inside t.GetCustomAttribute<RouteAttribute>()',
      items: ['Find the CustomAttribute rows owned by t', 'Keep those whose constructor belongs to RouteAttribute', 'Parse the argument blob', 'Call the constructor with the positional arguments', 'Assign the named properties and fields'],
      explain: 'The object is built only at the very end and only on request. Until then the attribute is a table row and blob bytes.'
    },
    {
      t: 'choice',
      q: 'A hot loop calls a private method of someone else\'s type millions of times. The project targets .NET 8 and will later be published with Native AOT. What do you pick?',
      options: ['UnsafeAccessor', 'MethodInfo.Invoke with a cached MethodInfo', 'Expression.Compile with a cached delegate', 'dynamic'],
      answer: 0,
      explain: 'UnsafeAccessor costs as much as a direct call and needs no code generation at run time. Invoke is tens of nanoseconds and allocations on every call. A compiled expression is fast under the JIT but becomes an interpreter in Native AOT. dynamic does not see private methods.',
      wrong: { 2: 'Under the JIT it is a good option, but in Native AOT Compile returns a delegate over an interpreter — slower than Invoke.' }
    },
    {
      t: 'match',
      q: 'Match the diagnostic code with its cause',
      pairs: [
        ['IL2026', 'Calling a member with [RequiresUnreferencedCode]'],
        ['IL3050', 'Calling a member with [RequiresDynamicCode]'],
        ['IL2057', 'Type.GetType with an unknown string'],
        ['IL2067', 'A Type passed without the required DynamicallyAccessedMembers annotation'],
        ['CS0181', 'An invalid attribute parameter type']
      ]
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: '[AttributeUsage(AttributeTargets.Property, Inherited = true)]\nclass TrackAttribute : Attribute { }\n\nclass Base { [Track] public virtual int Qty { get; set; } }\nclass Child : Base { public override int Qty { get; set; } }\n\nvar p = typeof(Child).GetProperty("Qty")!;\nConsole.WriteLine(p.GetCustomAttributes(true).Length);\nConsole.WriteLine(Attribute.GetCustomAttributes(p, true).Length);',
      options: ['0 and 1', '1 and 1', '0 and 0', '1 and 0'],
      answer: 0,
      explain: 'For properties and events PropertyInfo.GetCustomAttributes ignores the inherit parameter and looks only at the override itself. The static Attribute.GetCustomAttributes walks the chain and finds [Track] on Base.Qty.'
    },
    {
      t: 'choice',
      q: 'In version 2 of the library the enum became enum Level { Low, Mid, High }. An app with [Priority(Level.High)], built against version 1 (Low, High), was not rebuilt. What does the attribute read?',
      options: ['Level.Mid', 'Level.High', 'An exception when reading the attribute', '(Level)2'],
      answer: 0,
      explain: 'The blob holds the number 1 — the value of High in version 1, not the name. On read that number becomes a Level from the new library, where 1 is Mid. Add new enum members at the end, or better, give values explicitly.'
    }
  ]
};
