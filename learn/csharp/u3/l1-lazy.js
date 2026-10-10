/** C# глубже, раздел 3, урок 1: ленивое выполнение. */
export default {
  id: 'cs.u3.l1',
  title: 'LINQ ленивый',
  sub: 'Запрос — это рецепт, а не результат',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Описать ≠ выполнить',
      body: '<p>Строка <code>var q = numbers.Where(…).Select(…)</code> ничего не считает. Она только собирает цепочку. Работа начнётся, когда кто-то начнёт перебирать результат: foreach, ToList, Count, First…</p>'
    },
    {
      t: 'rig', rig: 'linq',
      task: 'Пройди запрос по шагам. Посмотри, в каком порядке вызываются Where и Select и где запрос останавливается.',
      lock: ['orderBy', 'toList', 'twice'],
      goal: { max: { read: 4 } },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Почему из шести чисел прочитали только четыре?',
      options: ['Take(2) получил два элемента и перестал просить следующие', 'Where отбросил последние два', 'LINQ читает только половину'],
      answer: 0,
      explain: 'Цепочка тянет элементы по одному. Хватило — дальше не тянет.'
    },
    {
      t: 'choice',
      q: 'В каком порядке идут вызовы?',
      options: ['Элемент проходит всю цепочку, потом берётся следующий: Where(1), Where(5), Select(5)…', 'Сначала Where для всех, потом Select для всех', 'В случайном'],
      answer: 0,
      explain: 'Это и называют потоковой (streaming) обработкой.'
    },
    {
      t: 'learn',
      title: 'Ловушка: данные поменялись',
      body: '<p>Раз запрос выполняется при переборе, он видит данные <b>на момент перебора</b>, а не на момент описания.</p>',
      code: 'var list = new List<int> { 1, 2, 3 };\nvar big = list.Where(x => x > 1);\nlist.Add(10);\nConsole.WriteLine(big.Count());   // 3, а не 2'
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'var list = new List<int> { 1, 2, 3 };\nvar big = list.Where(x => x > 1);\nlist.Add(10);\nConsole.WriteLine(big.Count());',
      options: ['3', '2', '4'],
      answer: 0,
      explain: '2, 3 и 10 — запрос выполнился уже после Add.'
    },
    {
      t: 'multi',
      q: 'Что запускает выполнение запроса? Отметь все.',
      options: ['foreach', 'ToList()', 'Count()', 'Where(...)', 'Select(...)'],
      answer: [0, 1, 2],
      explain: 'Where и Select только добавляют звенья в цепочку.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Where', 'Фильтр, лениво'],
        ['Select', 'Преобразование, лениво'],
        ['Take', 'Остановиться после N'],
        ['ToList', 'Выполнить сейчас и сохранить']
      ]
    }
  ]
};
