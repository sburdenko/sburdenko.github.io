/** Раздел 3, урок 4 курса «Ревью кода: найди баг». */
export default {
  id: 'rv.u3.l4',
  title: 'Кэш и сортировка',
  sub: 'Контракт компаратора и собственный LRU-кэш миниатюр',
  minutes: 12,
  cards: [
    {
      t: 'learn',
      title: 'Судья, который не умеет объявлять ничью',
      body: '<p>Сортировка спрашивает у компаратора: «кто больше, a или b?» Ответ — число: <b>меньше нуля</b> (a раньше), <b>ноль</b> (равны) или <b>больше нуля</b> (a позже).</p><p>У ответа есть правила-контракт:</p><p>• <code>Compare(x, x)</code> равно <b>0</b>.<br>• Если <code>Compare(a, b) &lt; 0</code>, то <code>Compare(b, a) &gt; 0</code>.<br>• Если a раньше b, а b раньше c, то a раньше c.</p><p>Компаратор из листинга <code>a.Severity &gt; b.Severity ? -1 : 1</code> никогда не говорит «ноль». Для двух равных значений он отвечает «a позже b» и в ту, и в другую сторону. Судья без ничьей.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Сортировка и кэш миниатюр, который должен выбрасывать самые давно не нужные картинки (LRU). Найди ошибки.',
      code: `public void SortBySeverity(List<ClashScore> scores)
{
    scores.Sort((a, b) => a.Severity > b.Severity ? -1 : 1);
}

public Texture2D Get(int id)
{
    return _map.TryGetValue(id, out var texture) ? texture : null;
}

public void Put(int id, Texture2D texture)
{
    if (_map.Count >= _capacity)
    {
        var oldest = _order.Last.Value;
        _order.RemoveLast();
        _map.Remove(oldest);
    }

    _map[id] = texture;
    _order.AddLast(id);
}`,
      bugs: [
        { lines: [2], title: 'Компаратор никогда не возвращает 0', why: 'Нарушен контракт: Compare(x, x) даёт 1. List.Sort может бросить InvalidOperationException или тихо выдать неверный порядок.' },
        { lines: [7], title: 'Get не обновляет порядок использования', why: 'Прочитанная картинка не становится «свежей», и кэш превращается в простую очередь (FIFO), а не LRU. Нужные картинки выбрасываются зря.' },
        { lines: [14, 20], title: 'Выселяется только что добавленный элемент', why: 'AddLast кладёт новый элемент в конец, а выселяется тоже Last. Свежая картинка выбрасывается сразу, а старая остаётся навсегда.' },
        { lines: [12, 19], title: 'Повторный Put того же id', why: 'Id попадает в _order второй раз, а старая запись не убирается, и порядок рассинхронизируется с _map. Позже выселение удалит живую запись. А проверка Count >= capacity срабатывает даже при простом обновлении.' },
        { lines: [15, 16], title: 'Вытесненная текстура не уничтожается', why: 'Texture2D — обёртка над нативной памятью. Сборщик мусора её не освободит: нативная память течёт, пока текстуру не уничтожат вручную.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:2', 'flag:7', 'flag:14', 'flag:12', 'check']
    },
    {
      t: 'learn',
      title: 'Что на самом деле гарантирует Sort',
      body: '<p>Если контракт нарушен, <code>List.Sort</code> может повести себя по-разному: бросить <code>InvalidOperationException</code> («IComparer.Compare() method returns inconsistent results») или тихо вернуть неверный порядок. Это зависит от данных, поэтому баг «плавающий».</p><p>Правильный компаратор по убыванию: <code>b.Severity.CompareTo(a.Severity)</code>. Он честно возвращает 0 при равенстве и умеет сравнивать NaN (NaN считается меньше любого числа).</p>',
      deep: '<p>У <code>List.Sort</code> и <code>Array.Sort</code> алгоритм introsort: он <b>нестабилен</b>, то есть равные элементы могут поменяться местами. Нужна стабильность — берут <code>OrderByDescending</code> (LINQ-сортировка стабильна, но аллоцирует) или добавляют второй ключ, например исходный индекс. Ещё ловушка: компаратор вида <code>(int)(b.Severity - a.Severity)</code> тоже ломает контракт, потому что дробная часть отбрасывается и разные значения «становятся равными» непоследовательно.</p>'
    },
    {
      t: 'choice',
      q: 'Что сделает scores.Sort с компаратором «больше — минус один, иначе плюс один» на списке с равными Severity?',
      options: [
        'Всегда отсортирует правильно',
        'Может бросить InvalidOperationException или вернуть неверный порядок — результат зависит от данных',
        'Всегда бросит исключение',
        'Отсортирует, но бесконечно зациклится'
      ],
      answer: 1,
      explain: 'При нарушении контракта поведение Sort не определено: на одних данных работает, на других падает или выдаёт мусорный порядок.',
      wrong: {
        0: 'Правильность гарантирована только для компаратора, соблюдающего контракт.',
        2: 'Исключение не гарантировано, иногда сортировка просто ошибается без сообщений.',
        3: 'Бесконечного цикла тут нет: беда в том, что результат не гарантирован.'
      }
    },
    {
      t: 'blanks',
      q: 'Исправь компаратор: сортировка по убыванию Severity без нарушения контракта.',
      code: `scores.Sort((a, b) => ___.Severity.CompareTo(___.Severity));`,
      tiles: ['a', 'b', 'scores'],
      answer: ['b', 'a'],
      explain: 'CompareTo вернёт 0 при равенстве и учитывает NaN. Меняя местами a и b, получаем убывание: у большего значения результат отрицательный.'
    },
    {
      t: 'choice',
      q: 'Нужен стабильный порядок по убыванию Severity: при равных значениях маркеры остаются в исходном порядке. Что выбрать?',
      options: [
        'scores.Sort с любым корректным компаратором — он стабилен',
        'OrderByDescending(s => s.Severity).ToList() — стабильная сортировка (но создаёт новый список)',
        'Array.Sort — он стабилен'
      ],
      answer: 1,
      explain: 'LINQ OrderBy/OrderByDescending стабильны. Если аллокация недопустима, добавь в компаратор второй ключ — исходный индекс.',
      wrong: {
        0: 'List.Sort и Array.Sort построены на introsort и нестабильны.',
        2: 'Array.Sort тоже нестабилен.'
      }
    },
    {
      t: 'learn',
      title: 'LRU: полка с вещами, куда влезает не всё',
      body: '<p>У тебя полка на 3 вещи. Вещь, которой пользовался только что, кладёшь <b>ближе к краю</b>. Когда нужно место, выбрасываешь ту, что лежит <b>в самой глубине</b> — ею дольше всех не пользовались. Это <b>LRU</b> (Least Recently Used).</p><p>Нам нужны две вещи сразу:<br>• <b>Словарь</b> <code>id → узел</code>, чтобы найти картинку за O(1).<br>• <b>Связный список</b> узлов от свежих к старым, чтобы за O(1) передвинуть узел в начало и выкинуть хвост.</p><p><code>начало → [7] → [3] → [9] ← хвост</code></p><p>Каждый Get и каждый Put ставит узел в начало. Выселяем всегда хвост (Last).</p>'
    },
    {
      t: 'order',
      q: 'Расставь шаги метода Put по порядку.',
      items: [
        'Проверить: есть ли такой id уже в словаре',
        'Если есть — заменить текстуру, передвинуть узел в начало и выйти',
        'Если нет и кэш полон — взять узел с хвоста (Last)',
        'Убрать его из списка и словаря и уничтожить его текстуру',
        'Создать узел для нового id, поставить в начало, записать в словарь'
      ],
      explain: 'Сначала обрабатываем обновление существующего ключа (не нужно ничего выселять). Только для нового ключа проверяем заполненность. Новый узел добавляем уже после освобождения места.'
    },
    {
      t: 'blanks',
      q: 'Напиши Get: прочитанный узел должен стать самым свежим.',
      code: `public Texture2D Get(int id)
{
    if (!_map.TryGetValue(id, out var node))
        return null;
    _order.___(node);
    _order.___(node);
    return node.Value.Texture;
}`,
      tiles: ['Remove', 'AddFirst', 'AddLast', 'RemoveLast'],
      answer: ['Remove', 'AddFirst'],
      explain: 'Сначала узел отцепляем от списка, затем вставляем в начало. Узел после Remove ни в каком списке не состоит, поэтому AddFirst его примет. Всё за O(1).'
    },
    {
      t: 'blanks',
      q: 'Напиши вытеснение: убери самую давнюю картинку и освободи её память.',
      code: `if (_map.Count >= _capacity)
{
    var last = _order.___;
    _order.RemoveLast();
    _map.Remove(last.Value.Id);
    UnityEngine.Object.___(last.Value.Texture);
}`,
      tiles: ['Last', 'First', 'Destroy', 'Remove'],
      answer: ['Last', 'Destroy'],
      explain: 'Самый давно использованный узел лежит в хвосте списка, то есть в Last. Texture2D надо уничтожать явно (Destroy), иначе нативная память течёт.'
    },
    {
      t: 'learn',
      title: 'Собранный кэш',
      body: '<p>Вот результат: все шаги вместе. Прочитай и найди, где каждый из багов листинга закрыт.</p>',
      code: `public class ThumbnailCache
{
    private sealed class Entry
    {
        public int Id;
        public Texture2D Texture;
    }

    private readonly int _capacity;
    private readonly Dictionary<int, LinkedListNode<Entry>> _map = new Dictionary<int, LinkedListNode<Entry>>();
    private readonly LinkedList<Entry> _order = new LinkedList<Entry>();

    public ThumbnailCache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        _capacity = capacity;
    }

    public Texture2D Get(int id)
    {
        if (!_map.TryGetValue(id, out var node)) return null;
        _order.Remove(node);
        _order.AddFirst(node);
        return node.Value.Texture;
    }

    public void Put(int id, Texture2D texture)
    {
        if (_map.TryGetValue(id, out var existing))
        {
            if (existing.Value.Texture != texture) Release(existing.Value.Texture);
            existing.Value.Texture = texture;
            _order.Remove(existing);
            _order.AddFirst(existing);
            return;
        }

        if (_map.Count >= _capacity)
        {
            var last = _order.Last;
            _order.RemoveLast();
            _map.Remove(last.Value.Id);
            Release(last.Value.Texture);
        }

        var node = new LinkedListNode<Entry>(new Entry { Id = id, Texture = texture });
        _order.AddFirst(node);
        _map[id] = node;
    }

    private static void Release(Texture2D texture)
    {
        if (texture != null) UnityEngine.Object.Destroy(texture);
    }
}`,
      deep: '<p>Что ещё держать в голове. <b>Владение:</b> кэш уничтожает текстуры, значит, если картинку одновременно показывает UI, она пропадёт; нужно договориться, кто владелец. <b>Потоки:</b> Texture2D и сам Unity API работают только в главном потоке, так что кэш можно оставить без lock, а при доступе из других потоков нужны синхронизация или очередь. <b>Ёмкость:</b> считать можно не по числу картинок, а по байтам (ширина × высота × формат). Для размера в байтах вытесняем в цикле, пока не влезем.</p>'
    },
    {
      t: 'choice',
      q: 'Ёмкость 3. В старом (сломанном) кэше сделали Put(1), Put(2), Put(3), Put(4). Что в нём окажется?',
      code: `// Старый код:
// выселение: _order.Last, добавление: _order.AddLast(id)
cache.Put(1, a);
cache.Put(2, b);
cache.Put(3, c);
cache.Put(4, d);`,
      options: ['2, 3, 4', '1, 2, 4', '1, 2, 3'],
      answer: 1,
      explain: 'После трёх Put порядок 1, 2, 3, и Last равен 3. Выселяется тройка — самый новый элемент, и добавляется 4. Остаётся 1, 2, 4: самая старая единица осталась навсегда.',
      wrong: {
        0: 'Это результат корректного FIFO/LRU: ушёл бы самый старый элемент 1.',
        2: 'Четвёртый Put всё же добавляет элемент 4.'
      }
    },
    {
      t: 'match',
      q: 'Соедини баг кэша и его проявление',
      pairs: [
        ['Get не двигает узел', 'Кэш ведёт себя как FIFO, а не LRU'],
        ['AddLast и выселение Last', 'Свежая картинка выбрасывается сразу'],
        ['Put существующего id без проверки', 'Дубль в _order и рассинхрон со словарём'],
        ['Нет Destroy при выселении', 'Утечка нативной памяти текстур'],
        ['Ёмкость равна 0', 'NullReferenceException на _order.Last.Value']
      ]
    }
  ]
};
