/** Курс «Ревью кода: найди баг»: ревью реального кода — русская версия. */
import u1l1 from './u1/l1-closure-async.js?v=202610100807';
import u1l2 from './u1/l2-equality.js?v=202610100807';
import u1l3 from './u1/l3-collections.js?v=202610100807';
import u1l4 from './u1/l4-failures.js?v=202610100807';
import u1boss from './u1/boss.js?v=202610100807';
import u2l1 from './u2/l1-blocking.js?v=202610100807';
import u2l2 from './u2/l2-shared-state.js?v=202610100807';
import u2l3 from './u2/l3-background.js?v=202610100807';
import u2boss from './u2/boss.js?v=202610100807';
import u3l1 from './u3/l1-per-frame.js?v=202610100807';
import u3l2 from './u3/l2-materials.js?v=202610100807';
import u3l3 from './u3/l3-lifecycle.js?v=202610100807';
import u3l4 from './u3/l4-cache-sort.js?v=202610100807';
import u3boss from './u3/boss.js?v=202610100807';

export default {
  id: 'review',
  title: 'Ревью кода: найди баг',
  units: [
    {
      id: 'u1',
      title: 'Задача 1: ClashService',
      blurb: 'Замыкание в цикле, async void, ключи словаря, коллекции, рекурсия, исключения и «ненастоящий null» Unity — десяток багов в одном сервисе поиска коллизий.',
      lessons: [u1l1, u1l2, u1l3, u1l4, u1boss]
    },
    {
      id: 'u2',
      title: 'Задача 3: TileLoader',
      blurb: 'Блокировки внутри async, дедлок на главном потоке Unity, гонки и GetOrAdd, таймер, который собирает GC, и «аккуратная» отмена, которая ничего не отменяет.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Задача 4: ClashMarkers',
      blurb: 'Аллокации в Update, утечка материалов и сломанный батчинг, OnEnable без OnDisable, HasFlag, компаратор, который кидает исключение, и кэш, который только называется LRU.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    }
  ]
};
