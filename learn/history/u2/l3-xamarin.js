/** История .NET, раздел 2, урок 3: Xamarin и MAUI. */
export default {
  id: 'hs.u2.l3',
  title: 'Xamarin и MAUI',
  sub: 'C# на телефонах',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Xamarin: C# для iOS и Android',
      body: '<p>Xamarin (2011) позволил писать мобильные приложения на C# и делить код между iOS и Android. Сначала это стоило денег — и немалых.</p><p>В 2016 Microsoft купила Xamarin и сделала его бесплатным.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Найди год, когда Microsoft купила Xamarin. Что ещё важного случилось в тот год?',
      goal: { year: 2016 },
      solve: ['year:2016']
    },
    {
      t: 'learn',
      title: 'Xamarin.Forms → .NET MAUI',
      body: '<p><b>Xamarin.Forms</b> — один UI на XAML для всех платформ. В 2022 его сменил <b>.NET MAUI</b>: тот же подход, но на современном .NET, плюс Windows и macOS.</p><p>Поддержка Xamarin закончилась в мае 2024.</p>'
    },
    {
      t: 'learn',
      title: 'Нативные контролы против своей отрисовки',
      body: '<p>MAUI превращает кнопку в настоящую кнопку iOS или Android — <b>нативные контролы</b>. Выглядит «как родное», но на каждой платформе немного по-разному.</p><p><b>Avalonia</b> рисует всё сама, как игра: пиксель в пиксель одинаково везде. Подробно — в курсе по Avalonia.</p>'
    },
    {
      t: 'choice',
      q: 'Чем MAUI отличается от Avalonia по подходу?',
      options: ['MAUI использует нативные контролы платформы, Avalonia рисует интерфейс сама', 'Ничем', 'Avalonia работает только на Windows'],
      answer: 0,
      explain: 'Отсюда и плюсы: родной вид у MAUI, одинаковый вид везде у Avalonia.'
    },
    {
      t: 'order',
      q: 'Расставь по времени',
      items: ['Основан Xamarin', 'Microsoft покупает Xamarin', 'Выходит .NET MAUI', 'Заканчивается поддержка Xamarin'],
      explain: '2011, 2016, 2022, 2024.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Xamarin', 'C# на iOS и Android поверх Mono'],
        ['Xamarin.Forms', 'Общий UI на XAML'],
        ['.NET MAUI', 'Преемник Xamarin.Forms'],
        ['Avalonia', 'UI, который рисует себя сам']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Xamarin больше не поддерживается', 'MAUI работает на современном .NET', 'MAUI умеет Windows и macOS', 'MAUI — это новая версия WPF'],
      answer: [0, 1, 2],
      explain: 'WPF — отдельная технология только для Windows.'
    }
  ]
};
