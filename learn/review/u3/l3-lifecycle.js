/** Раздел 3, урок 3 курса «Ревью кода: найди баг». */
export default {
  id: 'rv.u3.l3',
  title: 'Жизненный цикл и флаги',
  sub: 'OnEnable/OnDisable, «мёртвые» объекты, HasFlag и Camera.main',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Подписка на рассылку без отписки',
      body: '<p>Ты подписался на рассылку, когда зашёл в комнату, а отписываешься только когда <b>сносят дом</b>. Но из комнаты можно выходить и входить обратно сколько угодно: каждый вход — новая подписка, и письма приходят по два, по три…</p><p>В Unity у компонента есть пары: <b>Awake → OnEnable → Start → … → OnDisable → OnDestroy</b>. <code>OnEnable</code> и <code>OnDisable</code> срабатывают при каждом включении и выключении объекта (<code>SetActive</code> или <code>enabled</code>), а <code>OnDestroy</code> — один раз в конце. Подписался в одном месте — отписывайся в парном.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Часть класса ClashMarkers про события, корутину и список маркеров. Отметь строки с ошибками.',
      code: `private readonly List<GameObject> _markers = new List<GameObject>();
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
}`,
      bugs: [
        { lines: [5, 6, 11], title: 'Подписка в OnEnable, отписка только в OnDestroy', why: 'После выключения и включения объекта обработчик подписывается второй раз и вызывается дважды, а после enabled = false/true работают уже две копии корутины. Выключенный объект при этом продолжает получать события.' },
        { lines: [0, 18, 19], title: 'Список GameObject без очистки', why: 'Уничтоженный объект остаётся в списке как «ненастоящий null». Обращение к его transform бросает MissingReferenceException и обрывает корутину.' },
        { lines: [20], title: 'new WaitForSeconds в цикле', why: 'Новый объект на каждой итерации, 20 раз в секунду. Достаточно одного общего экземпляра.' },
        { lines: [26], title: 'HasFlag для проверки «любой из флагов»', why: 'HasFlag требует совпадения всех переданных битов, а для None всегда возвращает true. Фильтр по тому, что «пересекается», получается неверным.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:5', 'flag:18', 'flag:26', 'check']
    },
    {
      t: 'learn',
      title: 'Что сломается при выключении и включении',
      body: '<p>Сделай <code>SetActive(false)</code> и затем <code>SetActive(true)</code>. Что произошло: <code>OnDisable</code> — отписки нет, <code>OnEnable</code> — делегат добавлен <b>ещё раз</b>. В цепочке события теперь два одинаковых обработчика. <code>OnDestroy</code> при этом не вызывался вообще.</p><p>Лечение — симметрия: что сделали в <code>OnEnable</code>, откатываем в <code>OnDisable</code>. А корутину храним в поле и останавливаем.</p>',
      deep: '<p>Тонкость с корутинами: <code>SetActive(false)</code> останавливает все корутины объекта, а вот <code>enabled = false</code> на самом компоненте — <b>нет</b>. Корутина продолжит работать, и после <code>enabled = true</code> OnEnable запустит вторую копию. Поэтому в OnDisable надёжнее явно вызывать <code>StopCoroutine</code>.</p><p>Статическое событие ещё и держит подписчика: пока тот не отписался, ссылка на него жива (сборщик мусора не заберёт C#-объект), и уничтоженный компонент продолжает получать вызовы. Его обычные C#-поля читаются без ошибок, а вот обращение к <code>transform</code>, <code>gameObject</code> и другому API движка даёт <code>MissingReferenceException</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Объект выключили и включили (SetActive(false), потом SetActive(true)). Сколько раз вызовется OnSelected при одном событии ClashEvents.Selected?',
      options: ['0', '1', '2', 'Будет исключение'],
      answer: 2,
      explain: 'OnDestroy не вызывался, поэтому первая подписка осталась. OnEnable добавил ту же функцию второй раз, и делегат-цепочка вызывает её дважды.',
      wrong: {
        0: 'При выключении подписка не снимается — отписки нет.',
        1: 'Один раз было бы при симметричных OnEnable и OnDisable.',
        3: 'Повторная подписка исключения не вызывает, она молча дублируется.'
      }
    },
    {
      t: 'blanks',
      q: 'Сделай подписку симметричной и останови корутину.',
      code: `private Coroutine _pulse;

private void OnEnable()
{
    ClashEvents.Selected += OnSelected;
    _pulse = StartCoroutine(Pulse());
}

private void ___()
{
    ClashEvents.Selected ___ OnSelected;
    if (_pulse != null) StopCoroutine(_pulse);
}`,
      tiles: ['OnDisable', 'OnDestroy', '-=', '+='],
      answer: ['OnDisable', '-='],
      explain: 'OnDisable вызывается при каждом выключении и перед уничтожением, поэтому подходит для отписки. Корутину из поля останавливаем явно: так она не продолжит работать после enabled = false.'
    },
    {
      t: 'learn',
      title: '«Ненастоящий null» в Unity',
      body: '<p>Когда ты делаешь <code>Destroy(go)</code>, C#-объект-обёртка остаётся жить, а настоящий объект внутри движка исчезает. Это как конверт, в котором уже ничего нет. Любое обращение к такому объекту: <code>go.activeSelf</code>, <code>go.transform</code> — бросает <code>MissingReferenceException</code>.</p><p>Unity переопределил <code>==</code>, чтобы <code>go == null</code> было <b>true</b> для такого конверта. Поэтому список маркеров надо чистить: <code>_markers.RemoveAll(m => m == null)</code>, либо маркер сам сообщает о своём уничтожении и убирается из списка.</p>',
      deep: '<p><code>Destroy</code> не мгновенный: объект исчезает в конце кадра (<code>DestroyImmediate</code> — сразу, но его не стоит использовать в игровом коде). Операторы <code>?.</code>, <code>??</code>, <code>is null</code> и <code>ReferenceEquals</code> обходят перегруженный <code>==</code> и поэтому <b>не заметят</b> уничтоженный объект. Проверять нужно через <code>== null</code> или <code>if (obj)</code>.</p><p>Менять список во время <code>foreach</code> нельзя: получишь InvalidOperationException. Чистка — вне перебора или через <code>RemoveAll</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Какая проверка НЕ заметит уничтоженный GameObject m?',
      options: ['if (m == null)', 'if (!m)', 'if (m is null)', 'if (m != null && m.activeSelf)'],
      answer: 2,
      explain: 'Паттерн is null проверяет ссылку напрямую и не вызывает перегруженный оператор Unity. Остальные варианты через == и неявное преобразование к bool честно видят «мёртвый» объект.',
      wrong: {
        0: 'Перегруженный == вернёт true для уничтоженного объекта.',
        1: 'Оператор ! тоже использует неявное преобразование Unity к bool.',
        3: 'Здесь != работает через перегрузку, и до m.activeSelf дело не дойдёт.'
      }
    },
    {
      t: 'learn',
      title: 'Флаги: [Flags] и HasFlag',
      body: '<p>Enum с <code>[Flags]</code> — это набор выключателей: <code>Hard = 1, Soft = 2, Clearance = 4</code>. Фильтр «Hard и Soft» равен 3 (в двоичной записи 011).</p><p><code>x.HasFlag(f)</code> значит <code>(x &amp; f) == f</code>: <b>все</b> биты из f должны быть включены. Для одного флага это то же, что «есть ли он». Но:</p><p>• <code>HasFlag(None)</code> всегда <b>true</b>, потому что 0 есть везде.<br>• Для комбинации <code>Hard | Clearance</code> нужны оба бита.</p><p>Если задача «подходит хоть один», пиши <code>(x &amp; f) != 0</code>.</p>',
      deep: '<p><code>Enum.HasFlag(Enum flag)</code> принимает аргумент как объект, а вызывается на значимом типе, поэтому в Mono Unity (и в IL2CPP, по крайней мере в старых версиях) каждый вызов упаковывает значения: и аргумент, и сам enum. Это аллокации на каждом вызове. В .NET Core 2.1 и новее JIT распознаёт HasFlag и превращает его в побитовую проверку без боксинга. Побитовая запись быстра везде, поэтому в горячем коде для Unity предпочитай её.</p>'
    },
    {
      t: 'choice',
      q: 'Фильтр равен Hard | Soft (3). Что вернёт вызов?',
      code: `var filter = ClashFilter.Hard | ClashFilter.Soft;
bool r = filter.HasFlag(ClashFilter.Hard | ClashFilter.Clearance);`,
      options: ['true — Hard есть', 'false — Clearance в фильтре нет', 'Исключение'],
      answer: 1,
      explain: 'HasFlag требует, чтобы были включены все биты аргумента. Бита Clearance нет, поэтому false. Для «любого из» нужно (filter & mask) != 0.',
      wrong: {
        0: 'Это ответ для логики «хотя бы один», но у HasFlag логика «все».',
        2: 'Исключений HasFlag не бросает.'
      }
    },
    {
      t: 'blanks',
      q: 'Перепиши проверку: выходим, если у события нет ни одного общего флага с фильтром.',
      code: `if ((_filter ___ type) ___ 0)
    return;`,
      tiles: ['&', '|', '==', '!='],
      answer: ['&', '=='],
      explain: '(_filter & type) оставляет общие биты. Если результат равен нулю, общих флагов нет, и событие нужно пропустить.'
    },
    {
      t: 'multi',
      q: 'Что верно про жизненный цикл? Отметь все.',
      options: [
        'OnDisable вызывается и при SetActive(false), и перед уничтожением объекта',
        'enabled = false на компоненте останавливает его корутины',
        'SetActive(false) на объекте останавливает его корутины',
        'OnDestroy вызывается при каждом выключении объекта'
      ],
      answer: [0, 2],
      explain: 'enabled = false корутины не трогает. OnDestroy вызывается один раз, когда объект уничтожают.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину',
      pairs: [
        ['Обработчик срабатывает дважды после выключения и включения', 'Подписка в OnEnable, отписка в OnDestroy'],
        ['MissingReferenceException на переборе списка маркеров', 'Уничтоженные объекты остались в списке'],
        ['HasFlag(None) всегда true', 'Ноль входит в любое значение'],
        ['После enabled = false/true профайлер показывает Pulse дважды за шаг', 'Корутина не остановлена и запущена повторно']
      ]
    },
    {
      t: 'learn',
      title: 'Camera.main может быть null',
      body: '<p>Код <code>Camera.main.transform.position</code> предполагает, что в сцене есть включённая камера с тегом <b>MainCamera</b>. Если её нет (UI-сцена, тесты, камера выключена) — <code>NullReferenceException</code>.</p><p>Лечение: достать камеру один раз, проверить на null и выйти из метода, а не падать.</p>',
      deep: '<p>Ещё одна мысль для сеньора: маркеры в листинге создаются через <code>Instantiate</code> и уничтожаются через <code>Destroy</code> (кода не видно, но в списке они есть). При сотнях маркеров это постоянные аллокации и нагрузка на GC; в таких случаях используют <b>пул объектов</b>: <code>UnityEngine.Pool.ObjectPool&lt;T&gt;</code> (есть с Unity 2021.1) или свой. Маркер тогда не уничтожается, а выключается и возвращается в пул, а список «мёртвых» ссылок вообще не появляется.</p>'
    }
  ]
};
