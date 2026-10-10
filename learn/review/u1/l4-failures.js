/** Ревью кода, раздел 1 (ClashService), урок 4: исключения, null в Unity, открытые поля. */
export default {
  id: 'rv.u1.l4',
  title: 'Исключения и null в Unity',
  sub: 'throw ex, «мёртвый» GameObject и открытые поля',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Письмо с чужим обратным адресом',
      body: '<p>Исключение несёт с собой <b>стек вызовов</b>: путь, по которому оно пришло. Это как конверт со штемпелями всех почтовых отделений. Когда ты ловишь исключение и бросаешь его дальше через <code>throw ex;</code>, ты заклеиваешь все старые штемпели новым: «отправлено отсюда». Настоящее место поломки теряется.</p><p>А <code>throw;</code> пересылает конверт как есть.</p>',
      code: `catch (Exception ex)
{
    throw ex;   // стек начинается заново с этой строки
    // throw;   // стек сохранён
}`,
      deep: '<p><code>throw ex</code> перезаписывает стек вызовов в самом объекте исключения: фреймы ниже точки перехвата пропадают. Если нужно бросить пойманное исключение позже или из другого места (например, из продолжения асинхронной операции) и сохранить его стек, пользуйся <code>ExceptionDispatchInfo.Capture(ex).Throw()</code>. Если хочешь добавить контекст, оберни: <code>throw new ImportException("...", ex)</code> — исходное исключение остаётся в <code>InnerException</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Что поменяется в трассировке стека, если заменить throw ex; на throw;?',
      options: ['В ней снова появятся фреймы настоящего места ошибки (внутри File.ReadAllText или парсера)', 'Исключение перестанет бросаться', 'Стек станет короче'],
      answer: 0,
      explain: 'С throw ex трассировка начинается в Import, а всё, что было глубже, пропадает. С throw; видна вся цепочка до точки, где всё действительно сломалось. Для разбора ошибки из продакшен-лога это разница между минутами и часами.',
      wrong: { 1: 'Исключение по-прежнему бросается, меняется только его трассировка.', 2: 'Наоборот: стек станет полным, а не короче.' }
    },
    {
      t: 'blanks',
      q: 'Перебрось исключение, не потеряв стек.',
      code: `catch (IOException)
{
    Cleanup();
    ___;
}`,
      tiles: ['throw', 'throw ex', 'throw null', 'return'],
      answer: ['throw'],
      explain: 'Голый <code>throw;</code> внутри catch пересылает то же исключение с исходным стеком. Вариант <code>throw ex</code> обнулил бы стек.'
    },
    {
      t: 'learn',
      title: 'Не лови всё и не кричи дважды',
      body: '<p>В <code>Import</code> есть ещё три запаха. <b>Первый:</b> <code>catch (Exception)</code> ловит вообще всё, даже то, что здесь починить нельзя. Ловят конкретное: <code>IOException</code>, <code>JsonException</code>. <b>Второй:</b> «записал в лог и бросил дальше» превращается в двойное (тройное) логирование на каждом уровне. Выбери одно: либо обработай и не бросай, либо брось и не логируй, пусть логирует тот, кто принимает решение. <b>Третий:</b> <code>DeserializeObject</code> может вернуть <code>null</code> (пустой файл, содержимое «null»), и <code>AddRange(null)</code> бросит <code>ArgumentNullException</code>.</p>'
    },
    {
      t: 'blanks',
      q: 'Проверь результат десериализации до использования.',
      code: `var data = JsonConvert.DeserializeObject<List<Clash>>(json);
if (data ___ null)
    throw new InvalidDataException("empty file");
_clashes.AddRange(data);`,
      tiles: ['==', '!=', '?.', '??'],
      answer: ['=='],
      explain: 'Если данных нет, лучше сразу понятная ошибка, чем <code>ArgumentNullException</code> с непонятным параметром. Для обычных (не Unity) объектов <code>== null</code> работает как ожидается.'
    },
    {
      t: 'learn',
      title: 'Мёртвый, но не пустой',
      body: '<p>Объект Unity состоит из двух частей: C#-обёртки (то, что видит твой код) и нативного объекта внутри движка. После <code>Destroy</code> нативная часть исчезает, а обёртка остаётся, как табличка на двери комнаты, которую снесли. Unity перегрузил оператор <code>==</code>, чтобы такая табличка при сравнении с <code>null</code> считалась пустой («fake null»).</p><p>Но операторы <code>?.</code>, <code>??</code> и <code>is null</code> эту перегрузку <b>не вызывают</b>: они смотрят на обёртку и видят «жива». Результат: <code>MissingReferenceException</code>.</p>',
      code: `_marker?.SetActive(true);      // для мёртвого GameObject упадёт
if (_marker != null)           // честная проверка Unity
    _marker.SetActive(true);`,
      deep: '<p>Анализаторы Microsoft.Unity.Analyzers предупреждают об этом: UNT0007 — про <code>??</code>, UNT0008 — про <code>?.</code>, есть родственные правила и для <code>??=</code> и <code>is null</code>. Правило такое: для наследников <code>UnityEngine.Object</code> используй явные <code>== null</code> / <code>!= null</code> или неявное приведение к bool. Дополнительная проблема в <code>ClashService</code>: поле <code>_marker</code> приватное, нигде не назначается, а сам класс не <code>MonoBehaviour</code>, то есть Inspector его не заполнит. Метод всегда молча ничего не делает (компилятор предупреждает: CS0649, поле никогда не присваивается).</p>'
    },
    {
      t: 'choice',
      q: 'Что сделает _marker?.SetActive(true), если GameObject уже уничтожен через Destroy, а поле не обнулено?',
      options: ['Бросит MissingReferenceException', 'Тихо пропустит вызов', 'Создаст новый GameObject'],
      answer: 0,
      explain: 'Оператор ?. проверяет только ссылку на C#-обёртку, а она не null. Поэтому SetActive вызывается у объекта, нативная часть которого уже уничтожена.',
      wrong: { 1: 'Пропустил бы вызов, если бы проверка учитывала перегруженный ==. Но ?. его не вызывает.', 2: 'Ничего нового не создаётся, Unity так не работает.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Часть сервиса про модель данных, импорт и подсветку. Найди как можно больше проблем: исключения, null и устройство классов.',
      code: `public class Element
{
    public ElementKey Key;
    public Element Parent;
    public List<Element> Children = new List<Element>();
}

private GameObject _marker;

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
}`,
      bugs: [
        { lines: [3, 4], title: 'Открытые изменяемые Parent и Children', why: 'Связь родитель-ребёнок можно нарушить с любой стороны, вплоть до кольца. А двусторонние ссылки сами по себе — петля для сериализации: Newtonsoft бросит «Self referencing loop detected», если не настроить ReferenceLoopHandling или не сериализовать отдельные DTO.' },
        { lines: [7], title: 'Поле _marker нигде не назначается', why: 'Класс не MonoBehaviour, Inspector поле не заполнит. Оно всегда null, и Highlight молча ничего не делает.' },
        { lines: [13], title: 'Синхронное чтение файла', why: 'File.ReadAllText блокирует поток. Если вызвать Import на главном потоке Unity, на время чтения большого файла замрёт игра.' },
        { lines: [14], title: 'Результат десериализации не проверен', why: 'DeserializeObject вернёт null для пустого файла, и AddRange(null) бросит ArgumentNullException. Кэш после импорта тоже не сбрасывается.' },
        { lines: [16], title: 'Слишком широкий catch (Exception)', why: 'Ловится всё, включая то, что здесь не починить. Для ошибок ввода-вывода и разбора JSON нужны конкретные типы.' },
        { lines: [18], title: 'Логирование и повторный throw', why: 'Одна ошибка попадёт в лог на каждом уровне, и журнал забьётся дублями. К тому же LogError(ex.Message) пишет только текст без стека (Debug.LogException(ex) сохранил бы его). Логировать надо там, где ошибку обрабатывают.' },
        { lines: [19], title: 'throw ex; обнуляет стек', why: 'Из трассировки пропадает настоящее место поломки: видно только Import. Нужен throw;.' },
        { lines: [25], title: '?. для UnityEngine.Object', why: 'Для уничтоженного GameObject оператор ?. не видит fake null и вызывает SetActive, что даёт MissingReferenceException.' }
      ],
      goal: { min: 6, maxFalse: 2 },
      solve: ['flag:3', 'flag:7', 'flag:13', 'flag:14', 'flag:16', 'flag:18', 'flag:19', 'flag:25', 'check']
    },
    {
      t: 'multi',
      q: 'Какие проверки НЕ учитывают перегрузку == у UnityEngine.Object и пропустят «мёртвый» объект? Отметь все.',
      options: ['obj?.Method()', 'obj ?? other', 'obj is null', 'obj == null'],
      answer: [0, 1, 2],
      explain: 'Операторы ?., ?? и is null обращаются к самой ссылке и обходят перегрузку. Обычный == null вызывает перегруженный оператор Unity и честно скажет, что объект уничтожен.'
    },
    {
      t: 'blanks',
      q: 'Почини Highlight: честная проверка для объекта Unity.',
      code: `public void Highlight()
{
    if (_marker ___ null)
        _marker.SetActive(true);
}`,
      tiles: ['!=', '?.', 'is not', '??'],
      answer: ['!='],
      explain: 'Оператор <code>!=</code> вызывает перегрузку Unity и вернёт <code>false</code> для уничтоженного объекта. Вариант <code>is not null</code> выглядит похоже, но перегрузку обходит. Не забудь ещё присвоить поле маркера где-то в конструкторе или через [SerializeField] в MonoBehaviour.'
    },
    {
      t: 'choice',
      q: 'Как лучше защитить дерево Element от рассогласования Parent и Children?',
      options: ['Закрыть поля и добавить метод AddChild, который сам выставляет Parent', 'Оставить поля открытыми и написать в комментарии, как пользоваться', 'Сделать оба поля static'],
      answer: 0,
      explain: 'Когда единственный путь изменения идёт через один метод, дерево не может стать противоречивым. Наружу отдают IReadOnlyList<Element>, чтобы список нельзя было менять мимо метода.',
      wrong: { 1: 'Комментарий не остановит ошибку, она появится рано или поздно.', 2: 'static сделает связь общей для всех элементов, это полностью ломает смысл.' }
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину.',
      pairs: [
        ['В логе виден только метод Import', 'throw ex; вместо throw;'],
        ['MissingReferenceException на ?.', 'fake null у уничтоженного объекта'],
        ['ArgumentNullException в AddRange', 'DeserializeObject вернул null'],
        ['Self referencing loop detected', 'Parent и Children ссылаются друг на друга'],
        ['Игра замирает при импорте', 'Синхронное чтение файла на главном потоке']
      ]
    }
  ]
};
