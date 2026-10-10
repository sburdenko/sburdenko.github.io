/** Lesson 8: launching a program and CLR services. */
export default {
  id: 'dotnet.w1.l8',
  title: 'Startup and CLR services',
  sub: 'Who launches the program and what the CLR gives it',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'The CLR is more than the JIT',
      body: '<p>While a program runs, the CLR provides services:</p><p><b>Garbage collection</b>: frees memory that is no longer needed.<br><b>Safety</b>: type and bounds checks.<br><b>Native interop</b>: calling C and C++ libraries.<br><b>Cross-language debugging</b>.<br><b>Deployment and versioning</b> of libraries.</p>'
    },
    {
      t: 'match',
      q: 'Which CLR service helps?',
      pairs: [
        ['Objects are no longer needed', 'Garbage collector'],
        ['Call a function from a C library', 'Native interop (P/Invoke)'],
        ['A breakpoint in an F# library called from C#', 'Cross-language debugging'],
        ['Two programs need different library versions', 'Versioning']
      ]
    },
    {
      t: 'learn',
      title: 'How Windows launched a .NET program',
      body: '<p>Here\'s how the Microsoft article describes it for .NET Framework:</p><p>The Windows loader sees a "this is a managed module" flag in the file header and loads <code>mscoree.dll</code>. The <code>_CorValidateImage</code> function checks that the file holds valid managed code and replaces the entry point with the CLR\'s entry point.</p>',
      deep: 'On 64-bit Windows, _CorValidateImage also converts the in-memory image from PE32 to PE32+. Its counterpart, _CorImageUnloading, tells the loader when the image is unloaded.'
    },
    {
      t: 'order',
      q: 'Put the .NET Framework startup in order',
      items: ['Double-click hello.exe', 'Windows sees the "managed module" flag', 'mscoree.dll is loaded', '_CorValidateImage checks the code and swaps the entry point', 'The CLR runs Main'],
      explain: 'First the OS, then mscoree.dll, an image check, and control passes to the CLR.'
    },
    {
      t: 'learn',
      title: 'And in modern .NET',
      body: '<p>The chain is the same on Windows, Linux and macOS. It starts with a tiny launcher, <code>hello.exe</code> (the apphost), or the command <code>dotnet hello.dll</code>.</p>',
      flow: ['dotnet hello.dll', 'hostfxr: pick the .NET version', 'hostpolicy: find dependencies', 'coreclr: start the CLR', 'Main()'],
      deep: 'hostfxr reads hello.runtimeconfig.json and picks a suitable installed runtime using roll-forward rules. hostpolicy reads hello.deps.json and builds the list of assemblies to load. Native AOT skips this chain: the file is native from the start.'
    },
    {
      t: 'order',
      q: 'Assemble the modern startup chain',
      items: ['dotnet hello.dll', 'hostfxr picks the .NET version', 'hostpolicy finds dependencies', 'coreclr starts the CLR', 'Main() is called'],
      explain: 'Host, version choice, dependencies, CLR, your code.'
    },
    {
      t: 'choice',
      q: 'The computer has no .NET. Someone runs hello.exe, a regular build, not Native AOT. What do they see?',
      options: ['A message saying .NET must be installed to run it', 'The program starts', 'Windows embeds the CLR into the file', 'A blue screen'],
      answer: 0,
      explain: 'hostfxr found no suitable runtime. The launcher shows "You must install or update .NET to run this application" with a download link.',
      wrong: { 1: 'Without .NET installed, only Native AOT or a self-contained build, which carries the runtime with it, will start.' }
    },
    {
      t: 'choice',
      q: 'Main calls Add for the first time. What happens?',
      options: ['Stub, then JIT, then machine code, then execution', 'The CPU runs the CIL directly', 'The CLR reads and interprets the C# source', 'Add was already compiled at install time'],
      answer: 0,
      explain: 'Each method is compiled on its first call and then executed. That goes on until the program ends.'
    },
    {
      t: 'learn',
      title: 'The whole journey',
      body: '<p>This is <b>managed execution</b>. You\'ve walked through every step. All that\'s left is the final challenge.</p>',
      flow: ['C#', 'Compiler', 'CIL + metadata', 'Host, then CLR', 'JIT', 'Machine code + CLR services']
    }
  ]
};
