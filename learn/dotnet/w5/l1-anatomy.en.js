/** .NET inside out, unit "Assemblies and versions", lesson 1: what an assembly holds — manifest, modules, resources, type forwarding. */
const MANIFEST = '.assembly extern Shop.Core\n{\n  .ver 2:0:0:0\n}\n.assembly Shop\n{\n  .ver 1:2:0:0\n}\n.mresource public Shop.Data.prices.json\n{\n}\n.class extern forwarder Shop.Money\n{\n  .assembly extern Shop.Core\n}';

export default {
  id: 'dotnet.w5.l1',
  title: 'Inside an assembly',
  sub: 'Manifest, modules, resources and type forwarding',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'An assembly is more than a file',
      body: '<p>In the unit "How .NET code runs" you saw that a .dll holds CIL and metadata. Now something else matters more: an assembly is <b>the unit of deployment and versioning</b>. It has an <b>identity</b> made of four parts: simple name, version, culture and public key.</p><p>A type belongs to an assembly. To the CLR, <code>Shop.Order</code> from the Shop assembly and <code>Shop.Order</code> from the Shop.Legacy assembly are two different types, even though the names match.</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.FullName);\n// Shop, Version=1.2.0.0, Culture=neutral, PublicKeyToken=null\nConsole.WriteLine(typeof(string).Assembly.GetName().Name);\n// System.Private.CoreLib',
      deep: '<p>This explains a famous puzzle: <code>InvalidCastException: Unable to cast object of type \'Shop.Order\' to type \'Shop.Order\'</code>. It means the same assembly got loaded twice (say, from two paths or into two load contexts): the full type name matches, the type does not. How assemblies end up in different contexts is the topic of the next unit.</p><p><code>PublicKeyToken=null</code> means the assembly has no strong name. Strong names are lesson 3.</p>'
    },
    {
      t: 'learn',
      title: 'The manifest: the assembly passport',
      body: '<p>The <b>manifest</b> is the part of the metadata that describes the assembly as a whole rather than individual types. It is a few tables:</p><ul><li><b>Assembly</b> — its own identity: name, version, culture, public key;</li><li><b>AssemblyRef</b> — which assemblies it depends on and <b>which versions</b> it expects;</li><li><b>ManifestResource</b> — embedded resources;</li><li><b>ExportedType</b> — types the assembly hands over to another assembly;</li><li><b>File</b> — other files of the assembly (needed by multi-file assemblies).</li></ul><p>This is how a manifest looks in a disassembler:</p>',
      code: '.assembly extern System.Runtime\n{\n  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )\n  .ver 9:0:0:0\n}\n.assembly Shop\n{\n  .ver 1:2:0:0\n}\n.module Shop.dll',
      lang: 'il',
      deep: 'The .ver line in .assembly extern is the version the compiler built your code against. It wrote it into AssemblyRef for good: you can rebuild the dependency, but the reference inside Shop.dll stays 9.0.0.0 until you rebuild Shop itself. What the loader does with that number is lesson 2.'
    },
    {
      t: 'choice',
      q: 'What makes up an assembly identity?',
      options: ['Name, version, culture and public key', 'File name and build date', 'Name, AssemblyVersion and FileVersion', 'File path and IL hash'],
      answer: 0,
      explain: 'These four parts are stored in the Assembly table and in every AssemblyRef. File name, path and date are not part of the identity.',
      wrong: { 2: 'FileVersion is a resource for Windows Explorer and is not part of the identity. More in lesson 2.' }
    },
    {
      t: 'learn',
      title: 'Modules: then and now',
      body: '<p>A <b>module</b> is one PE file with metadata. An assembly consists of modules, and one of them holds the manifest.</p><p><b>Then.</b> In .NET Framework an assembly could span several files: <code>csc -target:module</code> produced a <code>.netmodule</code> file without a manifest, and the File table of the main module listed the others with their hashes. This let you glue code in different languages into one assembly or download rarely used parts over the network.</p><p><b>Now.</b> Modern .NET does not support multi-file assemblies: one assembly, one module, one file. Single-file publishing is an entirely different mechanism, covered in the next unit.</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.ManifestModule.Name);  // Shop.dll\nConsole.WriteLine(asm.GetModules().Length);  // 1',
      deep: 'Every module has its own &lt;Module&gt; type in the metadata — it holds global functions and the module initializer ([ModuleInitializer] in C# 9). Metadata is addressed by tokens scoped to a module, so references between modules of one assembly went through a separate ModuleRef table. In modern projects this legacy barely shows up.'
    },
    {
      t: 'multi',
      q: 'What does every modern .NET assembly have? Select all.',
      options: ['A manifest with its identity', 'Exactly one module — the file itself', 'Metadata', 'Embedded resources', 'A .netmodule file next to it'],
      answer: [0, 1, 2],
      explain: 'Resources are optional. .netmodule files were part of multi-file assemblies in .NET Framework; the modern runtime does not load them.'
    },
    {
      t: 'learn',
      title: 'Resources inside an assembly',
      body: '<p>For a file with the <b>EmbeddedResource</b> build action, the compiler puts its bytes right into the PE file and its name into the ManifestResource table. The name is built like this: the project root namespace, the file path with dots, the file name.</p><p>You read a resource as a stream, without unpacking it to disk.</p>',
      code: '// in Shop.csproj: <EmbeddedResource Include="Data\\prices.json" />\nvar asm = typeof(Order).Assembly;\nforeach (var name in asm.GetManifestResourceNames())\n    Console.WriteLine(name);   // Shop.Data.prices.json\n\nusing var s = asm.GetManifestResourceStream("Shop.Data.prices.json")!;',
      deep: '<p><code>.resx</code> files are compiled into binary <code>.resources</code> and embedded the same way; <code>ResourceManager</code> reads them.</p><p>Translations go into <b>satellite assemblies</b>: <code>ru/Shop.resources.dll</code>. Such an assembly has culture <code>ru</code> in its identity and contains no code — only resources. <code>ResourceManager</code> looks for the assembly of the current UI culture, then of its parent culture, and finally falls back to the resources in the main assembly.</p>'
    },
    {
      t: 'blanks',
      q: 'Print the names of all embedded resources and open each one',
      code: 'var asm = typeof(Order).Assembly;\nforeach (var name in asm.___())\n{\n    using var s = asm.___(name)!;\n    Console.WriteLine($"{name}: {s.Length} bytes");\n}',
      tiles: ['GetManifestResourceNames', 'GetManifestResourceStream', 'GetFiles', 'GetTypes', 'GetManifestResourceInfo'],
      answer: ['GetManifestResourceNames', 'GetManifestResourceStream'],
      explain: 'Names come from the ManifestResource table; the stream reads the resource bytes from the PE file. GetFiles is about the files of a multi-file assembly and has nothing to do with embedded resources.'
    },
    {
      t: 'learn',
      title: 'Version 2: a type moves to another assembly',
      body: '<p>In version 2 the <code>Money</code> class moves from Shop.dll to the new Shop.Core.dll. The old app was not rebuilt, and its IL says <code>[Shop]Shop.Money</code>: the CLR looks for the type in Shop, does not find it — <code>TypeLoadException</code>.</p><p>The fix is <b>type forwarding</b>. Shop.dll references Shop.Core and declares an attribute. The compiler writes a row into the ExportedType table, and the CLR, failing to find the type in Shop, follows that row.</p>',
      code: '// Shop.dll, version 2: Money now lives in Shop.Core.dll\nusing System.Runtime.CompilerServices;\n\n[assembly: TypeForwardedTo(typeof(Shop.Money))]',
      deep: '<p>The whole modern BCL relies on forwarding. Your code is compiled against <code>System.Runtime</code>, but at run time System.Runtime.dll is an almost empty assembly that forwards <code>Object</code>, <code>String</code> and the rest to <code>System.Private.CoreLib</code>. <code>netstandard.dll</code> from the history course works the same way: a facade that on each platform forwards types to wherever they really live.</p><p>The opposite attribute, <code>TypeForwardedFrom</code>, is not for the loader but for serializers that stored the old assembly name in their data.</p>'
    },
    {
      t: 'choice',
      q: 'Money moved from Shop.dll to Shop.Core.dll without TypeForwardedTo. The old App.exe was not rebuilt. What happens?',
      options: ['TypeLoadException once the Money type is needed', 'It works: the CLR finds the type by name in any loaded assembly', 'App.exe will not start: a verification error at process start', 'Money is loaded from an old copy of Shop.dll in a cache'],
      answer: 0,
      explain: 'A type reference in IL includes the assembly. The CLR looks for Money only in Shop and fails as soon as the JIT compiles a method that needs that type.',
      wrong: { 1: 'There is no such "search every assembly": the assembly name is part of the type reference.' }
    },
    {
      t: 'tapline',
      q: 'The manifest of Shop.dll version 2. Which line lets old code find Money?',
      code: MANIFEST,
      lang: 'il',
      answer: 11,
      explain: '.class extern forwarder is a row of the ExportedType table: "look for Shop.Money in Shop.Core". The TypeForwardedTo attribute creates it.'
    },
    {
      t: 'learn',
      title: 'Reference assemblies: compile against one, run another',
      body: '<p>The compiler needs only signatures, not method bodies. That is what <b>reference assemblies</b> are: the same public types and methods, but with <code>throw null</code> instead of bodies.</p><p>Your project is compiled against reference assemblies from the <code>Microsoft.NETCore.App.Ref</code> pack and runs against the real assemblies of the installed runtime. The only link between them is the identity: name and version in AssemblyRef.</p>',
      code: '// what a method looks like in a reference assembly\npublic static int Parse(string s) => throw null;',
      deep: 'A reference assembly carries ReferenceAssemblyAttribute, and the runtime refuses to execute it: BadImageFormatException. The SDK builds a reference assembly for your own projects too (obj/…/ref/): if the public API did not change, dependent projects are not recompiled. That is where fast incremental builds in large solutions come from.'
    },
    {
      t: 'match',
      q: 'Match the manifest table to what it holds',
      pairs: [
        ['Assembly', 'The assembly\'s own identity'],
        ['AssemblyRef', 'A dependency and the version it was built against'],
        ['ManifestResource', 'An embedded file'],
        ['ExportedType', 'A type forwarded to another assembly'],
        ['File', 'Other modules of a multi-file assembly']
      ]
    }
  ]
};
