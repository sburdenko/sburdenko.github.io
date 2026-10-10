/** Async, раздел 1, урок 2: Task — обещание результата. */
export default {
  id: 'as.u1.l2',
  title: 'Task — обещание результата',
  sub: 'Квитанция вместо готового ответа',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Task — это квитанция',
      body: '<p><code>Task</code> — объект «работа, которая закончится позже». Как квитанция из химчистки: вещи ещё не готовы, но у тебя бумажка, по которой их потом выдадут.</p><p><code>Task&lt;string&gt;</code> — квитанция, по которой выдадут строку.</p>'
    },
    {
      t: 'learn',
      title: 'Получить и забрать',
      body: '<p>Задача может быть в работе, завершиться успешно, с ошибкой или быть отменённой.</p>',
      code: 'Task<string> t = http.GetStringAsync(url);   // квитанция\n// … можно заняться другим …\nstring html = await t;                       // забрать результат',
      deep: 'TaskStatus: Created, WaitingForActivation, WaitingToRun, Running, WaitingForChildrenToComplete, RanToCompletion, Canceled, Faulted. Задачи от async-методов и ввода-вывода обычно в WaitingForActivation — они не «запущены» ни на каком потоке, их кто-то завершит снаружи.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Task', 'Работа, которая закончится позже'],
        ['Task<int>', 'То же, но с результатом int'],
        ['await', 'Дождаться, не блокируя поток'],
        ['.Result', 'Дождаться, заблокировав поток']
      ]
    },
    {
      t: 'choice',
      q: 'Метод вернул Task<string>. Где строка?',
      options: ['Её ещё может не быть: строку выдаст await, когда задача завершится', 'Внутри Task сразу', 'В поле Task.Text'],
      answer: 0,
      explain: 'Задача — обещание. Результат появится, когда операция закончится.'
    },
    {
      t: 'learn',
      title: 'Task.Run — для вычислений',
      body: '<p><code>Task.Run(() => …)</code> отдаёт работу потоку из пула. Это нужно для тяжёлых вычислений, чтобы не грузить главный поток.</p><p>Для ввода-вывода Task.Run не нужен: GetStringAsync и так не занимает поток.</p>',
      deep: 'Task.Run(async () => …) правильно разворачивает вложенную задачу. А Task.Factory.StartNew с async-лямбдой вернёт Task<Task>, и await подождёт только запуск — частая ошибка.'
    },
    {
      t: 'choice',
      q: 'Нужно сжать большую картинку и не заморозить окно. Что сделать?',
      options: ['await Task.Run(() => Compress(img))', 'Вызвать Compress(img) прямо в обработчике', 'Вызвать Compress(img), а потом Thread.Sleep(0)'],
      answer: 0,
      explain: 'Сжатие — работа процессора. Task.Run унесёт её в пул, а await вернёт результат в UI-поток.'
    },
    {
      t: 'choice',
      q: 'Нужно ли оборачивать http.GetStringAsync(url) в Task.Run?',
      options: ['Нет: запрос и так не держит поток, Task.Run лишь займёт поток пула', 'Да, иначе он заблокирует окно', 'Да, так быстрее'],
      answer: 0,
      explain: 'Асинхронный ввод-вывод уже не блокирует. Task.Run поверх — лишняя работа.'
    },
    {
      t: 'multi',
      q: 'Чем может закончиться задача? Отметь все.',
      options: ['Успехом с результатом', 'Ошибкой (Faulted)', 'Отменой (Canceled)', 'Паузой до следующего запуска'],
      answer: [0, 1, 2],
      explain: 'Это три конечных состояния. Поставить задачу на паузу нельзя.'
    },
    {
      t: 'blanks',
      q: 'Дождись результата, не блокируя поток',
      code: 'string html = ___ http.GetStringAsync(url);',
      lang: 'cs',
      tiles: ['await', 'async', 'Task', 'lock'],
      answer: ['await'],
      explain: 'await «распаковывает» Task<string> в string.'
    }
  ]
};
