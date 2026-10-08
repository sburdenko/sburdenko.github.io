/** Финальное испытание раздела: всё вперемешку, по одной ловушке из каждого урока. */
export default {
  id: 'dotnet.w1.boss',
  title: 'Финал: путь байта',
  sub: 'Всё вперемешку — проверь себя',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'order',
      q: 'Весь путь .NET-программы',
      items: ['Код на C#', 'Компилятор', 'CIL и метаданные в .dll', 'Хост запускает CLR', 'JIT при первом вызове', 'Машинный код выполняется'],
      explain: 'Managed execution от начала до конца.'
    },
    {
      t: 'blanks',
      q: 'Собери CIL для return (a + b) * c;',
      code: 'ldarg.0\nldarg.1\n___\nldarg.2\n___\nret',
      lang: 'il',
      tiles: ['mul', 'add', 'sub', 'ldarg.0'],
      answer: ['add', 'mul'],
      explain: 'Скобки первыми: a + b → add. Потом кладём c и умножаем → mul.'
    },
    {
      t: 'choice',
      q: 'Hello.dll и hello, собранный через Native AOT, скопировали на компьютер без .NET. Что запустится?',
      options: ['Только Native AOT', 'Оба', 'Только Hello.dll', 'Ничего'],
      answer: 0,
      explain: 'Native AOT — самостоятельный нативный файл. Hello.dll нужен CLR, а его нет.'
    },
    {
      t: 'tapline',
      q: 'Где описан метод, объявленный в этой же сборке?',
      code: 'AssemblyRef System.Console\nMemberRef   System.Console::WriteLine(int32)\nTypeDef     Program\nMethodDef   Add(int32, int32) : int32',
      lang: 'plain',
      answer: 3,
      explain: 'MethodDef — свои методы. MemberRef — ссылки на чужие.'
    },
    {
      t: 'choice',
      q: 'Сколько раз JIT скомпилирует метод, который ни разу не вызвали?',
      options: ['0', '1', '2'],
      answer: 0,
      explain: 'JIT работает только по требованию. Невызванный метод остаётся заглушкой.'
    },
    {
      t: 'multi',
      q: 'Что лежит в обычной .NET-сборке? Отметь все.',
      options: ['CIL', 'Метаданные', 'PE-заголовок', 'Машинный код для всех процессоров сразу', 'Исходный текст на C#'],
      answer: [0, 1, 2],
      explain: 'Машинного кода в обычной сборке нет — его сделает JIT. Исходников тоже нет.'
    },
    {
      t: 'choice',
      q: 'Публичный метод библиотеки на C# принимает uint. Её хотят вызывать из языка без беззнаковых чисел. Что предупредило бы заранее?',
      options: ['[assembly: CLSCompliant(true)] — компилятор выдал бы предупреждение', 'JIT при первом вызове', 'Сборщик мусора', 'Ничего, CLR сама сконвертирует'],
      answer: 0,
      explain: 'CLS — правила для публичного API, а CLSCompliant включает их проверку.'
    },
    {
      t: 'choice',
      q: 'Что есть только в .NET Framework?',
      options: ['NGen', 'ReadyToRun', 'Native AOT', 'JIT'],
      answer: 0,
      explain: 'В .NET 5+ вместо NGen используют ReadyToRun и Native AOT.'
    },
    {
      t: 'choice',
      q: 'Что произойдёт?',
      code: 'object o = 42;\nstring s = (string)o;',
      options: ['InvalidCastException', 's станет "42"', 'Код не скомпилируется', 's станет null'],
      answer: 0,
      explain: 'Приведение типа — не конвертация. CLR проверит, что в o число, а не строка, и бросит исключение. Строку даст o.ToString().',
      wrong: { 1: 'Для этого нужен o.ToString(). Приведение (string) только проверяет тип.' }
    },
    {
      t: 'match',
      q: 'Кто это делает?',
      pairs: [
        ['Сборщик мусора', 'Освобождает ненужную память'],
        ['JIT', 'Переводит CIL в машинный код'],
        ['hostfxr', 'Выбирает версию .NET при запуске'],
        ['Компилятор C#', 'Переводит C# в CIL']
      ]
    },
    {
      t: 'choice',
      q: 'Почему один и тот же Hello.dll работает и на x64, и на ARM64?',
      options: ['Внутри CIL, а JIT есть под каждый процессор', 'Внутри машинный код для обоих', 'ARM64 умеет выполнять x64-код', 'Это не так'],
      answer: 0,
      explain: 'Главная идея урока 1: CIL общий, машинный код получается на месте.'
    },
    {
      t: 'choice',
      q: 'Многоуровневый JIT включён. Метод вызвали 5 раз. В каком он состоянии?',
      options: ['Tier 0 — до порога «горячего» метода ещё далеко', 'Tier 1', 'Ещё заглушка', 'Native AOT'],
      answer: 0,
      explain: 'Tier 0 появился на первом вызове. Tier 1 — после примерно 30 вызовов.'
    }
  ]
};
