/** Deeper C#, unit "Interfaces", lesson 2: "version 2", default interface methods, static abstract members, interface or base class. */
export default {
  id: 'cs.u10.l2',
  title: 'Default methods and version 2',
  sub: 'How to change an interface without breaking other people\'s code, and what static abstract is',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Version 2: adding a method to an interface',
      body: '<p>You shipped a library with an <code>IExporter</code> interface, and dozens of teams implemented it. In version 2 you want to add <code>ExportAsync</code>.</p><p>Without extra measures this is a breaking change. The implementers\' code stops <b>compiling</b>: CS0535, interface member not implemented. And an already built plugin assembly, loaded next to the new library version, fails when its type is loaded: <code>TypeLoadException</code> — "method does not have an implementation".</p><p>With an abstract base class it is easier: derived classes simply inherit a new <b>virtual</b> method with a body, changing nothing.</p>',
      code: '// version 1\npublic interface IExporter\n{\n    void Export(Report r);\n}\n\n// version 2 — every implementer is broken\npublic interface IExporter\n{\n    void Export(Report r);\n    Task ExportAsync(Report r, CancellationToken ct);\n}'
    },
    {
      t: 'choice',
      q: 'A plugin was built against version 1 and never rebuilt. The app updated the library to version 2, where a method without a body was added to the interface. What happens?',
      options: ['TypeLoadException when the CLR loads the plugin class', 'Compile error CS0535 when the app starts', 'Everything works, and calling ExportAsync returns null', 'NotImplementedException only when ExportAsync is called'],
      answer: 0,
      explain: 'There is nothing left to compile — the assembly is built. When loading the class, the CLR builds its method table and sees an interface method with no implementation. The whole type is rejected: you cannot even call its old Export.',
      wrong: { 1: 'The compiler does not run at startup. The plugin authors will see CS0535 when they rebuild.', 3: 'That would happen if the CLR filled in stubs. It does not: a type without an implementation simply does not load.' }
    },
    {
      t: 'learn',
      title: 'A default method',
      body: '<p>Since C# 8 an interface method can have a body — a <b>default implementation</b> (default interface method, DIM). Classes that did not implement it get the body from the interface. Version 2 is no longer breaking.</p><p>This is a <b>runtime</b> feature, not just a compiler one: the CLR has to find the body in the interface when the class has no implementation. That is why DIM works from .NET Core 3.0 on and is unavailable on .NET Framework — even with a new compiler.</p>',
      code: 'public interface IExporter\n{\n    void Export(Report r);\n\n    // version 2: old implementations get this body\n    Task ExportAsync(Report r, CancellationToken ct)\n    {\n        Export(r);\n        return Task.CompletedTask;\n    }\n}',
      deep: '<p>The compiler checks for support via the <code>RuntimeFeature.DefaultImplementationsOfInterfaces</code> field in the target library. .NET Framework and .NET Standard 2.0 lack it — error CS8701: the target runtime does not support default interface implementation. .NET Standard 2.1 supports it, which is one reason .NET Framework does not implement it.</p><p>In IL a default method is an ordinary virtual interface method with a body (no <code>abstract</code>). A class can override it implicitly — with a public method — or explicitly. A derived interface can replace the base body with its own explicit implementation: <code>void IBase.M() { … }</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'IExporter is from the previous card; ExportAsync has a default body. Which line does not compile?',
      code: 'class CsvExporter : IExporter\n{\n    public void Export(Report r) { /* ... */ }\n}\n\nvar csv = new CsvExporter();\nIExporter e = csv;\ncsv.Export(report);\ne.ExportAsync(report, ct);\ncsv.ExportAsync(report, ct);',
      answer: 9,
      explain: 'A default member belongs to the interface; the class does not inherit it. CsvExporter has no ExportAsync method — error CS1061. Through an IExporter variable the call works.'
    },
    {
      t: 'learn',
      title: 'What DIM cannot do',
      body: '<ul><li><b>No state.</b> Interfaces still have no instance fields. A default method works only through other interface members; it cannot see the object\'s data.</li><li><b>Not visible through the class.</b> The class does not inherit a default member: you can call it only through the interface.</li><li><b>The diamond.</b> If two derived interfaces give their own bodies to one base method, and a class implements both without writing its own method — a compile error: there is no most specific implementation.</li><li><b>Structs.</b> Inside a default body <code>this</code> is the interface. A struct that did not override the method is boxed when such a method is called — even from a constrained generic.</li></ul>',
      code: 'interface IShape { string Name() => "shape"; }\ninterface IRound : IShape { string IShape.Name() => "round"; }\ninterface IFlat : IShape { string IShape.Name() => "flat"; }\n\nclass Coin : IRound, IFlat { }   // error: which body to use?',
      deep: '<p>Along with DIM, C# 8 allowed interfaces to have access modifiers on members, <code>private</code> and <code>static</code> methods, static fields and a static constructor. There are still no instance fields or instance constructors: an interface does not hold object state.</p><p>Syntax for calling a base interface implementation (<code>base(IShape).Name()</code>) was discussed for C# 8 but did not make it into the language. If a class overrides the method, it cannot call the default body — shared code goes into a static interface method that both places call.</p><p>The diamond is fixed with one line: the class writes its own <code>Name()</code> — implicitly or explicitly — and that becomes the most specific implementation.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about default interface methods? Select all.',
      options: ['They let you add a method to an interface without breaking old implementations', 'They work on .NET Framework 4.8 if you build with a new compiler', 'You cannot call a default member through a variable of the implementing class', 'They give an interface instance fields', 'A struct that did not override a default method is boxed when it is called'],
      answer: [0, 2, 4],
      explain: 'DIM needs runtime support, and .NET Framework does not have it (CS8701). Interfaces did not get instance fields: only static fields are allowed.'
    },
    {
      t: 'learn',
      title: 'Static abstract members',
      body: '<p>An ordinary interface describes what an <b>object</b> can do. Since C# 11 (.NET 7) an interface can also require <b>static</b> members of the type: a factory, string parsing, a constant, an operator. They are called through the type parameter: <code>T.Parse(...)</code>.</p><p>Before, this needed reflection or a separate factory object. Now the JIT finds the implementation: for a value-type <code>T</code> — when compiling the specialized copy of the method, for reference types — through the generic dictionary in shared code.</p><p>Generic math from the "Generics" unit is built on exactly this.</p>',
      code: 'interface ICommand<TSelf> where TSelf : ICommand<TSelf>\n{\n    static abstract string Name { get; }\n    static abstract TSelf Parse(string args);\n    void Run();\n}\n\nrecord Move(int Steps) : ICommand<Move>\n{\n    public static string Name => "move";\n    public static Move Parse(string args) => new(int.Parse(args));\n    public void Run() => Console.WriteLine($"moving {Steps}");\n}\n\nstatic void Exec<T>(string args) where T : ICommand<T> =>\n    T.Parse(args).Run();   // a static call through the type parameter',
      deep: '<p>In IL the call is <code>constrained. !!T call</code> on the static interface method: the same prefix as for instance calls in generics. There is no object at all, so there is no boxing either.</p><p>Restrictions. You cannot call through the interface itself: <code>ICommand&lt;Move&gt;.Parse("1")</code> is error CS8926. An interface with static abstract members cannot be a type argument: <code>List&lt;ICommand&lt;Move&gt;&gt;</code> does not compile (CS8920), since such a "type" has no body for <code>T.Parse</code>. There is also <code>static virtual</code> — with a default body. In the libraries, <code>IParsable&lt;TSelf&gt;</code> and <code>ISpanParsable&lt;TSelf&gt;</code> require <code>static abstract</code> methods, while a <code>static virtual</code> with a body exists, for example, in <code>IBinaryInteger&lt;TSelf&gt;.DivRem</code>.</p>'
    },
    {
      t: 'blanks',
      q: 'Complete loading a command from text',
      code: 'static T Load<T>(string text) where T : ___<T> =>\n    ___.Parse(text);',
      tiles: ['ICommand', 'T', 'object', 'this', 'Activator'],
      answer: ['ICommand', 'T'],
      explain: 'A static member is called through the type parameter: T.Parse. There is no this in a static method, and the object does not exist yet — Parse is what creates it.'
    },
    {
      t: 'learn',
      title: 'Interface or base class',
      body: '<p>A <b>base class</b> gives you state, constructors, <code>protected</code> members and safe evolution: a new virtual method with a body breaks nothing. The price — you can inherit only one class, and a struct cannot inherit classes at all.</p><p>An <b>interface</b> gives multiple implementation, works with structs and imposes no hierarchy. The price is evolution: a new member either has a default body or breaks people. DIM softens the blow but gives no state.</p><p>A real example is <code>Stream</code>. In .NET Core 2.1 it gained <code>Read(Span&lt;byte&gt;)</code> as a virtual method whose body rents an array and calls the old <code>Read(byte[], int, int)</code>. Every stream written before that kept working. Had <code>Stream</code> been an interface, this would have been impossible before DIM.</p>',
      deep: '<p>The call cost is almost the same: a virtual call uses a fixed slot, an interface call uses a cached stub, and PGO often devirtualizes both. The difference shows only at polymorphic hot spots, and it is not a reason to pick a class over an interface.</p><p>A common library pattern is a narrow interface as the contract plus an abstract base class with shared code for those who like to inherit. Interfaces are also chosen for generics over structs: <code>where T : IComparable&lt;T&gt;</code> gives a call without boxing, while a base class cannot constrain a struct.</p>'
    },
    {
      t: 'choice',
      q: 'Which version 2 change does not break already built derived classes or implementers?',
      options: ['Adding a virtual method with a body to an abstract class', 'Adding a method without a body to an interface', 'Adding an abstract method to an abstract class', 'Making a virtual method of the base class abstract'],
      answer: 0,
      explain: 'Derived classes get a new virtual method with a body as is. Every other option requires a new implementation from each derived type: without it, CS0534 or CS0535 on rebuild and TypeLoadException for old assemblies.'
    },
    {
      t: 'match',
      q: 'Match the task to the tool',
      pairs: [
        ['Need state and protected helpers', 'Abstract base class'],
        ['A capability that a struct implements too', 'Interface'],
        ['A new interface member without breakage', 'Default method'],
        ['A T.Create() factory in a generic', 'static abstract']
      ]
    },
    {
      t: 'choice',
      q: 'A struct implements IShape but does not override Name() — it uses the default body. What happens when calling Describe(ref s), where Describe<T>(ref T x) where T : IShape => x.Name()?',
      options: ['Boxing: the default body needs a this of the interface type', 'A direct call without boxing, as with the struct\'s own method', 'A compile error: the struct has no Name()', 'A runtime exception: the method is missing from the struct\'s table'],
      answer: 0,
      explain: 'constrained. avoids the box only when the value type implements the method itself. The default body lives in the interface and treats this as an interface reference — so the runtime boxes the struct, and field changes inside such a method never reach s.',
      wrong: { 1: 'That would be the case if the struct wrote its own Name(). Then there is no box.' }
    }
  ]
};
