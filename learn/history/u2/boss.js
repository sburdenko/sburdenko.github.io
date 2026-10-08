/** Финал раздела 2 курса «История .NET». */
export default {
  id: 'hs.u2.boss',
  title: 'Финал: .NET за пределами Windows',
  sub: 'Mono, Unity, Xamarin',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'years',
      task: 'Пройди по годам: Mono (2004), Unity (2005), Xamarin (2011) и покупка Xamarin (2016).',
      goal: { visit: [2004, 2005, 2011, 2016] },
      solve: ['year:2004', 'year:2005', 'year:2011', 'year:2016']
    },
    {
      t: 'choice',
      q: 'Почему Unity в 2005 году выбрал Mono, а не .NET Framework?',
      options: ['Unity появился на Mac, а Framework работал только на Windows', 'Mono был быстрее', 'Framework был платным'],
      answer: 0,
      explain: 'Кросс-платформенного .NET от Microsoft тогда не было.'
    },
    {
      t: 'choice',
      q: 'Игра собирается для iPhone. Чем Unity исполнит C#?',
      options: ['IL2CPP: код заранее переведён в C++ и машинный код', 'JIT Mono', 'CoreCLR на телефоне'],
      answer: 0,
      explain: 'На iOS JIT запрещён.'
    },
    {
      t: 'multi',
      q: 'Что сделала Microsoft в 2016 году? Отметь все.',
      options: ['Купила Xamarin', 'Выпустила .NET Core 1.0', 'Сделала Xamarin бесплатным', 'Прекратила поддержку Framework'],
      answer: [0, 1, 2],
      explain: 'Framework поддерживается до сих пор.'
    },
    {
      t: 'order',
      q: 'Расставь по времени',
      items: ['Mono 1.0', 'Unity 1.0', 'Xamarin', 'MAUI', 'Mono передан WineHQ'],
      explain: '2004, 2005, 2011, 2022, 2024.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['ECMA-335', 'Стандарт CLI'],
        ['IL2CPP', 'Компиляция заранее в Unity'],
        ['MAUI', 'Нативные контролы'],
        ['Avalonia', 'Своя отрисовка']
      ]
    },
    {
      t: 'choice',
      q: 'Куда переходит Unity?',
      options: ['На CoreCLR — рантайм современного .NET', 'На Java', 'Обратно на .NET Framework'],
      answer: 0,
      explain: 'Объявлено в 2022, переход идёт постепенно.'
    },
    {
      t: 'choice',
      q: 'Что было бы без стандартов ECMA?',
      options: ['Mono, а с ним Unity и Xamarin, было бы сделать гораздо труднее', 'Ничего бы не изменилось', 'Не было бы C#'],
      answer: 0,
      explain: 'Открытая спецификация — то, на чём выросла вся «другая» ветка .NET.'
    }
  ]
};
