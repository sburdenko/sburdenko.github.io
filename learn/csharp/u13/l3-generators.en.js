/** Deeper C#, unit "Attributes and reflection", lesson 3: source generators instead of reflection, trimming and Native AOT. */
export default {
  id: 'cs.u13.l3',
  title: 'Generators, trimming and AOT',
  sub: 'Code at compile time instead of reflection at run time',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What is wrong with reflection at startup',
      body: '<p>A reflection-based serializer, DI container or logger does its work <b>on every launch</b>: it walks properties, reads attributes, compiles delegates. That costs startup time and memory. And nobody but the runtime sees that code: not the compiler, not the tool that strips unused code.</p><p>A <b>source generator</b> moves that work to compile time. It is a Roslyn component: it runs inside the project build, sees syntax and types, and <b>adds</b> new C# files. It cannot change existing code — so generators work through <code>partial</code> classes and <code>partial</code> methods: you declare, the generator writes the body.</p>',
      deep: '<p>Generators arrived in .NET 5 (C# 9), and .NET 6 brought incremental ones (<code>IIncrementalGenerator</code>): the IDE reruns only the part whose inputs changed. Generated files show up in Solution Explorer under Dependencies → Analyzers, and with <code>&lt;EmitCompilerGeneratedFiles&gt;true&lt;/EmitCompilerGeneratedFiles&gt;</code> they are written to disk under <code>obj</code>.</p><p>A generator sees attributes as symbols (<code>AttributeData</code>): the arguments from the blob, without creating an object and without running your code.</p>'
    },
    {
      t: 'choice',
      q: 'What can a source generator do?',
      options: ['Add new C# files to the compilation', 'Change the body of an existing method', 'Run when the application starts', 'Create an attribute object through GetCustomAttribute'],
      answer: 0,
      explain: 'A generator only adds code, and only during compilation. To plug into your type it needs partial: you write the declaration, the generator writes the implementation. It reads attributes as compiler metadata, not as objects.',
      wrong: { 1: 'Existing code is read-only for a generator. That is why every .NET generator requires partial.' }
    },
    {
      t: 'learn',
      title: 'System.Text.Json: a context instead of analysing the type',
      body: '<p>Without hints, <code>JsonSerializer</code> walks a type\'s properties with reflection the first time it meets the type, builds metadata and caches it. The first call is noticeably more expensive than the rest.</p><p>With the generator you declare a <code>partial</code> class derived from <code>JsonSerializerContext</code> and list the types with <code>[JsonSerializable]</code> attributes. The generator writes a ready <code>JsonTypeInfo&lt;T&gt;</code> for each: the property list, getters and setters as plain code. Pass it to <code>Serialize</code> — no reflection.</p>',
      code: '[JsonSerializable(typeof(Order))]\ninternal partial class AppJson : JsonSerializerContext { }\n\nstring json = JsonSerializer.Serialize(order, AppJson.Default.Order);\nOrder? back = JsonSerializer.Deserialize(json, AppJson.Default.Order);',
      deep: '<p>The System.Text.Json generator arrived in .NET 6. Modes: <b>metadata</b> — generates a description of the type and the serializer works from it; <b>serialization</b> (fast path) — generates direct code writing to <code>Utf8JsonWriter</code>, serialization only. Choose with <code>[JsonSourceGenerationOptions(GenerationMode = …)]</code>.</p><p>Since .NET 8 there is a project property <code>JsonSerializerIsReflectionEnabledByDefault=false</code>: serialization without a context throws <code>InvalidOperationException</code> with a clear message. That way a forgotten call shows up in normal debugging, not after publishing with AOT.</p>'
    },
    {
      t: 'blanks',
      q: 'Hook up the System.Text.Json generator for Order',
      code: '[___(typeof(Order))]\ninternal ___ class AppJson : JsonSerializerContext { }\n\nvar json = JsonSerializer.Serialize(order, AppJson.___.Order);',
      tiles: ['JsonSerializable', 'partial', 'Default', 'Serializable', 'sealed', 'Instance'],
      answer: ['JsonSerializable', 'partial', 'Default'],
      explain: 'Types are listed with [JsonSerializable], and the class must be partial so the generator can extend it. The ready context instance is the static Default property, with one JsonTypeInfo property per type. [Serializable] is a pseudo-attribute of the old serialization; the generator ignores it.'
    },
    {
      t: 'learn',
      title: 'Regex and logging: the same trick',
      body: '<p><code>new Regex(p, RegexOptions.Compiled)</code> parses the pattern at run time and generates IL through Reflection.Emit — expensive at startup. <code>[GeneratedRegex]</code> (.NET 7) writes C# matching code at compile time: startup is free, and you can read the generated code and step through it in the debugger.</p><p><code>logger.LogInformation("Order {Id} paid", id)</code> parses the template on every call (with a cache), boxes <code>id</code> into a <code>params object[]</code> and allocates the array — even when the level is disabled. <code>[LoggerMessage]</code> (.NET 6) generates a strongly typed method: an <code>IsEnabled</code> check, no array, no boxing.</p>',
      code: 'static partial class Patterns\n{\n    [GeneratedRegex(@"^\\d{4}-\\d{2}-\\d{2}$")]\n    public static partial Regex IsoDate();\n}\n\nstatic partial class Log\n{\n    [LoggerMessage(EventId = 1, Level = LogLevel.Information, Message = "Order {Id} paid")]\n    public static partial void OrderPaid(ILogger logger, int id);\n}',
      deep: '<p>With C# 13 and .NET 9 <code>[GeneratedRegex]</code> can also go on a <code>partial</code> property: <code>public static partial Regex IsoDate { get; }</code>.</p><p>Where code cannot be generated at run time, <code>RegexOptions.Compiled</code> is silently ignored and the interpreter runs. <code>[GeneratedRegex]</code> has no such drop.</p><p>Other generators from .NET 8: configuration binding (<code>EnableConfigurationBindingGenerator</code>), options validation, the Request Delegate Generator for Minimal APIs.</p>'
    },
    {
      t: 'match',
      q: 'Match the tool with the work it removes from run time',
      pairs: [
        ['JsonSerializerContext', 'Walking the type\'s properties on the first Serialize'],
        ['[GeneratedRegex]', 'Generating IL for RegexOptions.Compiled'],
        ['[LoggerMessage]', 'params object[] and boxing on every call'],
        ['UnsafeAccessor', 'FieldInfo.GetValue for a private field']
      ]
    },
    {
      t: 'learn',
      title: 'Trimming and Native AOT',
      body: '<p><b>Trimming</b> removes, at publish time, code that static analysis cannot reach. Analysis does not see a call by string: the method may be removed, and at run time you get <code>MissingMethodException</code> or <code>null</code> from <code>GetMethod</code>.</p><p><b>Native AOT</b> compiles the whole program to machine code ahead of time and always trims. There is no JIT at run time — so no <code>Reflection.Emit</code>, and a generic built through <code>MakeGenericType</code> may have no ready machine code. Reflection itself works — for whatever was kept.</p><p>The analyzer flags risky spots with warnings: <b>IL2xxx</b> for trimming, <b>IL3xxx</b> for AOT. Turn them on with <code>&lt;IsAotCompatible&gt;true&lt;/IsAotCompatible&gt;</code> in a library or <code>PublishAot</code> in an app.</p>',
      code: 'string a = JsonSerializer.Serialize(order);    // IL2026 + IL3050\nvar t = typeof(List<>).MakeGenericType(type);  // IL3050\nType? u = Type.GetType(Console.ReadLine()!);   // IL2057',
      deep: '<p><b>IL2026</b> is a call to a member with <code>[RequiresUnreferencedCode]</code>, <b>IL3050</b> — with <code>[RequiresDynamicCode]</code>. In .NET 8+ these mark the APIs that cannot work without reflection over unknown types or code generation. Mark your own such method with the same attributes — the warning moves to its callers.</p><p><code>[UnconditionalSuppressMessage]</code> silences a warning for good, including at publish time. Use it only once you have proven the needed members will be kept.</p>'
    },
    {
      t: 'multi',
      q: 'What produces an analyzer warning with PublishAot? Select all.',
      options: ['JsonSerializer.Serialize(order) without a context', 'new DynamicMethod("x", typeof(int), Type.EmptyTypes)', 'JsonSerializer.Serialize(order, AppJson.Default.Order)', 'typeof(Order).GetMethod("Calc")', 'Type.GetType(name), where name is read from a file'],
      answer: [0, 1, 4],
      explain: 'Serialize without a context is marked RequiresUnreferencedCode and RequiresDynamicCode (IL2026, IL3050), DynamicMethod is RequiresDynamicCode (IL3050), an unknown string in Type.GetType is IL2057. But the analyzer understands typeof plus a constant string: the Calc method will be kept.'
    },
    {
      t: 'learn',
      title: 'DynamicallyAccessedMembers: a contract about what to keep',
      body: '<p>When a method takes a <code>Type</code> and does something with it through reflection, the analyzer does not know which members to keep. A <code>[DynamicallyAccessedMembers]</code> annotation on the parameter says: "this type needs its public constructors" (or methods, properties…).</p><p>The requirement flows up the call chain. A caller that passes <code>typeof(Order)</code> — the analyzer keeps what is needed. A caller passing its own <code>Type</code> parameter must annotate it too. And if at the top the type came from a string — that is where the warning lands.</p>',
      code: '// IL2067: unknown whether t has a constructor\nstatic object Make(Type t) => Activator.CreateInstance(t)!;\n\n// annotation: "keep the public parameterless constructor"\nstatic object Make2(\n    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicParameterlessConstructor)]\n    Type t) => Activator.CreateInstance(t)!;\n\nMake2(typeof(Order));   // ok: the Order() constructor is kept'
    },
    {
      t: 'tapline',
      q: 'On which line does the trimming analyzer warn?',
      code: 'static void Run(\n    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicMethods)] Type t)\n    => t.GetMethod("Start")?.Invoke(null, null);\n\nRun(typeof(Job));\nType j = typeof(Job);\nRun(j);\nRun(Type.GetType(Console.ReadLine()!)!);',
      answer: 7,
      explain: 'Inside Run everything is clean: the parameter is annotated, so GetMethod is allowed. The analyzer sees typeof(Job) and keeps Job\'s public methods — through a local variable too. But a type from a typed-in string is unknown: IL2057 on the last line.'
    },
    {
      t: 'learn',
      title: 'Then and now',
      body: '<p>In .NET Framework reflection was the norm: <code>XmlSerializer</code> generated assemblies at run time, <code>BinaryFormatter</code> wrote any object through reflection, DI containers scanned assemblies, and <code>RegexOptions.Compiled</code> generated IL. The JIT was always there; trimming was not.</p><p>Today the .NET libraries are annotated for trimming and AOT, and hot paths move to generators. <code>BinaryFormatter</code> was removed in .NET 9: its methods throw <code>PlatformNotSupportedException</code>.</p><p>The rule: reflection over known types at startup or in tools is fine. On a hot path — a delegate, <code>UnsafeAccessor</code> or a generator. Under AOT — a generator.</p>'
    },
    {
      t: 'choice',
      q: 'At startup a mini-framework finds every class with [Handler] via Assembly.GetTypes() and creates them through Activator. The app must be published with Native AOT. What is best?',
      options: ['A generator: build the handler list and their creation code at compile time', 'Silence the warnings with UnconditionalSuppressMessage', 'Replace GetCustomAttribute with CustomAttributeData', 'Cache the found types in a static field'],
      answer: 0,
      explain: 'Trimming removes classes nothing references in code, and GetTypes simply does not return them — silently, with no error. A generator finds [Handler] at compile time and writes new HandlerA(), new HandlerB(): the analyzer sees direct references, and there is no reflection at run time.',
      wrong: { 1: 'The warning goes away, the problem stays: removed classes are not found at run time.', 3: 'A cache speeds up repeated lookups but does not bring back removed types.' }
    }
  ]
};
