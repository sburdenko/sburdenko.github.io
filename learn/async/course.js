/** Курс «Async/await до дна»: от ожидания до машины состояний, deadlock и async в Unity. */
import u1l1 from './u1/l1-waiting.js?v=202610100807';
import u1l2 from './u1/l2-task.js?v=202610100807';
import u1l3 from './u1/l3-no-thread.js?v=202610100807';
import u1boss from './u1/boss.js?v=202610100807';
import u2l1 from './u2/l1-first.js?v=202610100807';
import u2l2 from './u2/l2-returns.js?v=202610100807';
import u2l3 from './u2/l3-exceptions.js?v=202610100807';
import u2l4 from './u2/l4-whenall.js?v=202610100807';
import u2l5 from './u2/l5-cancel.js?v=202610100807';
import u2boss from './u2/boss.js?v=202610100807';
import u3l1 from './u3/l1-statemachine.js?v=202610100807';
import u3l2 from './u3/l2-awaiter.js?v=202610100807';
import u3l3 from './u3/l3-fastpath.js?v=202610100807';
import u3l4 from './u3/l4-context-flow.js?v=202610100807';
import u3boss from './u3/boss.js?v=202610100807';
import u4l1 from './u4/l1-sync-context.js?v=202610100807';
import u4l2 from './u4/l2-deadlock.js?v=202610100807';
import u4l3 from './u4/l3-configureawait.js?v=202610100807';
import u4l4 from './u4/l4-all-the-way.js?v=202610100807';
import u4l5 from './u4/l5-starvation.js?v=202610100807';
import u4boss from './u4/boss.js?v=202610100807';
import u5l1 from './u5/l1-fire-forget.js?v=202610100807';
import u5l2 from './u5/l2-lock.js?v=202610100807';
import u5l3 from './u5/l3-tcs.js?v=202610100807';
import u5l4 from './u5/l4-streams.js?v=202610100807';
import u5l5 from './u5/l5-channels.js?v=202610100807';
import u5boss from './u5/boss.js?v=202610100807';
import u6l1 from './u6/l1-aspnet.js?v=202610100807';
import u6l2 from './u6/l2-desktop.js?v=202610100807';
import u6l3 from './u6/l3-unity.js?v=202610100807';
import u6l4 from './u6/l4-coroutines.js?v=202610100807';
import u6boss from './u6/boss.js?v=202610100807';

export default {
  id: 'async',
  title: 'Async/await до дна',
  units: [
    {
      id: 'u1',
      title: 'Зачем асинхронность',
      blurb: 'Ожидание против работы, Task как обещание результата и главное открытие: пока идёт ввод-вывод, поток не нужен.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'async и await в деле',
      blurb: 'Первый async-метод, что возвращать, куда деваются исключения, WhenAll и WhenAny, отмена через CancellationToken.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2l5, u2boss]
    },
    {
      id: 'u3',
      title: 'Под капотом',
      blurb: 'Во что компилятор превращает async-метод: машина состояний, awaiter, быстрый путь и ValueTask, ExecutionContext и AsyncLocal.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Контекст и deadlock',
      blurb: 'SynchronizationContext, классический deadlock с .Result, ConfigureAwait(false), async до самого верха и голод пула потоков.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4l5, u4boss]
    },
    {
      id: 'u5',
      title: 'Ловушки и продвинутое',
      blurb: 'Fire-and-forget и async void, SemaphoreSlim вместо lock, TaskCompletionSource, IAsyncEnumerable и await using, Channel и Parallel.ForEachAsync.',
      lessons: [u5l1, u5l2, u5l3, u5l4, u5l5, u5boss]
    },
    {
      id: 'u6',
      title: 'Платформы',
      blurb: 'ASP.NET Core, WPF и WinForms, Unity: Awaitable, корутины, UniTask и отмена вместе с объектом. Финал курса.',
      lessons: [u6l1, u6l2, u6l3, u6l4, u6boss]
    }
  ]
};
