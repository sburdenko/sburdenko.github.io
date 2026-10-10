/** Ревью кода, раздел 1 (ClashService), урок 3: изменение коллекции в foreach, рекурсия, допуск для float. */
export default {
  id: 'rv.u1.l3',
  title: 'Коллекции и рекурсия',
  sub: 'Remove в foreach, бесконечный обход дерева и сравнение высот',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Вырванная страница',
      body: '<p>Ты читаешь список вслух, страницу за страницей. Вдруг кто-то выдирает страницу прямо во время чтения. Ты теряешь место и не знаешь, что читать дальше. <code>foreach</code> по <code>List</code> ведёт себя так же и <b>громко сдаётся</b>: бросает <code>InvalidOperationException</code>, «Collection was modified».</p>',
      code: `foreach (var c in _clashes)
{
    if (c.IsResolved)
        _clashes.Remove(c);   // падение на следующем витке
}`,
      deep: '<p>У <code>List&lt;T&gt;</code> есть счётчик версий. Каждый <code>Add</code>/<code>Remove</code> его увеличивает, а перечислитель в начале каждого шага сверяет свою копию номера версии с актуальным. Не совпало — исключение. Для словарей в современном .NET (Core 3.0+) <code>Remove</code> и <code>Clear</code> во время перебора разрешены, но в Unity (Mono) на это рассчитывать не стоит.</p>'
    },
    {
      t: 'choice',
      q: 'Что произойдёт при запуске RemoveResolved, если в списке есть решённая коллизия?',
      code: `foreach (var c in _clashes)
{
    if (c.IsResolved)
        _clashes.Remove(c);
}`,
      options: ['InvalidOperationException на следующем шаге перебора', 'Решённые коллизии спокойно удалятся', 'Удалятся все коллизии'],
      answer: 0,
      explain: 'После Remove версия списка изменилась, и следующий шаг перебора это замечает. Кроме того, каждый Remove ищет элемент и сдвигает хвост: это O(n) на каждое удаление.',
      wrong: { 1: 'Было бы спокойно, если бы удаляли вне перебора или через RemoveAll.', 2: 'Список не очищается целиком: перебор просто оборвётся исключением.' }
    },
    {
      t: 'blanks',
      q: 'Замени цикл одним вызовом: удалить все решённые за один проход.',
      code: `public void RemoveResolved()
{
    _clashes.___(c => c.IsResolved);
}`,
      tiles: ['RemoveAll', 'Remove', 'Clear', 'Where'],
      answer: ['RemoveAll'],
      explain: '<code>RemoveAll</code> проходит список один раз, сам сдвигает оставшиеся и сразу принимает условие. Это O(n) вместо O(n²). Не забудь после него сбросить кэш, который ещё хранит устаревшие выборки.'
    },
    {
      t: 'multi',
      q: 'Какие способы безопасно удалить элементы из List<Clash>? Отметь все.',
      options: ['_clashes.RemoveAll(c => c.IsResolved)', 'for (int i = _clashes.Count - 1; i >= 0; i--) с RemoveAt(i)', 'foreach по _clashes.ToList() с _clashes.Remove(c)', 'foreach по _clashes с _clashes.Remove(c)'],
      answer: [0, 1, 2],
      explain: 'RemoveAll самый быстрый. Цикл с конца не сдвигает ещё не пройденные индексы. Копия через ToList безопасна, но дороже по времени и памяти. Прямой foreach с Remove падает.'
    },
    {
      t: 'learn',
      title: 'Матрёшка без дна',
      body: '<p><code>CollectFloor</code> вызывает сам себя для каждого ребёнка. Каждый вызов кладёт на «стопку тарелок» (стек вызовов) новую тарелку. Если в данных кольцо (элемент оказался собственным потомком), тарелки не кончатся никогда, пока стопка не рухнет.</p><p>Эта авария называется <code>StackOverflowException</code>, и у неё жёсткая особенность: <b>её нельзя поймать</b> через <code>try/catch</code>. Процесс завершается целиком.</p>',
      code: `public void CollectFloor(Element node, string floor, List<Element> result)
{
    if (node.Floor == floor)
        result.Add(node);
    foreach (var child in node.Children)
        CollectFloor(child, floor, result);   // а если child — предок?
}`,
      deep: '<p>Размер стека потока ограничен (порядка 1 МБ в типичной конфигурации, на других платформах и у потоков пула бывает иначе). Глубина в десятки тысяч кадров может убить процесс и без всяких циклов: достаточно очень глубокого дерева из импортированной модели. Компилятор C# не делает оптимизацию хвостовой рекурсии, на JIT тоже полагаться нельзя.</p>'
    },
    {
      t: 'choice',
      q: 'Можно ли обернуть вызов CollectFloor в try/catch (Exception) и спокойно продолжить?',
      options: ['Нет: StackOverflowException нельзя перехватить, процесс упадёт', 'Да, catch (Exception) поймает любое исключение', 'Да, но только если указать catch (StackOverflowException)'],
      answer: 0,
      explain: 'Среда выполнения завершает процесс сразу, потому что состояние стека уже повреждено. Защищаться нужно заранее: ограничить глубину или обойти дерево без рекурсии.',
      wrong: { 1: 'Для переполнения стека catch не вызывается вообще.', 2: 'Тип такого исключения существует, но поймать его нельзя ни одним catch.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Три метода сервиса. В каждом спрятан свой баг про коллекции, обход или числа. Найди все три.',
      code: `public void RemoveResolved()
{
    foreach (var c in _clashes)
    {
        if (c.IsResolved)
            _clashes.Remove(c);
    }
}

public void CollectFloor(Element node, string floor, List<Element> result)
{
    if (node.Floor == floor)
        result.Add(node);
    foreach (var child in node.Children)
        CollectFloor(child, floor, result);
}

public bool IsOnLevel(Element e, float levelHeight) =>
    e.Bounds.min.y == levelHeight;`,
      bugs: [
        { lines: [2, 5], title: 'Remove внутри foreach', why: 'Список меняется во время перебора, и следующий шаг бросает InvalidOperationException. К тому же каждое удаление сдвигает хвост, то есть работа квадратичная.' },
        { lines: [14], title: 'Рекурсия без защиты от цикла и глубины', why: 'Если Parent и Children образуют кольцо, стек переполнится. StackOverflowException нельзя поймать, и приложение завершится целиком.' },
        { lines: [18], title: 'float сравнивается через ==', why: 'Высота после расчётов может отличаться в последнем знаке. Элемент, стоящий на уровне, не признаётся стоящим на уровне, и этаж «пустеет».' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:2', 'flag:14', 'flag:18', 'check']
    },
    {
      t: 'order',
      q: 'Расставь шаги итеративного обхода (без рекурсии и с защитой от колец).',
      items: [
        'Положить корень в Stack и завести HashSet посещённых',
        'Пока стек не пуст, достать верхний узел',
        'Если узел уже посещали, пропустить его',
        'Обработать узел: добавить в результат, если этаж подходит',
        'Положить всех детей узла в стек'
      ],
      explain: 'Стек заменяет вызовы функции, а множество посещённых обрывает кольца. Порядок обхода при этом получается зеркальным по детям; если он важен, клади детей в обратном порядке.'
    },
    {
      t: 'blanks',
      q: 'Заполни обход: «возьми», «достань» и «запомни посещённый».',
      code: `var stack = new Stack<Element>();
var seen = new HashSet<Element>();
stack.___(root);
while (stack.Count > 0)
{
    var node = stack.___();
    if (!seen.___(node)) continue;
    // ... обработка и добавление детей
}`,
      tiles: ['Push', 'Pop', 'Add', 'Peek', 'Contains'],
      answer: ['Push', 'Pop', 'Add'],
      explain: '<code>Add</code> у <code>HashSet</code> возвращает <code>false</code>, если элемент уже был. Одним вызовом и проверяем, и запоминаем. С <code>Contains</code> узел так и не попал бы в множество.'
    },
    {
      t: 'choice',
      q: 'Какая проверка уровня самая разумная для высот в метрах?',
      options: ['Math.Abs(e.Bounds.min.y - levelHeight) < 0.01f', 'e.Bounds.min.y.Equals(levelHeight)', '(int)e.Bounds.min.y == (int)levelHeight', 'e.Bounds.min.y <= levelHeight'],
      answer: 0,
      explain: 'Допуск выбираем по смыслу: 1 см для здания. Equals для float так же точен, как ==. Приведение к int отбрасывает дробную часть: 2.9999 станет 2, а 3.0 станет 3. А <= пропустит всё, что ниже уровня.',
      wrong: { 1: 'Equals сравнивает те же биты, это то же самое, что ==.', 2: 'Отбрасывание дробей даёт ошибки на целый метр.', 3: 'Это проверка «не выше», а не «на уровне».' }
    },
    {
      t: 'match',
      q: 'Соедини симптом и лечение.',
      pairs: [
        ['Collection was modified', 'RemoveAll или копия списка'],
        ['Процесс внезапно завершился на обходе дерева', 'Стек и HashSet вместо рекурсии'],
        ['Этаж пуст, хотя там есть элементы', 'Допуск вместо =='],
        ['Удаление тормозит на тысячах элементов', 'Один проход вместо Remove в цикле']
      ]
    },
    {
      t: 'learn',
      title: 'Для сеньоров: что ещё забыто',
      body: '<p>После <code>RemoveResolved</code> (и после <code>Import</code>) выборки в <code>_cache</code> остаются старыми: коллизии уже нет в списке, а кэш по-прежнему её отдаёт. Любое изменение <code>_clashes</code> должно сбрасывать кэш, либо кэш должен хранить номер версии данных.</p>',
      deep: '<p>Если дерево может быть огромным, а порядок не важен, итеративный обход заодно экономит стек. Если нужна защита только от колец, хватит отметок «посещён» на самих узлах. Для набора, который растёт параллельно, используй неизменяемую копию (snapshot) на момент обхода.</p>'
    }
  ]
};
