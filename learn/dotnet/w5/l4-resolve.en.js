/** .NET inside out, unit "Assemblies and versions", lesson 4: deps.json, runtimeconfig.json, the TPA and how NuGet picks a package version. */
const DEPS = '"targets": {\n  ".NETCoreApp,Version=v9.0": {\n    "App/1.0.0": {\n      "dependencies": { "Acme.Pricing": "3.7.2" },\n      "runtime": { "App.dll": {} }\n    },\n    "Acme.Pricing/3.7.2": {\n      "runtime": {\n        "lib/net8.0/Acme.Pricing.dll": {\n          "assemblyVersion": "3.0.0.0",\n          "fileVersion": "3.7.2.41"\n        }\n      }\n    }\n  }\n}';

export default {
  id: 'dotnet.w5.l4',
  title: 'How .NET finds assemblies',
  sub: 'deps.json, the TPA and NuGet version rules',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Two JSON files instead of the GAC and probing',
      body: '<p>Build an app and two files appear next to <code>App.dll</code>:</p><ul><li><b>App.runtimeconfig.json</b> — which shared framework is needed (<code>Microsoft.NETCore.App</code>, <code>Microsoft.AspNetCore.App</code>) and which version, plus runtime settings;</li><li><b>App.deps.json</b> — the full list of dependencies: which packages, which files from them, which versions.</li></ul><p>In the unit "How .NET code runs" you saw that hostfxr and hostpolicy read them. How the host picks the runtime version is covered in the next unit. Here we look at what they say about assemblies.</p>',
      code: '{\n  "runtimeOptions": {\n    "tfm": "net9.0",\n    "framework": {\n      "name": "Microsoft.NETCore.App",\n      "version": "9.0.0"\n    }\n  }\n}',
      lang: 'plain'
    },
    {
      t: 'learn',
      title: 'What deps.json holds',
      body: '<p>For each library it records what it depends on and which of its files are needed at run time. For assemblies from packages — the path inside the package and <b>both versions</b>: assemblyVersion and fileVersion.</p><p>The SDK writes this file at build time from the restore result. Nobody edits it by hand.</p>',
      code: DEPS,
      lang: 'plain',
      deep: 'Further down the same file there is a "libraries" section: the kind of each entry (project or package), the sha512 hash of the package and its path in the NuGet cache. Packages with native or platform-specific parts also get "runtimeTargets" — files from runtimes/&lt;rid&gt;/ that the host picks for the current OS and architecture.'
    },
    {
      t: 'choice',
      q: 'What does deps.json store about an assembly from a NuGet package?',
      options: ['The path inside the package, assemblyVersion and fileVersion', 'Only the package name: the host finds the files itself', 'An IL hash of every method', 'The full path on the build machine'],
      answer: 0,
      explain: 'The path in deps.json is relative to the package root. The host computes the full path at startup: the app folder, the framework folders, extra probe paths.'
    },
    {
      t: 'learn',
      title: 'The TPA: a list instead of a disk walk',
      body: '<p>At startup the host turns the app deps.json and the framework deps.json into a list of full paths — the <b>TPA</b> (Trusted Platform Assemblies) — and hands it to the runtime. The next unit covers this chain in detail.</p><p>When code needs an assembly, the default context looks it up in the TPA <b>by simple name</b> — nobody walks the disk. Once found, the version is checked: no lower than requested (lesson 2).</p><p>Which raises a question: what if the same assembly is both in an app package and in the shared framework? Only one gets into the list — <b>the one with the higher version</b>.</p>',
      deep: 'The conflict is resolved twice. At build time the SDK (the ResolvePackageFileConflicts task) compares package files with framework files and drops the losers. At startup hostpolicy, while building the TPA, compares assemblyVersion and, on a tie, fileVersion. That is why deps.json stores both versions: this is the only place where FileVersion affects loading. You can see the outcome in the host trace (COREHOST_TRACE=1).'
    },
    {
      t: 'choice',
      q: 'A net9.0 app transitively gets the System.Text.Json 8.0.5 package. Which System.Text.Json assembly runs?',
      options: ['The one from the 9.0 shared framework: its version is higher', 'The one from package 8.0.5: the app package always wins', 'Both: each for its own consumers', 'Neither: the version conflict stops startup'],
      answer: 0,
      explain: 'In the 9.0 framework System.Text.Json has AssemblyVersion 9.0.0.0; package 8.0.5 has 8.0.0.0. The higher one wins, and code built against 8.0.0.0 accepts it: the version is no lower.',
      wrong: { 2: 'In the default context an assembly with a given name can have only one version.' }
    },
    {
      t: 'learn',
      title: 'NuGet: one package version per project',
      body: '<p>Where does deps.json come from? From <b>restore</b>. NuGet walks the dependency graph, picks <b>exactly one version</b> of each package (per target framework of the project) and writes the result to <code>obj/project.assets.json</code>. From it the SDK adds references, copies files and writes deps.json.</p><p>The first rule is the <b>lowest applicable version</b>. <code>Version="3.7.2"</code> means "3.7.2 or higher", and NuGet takes the lowest available one, not the newest.</p>',
      code: '<ItemGroup>\n  <PackageReference Include="Acme.Pricing" Version="3.7.2" />\n  <PackageReference Include="Acme.Tax" Version="[2.0.0]" />\n  <PackageReference Include="Acme.Log" Version="[1.0,2.0)" />\n  <PackageReference Include="Acme.Feed" Version="5.*" />\n</ItemGroup>',
      lang: 'xml',
      deep: '<p><b>Then:</b> the packages.config format stored a flat list of all packages including transitive ones, conflicts were resolved at the moment each package was installed, and NuGet edited app.config and the .csproj itself. <b>Now:</b> PackageReference resolves the whole graph anew on every restore.</p><p>Floating versions like <code>5.*</code> take the newest match — builds stop being reproducible. If you need them, turn on the <code>packages.lock.json</code> lock file (<code>RestorePackagesWithLockFile</code>).</p>'
    },
    {
      t: 'match',
      q: 'Match the version notation to its meaning',
      pairs: [
        ['3.7.2', '3.7.2 or higher, the lowest available is taken'],
        ['[2.0.0]', 'Exactly 2.0.0'],
        ['[1.0,2.0)', 'From 1.0 inclusive to 2.0 exclusive'],
        ['5.*', 'The newest 5.x at restore time']
      ]
    },
    {
      t: 'learn',
      title: 'Conflicts: direct dependencies and "cousins"',
      body: '<p>Several packages need the same package. Two rules:</p><ul><li><b>Cousin dependencies</b>: different branches require different minimums — NuGet takes <b>the lowest version that satisfies everyone</b>, i.e. the highest of the minimums;</li><li><b>Direct dependency wins</b>: if a package version is specified closer to the root — say, in the project itself — it beats requirements deeper in the graph. Even if it is lower.</li></ul><p>NuGet flags a downgrade with warning <b>NU1605</b>, and in SDK projects it is treated as an error by default. Incompatible requirements (exactly [1.4] and at least 1.6) give error <b>NU1107</b> — then add a direct reference with the version you need.</p>',
      code: 'App\n├─ Acme.Pricing 3.7.2  →  Acme.Log >= 1.4\n└─ Acme.Tax 2.0.0      →  Acme.Log >= 1.6\nresult: Acme.Log 1.6 — the lowest that satisfies both',
      lang: 'plain',
      deep: 'Compare with npm: there each branch can have its own copy of a package. In .NET that is impossible by the nature of the runtime: in the default context an assembly with a given name loads once. So NuGet has to collapse the graph to one version, and compatibility rests on package authors following SemVer. Why exactly this version was chosen is shown by dotnet nuget why App.csproj Acme.Log (SDK 8.0.400 and later) or dotnet list package --include-transitive.'
    },
    {
      t: 'choice',
      q: 'App references Acme.Log 1.2 directly. Acme.Pricing, which App also depends on, requires Acme.Log 1.4 or higher. What does NuGet do?',
      options: ['Takes 1.2 and reports NU1605 — a downgrade', 'Takes 1.4: the package requirement is more important', 'Puts both versions into the project', 'Takes the newest version on the server'],
      answer: 0,
      explain: 'The direct dependency wins, even downward. NU1605 is an error by default in SDK projects, and rightly so: Acme.Pricing may call a method that does not exist in 1.2 yet.'
    },
    {
      t: 'learn',
      title: 'Central Package Management',
      body: '<p>In a solution of 40 projects the versions of one package drift apart quickly. <b>Central Package Management</b> (CPM) gathers them in a single <code>Directory.Packages.props</code> file at the repository root. Projects reference packages without a version.</p><ul><li><code>CentralPackageTransitivePinningEnabled</code> — raise transitive dependencies to the version in the file too. You cannot downgrade this way: error NU1109;</li><li><code>VersionOverride</code> — an exception for a single project.</li></ul>',
      code: '<Project>\n  <PropertyGroup>\n    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>\n  </PropertyGroup>\n  <ItemGroup>\n    <PackageVersion Include="Acme.Log" Version="1.6.0" />\n  </ItemGroup>\n</Project>',
      lang: 'xml',
      deep: 'Transitive pinning is handy for security patches: a vulnerable version came from deep in the graph, and you raise it with one line. But if your project is a library, NuGet writes the pinned packages as explicit dependencies at pack time, and consumers get them too. With more than one package source, CPM reports warning NU1507 and suggests setting up package source mapping.'
    },
    {
      t: 'blanks',
      q: 'Turn on CPM: the version is set in one place, the project references the package without a version',
      code: '<!-- Directory.Packages.props -->\n<ItemGroup>\n  <___ Include="Acme.Log" Version="1.6.0" />\n</ItemGroup>\n\n<!-- App.csproj -->\n<ItemGroup>\n  <___ Include="Acme.Log" />\n</ItemGroup>',
      lang: 'xml',
      tiles: ['PackageVersion', 'PackageReference', 'Reference', 'PackageDownload'],
      answer: ['PackageVersion', 'PackageReference'],
      explain: 'PackageVersion sets the version and does not add the package by itself. PackageReference adds it — without a Version attribute: with CPM on, restore reports an error if it is there.'
    },
    {
      t: 'multi',
      q: 'What is true about modern .NET and NuGet? Select all.',
      options: ['In a project, for one target framework, a package has exactly one version', 'Version="3.7.2" means "exactly 3.7.2"', 'The host takes the list of assemblies to run from deps.json', 'Transitive pinning in CPM can downgrade a version', 'project.assets.json is a restore output and is not committed to git'],
      answer: [0, 2, 4],
      explain: '"3.7.2" is a lower bound; "exactly" is written as [3.7.2]. Transitive pinning only raises versions; an attempt to downgrade is error NU1109.'
    }
  ]
};
