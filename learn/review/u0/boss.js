/** Ревью кода, раздел 0 (ModelManager), финал: полный листинг. */
export default {
  id: 'rv.u0.boss',
  title: 'Финал: ModelManager',
  sub: 'Найди баги в полном листинге',
  minutes: 12,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'hunt',
      task: 'Это весь присланный на ревью ModelManager. Отметь как можно больше багов: изменяемая структура, синглтон, ресурсы, загрузка, поиск, события и обработка ошибок. Нужно найти не меньше 16.',
      code: `public struct ElementInfo
{
    public int Id;
    public string Name;
    public Bounds Box;
    public List<int> ChildIds;

    public void Rename(string newName)
    {
        Name = newName;
    }
}

public class ModelManager
{
    public static ModelManager Instance = new ModelManager();

    private List<ElementInfo> _elements = new List<ElementInfo>();
    private Dictionary<object, ElementInfo> _byId = new Dictionary<object, ElementInfo>();
    private FileStream _log;
    private HttpClient _http;

    public event Action<ElementInfo> ElementSelected;

    public ModelManager()
    {
        _log = new FileStream("log.txt", FileMode.Append);
        SelectionService.Current.SelectionChanged += OnSelectionChanged;
    }

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
    }

    public void RenameAll(string prefix)
    {
        foreach (var e in _elements)
        {
            e.Rename(prefix + e.Name);
        }
    }

    public List<ElementInfo> FindByName(string name)
    {
        var result = new List<ElementInfo>();
        for (int i = 0; i < _elements.Count; i++)
        {
            if (_elements[i].Name.ToLower().Contains(name.ToLower()))
                result.Add(_elements[i]);
        }
        return result;
    }

    public int CountClashes()
    {
        int count = 0;
        for (int i = 0; i < _elements.Count; i++)
            for (int j = 0; j < _elements.Count; j++)
                if (i != j && _elements[i].Box.Intersects(_elements[j].Box))
                    count++;
        return count;
    }

    private void OnSelectionChanged(int id)
    {
        try
        {
            var e = _byId[id];
            ElementSelected(e);
            var bytes = Encoding.UTF8.GetBytes("Selected " + id + " at " + DateTime.Now + "\\n");
            _log.Write(bytes, 0, bytes.Length);
        }
        catch (Exception) { }
    }
}`,
      bugs: [
        { lines: [0, 7, 9], title: 'Изменяемая структура с методом-мутатором', why: 'ElementInfo копируется при каждом чтении из List, передаче и присваивании, а Rename меняет только свою копию. Изменения теряются молча, копии в разных местах расходятся.' },
        { lines: [5], title: 'ChildIds: null по умолчанию и общий у копий', why: 'У default(ElementInfo) и при отсутствии поля в JSON список равен null — NullReferenceException при обращении. У копий структуры список один и тот же: полу-значение, полу-ссылка.' },
        { lines: [15], title: 'Синглтон: публичное не-readonly поле и опасная статическая инициализация', why: 'Instance может перезаписать кто угодно. Исключение в конструкторе станет TypeInitializationException, и тип останется отравленным до конца жизни процесса.' },
        { lines: [17], title: 'Общие коллекции без синхронизации', why: 'Если Load вызвать в фоне, а выбор придёт на главном потоке, List и Dictionary читаются во время записи: гонка, мусор или исключения.' },
        { lines: [18], title: 'Ключ словаря типа object', why: 'Каждый int Id упаковывается при добавлении и при каждом поиске — аллокации на каждый клик. Тип ключа не проверяется: long 5 не найдёт int 5.' },
        { lines: [20, 32], title: 'Новый HttpClient на каждый Load', why: 'Каждый клиент держит свой пул соединений, старый не освобождается и не переиспользуется. При частых загрузках копятся сокеты и кончаются порты.' },
        { lines: [24], title: 'Публичный конструктор у синглтона', why: 'Можно создать второй экземпляр: он снова откроет log.txt (IOException из-за FileShare.Read) и подпишется на выбор ещё раз.' },
        { lines: [26], title: 'FileStream не закрывается никогда', why: 'Нет IDisposable, дескриптор занят до конца процесса. Относительный путь зависит от текущего каталога, буфер без Flush теряется при падении.' },
        { lines: [27], title: 'Подписка в конструкторе без отписки', why: 'Если SelectionService.Current ещё null — NRE внутри инициализации типа. Подписку никто не снимает: источник держит объект, this уходит наружу из недостроенного конструктора.' },
        { lines: [30, 33], title: 'Синхронная загрузка через .Result', why: 'Поток ждёт ответа сети: на главном потоке Unity игра замирает. Ошибки приходят в AggregateException, нет отмены и таймаута, а в связке со своим async-кодом возможен дедлок.' },
        { lines: [34, 36], title: 'DeserializeObject может вернуть null', why: 'На JSON "null" или пустом ответе elements будет null, и foreach бросит NullReferenceException.' },
        { lines: [38], title: 'Load ничего не очищает', why: 'Повторный вызов дописывает элементы в _elements ещё раз: дубли в поиске и в подсчёте коллизий.' },
        { lines: [39], title: 'Dictionary.Add бросает посреди цикла', why: 'На повторяющемся Id — ArgumentException. Часть элементов уже в списке, но не в словаре: коллекции рассинхронизированы, операция не атомарна.' },
        { lines: [45, 47], title: 'RenameAll меняет копии', why: 'Переменная foreach — копия структуры, Rename меняет её, список остаётся прежним. Метод молча ничего не делает.' },
        { lines: [56], title: 'ToLower в цикле', why: 'Две новые строки на каждый элемент, name.ToLower() пересчитывается каждый раз. Зависимость от культуры (турецкая I) и NullReferenceException на элементе без имени.' },
        { lines: [66, 67], title: 'Каждая пара считается дважды', why: 'Внутренний цикл с j = 0 проверяет (i, j) и (j, i): результат вдвое больше правды. Нужно j = i + 1, а для больших моделей — пространственный индекс.' },
        { lines: [76], title: 'Индексатор на неизвестном id', why: '_byId[id] бросает KeyNotFoundException, если такого элемента нет. Нужен TryGetValue.' },
        { lines: [77], title: 'Событие вызывается без проверки на null', why: 'Без подписчиков ElementSelected равно null — NullReferenceException. Исключение подписчика прерывает метод, и лог не пишется.' },
        { lines: [78, 79], title: 'Запись лога: DateTime.Now, конкатенация, синхронная запись', why: 'Локальное время и формат зависят от пояса и культуры, на каждый клик аллокации строк и массива. Запись синхронная, без Flush и без блокировки.' },
        { lines: [81], title: 'Пустой catch (Exception)', why: 'Глотает все ошибки выше без следа: выбор «просто не работает», а в логе и консоли пусто.' }
      ],
      goal: { min: 16, maxFalse: 3 },
      solve: ['flag:0', 'flag:5', 'flag:15', 'flag:17', 'flag:18', 'flag:20', 'flag:24', 'flag:26', 'flag:27', 'flag:30', 'flag:34', 'flag:38', 'flag:39', 'flag:45', 'flag:56', 'flag:66', 'flag:76', 'flag:77', 'flag:78', 'flag:81', 'check']
    },
    {
      t: 'multi',
      q: 'Какие баги листинга не бросают никаких исключений, а просто дают неверный результат? Отметь все.',
      options: [
        'RenameAll меняет копии структуры',
        'CountClashes считает каждую пару дважды',
        'Ключ object в словаре упаковывает int',
        'Повторный Load с теми же данными'
      ],
      answer: [0, 1, 2],
      explain: 'RenameAll молча ничего не делает, CountClashes молча удваивает ответ, упаковка молча создаёт мусор. Повторный Load, наоборот, громкий: Dictionary.Add бросает ArgumentException на первом же дубликате.'
    },
    {
      t: 'tapline',
      q: 'В какой строке вылетит NullReferenceException, которое превратится в TypeInitializationException, если SelectionService ещё не создан?',
      code: `public static ModelManager Instance = new ModelManager();

public ModelManager()
{
    _log = new FileStream("log.txt", FileMode.Append);
    SelectionService.Current.SelectionChanged += OnSelectionChanged;
}`,
      answer: 5,
      explain: 'Обращение к Current.SelectionChanged при Current == null бросает NRE. Поскольку конструктор вызван из инициализатора статического поля, CLR завернёт его в TypeInitializationException, и тип станет непригодным до конца жизни процесса.'
    },
    {
      t: 'choice',
      q: 'Что из этого НЕ спасает от исчерпания сокетов в Load?',
      options: [
        'using (var c = new HttpClient()) на каждый запрос',
        'Один static readonly HttpClient на всё приложение',
        'IHttpClientFactory, который переиспользует обработчики'
      ],
      answer: 0,
      explain: 'Dispose закрывает соединения, но закрытые сокеты ещё какое-то время висят в TIME_WAIT, а пул соединений между клиентами не делится. Переиспользование одного клиента или фабрика обработчиков — правильные пути.',
      wrong: { 1: 'Это как раз рекомендуемый вариант: соединения переиспользуются. В современном .NET добавь PooledConnectionLifetime, чтобы замечать смену DNS.', 2: 'Фабрика держит и переиспользует обработчики с пулами — для этого она и создана.' }
    },
    {
      t: 'blanks',
      q: 'Две правки в одну строку каждая: сделай элемент ссылочным типом и вызови событие безопасно.',
      code: `public ___ ElementInfo
{
    public int Id;
    public string Name;
}

// в OnSelectionChanged:
ElementSelected___Invoke(e);`,
      tiles: ['class', '?.', 'struct', '.', 'readonly'],
      answer: ['class', '?.'],
      explain: 'С классом foreach, индексатор List и событие передают ссылку на тот же объект, и RenameAll начинает работать. Оператор ?. вызывает событие, только если есть подписчики, и читает поле один раз.'
    },
    {
      t: 'order',
      q: 'Расставь жизненный цикл исправленного ModelManager по порядку.',
      items: [
        'Создание объекта: конструктор без побочных эффектов',
        'Init: открыть лог и подписаться на SelectionService',
        'await LoadAsync: скачать, проверить и подменить коллекции разом',
        'Работа: поиск, выбор, подсчёт коллизий',
        'Dispose: отписаться от события и закрыть лог'
      ],
      explain: 'Всё, что может упасть или держит ресурсы, вынесено из конструктора в явные шаги. Каждому «взять» (подписка, файл) соответствует «отдать» в Dispose.'
    },
    {
      t: 'match',
      q: 'Соедини баг и лечение.',
      pairs: [
        ['Изменяемая struct ElementInfo', 'class или readonly struct'],
        ['new HttpClient() в Load', 'static readonly HttpClient'],
        ['.Result', 'async Task LoadAsync + await'],
        ['Dictionary<object, …>', 'Dictionary<int, …>'],
        ['_byId[id]', 'TryGetValue'],
        ['catch (Exception) { }', 'Точечный catch с логированием']
      ]
    },
    {
      t: 'choice',
      q: 'Почему этот листинг хорошо подходит для собеседования, хотя он компилируется без единой ошибки?',
      options: [
        'Большинство его багов проявляются в работе: копии структур, ресурсы, сеть, проглоченные ошибки',
        'Компилятор C# всё равно найдёт эти ошибки при сборке',
        'Это ошибки только стиля, на поведение они не влияют'
      ],
      answer: 0,
      explain: 'Компилятор ловит лишь прямое присваивание полю копии (CS1654, CS1612). Всё остальное — молчаливые копии, утечки дескрипторов и сокетов, блокировки, гонки и пустой catch — видно только тому, кто понимает, как код работает в рантайме.',
      wrong: { 1: 'Вызов мутирующего метода у копии, .Result, пустой catch и new HttpClient компилятор не считает ошибками.', 2: 'Наоборот: почти каждый пункт меняет поведение — от пустого RenameAll до замершей игры.' }
    }
  ]
};
