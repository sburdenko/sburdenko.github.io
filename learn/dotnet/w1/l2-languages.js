/** Урок 2: много языков — один .NET; синтаксис задаёт компилятор; CLS. */
export default {
  id: 'dotnet.w1.l2',
  title: 'Много языков — один .NET',
  sub: 'Компиляторы, CIL и общий словарь CLS',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Писать для .NET можно на разных языках',
      body: '<p>C#, F#, Visual Basic и другие. У каждого свой компилятор, но все они выдают одно и то же: <b>CIL</b> и <b>метаданные</b> — описание классов и методов.</p><p>Поэтому библиотеку, написанную на F#, можно спокойно вызвать из программы на C#.</p>',
      flow: ['C# · F# · VB', 'Свой компилятор', 'CIL + метаданные', 'CLR']
    },
    {
      t: 'learn',
      title: 'Один метод — три языка',
      body: '<p>Выглядит по-разному, а CIL у C# и F# получается одинаковым: <code>ldarg.0</code>, <code>ldarg.1</code>, <code>add</code>, <code>ret</code>. Что значат эти строки, разберём в следующем уроке.</p>',
      code: '// C#\nstatic int Add(int a, int b) => a + b;\n\n// F#\nlet add a b = a + b\n\n// Visual Basic\nFunction Add(a As Integer, b As Integer) As Integer\n    Return a + b\nEnd Function'
    },
    {
      t: 'choice',
      q: 'Кто решает, как пишется код: где ставить точку с запятой, как объявить метод?',
      options: ['Компилятор языка', 'CLR', 'Процессор', 'Операционная система'],
      answer: 0,
      explain: 'Синтаксис — дело компилятора. CLR видит только CIL и не знает, на каком языке ты писал.',
      wrong: { 1: 'CLR получает уже готовый CIL. Точек с запятой там нет.' }
    },
    {
      t: 'learn',
      title: 'Один и тот же «+», разный смысл',
      body: '<p>Visual Basic по умолчанию проверяет переполнение: его <code>+</code> превращается в CIL-команду <code>add.ovf</code> — сложение с проверкой. Если число не влезает в <code>int</code>, будет ошибка <code>OverflowException</code>.</p><p>C# по умолчанию не проверяет: число молча «переворачивается». Смысл плюса определил компилятор, а не CLR.</p>',
      code: 'int x = int.MaxValue;   // 2 147 483 647\nConsole.WriteLine(x + 1);',
      deep: 'В C# проверку включают словом <code>checked</code> или свойством проекта <code>&lt;CheckForOverflowUnderflow&gt;</code>. В VB её выключают опцией «Remove integer overflow checks». Константное выражение вроде <code>int.MaxValue + 1</code> C# не пропустит ещё при компиляции (CS0220), поэтому в примере переменная.'
    },
    {
      t: 'choice',
      q: 'Что выведет этот код на C# с настройками по умолчанию?',
      code: 'int x = int.MaxValue;\nConsole.WriteLine(x + 1);',
      options: ['-2147483648', '2147483648', 'Ошибку OverflowException', '0'],
      answer: 0,
      explain: 'Без checked C# не проверяет переполнение: старший бит переворачивается, и получается самое маленькое int.',
      wrong: { 1: 'Такое число не помещается в int — максимум 2 147 483 647.', 2: 'Так поступил бы Visual Basic. C# по умолчанию не проверяет.' }
    },
    {
      t: 'learn',
      title: 'CLS — общий словарь языков',
      body: '<p>У языков разные возможности. В C# есть беззнаковые числа <code>uint</code>, а в некоторых .NET-языках их нет.</p><p>Чтобы библиотекой мог пользоваться любой язык, есть <b>CLS</b> — Common Language Specification: правила того, что можно показывать наружу. Атрибут <code>[CLSCompliant(true)]</code> просит компилятор эти правила проверять.</p>'
    },
    {
      t: 'tapline',
      q: 'Сборка помечена [assembly: CLSCompliant(true)]. На какую строку компилятор выдаст предупреждение?',
      code: 'public class Counter\n{\n    private uint _hidden;\n    public int Total { get; set; }\n    public uint Count { get; set; }\n    public string Name { get; set; }\n}',
      answer: 4,
      explain: 'uint не входит в CLS, а Count — публичное свойство. Приватное поле _hidden можно: CLS касается только того, что видно снаружи сборки.'
    },
    {
      t: 'choice',
      q: 'В публичном классе есть методы Run() и run(). Чем это плохо с точки зрения CLS?',
      options: ['Visual Basic не различает регистр и не поймёт, какой из них вызвать', 'Похожие имена замедляют программу', 'CLR запрещает такие имена', 'Ничем'],
      answer: 0,
      explain: 'Имена, которые отличаются только регистром, нарушают CLS: для языков без учёта регистра это одно и то же имя.',
      wrong: { 2: 'CLR не против — это ограничение для совместимости языков, а не запрет рантайма.' }
    },
    {
      t: 'match',
      q: 'Соедини язык и его компилятор',
      pairs: [
        ['C#', 'csc (Roslyn)'],
        ['F#', 'fsc'],
        ['Visual Basic', 'vbc'],
        ['CLR', 'Запускает результат любого из них']
      ]
    }
  ]
};
