/** Ревью кода, раздел 1 (ClashService), урок 2: Equals/GetHashCode, ключи словаря, float. */
export default {
  id: 'rv.u1.l2',
  title: 'Равенство и ключи словаря',
  sub: 'Equals без GetHashCode и сравнение float через ==',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Шкаф с ячейками',
      body: '<p><code>Dictionary</code> устроен как шкаф с пронумерованными ячейками. Чтобы найти ключ, он делает два шага:</p><p>1. Спрашивает у ключа его <b>номер ячейки</b> (<code>GetHashCode</code>).<br>2. В этой ячейке сверяет ключи по-настоящему (<code>Equals</code>).</p><p>Если два «равных» ключа дают разные номера, второй будут искать в чужой ячейке и не найдут.</p>'
    },
    {
      t: 'learn',
      title: 'Равные, но не найденные',
      body: '<p>Класс <code>ElementKey</code> переопределил <code>Equals</code>, а <code>GetHashCode</code> забыл. По умолчанию хэш у класса зависит от <b>адреса объекта</b>. Два разных объекта с одинаковым содержимым получают разные номера ячеек.</p>',
      code: `var a = new ElementKey { ModelId = "M1", ElementId = 7 };
var b = new ElementKey { ModelId = "M1", ElementId = 7 };

a.Equals(b);               // true
_cache[a] = list;
_cache.ContainsKey(b);     // false (почти всегда)`,
      deep: '<p>Контракт: если <code>a.Equals(b)</code>, то хэши обязаны совпасть. Обратное не требуется (коллизии хэшей допустимы). Компилятор предупреждает об этом (CS0659), и такое предупреждение не стоит заглушать. Для классов хэш по умолчанию строится от идентичности объекта (<code>RuntimeHelpers.GetHashCode</code>), поэтому «почти всегда» — потому что две разные ячейки изредка совпадают случайно.</p>'
    },
    {
      t: 'choice',
      q: 'Чем это грозит GetClashesFor в сервисе?',
      options: ['Кэш никогда не попадает: каждый вызов считает всё заново, а кэш растёт', 'Выбрасывается исключение при первом обращении', 'Кэш возвращает чужие коллизии'],
      answer: 0,
      explain: 'ContainsKey не находит «такой же» ключ, значит выборка пересчитывается, а в словарь добавляется ещё одна запись. Память растёт, скорость как без кэша.',
      wrong: { 1: 'Исключения нет: словарь просто честно говорит «такого нет».', 2: 'Чужих данных не будет, потеряется только попадание в кэш.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Найди проблемы с ключом, с идентификатором элемента, с кэшем и со сравнением чисел.',
      code: `public class ElementKey
{
    public string ModelId;
    public int ElementId;

    public override bool Equals(object obj) =>
        obj is ElementKey k && k.ModelId == ModelId && k.ElementId == ElementId;
}

public class Element
{
    public ElementKey Key;
    public int Id => Key.ElementId;
}

public List<Clash> GetClashesFor(ElementKey key)
{
    if (!_cache.ContainsKey(key))
        _cache[key] = _clashes.Where(c => c.A.Key.Equals(key) || c.B.Key.Equals(key)).ToList();
    return _cache[key];
}

public bool IsOnLevel(Element e, float levelHeight) =>
    e.Bounds.min.y == levelHeight;`,
      bugs: [
        { lines: [0, 5, 6], title: 'Equals без GetHashCode', why: 'Равные ключи попадают в разные ячейки словаря. ContainsKey их не находит, кэш разрастается, и каждый вызов пересчитывает всё.' },
        { lines: [2, 3], title: 'Изменяемые поля в ключе', why: 'Если поменять ElementId уже после вставки, запись останется в старой ячейке и «потеряется»: ни найти, ни удалить.' },
        { lines: [12], title: 'Id игнорирует ModelId', why: 'Элементы из разных моделей с одним номером считаются одним элементом. А если Key окажется null, получишь NullReferenceException.' },
        { lines: [17, 19], title: 'Двойной поиск по словарю', why: 'ContainsKey, потом индексатор: два поиска вместо одного. Для горячего пути это лишняя работа, лечится TryGetValue.' },
        { lines: [18], title: 'Кэш без сброса', why: 'После добавления, удаления или импорта коллизий закэшированные списки устаревают, а наружу отдаётся внутренний изменяемый список кэша.' },
        { lines: [23], title: 'float сравнивается через ==', why: 'Числа с плавающей точкой почти никогда не равны точно: 3.0f и 2.9999998f разные. Элемент «на уровне» будет считаться не на уровне.' }
      ],
      goal: { min: 5, maxFalse: 2 },
      solve: ['flag:0', 'flag:2', 'flag:12', 'flag:17', 'flag:18', 'flag:23', 'check']
    },
    {
      t: 'blanks',
      q: 'Добавь недостающий метод, чтобы равные ключи давали одинаковый номер ячейки.',
      code: `public override int ___() =>
    HashCode.___(ModelId, ElementId);`,
      tiles: ['GetHashCode', 'Combine', 'ToString', 'Equals'],
      answer: ['GetHashCode', 'Combine'],
      explain: '<code>HashCode.Combine</code> смешивает значения полей в один хэш. Главное, чтобы в нём участвовали те же поля, что и в <code>Equals</code>.'
    },
    {
      t: 'choice',
      q: 'Что случится, если после dict[key] = value поменять key.ElementId, а хэш считается по этому полю?',
      options: ['Запись останется в старой ячейке, и по ключу её уже не найти', 'Словарь сам переложит запись в новую ячейку', 'Выбросится исключение при изменении поля'],
      answer: 0,
      explain: 'Словарь считает хэш один раз, при вставке. Он не следит за ключом. Поэтому ключи делают неизменяемыми: readonly-поля, record или readonly struct.',
      wrong: { 1: 'Словарь не знает, что ты поменял поле, и ничего не пересчитывает.', 2: 'Обычное поле можно менять свободно, ничего не проверяется.' }
    },
    {
      t: 'choice',
      q: 'Как правильно переписать двойной поиск?',
      code: `if (!_cache.ContainsKey(key))
    _cache[key] = Build(key);
return _cache[key];`,
      options: ['if (!_cache.TryGetValue(key, out var list)) _cache[key] = list = Build(key); return list;', 'return _cache.ContainsKey(key) ? _cache[key] : Build(key);', 'return _cache[key] ?? Build(key);'],
      answer: 0,
      explain: 'TryGetValue ищет один раз и сразу отдаёт значение. Второй вариант ищет дважды и ещё и ничего не кладёт в кэш. Третий упадёт с KeyNotFoundException, если ключа нет.',
      wrong: { 1: 'Поиск остался двойным, а Build результат нигде не сохраняет.', 2: 'Индексатор бросает исключение для отсутствующего ключа, до ?? дело не дойдёт.' }
    },
    {
      t: 'choice',
      q: 'Чему равно -3 % 8 в C#?',
      code: `int id = -3;
int chunk = id % 8;`,
      options: ['-3', '5', '3'],
      answer: 0,
      explain: 'Остаток в C# берёт знак делимого. Поэтому <code>Id % 8</code> для отрицательных Id даёт от -7 до 0, и такие элементы не попадут в корзины 0…7. Лечится так: <code>((id % 8) + 8) % 8</code>. Не используй <code>Math.Abs</code>: <code>Math.Abs(int.MinValue)</code> бросает OverflowException.',
      wrong: { 1: 'Так считали бы математики (остаток всегда неотрицателен). В C# оператор % работает иначе.', 2: 'Знак пропасть не может: делимое отрицательное, остаток тоже.' }
    },
    {
      t: 'learn',
      title: 'Дробные числа неточны',
      body: '<p>Компьютер хранит <code>float</code> в двоичной записи, и многие числа (даже простое 0,1) в ней не получаются точными. После нескольких расчётов «3» превращается в <code>2.9999998</code>. Сравнение <code>==</code> честно скажет «не равно».</p><p>Для сравнения нужен допуск: достаточно близко — значит равно.</p>',
      code: `float h = 0.1f * 30;
h == 3.0f;                       // может быть false
Mathf.Approximately(h, 3.0f);    // true
Math.Abs(h - 3.0f) < 0.001f;     // допуск в метрах`,
      deep: '<p>Допуск выбирают по смыслу задачи. <code>Mathf.Approximately</code> использует относительную погрешность около 1e-6 и плохо подходит для значений вблизи нуля или в большом масштабе. Для высот в метрах чаще берут явный допуск (например, 1 мм). Плюс <code>NaN == NaN</code> ложно, поэтому проверяй значения на NaN отдельно.</p>'
    },
    {
      t: 'multi',
      q: 'Какими свойствами должен обладать хороший ключ словаря? Отметь все.',
      options: ['Поля, от которых зависят Equals и хэш, не меняются', 'GetHashCode согласован с Equals', 'Реализует IEquatable<T>, чтобы не упаковывать значения', 'Хэш считается от поля Name, которое пользователь может переименовать'],
      answer: [0, 1, 2],
      explain: 'Неизменяемость и согласованность Equals и GetHashCode обязательны. IEquatable<T> убирает приведение к object и упаковку у структур. Хэш от изменяемого поля ломает поиск.'
    },
    {
      t: 'match',
      q: 'Соедини проблему и последствие.',
      pairs: [
        ['Equals без GetHashCode', 'Кэш не находит свои же ключи'],
        ['Изменяемое поле в ключе', 'Запись теряется после правки'],
        ['Id без ModelId', 'Разные элементы слиты в один'],
        ['ContainsKey + индексатор', 'Два поиска вместо одного'],
        ['float ==', 'Элемент «на уровне» не опознан']
      ]
    },
    {
      t: 'learn',
      title: 'Для сеньора: как лучше сделать ключ',
      body: '<p>Самое простое лечение — <code>readonly record struct ElementKey(string ModelId, int ElementId)</code>. Компилятор сам сгенерирует <code>Equals</code>, <code>GetHashCode</code>, <code>IEquatable&lt;T&gt;</code> и операторы, поля станут неизменяемыми, а структура не создаёт мусора.</p>',
      deep: '<p>Оговорка про Unity: <code>record</code> требует C# 9, а <code>readonly record struct</code> — C# 10. В версиях Unity со старым языком пиши структуру вручную: <code>readonly struct</code> + <code>IEquatable&lt;ElementKey&gt;</code> + <code>GetHashCode</code> + операторы <code>==</code>/<code>!=</code>. Если структура не реализует <code>IEquatable&lt;T&gt;</code> и не переопределяет <code>Equals</code>, словарь использует <code>ValueType.Equals</code> — медленнее и с упаковкой.</p>'
    }
  ]
};
