/** Финал раздела «Члены типа и версии» курса «C# глубже». */
export default {
  id: 'cs.u8.boss',
  title: 'Финал: члены типа и версии',
  sub: 'Константы, инициализация, слоты и расширения — что ломается без перекомпиляции',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Приложение собрано с Api v1, где Version = "1" и Url = "https://v1". В v2 стало "2" и "https://v2". Dll заменили, приложение не пересобирали. Что оно напечатает?',
      code: 'public static class Api\n{\n    public const string Version = "2";\n    public static readonly string Url = "https://v2";\n}\n\n// код приложения\nConsole.WriteLine($"{Api.Version} {Api.Url}");',
      options: ['1 https://v2', '2 https://v2', '1 https://v1', '2 https://v1'],
      answer: 0,
      explain: 'Строковая константа вшита в IL приложения инструкцией ldstr "1". static readonly читается через ldsfld из новой dll — там уже https://v2.',
      wrong: { 1: 'Так будет только после перекомпиляции приложения: значение const берётся из IL вызывающего.', 3: 'Наоборот: вшито как раз const, а поле читается из новой сборки.' }
    },
    {
      t: 'order',
      q: 'class D : B. У D есть явный статический конструктор, у обоих — инициализаторы полей и тела конструкторов. Тип D ещё не трогали. Расставь, что выполнится при new D()',
      items: ['Статический конструктор D', 'Инициализаторы полей D', 'Инициализаторы полей B', 'Тело конструктора B', 'Тело конструктора D'],
      explain: 'Перед созданием первого экземпляра запускается статический конструктор D. Потом конструктор D: свои инициализаторы, вызов base — инициализаторы B и тело B, — и только затем тело D.'
    },
    {
      t: 'tapline',
      q: 'new SqlRepo("Server=db"). На какой строке вылетит NullReferenceException?',
      code: 'class Repo\n{\n    protected Repo() { Warmup(); }\n    protected virtual void Warmup() { }\n}\nclass SqlRepo : Repo\n{\n    readonly string table = "orders";\n    readonly string conn;\n    public SqlRepo(string c) { conn = c; }\n    protected override void Warmup()\n    {\n        Console.WriteLine(table.Length);\n        Console.WriteLine(conn.Length);\n    }\n}',
      answer: 13,
      explain: 'Warmup вызывается из конструктора Repo и через слот попадает в SqlRepo. Инициализатор table уже выполнился — он стоит до вызова base. А conn присваивает тело конструктора SqlRepo, до которого дело ещё не дошло.'
    },
    {
      t: 'multi',
      q: 'Библиотеку обновили до v2, потребителя не пересобирали. Какие изменения тихо поменяют его поведение — без исключений? Отметь все.',
      options: ['Изменили значение public const', 'Вставили новый член в середину enum', 'У наследника заменили new на override', 'Базовый класс, от которого наследуется потребитель, стал sealed', 'Убрали implicit-преобразование, которым пользовался потребитель'],
      answer: [0, 1, 2],
      explain: 'Константы и члены enum вшиты числами, а override занимает слот, через который идёт старый callvirt. sealed даёт TypeLoadException, удалённый op_Implicit — MissingMethodException: громко, но не тихо.'
    },
    {
      t: 'choice',
      q: 'Area — невиртуальный метод класса Shape, он не обращается ни к одному полю. Что произойдёт?',
      code: 'Shape s = null;\nConsole.WriteLine(s.Area());',
      options: ['NullReferenceException в месте вызова', 'Метод выполнится: this ему не нужен', 'NullReferenceException только если Area читает поле', 'Не скомпилируется'],
      answer: 0,
      explain: 'C# вызывает экземплярные методы ссылочных типов через callvirt, а он проверяет получатель на null ещё до входа в метод. Без исключения прошёл бы только метод расширения — он вызывается через call.',
      wrong: { 1: 'Так было бы с инструкцией call. Но C# ставит callvirt даже для невиртуальных методов именно ради этой проверки.' }
    },
    {
      t: 'match',
      q: 'Соедини то, что видно в IL, и конструкцию C#',
      pairs: [
        ['op_Addition', 'operator +'],
        ['op_Implicit', 'implicit operator'],
        ['.cctor', 'Статический конструктор'],
        ['newslot virtual', 'virtual'],
        ['final virtual', 'sealed override']
      ]
    },
    {
      t: 'blanks',
      q: 'Потребители должны видеть новое значение после замены dll, а инициализация — идти в точный момент, без beforefieldinit',
      code: 'public class Defaults\n{\n    public static ___ int TimeoutSec = 30;\n    ___ Defaults() { }\n}',
      tiles: ['readonly', 'static', 'const', 'sealed', 'virtual'],
      answer: ['readonly', 'static'],
      explain: 'static readonly читается через ldsfld из актуальной сборки. Явный статический конструктор, даже пустой, снимает флаг beforefieldinit.'
    },
    {
      t: 'choice',
      q: 'У тебя есть расширение ToJson(this Order o). В v2 библиотеки в Order добавили свой public string ToJson(). Что будет с вызовами order.ToJson() в твоём коде?',
      options: ['До перекомпиляции — твоё расширение, после — метод библиотеки, без предупреждений', 'Сразу метод библиотеки: CLR выбирает экземплярный метод при загрузке', 'После перекомпиляции — ошибка неоднозначного вызова', 'Всегда твоё расширение: оно объявлено ближе к вызову'],
      answer: 0,
      explain: 'В твоём IL стоит статический call на расширение, его замена dll не трогает. При перекомпиляции компилятор сначала ищет экземплярные методы, находит ToJson у Order — и до расширений не доходит. Никакого предупреждения не будет.',
      wrong: { 1: 'CLR не перевыбирает методы: в IL уже записан конкретный статический метод.', 2: 'Неоднозначности нет: экземплярный метод просто выигрывает, расширения не рассматриваются.' }
    }
  ]
};
