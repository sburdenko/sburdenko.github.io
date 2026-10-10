/** Ревью кода, раздел 1 (ClashService), финал: полный листинг. */
export default {
  "id": "rv.u1.boss",
  "title": "Финал: ClashService",
  "sub": "Найди баги в полном листинге",
  "minutes": 12,
  "boss": true,
  "cards": [
    {
      "t": "rig",
      "rig": "hunt",
      "task": "Это весь присланный на ревью ClashService. Отметь как можно больше багов: равенство и словарь, async, потоки, коллекции, рекурсия, исключения, Unity-null. Нужно найти не меньше 18.",
      "code": `public class ElementKey
{
    public string ModelId;
    public int ElementId;

    public override bool Equals(object obj) =>
        obj is ElementKey k && k.ModelId == ModelId && k.ElementId == ElementId;
}

public class Element
{
    public ElementKey Key;
    public string Name;
    public string Floor;
    public Bounds Bounds;
    public Element Parent;
    public List<Element> Children = new List<Element>();
    public int Id => Key.ElementId;
}

public class Clash
{
    public Element A;
    public Element B;
    public bool IsResolved;
}

public class ClashService
{
    private readonly List<Clash> _clashes = new List<Clash>();
    private readonly Dictionary<ElementKey, List<Clash>> _cache = new Dictionary<ElementKey, List<Clash>>();
    private int _processed;
    private GameObject _marker;

    public event Action Completed;

    public async void RunAsync(IEnumerable<Element> elements)
    {
        var tasks = new List<Task>();
        for (int i = 0; i < 8; i++)
        {
            tasks.Add(Task.Run(() => ProcessChunk(elements, i)));
        }
        await Task.WhenAll(tasks);
        Completed?.Invoke();
    }

    private void ProcessChunk(IEnumerable<Element> elements, int chunk)
    {
        var mine = elements.Where(e => e.Id % 8 == chunk);
        foreach (var a in mine)
        {
            foreach (var b in mine)
            {
                if (a.Id < b.Id && a.Bounds.Intersects(b.Bounds))
                {
                    _clashes.Add(new Clash { A = a, B = b });
                    _processed++;
                }
            }
        }
    }

    public void RemoveResolved()
    {
        foreach (var c in _clashes)
        {
            if (c.IsResolved)
                _clashes.Remove(c);
        }
    }

    public List<Clash> GetClashesFor(ElementKey key)
    {
        if (!_cache.ContainsKey(key))
            _cache[key] = _clashes.Where(c => c.A.Key.Equals(key) || c.B.Key.Equals(key)).ToList();
        return _cache[key];
    }

    public void CollectFloor(Element node, string floor, List<Element> result)
    {
        if (node.Floor == floor)
            result.Add(node);
        foreach (var child in node.Children)
            CollectFloor(child, floor, result);
    }

    public bool IsOnLevel(Element e, float levelHeight) =>
        e.Bounds.min.y == levelHeight;

    public void Import(string path)
    {
        try
        {
            var json = File.ReadAllText(path);
            _clashes.AddRange(JsonConvert.DeserializeObject<List<Clash>>(json));
        }
        catch (Exception ex)
        {
            Debug.LogError(ex.Message);
            throw ex;
        }
    }

    public void Highlight()
    {
        _marker?.SetActive(true);
    }
}`,
      "bugs": [
        {
          "lines": [
            0,
            5,
            6
          ],
          "title": "Equals без GetHashCode",
          "why": "Равные ключи попадают в разные ячейки словаря, кэш не находит своих ключей и растёт, а каждый вызов пересчитывает всё."
        },
        {
          "lines": [
            2,
            3
          ],
          "title": "Изменяемые поля в ключе",
          "why": "Поменяли поле после вставки в словарь, и запись потерялась: ни найти, ни удалить."
        },
        {
          "lines": [
            17
          ],
          "title": "Id игнорирует ModelId (и Key может быть null)",
          "why": "Элементы разных моделей с одним номером считаются одним элементом. При пустом Key получаешь NullReferenceException."
        },
        {
          "lines": [
            36
          ],
          "title": "async void",
          "why": "Исключение нельзя поймать снаружи, дождаться окончания тоже нельзя. В обычном .NET без контекста оно может завершить процесс."
        },
        {
          "lines": [
            41
          ],
          "title": "Замыкание на переменную цикла i",
          "why": "Задачи обычно видят i == 8, фильтр ничего не выбирает, и сервис находит ноль коллизий. Главный баг листинга."
        },
        {
          "lines": [
            49
          ],
          "title": "Разбиение по Id % 8 разрывает пары",
          "why": "Элементы из разных корзин никогда не сравниваются, часть коллизий не найдётся принципиально. Отрицательные Id дают отрицательный остаток."
        },
        {
          "lines": [
            50,
            52
          ],
          "title": "Многократный перебор ленивого Where",
          "why": "Внутренний цикл гоняет фильтр заново для каждого внешнего элемента: n² вызовов предиката и повторные вычисления источника."
        },
        {
          "lines": [
            56
          ],
          "title": "Гонка на List.Add",
          "why": "List<T> не потокобезопасен: при записи из восьми потоков теряются элементы и случаются исключения."
        },
        {
          "lines": [
            31,
            57
          ],
          "title": "Неатомарный счётчик, да ещё с неверным именем",
          "why": "_processed++ из нескольких потоков теряет приращения (нужен Interlocked), а имя обещает «обработанные», хотя считает коллизии."
        },
        {
          "lines": [
            54
          ],
          "title": "a.Id < b.Id отбрасывает пары с равными Id",
          "why": "Элементы из разных моделей с одинаковым ElementId никогда не будут сравнены, и коллизия между ними не найдётся."
        },
        {
          "lines": [
            65,
            68
          ],
          "title": "Remove внутри foreach",
          "why": "Список меняется во время перебора: InvalidOperationException на следующем шаге. Плюс квадратичная работа. Нужен RemoveAll."
        },
        {
          "lines": [
            74,
            76
          ],
          "title": "Двойной поиск в словаре",
          "why": "ContainsKey, затем индексатор: два поиска вместо одного. Лечится TryGetValue."
        },
        {
          "lines": [
            75
          ],
          "title": "Кэш не сбрасывается и отдаёт внутренний список",
          "why": "После удаления, импорта и добавления коллизий кэш хранит устаревшие выборки, а наружу уходит изменяемый внутренний список."
        },
        {
          "lines": [
            84
          ],
          "title": "Рекурсия без защиты от колец и глубины",
          "why": "Кольцо в Parent/Children или слишком глубокое дерево дают StackOverflowException. Его нельзя поймать, процесс завершится."
        },
        {
          "lines": [
            88
          ],
          "title": "float сравнивается через ==",
          "why": "Высоты неточны в последних знаках, и элемент на уровне не признаётся стоящим на уровне. Нужен допуск."
        },
        {
          "lines": [
            100
          ],
          "title": "throw ex; обнуляет стек",
          "why": "В трассировке остаётся только Import, настоящее место поломки пропадает. Нужен throw;."
        },
        {
          "lines": [
            99
          ],
          "title": "Логирование и повторный throw",
          "why": "Ту же ошибку запишут в лог на каждом уровне стека, журнал забьётся дублями."
        },
        {
          "lines": [
            97
          ],
          "title": "Слишком широкий catch (Exception)",
          "why": "Ловится всё подряд, даже то, что здесь не починить. Нужны конкретные типы (IOException, JsonException)."
        },
        {
          "lines": [
            95
          ],
          "title": "Результат DeserializeObject может быть null",
          "why": "Для пустого файла AddRange(null) бросит ArgumentNullException. Кэш после импорта тоже не сбрасывается."
        },
        {
          "lines": [
            94
          ],
          "title": "Синхронное чтение файла",
          "why": "File.ReadAllText блокирует поток. На главном потоке Unity игра замирает на время чтения."
        },
        {
          "lines": [
            106
          ],
          "title": "?. для UnityEngine.Object",
          "why": "Для уничтоженного GameObject (fake null) ?. не срабатывает как проверка и даёт MissingReferenceException."
        },
        {
          "lines": [
            32
          ],
          "title": "Поле _marker нигде не назначается",
          "why": "Класс не MonoBehaviour, Inspector поле не заполнит. Оно всегда null, и Highlight молча ничего не делает."
        },
        {
          "lines": [
            15,
            16
          ],
          "title": "Открытые изменяемые Parent и Children",
          "why": "Связь можно нарушить с любой стороны, получится кольцо (оно же ломает сериализацию Newtonsoft)."
        }
      ],
      "goal": {
        "min": 18,
        "maxFalse": 3
      },
      "solve": [
        "flag:0",
        "flag:2",
        "flag:17",
        "flag:36",
        "flag:41",
        "flag:49",
        "flag:50",
        "flag:56",
        "flag:31",
        "flag:54",
        "flag:65",
        "flag:74",
        "flag:75",
        "flag:84",
        "flag:88",
        "flag:100",
        "flag:99",
        "flag:97",
        "flag:95",
        "flag:94",
        "flag:106",
        "flag:32",
        "flag:15",
        "check"
      ]
    },
    {
      "t": "choice",
      "q": "Какой баг главный: из-за него сервис «молча находит ноль коллизий»?",
      "options": [
        "Замыкание на переменную цикла i в Task.Run",
        "async void в RunAsync",
        "float сравнивается через =="
      ],
      "answer": 0,
      "explain": "Все задачи видят i == 8, и фильтр <code>Id % 8 == 8</code> не пропускает ни один элемент. Остальные баги ломают результат реже или громко, а этот делает его пустым без единой ошибки.",
      "wrong": {
        "1": "async void прячет исключения, но не обнуляет результат.",
        "2": "float == портит проверку уровня, а не поиск коллизий."
      }
    },
    {
      "t": "multi",
      "q": "Какие баги листинга проявляются «плавающе», то есть не при каждом запуске? Отметь все.",
      "options": [
        "_processed++ из нескольких потоков",
        "_clashes.Add из нескольких потоков",
        "Замыкание на i (зависит от того, когда стартуют задачи)",
        "Remove внутри foreach в RemoveResolved"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Гонки и замыкание зависят от тайминга. Remove внутри foreach падает всегда, если есть что удалять: это детерминированная ошибка."
    },
    {
      "t": "choice",
      "q": "Какую из этих ошибок листинга нельзя поймать через try/catch?",
      "options": [
        "StackOverflowException из CollectFloor",
        "InvalidOperationException из RemoveResolved",
        "ArgumentNullException из Import",
        "MissingReferenceException из Highlight"
      ],
      "answer": 0,
      "explain": "Переполнение стека завершает процесс сразу. Остальные три обычные исключения, их ловят. Поэтому защита от колец должна стоять в коде заранее."
    },
    {
      "t": "order",
      "q": "Расставь шаги поиска ключа в Dictionary по порядку.",
      "items": [
        "Вызвать у ключа GetHashCode",
        "По хэшу выбрать ячейку (корзину)",
        "Пройти записи этой ячейки",
        "Сравнить ключи через Equals",
        "Вернуть найденное значение"
      ],
      "explain": "Если GetHashCode у равных ключей разный, шаг 2 ведёт в другую ячейку, и до Equals дело не доходит."
    },
    {
      "t": "blanks",
      "q": "Исправь запуск: правильный тип возврата и один раз материализованный список.",
      "code": `public async ___ RunAsync(IEnumerable<Element> elements)
{
    var all = elements.___();
    var tasks = new List<Task>();
    for (int i = 0; i < 8; i++)
    {
        int chunk = i;
        tasks.Add(Task.Run(() => ProcessChunk(all, chunk)));
    }
    await Task.WhenAll(tasks);
}`,
      "tiles": [
        "Task",
        "ToList",
        "void",
        "Where"
      ],
      "answer": [
        "Task",
        "ToList"
      ],
      "explain": "Вместо <code>async void</code> нужен <code>async Task</code>, чтобы можно было дождаться и поймать ошибки. <code>ToList()</code> фиксирует данные один раз, и задачи не пересчитывают ленивый запрос. <code>Where</code> сам ничего не материализует."
    },
    {
      "t": "tapline",
      "q": "Какая строка стирает настоящий стек вызовов исключения?",
      "code": `catch (Exception ex)
{
    Debug.LogError(ex.Message);
    throw ex;
}`,
      "answer": 3,
      "explain": "Строка <code>throw ex;</code> заново начинает трассировку с текущего места. Правильно: <code>throw;</code>. Логирование выше не стирает стек, но делает ошибку «шумной»."
    },
    {
      "t": "match",
      "q": "Соедини баг и симптом.",
      "pairs": [
        [
          "Equals без GetHashCode",
          "Кэш не находит своих ключей"
        ],
        [
          "Remove внутри foreach",
          "Collection was modified"
        ],
        [
          "Замыкание на i",
          "Ноль найденных коллизий"
        ],
        [
          "?. на уничтоженном объекте",
          "MissingReferenceException"
        ],
        [
          "Рекурсия по кольцу",
          "Процесс падает без исключения"
        ],
        [
          "Id без ModelId",
          "Разные элементы склеены в один"
        ]
      ]
    },
    {
      "t": "choice",
      "q": "Как лучше всего переделать ElementKey?",
      "options": [
        "readonly record struct с полями ModelId и ElementId",
        "Оставить класс и написать GetHashCode по изменяемым полям",
        "Использовать строку ModelId + ElementId, склеенную в каждом вызове"
      ],
      "answer": 0,
      "explain": "Неизменяемость, Equals, GetHashCode и IEquatable<T> компилятор генерирует сам, а структура не создаёт мусора. Оговорка: нужен C# 10; в старых версиях Unity пиши readonly struct вручную.",
      "wrong": {
        "1": "Хэш по изменяемым полям теряет записи после правки.",
        "2": "Склейка строки в каждом вызове создаёт мусор, а ключ всё равно остаётся «рыхлым»."
      }
    }
  ]
};
