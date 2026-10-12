/** Async/await до дна, раздел «Синхронизация глубже», урок 4: гибридные замки — Monitor, Lock, Slim-примитивы. */
export default {
  id: 'as.u8.l4',
  title: 'Гибридные замки',
  sub: 'Monitor изнутри, Wait/Pulse, тип Lock в .NET 9 и семейство Slim',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'Лучшее от спина и от ядра',
      body: '<p>Чистый спин жжёт процессор, объект ядра дорог даже без конкуренции. <b>Гибридный</b> замок берёт лучшее от обоих и проходит три ступени:</p><ul><li><b>быстрый путь</b>: замок свободен — одна атомарная операция CompareExchange, и ты внутри. Ни ядра, ни аллокаций, десятки наносекунд;</li><li><b>короткий спин</b>: замок занят — немного покрутиться, вдруг владелец сейчас выйдет;</li><li><b>сон</b>: не дождался — уснуть на объекте ядра, пока владелец не разбудит при выходе.</li></ul><p>Так устроены <code>lock</code> (<code>Monitor</code>), новый <code>Lock</code>, <code>SemaphoreSlim</code>, <code>ManualResetEventSlim</code>, <code>ReaderWriterLockSlim</code>. Суффикс Slim означает именно это: лёгкая гибридная версия, без дескриптора ядра на быстром пути.</p>'
    },
    {
      t: 'learn',
      title: 'Monitor изнутри',
      body: '<p>Где <code>lock (obj)</code> хранит состояние? В <b>заголовке объекта</b> — том слове перед указателем на тип. Пока конкуренции нет, там лежит «тонкий замок» (thin lock): номер потока-владельца и счётчик повторных входов. Взять его — один CAS по заголовку.</p><p>Когда второй поток застал замок занятым, он немного крутится. Не помогло — замок <b>раздувается</b>: CLR заводит для объекта <b>sync block</b> — запись в отдельной таблице, где есть очередь ждущих и событие ядра для сна. В заголовок записывается номер этого sync block.</p><p>Сам оператор компилятор разворачивает так (с C# 4):</p>',
      code: 'bool lockTaken = false;\ntry\n{\n    Monitor.Enter(_gate, ref lockTaken);\n    // тело lock\n}\nfinally\n{\n    if (lockTaken) Monitor.Exit(_gate);\n}',
      deep: '<p>В заголовке мало места, и его делят тонкий замок и хеш-код по умолчанию. Если у объекта уже вызывали непереопределённый <code>GetHashCode</code>, хеш лежит в заголовке, и <code>lock</code> сразу идёт через sync block — и наоборот. Именно поэтому sync block вообще существует: он хранит всё, что не влезло, — хеш, замок, данные для COM-взаимодействия.</p><p>Sync block живёт, пока жив объект. Отсюда совет брать замок на отдельном приватном объекте: чужой код, сделавший <code>lock</code> на твоём <code>this</code> или на <code>typeof(...)</code>, разделит с тобой один и тот же замок.</p>'
    },
    {
      t: 'choice',
      q: 'Зачем у Monitor.Enter параметр ref bool lockTaken, если раньше писали просто Monitor.Enter(obj) перед try?',
      options: ['Исключение могло прилететь между взятием замка и входом в try, и замок остался бы навсегда занятым', 'Чтобы Enter мог вернуть false по таймауту', 'Чтобы lock стал реентерабельным', 'Чтобы JIT не выносил Enter из цикла'],
      answer: 0,
      explain: 'В .NET Framework между Enter и try могло прилететь асинхронное исключение (ThreadAbortException). Замок взят, а finally не выполнится. С lockTaken Enter сам находится внутри try, а finally точно знает, отпускать или нет. Для таймаута есть TryEnter, а реентерабелен Monitor и так.'
    },
    {
      t: 'learn',
      title: 'Wait и Pulse: ждать условия под замком',
      body: '<p><code>Monitor</code> — не только замок, но и <b>условная переменная</b>. Поток под замком видит, что продолжать рано (очередь пуста), и вызывает <code>Monitor.Wait</code>. Тот атомарно <b>отпускает замок</b> и усыпляет поток в очереди ожидания этого объекта.</p><p>Другой поток берёт замок, меняет состояние и вызывает <code>Pulse</code> — переводит одного ждущего в очередь готовых (<code>PulseAll</code> — всех). Проснувшийся снова захватывает замок и только тогда возвращается из <code>Wait</code>.</p><p>Оба метода вызываются <b>только под замком</b> этого объекта, иначе <code>SynchronizationLockException</code>.</p>',
      code: 'class SimpleQueue<T>\n{\n    private readonly Queue<T> _items = new();\n    private readonly object _gate = new();\n\n    public void Put(T item)\n    {\n        lock (_gate)\n        {\n            _items.Enqueue(item);\n            Monitor.Pulse(_gate);        // разбудить одного ждущего\n        }\n    }\n\n    public T Take()\n    {\n        lock (_gate)\n        {\n            while (_items.Count == 0)\n                Monitor.Wait(_gate);     // отпустить замок и уснуть\n            return _items.Dequeue();\n        }\n    }\n}'
    },
    {
      t: 'order',
      q: 'Расставь события: потребитель ждёт, производитель кладёт элемент',
      items: ['Потребитель берёт lock и видит пустую очередь', 'Wait отпускает lock, потребитель засыпает', 'Производитель берёт lock и кладёт элемент', 'Pulse переводит потребителя в очередь готовых', 'Производитель выходит из lock', 'Потребитель снова захватывает lock и перепроверяет условие'],
      explain: 'Pulse сам по себе замок не отдаёт: потребитель проснётся по-настоящему, только когда производитель выйдет из lock. А между этими моментами замок может перехватить кто-то третий.'
    },
    {
      t: 'tapline',
      q: 'Два потребителя. Иногда Dequeue бросает InvalidOperationException: очередь пуста. Какая строка виновата?',
      code: 'public T Take()\n{\n    lock (_gate)\n    {\n        if (_items.Count == 0)\n            Monitor.Wait(_gate);\n        return _items.Dequeue();\n    }\n}',
      answer: 4,
      explain: 'Между Pulse и повторным захватом замка второй потребитель может войти в lock «с улицы» и забрать элемент. Проснувшийся первый уже не проверяет условие и лезет в пустую очередь. Условие перед продолжением после Wait проверяют всегда в цикле while.'
    },
    {
      t: 'learn',
      title: 'Тип Lock в .NET 9',
      body: '<p>С .NET 9 и C# 13 есть отдельный тип <code>System.Threading.Lock</code>. Состояние замка живёт в полях самого объекта <code>Lock</code>, а не в заголовке произвольного объекта и не в таблице sync block. Документация рекомендует его для новых замков как самый быстрый вариант.</p><p>Компилятор узнаёт тип: <code>lock</code> по <code>Lock</code> превращается не в <code>Monitor.Enter</code>, а в <code>using (_gate.EnterScope())</code>. <code>EnterScope</code> возвращает <code>ref struct</code>, его <code>Dispose</code> отпускает замок.</p><p>Подвох: приведи <code>Lock</code> к <code>object</code> — и <code>lock</code> молча станет старым Monitor по заголовку. Компилятор предупредит: <b>CS9216</b>. И у <code>Lock</code> нет <code>Wait</code>/<code>Pulse</code>: для условных переменных остаётся <code>Monitor</code>.</p>',
      code: 'private readonly Lock _gate = new();\n\npublic void Add(int x)\n{\n    lock (_gate)          // компилятор вызовет _gate.EnterScope()\n    {\n        _sum += x;\n    }\n}\n\nobject o = _gate;        // CS9216: предупреждение здесь, на приведении\nlock (o) { }              // это уже Monitor'
    },
    {
      t: 'blanks',
      q: 'Напиши то, во что компилятор C# 13 превращает lock по новому типу',
      code: 'private readonly ___ _gate = new();\n\npublic void Add(int x)\n{\n    using (_gate.___())\n    {\n        _sum += x;\n    }\n}',
      tiles: ['Lock', 'EnterScope', 'object', 'Enter', 'SpinLock', 'Monitor'],
      answer: ['Lock', 'EnterScope'],
      explain: 'EnterScope берёт замок и возвращает структуру Scope, а using гарантирует её Dispose — выход из замка — даже при исключении. С полем типа object компилятор сгенерировал бы Monitor.Enter/Exit.'
    },
    {
      t: 'learn',
      title: 'Семейство Slim и ReaderWriterLockSlim',
      body: '<ul><li><b>SemaphoreSlim</b> — счётчик в пользовательском режиме. Из раздела про ловушки ты знаешь главное: у него есть <code>WaitAsync</code>, и он не привязан к потоку.</li><li><b>ManualResetEventSlim</b> — сначала крутится, потом ждёт через <code>Monitor</code>. Настоящее событие ядра создаёт, только если попросить свойство <code>WaitHandle</code>.</li><li><b>ReaderWriterLockSlim</b> — много читателей <b>или</b> один писатель. Есть режим «обновляемого чтения» (upgradeable): читаешь, а при необходимости повышаешь замок до записи. Пока ждёт писатель, новых читателей не пускают — чтобы писатель не голодал.</li></ul><p>У ReaderWriterLockSlim за всё это <b>своя цена</b>: учёт читателей дороже простого <code>lock</code>. Он выигрывает, только когда чтений гораздо больше, чем записей, и каждое чтение длится заметно дольше самой операции входа.</p>',
      deep: '<p>По умолчанию ReaderWriterLockSlim создаётся с <code>LockRecursionPolicy.NoRecursion</code>: повторный вход тем же потоком бросает <code>LockRecursionException</code>. Обновляемое чтение одновременно может держать только один поток — иначе два «повышающихся» читателя ждали бы друг друга. Объект <code>IDisposable</code>.</p><p>Старый <code>ReaderWriterLock</code> из .NET Framework 1.x медленнее и с известными проблемами — в новом коде не нужен. Все Slim-примитивы, как и <code>Monitor</code>, работают только внутри процесса.</p>'
    },
    {
      t: 'choice',
      q: 'Кэш справочника: 99% обращений — поиск в словаре на 100 нс, редкие перезагрузки. Что даст замена lock на ReaderWriterLockSlim?',
      options: ['Скорее всего ничего или замедление: учёт читателей стоит сравнимо с самим чтением', 'Ускорение в число ядер раз: читатели не мешают друг другу', 'Deadlock при первой перезагрузке', 'Ничего не изменится: внутри это тот же Monitor'],
      answer: 0,
      explain: 'Каждый вход читателя — атомарные операции над общим счётчиком, и его кэш-линия мечется между ядрами так же, как у lock. При коротких чтениях выигрыша нет. Здесь лучше неизменяемый снимок справочника: читатели берут ссылку без замка, перезагрузка подменяет её через Volatile.Write или Interlocked.Exchange.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и примитив',
      pairs: [
        ['Короткая критическая секция в .NET 9', 'lock по полю типа Lock'],
        ['Ждать условия под замком', 'Monitor.Wait / Pulse'],
        ['Ограничить параллельность, ожидание через await', 'SemaphoreSlim'],
        ['Длинные частые чтения, редкие записи', 'ReaderWriterLockSlim'],
        ['Один поток открывает ворота для многих', 'ManualResetEventSlim']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Свободный lock берётся без перехода в ядро', 'Monitor.Wait можно вызвать без lock на этом объекте', 'Lock, приведённый к object, в операторе lock работает как Monitor', 'SemaphoreSlim можно отпустить из другого потока', 'У System.Threading.Lock есть Wait и Pulse'],
      answer: [0, 2, 3],
      explain: 'Wait без замка бросит SynchronizationLockException. Lock — только взаимное исключение, условных переменных у него нет. Приведение к object выключает весь смысл нового типа — об этом и предупреждение CS9216.'
    }
  ]
};
