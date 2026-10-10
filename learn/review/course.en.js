/** Курс «Code review: find the bugs»: ревью реального кода — английская версия. */
import u1l1 from './u1/l1-closure-async.en.js?v=202610100807';
import u1l2 from './u1/l2-equality.en.js?v=202610100807';
import u1l3 from './u1/l3-collections.en.js?v=202610100807';
import u1l4 from './u1/l4-failures.en.js?v=202610100807';
import u1boss from './u1/boss.en.js?v=202610100807';
import u2l1 from './u2/l1-blocking.en.js?v=202610100807';
import u2l2 from './u2/l2-shared-state.en.js?v=202610100807';
import u2l3 from './u2/l3-background.en.js?v=202610100807';
import u2boss from './u2/boss.en.js?v=202610100807';
import u3l1 from './u3/l1-per-frame.en.js?v=202610100807';
import u3l2 from './u3/l2-materials.en.js?v=202610100807';
import u3l3 from './u3/l3-lifecycle.en.js?v=202610100807';
import u3l4 from './u3/l4-cache-sort.en.js?v=202610100807';
import u3boss from './u3/boss.en.js?v=202610100807';

export default {
  id: 'review',
  title: 'Code review: find the bugs',
  units: [
    {
      id: 'u1',
      title: 'Task 1: ClashService',
      blurb: 'A closure in a loop, async void, dictionary keys, collections, recursion, exceptions and Unity’s “fake null” — a dozen bugs in one clash-detection service.',
      lessons: [u1l1, u1l2, u1l3, u1l4, u1boss]
    },
    {
      id: 'u2',
      title: 'Task 3: TileLoader',
      blurb: 'Blocking inside async, a deadlock on Unity’s main thread, races and GetOrAdd, a timer the GC collects, and a tidy-looking cancellation that cancels nothing.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Task 4: ClashMarkers',
      blurb: 'Allocations in Update, leaked materials and broken batching, OnEnable without OnDisable, HasFlag, a comparator that throws, and a cache that is LRU in name only.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    }
  ]
};
