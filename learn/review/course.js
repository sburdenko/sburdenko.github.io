/** Курс «Ревью кода: найди баг»: ревью реального кода — русская версия. */
import u0l1 from './u0/l1-mutable-struct.js?v=202610101649';
import u0l2 from './u0/l2-singleton.js?v=202610101649';
import u0l3 from './u0/l3-loading.js?v=202610101649';
import u0l4 from './u0/l4-search-events.js?v=202610101649';
import u0boss from './u0/boss.js?v=202610101649';
import u1l1 from './u1/l1-closure-async.js?v=202610101649';
import u1l2 from './u1/l2-equality.js?v=202610101649';
import u1l3 from './u1/l3-collections.js?v=202610101649';
import u1l4 from './u1/l4-failures.js?v=202610101649';
import u1boss from './u1/boss.js?v=202610101649';
import u2l1 from './u2/l1-blocking.js?v=202610101649';
import u2l2 from './u2/l2-shared-state.js?v=202610101649';
import u2l3 from './u2/l3-background.js?v=202610101649';
import u2boss from './u2/boss.js?v=202610101649';
import u3l1 from './u3/l1-per-frame.js?v=202610101649';
import u3l2 from './u3/l2-materials.js?v=202610101649';
import u3l3 from './u3/l3-lifecycle.js?v=202610101649';
import u3l4 from './u3/l4-cache-sort.js?v=202610101649';
import u3boss from './u3/boss.js?v=202610101649';

export default {
  id: 'review',
  title: 'Ревью кода: найди баг',
  units: [
    {
      id: 'u0',
      title: 'Задача 1: ModelManager',
      blurb: 'Изменяемая структура и её копии, синглтон с побочными эффектами, незакрытый FileStream, HttpClient с .Result, Dictionary<object,…>, пустой catch и God-класс — всё, что прячется в «простом» менеджере модели.',
      lessons: [u0l1, u0l2, u0l3, u0l4, u0boss]
    },
    {
      id: 'u1',
      title: 'Задача 2: ClashService',
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
