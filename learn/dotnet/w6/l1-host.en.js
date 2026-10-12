/** .NET inside out, unit "Loading and hosting", lesson 1: the host chain: muxer, apphost, hostfxr, hostpolicy, coreclr. */
export default {
  id: 'dotnet.w6.l1',
  title: 'The host chain',
  sub: 'Muxer, apphost, hostfxr, hostpolicy and coreclr',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Five native libraries before Main',
      body: '<p>In the first unit the startup chain was a five-step diagram. Now let us open each step. Before your <code>Main</code> runs, only native C++ programs are at work; there is no managed code yet:</p><ul><li><b>dotnet</b> (the muxer) or <b>app.exe</b> (the apphost) is the entry point;</li><li><b>hostfxr</b> picks the runtime version;</li><li><b>hostpolicy</b> builds the list of assemblies;</li><li><b>coreclr</b> is the runtime itself: GC, JIT, type loader.</li></ul><p>Each part has its own folder in the .NET install, and their versions do not have to match.</p>',
      code: '/usr/share/dotnet/\n    dotnet                                  # muxer\n    host/fxr/8.0.17/libhostfxr.so\n    host/fxr/9.0.6/libhostfxr.so\n    shared/Microsoft.NETCore.App/8.0.17/    # libhostpolicy, libcoreclr, System.*.dll\n    shared/Microsoft.NETCore.App/9.0.6/\n    shared/Microsoft.AspNetCore.App/9.0.6/\n    sdk/9.0.301/',
      lang: 'plain',
      flow: ['dotnet / app.exe', 'hostfxr', 'hostpolicy', 'coreclr', 'Main()']
    },
    {
      t: 'learn',
      title: 'The muxer: one dotnet for every version',
      body: '<p>The <code>dotnet</code> command is the <b>muxer</b> (short for multiplexer). There is one per install, and it looks at the arguments: <code>dotnet app.dll</code> means run an app, <code>dotnet build</code> means an SDK command.</p><p>The muxer itself does almost nothing. It takes <b>hostfxr</b> from the <code>host/fxr/&lt;newest version&gt;</code> folder next to it and hands over all the work. A newer hostfxr can start older runtimes too, so the freshest one is enough.</p><p>The runtime version for the app is chosen later, inside hostfxr, and it does not depend on the version of hostfxr.</p>',
      deep: '<p>For SDK commands hostfxr looks for <code>global.json</code>, walking up from the current folder, and picks an SDK from the <code>sdk/</code> folder. global.json is not read when running an app: it configures the tools, not the runtime.</p><p><code>dotnet --list-runtimes</code>, <code>dotnet --list-sdks</code> and <code>dotnet --info</code> show what is installed. The last one also prints the version of the host itself.</p>'
    },
    {
      t: 'choice',
      q: 'Runtimes 8.0.17 and 9.0.6 are installed, and host/fxr has folders 8.0.17 and 9.0.6. You run dotnet app.dll, and the app targets net8.0. Whose hostfxr gets loaded?',
      options: ['From host/fxr/9.0.6', 'From host/fxr/8.0.17', 'From the folder next to app.dll', 'From shared/Microsoft.NETCore.App/8.0.17'],
      answer: 0,
      explain: 'The muxer always takes the newest hostfxr from host/fxr. That hostfxr then reads runtimeconfig.json and picks runtime 8.0.17 for the app.',
      wrong: { 1: 'The muxer does not yet know which version the app targets: hostfxr finds that out. So the newest one is taken.', 3: 'The framework folder holds hostpolicy and coreclr. hostfxr lives separately, in host/fxr.' }
    },
    {
      t: 'learn',
      title: 'The apphost: app.exe is not your program',
      body: '<p>Next to <code>app.dll</code> the build puts <code>app.exe</code> (just <code>app</code> on Linux). This is the <b>apphost</b>, a small native launcher from the SDK. During the build the SDK copies the template and writes the name <code>app.dll</code> into it. None of your code is inside.</p><p>The apphost has one job: find hostfxr. For a framework-dependent app it searches for a .NET install in order and takes the <b>first one found</b>:</p><ul><li>the folder in <code>DOTNET_ROOT</code> (there are per-architecture variants such as <code>DOTNET_ROOT_X64</code>);</li><li>the registered location: on Windows the registry key <code>HKLM\\SOFTWARE\\dotnet\\Setup\\InstalledVersions\\&lt;arch&gt;</code>, on Linux and macOS the file <code>/etc/dotnet/install_location</code>;</li><li>the default location: <code>%ProgramFiles%\\dotnet</code>, <code>/usr/share/dotnet</code>, <code>/usr/local/share/dotnet</code>.</li></ul><p>The <code>PATH</code> variable plays no part in this search.</p>',
      deep: '<p>The apphost template contains a placeholder: the SHA-256 of the string "foobar" written as text, 64 hex characters at the start of a 1024-byte buffer. The SDK finds that string and writes the dll path over it. That is why you cannot rename app.dll after the build: the apphost will look for the old name.</p><p>Since .NET 9 you can set the search order at build time with the <code>AppHostDotNetSearch</code> property (AppLocal, AppRelative, EnvironmentVariable, Global) and <code>AppHostRelativeDotNet</code>. <code>UseAppHost=false</code> turns the apphost off. Microsoft recommends launching through the apphost: the process list shows the app name instead of dotnet, and you can attach a manifest and an icon to the exe.</p>'
    },
    {
      t: 'multi',
      q: 'app.exe is built as framework-dependent. Where does it look for a .NET install? Select all.',
      options: ['In the folder from DOTNET_ROOT', 'In the registered install location', 'In the default install location', 'In every folder on PATH', 'In the SDK folder named in global.json'],
      answer: [0, 1, 2],
      explain: 'The order is DOTNET_ROOT, then the registered location, then the default path. The first install found wins. PATH helps the shell find the dotnet command, but the apphost does not read it. global.json only concerns the SDK.'
    },
    {
      t: 'learn',
      title: 'hostfxr: which frameworks are needed',
      body: '<p>hostfxr reads <code>app.runtimeconfig.json</code>. It records which <b>shared frameworks</b> the app needs and their minimum version: always <code>Microsoft.NETCore.App</code>, plus <code>Microsoft.AspNetCore.App</code> for a web app and <code>Microsoft.WindowsDesktop.App</code> for WPF and WinForms.</p><p>Frameworks are layered: ASP.NET Core has its own runtimeconfig that refers to NETCore.App. hostfxr resolves the whole chain, picks suitable installed versions by the roll-forward rules (the next lesson covers them) and loads <b>hostpolicy</b> from the folder of the chosen <code>Microsoft.NETCore.App</code>.</p><p>If no suitable version is found, startup ends here with "You must install or update .NET" and a list of what was found.</p>',
      deep: 'A self-contained app has includedFrameworks in runtimeconfig.json instead of frameworks: the runtime sits right next to it and hostfxr searches for nothing. The same hostfxr is the entry point for native programs that want to run .NET inside themselves: the hostfxr_initialize_for_runtime_config function, and the nethost library (get_hostfxr_path) helps find hostfxr itself.'
    },
    {
      t: 'order',
      q: 'Put the startup steps of app.exe (framework-dependent) in order',
      items: ['The apphost finds a .NET install and loads hostfxr', 'hostfxr reads app.runtimeconfig.json and picks a framework version', 'hostfxr loads hostpolicy from that framework folder', 'hostpolicy reads deps.json and builds the assembly list', 'hostpolicy loads coreclr and passes the list to it', 'The CLR loads System.Private.CoreLib and calls Main'],
      explain: 'Each layer knows only its own file: hostfxr knows runtimeconfig.json, hostpolicy knows deps.json. Managed code appears only at the last step.'
    },
    {
      t: 'learn',
      title: 'hostpolicy: the assembly list before startup',
      body: '<p>hostpolicy reads <code>app.deps.json</code> and the deps.json of each framework (what they contain is covered in the unit "Assemblies and versions") and turns them into <b>full paths</b> to files. The main result is the <b>TPA</b> (Trusted Platform Assemblies), the very list of every app and framework assembly from the unit "Assemblies and versions". Now you can see who builds it and when.</p><p>hostpolicy passes this list and the native library paths to <code>coreclr_initialize</code> as properties, then calls <code>coreclr_execute_assembly</code>.</p><p>Hence the main difference from .NET Framework: the CLR does not walk the disk looking for an assembly. The default context takes the path from the TPA by simple name. Not in the list means not found, even if the file sits right next to the app.</p>',
      code: '// simplified: what hostpolicy passes to the runtime\ncoreclr_initialize(exePath, ..., properties)\n    TRUSTED_PLATFORM_ASSEMBLIES   = .../System.Runtime.dll : /app/app.dll : /app/Dapper.dll\n    NATIVE_DLL_SEARCH_DIRECTORIES = /app/ : /usr/share/dotnet/shared/Microsoft.NETCore.App/8.0.17/\n    APP_CONTEXT_BASE_DIRECTORY    = /app/\ncoreclr_execute_assembly(..., "/app/app.dll", ...)',
      lang: 'plain',
      deep: '<p>All these properties are visible from code: <code>AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")</code>, and the list of deps.json files read is <code>AppContext.GetData("APP_CONTEXT_DEPS_FILES")</code>. The path separator is ";" on Windows and ":" elsewhere.</p><p>If there is no deps.json at all, hostpolicy assumes every dependency is in the app folder and builds the TPA from its contents. The <code>DOTNET_ADDITIONAL_DEPS</code> variable adds more deps files, but only for framework-dependent apps.</p>'
    },
    {
      t: 'choice',
      q: 'You copied Extra.dll into the app folder by hand. The code references it statically, but app.deps.json does not list it. What happens the first time a type from Extra is used?',
      options: ['FileNotFoundException: the assembly is not in the TPA', 'The assembly loads from the app folder', 'An error at startup, before Main', 'hostpolicy adds it to deps.json'],
      answer: 0,
      explain: 'When deps.json exists, the TPA is built from it alone. The default context looks the assembly up by name in that list and does not search the folder. Fix it in the project (a package or assembly reference) or with a fresh publish, not by copying files.',
      wrong: { 1: 'That is how .NET Framework behaved: it probed the app folder. Modern .NET reads the folder only when there is no deps.json at all.', 2: 'hostpolicy does not check what the code references. Assemblies load lazily, on first use.' }
    },
    {
      t: 'learn',
      title: 'coreclr: one runtime per process',
      body: '<p><code>coreclr</code> starts the garbage collector, loads the JIT (<code>clrjit</code>), reads <code>System.Private.CoreLib</code>, creates the single AppDomain and the default load context, and calls <code>Main</code>.</p><p>An important limit: a process can run <b>only one</b> runtime. You cannot keep .NET 8 and .NET 9 side by side. A native program that runs .NET inside itself (an editor plugin, a COM server) gets the already loaded runtime if it fits, or an error.</p>',
      deep: 'Besides the muxer and the apphost, .NET has other native hosts: comhost (a managed COM server), ijwhost (C++/CLI assemblies), nethost (for arbitrary native programs). All of them lead to the same hostfxr. Native AOT has no such chain at all: the runtime is compiled into the executable itself.'
    },
    {
      t: 'match',
      q: 'Match each component with its job',
      pairs: [
        ['dotnet (muxer)', 'Decides: run an app or an SDK command'],
        ['apphost', 'Finds a .NET install for one app'],
        ['hostfxr', 'Picks the framework version from runtimeconfig.json'],
        ['hostpolicy', 'Builds the TPA from deps.json'],
        ['coreclr', 'GC, JIT and the type loader']
      ]
    },
    {
      t: 'learn',
      title: 'When it will not start: host tracing',
      body: '<p>Failures before <code>Main</code> show up neither in the app logs nor in a managed debugger. Turn on host tracing: each layer writes what it looked for, where, and what it picked.</p>',
      code: '# Linux, macOS\nCOREHOST_TRACE=1 COREHOST_TRACEFILE=host.txt ./app\n\n# what is installed\ndotnet --list-runtimes',
      lang: 'plain',
      deep: 'COREHOST_TRACE_VERBOSITY sets the detail level from 1 to 4. Newer hosts also accept the names DOTNET_HOST_TRACE, DOTNET_HOST_TRACEFILE and DOTNET_HOST_TRACE_VERBOSITY, but the .NET 9 host and older ones do not understand them, while the COREHOST_* names work everywhere. The trace shows which hostfxr was loaded, which runtimeconfig.json was read, which framework versions were considered, and the full TPA.'
    },
    {
      t: 'choice',
      q: 'An app is published self-contained. The server has DOTNET_ROOT pointing at an installed .NET 9. Which runtime starts?',
      options: ['The one in the app folder', 'The one in DOTNET_ROOT, the variable wins', 'The newest one installed globally', 'Startup fails: two runtimes conflict'],
      answer: 0,
      explain: 'The apphost of a self-contained app finds hostfxr next to itself, and runtimeconfig.json lists includedFrameworks. Global installs and DOTNET_ROOT are not used in this mode.'
    }
  ]
};
