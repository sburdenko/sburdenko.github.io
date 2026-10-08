/** История .NET, раздел 3, урок 3: .NET Standard. */
export default {
  id: 'hs.u3.l3',
  title: '.NET Standard',
  sub: 'Контракт API, а не рантайм. И почему именно 2.1',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Зоопарк рантаймов',
      body: '<p>К 2016 году .NET был в нескольких вариантах: Framework, Core, Mono, Xamarin, Unity, UWP. У каждого свой набор API.</p><p>Автор библиотеки не знал, на что ориентироваться: собирать отдельную DLL под каждый?</p>'
    },
    {
      t: 'learn',
      title: 'Стандарт — это список, а не программа',
      body: '<p><b>.NET Standard</b> — список API, которые обязана иметь платформа. Сам он ничего не исполняет.</p><p>Как стандарт розетки: он не даёт ток, но любой прибор с такой вилкой подойдёт к любой розетке по стандарту.</p><p>Библиотека под <code>netstandard2.0</code> работает везде, где реализован .NET Standard 2.0.</p>'
    },
    {
      t: 'choice',
      q: 'Что такое .NET Standard?',
      options: ['Контракт: список API, которые должна реализовать платформа', 'Ещё один рантайм', 'Облегчённая версия .NET Core'],
      answer: 0,
      explain: 'Программу «на .NET Standard» запустить нельзя — только библиотеку собрать под него.'
    },
    {
      t: 'learn',
      title: '2.0 и 2.1',
      body: '<p><b>2.0</b> (2017) — огромный набор, больше 30 тысяч API. Его реализуют Framework 4.6.1+ (надёжно — с 4.7.2), .NET Core 2.0+, Mono, Unity.</p><p><b>2.1</b> (2019) добавил <code>Span&lt;T&gt;</code>, <code>IAsyncEnumerable</code> и методы интерфейсов по умолчанию. Его реализуют .NET Core 3.0+ и Unity 2021.2+. <b>.NET Framework — нет</b>, его потолок 2.0.</p>'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Коллега собрал общую библиотеку под netstandard2.1. Сделай так, чтобы она работала и в Revit 2024, и в Unity — одной целью.',
      hosts: ['revit24', 'unity'], start: ['ns21'],
      goal: { hosts: ['revit24', 'unity'], max: 1 },
      solve: ['tfm:ns21', 'tfm:ns20']
    },
    {
      t: 'choice',
      q: 'Почему Framework так и не получил .NET Standard 2.1?',
      options: ['Новым API нужны изменения в самом рантайме, а Framework заморожен и обновляется на месте', 'Забыли', 'Лицензия не позволила'],
      answer: 0,
      explain: 'Методы интерфейсов по умолчанию, например, требуют поддержки в CLR. Менять общий CLR всей Windows слишком рискованно.'
    },
    {
      t: 'rig', rig: 'tfm',
      task: 'Общий код для Unity, Revit 2025 и приложения на .NET 10. Нужны Span<T> и IAsyncEnumerable без лишних пакетов. Одна цель.',
      hosts: ['unity', 'revit25', 'app10'],
      goal: { hosts: ['unity', 'revit25', 'app10'], max: 1, prefer: { unity: 'ns21' } },
      solve: ['tfm:ns21']
    },
    {
      t: 'learn',
      title: 'Стандарт больше не растёт',
      body: '<p>После 2.1 новых версий .NET Standard не будет. Начиная с .NET 5 платформа одна, и цель <code>net8.0</code> или <code>net10.0</code> — это «всё, что есть в этой версии».</p><p>.NET Standard остаётся мостом к Framework и Unity: 2.0 — максимальный охват, 2.1 — Unity и современный .NET.</p>'
    },
    {
      t: 'match',
      q: 'Соедини цель и кто её загрузит',
      pairs: [
        ['netstandard2.0', 'Framework, Unity и современный .NET'],
        ['netstandard2.1', 'Unity и современный .NET, но не Framework'],
        ['net48', 'Только .NET Framework (без оговорок)'],
        ['net10.0', 'Только .NET 10 и новее']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['.NET Standard 2.1 поддерживают Unity и .NET 10', '.NET Framework поддерживает максимум .NET Standard 2.0', 'Приложение можно собрать под netstandard2.1 и запустить', 'Новых версий .NET Standard больше не будет'],
      answer: [0, 1, 3],
      explain: 'Под .NET Standard собирают только библиотеки.'
    }
  ]
};
