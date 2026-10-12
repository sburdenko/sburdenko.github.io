/** C# глубже, раздел «Устройство типа», урок 2: приведения типов. */
export default {
  id: 'cs.u6.l2',
  title: 'Приведения: is, as и шаблоны',
  sub: 'Как CLR проверяет тип, почему (long)(object)42 падает и где молчат операторы',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Вверх — бесплатно, вниз — с проверкой',
      body: '<p>Приведение к базовому типу или интерфейсу <b>неявное</b>: компилятор и так знает, что Manager — это Employee. Во время работы ничего не происходит, ссылка та же.</p><p>Обратно, к производному типу, — только <b>явно</b>, в скобках. Компилятор не знает, что на самом деле лежит в переменной, и вставляет проверку, которая выполнится при запуске.</p><p>Одни и те же скобки делают разное: для чисел <code>(int)3.9</code> — это <b>преобразование</b> значения (будет 3), для ссылок — только <b>проверка</b> типа, объект не меняется.</p>',
      code: 'class Employee { }\nclass Manager : Employee { }\n\nEmployee e = new Manager();   // неявно, без проверки\nobject o = e;                 // неявно\nManager m = (Manager)o;       // явно: проверка при запуске'
    },
    {
      t: 'learn',
      title: 'Как CLR проверяет приведение',
      body: '<p>Для <code>(Manager)o</code> компилятор выдаёт IL-инструкцию <code>castclass</code>. Во время работы CLR берёт из объекта <b>указатель на тип</b> и сравнивает его с Manager. Не совпало — идёт по цепочке родителей, а для интерфейса — по списку интерфейсов типа. Нашёл — приведение проходит. Нет — <code>InvalidCastException</code>.</p><p>Важная деталь: <code>null</code> проходит любое приведение к ссылочному типу. Проверять нечего — и исключения нет.</p>',
      flow: ['(Manager)o', 'castclass', 'указатель на тип объекта', 'родители и интерфейсы', 'ссылка или InvalidCastException'],
      deep: '<p>В современном .NET эта логика живёт в управляемом коде (класс <code>CastHelpers</code> в рантайме) и использует кэш результатов приведений. Приведение к <code>sealed</code>-классу JIT часто сводит к одному сравнению указателей: наследников нет, значит, тип должен совпасть точно. Приведение к интерфейсу или к классу с глубокой иерархией дороже. Это наносекунды, но в горячем цикле по миллионам объектов разница видна в профайлере.</p>'
    },
    {
      t: 'tapline',
      q: 'Manager наследует Employee. Какая строка бросит InvalidCastException?',
      code: 'object o = new Employee();\nEmployee e = (Employee)o;\nobject n = null;\nManager m1 = (Manager)n;\nManager m2 = (Manager)o;',
      answer: 4,
      explain: 'В o лежит Employee, а не Manager: родитель не становится наследником. Строка с null проходит: приведение null к ссылочному типу всегда успешно.'
    },
    {
      t: 'learn',
      title: 'is, as и шаблоны',
      body: '<p><code>is</code> и <code>as</code> компилируются в IL-инструкцию <code>isinst</code>: та же проверка, но без исключения. <code>is</code> возвращает bool, <code>as</code> — ссылку или null.</p><p>Старый код часто проверяет тип дважды: сначала <code>is</code>, потом приведение. Шаблон <code>is Manager m</code> делает одну проверку и сразу даёт переменную нужного типа.</p>',
      code: '// две проверки типа\nif (o is Manager) { var m = (Manager)o; m.Approve(); }\n\n// одна проверка\nvar m2 = o as Manager;\nif (m2 != null) m2.Approve();\n\n// одна проверка, современно\nif (o is Manager m3) m3.Approve();'
    },
    {
      t: 'match',
      q: 'Соедини выражение и что будет, если в o не Manager',
      pairs: [
        ['(Manager)o', 'InvalidCastException'],
        ['o as Manager', 'Вернёт null'],
        ['o is Manager', 'Вернёт false'],
        ['o is Manager m', 'false, переменная m не назначена']
      ]
    },
    {
      t: 'choice',
      q: 'Почему строка int n = o as int; не компилируется?',
      options: ['as при неудаче возвращает null, а int не может быть null', 'as работает только с интерфейсами', 'int нельзя достать из object', 'Нужно писать as Int32'],
      answer: 0,
      explain: 'Для значимых типов пишут o as int? или, лучше, o is int n: проверка и распаковка за один шаг.'
    },
    {
      t: 'learn',
      title: 'is null и is not null',
      body: '<p>Класс может перегрузить <code>==</code> — и тогда <code>x == null</code> вызовет его код, который может ошибаться или быть медленным. Шаблоны <code>is null</code> и <code>is not null</code> перегруженные операторы <b>не вызывают</b>: компилятор сравнивает саму ссылку с null.</p>',
      code: 'class Weird\n{\n    public static bool operator ==(Weird? a, Weird? b) => true;\n    public static bool operator !=(Weird? a, Weird? b) => false;\n}\n\nWeird w = new();\nConsole.WriteLine(w == null);   // True — так решил оператор\nConsole.WriteLine(w is null);   // False — честная проверка'
    },
    {
      t: 'learn',
      title: 'Распаковка: только точный тип',
      body: '<p>Упакованный int — объект в куче, у которого указатель на тип говорит «Int32». Распаковка (IL <code>unbox</code>) проверяет, что в коробке <b>ровно</b> нужный тип, и копирует значение. Никаких числовых преобразований она не делает.</p><p>Поэтому <code>(long)(object)42</code> падает с <code>InvalidCastException</code>, хотя <code>(long)42</code> работает. Сначала распакуй в точный тип, потом преобразуй.</p>',
      code: 'object o = 42;          // в коробке Int32\nlong a = (long)o;       // InvalidCastException\nlong b = (long)(int)o;  // распаковать int, потом расширить\nint c = (int)(object)null!; // NullReferenceException',
      deep: '<p>Исключения из правила «ровно тот же тип» есть. Перечисление и его базовый целый тип распаковываются друг в друга: <code>(DayOfWeek)(object)1</code> сработает. Упакованный <code>int</code> можно распаковать в <code>int?</code>, а упакованного <code>int?</code> не бывает вовсе: при упаковке Nullable превращается либо в коробку с int, либо в null. Распаковка null в <code>int</code> даёт <code>NullReferenceException</code>, а в <code>int?</code> — просто null.</p>'
    },
    {
      t: 'choice',
      q: 'object o = 42; Какое выражение отработает без исключения?',
      options: ['(long)(int)o', '(long)o', '(short)o', '(double)o'],
      answer: 0,
      explain: 'Распаковать можно только в Int32. Дальше (long) — обычное расширяющее преобразование числа.'
    },
    {
      t: 'learn',
      title: 'Операторы преобразования не видны через object',
      body: '<p>Пользовательский <code>explicit operator</code> — это статический метод. Компилятор выбирает его по <b>статическим</b> типам: из Celsius в Fahrenheit — вызовет оператор. Но если значение лежит в <code>object</code>, компилятор видит «object → Fahrenheit» и вставляет обычную распаковку. Во время работы в коробке Celsius, а не Fahrenheit, — <code>InvalidCastException</code>.</p><p>Тот же сценарий ломает код при рефакторинге: параметр поменяли с <code>Celsius</code> на <code>object</code>, всё компилируется, а приведение начинает падать.</p>',
      code: 'var c = new Celsius(100);\nvar f1 = (Fahrenheit)c;          // оператор: 212\nobject o = c;\nvar f2 = (Fahrenheit)o;          // InvalidCastException\n\nreadonly record struct Celsius(double V);\nreadonly record struct Fahrenheit(double V)\n{\n    public static explicit operator Fahrenheit(Celsius c) => new(c.V * 9 / 5 + 32);\n}'
    },
    {
      t: 'multi',
      q: 'Какие строки бросят InvalidCastException? Отметь все.',
      options: ['object o = "hi"; int n = (int)o;', 'object o = 42; long l = (long)o;', 'object o = null; string s = (string)o;', 'object o = new Celsius(5); var f = (Fahrenheit)o;', 'object o = 42; int n = (int)o;'],
      answer: [0, 1, 3],
      explain: 'Строка не int; распаковка требует точного типа; оператор преобразования через object не вызывается. null проходит приведение к string, а int из коробки с int распаковывается.'
    },
    {
      t: 'blanks',
      q: 'Допиши проверки шаблонами',
      code: 'if (o is ___ m) m.Approve();\n\nif (input is not ___) Use(input);',
      tiles: ['Manager', 'null', 'as', 'default', 'object'],
      answer: ['Manager', 'null'],
      explain: 'is Manager m — проверка типа и переменная за один шаг. is not null — проверка ссылки без перегруженного !=.'
    }
  ]
};
