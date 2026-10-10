/** Ревью кода, раздел 0 (ModelManager), урок 4: поиск по имени, подсчёт пар, событие без подписчиков, пустой catch. */
export default {
  id: 'rv.u0.l4',
  title: 'Поиск, события и пустой catch',
  sub: 'Выбор «просто не работает», и в логе пусто',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'История: тишина вместо ошибки',
      body: '<p>Пользователь кликает по трубе в сцене. Панель свойств не обновляется. В логе выбора пусто, в консоли — ни одной ошибки. Пять кликов, десять — тишина.</p><p>Ошибки на самом деле есть, и не одна. Их съедает одна строка: <code>catch (Exception) { }</code>.</p>'
    },
    {
      t: 'learn',
      title: 'Пустой catch — мусоропровод для ошибок',
      body: '<p><code>catch (Exception) { }</code> ловит <b>всё</b> и выбрасывает в мусоропровод, не глядя. Неизвестный id, отсутствие подписчиков, занятый файл лога, ошибка в чужом обработчике — для пользователя всё выглядит одинаково: «не работает». Для разработчика — тоже одинаково: ни строчки в логе.</p><p>Правило: лови только те исключения, которые <b>ожидаешь и умеешь обработать</b>, а остальные пусть летят дальше или хотя бы попадают в лог.</p>',
      code: `private void OnSelectionChanged(int id)
{
    try
    {
        var e = _byId[id];
        ElementSelected(e);
        var bytes = Encoding.UTF8.GetBytes("Selected " + id + " at " + DateTime.Now + "\\n");
        _log.Write(bytes, 0, bytes.Length);
    }
    catch (Exception) { }
}`
    },
    {
      t: 'multi',
      q: 'Какие проблемы этот пустой catch молча прячет? Отметь все.',
      options: [
        'KeyNotFoundException для неизвестного id',
        'NullReferenceException, когда на ElementSelected никто не подписан',
        'IOException при записи в лог',
        'Ошибку компиляции в обработчике'
      ],
      answer: [0, 1, 2],
      explain: 'Всё, что бросается во время выполнения внутри try, исчезает бесследно. Ошибки компиляции до запуска не доходят — их catch не касается.'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Поиск по имени и обработчик выбора из ModelManager. Найди баги: строки, словарь, событие, лог и обработка ошибок.',
      code: `public List<ElementInfo> FindByName(string name)
{
    var result = new List<ElementInfo>();
    for (int i = 0; i < _elements.Count; i++)
    {
        if (_elements[i].Name.ToLower().Contains(name.ToLower()))
            result.Add(_elements[i]);
    }
    return result;
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
}`,
      bugs: [
        { lines: [5], title: 'ToLower в цикле: аллокации, культура, null', why: 'На каждой итерации создаются две новые строки, name.ToLower() пересчитывается заново. ToLower зависит от культуры (турецкая I), а Name == null даст NullReferenceException.' },
        { lines: [15], title: 'Индексатор словаря на неизвестном id', why: '_byId[id] бросает KeyNotFoundException, если элемента нет (клик по объекту другой модели, выбор до загрузки). Нужен TryGetValue.' },
        { lines: [16], title: 'Вызов события без проверки на null', why: 'Без подписчиков поле события равно null, и вызов бросает NullReferenceException. Исключение подписчика тоже прервёт метод, и запись в лог не случится.' },
        { lines: [17, 18], title: 'Запись в лог: DateTime.Now, конкатенация, без Flush', why: 'Локальное время скачет при смене часового пояса и перехода на летнее время, формат даты зависит от культуры. Строки и массив байтов аллоцируются на каждый клик, буфер без Flush теряется при падении.' },
        { lines: [20], title: 'Пустой catch (Exception)', why: 'Проглатывает все ошибки выше без следа: выбор «просто не работает», а причину не найти ни в логе, ни в консоли.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:5', 'flag:15', 'flag:16', 'flag:17', 'flag:20', 'check']
    },
    {
      t: 'learn',
      title: 'ToLower: дорого и зависит от страны',
      body: '<p><code>name.ToLower()</code> внутри цикла делает новую строку на <b>каждой</b> итерации, хотя name не меняется. <code>_elements[i].Name.ToLower()</code> — ещё одна строка на элемент. На 100 000 элементов это 200 000 строк мусора за один поиск.</p><p>Хуже того, <code>ToLower()</code> использует <b>текущую культуру</b>. В турецкой культуре заглавная I превращается в «ı» без точки, и поиск «id» не найдёт «ID».</p>',
      code: `// без аллокаций и без зависимости от культуры
n.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0`,
      deep: '<p>Перегрузка <code>string.Contains(string, StringComparison)</code> есть в .NET Core 2.1+ и .NET Standard 2.1 (Unity 2021.2+); <code>IndexOf(…, StringComparison)</code> работает везде, включая старый Mono. <code>OrdinalIgnoreCase</code> сравнивает коды символов с простым приведением регистра — для идентификаторов и имён элементов это то, что нужно. Для поиска на естественном языке (ё/е, диакритика) нужен <code>CompareInfo.IndexOf</code> с нужной культурой. При частом поиске стоит строить индекс (словарь по нормализованному имени или префиксное дерево) вместо линейного прохода.</p>'
    },
    {
      t: 'choice',
      q: 'Текущая культура — tr-TR. Элемент называется "ID-42". Что вернёт FindByName("id")?',
      code: `if (_elements[i].Name.ToLower().Contains(name.ToLower()))`,
      options: ['Пустой список: "ID-42".ToLower() даст "ıd-42"', 'Список с этим элементом', 'Бросит CultureNotFoundException'],
      answer: 0,
      explain: 'В турецком алфавите у I и i разные пары: заглавная I становится строчной ı (без точки). Поэтому строка "ıd-42" не содержит "id". Это знаменитая «турецкая проблема» — повод всегда указывать StringComparison явно.',
      wrong: { 1: 'Нашлось бы при сравнении OrdinalIgnoreCase или в инвариантной культуре, но не с ToLower() в tr-TR.', 2: 'Культура tr-TR существует, исключения нет — просто «неправильный» результат.' }
    },
    {
      t: 'blanks',
      q: 'Почини FindByName: без лишних строк, без культуры и без падения на null.',
      code: `public List<ElementInfo> FindByName(string name)
{
    var result = new List<ElementInfo>();
    if (string.IsNullOrEmpty(name)) return result;
    foreach (var e in _elements)
    {
        if (e.Name ___ null && e.Name.IndexOf(name, StringComparison.___) >= 0)
            result.Add(e);
    }
    return result;
}`,
      tiles: ['!=', 'OrdinalIgnoreCase', '==', 'CurrentCulture', 'Ordinal'],
      answer: ['!=', 'OrdinalIgnoreCase'],
      explain: 'Проверка на null защищает от элементов без имени. OrdinalIgnoreCase не создаёт новых строк и не зависит от культуры. Ordinal был бы чувствителен к регистру, CurrentCulture вернул бы турецкую проблему.'
    },
    {
      t: 'learn',
      title: 'CountClashes: каждая пара дважды',
      body: '<p>Двойной цикл идёт по всем i и всем j. Пара «труба 1 — балка 2» проверяется как (1, 2) и ещё раз как (2, 1). Условие <code>i != j</code> убирает только сравнение элемента с самим собой. Результат <b>ровно вдвое больше</b> правды, и работы тоже вдвое больше.</p>',
      code: `for (int i = 0; i < _elements.Count; i++)
    for (int j = i + 1; j < _elements.Count; j++)   // каждая пара один раз
        if (_elements[i].Box.Intersects(_elements[j].Box))
            count++;`,
      deep: '<p>Даже с <code>j = i + 1</code> алгоритм O(n²): для 50 000 элементов это около 1,25 млрд проверок. В реальной клэш-детекции сначала отсекают пары широкой фазой (broad phase): равномерная сетка, BVH/октодерево или sweep-and-prune по одной оси, и только потом проверяют кандидатов. Мелочь для горячего цикла: <code>_elements[i].Box</code> через индексатор List копирует всю 48-байтную структуру ради одного поля, а <code>Bounds.Intersects</code> принимает Bounds по значению — ещё копия.</p>'
    },
    {
      t: 'tapline',
      q: 'Из-за какой строки CountClashes считает каждую пару дважды?',
      code: `public int CountClashes()
{
    int count = 0;
    for (int i = 0; i < _elements.Count; i++)
        for (int j = 0; j < _elements.Count; j++)
            if (i != j && _elements[i].Box.Intersects(_elements[j].Box))
                count++;
    return count;
}`,
      answer: 4,
      explain: 'Внутренний цикл начинается с 0, поэтому каждая пара встречается в двух порядках. Если начать с j = i + 1, проверка i != j становится не нужна, а каждая пара считается один раз.'
    },
    {
      t: 'choice',
      q: 'Три коробки, и все три пересекаются друг с другом. Что вернёт исходный CountClashes?',
      options: ['6', '3', '9'],
      answer: 0,
      explain: 'Настоящих пар три: (0,1), (0,2), (1,2). Цикл по всем j без сравнения с собой насчитает каждую дважды: 3 × 2 = 6. Девять было бы, если бы не было и проверки i != j.',
      wrong: { 1: 'Три — правильный ответ для j = i + 1. Исходный код считает каждую пару в обоих порядках.', 2: '9 = 3 × 3 включало бы сравнение каждой коробки с собой, но его отсекает i != j.' }
    },
    {
      t: 'learn',
      title: 'Событие без подписчиков — это null',
      body: '<p>Поле события, на которое никто не подписан, равно <b>null</b>. Вызов <code>ElementSelected(e)</code> тогда — NullReferenceException. Короткая запись <code>ElementSelected?.Invoke(e)</code> вызывает подписчиков, только если они есть.</p><p>Вторая ловушка: если первый подписчик бросит исключение, остальные подписчики не вызовутся, а код после вызова (запись в лог) не выполнится.</p>',
      code: `if (!_byId.TryGetValue(id, out var e))
{
    Debug.LogWarning("Unknown element id " + id);
    return;
}
ElementSelected?.Invoke(e);`,
      deep: '<p><code>?.Invoke</code> читает поле один раз, поэтому заодно закрывает гонку «проверили на null, а между проверкой и вызовом последний подписчик отписался в другом потоке». Сам многоадресный делегат вызывает подписчиков по очереди и останавливается на первом исключении. Если обработчики чужие и ненадёжные, их перебирают через <code>GetInvocationList()</code> и оборачивают каждый в try/catch с логированием. И про лог: время пиши как <code>DateTime.UtcNow.ToString("o")</code> (ISO 8601, без зависимости от часового пояса и культуры), а сам вывод — через <code>StreamWriter</code> с <code>WriteLine</code>, а не ручной <code>Encoding.GetBytes</code> на каждую строку.</p>'
    },
    {
      t: 'choice',
      q: 'Какой вариант обработчика лучше?',
      options: [
        'TryGetValue → ElementSelected?.Invoke(e) → запись в лог, а catch только для IOException с Debug.LogException',
        'Оставить catch (Exception) { }, но добавить повторную попытку',
        'catch (Exception ex) { throw ex; }'
      ],
      answer: 0,
      explain: 'Ожидаемые ситуации (нет такого id, нет подписчиков) проверяются заранее, без исключений. Ловится только то, что реально может случиться с файлом, и это логируется. Всё остальное — честная ошибка, которую увидят.',
      wrong: { 1: 'Повтор проглоченной ошибки — это та же тишина, только дважды.', 2: 'throw ex; ещё и обнуляет стек вызовов. Если уж перебрасывать, то throw; — но здесь ловить и перебрасывать незачем.' }
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину.',
      pairs: [
        ['Выбор не работает, в логе пусто', 'Пустой catch (Exception)'],
        ['Клик по чужому объекту — KeyNotFoundException', '_byId[id] вместо TryGetValue'],
        ['NRE, когда панель свойств закрыта', 'ElementSelected(e) без ?.'],
        ['Число коллизий вдвое больше', 'Внутренний цикл с j = 0'],
        ['Поиск «id» не находит «ID» у турецких пользователей', 'ToLower() по текущей культуре'],
        ['Время в логе прыгает на час', 'DateTime.Now вместо UtcNow']
      ]
    }
  ]
};
