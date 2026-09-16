/** Словарь полки с кассетами. */
export const HUB = {
  'page.title': { en: 'Tape shelf — interactive notes', ru: 'Полка кассет — интерактивные конспекты' },
  'page.desc': {
    en: 'Interactive interview notes: batching in Unity 6 and graph traversal with BFS and DFS. Everything can be clicked, tweaked and played step by step.',
    ru: 'Интерактивные разборы для собеседования: батчинг в Unity 6 и обход графа BFS/DFS. Всё можно щёлкать, крутить и проигрывать по шагам.'
  },
  'hub.eyebrow': { en: 'Interactive notes · taken apart step by step', ru: 'Интерактивные конспекты · разбираем по шагам' },
  'hub.title': { en: 'The shelf', ru: 'Полка' },
  'hub.subtitle': { en: 'tapes you can click', ru: 'кассеты, которые можно щёлкать' },
  'hub.lede': {
    en: 'Every tape is one topic taken all the way through: short paragraphs of theory, live rigs instead of pictures, and the block of questions you usually get asked at an interview. Nothing to install — everything is computed right in the browser.',
    ru: 'Каждая кассета — одна тема, разобранная до конца: теория короткими абзацами, живые стенды вместо картинок и блок вопросов, которые обычно задают на собеседовании. Ничего не нужно устанавливать — всё считается прямо в браузере.'
  },
  'hub.go': { en: 'INSERT TAPE ►', ru: 'ВСТАВИТЬ КАССЕТУ ►' },
  'hub.tape1Title': { en: 'Batching in Unity', ru: 'Батчинг в Unity' },
  'hub.tape1Desc': {
    en: 'Static and dynamic batching, the SRP Batcher, GPU instancing and the GPU Resident Drawer. A frame deck with a live scene, the CPU → GPU command tape and a “one scene, every technique” table.',
    ru: 'Static и dynamic batching, SRP Batcher, GPU instancing и GPU Resident Drawer. Пульт кадра с живой сценой, лента команд CPU → GPU и таблица «одна сцена — все техники».'
  },
  'hub.tape1Tags': {
    en: '<span>Rendering</span><span>Draw calls</span><span>SetPass</span><span>URP · HDRP</span>',
    ru: '<span>Рендер</span><span>Draw calls</span><span>SetPass</span><span>URP · HDRP</span>'
  },
  'hub.tape2Title': { en: 'Graph traversal: BFS and DFS', ru: 'Обход графа: BFS и DFS' },
  'hub.tape2Desc': {
    en: 'Queue versus stack on a 2D array and on a graph: generate the data, scrub step by step, watch the frontier, the traversal tree and the shortest path. Plus a race of the two traversals through one maze.',
    ru: 'Очередь против стека на двумерном массиве и на графе: генерируем данные, мотаем по шагам, смотрим на фронт, дерево обхода и кратчайший путь. Плюс гонка двух обходов в одном лабиринте.'
  },
  'hub.tape2Tags': {
    en: '<span>Algorithms</span><span>Queue · Stack</span><span>O(V + E)</span><span>Shortest path</span>',
    ru: '<span>Алгоритмы</span><span>Очередь · Стек</span><span>O(V + E)</span><span>Кратчайший путь</span>'
  },
  'hub.tape3Title': { en: 'Two Pointers', ru: 'Two Pointers' },
  'hub.tape3Desc': {
    en: 'Opposite pointers and fast & slow / Floyd. Find a pair, detect a cycle and locate its entrance. Rewind every move and see why it works.',
    ru: 'Opposite pointers and fast & slow / Floyd. Find a pair, detect a cycle and locate its entrance. Rewind every move and see why it works.'
  },
  'hub.tape5Title': { en: 'Unity Design Patterns', ru: 'Паттерны проектирования Unity' },
  'hub.tape5Desc': {
    en: 'SOLID and eleven patterns as working rigs: build objects, reuse a pool, undo commands, transition states, broadcast events and measure shared data.',
    ru: 'SOLID и одиннадцать паттернов в живых стендах: создавай объекты, используй пул, отменяй команды, переключай состояния, рассылай события и измеряй общие данные.'
  },
  'hub.tape5Tags': {
    en: '<span>SOLID</span><span>Patterns</span><span>Architecture</span><span>Unity 6</span>',
    ru: '<span>SOLID</span><span>Паттерны</span><span>Архитектура</span><span>Unity 6</span>'
  },
  'hub.soonTag': { en: '<span>Soon</span>', ru: '<span>Скоро</span>' },
  'hub.soonGo': { en: '■ NOT RECORDED YET', ru: '■ ЗАПИСЬ НЕ НАЧАТА' },
  'how.h2': { en: 'How to use this', ru: 'Как этим пользоваться' },
  'how.1': {
    en: '<span class="n">1</span><h3>Answer for yourself first</h3><p>Every tape ends with a block of questions. It pays to say your answer out loud before opening the card.</p>',
    ru: '<span class="n">1</span><h3>Сначала ответь сам</h3><p>В каждой кассете есть блок вопросов. Полезнее сформулировать ответ вслух и только потом открыть карточку.</p>'
  },
  'how.2': {
    en: '<span class="n">2</span><h3>Turn the knobs</h3><p>Sliders, switches and clicks on the scene change the model, not a picture: the numbers are recomputed live.</p>',
    ru: '<span class="n">2</span><h3>Крути стенды</h3><p>Ползунки, переключатели и клики по сцене меняют модель, а не картинку: цифры пересчитываются на лету.</p>'
  },
  'how.3': {
    en: '<span class="n">3</span><h3>Check it in practice</h3><p>The models here are simplified teaching models. The real answers come from the Unity Profiler, the Frame Debugger and measurements on the target hardware.</p>',
    ru: '<span class="n">3</span><h3>Проверяй на практике</h3><p>Модели здесь учебные и упрощённые. Настоящие ответы дают Unity Profiler, Frame Debugger и замеры на целевом железе.</p>'
  },
  'foot.stop': { en: '■ END OF SHELF', ru: '■ КОНЕЦ ПОЛКИ' },
  'foot.src': { en: 'Source code and models:', ru: 'Исходники и модели:' }
};
