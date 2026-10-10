/** История .NET, раздел 2, урок 1: Mono. */
export default {
  id: 'hs.u2.l1',
  title: 'Mono: .NET без Microsoft',
  sub: 'Как C# попал на Linux задолго до .NET Core',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Стандарт открыт — делай свою реализацию',
      body: '<p>Microsoft отдала описание C# и CLI в стандарт ECMA. Значит, любой мог написать свою среду исполнения по этому описанию.</p><p>Мигель де Икаса и его компания Ximian так и сделали: в 2004 году вышел <b>Mono 1.0</b> — .NET для Linux.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Найди год выхода Mono 1.0 и посмотри, где теперь можно запускать C#.',
      goal: { year: 2004 },
      solve: ['year:2004']
    },
    {
      t: 'choice',
      q: 'Почему Mono смогли сделать без исходников Microsoft?',
      options: ['C# и CLI описаны в открытом стандарте ECMA', 'Исходники утекли', 'Mono — это переименованный Framework'],
      answer: 0,
      explain: 'Реализация своя, по открытой спецификации.'
    },
    {
      t: 'learn',
      title: 'Путь Mono',
      body: '<p>Ximian купила компания Novell (2003). В 2011 Novell уволила команду, и та основала <b>Xamarin</b> — C# для iOS и Android на базе Mono. В 2016 Microsoft купила Xamarin.</p><p>В 2024 Microsoft передала проект Mono сообществу WineHQ. А рантайм Mono живёт и внутри современного .NET — для мобильных платформ и WebAssembly.</p>'
    },
    {
      t: 'order',
      q: 'Расставь путь Mono',
      items: ['Ximian начинает Mono', 'Novell покупает Ximian', 'Команда основывает Xamarin', 'Microsoft покупает Xamarin', 'Mono передают WineHQ'],
      explain: 'Mono начали в 2001, Novell купила Ximian в 2003, Xamarin — 2011, покупка Microsoft — 2016, WineHQ — 2024.'
    },
    {
      t: 'multi',
      q: 'Где работал Mono? Отметь все.',
      options: ['Linux', 'macOS', 'Внутри игр на Unity', 'Только Windows'],
      answer: [0, 1, 2],
      explain: 'Ради Linux и macOS его и делали. А Unity встроил его в свой движок.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Mono', 'Открытая реализация .NET'],
        ['Ximian', 'Компания, начавшая Mono'],
        ['Xamarin', 'C# для iOS и Android'],
        ['WineHQ', 'Новый дом проекта Mono с 2024']
      ]
    },
    {
      t: 'choice',
      q: 'Что сегодня делает рантайм Mono внутри современного .NET?',
      options: ['Запускает .NET на мобильных платформах и в WebAssembly', 'Ничего, его удалили', 'Заменяет JIT на Windows'],
      answer: 0,
      explain: 'Он маленький и хорошо подходит туда, где CoreCLR тяжеловат.'
    }
  ]
};
