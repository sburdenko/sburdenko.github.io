/** Unit 2 final of "The history of .NET". */
export default {
  id: 'hs.u2.boss',
  title: 'Final: .NET beyond Windows',
  sub: 'Mono, Unity, Xamarin',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Walk through the years: Mono (2004), Unity (2005), Xamarin (2011) and the Xamarin acquisition (2016).',
      goal: { visit: [2004, 2005, 2011, 2016] },
      solve: ['year:2004', 'year:2005', 'year:2011', 'year:2016']
    },
    {
      t: 'choice',
      q: 'Why did Unity pick Mono over .NET Framework in 2005?',
      options: ['Unity was born on the Mac, and Framework ran only on Windows', 'Mono was faster', 'Framework was paid'],
      answer: 0,
      explain: 'Microsoft had no cross-platform .NET back then.'
    },
    {
      t: 'choice',
      q: 'A game is built for iPhone. How does Unity run the C#?',
      options: ['IL2CPP: the code is translated to C++ and machine code ahead of time', 'Mono\'s JIT', 'CoreCLR on the phone'],
      answer: 0,
      explain: 'JIT is not allowed on iOS.'
    },
    {
      t: 'multi',
      q: 'What did Microsoft do in 2016? Select all that apply.',
      options: ['Bought Xamarin', 'Released .NET Core 1.0', 'Made Xamarin free', 'Ended Framework support'],
      answer: [0, 1, 2],
      explain: 'Framework is still supported today.'
    },
    {
      t: 'order',
      q: 'Put these in chronological order',
      items: ['Mono 1.0', 'Unity 1.0', 'Xamarin', 'MAUI', 'Mono handed to WineHQ'],
      explain: '2004, 2005, 2011, 2022, 2024.'
    },
    {
      t: 'match',
      q: 'Match each term to what it is',
      pairs: [
        ['ECMA-335', 'The CLI standard'],
        ['IL2CPP', 'Ahead-of-time compilation in Unity'],
        ['MAUI', 'Native controls'],
        ['Avalonia', 'Custom rendering']
      ]
    },
    {
      t: 'choice',
      q: 'Where is Unity heading?',
      options: ['To CoreCLR, the runtime of modern .NET', 'To Java', 'Back to .NET Framework'],
      answer: 0,
      explain: 'Announced in 2022, the move is happening step by step.'
    },
    {
      t: 'choice',
      q: 'What if there had been no ECMA standards?',
      options: ['Mono, and with it Unity and Xamarin, would have been much harder to build', 'Nothing would have changed', 'There would be no C#'],
      answer: 0,
      explain: 'The open spec is what the whole "other" branch of .NET grew from.'
    }
  ]
};
