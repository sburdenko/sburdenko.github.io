/** .NET inside out, unit "Assemblies and versions", lesson 2: AssemblyVersion, FileVersion, InformationalVersion and which one the loader looks at. */
export default {
  id: 'dotnet.w5.l2',
  title: 'Three assembly versions',
  sub: 'Which one the loader looks at — and where that leads',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'One number in the project, four in the output',
      body: '<p>A library actually has several versions, and they live in different places:</p><ul><li><b>AssemblyVersion</b> — in the metadata, part of the identity. The compiler also writes it into the AssemblyRef of every consumer;</li><li><b>FileVersion</b> — in the Win32 VERSIONINFO resource; Explorer shows it in the file properties;</li><li><b>InformationalVersion</b> — an attribute with a free-form string: the product version;</li><li><b>PackageVersion</b> — in the package .nuspec; only NuGet sees it.</li></ul><p>In an SDK project you usually set a single <code>Version</code> property, and the SDK derives the rest from it.</p>',
      code: '<PropertyGroup>\n  <Version>2.4.1-beta.2</Version>\n</PropertyGroup>\n<!-- the SDK derives:\n     AssemblyVersion      2.4.1.0\n     FileVersion          2.4.1.0\n     InformationalVersion 2.4.1-beta.2+a1b2c3d\n     PackageVersion       2.4.1-beta.2 -->',
      lang: 'xml',
      deep: '<p>The SDK generates the attributes into <code>obj/…/Shop.AssemblyInfo.cs</code> (the <code>GenerateAssemblyInfo</code> property). The <code>+a1b2c3d</code> suffix is the commit hash: starting with the .NET 8 SDK, Source Link is built in and appends it to InformationalVersion by default. Turn it off with <code>IncludeSourceRevisionInInformationalVersion=false</code>.</p><p>Each of the four parts is a 16-bit number; in AssemblyVersion it is at most 65,534. A CI build number like 70,000 does not fit there.</p>'
    },
    {
      t: 'match',
      q: 'Match the version to who reads it',
      pairs: [
        ['AssemblyVersion', 'The CLR loader: part of the identity'],
        ['FileVersion', 'Windows Explorer in the file properties'],
        ['InformationalVersion', 'People: a product string with the commit hash'],
        ['PackageVersion', 'NuGet during restore']
      ]
    },
    {
      t: 'learn',
      title: 'AssemblyVersion gets baked into the consumer',
      body: '<p>The app was built against Shop 2.4.1.0 — its manifest now permanently says <code>.assembly extern Shop { .ver 2:4:1:0 }</code>. Later Shop.dll in the folder is replaced with a new one. Whether the runtime accepts it is decided by comparing this number with the version of the assembly it found.</p><p>The other versions are only read by code, explicitly:</p>',
      code: 'var asm = typeof(Order).Assembly;\nConsole.WriteLine(asm.GetName().Version);  // 2.4.1.0\nConsole.WriteLine(asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()\n    ?.InformationalVersion);               // 2.4.1-beta.2+a1b2c3d\nConsole.WriteLine(FileVersionInfo.GetVersionInfo(asm.Location).FileVersion);\n                                           // 2.4.1.0',
      deep: 'The old trick AssemblyVersion("1.0.*") — a version made from the build date and time — gives error CS8357 in SDK projects: deterministic compilation (Deterministic, on by default) is incompatible with wildcards. And that is good: a version that changes on every build would break binding of strong-named assemblies in .NET Framework. Also note that in a single-file app Location is an empty string, so FileVersionInfo cannot be read this way.'
    },
    {
      t: 'choice',
      q: 'Which version does the CLR loader compare when it looks for a dependency?',
      options: ['AssemblyVersion', 'FileVersion', 'InformationalVersion', 'The NuGet package version'],
      answer: 0,
      explain: 'Only AssemblyVersion is part of the identity and is stored in AssemblyRef. The loader needs none of the others.',
      wrong: { 1: 'FileVersion is a Win32 resource for Explorer. The CLR loader does not compare it.', 3: 'The package version stays in NuGet. It never gets into the assembly or into AssemblyRef.' }
    },
    {
      t: 'learn',
      title: 'Then: exact match. Now: no lower',
      body: '<p><b>.NET Framework</b> requires an <b>exact</b> match of the AssemblyRef version for a strong-named assembly. A different one is found — <code>FileLoadException</code> ("The located assembly\'s manifest definition does not match the assembly reference"), unless the configuration has a binding redirect. For an assembly without a strong name, Framework does not check the version at all.</p><p><b>.NET Core and .NET 5+</b> have no strict binding: an assembly with a version <b>no lower</b> than requested is fine. Lower — the same <code>FileLoadException</code>.</p><ul><li>requested 12.0.0.0, found 13.0.0.0: Framework — error (without a redirect), .NET 8 — loads;</li><li>requested 13.0.0.0, found 12.0.0.0: an error everywhere.</li></ul>',
      deep: 'You rely on this rule every day: an app built for net8.0 references System.Runtime 8.0.0.0, and when it runs on runtime 9 (via rollForward) it gets System.Runtime 9.0.0.0 — and that is fine. In Framework, the same problem for its own assemblies was solved by "unification": references to any version of the system assemblies were automatically mapped to the version of the installed Framework.'
    },
    {
      t: 'choice',
      q: 'The Reports library was built against Newtonsoft.Json 12.0.0.0. The folder of a .NET 8 app holds Newtonsoft.Json with AssemblyVersion 13.0.0.0. What happens?',
      options: ['13.0.0.0 loads: the version is no lower than requested', 'FileLoadException: the version does not match', 'A binding redirect in app.config is required', 'Both versions load side by side'],
      answer: 0,
      explain: 'The modern loader accepts a version no lower than requested. Whether 13 is compatible with code built against 12 is the library author\'s responsibility.',
      wrong: { 1: 'That is what .NET Framework would do with a strong-named assembly.', 2: 'The modern runtime does not read binding redirects from app.config: it does not need them.' }
    },
    {
      t: 'learn',
      title: 'Why library AssemblyVersions are "round"',
      body: '<p>Microsoft guidance for libraries: keep <b>only the major</b> version in AssemblyVersion. Packages 3.0, 3.1 and 3.7.2 get AssemblyVersion <code>3.0.0.0</code>, version 4 gets <code>4.0.0.0</code>. This way Framework consumers need binding redirects less often. The CI build number goes into FileVersion, where it bothers nobody.</p><p>But do not freeze AssemblyVersion forever: then only one version fits in the GAC, and an update breaks everyone who references it.</p>',
      code: '<PropertyGroup>\n  <Version>3.7.2</Version>\n  <AssemblyVersion>3.0.0.0</AssemblyVersion>\n  <FileVersion>3.7.2.41</FileVersion>\n</PropertyGroup>',
      lang: 'xml',
      deep: 'This scheme has a price in modern .NET. The app was built against 3.7.2, but deployment put 3.5.0 into the folder — both have AssemblyVersion 3.0.0.0, and the "no lower" check silently passes. If the code calls a method added in 3.7, you get MissingMethodException when the JIT compiles the calling method instead of a clear load error. Restore protects you here: NuGet will not drop a package below the required version without warning NU1605. But it does not see a file copied into the folder by hand.'
    },
    {
      t: 'blanks',
      q: 'GenerateAssemblyInfo is off and you write the attributes yourself. Fill in: identity, file number with the CI build number, product string',
      code: '[assembly: ___("3.0.0.0")]\n[assembly: ___("3.7.2.41")]\n[assembly: ___("3.7.2+a1b2c3d")]',
      tiles: ['AssemblyVersion', 'AssemblyFileVersion', 'AssemblyInformationalVersion', 'AssemblyProduct', 'AssemblyTitle'],
      answer: ['AssemblyVersion', 'AssemblyFileVersion', 'AssemblyInformationalVersion'],
      explain: 'If you leave GenerateAssemblyInfo on and write these attributes by hand, the compiler reports CS0579: duplicate attribute. Usually versions are set with properties in the .csproj.'
    },
    {
      t: 'learn',
      title: 'Version 2: "no lower" does not mean "compatible"',
      body: '<p>The loader checks only the number. It does not look inside. In version 3.1 the Shop author removed <code>Order.Total()</code> and kept AssemblyVersion <code>3.0.0.0</code>. Reports.dll was built against 3.0 and calls <code>Total</code>.</p><p>The assembly loads without errors. It fails later — <code>MissingMethodException</code> when the JIT compiles the method containing that call. That is why breaking changes ship only in a new major version: SemVer is a contract the runtime will not check for you.</p>',
      code: '// Reports.dll built against Shop 3.0: calls Order.Total()\n// the folder has Shop 3.1 (AssemblyVersion 3.0.0.0), Total removed\nreport.Print(order);  // MissingMethodException when Print is JIT-compiled'
    },
    {
      t: 'choice',
      q: 'What does the .NET 8 loader check about a dependency it found?',
      options: ['The name, and that the version is no lower than requested', 'That the set of public methods matches what was expected', 'That FileVersion matches the one stored in the reference', 'The strong-name signature'],
      answer: 0,
      explain: 'The loader does not check API compatibility, the reference does not store FileVersion, and the modern runtime never validates the strong-name signature.'
    },
    {
      t: 'tapline',
      q: 'The About window needs the version with the beta suffix. Which line gives it?',
      code: 'var asm = Assembly.GetEntryAssembly()!;\nstring a = asm.GetName().Version!.ToString();\nstring b = FileVersionInfo.GetVersionInfo(asm.Location).FileVersion!;\nstring c = asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()!\n    .InformationalVersion;\nstring d = asm.ImageRuntimeVersion;',
      answer: 3,
      explain: 'Suffixes like -beta.2 and the commit hash exist only in InformationalVersion. AssemblyVersion and FileVersion are four numbers, and ImageRuntimeVersion is the metadata format version, which for modern assemblies is "v4.0.30319".'
    },
    {
      t: 'multi',
      q: 'What is true about versions? Select all.',
      options: ['FileVersion can change on every CI build with no effect on consumers', 'Changing the AssemblyVersion of a strong-named assembly requires redirects for .NET Framework consumers', 'InformationalVersion takes part in binding on .NET 8', 'On .NET 8 an assembly whose AssemblyVersion is lower than in the reference will not load', 'The NuGet package version is written into the consumer\'s AssemblyRef'],
      answer: [0, 1, 3],
      explain: 'Of all the versions, binding looks only at AssemblyVersion. The package version lives in NuGet and never gets into the assembly.'
    }
  ]
};
