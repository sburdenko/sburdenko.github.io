/** Ревью кода, раздел 0 (ModelManager), урок 2: синглтон, конструктор с побочными эффектами, файловый дескриптор, подписка. */
export default {
  id: 'rv.u0.l2',
  title: 'Синглтон, конструктор и дескрипторы',
  sub: 'Одна строка static, которая роняет весь тип',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'История: тип, который умер навсегда',
      body: '<p>В редакторе всё работало. В сборке на старте в консоли <code>TypeInitializationException</code>, и дальше <b>каждое</b> обращение к <code>ModelManager</code> падает с тем же исключением. Перезапуск сцены не помогает, помогает только перезапуск приложения.</p><p>Всё из-за одной строки: <code>public static ModelManager Instance = new ModelManager();</code></p>'
    },
    {
      t: 'learn',
      title: 'Статический инициализатор: одна попытка',
      body: '<p>Инициализатор статического поля выполняется внутри <b>инициализатора типа</b> (статического конструктора). CLR запускает его один раз, при первом использовании типа.</p><p>Если внутри вылетело исключение, CLR оборачивает его в <code>TypeInitializationException</code> и <b>запоминает провал</b>. Второй попытки не будет: тип «отравлен» до конца жизни процесса (в Unity — до перезагрузки домена).</p><p>А конструктор здесь делает много опасного: открывает файл и подписывается на <code>SelectionService.Current</code>. Если <code>Current</code> ещё не создан — NullReferenceException прямо в инициализаторе типа.</p>',
      code: `public static ModelManager Instance = new ModelManager();

public ModelManager()
{
    _log = new FileStream("log.txt", FileMode.Append);
    SelectionService.Current.SelectionChanged += OnSelectionChanged;
}`,
      deep: '<p>Настоящая причина лежит в <code>InnerException</code>, а сообщение верхнего уровня говорит лишь «The type initializer for \'ModelManager\' threw an exception». Если в классе нет явного статического конструктора, тип помечается <code>beforefieldinit</code>, и CLR вправе выполнить инициализацию в любой момент до первого доступа к статическому полю — порядок относительно <code>SelectionService</code> вообще не гарантирован. В Unity с выключенной перезагрузкой домена (Enter Play Mode Options) статика переживает выход из Play Mode: и удачный, и «отравленный» тип остаются до перекомпиляции скриптов.</p>'
    },
    {
      t: 'order',
      q: 'Расставь по порядку, как одна строка static превращается в TypeInitializationException.',
      items: [
        'Код впервые обращается к ModelManager.Instance',
        'CLR запускает инициализатор типа ModelManager',
        'Вызывается new ModelManager()',
        'SelectionService.Current ещё null → NullReferenceException',
        'CLR оборачивает его в TypeInitializationException и запоминает провал'
      ],
      explain: 'Инициализатор типа выполняется один раз. Его исключение становится «вечным»: любое следующее обращение к типу бросит то же TypeInitializationException.'
    },
    {
      t: 'choice',
      q: 'Первое обращение к ModelManager.Instance упало. Что будет при втором обращении через минуту, когда SelectionService.Current уже создан?',
      options: ['Снова TypeInitializationException', 'Инициализация повторится и пройдёт успешно', 'Instance вернёт null без исключения'],
      answer: 0,
      explain: 'CLR не повторяет инициализатор типа. Провал запоминается, и тип недоступен до конца жизни процесса (домена). Поэтому побочные эффекты в статической инициализации так опасны.',
      wrong: { 1: 'Повтора нет: статический конструктор выполняется максимум один раз, даже неудачно.', 2: 'До поля дело не доходит: обращение к любому статическому члену типа бросает исключение.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Начало ModelManager: синглтон, конструктор и запись в лог. Найди баги жизненного цикла и ресурсов.',
      code: `public class ModelManager
{
    public static ModelManager Instance = new ModelManager();

    private FileStream _log;

    public event Action<ElementInfo> ElementSelected;

    public ModelManager()
    {
        _log = new FileStream("log.txt", FileMode.Append);
        SelectionService.Current.SelectionChanged += OnSelectionChanged;
    }

    private void OnSelectionChanged(int id)
    {
        var bytes = Encoding.UTF8.GetBytes("Selected " + id + "\\n");
        _log.Write(bytes, 0, bytes.Length);
    }
}`,
      bugs: [
        { lines: [0], title: 'Владеет FileStream, но не IDisposable', why: 'Класс держит файловый дескриптор, а закрыть его нечем: нет Dispose, и никто снаружи не может освободить ресурс.' },
        { lines: [2], title: 'Синглтон: публичное изменяемое поле и опасная статическая инициализация', why: 'Любой код может перезаписать Instance. Исключение в конструкторе превратится в TypeInitializationException и навсегда отравит тип.' },
        { lines: [8], title: 'Публичный конструктор у синглтона', why: 'Кто угодно создаст второй экземпляр: тот откроет log.txt ещё раз (IOException) и подпишется на событие повторно.' },
        { lines: [10], title: 'FileStream никогда не закрывается', why: 'Дескриптор занят до конца процесса, по умолчанию с FileShare.Read: второй экземпляр или другой процесс не откроют файл на запись. Относительный путь зависит от текущего каталога.' },
        { lines: [11], title: 'Подписка в конструкторе, которую никто не снимает', why: 'Если Current ещё null — NRE при инициализации типа. Подписка не снимается: SelectionService держит объект живым, а this уходит наружу из недостроенного конструктора.' },
        { lines: [17], title: 'Запись без Flush на главном потоке', why: 'FileStream буферизует данные (4 КБ по умолчанию): при падении процесса последние строки лога пропадут. Синхронная запись блокирует поток, который вызвал событие.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:0', 'flag:2', 'flag:8', 'flag:10', 'flag:11', 'check']
    },
    {
      t: 'learn',
      title: 'Файловый дескриптор — ключ от комнаты',
      body: '<p>Открыть файл — взять у ОС <b>ключ от комнаты</b>. Пока ключ у тебя, ОС помнит, что комната занята, и решает, кого ещё пустить. Здесь ключ берут в конструкторе и не отдают никогда.</p><p><code>new FileStream(path, FileMode.Append)</code> открывает файл только на запись и с <code>FileShare.Read</code>: другим можно читать, но не писать. Второй <code>new ModelManager()</code> или второй запущенный процесс получат <code>IOException</code> «файл занят другим процессом».</p>',
      code: `// так ресурс живёт ровно столько, сколько нужен
using (var log = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read))
{
    log.Write(bytes, 0, bytes.Length);
}`,
      deep: '<p>Конструктор <code>FileStream(string, FileMode)</code> берёт <code>FileAccess.Write</code> для Append (для остальных режимов — ReadWrite) и <code>FileShare.Read</code>, буфер — 4096 байт. Режим совместного доступа строго соблюдается на Windows; на Unix .NET эмулирует его через advisory-блокировки, поэтому поведение там может отличаться. <code>SafeFileHandle</code> имеет финализатор, так что «забытый» поток когда-нибудь закроет GC — но не здесь: объект живёт в статическом поле вечно. Относительный «log.txt» в Unity пишется в текущий каталог процесса (в редакторе — папка проекта, в сборке — как повезёт, а на мобильных туда часто нельзя писать); правильное место — <code>Application.persistentDataPath</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Кто-то в тестах пишет var m = new ModelManager(); при уже созданном Instance. Что вероятнее всего произойдёт на Windows?',
      options: ['IOException: log.txt уже открыт на запись первым экземпляром', 'Второй экземпляр тихо заменит Instance', 'Оба экземпляра будут писать в один лог без проблем'],
      answer: 0,
      explain: 'Первый экземпляр держит файл с FileShare.Read — другим разрешено только чтение. Второй FileStream на запись получит нарушение совместного доступа. Instance при этом не меняется: это просто ещё один объект.',
      wrong: { 1: 'Конструктор ничего не пишет в Instance. Получится второй объект рядом, а не замена.', 2: 'Совместную запись запрещает FileShare.Read, который стоит по умолчанию.' }
    },
    {
      t: 'learn',
      title: 'Подписка — это поводок',
      body: '<p><code>Current.SelectionChanged += OnSelectionChanged</code> кладёт в событие делегат, а делегат хранит ссылку на <code>this</code>. Получается <b>поводок</b> от SelectionService к ModelManager: пока жив источник события, жив и подписчик, даже если он всем уже не нужен.</p><p>Подписка в конструкторе ещё и выпускает <code>this</code> наружу до того, как объект достроен: событие может прийти, пока поля ещё не инициализированы.</p>',
      deep: '<p>Для статического синглтона утечка не так заметна (он и так вечный), но вылезает, как только появляется второй экземпляр, тесты или перезагрузка сцены: старые объекты продолжают получать события, обработчик вызывается дважды. Правило: кто подписался, тот и отписывается, симметрично (Init/Dispose, в Unity — OnEnable/OnDisable). Слабые события (weak event pattern) — костыль на случай, когда управлять жизнью подписчика нельзя.</p>'
    },
    {
      t: 'multi',
      q: 'Что плохого в подписке SelectionService.Current.SelectionChanged += OnSelectionChanged прямо в конструкторе? Отметь все.',
      options: [
        'Если Current ещё null, конструктор бросит NullReferenceException',
        'Отписки нет, SelectionService держит ModelManager живым',
        'this становится виден снаружи до окончания конструктора',
        'Компилятор запрещает подписку на события в конструкторе'
      ],
      answer: [0, 1, 2],
      explain: 'Подписываться в конструкторе синтаксически можно, но это скрытая зависимость от глобального состояния, утечка без отписки и «утечка this». Подписку лучше вынести в явный Init с отпиской в Dispose.'
    },
    {
      t: 'blanks',
      q: 'Перепиши синглтон безопасно: поле нельзя перезаписать, конструктор не вызвать снаружи, подписку можно снять.',
      code: `public sealed class ModelManager : IDisposable
{
    private static ___ Lazy<ModelManager> _instance =
        new Lazy<ModelManager>(() => new ModelManager());
    public static ModelManager Instance => _instance.Value;

    ___ ModelManager() { }   // без побочных эффектов

    public void Init(SelectionService selection) { /* запомнить _selection, открыть файл, подписаться */ }

    public void Dispose()
    {
        _selection.SelectionChanged ___ OnSelectionChanged;
        _log.Dispose();
    }
}`,
      tiles: ['readonly', 'private', '-=', 'public', '+=', 'const'],
      answer: ['readonly', 'private', '-='],
      explain: 'readonly не даёт перезаписать поле, private-конструктор не даёт создать второй экземпляр, -= снимает поводок. Всё опасное вынесено в явный Init: если он упадёт, тип не отравлен, и вызов можно повторить.'
    },
    {
      t: 'learn',
      title: 'Для сеньора: Lazy тоже помнит ошибки',
      body: '<p><code>Lazy&lt;T&gt;</code> даёт ленивость и потокобезопасность, но в режиме по умолчанию (<code>ExecutionAndPublication</code>) <b>кэширует исключение</b> фабрики: если конструктор упал, каждый следующий <code>.Value</code> бросит то же исключение. Отравление никуда не делось, просто переехало из типа в поле.</p><p>Поэтому главное лечение не «Lazy вместо new», а <b>конструктор без побочных эффектов</b> плюс явная инициализация.</p>',
      deep: '<p>Режим <code>LazyThreadSafetyMode.PublicationOnly</code> исключения не кэширует, но допускает параллельный запуск фабрики несколькими потоками. Ещё лучше — вообще уйти от глобального синглтона: внедрять ModelManager через конструктор (DI-контейнер вроде VContainer/Zenject в Unity) или композиционный корень сцены. Тогда зависимость от SelectionService видна в сигнатуре, её можно подменить в тесте, а порядок создания задаёшь ты, а не CLR.</p>'
    },
    {
      t: 'match',
      q: 'Соедини проблему и лечение.',
      pairs: [
        ['public static поле Instance', 'static readonly (или свойство только для чтения)'],
        ['Публичный конструктор синглтона', 'private-конструктор'],
        ['FileStream без закрытия', 'IDisposable / using'],
        ['Подписка без отписки', '-= в Dispose'],
        ['Побочные эффекты в инициализаторе типа', 'Явный Init после создания'],
        ['Относительный путь log.txt', 'Application.persistentDataPath']
      ]
    }
  ]
};
