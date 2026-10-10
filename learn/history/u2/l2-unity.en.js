/** The history of .NET, unit 2, lesson 2: Unity and C#. */
export default {
  id: 'hs.u2.l2',
  title: 'Unity and its C#',
  sub: 'Mono inside the engine, IL2CPP and the road to CoreCLR',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Engine in C++, scripts in C#',
      body: '<p>Unity itself is written in C++. Game logic, though, is written in C#: the engine embeds a runtime and calls your scripts.</p><p>In 2005 that runtime was Mono, the only .NET that ran on the Mac, where Unity was born.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year Unity 1.0 came out.',
      goal: { year: 2005 },
      solve: ['year:2005']
    },
    {
      t: 'learn',
      title: 'Years on old Mono',
      body: '<p>For a long time Unity shipped an old Mono with roughly .NET 3.5-level features. Only in 2018 did it move to a newer Mono with the .NET 4.x API and .NET Standard 2.0. Since Unity 2021.2 it supports .NET Standard 2.1.</p>'
    },
    {
      t: 'learn',
      title: 'IL2CPP',
      body: '<p>On iOS, consoles and WebGL, JIT is either forbidden or impossible. So Unity built <b>IL2CPP</b>: CIL bytecode is translated to C++, which is then compiled to machine code ahead of time.</p>',
      deep: 'Because everything is compiled ahead of time, IL2CPP has limits: generating code at run time (Reflection.Emit) is not supported, and generic instantiations the compiler never saw may be missing. It is the same class of problems as Native AOT in modern .NET.'
    },
    {
      t: 'choice',
      q: 'Why did Unity build IL2CPP?',
      options: ['iOS, consoles and WebGL do not allow JIT, so machine code must exist ahead of time', 'To write scripts in C++', 'To make the editor smaller'],
      answer: 0,
      explain: 'Same motive as Native AOT: no JIT, so compile everything before launch.'
    },
    {
      t: 'learn',
      title: 'Next up: CoreCLR',
      body: '<p>In 2022 Unity announced a move to CoreCLR, the same runtime modern .NET uses. That means better speed and newer C# and libraries. The move is happening step by step.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about Unity? Select all that apply.',
      options: ['The engine itself is written in C++', 'C# scripts run on embedded Mono or IL2CPP', 'Unity 2021.2+ supports .NET Standard 2.1', 'Unity ran on CoreCLR from day one'],
      answer: [0, 1, 2],
      explain: 'CoreCLR is Unity\'s future, not its past.'
    },
    {
      t: 'match',
      q: 'Match each term to its role in Unity',
      pairs: [
        ['Mono', 'Unity\'s runtime since 2005'],
        ['IL2CPP', 'CIL → C++ → machine code'],
        ['CoreCLR', 'Where Unity is heading'],
        ['.NET Standard 2.1', 'API profile in Unity 2021.2+']
      ]
    },
    {
      t: 'choice',
      q: 'A library uses Reflection.Emit to generate code on the fly. Where will it break?',
      options: ['In a Unity build using IL2CPP', 'In the Unity editor on Mono', 'In a .NET 10 app with JIT'],
      answer: 0,
      explain: 'Without a JIT, there is nothing to run code generated on the fly.'
    }
  ]
};
