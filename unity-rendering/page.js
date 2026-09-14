/** Сборка кассеты «Батчинг в Unity». */
import { $, bootVhs } from '../../assets/vhs.js';
import { initLanes } from './lanes.js';
import { initDeck } from './deck.js';
import { initStaticMini, initDynamicMini, initSrpMini, initInstancingMini, initGrdMini } from './minis.js';
import { PATHS } from './model.js';

bootVhs();
initLanes();
initDeck();
initStaticMini();
initDynamicMini();
initSrpMini();
initInstancingMini();
initGrdMini();

const pill = p => `<span class="pathpill"><i style="background:${p === 'statsrp' ? 'linear-gradient(90deg,#ffd23f 50%,#a77bff 50%)' : PATHS[p].c}"></i>${PATHS[p].l}</span>`;

$('#cheatBody').innerHTML = [
  ['stat', 'Static batching', 'Draw calls и смену буферов; на кадр почти ничего не тратится', 'Память под копии вершин, объём сборки, объекты нельзя двигать', 'Флаг Static, MeshRenderer, общий материал; ≤ 64 000 вершин на буфер', 'Built-in, URP, HDRP'],
  ['dyn', 'Dynamic batching', 'Draw calls для крошечных движущихся мешей', 'CPU трансформирует вершины каждый кадр + повторная заливка', '≤ 300 вершин и ≤ 900 атрибутов, один материал, первый проход', 'Built-in, URP (выкл. по умолчанию); нет в HDRP'],
  ['srp', 'SRP Batcher', 'SetPass и заливку констант. Draw calls не уменьшает', 'Почти ничего; нужен совместимый шейдер', 'CBUFFER UnityPerMaterial / UnityPerDraw, без MPB, не частицы', 'URP, HDRP'],
  ['inst', 'GPU instancing', 'Draw calls и SetPass для одинаковых объектов', 'Per-instance буфер, дополнительные шейдерные варианты', 'Один меш + один материал, MeshRenderer; в URP — только мимо SRP Batcher', 'Built-in, URP, HDRP'],
  ['grd', 'GPU Resident Drawer', 'Почти всё CPU-время на объект + авто-instancing', 'Compute shaders, BRG-варианты в сборке, дольше билд', 'Forward+, SRP Batcher, MeshRenderer без MPB', 'URP, HDRP · Unity 6+']
].map(([p, name, a, b, c, d]) => `<tr><td>${name}</td><td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${pill(p)}</td></tr>`).join('');

const QA = [
  ['Чем draw call отличается от SetPass call?', '<p>Draw call — команда «нарисуй этот меш/диапазон индексов». SetPass — смена шейдерного прохода и состояния рендера (шейдер, текстуры, блендинг, константы материала). SetPass дороже для CPU. Можно иметь 500 draw calls и 5 SetPass — это нормально, особенно с SRP Batcher.</p>'],
  ['Батчинг ускоряет CPU или GPU?', '<p>В первую очередь CPU (render thread): меньше подготовки и переключений состояний. Вершин и пикселей GPU рисует столько же. Если игра упирается в GPU (тяжёлые шейдеры, overdraw, fill rate), батчинг почти не поможет. Сначала смотри в Profiler, что дольше — CPU или GPU.</p>'],
  ['SRP Batcher уменьшает количество draw calls?', '<p>Нет. Каждый объект остаётся отдельным вызовом. SRP Batcher делает вызовы дешёвыми: материалы постоянно лежат в GPU (<code>UnityPerMaterial</code>) и перезаливаются только при изменении, данные объектов идут большим буфером (<code>UnityPerDraw</code>), а батч держится, пока не меняется шейдерный вариант, а не материал.</p>'],
  ['Почему в URP не стоит использовать MaterialPropertyBlock?', '<p>Объект с MPB становится несовместимым с SRP Batcher и уходит на медленный путь. Правильнее сделать отдельные материалы на одном шейдере (или Material Variants) — SRP Batcher их всё равно рисует дёшево. Для массовых per-instance данных — GPU Resident Drawer / BRG или своё instancing-решение.</p>'],
  ['Поставил «Enable GPU Instancing» в URP, а инстансинга нет. Почему?', '<p>У SRP Batcher приоритет выше: совместимый объект рисуется им, галочка instancing игнорируется. Варианты: отключить SRP Batcher (редко правильно), сделать шейдер несовместимым, рисовать через <code>Graphics.RenderMeshInstanced</code> или включить GPU Resident Drawer, который делает instancing автоматически.</p>'],
  ['Когда static batching вредит?', '<p>Когда много копий одного большого меша: память растёт на каждую копию. Когда объекты разбросаны и камера видит их вразнобой — culling режет диапазоны на много вызовов. Когда объект нужно двигать. И в Unity 6 с URP/HDRP документация советует выключать static batching в пользу GPU Resident Drawer.</p>'],
  ['Почему dynamic batching больше не рекомендуют?', '<p>Он переносит трансформацию вершин с GPU на CPU каждый кадр и заново заливает их. На современных API draw call дешевле, чем эта работа. Лимиты жёсткие: ≤ 300 вершин и ≤ 900 атрибутов. Есть смысл только на слабом железе и для совсем крошечных мешей.</p>'],
  ['Какой порядок, если объекту подходит несколько техник?', '<p>1) SRP Batcher и static batching; 2) GPU instancing, включая GPU Resident Drawer и BatchRendererGroup; 3) dynamic batching.</p>'],
  ['Как понять, почему объекты не сбатчились?', '<p>Frame Debugger: у каждого вызова есть строка с причиной, почему он не объединён с предыдущим (разные материалы, keywords, MPB, static batch и т. д.). Плюс окно Stats (Batches, SetPass calls, Saved by batching), Profiler (render thread vs GPU) и Rendering Debugger в URP.</p>'],
  ['Что такое GPU Resident Drawer и что ему нужно?', '<p>Фишка Unity 6: MeshRenderer’ы автоматически рисуются через BatchRendererGroup — данные живут на GPU, одинаковые меш + материал инстансятся. Нужно: Forward+ (в URP), включённый SRP Batcher, BatchRendererGroup Variants = Keep All, платформа с compute shaders. Skinned mesh и объекты с MPB идут обычным путём. В Frame Debugger — Hybrid Batch Group.</p>'],
  ['Как батчатся прозрачные объекты?', '<p>Хуже непрозрачных: их нужно рисовать строго от дальнего к ближнему, поэтому Unity не может переставить их, чтобы сгруппировать по материалу. Разные материалы вперемешку по глубине рвут батчи.</p>'],
  ['Как нарисовать 5000 анимированных персонажей?', '<p>SkinnedMeshRenderer не инстансится и не батчится (только SRP Batcher делает вызовы дешевле). Для толп анимацию запекают в текстуры (vertex animation textures) и рисуют обычным мешем через GPU instancing / BRG — тогда тысячи копий идут считанными вызовами.</p>']
];
$('#qa').innerHTML = QA.map(([q, a], i) =>
  `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${q}</span></summary><div class="a">${a}</div></details>`
).join('');
