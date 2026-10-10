/** Course "Async/await in depth": from waiting to the state machine, deadlocks and async in Unity (English version). */
import u1l1 from './u1/l1-waiting.en.js?v=202610100752';
import u1l2 from './u1/l2-task.en.js?v=202610100752';
import u1l3 from './u1/l3-no-thread.en.js?v=202610100752';
import u1boss from './u1/boss.en.js?v=202610100752';
import u2l1 from './u2/l1-first.en.js?v=202610100752';
import u2l2 from './u2/l2-returns.en.js?v=202610100752';
import u2l3 from './u2/l3-exceptions.en.js?v=202610100752';
import u2l4 from './u2/l4-whenall.en.js?v=202610100752';
import u2l5 from './u2/l5-cancel.en.js?v=202610100752';
import u2boss from './u2/boss.en.js?v=202610100752';
import u3l1 from './u3/l1-statemachine.en.js?v=202610100752';
import u3l2 from './u3/l2-awaiter.en.js?v=202610100752';
import u3l3 from './u3/l3-fastpath.en.js?v=202610100752';
import u3l4 from './u3/l4-context-flow.en.js?v=202610100752';
import u3boss from './u3/boss.en.js?v=202610100752';
import u4l1 from './u4/l1-sync-context.en.js?v=202610100752';
import u4l2 from './u4/l2-deadlock.en.js?v=202610100752';
import u4l3 from './u4/l3-configureawait.en.js?v=202610100752';
import u4l4 from './u4/l4-all-the-way.en.js?v=202610100752';
import u4l5 from './u4/l5-starvation.en.js?v=202610100752';
import u4boss from './u4/boss.en.js?v=202610100752';
import u5l1 from './u5/l1-fire-forget.en.js?v=202610100752';
import u5l2 from './u5/l2-lock.en.js?v=202610100752';
import u5l3 from './u5/l3-tcs.en.js?v=202610100752';
import u5l4 from './u5/l4-streams.en.js?v=202610100752';
import u5l5 from './u5/l5-channels.en.js?v=202610100752';
import u5boss from './u5/boss.en.js?v=202610100752';
import u6l1 from './u6/l1-aspnet.en.js?v=202610100752';
import u6l2 from './u6/l2-desktop.en.js?v=202610100752';
import u6l3 from './u6/l3-unity.en.js?v=202610100752';
import u6l4 from './u6/l4-coroutines.en.js?v=202610100752';
import u6boss from './u6/boss.en.js?v=202610100752';

export default {
  id: 'async',
  title: 'Async/await in depth',
  units: [
    {
      id: 'u1',
      title: 'Why async',
      blurb: 'Waiting vs. working, Task as a promise of a result, and the big reveal: while I/O is in flight, no thread is needed.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'async and await in action',
      blurb: 'Your first async method, what to return, where exceptions go, WhenAll and WhenAny, and cancellation with CancellationToken.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2l5, u2boss]
    },
    {
      id: 'u3',
      title: 'Under the hood',
      blurb: 'What the compiler turns an async method into: the state machine, the awaiter, the fast path and ValueTask, ExecutionContext and AsyncLocal.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Context and deadlock',
      blurb: 'SynchronizationContext, the classic .Result deadlock, ConfigureAwait(false), async all the way and thread-pool starvation.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4l5, u4boss]
    },
    {
      id: 'u5',
      title: 'Pitfalls and advanced topics',
      blurb: 'Fire-and-forget and async void, SemaphoreSlim instead of lock, TaskCompletionSource, IAsyncEnumerable and await using, Channel and Parallel.ForEachAsync.',
      lessons: [u5l1, u5l2, u5l3, u5l4, u5l5, u5boss]
    },
    {
      id: 'u6',
      title: 'Platforms',
      blurb: 'ASP.NET Core, WPF and WinForms, Unity: Awaitable, coroutines, UniTask and cancellation tied to the object. The course final.',
      lessons: [u6l1, u6l2, u6l3, u6l4, u6boss]
    }
  ]
};
