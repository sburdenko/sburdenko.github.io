/** C# глубже, раздел «Исключения и надёжность», урок 1: что гарантирует finally и как работают фильтры when. */
export default {
  id: 'cs.u12.l1',
  title: 'finally и фильтры when',
  sub: 'Что обещает finally, двухпроходная обработка и логирование без catch',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Что обещает finally',
      body: '<p>Блок <code>finally</code> выполняется, как бы управление ни покидало <code>try</code>:</p><ul><li>код дошёл до конца;</li><li>сработал <code>return</code>, <code>break</code>, <code>continue</code> или <code>goto</code> наружу;</li><li>вылетело исключение, и его поймал <code>catch</code> — здесь же или несколькими кадрами выше.</li></ul><p>На этом стоят <code>using</code>, <code>lock</code> и <code>foreach</code>: компилятор разворачивает их в <code>try/finally</code>, чтобы <code>Dispose</code> или <code>Monitor.Exit</code> вызвались в любом случае.</p>',
      code: 'using var file = File.OpenRead(path);\nreturn Parse(file);\n\n// компилятор превращает это примерно в:\nvar file = File.OpenRead(path);\ntry\n{\n    return Parse(file);\n}\nfinally\n{\n    file?.Dispose();\n}'
    },
    {
      t: 'choice',
      q: 'Что вернёт F()?',
      code: 'static int F()\n{\n    int x = 1;\n    try\n    {\n        return x;\n    }\n    finally\n    {\n        x = 10;\n    }\n}',
      options: ['1', '10', 'Не скомпилируется', '0'],
      answer: 0,
      explain: 'return x сначала копирует значение во временную переменную, потом выполняется finally, потом метод возвращает сохранённую копию. Изменение x в finally на неё не влияет. Будь x ссылкой на список, изменения внутри объекта были бы видны — копируется ссылка, а не объект.',
      wrong: { 2: 'Менять переменные в finally можно. Запрещено только выходить из него: return внутри finally — ошибка CS0157.' }
    },
    {
      t: 'learn',
      title: 'Когда finally не выполнится',
      body: '<p>Обещание finally держится, только пока процесс жив и стек раскручивается штатно. Не выполнится он, если:</p><ul><li><b>переполнился стек</b> — <code>StackOverflowException</code> сразу завершает процесс (как в курсе «Память в .NET»);</li><li>вызван <b><code>Environment.FailFast</code></b> — процесс завершается немедленно, без finally и финализаторов, с записью в журнал событий Windows;</li><li>вызван <b><code>Environment.Exit</code></b> внутри <code>try</code> — finally этого потока не выполнится, хотя обработчики завершения процесса сработают;</li><li>процесс <b>убили снаружи</b>: <code>kill -9</code>, «Снять задачу», выключение питания.</li></ul><p>Для <b>необработанного</b> исключения документация finally не обещает: всё зависит от того, как рантайм завершает процесс.</p>',
      deep: '<p>На .NET 9 под Linux с необработанным исключением в Main порядок такой: сначала событие <code>AppDomain.UnhandledException</code> и сообщение «Unhandled exception», и только потом finally. Рантайм нашёл, что обработчика нет, ещё <b>до</b> раскрутки стека — это и есть двухпроходная схема, о ней через пару экранов. Полагаться на такой finally нельзя: на другой ОС, версии или под отладчиком поведение может отличаться.</p><p>Вывод для надёжного кода: finally — для освобождения ресурсов внутри живого процесса. Данные, которые должны пережить падение, сохраняют заранее (транзакция, запись на диск с fsync), а не «в последний момент».</p>'
    },
    {
      t: 'multi',
      q: 'В каких случаях finally этого try НЕ выполнится? Отметь все.',
      options: ['В try вызван Environment.FailFast("bye")', 'В try выполнен return', 'В try бесконечная рекурсия переполнила стек', 'Исключение из try поймано тремя кадрами выше', 'Процесс получил SIGKILL'],
      answer: [0, 2, 4],
      explain: 'return и пойманное выше исключение — штатные выходы, finally выполнится. FailFast, переполнение стека и SIGKILL завершают процесс без раскрутки стека.'
    },
    {
      t: 'learn',
      title: 'Исключение из finally затирает исходное',
      body: '<p>Если finally выполняется из-за исключения и сам бросает новое, исходное <b>теряется</b>: дальше по стеку летит только новое. В логе окажется ошибка уборки, а не настоящая причина.</p><p>Поэтому в finally пишут код, который не бросает: проверяют на null, а <code>Dispose</code> по рекомендациям .NET бросать не должен. Выйти из finally через <code>return</code>, <code>break</code> или <code>goto</code> компилятор не даст — ошибка <b>CS0157</b>.</p>',
      code: 'try\n{\n    Save(order);              // бросил IOException\n}\nfinally\n{\n    connection.Close();       // connection == null →\n                              // NullReferenceException,\n                              // IOException потеряна\n}'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'try\n{\n    try { throw new InvalidOperationException("A"); }\n    finally { throw new ArgumentException("B"); }\n}\ncatch (Exception e)\n{\n    Console.WriteLine(e.GetType().Name);\n}',
      options: ['ArgumentException', 'InvalidOperationException', 'AggregateException', 'Процесс упадёт'],
      answer: 0,
      explain: 'Исключение из finally заменило летевшее. InvalidOperationException не попадает ни в InnerException, ни куда-либо ещё — она просто исчезла.',
      wrong: { 2: 'AggregateException собирает ошибки задач и Parallel. Обычный try/finally ничего не объединяет.' }
    },
    {
      t: 'learn',
      title: 'Два прохода: сначала поиск, потом раскрутка',
      body: '<p>CLR обрабатывает исключение в <b>два прохода</b> (two-pass):</p><p><b>Первый проход — поиск.</b> Рантайм идёт по стеку вверх от места броска и ищет подходящий <code>catch</code>. Фильтры <code>when</code> вычисляются здесь. Стек при этом <b>не тронут</b>: все кадры, их локальные переменные, место броска — на месте.</p><p><b>Второй проход — раскрутка</b> (unwind). Найдя обработчик, рантайм снова идёт от места броска и выполняет все <code>finally</code> по пути, снимая кадры. И только потом входит в тело <code>catch</code>.</p><p>Если первый проход не нашёл никого — исключение необработанное, и процесс узнаёт об этом, пока стек ещё цел. Поэтому дамп упавшего процесса показывает точное место.</p>',
      deep: '<p>Схема пришла из Windows SEH, а на Linux и macOS CoreCLR воспроизводит её сам. В .NET 9 обработку исключений в CoreCLR переписали на управляемый код (реализация пришла из NativeAOT) — два прохода остались, обработка стала заметно быстрее.</p>'
    },
    {
      t: 'choice',
      q: 'Log печатает строку и возвращает true. Что выведет программа?',
      code: 'try\n{\n    try { throw new Exception(); }\n    finally { Console.Write("finally "); }\n}\ncatch (Exception) when (Log("filter "))\n{\n    Console.Write("catch");\n}',
      options: ['filter finally catch', 'finally filter catch', 'finally catch', 'filter catch finally'],
      answer: 0,
      explain: 'Фильтр внешнего catch вычисляется в первом проходе, когда внутренний finally ещё не выполнялся. Затем второй проход раскручивает стек — finally, и лишь потом тело catch.',
      wrong: { 1: 'Так было бы, если бы стек раскручивался до проверки фильтра — как при catch с повторным throw. Фильтр видит стек целым.' }
    },
    {
      t: 'learn',
      title: 'Фильтр when и логирование без catch',
      body: '<p>Фильтр <code>catch (X e) when (условие)</code> появился в C# 6. Если условие ложно, этот catch пропускается и поиск идёт дальше — к следующему catch или выше по стеку. Если сам фильтр бросит исключение, оно проглатывается и считается за <code>false</code>.</p><p>Главный приём — <b>логирование через фильтр</b>: метод пишет лог и возвращает <code>false</code>. Исключение не поймано, стек не раскручен, а запись уже сделана. Сравни с <code>catch { Log(e); throw; }</code>: тут стек успел раскрутиться до этого кадра, и дамп или отладчик уже не покажут локальные переменные в месте броска.</p>',
      code: 'try\n{\n    Process(order);\n}\ncatch (Exception e) when (LogAndContinue(e))\n{\n    // сюда не попадаем никогда\n}\n\nstatic bool LogAndContinue(Exception e)\n{\n    log.Error(e, "Process failed");\n    return false;   // «не мой» — ищите дальше\n}',
      deep: '<p>В IL фильтр — отдельный блок <code>filter</code> рядом с <code>catch</code>; в VB.NET и F# он был с первых версий, C# догнал в версии 6. Фильтр выполняется, пока под ним лежат кадры, которые ещё не раскручены, поэтому держи его коротким и без побочных эффектов, кроме лога: внутренние <code>finally</code> ещё не сработали, и <code>lock</code>, взятый глубже, всё ещё занят.</p><p>Ещё раньше фильтров срабатывает событие <code>AppDomain.CurrentDomain.FirstChanceException</code> — на каждый бросок, даже пойманный. Подходит для диагностики, но не для логики.</p>'
    },
    {
      t: 'blanks',
      q: 'Повтори запрос при временной ошибке, а остальные ошибки только запиши в лог, не ловя их',
      code: 'catch (IOException e) ___ (IsTransient(e))\n{\n    retry = true;\n}\ncatch (Exception e) when (Log(e))\n{\n    // недостижимо: Log всегда возвращает ___\n}',
      tiles: ['when', 'if', 'where', 'true', 'false'],
      answer: ['when', 'false'],
      explain: 'Ключевое слово фильтра — when. Log возвращает false, поэтому второй catch никогда не входит в тело: исключение идёт дальше по стеку, но уже записано, пока стек цел.'
    },
    {
      t: 'learn',
      title: 'Тогда и сейчас: ThreadAbortException и CER',
      body: '<p>В .NET Framework исключение могло прилететь <b>в любой точке</b>: <code>Thread.Abort</code> впрыскивал в чужой поток <code>ThreadAbortException</code> — хоть между созданием объекта и записью ссылки. Пойманное, оно автоматически бросалось заново в конце catch, пока кто-нибудь не вызывал <code>Thread.ResetAbort</code>. Так работали таймауты ASP.NET и <code>Response.Redirect</code>.</p><p>Против этого была <b>CER</b> (constrained execution region): <code>RuntimeHelpers.PrepareConstrainedRegions</code> и атрибут <code>ReliabilityContract</code> заставляли заранее скомпилировать код finally, чтобы уборка не сорвалась на нехватке памяти или аборте.</p><p>В современном .NET этого нет: <code>Thread.Abort</code> бросает <code>PlatformNotSupportedException</code> (с .NET 5 ещё и предупреждение SYSLIB0006), CER не поддерживаются (SYSLIB0004). Остановка потока — только кооперативная, через <code>CancellationToken</code>.</p>',
      deep: '<p>Отказ от асинхронных исключений упростил всё: исключение возникает только там, где код что-то вызывает или проверяет. Нехватка памяти никуда не делась, но для ОС-ресурсов есть <code>SafeHandle</code>: он закрывает дескриптор и в <code>Dispose</code>, и в финализаторе, если Dispose забыли, и не даёт закрыть дескриптор, пока им пользуется другой поток. А при завершении процесса его дескрипторы закрывает сама ОС. Выгрузку кода, ради которой в Framework абортили потоки домена, заменили выгружаемые <code>AssemblyLoadContext</code>, и выгрузка там тоже кооперативная: пока поток выполняет код из контекста, тот не выгрузится.</p>'
    },
    {
      t: 'match',
      q: 'Соедини ситуацию и что произойдёт',
      pairs: [
        ['Thread.Abort() в .NET 8', 'PlatformNotSupportedException'],
        ['Environment.FailFast в try', 'Процесс завершится без finally'],
        ['return внутри finally', 'Ошибка компиляции CS0157'],
        ['Исключение внутри фильтра when', 'Фильтр считается false'],
        ['throw в finally во время исключения', 'Исходное исключение потеряно']
      ]
    }
  ]
};
