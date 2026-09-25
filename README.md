# Полка кассет

Интерактивные конспекты для собеседования в VHS-эстетике. Каждая «кассета» — одна тема,
разобранная до конца: короткая теория, живые стенды вместо картинок и блок вопросов.
Чистый HTML, CSS и ES-модули, без сборки и зависимостей.

Сайт двуязычный: по умолчанию английский, переключатель EN/RU — в строке состояния
наверху страницы. Выбор запоминается в localStorage и работает для всех кассет сразу;
язык можно задать и ссылкой — `?lang=ru`.

Сайт: https://sburdenko.github.io

## Кассеты

| № | Тема | Что внутри |
|---|------|-----------|
| 01 | [Батчинг в Unity](./unity-rendering/) | Static и dynamic batching, SRP Batcher, GPU instancing, GPU Resident Drawer. Пульт кадра с изометрической сценой, лента команд CPU → GPU, таблица «одна сцена — все техники», стенды к каждой главе. |
| 02 | [Обход графа: BFS и DFS](./algorithms/bfs-dfs/) | Очередь против стека на двумерном массиве и на графе: генерация данных по seed, пошаговая перемотка, фронт, дерево обхода, кратчайший путь и гонка двух обходов в одном лабиринте. |

| 03 | [Two Pointers](./algorithms/two-pointers/) | Opposite pointers, fast & slow / Floyd, and LeetCode 287. Rewindable array and linked-list examples, highlighted pseudocode, C# templates, and interview questions. This lesson is in English. |
| 04 | [URP Field Guide](./unity-urp/) | Глава за главой по книге Unity о URP (Unity 6): где живёт каждая настройка, выбор рендерера по жёстким ограничениям, MSAA, GPU Resident Drawer, тени и атлас теней, режимы смешанного света, Rendering Layers, probes против APV и протечки, эффекты, пять шейдеров из книги, Render Objects, Render Graph и слияние native passes, volumes, STP, прогрев PSO, диагностика, вопросы. Ошибки книги помечены «Сверено с книгой». |
| 05 | [Паттерны и SOLID](./unity-patterns/) | Книга Unity «Level up your code with design patterns and SOLID»: цена изменений по SOLID, factory, семантика `ObjectPool<T>`, singleton при загрузке сцен, command с undo/redo, state machine, observer и забытые подписки, MVP против MVVM, strategy, память flyweight, dirty flag, выбор паттерна и вопросы. |
| 06 | [Паттерны алгоритмов](./algorithms/patterns/) | Двенадцать паттернов для собеседования: HashMap/HashSet, Two Pointers, Sliding Window, Binary Search, монотонный стек, fast & slow, DFS/BFS, деревья, куча, backtracking, greedy, DP. Для каждого — признаки в условии, каркас на C#, стенд с перемоткой и три задачи LeetCode с разными вариантами приёма. Two Pointers и BFS/DFS ссылаются на кассеты 02 и 03 и дополняют их. |

## Структура

```
index.html                 полка с кассетами
assets/vhs.css             общая дизайн-система (VHS)
assets/vhs.js              общие утилиты, шум, строка состояния
assets/rand.js             детерминированный ГПСЧ
assets/i18n.js             локализация: t(), data-i18n, переключатель языка
assets/i18n-common.js      общие строки (строка состояния, перемотка)
assets/i18n-hub.js         строки полки
assets/lab.js  assets/code.js   общие помощники стендов и подсветка C#/HLSL
unity-urp/  unity-patterns/
  model-*.js               чистые модели стендов (без DOM), покрыты тестами
  lab-*.js                 стенды по главам
  i18n-*.js  snippets.js   тексты глав { en, ru } и код из книг
unity-rendering/
  model.js                 модель батчинга: сцена, правила, стоимость кадра (без DOM)
  scene.js                 изометрический квартал на canvas
  deck.js                  пульт кадра, лента батчей, таблица сравнения
  lanes.js  minis.js       заставка и стенды к главам
  i18n.js                  все тексты кассеты: { ключ: { en, ru } }
algorithms/bfs-dfs/
  traversal.js             BFS, DFS, генерация сетки и графа, лента событий (без DOM)
  player.js                плеер ленты: шаг, перемотка, автопрогон
  grid-view.js graph-view.js   отрисовка на canvas
  grid-deck.js graph-deck.js race.js   пульты и гонка
  i18n.js                  все тексты кассеты: { ключ: { en, ru } }
algorithms/patterns/
  model-linear.js model-structures.js   трассы 12 стендов (без DOM)
  view-kit.js views-*.js   SVG-отрисовка стендов, чистые функции
  rigs.js problems.js      входные данные стендов, задачи и решения на C#
  i18n-*.js                тексты глав { en, ru }; плеер берётся из bfs-dfs/player.js
tests/                     node --test, проверяют чистые модели
```

Вся логика вынесена в модули без DOM, поэтому её можно проверять тестами, а не глазами.
Тексты тоже отделены от кода: модели возвращают ключи (`why.dynTooBig`, `brk.material`),
а страница подставляет фразу на текущем языке. Тесты следят, чтобы у каждой строки были
оба языка и чтобы ни один ключ из разметки и кода не потерялся.

## Запуск и проверка

```sh
python3 -m http.server 8000   # или любой статический сервер
npm test                      # node --test tests/*.test.js
npm run stamp                 # перед коммитом: обновить метки ?v= у js и css
```

`npm run stamp` проставляет всем внутренним ссылкам на модули и стили одну общую
метку `?v=<дата>`. GitHub Pages отдаёт файлы с `max-age=600`, и без метки браузер
может смешать свежий HTML со старым модулем — тогда граф импортов не собирается и
страница молча остаётся пустой. Общая метка меняет все адреса разом, так что смешать
версии невозможно. На случай любой другой поломки в каждой странице сидит сторож:
если скрипты не загрузились, сверху появляется красная плашка с причиной.

Файлы подключаются как ES-модули, поэтому открывать `index.html` по `file://` не получится —
нужен локальный сервер. Сборка не требуется: что лежит в репозитории, то и раздаёт GitHub Pages.

## Про модели

Это учебные визуализации, а не бенчмарки. Миллисекунды и байты на кассете про батчинг — условные
коэффициенты, которые позволяют сравнивать техники между собой; реальные ответы дают Unity Profiler
и Frame Debugger. Алгоритмы BFS и DFS, наоборот, настоящие: страница показывает ровно те события,
которые порождает код в `traversal.js`.
