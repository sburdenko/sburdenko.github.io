/** .NET inside out, unit "Generics and reflection inside out", lesson 3: dynamic and the call site cache inside, source generators instead of reflection. */
export default {
  id: 'dotnet.w7.l3',
  title: 'dynamic and source generators',
  sub: 'CallSite<T>, the L0/L1/L2 caches, and reflection moved to compile time',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What the compiler turns dynamic into',
      body: '<p>The lesson "Primitives, checked and dynamic" in the Deeper C# course said: every operation on <code>dynamic</code> gets a call site. Now let us look at the actual code.</p><p>The compiler creates a hidden static class with a field of type <code>CallSite&lt;TDelegate&gt;</code> for each operation. On the first pass the field is filled in: <code>CallSite.Create</code> receives a <b>binder</b>, an object that describes the operation: the member name, argument flags and the type the call comes from (the binder uses it to check access to private members).</p><p>The delegate type mirrors the arguments: <code>dynamic</code> becomes <code>object</code>, while arguments with a known type keep it, so <code>10</code> goes into the call site as an <code>int</code>, unboxed.</p>',
      code: 'dynamic d = GetShape();\nd.Draw(10);\n\n// the compiler turns this into roughly:\nif (Site1 == null)\n    Site1 = CallSite<Action<CallSite, object, int>>.Create(\n        Binder.InvokeMember(CSharpBinderFlags.ResultDiscarded, "Draw",\n            null, typeof(Program), argInfos));\nSite1.Target(Site1, d, 10);',
      deep: '<p>The real names, like <code>&lt;&gt;o__0.&lt;&gt;p__0</code>, are compiler details. <code>Binder</code> here is <code>Microsoft.CSharp.RuntimeBinder.Binder</code>, and <code>argInfos</code> is an array of <code>CSharpArgumentInfo</code>: for each argument, flags such as "type known at compile time", "constant", "named" and so on.</p><p>The infrastructure itself, the DLR (Dynamic Language Runtime), lives in <code>System.Linq.Expressions</code> and arrived in .NET Framework 4.0. IronPython and IronRuby ran on it too; C# plugs its own binder into it from the Microsoft.CSharp assembly.</p>'
    },
    {
      t: 'choice',
      q: 'dynamic d = GetList(); int n = d.Count + 1; How many call sites does the compiler create for the second statement?',
      options: ['3', '1', '2', '0'],
      answer: 0,
      explain: 'Three operations on dynamic: get the Count member (GetMember), add 1 (BinaryOperation) and convert the dynamic result to int (Convert). Each is its own call site with its own binder.',
      wrong: { 2: 'Do not forget the conversion: d.Count + 1 is dynamic too, and assigning it to an int needs a separate call site with a Convert binder.' }
    },
    {
      t: 'learn',
      title: 'Three cache levels: L0, L1, L2',
      body: '<p><code>site.Target</code> is the call itself. Inside is a compiled <b>rule</b>: a type check (restrictions) and an action. While the types match, a direct call runs with no reflection.</p><ul><li><b>L0</b> is the <code>Target</code> delegate itself, built from the history of this site.</li><li><b>L1</b> is the array of recent rules of this call site, up to <b>10</b>.</li><li><b>L2</b> is the binder shared rule cache, up to <b>128</b>; sites with the same binder share it.</li></ul><p>Only when all three levels miss does the binder analyze the call from scratch.</p>',
      code: '// The rule for Circle: a sketch of what sits in site.Target:\n// if (d is not null && d.GetType() == typeof(Circle))\n//     ((Circle)d).Draw(x);          // direct call\n// else\n//     miss → L1 → L2 → binder',
      deep: '<p>The numbers come from the <code>System.Linq.Expressions</code> sources: <code>CallSite.MaxRules = 10</code>, <code>RuleCache.MaxRules = 128</code>. When L1 is full, old rules are evicted and the new one goes first. L2 belongs to a binder instance, and Microsoft.CSharp tries to reuse equivalent binder objects so that different sites share the cache.</p><p>The binder returns the rule as an expression tree, which the DLR compiles into a delegate. Where code generation is unavailable, expression trees run in an interpreter, which is much slower.</p>'
    },
    {
      t: 'order',
      q: 'An object of a new type reaches a call site for the first time. Put what happens in order',
      items: ['L0: the rule in site.Target does not match the type', 'L1: try the recent rules of this call site', 'L2: look in the binder shared cache', 'The binder analyzes the call using C# rules for the real types', 'The new rule is compiled into a delegate and stored in the caches'],
      explain: 'Each level costs more than the previous one. The binder is the most expensive step: it does the C# compiler work at run time, using reflection over the real types.'
    },
    {
      t: 'learn',
      title: 'What dynamic costs at each level',
      body: '<p><b>An L0 hit</b> is a delegate call plus a type check. More than a direct call, but no reflection.</p><p><b>A new type at a call site</b> means binding: semantic analysis by C# rules, building an expression tree, compiling it. That is orders of magnitude more than a call. The very first dynamic in a process also loads Microsoft.CSharp and warms up the binder itself.</p><p><b>A polymorphic site</b> that receives dozens of types in turn keeps missing L0 and searching L1 and L2.</p><p>And wherever a value type travels as <code>dynamic</code> or comes back as the result of a dynamic operation, it is boxed.</p>',
      deep: '<p>Hence the recipe: if you need dynamic (COM, schemaless JSON), keep it at the edge and cast the result to a static type right away. If the types are known up front, use an ordinary interface or a generic method. If you need dispatch by member name over a limited set of types, a cached delegate from the previous lesson is usually faster and more predictable.</p>'
    },
    {
      t: 'multi',
      q: 'Where does dynamic pay noticeably more than an ordinary call? Select all.',
      options: ['The first call at a site with a new argument type', 'A site that receives dozens of different types in turn', 'A repeated call with the same type when the rule is already in L0', 'A value type passed as dynamic'],
      answer: [0, 1, 3],
      explain: 'A new type means binding and compiling a rule. Many types mean L0 misses and cache searches. A value type in dynamic is boxed. An L0 hit is the cheapest path: a delegate and a type check.'
    },
    {
      t: 'learn',
      title: 'Source generators: reflection at compile time',
      body: '<p>Reflection at run time reads metadata to learn which properties and methods a type has. But all of that was already known to the compiler. A <b>source generator</b> does this work at build time.</p><p>A generator is a class from an analyzer assembly that Roslyn loads right into the compiler process. It sees the syntax trees and the semantic model, the same type information that reflection would later read from metadata, and <b>adds</b> new C# files to the compilation. It cannot change existing code, so everything is built on <code>partial</code>.</p>',
      code: '[JsonSerializable(typeof(Order))]\npartial class AppJsonContext : JsonSerializerContext { }\n\n// the generator wrote the other half of AppJsonContext:\n// metadata for Order, code to read and write each property\nstring json = JsonSerializer.Serialize(order, AppJsonContext.Default.Order);',
      deep: '<p>The modern API is <code>IIncrementalGenerator</code> (Roslyn 4.0, .NET 6 SDK): the generator describes a pipeline, and Roslyn caches intermediate results. That matters because generators also run in the IDE on every code change. The old <code>ISourceGenerator</code> reran from scratch and is considered obsolete.</p><p>You can see the generated code in the IDE under the project analyzers node, or write it to disk with the <code>EmitCompilerGeneratedFiles</code> property.</p>'
    },
    {
      t: 'match',
      q: 'Match the .NET generator with what it replaces',
      pairs: [
        ['JsonSerializerContext', 'Inspecting types with reflection on first serialization'],
        ['[GeneratedRegex]', 'Emitting regex IL through Reflection.Emit'],
        ['[LibraryImport]', 'A P/Invoke marshalling IL stub built at run time'],
        ['[LoggerMessage]', 'Boxing arguments and parsing the template when logging']
      ]
    },
    {
      t: 'learn',
      title: 'What you gain and where the limit is',
      body: '<p>The gains:</p><ul><li><b>startup</b>: no walking types with reflection and no IL generation at launch;</li><li><b>trimming and Native AOT</b>: ordinary code is visible to analysis, the trimmer will not cut members that are needed, and no code generation is required at run time;</li><li><b>errors at build time</b>, not in production; the generated code can be read and debugged.</li></ul><p>The limit: a generator sees only what exists at compile time. Types from plugins loaded at run time will still need reflection.</p>',
      deep: '<p>A link back to the first lesson. Native AOT has no JIT: the compiler builds canonical code for reference T and a separate copy for every value T it managed to see. <code>typeof(List&lt;&gt;).MakeGenericType(typeof(Point))</code> with a struct that appears nowhere else has nothing to run on at run time: there is no code, and nobody to create it. The analyzer warns about this (<code>IL3050</code>, <code>RequiresDynamicCode</code>). With a reference argument such a call usually works: the shared <code>List&lt;__Canon&gt;</code> code fits.</p>'
    },
    {
      t: 'choice',
      q: 'The app is published with Native AOT. Why may typeof(List<>).MakeGenericType(typeof(Point)) fail for a struct Point that is not used in generics anywhere else?',
      options: ['No JIT: machine code for List<Point> was not compiled ahead of time', 'Native AOT does not support generics', 'MakeGenericType is forbidden in Native AOT for any arguments', 'A struct cannot be a List<T> argument under AOT'],
      answer: 0,
      explain: 'Every value T needs its own copy of the code. The AOT compiler builds only the copies it sees in the program. For a reference argument the shared List<__Canon> code would do.',
      wrong: { 2: 'With reference arguments MakeGenericType usually works: the shared canonical code is already compiled.' }
    },
    {
      t: 'blanks',
      q: 'Declare a regex that the generator builds at compile time',
      code: 'partial class Validators\n{\n    [___("^[0-9]{5}$")]\n    private static ___ Regex ZipCode();\n}',
      tiles: ['GeneratedRegex', 'partial', 'Regex', 'virtual', 'extern', 'RegexOptions'],
      answer: ['GeneratedRegex', 'partial'],
      explain: 'You write the declaration of a partial method, the generator writes its body: C# code that matches the string the way RegexOptions.Compiled would, but with no Reflection.Emit at run time. The [GeneratedRegex] attribute arrived in .NET 7.'
    },
    {
      t: 'choice',
      q: 'Where does source generator code run?',
      options: ['Inside the compiler during the build and in the IDE', 'In the runtime the first time the type is used', 'In the JIT when a method is compiled', 'After compilation, by rewriting the IL of the finished assembly'],
      answer: 0,
      explain: 'A generator is part of compilation: Roslyn loads it into its own process and adds its output to the sources. The finished assembly contains ordinary compiled code; the generator itself does not end up in it.',
      wrong: { 3: 'That is how IL rewriting tools (IL weaving) work. A generator runs earlier and emits C# source code, not IL.' }
    }
  ]
};
