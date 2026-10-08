/** Финал раздела 3 курса async/await: под капотом. */
export default {
  id: 'as.u3.boss',
  title: 'Финал: под капотом',
  sub: 'Машина состояний, awaiter и контексты',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'statemachine',
      task: 'Пройди машину состояний в обоих режимах: с ожиданием и с готовыми ответами.',
      goal: 'both',
      solve: [...Array(13).fill('step'), 'cached', ...Array(9).fill('step')]
    },
    {
      t: 'choice',
      q: 'Что хранит поле state?',
      options: ['Номер await, на котором метод остановился', 'Результат метода', 'Номер потока'],
      answer: 0,
      explain: 'По нему switch в MoveNext прыгает в нужное место.'
    },
    {
      t: 'blanks',
      q: 'Методы awaiter-паттерна',
      code: 'var aw = x.GetAwaiter();\nif (!aw.IsCompleted) aw.___(continuation);\nvar r = aw.___();',
      lang: 'cs',
      tiles: ['OnCompleted', 'GetResult', 'Wait', 'Start'],
      answer: ['OnCompleted', 'GetResult'],
      explain: 'Подписка на завершение и получение результата.'
    },
    {
      t: 'choice',
      q: 'Когда async-метод не создаёт объект в куче?',
      options: ['Когда ни один await не приостановился', 'Никогда', 'Когда метод возвращает void'],
      answer: 0,
      explain: 'Машина-структура остаётся на стеке.'
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['AsyncLocal переживает смену потока после await', 'Builder вызывает SetException при исключении', 'ValueTask можно ждать много раз', 'Task.Yield гарантирует приостановку'],
      answer: [0, 1, 3],
      explain: 'ValueTask — одноразовый.'
    },
    {
      t: 'choice',
      q: 'Отключает ли ConfigureAwait(false) перенос AsyncLocal?',
      options: ['Нет: он про SynchronizationContext, а ExecutionContext переносится всегда', 'Да', 'Только в консоли'],
      answer: 0,
      explain: 'Это два независимых механизма.'
    },
    {
      t: 'order',
      q: 'Жизнь async-метода с одним await',
      items: ['MoveNext №1 работает до await', 'Awaiter не готов — state запомнен, метод вышел', 'Задача завершилась — вызван MoveNext №2', 'GetResult и остаток метода', 'SetResult завершает задачу'],
      explain: 'Два вызова MoveNext, одна приостановка.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['MoveNext', 'Тело метода, разрезанное по await'],
        ['GetAwaiter', 'Ключ к await для любого типа'],
        ['ExecutionContext', 'Едет вместе с продолжением'],
        ['PoolingAsyncValueTaskMethodBuilder', 'Пулинг для ValueTask-методов']
      ]
    }
  ]
};
