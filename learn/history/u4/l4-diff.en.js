/** The history of .NET, unit 4, lesson 4: Framework vs modern .NET. */
export default {
  id: 'hs.u4.l4',
  title: 'Framework vs .NET: the differences',
  sub: 'A cheat sheet and a migration plan',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'The key differences',
      body: '<p><b>Where it runs</b>: Framework on Windows; .NET on Windows, Linux, macOS.<br><b>Installation</b>: Framework is one per system, updated in place; .NET versions sit side by side or ship with the app.<br><b>Evolution</b>: Framework gets fixes only; .NET gets a new version every year.<br><b>Speed</b>: .NET is noticeably faster.</p>'
    },
    {
      t: 'learn',
      title: 'Projects look different',
      body: '<p>An old .csproj is hundreds of lines listing every file, plus packages.config. The new SDK style is a few lines: files are picked up automatically, and packages come via PackageReference.</p>',
      code: '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>',
      lang: 'xml'
    },
    {
      t: 'tapline',
      q: 'Which line gives away that this project targets .NET Framework?',
      code: '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net48</TargetFramework>\n    <LangVersion>latest</LangVersion>\n  </PropertyGroup>\n</Project>',
      lang: 'xml',
      answer: 2,
      explain: 'SDK style works for Framework too. TargetFramework sets the target.'
    },
    {
      t: 'match',
      q: 'Match: Framework → modern .NET',
      pairs: [
        ['packages.config', 'PackageReference'],
        ['app.config', 'appsettings.json'],
        ['GAC', 'Dependencies next to the app'],
        ['AppDomain', 'AssemblyLoadContext']
      ]
    },
    {
      t: 'learn',
      title: 'How teams migrate',
      body: '<p>1. Convert projects to SDK style.<br>2. Move shared code into a netstandard2.0 library that works on both sides.<br>3. Find incompatible APIs (analyzers, .NET Upgrade Assistant).<br>4. Replace what is missing: WCF server, Remoting, Web Forms.<br>5. Switch the app to net10.0 and run the tests.</p>'
    },
    {
      t: 'order',
      q: 'Put the migration steps in order',
      items: ['Convert projects to SDK style', 'Move shared code to netstandard2.0', 'Find incompatible APIs', 'Replace missing technologies', 'Switch the app to net10.0'],
      explain: 'A shared standard library lets you migrate piece by piece.'
    },
    {
      t: 'multi',
      q: 'What will you have to replace when leaving Framework? Select all that apply.',
      options: ['WCF server', '.NET Remoting', 'ASP.NET Web Forms', 'LINQ', 'async/await'],
      answer: [0, 1, 2],
      explain: 'LINQ and async are available everywhere.'
    },
    {
      t: 'choice',
      q: 'Can you write C# 12 for net48?',
      options: ['Much of the syntax compiles, but only C# 7.3 is officially supported, and features that need new APIs or runtime support will not work', 'No, not at all', 'Yes, with no limits'],
      answer: 0,
      explain: 'Default interface methods, for example, need runtime support, and Framework does not have it.'
    }
  ]
};
