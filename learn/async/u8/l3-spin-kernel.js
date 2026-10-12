/** Async/await до дна, раздел «Синхронизация глубже», урок 3: спин-блокировки против объектов ядра. */
export default {
  id: 'as.u8.l3',
  title: 'Крутиться или спать',
  sub: 'SpinWait и SpinLock против Mutex, Semaphore и событий ядра',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Два способа ждать',
      body: '<p>Замок занят. Что делать потоку?</p><ul><li><b>Крутиться</b> (spin): в цикле проверять, не освободился ли. Поток остаётся в пользовательском режиме, не теряет квант, отреагирует за наносекунды. Но всё это время он <b>жжёт ядро процессора</b> впустую.</li><li><b>Уснуть в ядре ОС</b>: попросить планировщик снять поток с процессора и разбудить по сигналу. Ядро процессора свободно для других. Но переход в режим ядра и обратно, переключение контекста и пробуждение стоят <b>единицы микросекунд</b>, а разбуженный поток ещё ждёт своей очереди.</li></ul><p>Отсюда правило: спин выгоден, только если ждать придётся <b>меньше, чем стоит заснуть и проснуться</b>, и есть второе ядро, на котором владелец замка прямо сейчас работает.</p>'
    },
    {
      t: 'choice',
      q: 'Когда чистый спин хуже, чем сон в ядре?',
      options: ['Владельца замка вытеснили, и он не работает: ждущий жжёт квант, пока тот не вернётся', 'Замок держат 50 наносекунд на машине с 16 ядрами', 'Критическая секция — одно присваивание', 'Конкуренции почти нет'],
      answer: 0,
      explain: 'Пока владелец не исполняется, освободить замок некому — спин гарантированно бесполезен. На одном ядре это вообще худший случай: крутящийся поток сам мешает владельцу получить процессор. Остальные варианты — как раз хорошие случаи для спина.'
    },
    {
      t: 'learn',
      title: 'SpinWait: спин, который умеет остановиться',
      body: '<p>Писать <code>while (!flag) { }</code> руками плохо: на одном ядре — вечный голод, на многих — лишний нагрев и помехи соседнему гиперпотоку. Структура <code>SpinWait</code> делает это правильно:</p><ul><li>первые вызовы <code>SpinOnce()</code> крутятся по-настоящему, с инструкцией-подсказкой процессору (<code>pause</code> на x64) и растущим числом итераций;</li><li>примерно после десятка вызовов начинает <b>уступать</b> процессор: <code>Thread.Yield</code>, <code>Sleep(0)</code>, иногда <code>Sleep(1)</code>;</li><li>на одноядерной машине уступает сразу.</li></ul><p><code>NextSpinWillYield</code> подскажет, что пора переходить на настоящее ожидание. Готовая обёртка — <code>SpinWait.SpinUntil(условие, таймаут)</code>.</p>',
      code: 'var spinner = new SpinWait();\nwhile (!Volatile.Read(ref _ready))\n{\n    spinner.SpinOnce();   // сначала крутится, потом уступает\n}\n\n// или одной строкой, с таймаутом в миллисекундах\nbool ok = SpinWait.SpinUntil(() => Volatile.Read(ref _ready), 100);'
    },
    {
      t: 'learn',
      title: 'SpinLock — структура с острыми краями',
      body: '<p><code>SpinLock</code> — замок, который при конкуренции крутится через тот же <code>SpinWait</code>. Он не выделяет объектов и не трогает ядро, поэтому годится для критических секций в несколько инструкций, которые берут <b>очень часто</b>.</p><p>Острые края:</p><ul><li>это <b>структура</b>: копия — отдельный замок. Не передавай по значению и не храни в <code>readonly</code>-поле;</li><li><b>не реентерабелен</b>: повторный вход тем же потоком с отслеживанием владельца бросит <code>LockRecursionException</code>, без отслеживания — вечный спин;</li><li>сигнатура <code>Enter(ref bool lockTaken)</code> — как у <code>Monitor</code>, ради надёжного <code>finally</code>.</li></ul><p>Правило: начинай с <code>lock</code>. На <code>SpinLock</code> переходи, только если профилировщик показал, что именно этот замок горячий.</p>',
      code: 'private SpinLock _spin = new(enableThreadOwnerTracking: false);\n\nbool taken = false;\ntry\n{\n    _spin.Enter(ref taken);\n    _items[_count++] = item;\n}\nfinally\n{\n    if (taken) _spin.Exit();\n}'
    },
    {
      t: 'tapline',
      q: 'Под нагрузкой элементы теряются, хотя все записи под SpinLock. Какая строка виновата?',
      code: 'class Buffer\n{\n    private readonly SpinLock _spin = new(false);\n    private int _count;\n\n    public void Add()\n    {\n        bool taken = false;\n        try { _spin.Enter(ref taken); _count++; }\n        finally { if (taken) _spin.Exit(); }\n    }\n}',
      answer: 2,
      explain: 'Вызов метода у структуры в readonly-поле идёт на защитной копии: каждый Enter берёт свой временный замок, и взаимного исключения нет. Убери readonly — тогда Enter будет менять само поле.'
    },
    {
      t: 'learn',
      title: 'Объекты ядра: WaitHandle',
      body: '<p><code>Mutex</code>, <code>Semaphore</code>, <code>EventWaitHandle</code> (и его наследники <code>AutoResetEvent</code>, <code>ManualResetEvent</code>) — обёртки над объектами ОС. Все они наследники <code>WaitHandle</code> и держат дескриптор ядра.</p><ul><li><b>Цена</b>: в Windows каждый <code>WaitOne</code>, <code>Set</code>, <code>Release</code> — системный вызов, даже если ждать не пришлось. В Linux и macOS рантайм эмулирует эти объекты в своём слое, без системного вызова на свободном объекте, но путь всё равно длинный. В обоих случаях это в десятки раз дороже входа в свободный <code>lock</code>.</li><li><b>Сила</b>: у объекта может быть <b>имя</b>, и тогда его видят другие процессы. Плюс <code>WaitHandle.WaitAny/WaitAll</code> — ждать сразу несколько объектов.</li></ul><p>Межпроцессная синхронизация — главная причина брать их сегодня. Внутри одного процесса почти всегда есть лёгкая замена: <code>lock</code>, <code>SemaphoreSlim</code>, <code>ManualResetEventSlim</code>.</p>',
      deep: '<p>Имена работают по-разному. В Windows именованными бывают все три типа, префикс <code>Global\\</code> делает имя видимым во всех сеансах, <code>Local\\</code> (по умолчанию) — только в своём. В Linux и macOS рантайм эмулирует только именованный <code>Mutex</code>; имя у <code>Semaphore</code> или <code>EventWaitHandle</code> там приводит к <code>PlatformNotSupportedException</code>.</p><p>В .NET Framework WaitHandle наследовался от MarshalByRefObject и служил ещё и для синхронизации между AppDomain. В современном .NET доменов приложений нет.</p>'
    },
    {
      t: 'match',
      q: 'Соедини примитив и его особенность',
      pairs: [
        ['Mutex', 'Привязан к потоку-владельцу, бывает межпроцессным'],
        ['Semaphore', 'Счётчик в ядре, отпустить может любой поток'],
        ['AutoResetEvent', 'Set пропускает одного ждущего и закрывается'],
        ['ManualResetEvent', 'После Set открыт для всех, пока не вызовут Reset'],
        ['SpinLock', 'Структура, ждёт в пользовательском режиме']
      ]
    },
    {
      t: 'learn',
      title: 'Mutex: владелец и брошенный замок',
      body: '<p><code>Mutex</code> помнит <b>поток-владелец</b>. Отпустить его может только тот, кто взял: <code>ReleaseMutex</code> из другого потока бросит <code>ApplicationException</code>. Поэтому, как и с <code>lock</code>, <code>await</code> между взятием и освобождением — ошибка.</p><p>Он <b>реентерабелен</b>: владелец может взять его повторно, но отпустить должен столько же раз.</p><p>Если поток или процесс-владелец умер, не отпустив мьютекс, ОС отдаёт его следующему ждущему, а тот получает <code>AbandonedMutexException</code>. Замок при этом уже его, но данные под замком могли остаться наполовину изменёнными.</p><p>Классическое применение — «только один экземпляр программы»:</p>',
      code: 'using var mutex = new Mutex(true, @"Global\\MyApp.SingleInstance", out bool createdNew);\nif (!createdNew)\n{\n    Console.WriteLine("Программа уже запущена");\n    return;\n}\nRunApp();   // мьютекс живёт, пока жив using'
    },
    {
      t: 'blanks',
      q: 'Не дай запустить второй экземпляр программы',
      code: 'using var gate = new ___(true, @"Global\\Exporter", out bool ___);\nif (!isFirst)\n    return;',
      tiles: ['Mutex', 'isFirst', 'SemaphoreSlim', 'Monitor', 'lockTaken'],
      answer: ['Mutex', 'isFirst'],
      explain: 'Нужен объект, видимый другим процессам, — именованный Mutex. Последний параметр говорит, создали ли мы его (первый экземпляр) или открыли существующий. SemaphoreSlim и Monitor живут только внутри процесса.'
    },
    {
      t: 'choice',
      q: 'Три потока ждут WaitOne() на одном AutoResetEvent. Другой поток один раз вызывает Set(). Что будет?',
      options: ['Проснётся один поток, событие снова закроется', 'Проснутся все три', 'Проснётся один, событие останется открытым', 'Ни один: Set без Reset не действует'],
      answer: 0,
      explain: 'AutoResetEvent — турникет: один проход на один Set. ManualResetEvent — ворота: после Set проходят все, пока кто-то не вызовет Reset.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['В Windows каждый WaitOne у Mutex — системный вызов, даже если мьютекс свободен', 'Semaphore можно отпустить из другого потока', 'SpinLock реентерабелен, как lock', 'SpinWait на одноядерной машине сразу уступает процессор', 'Именованный Semaphore работает в Linux так же, как в Windows'],
      answer: [0, 1, 3],
      explain: 'SpinLock не реентерабелен — в отличие от Monitor и Mutex. Именованными на Linux и macOS бывают только мьютексы, для Semaphore и EventWaitHandle имя поддерживается лишь в Windows.'
    }
  ]
};
