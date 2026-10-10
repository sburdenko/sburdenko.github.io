/** Ревью кода, раздел 0 (ModelManager), урок 3: HttpClient, .Result, атомарность загрузки, ключ object. */
export default {
  id: 'rv.u0.l3',
  title: 'Загрузка: HttpClient, .Result и атомарность',
  sub: 'Игра замирает, сокеты кончаются, данные расходятся',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'История: три жалобы на одну кнопку',
      body: '<p>Кнопка «Загрузить модель» вызывает <code>Load(url)</code>. Тестировщики пишут три тикета:</p><p>1. Пока модель грузится, <b>игра замирает</b>.<br>2. После частых перезагрузок на сервере сыплются ошибки соединений.<br>3. Повторная загрузка той же модели бросает <code>ArgumentException</code>, а поиск находит элементы, которых нет в словаре.</p><p>Все три живут в девяти строках метода.</p>',
      code: `public void Load(string url)
{
    _http = new HttpClient();
    var json = _http.GetStringAsync(url).Result;
    var elements = JsonConvert.DeserializeObject<List<ElementInfo>>(json);

    foreach (var e in elements)
    {
        _elements.Add(e);
        _byId.Add(e.Id, e);
    }
}`
    },
    {
      t: 'learn',
      title: 'HttpClient — это телефонная станция, а не звонок',
      body: '<p><code>HttpClient</code> задуман как <b>станция</b>, которую ставят один раз и через которую звонят много раз: у него внутри пул соединений, и он переиспользует уже открытые сокеты.</p><p>Новый <code>HttpClient</code> на каждый вызов — это новая станция со своим пулом. Старые соединения не переиспользуются, а закрытые ещё минуты висят в состоянии <code>TIME_WAIT</code>. При частых вызовах кончаются локальные порты: <code>SocketException</code>, хотя сеть в порядке.</p>',
      deep: '<p>Здесь старый клиент ещё и не освобождается: его соединения закроет только финализатор, когда до него доберётся GC. Но и <code>using (var c = new HttpClient())</code> на каждый запрос не лечит: сокеты всё равно уходят в TIME_WAIT. Правильно — один долгоживущий экземпляр (static) или <code>IHttpClientFactory</code>. В современном .NET у долгоживущего клиента есть своя ловушка — он не замечает смену DNS; её закрывает <code>SocketsHttpHandler.PooledConnectionLifetime</code>. В Unity сетевой код часто пишут на <code>UnityWebRequest</code>; на WebGL <code>HttpClient</code> не работает вовсе (нет сокетов).</p>'
    },
    {
      t: 'choice',
      q: 'Load вызывают каждые пару секунд. Что в итоге случится из-за строки _http = new HttpClient()?',
      options: ['Накопятся сокеты, и новые соединения начнут падать с SocketException', 'Ничего: HttpClient — лёгкий объект без ресурсов', 'Сработает CS-предупреждение, и сборка остановится'],
      answer: 0,
      explain: 'Каждый клиент открывает свои соединения и не делит их с другими. Закрытые соединения ещё какое-то время держат порт в TIME_WAIT. Под нагрузкой это исчерпание портов — классическая ошибка в .NET.',
      wrong: { 1: 'Внутри HttpClient — обработчик с пулом соединений и сокетами ОС. Это как раз тяжёлый объект.', 2: 'Компилятор здесь ничего не замечает. Ошибка проявляется только в работе, под нагрузкой.' }
    },
    {
      t: 'learn',
      title: '.Result: стоять у двери, пока не принесут посылку',
      body: '<p><code>GetStringAsync</code> — это заказ с доставкой: он сразу возвращает «квитанцию» (Task). <code>.Result</code> означает «буду стоять у двери, ничего не делая, пока не принесут». Если стоит <b>главный поток</b> Unity, замирает вся игра: ни кадров, ни ввода.</p><p>Вторая беда: ошибка приходит не как есть, а завёрнутой в <code>AggregateException</code>, и <code>catch (HttpRequestException)</code> её не поймает.</p>',
      code: `// плохо
var json = _http.GetStringAsync(url).Result;

// хорошо
var json = await Http.GetStringAsync(url);`,
      deep: '<p>Сам <code>HttpClient</code> внутри пишет <code>ConfigureAwait(false)</code>, поэтому именно эта строка обычно «только» замораживает поток на время запроса. Но стоит обернуть вызов в свой async-метод без <code>ConfigureAwait(false)</code> и сделать ему <code>.Result</code> на главном потоке, и получится классический дедлок: продолжение ждёт главный поток через <code>SynchronizationContext</code> Unity, а главный поток ждёт продолжение. <code>.GetAwaiter().GetResult()</code> не оборачивает исключение в AggregateException, но блокирует точно так же — это не лечение.</p>'
    },
    {
      t: 'choice',
      q: 'Сервер вернул 404. Какое исключение долетит до вызывающего Load?',
      code: `var json = _http.GetStringAsync(url).Result;`,
      options: ['AggregateException с HttpRequestException внутри', 'HttpRequestException как есть', 'Никакого: Result вернёт пустую строку'],
      answer: 0,
      explain: 'Свойство Task.Result оборачивает ошибку задачи в AggregateException. Настоящая причина лежит в InnerException. С await ты получил бы исходное HttpRequestException.',
      wrong: { 1: 'Так было бы с await. Блокирующее .Result заворачивает исключение.', 2: 'GetStringAsync проверяет код ответа и для 404 завершает задачу с ошибкой.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Поля и метод загрузки ModelManager. Найди баги: сеть, блокировка, данные из JSON, атомарность и тип ключа.',
      code: `private List<ElementInfo> _elements = new List<ElementInfo>();
private Dictionary<object, ElementInfo> _byId = new Dictionary<object, ElementInfo>();
private HttpClient _http;

public void Load(string url)
{
    _http = new HttpClient();
    var json = _http.GetStringAsync(url).Result;
    var elements = JsonConvert.DeserializeObject<List<ElementInfo>>(json);

    foreach (var e in elements)
    {
        _elements.Add(e);
        _byId.Add(e.Id, e);
    }
}`,
      bugs: [
        { lines: [1], title: 'Ключ словаря типа object', why: 'Каждый int Id упаковывается (boxing) при добавлении и при каждом поиске: лишние аллокации. И пропадает типобезопасность: положишь long — не найдёшь по int.' },
        { lines: [6], title: 'Новый HttpClient на каждый вызов', why: 'Каждый клиент заводит свой пул соединений, старый не освобождается. При частых загрузках копятся сокеты и кончаются порты.' },
        { lines: [4, 7], title: 'Синхронная загрузка через .Result', why: 'Поток стоит, пока идёт запрос: на главном потоке Unity игра замирает. Ошибки приходят в AggregateException, нет отмены и таймаута.' },
        { lines: [8, 10], title: 'DeserializeObject может вернуть null', why: 'Для JSON "null" или пустого ответа результат — null, и foreach бросит NullReferenceException.' },
        { lines: [12], title: 'Повторный Load дублирует элементы', why: 'Метод ничего не очищает: второй вызов дописывает те же элементы в _elements ещё раз.' },
        { lines: [13], title: 'Add бросает посреди цикла', why: 'На повторяющемся Id Dictionary.Add бросает ArgumentException. Часть элементов уже в _elements, а в _byId их нет: коллекции рассинхронизированы.' }
      ],
      goal: { min: 5, maxFalse: 2 },
      solve: ['flag:1', 'flag:4', 'flag:6', 'flag:8', 'flag:12', 'flag:13', 'check']
    },
    {
      t: 'multi',
      q: 'Модель уже загружена. Load вызывают второй раз с тем же JSON. Что произойдёт? Отметь все.',
      options: [
        '_elements вырастет на один элемент',
        '_byId останется прежним',
        'Вызывающий получит ArgumentException',
        '_elements удвоится'
      ],
      answer: [0, 1, 2],
      explain: 'Первый элемент успевает попасть в _elements, затем _byId.Add на уже существующем Id бросает ArgumentException, и цикл обрывается. В списке N+1 элемент, в словаре N. Именно «наполовину выполненная» операция и есть отсутствие атомарности.'
    },
    {
      t: 'learn',
      title: 'Атомарность: собрать новую коробку рядом',
      body: '<p>Не перекладывай вещи по одной в коробку, из которой уже берут. Собери <b>новую коробку рядом</b>, проверь её и только потом поставь на место старой одним движением.</p><p>Тогда любая ошибка (сеть, плохой JSON, дубликат Id) оставит старые данные целыми, а повторный вызов не создаст дублей.</p>',
      deep: '<p>Подмена двух полей (<code>_elements = list; _byId = byId;</code>) атомарна для одного потока. Если читатели живут в других потоках, они могут увидеть новый список со старым словарём — тогда держи оба в одном неизменяемом объекте-снимке и подменяй одну ссылку (<code>Volatile.Write</code>/<code>Interlocked.Exchange</code>). В Unity продолжение после <code>await</code> по умолчанию возвращается на главный поток, так что подмена там же, где данные читаются, и гонки нет.</p>'
    },
    {
      t: 'blanks',
      q: 'Собери правильную загрузку: один клиент на всё приложение и словарь без упаковки.',
      code: `private static ___ HttpClient Http = new HttpClient();

public async Task LoadAsync(string url, CancellationToken ct)
{
    using var resp = await Http.GetAsync(url, ct);
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    var list = JsonConvert.DeserializeObject<List<ElementInfo>>(json)
               ?? new List<ElementInfo>();

    var byId = new Dictionary<___, ElementInfo>();
    foreach (var e in list)
    {
        if (byId.ContainsKey(e.Id)) throw new InvalidDataException("Duplicate Id " + e.Id);
        byId.Add(e.Id, e);
    }

    _elements = list;   // подмена разом, после всех проверок
    _byId = byId;
}`,
      tiles: ['readonly', 'int', 'object', 'const', 'long'],
      answer: ['readonly', 'int'],
      explain: 'Один static readonly клиент переиспользует соединения. Dictionary<int, …> не упаковывает ключи. Новые коллекции собираются отдельно и подменяются только после всех проверок, поэтому ошибка не оставит данные «наполовину».'
    },
    {
      t: 'learn',
      title: 'object как ключ: каждая цифра в отдельной коробке',
      body: '<p>Чтобы положить <code>int</code> туда, где ждут <code>object</code>, среда <b>упаковывает</b> число в коробку в куче (boxing). <code>Dictionary&lt;object, …&gt;</code> делает это при каждом <code>Add</code> и при каждом <code>_byId[id]</code>: на каждый поиск — мусор для GC.</p><p>Работать будет: упакованный int сравнивается по значению. Но тип ключа больше не проверяется компилятором.</p>',
      code: `_byId.Add(5, e);           // ключ — упакованный int
_byId.ContainsKey(5L);     // false: long 5 не равен int 5`,
      deep: '<p><code>Int32.Equals(object)</code> возвращает true только если аргумент тоже упакованный <code>int</code>; упакованный <code>long</code> или <code>short</code> с тем же числом не равен. С <code>Dictionary&lt;int, T&gt;</code> используется <code>EqualityComparer&lt;int&gt;.Default</code>, который работает с int напрямую, без упаковки. В Unity это заметно в Profiler как GC Alloc в горячих местах вроде обработчика выбора.</p>'
    },
    {
      t: 'choice',
      q: 'Что вернёт последняя строка?',
      code: `var d = new Dictionary<object, string>();
d.Add(7, "pipe");
short key = 7;
bool found = d.ContainsKey(key);`,
      options: ['false', 'true', 'Бросит InvalidCastException'],
      answer: 0,
      explain: 'Ключ — упакованный int 7, а ищем упакованный short 7. Это разные типы, и Int32.Equals(object) вернёт false. С Dictionary<int, string> short неявно расширился бы до int, и всё нашлось бы.',
      wrong: { 1: 'Числа равны, но упакованы в разные типы. Для object-ключа это разные ключи.', 2: 'Приведения тут нет: словарь просто сравнивает объекты через Equals.' }
    },
    {
      t: 'order',
      q: 'Расставь шаги надёжной перезагрузки модели по порядку.',
      items: [
        'Асинхронно скачать JSON общим HttpClient (с токеном отмены)',
        'Десериализовать и заменить null пустым списком',
        'Собрать новый словарь, проверяя дубликаты Id',
        'Подменить _elements и _byId разом',
        'Уведомить подписчиков, что модель обновилась'
      ],
      explain: 'Всё, что может упасть, делается до подмены. Подписчиков зовём последними, когда данные уже целостные.'
    },
    {
      t: 'match',
      q: 'Соедини строку Load и проблему.',
      pairs: [
        ['_http = new HttpClient()', 'Исчерпание сокетов'],
        ['.Result', 'Замерший главный поток'],
        ['DeserializeObject(...)', 'Может вернуть null'],
        ['_elements.Add без очистки', 'Дубли при повторной загрузке'],
        ['_byId.Add(e.Id, e)', 'ArgumentException посреди цикла'],
        ['Dictionary<object, …>', 'Упаковка int на каждый поиск']
      ]
    }
  ]
};
