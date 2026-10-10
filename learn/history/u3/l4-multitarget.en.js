/** The history of .NET, unit 3, lesson 4: multi-targeting. */
export default {
  id: 'hs.u3.l4',
  title: 'One library, several builds',
  sub: 'TargetFrameworks, how NuGet picks, and #if',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'TargetFrameworks, plural',
      body: '<p>A project can build for several targets at once. You get several DLLs, and NuGet packs each one into its own folder in the package.</p>',
      code: '<PropertyGroup>\n  <TargetFrameworks>net8.0;netstandard2.0</TargetFrameworks>\n</PropertyGroup>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Who gets which build',
      body: '<p>Each consuming project takes the <b>nearest</b> compatible build. Given net8.0 and netstandard2.0, a .NET 10 app takes net8.0: it is closer and uses more features. Revit 2024 takes netstandard2.0.</p>'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Revit 2025 should get a net8.0 build with the new APIs, while Revit 2024 and Unity keep working. Two targets at most.',
      hosts: ['revit24', 'revit25', 'unity'],
      goal: { hosts: ['revit24', 'revit25', 'unity'], max: 2, prefer: { revit25: 'net8' } },
      solve: ['tfm:net8', 'tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Targets are net8.0 and netstandard2.0. Which build does a .NET 10 app take?',
      options: ['net8.0', 'netstandard2.0', 'Both at once'],
      answer: 0,
      explain: 'net8.0 is compatible with .NET 10 and closer to it than the standard.'
    },
    {
      t: 'learn',
      title: 'Different code for different targets',
      body: '<p>Where APIs differ, preprocessor symbols help. The SDK defines them for each target automatically.</p>',
      code: '#if NET8_0_OR_GREATER\n    var hash = SHA256.HashData(bytes);           // new API\n#else\n    using var sha = SHA256.Create();\n    var hash = sha.ComputeHash(bytes);           // works everywhere\n#endif'
    },
    {
      t: 'blanks',
      q: 'Code only for the .NET Framework build',
      code: '#if ___\n    LegacyInit();\n#endif',
      tiles: ['NETFRAMEWORK', 'NET8_0_OR_GREATER', 'NETSTANDARD2_1', 'DEBUG'],
      answer: ['NETFRAMEWORK'],
      explain: 'NETFRAMEWORK is defined for net48 and other Framework targets.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'A plugin with separate code for Revit 2024 (net48) and Revit 2025 (net8.0), plus a shared part that must work in Unity.',
      hosts: ['revit24', 'revit25', 'unity'],
      goal: { hosts: ['revit24', 'revit25', 'unity'], max: 3, prefer: { revit24: 'net48', revit25: 'net8' } },
      solve: ['tfm:net48', 'tfm:net8', 'tfm:ns21']
    },
    {
      t: 'learn',
      title: 'Revit plugins in practice',
      body: '<p>A plugin for several Revit versions is usually one project with the targets <code>net48</code> and <code>net8.0-windows</code> (the -windows suffix is needed for WPF). References to RevitAPI.dll are added conditionally, with the right version for each target.</p>'
    },
    {
      t: 'match',
      q: 'Match each symbol to when it is defined',
      pairs: [
        ['NETFRAMEWORK', 'Building for .NET Framework'],
        ['NETSTANDARD2_0', 'Building for .NET Standard 2.0'],
        ['NET8_0_OR_GREATER', '.NET 8 and later'],
        ['DEBUG', 'Debug configuration']
      ]
    },
    {
      t: 'choice',
      q: 'Why bother with several targets if netstandard2.0 works everywhere?',
      options: ['To use newer, faster APIs on new platforms without losing the old ones', 'NuGet requires it', 'netstandard2.0 is slow'],
      answer: 0,
      explain: 'The standard itself is not slow. It just lacks the APIs that came later.'
    }
  ]
};
