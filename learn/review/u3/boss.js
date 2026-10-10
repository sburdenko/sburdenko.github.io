/** Финал раздела 3 курса «Ревью кода: найди баг». */
export default {
  id: 'rv.u3.boss',
  title: 'Финал: ClashMarkers',
  sub: 'Полное ревью класса: память, скорость, жизненный цикл',
  minutes: 14,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'hunt',
      task: 'Полный листинг ClashMarkers и ThumbnailCache. Найди как можно больше проблем: аллокации, материалы, жизненный цикл, флаги, компаратор, кэш.',
      code: `[Flags]
public enum ClashFilter { None = 0, Hard = 1, Soft = 2, Clearance = 4 }

public struct ClashScore
{
    public float Weight;
    public float Severity;
}

public class ClashMarkers : MonoBehaviour
{
    [SerializeField] private GameObject _markerPrefab;

    private readonly List<GameObject> _markers = new List<GameObject>();
    private readonly ThumbnailCache _thumbnails = new ThumbnailCache(100);
    private ClashFilter _filter = ClashFilter.Hard | ClashFilter.Soft;

    private void OnEnable()
    {
        ClashEvents.Selected += OnSelected;
        StartCoroutine(Pulse());
    }

    private void OnDestroy()
    {
        ClashEvents.Selected -= OnSelected;
    }

    private void Update()
    {
        var visible = _markers
            .Where(m => m.activeSelf)
            .OrderBy(m => Vector3.Distance(Camera.main.transform.position, m.transform.position))
            .ToList();

        for (int i = 0; i < visible.Count; i++)
        {
            var renderer = visible[i].GetComponent<Renderer>();
            renderer.material.color = i < 10 ? Color.red : Color.gray;
            visible[i].GetComponentInChildren<TextMesh>().text = "Clash " + (i + 1);
        }
    }

    private IEnumerator Pulse()
    {
        while (true)
        {
            foreach (var m in _markers)
                m.transform.localScale = Vector3.one * (1f + Mathf.Sin(Time.time * 4f) * 0.1f);
            yield return new WaitForSeconds(0.05f);
        }
    }

    private void OnSelected(int clashId, ClashFilter type)
    {
        if (!_filter.HasFlag(type))
            return;
        // ...
    }

    public void SortBySeverity(List<ClashScore> scores)
    {
        scores.Sort((a, b) => a.Severity > b.Severity ? -1 : 1);
    }

    public float TotalWeight(IList<ClashScore> scores)
    {
        float total = 0f;
        foreach (var s in scores)
            total += s.Weight;
        return total;
    }
}

public class ThumbnailCache
{
    private readonly int _capacity;
    private readonly Dictionary<int, Texture2D> _map = new Dictionary<int, Texture2D>();
    private readonly LinkedList<int> _order = new LinkedList<int>();

    public ThumbnailCache(int capacity) => _capacity = capacity;

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
    }
}`,
      bugs: [
        { lines: [30, 31, 33], title: 'LINQ-цепочка в Update', why: 'Where, OrderBy и ToList каждый кадр создают итераторы, буфер сортировки и новый список: постоянный мусор и регулярные паузы GC.' },
        { lines: [32], title: 'Camera.main и Vector3.Distance внутри ключа сортировки', why: 'Камера берётся для каждого маркера каждый кадр (в старых Unity это поиск по тегу), а Distance тянет корень. Позицию нужно взять один раз и сравнивать sqrMagnitude. Если камеры нет, будет NullReferenceException.' },
        { lines: [37], title: 'GetComponent на каждый видимый маркер каждый кадр', why: 'Дорогой поиск, который можно сделать один раз при создании маркера и сохранить ссылку.' },
        { lines: [38], title: 'renderer.material создаёт копию материала', why: 'У каждого маркера появляется личный материал: копии не удаляются вместе с объектом (утечка), а статический/динамический батчинг и инстансинг их не склеят. Нужны два общих материала (красный и серый) или, вне SRP Batcher, MaterialPropertyBlock.' },
        { lines: [39], title: 'Строка и TextMesh каждый кадр, плюс GetComponentInChildren', why: 'Конкатенация создаёт мусор для каждого маркера, а присвоение text каждый кадр может пересобирать меш TextMesh, хотя текст не изменился. Нужны кэш ссылки, готовые строки и присваивание только при изменении.' },
        { lines: [19, 20, 25], title: 'Подписка и корутина в OnEnable, отписка только в OnDestroy', why: 'После выключения и включения объекта обработчик добавляется второй раз и срабатывает дважды, а после enabled = false/true крутятся две корутины. Статическое событие ещё и держит выключенный объект. Нужна симметрия OnEnable/OnDisable и остановка корутины.' },
        { lines: [49], title: 'new WaitForSeconds в цикле корутины', why: 'Новая аллокация 20 раз в секунду. Достаточно одного static readonly экземпляра.' },
        { lines: [13, 47, 48], title: 'Список GameObject без очистки', why: 'Уничтоженные объекты остаются в списке как «ненастоящий null»; обращение к ним (activeSelf, transform) бросает MissingReferenceException. Список нужно чистить (RemoveAll(m => m == null)) или управлять жизнью маркеров через пул.' },
        { lines: [55], title: 'HasFlag вместо проверки пересечения', why: 'HasFlag требует все биты и для None всегда true, а в Mono Unity ещё и боксирует. Надёжнее (_filter & type) != 0.' },
        { lines: [62], title: 'Компаратор никогда не возвращает 0', why: 'Нарушен контракт (Compare(x, x) = 1): порядок держится на деталях реализации Sort, с NaN он становится мусорным, а BinarySearch/SortedSet с таким компаратором не найдут равный элемент. Нужен b.Severity.CompareTo(a.Severity).' },
        { lines: [65, 68], title: 'foreach по IList<T> боксирует перечислитель', why: 'Каждый вызов даёт аллокацию. Лучше принимать List<T> или IReadOnlyList<T> и идти for по индексу.' },
        { lines: [84], title: 'Get не обновляет порядок', why: 'Прочитанная миниатюра не становится «свежей»: кэш работает как FIFO, а не LRU.' },
        { lines: [91, 97], title: 'Выселяется самый новый элемент, а не самый старый', why: 'AddLast кладёт новый id в конец, и выселяется тоже Last: свежая картинка вылетает при следующем Put, а старые остаются навсегда.' },
        { lines: [89, 96], title: 'Повторный Put существующего id', why: 'Id попадает в _order дважды, старая запись остаётся, порядок рассинхронизируется со словарём; выселение срабатывает даже при простом обновлении.' },
        { lines: [92, 93], title: 'Вытесненная Texture2D не уничтожается', why: 'Это обёртка над нативной памятью: GC её не освободит, память течёт, пока не вызвать Destroy.' },
        { lines: [80], title: 'Ёмкость 0 не проверяется', why: 'При capacity = 0 в первом же Put _order.Last равен null, и получается NullReferenceException. Конструктор должен отвергать неположительную ёмкость.' }
      ],
      goal: { min: 13, maxFalse: 3 },
      solve: ['flag:30', 'flag:32', 'flag:37', 'flag:38', 'flag:39', 'flag:19', 'flag:49', 'flag:13', 'flag:55', 'flag:62', 'flag:65', 'flag:84', 'flag:91', 'check']
    },
    {
      t: 'multi',
      q: 'Что верно про исходный ClashMarkers? Отметь все.',
      options: [
        'renderer.material в Update даёт каждому маркеру собственную копию материала',
        'Если в событии придёт ClashFilter.None, HasFlag вернёт true, и событие будет обработано',
        'После enabled = false корутина Pulse останавливается сама',
        'Вытесненную из кэша Texture2D освободит сборщик мусора',
        'Повторный Put того же id оставляет в _order дубль'
      ],
      answer: [0, 1, 4],
      explain: 'Корутины останавливает SetActive(false), а enabled = false — нет. Нативную память Texture2D освобождает только Destroy или выгрузка неиспользуемых ресурсов, GC её не трогает.'
    },
    {
      t: 'choice',
      q: 'В профайлере число материалов растёт каждый раз, когда маркеры пересоздают. Как проверить, что это копии от .material?',
      options: [
        'Посмотреть имена материалов в Memory Profiler: у копий суффикс «(Instance)»',
        'Вызвать GC.Collect() и посмотреть, исчезнут ли они',
        'Переименовать материал в проекте'
      ],
      answer: 0,
      explain: 'Копии, созданные через .material, называются «Имя (Instance)». GC.Collect их не уберёт: это объекты Unity, их уничтожают через Destroy или выгрузкой неиспользуемых ресурсов.',
      wrong: {
        1: 'Сборка управляемой кучи не освобождает объекты Unity.',
        2: 'Имя исходного материала на копии не влияет.'
      }
    },
    {
      t: 'tapline',
      q: 'Какая строка нарушает контракт компаратора (Compare(x, x) не равно нулю)?',
      code: `list.Sort((a, b) => a.Score > b.Score ? -1 : 1);
list.Sort((a, b) => b.Score.CompareTo(a.Score));
list.Sort((a, b) => a.Id.CompareTo(b.Id));`,
      answer: 0,
      explain: 'Первая строка при равных значениях отвечает 1 в обе стороны, нуля не бывает. Вторая и третья используют CompareTo, который возвращает 0 при равенстве.'
    },
    {
      t: 'order',
      q: 'Расставь вызовы жизненного цикла компонента от создания до уничтожения (объект активен всё время, потом его уничтожают).',
      items: ['Awake', 'OnEnable', 'Start', 'Update', 'OnDisable', 'OnDestroy'],
      explain: 'Awake и OnEnable идут при создании активного объекта, Start перед первым Update. При уничтожении активного объекта сначала OnDisable, потом OnDestroy.'
    },
    {
      t: 'blanks',
      q: 'Для сравнения «кто ближе» корень не нужен. Заполни пропуск.',
      code: `float d = (a.position - b.position).___;`,
      tiles: ['sqrMagnitude', 'magnitude', 'normalized', 'Distance'],
      answer: ['sqrMagnitude'],
      explain: 'Квадрат расстояния растёт и падает так же, как расстояние, но не требует извлечения корня.'
    },
    {
      t: 'match',
      q: 'Какой инструмент для какой задачи?',
      pairs: [
        ['Profiler, столбец GC Alloc', 'Найти, какая строка создаёт мусор в кадре'],
        ['Frame Debugger', 'Понять, почему батчи не склеились'],
        ['Memory Profiler', 'Найти утёкшие материалы и текстуры'],
        ['Stats: Batches и SetPass calls', 'Оценить число вызовов отрисовки']
      ]
    },
    {
      t: 'choice',
      q: 'Кэш выселяет Texture2D, но не вызывает Destroy: «сборщик мусора ведь всё равно освободит». Почему это ошибка?',
      options: [
        'GC освобождает только управляемый объект-обёртку; нативная память текстуры остаётся, пока её не уничтожат или не выгрузят неиспользуемые ресурсы',
        'Texture2D нельзя выселять из словаря',
        'Destroy нужен только в редакторе'
      ],
      answer: 0,
      explain: 'Texture2D — это тонкая обёртка над нативными данными. Управляемая куча и нативная память живут по разным правилам.',
      wrong: {
        1: 'Выселять можно; вопрос в освобождении ресурсов.',
        2: 'В сборке игры нативная память течёт точно так же.'
      }
    }
  ]
};
