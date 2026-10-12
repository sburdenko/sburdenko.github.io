/** Финал раздела «Исключения и надёжность» курса «C# глубже». */
export default {
  id: 'cs.u12.boss',
  title: 'Финал: исключения и надёжность',
  sub: 'Два прохода, переброс, сломанные типы и цена',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Log печатает строку и возвращает true только для "B". Что выведет программа?',
      code: 'try\n{\n    try { throw new Exception(); }\n    catch (Exception) when (Log("A")) { }\n    finally { Console.Write("F "); }\n}\ncatch (Exception) when (Log("B"))\n{\n    Console.Write("C ");\n}',
      options: ['A B F C', 'A F B C', 'F A B C', 'A B C F'],
      answer: 0,
      explain: 'Первый проход: фильтр A — false, поиск идёт дальше, фильтр B — true. Только теперь второй проход раскручивает стек: внутренний finally печатает F. Последним выполняется тело catch.',
      wrong: { 1: 'finally внутреннего try выполняется во втором проходе, а он начнётся только после того, как первый найдёт обработчик — фильтр B.' }
    },
    {
      t: 'multi',
      q: 'В каких случаях finally не выполнится? Отметь все.',
      options: ['В try вызван Environment.Exit(0)', 'Из try выход по break из цикла', 'Процесс убит через SIGKILL', 'Исключение поймано в вызывающем методе'],
      answer: [0, 2],
      explain: 'Environment.Exit внутри try не выполняет finally этого потока, SIGKILL не даёт процессу ничего выполнить. break и исключение, пойманное выше, — штатные выходы.'
    },
    {
      t: 'tapline',
      q: 'Переменная LIMIT не задана. Обращение к Settings.Path бросает TypeInitializationException. Какая строка — настоящая причина?',
      code: 'static class Settings\n{\n    public static readonly string Root =\n        Environment.GetEnvironmentVariable("ROOT") ?? "/srv";\n    public static readonly int Limit =\n        int.Parse(Environment.GetEnvironmentVariable("LIMIT")!);\n    public static string Path => Root + "/data";\n}',
      answer: 5,
      explain: 'int.Parse(null) бросает ArgumentNullException, она окажется в InnerException. Инициализаторы всех полей — один статический конструктор, поэтому сломан весь тип, включая Path, и до перезапуска процесса.'
    },
    {
      t: 'choice',
      q: 'Фоновый поток сохранил пойманное исключение в поле. Главный поток должен бросить его с исходным стеком. Как?',
      options: [
        'ExceptionDispatchInfo.Capture(e) в потоке, Throw() в главном',
        'throw saved; в главном потоке',
        'throw; в главном потоке',
        'throw new AggregateException(saved);'
      ],
      answer: 0,
      explain: 'ExceptionDispatchInfo бросает тот же объект и сохраняет исходный стек, дописывая новые кадры после разделителя. Так же устроен await.',
      wrong: { 1: 'throw saved начнёт стек с этой строки, место в фоновом потоке пропадёт.', 2: 'throw; без аргумента вне catch — ошибка компиляции CS0156.' }
    },
    {
      t: 'match',
      q: 'Соедини: как было в .NET Framework и что сейчас',
      pairs: [
        ['Thread.Abort', 'PlatformNotSupportedException'],
        ['CER и PrepareConstrainedRegions', 'Не поддерживаются, SYSLIB0004'],
        ['Конструктор сериализации исключения', 'Устарел в .NET 8, SYSLIB0051'],
        ['Исключения потоков в .NET 1.x глотались', 'Необработанное в любом потоке роняет процесс']
      ]
    },
    {
      t: 'choice',
      q: 'В горячем цикле половина ключей отсутствует в словаре. Что не так с этим кодом?',
      code: 'try\n{\n    total += prices[key];\n}\ncatch (KeyNotFoundException)\n{\n    missing++;\n}',
      options: [
        'Каждый промах — бросок с обходом и раскруткой стека, микросекунды вместо наносекунд; нужен TryGetValue',
        'Ничего: try без исключения бесплатен, а исключение стоит столько же, сколько if',
        'Индексатор словаря при отсутствии ключа вернёт default, catch не сработает',
        'KeyNotFoundException нельзя ловить, это исключение рантайма'
      ],
      answer: 0,
      explain: 'Сам try почти ничего не стоит, дорог бросок. Когда отсутствие ключа — обычный исход, его проверяют значением: TryGetValue делает один поиск и не бросает.',
      wrong: { 2: 'Индексатор Dictionary бросает KeyNotFoundException. default возвращают GetValueOrDefault и TryGetValue.' }
    },
    {
      t: 'multi',
      q: 'Что правда про AppDomain.UnhandledException? Отметь все.',
      options: ['Срабатывает для необработанного исключения в любом потоке', 'Позволяет отменить завершение процесса', 'Подходит, чтобы записать лог и сбросить буферы', 'Срабатывает на исключение в Task, которую никто не ждал'],
      answer: [0, 2],
      explain: 'Это уведомление перед падением: IsTerminating равен true, отменить нельзя. Исключения недождавшихся задач идут в TaskScheduler.UnobservedTaskException, процесс они не роняют.'
    },
    {
      t: 'blanks',
      q: 'Граница фоновой задачи: запиши любую ошибку, но отмену пропусти наружу',
      code: 'try\n{\n    Run(ct);\n}\ncatch (Exception e) ___ (e is not ___Exception)\n{\n    log.Error(e, "job failed");\n}',
      tiles: ['when', 'if', 'OperationCanceled', 'Aggregate', 'Argument'],
      answer: ['when', 'OperationCanceled'],
      explain: 'Фильтр when отсекает OperationCanceledException: отмена не ловится и останавливает работу, а остальные ошибки пишутся в лог.'
    }
  ]
};
