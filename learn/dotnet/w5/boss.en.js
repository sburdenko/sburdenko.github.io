/** .NET inside out, final of the unit "Assemblies and versions". */
export default {
  id: 'dotnet.w5.boss',
  title: 'Final: assemblies and versions',
  sub: 'Identity, binding, strong names and NuGet',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A .NET Framework 4.8 app. A signed library was built against Newtonsoft.Json 12.0.0.0, the folder has 13.0.0.0, and App.exe.config has no redirect. What happens?',
      options: ['FileLoadException: strict binding requires 12.0.0.0', '13.0.0.0 loads: the version is no lower than requested', 'Both versions load: each for its own consumers', 'A warning in the Fusion log, and the app carries on'],
      answer: 0,
      explain: 'For a strong-named assembly Framework requires an exact version match. The "no lower" rule belongs to .NET Core and .NET 5+.',
      wrong: { 1: 'That is how .NET 8 behaves, not Framework.' }
    },
    {
      t: 'multi',
      q: 'Which of these change an assembly identity? Select all.',
      options: ['AssemblyVersion', 'The strong-name key', 'Culture', 'FileVersion', 'InformationalVersion'],
      answer: [0, 1, 2],
      explain: 'The identity is name, version, culture and public key. FileVersion and InformationalVersion are plain attributes; the CLR loader ignores them.'
    },
    {
      t: 'tapline',
      q: 'A signed netstandard2.0 library. Which line should change so that 3.7.x patches do not require binding redirects for Framework consumers?',
      code: '<PropertyGroup>\n  <Version>3.7.2</Version>\n  <AssemblyVersion>3.7.2.0</AssemblyVersion>\n  <FileVersion>3.7.2.41</FileVersion>\n  <SignAssembly>true</SignAssembly>\n</PropertyGroup>',
      lang: 'xml',
      answer: 2,
      explain: 'AssemblyVersion should be 3.0.0.0 — major only. Deleting the line is not enough: the SDK derives 3.7.2.0 from Version. Let the patch and CI build numbers live in Version and FileVersion.'
    },
    {
      t: 'choice',
      q: 'Acme.Pricing requires Acme.Log >= 2.1, Acme.Tax requires Acme.Log >= 2.0. The server has 2.0, 2.2 and 3.0, but no 2.1. What does NuGet pick?',
      options: ['2.2', '3.0', '2.0', 'Error NU1107'],
      answer: 0,
      explain: 'It needs the lowest version that satisfies both: at least 2.1. There is no 2.1, and the next available one is 2.2.',
      wrong: { 1: 'NuGet does not take the newest: the rule is the lowest applicable.', 2: '2.0 does not satisfy Acme.Pricing.' }
    },
    {
      t: 'order',
      q: 'Put in order how a .NET 8 app gets the Acme.Log assembly',
      items: ['At build time the SDK writes App.deps.json from the restore result', 'hostfxr reads runtimeconfig.json and picks the framework', 'hostpolicy builds the TPA from the app and framework deps.json', 'Code touches a type from Acme.Log for the first time', 'The default context finds Acme.Log in the TPA by name and checks the version'],
      explain: 'First restore and build, then the host builds the assembly list, and only when the JIT meets a type from Acme.Log does the assembly load — by name from the list, with the "no lower" check.'
    },
    {
      t: 'blanks',
      q: 'The Money class moved from Shop.dll to Shop.Core.dll. Make old programs find it',
      code: '// Shop.dll, version 2\n[assembly: ___(typeof(Shop.Money))]',
      tiles: ['TypeForwardedTo', 'TypeForwardedFrom', 'InternalsVisibleTo', 'AssemblyVersion'],
      answer: ['TypeForwardedTo'],
      explain: 'TypeForwardedTo writes a row into ExportedType, and the CLR follows it to Shop.Core. TypeForwardedFrom goes on the type itself in the new assembly — serializers read it, not the loader.'
    },
    {
      t: 'match',
      q: 'Match the .NET Framework mechanism to what became of it in modern .NET',
      pairs: [
        ['GAC', 'Shared assemblies in the installed runtime folder'],
        ['Binding redirect', 'Not needed: a version no lower than requested fits'],
        ['Probing through folders', 'Lookup by name in the TPA list from deps.json'],
        ['Strong-name signature check', 'Not performed at all']
      ]
    },
    {
      t: 'choice',
      q: 'A colleague says: "Let us strong-name the assembly, and nobody will be able to swap our code." Is he right?',
      options: ['No: a strong name is identity, not protection; Authenticode and NuGet package signing prove the author', 'Yes: the CLR checks the signature on every load', 'Yes, but only in .NET 8 and later', 'No: only Microsoft assemblies may be strong-named'],
      answer: 0,
      explain: 'The modern runtime does not check the strong-name signature, Framework has long skipped it during normal loading too, and the keys of many libraries are public.'
    },
    {
      t: 'choice',
      q: 'A .NET 8 app was built against Acme.Pricing with AssemblyVersion 3.7.0.0. Deployment put the old 3.6.0.0 assembly into the folder. What happens?',
      options: ['FileLoadException: the version found is lower than requested', 'It loads: only the major version is checked', 'It loads: .NET 8 does not check versions', 'MissingMethodException at process start'],
      answer: 0,
      explain: '"No lower" cuts both ways: higher is fine, lower is a load error. MissingMethodException would happen if both had AssemblyVersion 3.0.0.0 and the check passed.'
    }
  ]
};
