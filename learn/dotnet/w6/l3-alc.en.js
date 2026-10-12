/** .NET inside out, unit "Loading and hosting", lesson 3: AppDomain then, AssemblyLoadContext now: plugins and dependency isolation. */
export default {
  id: 'dotnet.w6.l3',
  title: 'AssemblyLoadContext and plugins',
  sub: 'AppDomain then, load contexts now',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Then: AppDomain, a process inside a process',
      body: '<p>In .NET Framework one process could hold several <b>application domains</b> (AppDomains). Each had its own loaded assemblies and its own static fields. A call into another domain went through remoting: the object was either serialized or derived from <code>MarshalByRefObject</code> and called through a proxy. It was slow.</p><p>In return, <code>AppDomain.Unload</code> unloaded a whole domain, by force: its threads were aborted and its assemblies vanished. That is how IIS kept several sites in one process and restarted them one at a time.</p><p>Now: .NET (Core) has <b>one</b> domain. <code>AppDomain.CurrentDomain</code> stays for its events, <code>UnhandledException</code>, <code>ProcessExit</code>, <code>AssemblyResolve</code>, but you cannot create a new domain.</p>',
      deep: 'Why it was dropped: domain isolation was expensive to implement and was not a real security boundary, since fully trusted code could escape the domain. Microsoft porting advice: for isolation use a separate process or container; for loading and unloading code use AssemblyLoadContext. Remoting and the Code Access Security sandbox went away together with domains.'
    },
    {
      t: 'choice',
      q: 'Old plugin host code is being ported to .NET 8. What does this line do?',
      code: 'AppDomain sandbox = AppDomain.CreateDomain("plugins");',
      options: ['Throws PlatformNotSupportedException at run time', 'Does not compile: the method is gone', 'Creates a new domain, as in .NET Framework', 'Returns the current domain'],
      answer: 0,
      explain: 'The method is kept in the API for source compatibility, so the code compiles. But when called it throws PlatformNotSupportedException: modern .NET cannot create a second domain.',
      wrong: { 1: 'The AppDomain class and the CreateDomain method are in the API; otherwise porting old code would break at build time.' }
    },
    {
      t: 'learn',
      title: 'Now: AssemblyLoadContext',
      body: '<p>An <b>AssemblyLoadContext</b> (ALC) is a dictionary "simple assembly name to loaded assembly" plus rules for where to find missing ones. The key rule: within one context a name has <b>one</b> version. If the assembly is already loaded, a request for another version succeeds only if the loaded one is not lower than the requested one.</p><p><code>AssemblyLoadContext.Default</code> is created at startup and loads from the TPA, the list hostpolicy built. It cannot be unloaded, and its lookup can be customized only through events.</p><p>Your own context is a new dictionary. In it you can load Newtonsoft.Json 12 while the host works with version 13.</p>',
      deep: 'The isolation here is by name only: contexts share one heap, one GC, the same threads. A type loaded into two contexts is two different types with their own static fields and their own MethodTables. To find an assembly context use AssemblyLoadContext.GetLoadContext(assembly); all contexts in the process: AssemblyLoadContext.All.'
    },
    {
      t: 'multi',
      q: 'What does a separate AssemblyLoadContext give you? Select all.',
      options: ['Two versions of one library in one process', 'Separate static fields for a copy of a type loaded into this context', 'Memory protection: a plugin cannot corrupt host objects', 'Assembly unloading, if the context is created collectible', 'A separate heap and its own garbage collector'],
      answer: [0, 1, 3],
      explain: 'A context isolates names, not memory. The heap, the GC and the threads are shared, and plugin code can do anything to host objects that its references allow. For real isolation run the plugin in a separate process.'
    },
    {
      t: 'learn',
      title: 'How a context finds an assembly by name',
      body: '<p>First the <b>active context</b> is chosen. For a static reference it is the context that loaded the referring assembly. That is why plugin dependencies go into the plugin context by themselves.</p><p>Then the active context tries in order and stops at the first success:</p><ul><li>its own cache by name;</li><li>its own <code>Load</code> method, the one you override;</li><li>the default context: its cache and the TPA;</li><li>the <code>Resolving</code> event of the active context;</li><li>the <code>AppDomain.AssemblyResolve</code> event.</li></ul><p>A <code>Load</code> that returns <code>null</code> means "not mine, ask Default". Splitting off shared assemblies is built on this.</p>'
    },
    {
      t: 'order',
      q: 'A plugin first touches a type from Dapper. Put in order where the plugin context looks for the assembly',
      items: ['The plugin context cache by name', 'The overridden Load of the plugin context', 'Default: its cache and the TPA', 'The Resolving event of the plugin context', 'The AppDomain.AssemblyResolve event'],
      explain: 'Own cache, own Load, then Default, and only then the events. The AssemblyResolve handler is the last chance, shared by the whole process.'
    },
    {
      t: 'learn',
      title: 'One type, two identities',
      body: '<p>A type in .NET is defined not just by its name but by the <b>assembly instance</b>. If the plugin context loads its own copy of <code>Contracts.dll</code>, the host <code>IPlugin</code> and the plugin <code>IPlugin</code> are different types. A cast in the host throws <code>InvalidCastException</code>, and the message names both types identically.</p><p>The rule: shared contracts live only in Default. The plugin <code>Load</code> returns <code>null</code> for them, and they are not put into the plugin folder at all:</p>',
      code: '<PropertyGroup>\n  <EnableDynamicLoading>true</EnableDynamicLoading>\n</PropertyGroup>\n<ItemGroup>\n  <ProjectReference Include="..\\Contracts\\Contracts.csproj">\n    <Private>false</Private>\n    <ExcludeAssets>runtime</ExcludeAssets>\n  </ProjectReference>\n</ItemGroup>',
      lang: 'xml',
      deep: '<p><code>EnableDynamicLoading</code> marks the project as a dynamically loaded component: all dependencies are copied to the output, and plugin.deps.json appears. <code>Private=false</code> and <code>ExcludeAssets=runtime</code> keep Contracts.dll (and its package dependencies) out of the plugin folder.</p><p>To find where two "identical" types came from, compare <code>a.GetType().Assembly</code> and <code>AssemblyLoadContext.GetLoadContext(...)</code> for both objects.</p>'
    },
    {
      t: 'choice',
      q: 'The host loads a plugin into its own context. The line (IPlugin)Activator.CreateInstance(type)! throws InvalidCastException, although the type implements IPlugin. The plugin folder contains Contracts.dll. What is the cause?',
      options: ['The plugin context loaded its own copy of Contracts.dll', 'The plugin targets a different .NET version', 'Activator cannot create types from another context', 'IPlugin must be marked [Serializable]'],
      answer: 0,
      explain: 'The plugin Load found Contracts.dll next to it and loaded it into the plugin context. Now that context has its own IPlugin. Remove the contracts assembly from the plugin output or return null for it in Load; then it comes from Default, shared with the host.',
      wrong: { 3: '[Serializable] and marshaling were needed for calls between domains. Contexts share one heap, and the object is passed by reference.' }
    },
    {
      t: 'learn',
      title: 'AssemblyDependencyResolver: the plugin deps.json',
      body: '<p>Where the plugin dependencies are is recorded in its <code>plugin.deps.json</code> (the format is in the unit "Assemblies and versions"). <b>AssemblyDependencyResolver</b> reads it and turns the name of an assembly or a native library into a full path. Found: load it into the plugin context. Not found (a framework assembly or a shared contract): <code>null</code>, and the assembly comes from Default.</p>',
      code: 'class PluginLoadContext : AssemblyLoadContext\n{\n    private readonly AssemblyDependencyResolver _resolver;\n\n    public PluginLoadContext(string pluginPath)\n        => _resolver = new AssemblyDependencyResolver(pluginPath);\n\n    protected override Assembly? Load(AssemblyName name)\n    {\n        string? path = _resolver.ResolveAssemblyToPath(name);\n        return path != null ? LoadFromAssemblyPath(path) : null;\n    }\n\n    protected override IntPtr LoadUnmanagedDll(string name)\n    {\n        string? path = _resolver.ResolveUnmanagedDllToPath(name);\n        return path != null ? LoadUnmanagedDllFromPath(path) : IntPtr.Zero;\n    }\n}',
      deep: 'The resolver understands the same things as hostpolicy: runtimes/&lt;rid&gt;/ folders for platform-specific assemblies, native libraries, satellite resource assemblies. So a plugin with a native dependency (SQLite, for example) works without hand-parsing folders. If an assembly exists in both the host and the plugin, Load makes the choice: return a path and the plugin gets its own copy, return null and it gets the shared one from Default.'
    },
    {
      t: 'blanks',
      q: 'Complete the Load method of the plugin context',
      code: 'protected override Assembly? Load(AssemblyName name)\n{\n    string? path = _resolver.___(name);\n    return path != null ? ___(path) : null;\n}',
      tiles: ['ResolveAssemblyToPath', 'LoadFromAssemblyPath', 'Assembly.LoadFrom', 'ResolveUnmanagedDllToPath', 'LoadFromStream'],
      answer: ['ResolveAssemblyToPath', 'LoadFromAssemblyPath'],
      explain: 'LoadFromAssemblyPath is a method of this same context, so the assembly lands in it. Assembly.LoadFrom would load it into Default, and the isolation would be gone.'
    },
    {
      t: 'learn',
      title: 'LoadFrom, LoadFile and Load(byte[]) today',
      body: '<p>The old <code>Assembly</code> methods still work, but on top of contexts:</p><ul><li><code>Assembly.LoadFrom(path)</code> loads into <b>Default</b> and adds an <code>AssemblyResolve</code> handler that looks for dependencies in the same folder;</li><li><code>Assembly.LoadFile(path)</code> loads into a <b>new unnamed</b> context;</li><li><code>Assembly.Load(byte[])</code> also loads into a new context, one per call.</li></ul><p>The Default trap: if an assembly with that name is in the TPA, the default context takes it, even if you explicitly passed another path or stream. That is why plugins are loaded into their own context, not into Default.</p>',
      deep: 'Assembly.LoadFile caches assemblies by path: a second call with the same path returns the same assembly. The dependencies of such an assembly are found by the normal algorithm, which mostly means Default. Assembly.Load(string) and Type.GetType(string) pick the active context from the calling code or from AssemblyLoadContext.CurrentContextualReflectionContext; EnterContextualReflection sets it so that reflection inside a plugin finds plugin assemblies.'
    },
    {
      t: 'choice',
      q: 'The host TPA contains Newtonsoft.Json 13. The host calls AssemblyLoadContext.Default.LoadFromAssemblyPath("plugins/Newtonsoft.Json.dll"), which is version 12. What gets loaded?',
      options: ['Version 13 from the TPA', 'Version 12 from the plugins folder', 'Both: Default will hold two versions', 'FileLoadException: version conflict'],
      answer: 0,
      explain: 'In the default context an assembly in the TPA with the same name takes precedence over the given path. To get version 12 you must load it into a separate context.',
      wrong: { 2: 'Within one context a name has only one version. Two versions are possible only in two contexts.' }
    },
    {
      t: 'match',
      q: 'Where does the assembly go?',
      pairs: [
        ['alc.LoadFromAssemblyPath(path)', 'Into the alc context'],
        ['A static reference from a plugin assembly', 'The plugin context starts the lookup'],
        ['Assembly.LoadFrom(path)', 'Into Default, dependencies from the same folder'],
        ['Assembly.LoadFile(path)', 'Into a new unnamed context']
      ]
    }
  ]
};
