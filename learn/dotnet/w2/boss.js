/** Финал раздела 2: типы и память вперемешку. */
export default {
  id: 'dotnet.w2.boss',
  title: 'Финал: где лежат данные',
  sub: 'Всё про типы и память — проверь себя',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Size — структура. Чему равно a.W?',
      code: 'var a = new Size(2, 3);\nvar b = a;\nb.W = 10;',
      options: ['2', '10', '0'],
      answer: 0,
      explain: 'Структура копируется целиком: b — независимая копия.'
    },
    {
      t: 'choice',
      q: 'А если Size — класс?',
      code: 'var a = new Size(2, 3);\nvar b = a;\nb.W = 10;',
      options: ['10', '2', '0'],
      answer: 0,
      explain: 'У класса копируется ссылка: a и b — один объект.'
    },
    {
      t: 'multi',
      q: 'Что окажется в куче? Отметь все.',
      options: ['new List<int>()', 'Локальная переменная int', 'Поле int внутри объекта класса', 'object o = 3.14;', 'bool flag = true;'],
      answer: [0, 2, 3],
      explain: 'Объекты классов, всё внутри них и коробки при упаковке — в куче. Локальные значимые переменные — в стеке.'
    },
    {
      t: 'choice',
      q: 'Point — класс, p = (5, 5). Что будет с p.X после вызова?',
      code: 'static void Reset(Point q) => q = new Point(0, 0);\nReset(p);',
      options: ['Останется 5', 'Станет 0', 'NullReferenceException'],
      answer: 0,
      explain: 'Метод заменил свою копию ссылки. Без ref переменная p не меняется.'
    },
    {
      t: 'choice',
      q: 'Что произойдёт?',
      code: 'object o = 1;\ndouble d = (double)o;',
      options: ['InvalidCastException', 'd = 1.0', 'Ошибка компиляции'],
      answer: 0,
      explain: 'В коробке int. Распаковывать можно только в int, а потом уже приводить: (double)(int)o.'
    },
    {
      t: 'tapline',
      q: 'Какая строка ничего не меняет?',
      code: 'string s = "hi";\ns.ToUpper();\ns = s + "!";\nConsole.WriteLine(s);',
      answer: 1,
      explain: 'ToUpper возвращает новую строку, а результат выброшен. Программа выведет «hi!».'
    },
    {
      t: 'choice',
      q: 'Массив из 100 элементов класса Point, все заполнены. Сколько объектов в куче?',
      options: ['101', '100', '1'],
      answer: 0,
      explain: 'Сам массив и 100 отдельных точек.'
    },
    {
      t: 'choice',
      q: 'Чему равно n?',
      code: 'static void Inc(ref int x) => x++;\nint n = 1;\nInc(ref n);',
      options: ['2', '1', '0'],
      answer: 0,
      explain: 'С ref метод работает с самой переменной n.'
    },
    {
      t: 'choice',
      q: 'Метод вернул управление. Что исчезло сразу?',
      options: ['Его кадр стека со всеми локальными переменными', 'Все объекты, которые он создал', 'Ничего, всё уберёт сборщик мусора'],
      answer: 0,
      explain: 'Кадр выбрасывается мгновенно. Объекты в куче живут, пока на них ссылаются.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['struct', 'Копируется целиком при присваивании'],
        ['class', 'Копируется только ссылка'],
        ['string', 'Ссылочный, но неизменяемый'],
        ['object o = 5', 'Упаковка: коробка в куче']
      ]
    },
    {
      t: 'blanks',
      q: 'Передай большую структуру без копирования и без права менять',
      code: 'static double Length(___ Vector3 v) =>\n    Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);',
      lang: 'cs',
      tiles: ['in', 'ref', 'out', 'params'],
      answer: ['in'],
      explain: 'in — по ссылке и только для чтения.'
    }
  ]
};
