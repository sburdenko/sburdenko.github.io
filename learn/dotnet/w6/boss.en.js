/** .NET inside out, final of the unit "Loading and hosting". */
export default {
  id: 'dotnet.w6.boss',
  title: 'Final: loading and hosting',
  sub: 'The host, runtime versions, contexts, unloading and crashes',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'order',
      q: 'Assemble the startup of dotnet app.dll from the command to Main',
      items: ['The muxer takes the newest hostfxr from host/fxr', 'hostfxr reads runtimeconfig.json and picks a Microsoft.NETCore.App version', 'hostpolicy from the framework folder builds the TPA from deps.json', 'coreclr starts the GC and JIT and loads System.Private.CoreLib', 'The default context loads app.dll, and Main is called'],
      explain: 'hostfxr picks the runtime version, not the muxer. The assembly list is ready before the CLR starts, and the default context takes assemblies from it.'
    },
    {
      t: 'choice',
      q: 'An app requests 8.0.0. Installed: 8.0.17, 9.0.6 and 10.0.2. runtimeconfig.json says rollForward = Major, but the service is started with DOTNET_ROLL_FORWARD=LatestMajor. Which runtime is picked?',
      options: ['10.0.2', '8.0.17', '9.0.6', 'Startup fails: the settings contradict each other'],
      answer: 0,
      explain: 'The environment variable overrides runtimeconfig.json, and LatestMajor takes the newest version even when its own major is present. With Major from the file, 8.0.17 would be picked.',
      wrong: { 1: 'That is what Major from runtimeconfig.json would decide. But DOTNET_ROLL_FORWARD outranks the file.', 2: 'Major would take the nearest next major, and only if 8.x were missing entirely.' }
    },
    {
      t: 'multi',
      q: 'What is true about hosting? Select all.',
      options: ['DOTNET_ROOT overrides the registered install location for the apphost', 'global.json affects the runtime choice for dotnet app.dll', 'One process can hold both .NET 8 and .NET 9', 'A self-contained app has hostfxr in the app folder'],
      answer: [0, 3],
      explain: 'The apphost checks DOTNET_ROOT before the registry or /etc/dotnet and takes the first install found. global.json selects only the SDK. A process always has exactly one runtime.'
    },
    {
      t: 'choice',
      q: 'The host TPA has Newtonsoft.Json 13. A plugin loads into a PluginLoadContext with an AssemblyDependencyResolver, and its folder and plugin.deps.json have Newtonsoft.Json 12. Which version does the plugin code get?',
      options: ['12: the plugin Load found it before Default was reached', '13: an assembly from the TPA always wins', 'Both: each call gets its own', 'FileLoadException: two versions of one name in the process'],
      answer: 0,
      explain: 'The active context for plugin references is the plugin own context. First its cache, then its Load: the resolver returned the path to version 12, and it was loaded into the plugin context. Default and the TPA were never reached.',
      wrong: { 1: 'The TPA beats a path only inside the default context. In your own context its Load decides.', 3: 'Two versions in a process are fine if they are in different contexts. That is exactly what contexts are for.' }
    },
    {
      t: 'tapline',
      q: 'Create is a host method that loads the plugin into alc. After Run and the GC.Collect loop the context is alive. Which line blocks unloading?',
      code: '[MethodImpl(MethodImplOptions.NoInlining)]\nstatic WeakReference Run(string path)\n{\n    var alc = new PluginLoadContext(path);\n    IPlugin plugin = Create(alc, path);\n    string report = plugin.BuildReport();\n    Host.Settings.Changed += plugin.OnSettingsChanged;\n    Console.WriteLine(report);\n    alc.Unload();\n    return new WeakReference(alc);\n}',
      answer: 6,
      explain: 'The event of a long-lived host object stores a delegate, and the delegate references the plugin object. Through it the type, the assembly and the context are kept alive. The report string is a plain System.String and does not hold the context.'
    },
    {
      t: 'choice',
      q: 'A .NET 8 service crashed overnight. The UnhandledException handler logged an exception from a System.Threading.Timer callback. How do you keep such errors from bringing the service down?',
      options: ['Catch exceptions inside the timer callback', 'Set e.IsTerminating = false in the UnhandledException handler', 'Turn on legacyUnhandledExceptionPolicy in runtimeconfig.json', 'Create the timer inside a separate AssemblyLoadContext'],
      answer: 0,
      explain: 'A timer callback runs on the thread pool, and there is no handler above it. The only place the exception can be handled is the callback itself: a try/catch with logging and a decision about what to do next.',
      wrong: { 1: 'IsTerminating only reports that the process is ending. The property cannot be changed, and the crash cannot be cancelled.', 2: 'That flag lived in the .NET Framework app.config. Modern .NET does not have it.', 3: 'A load context isolates assembly names, not threads or exceptions.' }
    },
    {
      t: 'blanks',
      q: 'You need one executable with the runtime inside, trimmed for size. Complete the project.',
      code: '<PropertyGroup>\n  <RuntimeIdentifier>linux-x64</RuntimeIdentifier>\n  <SelfContained>true</SelfContained>\n  <___>true</___>\n  <PublishTrimmed>true</PublishTrimmed>\n</PropertyGroup>',
      lang: 'xml',
      tiles: ['PublishSingleFile', 'PublishSingleFile', 'PublishReadyToRun', 'UseAppHost', 'EnableDynamicLoading'],
      answer: ['PublishSingleFile', 'PublishSingleFile'],
      explain: 'PublishSingleFile appends the assemblies to the apphost as one bundle. SelfContained puts the runtime inside, and PublishTrimmed removes unused code. Remember: assemblies from the bundle have an empty Assembly.Location.'
    },
    {
      t: 'match',
      q: 'Match the symptom with its cause',
      pairs: [
        ['InvalidCastException between "identical" types', 'The contract is loaded into two contexts'],
        ['Assembly.Location is an empty string', 'Single-file publishing'],
        ['MissingMethodException in a plugin', 'Trimming removed a framework API'],
        ['The context does not unload', 'A strong reference from the host'],
        ['"You must install or update .NET"', 'hostfxr found no version per rollForward']
      ]
    },
    {
      t: 'choice',
      q: 'A .NET 8 security patch is out, and the admin installed it on the server. The server runs two net8.0 apps: one framework-dependent, one self-contained. Which gets the fix after a restart?',
      options: ['Only the framework-dependent one', 'Only the self-contained one', 'Both', 'Neither, until they are rebuilt'],
      answer: 0,
      explain: 'A framework-dependent app takes the latest installed patch of its version at startup. A self-contained app carries the runtime in its own folder and is updated only by a new publish.'
    }
  ]
};
