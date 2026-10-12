/** Курс «Память в .NET», раздел 2, урок 2: dotnet-counters, dotnet-gcdump, dotnet-trace, dotnet-dump и PerfView. */
export default {
  id: 'mem.u2.l2',
  title: 'Инструменты',
  sub: 'Счётчики, снимки кучи, трассы и дампы',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Пять инструментов — пять вопросов',
      body: '<ul><li><b>dotnet-counters</b> — что происходит прямо сейчас: размер кучи, сборки, паузы, скорость аллокаций;</li><li><b>dotnet-gcdump</b> — какие типы занимают кучу и кто их держит;</li><li><b>dotnet-trace</b> — что происходило за отрезок времени: каждая сборка, кто аллоцирует;</li><li><b>dotnet-dump</b> — полная память процесса: значения полей, потоки, всё сразу;</li><li><b>PerfView</b> — анализатор для Windows: открывает трассы и снимки, сравнивает их.</li></ul><p>Первые четыре — кроссплатформенные утилиты .NET. Ставятся как глобальные инструменты: <code>dotnet tool install --global dotnet-counters</code>. С .NET 10 SDK можно запускать и без установки: <code>dnx dotnet-counters</code>.</p>',
      code: 'dotnet tool install --global dotnet-counters\ndotnet-counters ps        # какие .NET-процессы видны',
      deep: 'Все четыре говорят с рантаймом через диагностический порт (diagnostic port): в Windows это именованный канал, в Linux и macOS — Unix-сокет во временной папке. Отсюда частые проблемы: инструмент нужно запускать от того же пользователя, что и процесс (или от root), с тем же TMPDIR, а в контейнер — либо ставить инструмент внутрь, либо пробрасывать сокет и указывать --diagnostic-port. Тогда в .NET Framework этого не было: были счётчики производительности Windows, ETW и WinDbg с SOS.'
    },
    {
      t: 'learn',
      title: 'dotnet-counters: пульс кучи',
      body: '<p><code>dotnet-counters monitor</code> подключается к процессу и раз в секунду обновляет таблицу. <code>collect</code> пишет то же в CSV или JSON.</p><p>С .NET 9 рантайм публикует метр <code>System.Runtime</code> с новыми именами. Для памяти смотри:</p><ul><li><code>dotnet.gc.last_collection.heap.size</code> — куча по поколениям после прошлой сборки;</li><li><code>dotnet.gc.last_collection.heap.fragmentation.size</code> — дыры;</li><li><code>dotnet.gc.last_collection.memory.committed_size</code> — commit сборщика;</li><li><code>dotnet.gc.heap.total_allocated</code> — всего выделено, по приросту видна скорость аллокаций;</li><li><code>dotnet.gc.collections</code> и <code>dotnet.gc.pause.time</code> — сборки и паузы;</li><li><code>dotnet.process.memory.working_set</code>.</li></ul>',
      code: 'dotnet-counters monitor -n Shop --counters System.Runtime[dotnet.gc.last_collection.heap.size,dotnet.gc.heap.total_allocated]',
      deep: 'Если приложение на .NET 8 или старше, метра System.Runtime нет, и инструмент показывает старые EventCounters: gc-heap-size, gen-0-size, gen-2-size, loh-size, poh-size, alloc-rate, time-in-gc, gc-fragmentation, gc-committed (с .NET 6), working-set. Без --counters по умолчанию показывается весь System.Runtime. Те же метрики можно отдавать в OpenTelemetry и смотреть на дашборде — counters нужен для быстрого взгляда без настройки.'
    },
    {
      t: 'match',
      q: 'Соедини вопрос и счётчик System.Runtime в .NET 9+',
      pairs: [
        ['Сколько байт в секунду выделяет код', 'dotnet.gc.heap.total_allocated'],
        ['Растёт ли второе поколение', 'dotnet.gc.last_collection.heap.size'],
        ['Сколько потоки простояли в сборках', 'dotnet.gc.pause.time'],
        ['Много ли дыр в куче', 'dotnet.gc.last_collection.heap.fragmentation.size'],
        ['Сколько процесса сейчас в RAM', 'dotnet.process.memory.working_set']
      ]
    },
    {
      t: 'blanks',
      q: 'Сохрани счётчики процесса 1902 в таблицу, чтобы потом построить график',
      code: 'dotnet-counters ___ -p 1902 --refresh-interval 5 --format ___ -o gc.csv',
      tiles: ['collect', 'monitor', 'csv', 'nettrace', 'speedscope'],
      answer: ['collect', 'csv'],
      explain: 'monitor только рисует таблицу в терминале, в файл пишет collect. Форматы collect — csv и json; nettrace и speedscope — форматы dotnet-trace.'
    },
    {
      t: 'learn',
      title: 'dotnet-gcdump: граф кучи без значений',
      body: '<p><code>dotnet-gcdump collect -p 1902</code> просит рантайм выполнить <b>полную сборку второго поколения</b> и во время неё выдать события обо всех объектах и ссылках между ними. Из них инструмент собирает граф и пишет файл <code>.gcdump</code>.</p><p>В файле — типы, размеры, ссылки и корни. <b>Значений полей нет</b>: ни строк, ни чисел. Поэтому файл маленький, его не страшно передать, и он хорош для вопроса «что занимает память и кто держит».</p><p>Цена: полная блокирующая сборка, на большой куче — длинная пауза. Открывают <code>.gcdump</code> в Visual Studio или PerfView, в Linux можно получить таблицу типов: <code>dotnet-gcdump report файл.gcdump</code>.</p>',
      deep: 'События идут через буфер в самом процессе, который может вырасти до 256 МБ, — учитывай это в контейнере с тесным лимитом. На очень большой куче события могут потеряться, и снимок выйдет неполным; тогда снимай полный дамп. По умолчанию collect ждёт 30 секунд (-t меняет таймаут). Visual Studio умеет открыть два .gcdump и сравнить их.'
    },
    {
      t: 'choice',
      q: 'В кэше тысячи строк. Нужно увидеть, какие именно URL в них лежат. Что снимать?',
      options: [
        'Дамп процесса через dotnet-dump',
        'Снимок кучи через dotnet-gcdump',
        'Счётчики через dotnet-counters',
        'Трассу с профилем gc-collect'
      ],
      answer: 0,
      explain: 'Содержимое объектов есть только в полном дампе памяти: dumpheap находит строки, dumpobj показывает их текст. В .gcdump только типы, размеры и ссылки, а счётчики и gc-collect вообще не знают об отдельных объектах.',
      wrong: { 1: 'Снимок кучи покажет, сколько строк и кто их держит, но не их текст: значений полей в .gcdump нет.' }
    },
    {
      t: 'learn',
      title: 'dotnet-dump: вся память и SOS',
      body: '<p><code>dotnet-dump collect -p 1902</code> пишет дамп. Тип задаёт <code>--type</code>: <code>Full</code> (по умолчанию, вся память с образами модулей), <code>Heap</code> (вся память, кроме отображённых образов), <code>Mini</code> и <code>Triage</code> (стеки и модули, без кучи). Для разбора памяти нужен Full или Heap. Файл размером с память процесса и содержит всё: пароли, токены, данные клиентов.</p><p><code>dotnet-dump analyze файл</code> открывает консоль с командами SOS:</p><ul><li><code>dumpheap -stat</code> — типы по суммарному размеру, самые большие внизу;</li><li><code>dumpheap -mt &lt;MT&gt;</code> — адреса объектов одного типа;</li><li><code>dumpobj &lt;адрес&gt;</code> — поля объекта;</li><li><code>gcroot &lt;адрес&gt;</code> — путь от корня до объекта;</li><li><code>eeheap -gc</code>, <code>finalizequeue</code>, <code>gchandles</code> — сегменты кучи, очередь финализации, дескрипторы.</li></ul>',
      deep: 'Дамп можно получить и в момент падения, без инструмента: переменные окружения DOTNET_DbgEnableMiniDump=1 и DOTNET_DbgMiniDumpType (1 — Mini, 2 — Heap, 3 — Triage, 4 — Full). В контейнере для collect нужна возможность ptrace, а снятие полного дампа может временно поднять потребление памяти — с жёстким лимитом контейнер рискует быть убитым. Тогда в .NET Framework то же делали WinDbg с расширением SOS; в dotnet-dump те же команды, но без нативного отладчика.'
    },
    {
      t: 'order',
      q: 'Расставь шаги разбора дампа по порядку',
      items: [
        'dotnet-dump collect -p 1902 --type Full',
        'dotnet-dump analyze core_20261012_101500',
        'dumpheap -stat',
        'dumpheap -mt 00007f6c20a67498',
        'gcroot 00007f6ad09421f8'
      ],
      explain: 'Сначала снять дамп и открыть его. Затем статистика по типам — найти подозрительный тип и его MT. По MT — список экземпляров, из него взять адрес. И для адреса — путь до корня.'
    },
    {
      t: 'learn',
      title: 'dotnet-trace: кто аллоцирует',
      body: '<p>Снимок кучи показывает, что <b>выжило</b>. Если проблема в том, что код <b>много выделяет</b> и GC работает без остановки, нужна трасса.</p><p><code>dotnet-trace collect -p 1902 --profile gc-verbose</code> пишет события каждой сборки (причина, поколение, пауза) и выборку аллокаций: примерно на каждые 100 КБ выделенной памяти — событие AllocationTick с типом объекта и стеком вызова. Агрегируя их, видно, какие методы выделяют больше всего. Профиль <code>gc-collect</code> — только сборки, с минимальной нагрузкой.</p><p>Результат — файл <code>.nettrace</code>. Открывают его в PerfView или Visual Studio.</p>',
      code: 'dotnet-trace collect -p 1902 --profile gc-verbose --duration 00:00:00:30',
      deep: 'Профили менялись между версиями инструмента: в свежих dotnet-trace без --profile включаются dotnet-common и dotnet-sampled-thread-time, а старого профиля cpu-sampling у collect больше нет. Список профилей у твоей версии — dotnet-trace list-profiles. Формат speedscope годится для CPU-стеков, а для GC-событий нужен nettrace. AllocationTick — выборка, а не каждая аллокация: редкие мелкие аллокации в неё могут не попасть.'
    },
    {
      t: 'choice',
      q: 'Счётчики показывают 2 ГБ аллокаций в секунду и 40 сборок gen0 в секунду, но куча не растёт. Что снять, чтобы найти виновника?',
      options: [
        'Трассу dotnet-trace с профилем gc-verbose',
        'Два снимка dotnet-gcdump и сравнить',
        'Дамп dotnet-dump с типом Mini',
        'dotnet-counters с интервалом в 1 секунду'
      ],
      answer: 0,
      explain: 'Куча не растёт — значит, объекты быстро умирают и в снимках их почти нет. Ответ «кто выделяет» дают стеки аллокаций из трассы. Mini-дамп не содержит кучи, а счётчики не знают стеков.'
    },
    {
      t: 'learn',
      title: 'PerfView',
      body: '<p>PerfView — бесплатный анализатор от Microsoft для Windows. Он собирает трассы через ETW — с событиями ядра и всех процессов машины — и открывает <code>.nettrace</code> и <code>.gcdump</code>, снятые в Linux.</p><p>Для памяти в нём три главные вещи:</p><ul><li><b>GCStats</b> — таблица всех сборок из трассы: поколение, причина, пауза, размер кучи до и после;</li><li><b>снимок кучи</b> (Memory → Take Heap Snapshot) и просмотр путей до корней;</li><li><b>Diff</b> — сравнение двух снимков или двух трасс относительно базового.</li></ul>',
      deep: 'На большой куче PerfView по умолчанию строит снимок по выборке объектов и масштабирует числа, поэтому размеры в нём приблизительные — для точных цифр есть полный дамп. Трассы и снимки, снятые в Linux, разбирают, перенеся файл на Windows-машину. Тогда, в эпоху .NET Framework, PerfView и WinDbg были основными инструментами; сейчас PerfView остаётся самым подробным просмотрщиком событий GC.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и инструмент',
      pairs: [
        ['Быстро глянуть, растёт ли куча', 'dotnet-counters'],
        ['Какие типы держат память, файл без данных', 'dotnet-gcdump'],
        ['Какие методы больше всего выделяют', 'dotnet-trace'],
        ['Значения полей на момент сбоя', 'dotnet-dump'],
        ['Таблица всех сборок с паузами на Windows', 'PerfView']
      ]
    }
  ]
};
