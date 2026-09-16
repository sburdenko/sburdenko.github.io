/** Словарь кассеты «Батчинг в Unity». Значение-функция получает аргументы из t(). */
import { fmtI, plural } from '../assets/vhs.js?v=202609161554';

export const DICT = {
  'page.title': {
    en: 'Batching in Unity — who merges what · Tape 01',
    ru: 'Батчинг в Unity — кто что склеивает · Кассета №1'
  },
  'page.desc': {
    en: 'Static and dynamic batching, SRP Batcher, GPU instancing and the GPU Resident Drawer in Unity 6: what is saved, what goes to the GPU and where the CPU pays for it.',
    ru: 'Static и dynamic batching, SRP Batcher, GPU instancing и GPU Resident Drawer в Unity 6: что экономится, что уходит на видеокарту и где платит процессор.'
  },

  /* ---------------- hero ---------------- */
  'hero.eyebrow': { en: 'Tape 01 · Rendering in Unity · interview prep', ru: 'Кассета №1 · Рендер в Unity · для собеседования' },
  'hero.title': { en: 'Batching', ru: 'Батчинг' },
  'hero.subtitle': { en: 'who merges what, and who pays for it', ru: 'кто что склеивает и кто за это платит' },
  'hero.lede': {
    en: 'Static batching, dynamic batching, the SRP Batcher, GPU instancing and the GPU Resident Drawer from Unity 6. For each one: what exactly is saved, what goes to the graphics card, and where the CPU pays the bill. Everything on this page is clickable.',
    ru: 'Static batching, dynamic batching, SRP Batcher, GPU instancing и GPU Resident Drawer из Unity 6. Для каждого разберём, что именно экономится, что уходит на видеокарту и где за это платит процессор. Всё на странице можно щёлкать.'
  },
  'hero.thesis': {
    en: '<b>The point of this tape:</b> batching almost always saves <span class="cpu">CPU</span> time, not <span class="gpu">GPU</span> time. The same vertices are still drawn. What shrinks is the preparation before every draw call.',
    ru: '<b>Главная мысль кассеты:</b> батчинг почти всегда экономит время <span class="cpu">CPU</span>, а не <span class="gpu">GPU</span>. Вершин рисуется столько же. Меньше становится подготовки к каждому вызову отрисовки.'
  },
  'hero.sep': { en: 'One by one', ru: 'По одному' },
  'hero.bat': { en: 'Batched', ru: 'Батчем' },
  'hero.objects': { en: 'Objects in the frame', ru: 'Объектов в кадре' },
  'hero.canvasAria': { en: 'Frame timeline: the CPU lane and the GPU lane', ru: 'Временная шкала кадра: дорожка CPU и дорожка GPU' },
  'hero.ariaMode': { en: 'How we draw', ru: 'Как рисуем' },

  'lanes.cpu': { en: 'CPU (render thread):', ru: 'CPU (render thread):' },
  'lanes.gpu': { en: 'GPU busy:', ru: 'GPU работает:' },
  'lanes.idle': { en: 'GPU idle:', ru: 'GPU простаивает:' },
  'lanes.idleUnit': { en: 'of the frame', ru: 'кадра' },
  'lanes.frame': { en: 'Frame:', ru: 'Кадр:' },
  'lanes.bound': { en: b => `${b}-bound`, ru: b => `упираемся в ${b}` },
  'lanes.ms': { en: 'ms', ru: 'мс' },

  /* ---------------- terms ---------------- */
  'terms.h2': { en: 'Four words you will need', ru: 'Четыре слова, без которых дальше никак' },
  'terms.draw': {
    en: '<dt>Draw call <i style="background:rgba(38,227,234,.14);color:var(--gpu)">GPU</i></dt><dd>A command to the GPU: “draw this index range of this mesh”. For the GPU the call itself is cheap. What is expensive is what the CPU does before it: checks, state setup, uploading constants.</dd>',
    ru: '<dt>Draw call <i style="background:rgba(38,227,234,.14);color:var(--gpu)">GPU</i></dt><dd>Команда видеокарте: «нарисуй этот диапазон индексов этого меша». Для GPU сам вызов дешёвый. Дорого то, что CPU делает перед ним: проверки, выставление состояния, заливка констант.</dd>'
  },
  'terms.setpass': {
    en: '<dt>SetPass call <i style="background:rgba(255,62,165,.16);color:var(--cpu)">CPU</i></dt><dd>Switching the shader pass and the render state: shader, textures, blending, material properties. The heaviest switch for the CPU. The Stats window gives it its own line.</dd>',
    ru: '<dt>SetPass call <i style="background:rgba(255,62,165,.16);color:var(--cpu)">CPU</i></dt><dd>Смена шейдерного прохода и состояния рендера: шейдер, текстуры, блендинг, свойства материала. Самое тяжёлое переключение для CPU. В окне Stats у него своя строка.</dd>'
  },
  'terms.batches': {
    en: '<dt>Batches / Saved by batching</dt><dd>Lines in the Stats window. Batches is how many draw groups went out this frame (a static, dynamic or instanced batch counts as one). Saved by batching is how many calls you avoided making.</dd>',
    ru: '<dt>Batches / Saved by batching</dt><dd>Строки в окне Stats. Batches — сколько групп отрисовки ушло в кадре (static, dynamic и instanced батчи считаются по одному). Saved by batching — сколько вызовов удалось не делать.</dd>'
  },
  'terms.thread': {
    en: '<dt>Render thread</dt><dd>The thread that turns the list of visible objects into graphics API commands. If the Profiler shows it taking longer than GPU time, you are CPU-bound and batching will help. If not — look at shaders, overdraw or vertex count instead.</dd>',
    ru: '<dt>Render thread</dt><dd>Поток, который превращает список видимых объектов в команды графического API. Если в Profiler он дольше GPU-времени, ты упираешься в CPU, и батчинг поможет. Если нет — ищи проблему в шейдерах, overdraw или количестве вершин.</dd>'
  },

  /* ---------------- пульт кадра ---------------- */
  'deck.tag': { en: 'CH.02 // FRAME DECK', ru: 'CH.02 // FRAME DECK' },
  'deck.h2': { en: 'The frame deck', ru: 'Пульт кадра' },
  'deck.kicker': {
    en: 'One neon city block: 63 objects, 13 materials, 3 shader variants. Toggle the techniques and watch the command stream from CPU to GPU change. Click an object in the frame to open its “inspector”, or a block on the tape to see what that batch is and why the previous one ended.',
    ru: 'Квартал неонового города: 63 объекта, 13 материалов, 3 шейдерных варианта. Включай и выключай техники и смотри, как меняется поток команд от CPU к GPU. Клик по объекту в кадре открывает его «инспектор», клик по блоку на ленте объясняет, что за батч и почему оборвался предыдущий.'
  },
  'deck.presetNone': { en: 'Everything off', ru: 'Всё выключено' },
  'deck.presetBirp': { en: 'Built-in classic', ru: 'Built-in классика' },
  'deck.presetUrp': { en: 'URP defaults', ru: 'URP по умолчанию' },
  'deck.presetU6': { en: 'Unity 6 · docs advice', ru: 'Unity 6 · совет доков' },
  'deck.wire': { en: '◇ Wireframe', ru: '◇ Каркас' },
  'deck.play': { en: '► Play the frame', ru: '► Проиграть кадр' },
  'deck.stop': { en: '■ Stop', ru: '■ Стоп' },
  'deck.clearSel': { en: 'Reset selection', ru: 'Сбросить выбор' },
  'deck.sceneAria': { en: 'Isometric city block: click an object to open the inspector', ru: 'Изометрический квартал: кликни по объекту, чтобы открыть инспектор' },
  'deck.ariaPipe': { en: 'Render pipeline', ru: 'Рендер-пайплайн' },
  'deck.ariaScale': { en: 'How many blocks in the frame', ru: 'Сколько кварталов в кадре' },
  'deck.ariaTape': { en: 'Frame batches in order', ru: 'Батчи кадра по порядку' },
  'deck.note': {
    en: 'Milliseconds and bytes come from a simplified model meant for comparing techniques with each other, not for measuring real hardware. The yellow tick on the bars is the 16.7 ms budget (60 FPS).',
    ru: 'Миллисекунды и байты — упрощённая модель, чтобы сравнивать техники между собой, а не замер реального железа. Жёлтая риска на полосах — бюджет 16,7 мс (60 FPS).'
  },
  'deck.tapeTitle': {
    en: (groups, draws) => `COMMAND STREAM · ${groups} GROUPS · ${draws} DRAW CALLS`,
    ru: (groups, draws) => `COMMAND STREAM · ${groups} GROUPS · ${draws} DRAW CALLS`
  },
  'deck.crt': {
    en: (objs, k) => `CAM 01 · ${objs} OBJ${k > 1 ? ` · ×${k} = ${objs * k} OBJ` : ''}`,
    ru: (objs, k) => `CAM 01 · ${objs} OBJ${k > 1 ? ` · ×${k} = ${objs * k} OBJ` : ''}`
  },
  'deck.spTitle': { en: 'new SetPass', ru: 'новый SetPass' },
  'deck.step': { en: (i, n) => `► STEP ${i}/${n}`, ru: (i, n) => `► STEP ${i}/${n}` },

  /* ---------------- боковая панель ---------------- */
  'side.batchOf': { en: (i, n) => `Batch ${i} of ${n}`, ru: (i, n) => `Батч ${i} из ${n}` },
  'side.objects': { en: 'Objects', ru: 'Объектов' },
  'side.draws': { en: 'Draw calls', ru: 'Draw calls' },
  'side.setpass': { en: 'SetPass', ru: 'SetPass' },
  'side.setpassNew': { en: 'new pass', ru: 'новый проход' },
  'side.setpassSame': { en: 'same pass', ru: 'тот же проход' },
  'side.verts': { en: 'Vertices', ru: 'Вершин' },
  'side.cpu': { en: 'CPU ≈', ru: 'CPU ≈' },
  'side.materials': { en: 'Materials', ru: 'Материалы' },
  'side.whyBroke': { en: 'Why it did not merge with the previous one', ru: 'Почему не склеилось с предыдущим' },
  'side.inspector': { en: 'Inspector', ru: 'Inspector' },
  'side.component': { en: 'Component', ru: 'Компонент' },
  'side.mesh': { en: 'Mesh', ru: 'Меш' },
  'side.meshVerts': { en: n => `${fmtI(n)} verts`, ru: n => `${fmtI(n)} верш.` },
  'side.material': { en: 'Material', ru: 'Материал' },
  'side.shader': { en: 'Shader', ru: 'Шейдер' },
  'side.instancing': { en: 'Instancing', ru: 'Instancing' },
  'side.instOn': { en: 'enabled', ru: 'включён' },
  'side.howDraw': { en: 'How Unity will draw it', ru: 'Как Unity его нарисует' },
  'side.flagsNote': { en: 'The flags change for this object in every block.', ru: 'Флаги меняются у этого объекта во всех кварталах.' },
  'side.legendTitle': { en: 'How the block gets drawn', ru: 'Как рисуется квартал' },
  'side.legendHint': {
    en: n => `The numbers show how many of the ${n} objects in the block take each path. An object’s colour in the frame is its material.`,
    ru: n => `Цифры — сколько из ${n} объектов квартала идёт каждым путём. Цвет объекта в кадре — его материал.`
  },
  'side.clickHint': {
    en: '<b>Click</b> an object in the frame to see why it ended up where it did, or a block on the tape to highlight that batch.',
    ru: '<b>Кликни</b> объект в кадре, чтобы увидеть, почему он попал именно сюда, или блок на ленте — чтобы подсветить батч.'
  },

  /* ---------------- плитки ---------------- */
  'stats.draws': { en: 'Draw calls', ru: 'Draw calls' },
  'stats.savedFoot': { en: n => `saved by batching: ${fmtI(n)}`, ru: n => `сэкономлено батчингом: ${fmtI(n)}` },
  'stats.setpass': { en: 'SetPass calls', ru: 'SetPass calls' },
  'stats.cpu': { en: 'CPU · render thread', ru: 'CPU · render thread' },
  'stats.gpu': { en: 'GPU', ru: 'GPU' },
  'stats.upload': { en: 'CPU → GPU per frame', ru: 'CPU → GPU за кадр' },
  'stats.memory': { en: 'Extra memory', ru: 'Доп. память' },
  'stats.memYes': { en: 'vertex copies from static batching', ru: 'копии вершин static batching' },
  'stats.memNo': { en: 'no extra copies', ru: 'лишних копий нет' },
  'stats.same': { en: 'same as with everything off', ru: 'как без батчинга' },
  'stats.delta': { en: pct => `${pct > 0 ? '+' : ''}${pct}% vs “everything off”`, ru: pct => `${pct > 0 ? '+' : ''}${pct}% к «всё выключено»` },
  'stats.ms': { en: 'ms', ru: 'мс' },

  /* ---------------- сравнение ---------------- */
  'compare.tag': { en: 'CH.03 // ONE SCENE, ALL TECHNIQUES', ru: 'CH.03 // ONE SCENE, ALL TECHNIQUES' },
  'compare.h2': { en: 'One scene. Every technique on its own', ru: 'Одна сцена. Все техники по отдельности' },
  'compare.kicker': {
    en: 'The table runs the same scene that sits on the deck above: change the pipeline or the scale and the numbers are recomputed. Each row switches on exactly one technique so you can see its own contribution.',
    ru: 'Таблица считает ту же сцену, что стоит на пульте выше: меняешь пайплайн или масштаб — цифры пересчитываются. Каждая строка включает ровно одну технику, чтобы было видно её собственный вклад.'
  },
  'compare.thTech': { en: 'Technique', ru: 'Техника' },
  'compare.thDraws': { en: 'Draw calls', ru: 'Draw calls' },
  'compare.thSetPass': { en: 'SetPass', ru: 'SetPass' },
  'compare.thCpu': { en: 'CPU, ms', ru: 'CPU, мс' },
  'compare.thUpload': { en: 'CPU → GPU', ru: 'CPU → GPU' },
  'compare.thMem': { en: 'Extra memory', ru: 'Доп. память' },
  'compare.thScene': { en: 'In this scene', ru: 'В этой сцене' },
  'compare.baseline': { en: 'No batching', ru: 'Без батчинга' },
  'compare.baselineNote': { en: 'reference point', ru: 'точка отсчёта' },
  'compare.on': { en: 'on right now', ru: 'включена сейчас' },
  'compare.available': { en: 'available in this scene', ru: 'доступна в этой сцене' },
  'compare.note': {
    en: (objs, pipe) => `Every row is the same scene (${fmtI(objs)} objects, ${pipe}) with one technique enabled. Percentages are relative to the “no batching” row.`,
    ru: (objs, pipe) => `Каждая строка — та же сцена (${fmtI(objs)} объектов, ${pipe}) с одной включённой техникой. Проценты — к строке «без батчинга».`
  },

  /* ---------------- эксперименты ---------------- */
  'exps.h3': { en: 'Three small experiments', ru: 'Три маленьких эксперимента' },
  'exps.kicker': {
    en: 'Each card sets up the deck and scrolls back to it. Answer for yourself first, then press.',
    ru: 'Каждая карточка настраивает пульт и прокручивает к нему. Сначала ответь себе, что произойдёт, потом нажимай.'
  },
  'exps.load': { en: 'Load the scene →', ru: 'Загрузить сцену →' },
  'exps.1': {
    en: '<span class="n">EXPERIMENT 01 ↗</span><h3>A forest of identical objects</h3><p>Built-in, GPU instancing only. Look at which materials collapsed into a single call and which stayed on their own — and why.</p>',
    ru: '<span class="n">ЭКСПЕРИМЕНТ 01 ↗</span><h3>Лес из одинаковых объектов</h3><p>Built-in, только GPU instancing. Посмотри, какие материалы схлопнулись в один вызов, а какие остались сами по себе — и почему.</p>'
  },
  'exps.2': {
    en: '<span class="n">EXPERIMENT 02 ↗</span><h3>Many materials. One shader.</h3><p>URP, SRP Batcher only. The draw call count did not move at all — so why did CPU time nearly halve?</p>',
    ru: '<span class="n">ЭКСПЕРИМЕНТ 02 ↗</span><h3>Много материалов. Один шейдер.</h3><p>URP, только SRP Batcher. Draw calls не изменились ни на один — почему тогда CPU-время упало почти вдвое?</p>'
  },
  'exps.3': {
    en: '<span class="n">EXPERIMENT 03 ↗</span><h3>The price of “free” batching</h3><p>100 blocks and dynamic batching alone. Fewer calls, more CPU. Open the tape and find the orange blocks.</p>',
    ru: '<span class="n">ЭКСПЕРИМЕНТ 03 ↗</span><h3>Цена «бесплатного» батчинга</h3><p>100 кварталов и один dynamic batching. Вызовов стало меньше, а CPU — больше. Открой ленту и найди оранжевые блоки.</p>'
  },

  /* ---------------- причины выбора пути ---------------- */
  'why.staticBatched': { en: 'Static flag + static batching on: the mesh is baked into the shared buffer', ru: 'Флаг Static + Static batching включён: меш запечён в общий буфер' },
  'why.staticOff': { en: 'A static object, but static batching is off', ru: 'Static-объект, но Static batching выключен' },
  'why.notStatic': { en: 'Not marked Static — it does not join a static batch', ru: 'Не помечен Static — в static batch не попадает' },
  'why.mpbSkipsSrp': { en: 'MaterialPropertyBlock — the SRP Batcher skips the object', ru: 'MaterialPropertyBlock — SRP Batcher пропускает объект' },
  'why.grdTakes': { en: 'MeshRenderer without an MPB: the GPU Resident Drawer draws it through a BatchRendererGroup', ru: 'MeshRenderer без MPB: GPU Resident Drawer рисует его через BatchRendererGroup' },
  'why.grdSkinned': { en: 'SkinnedMeshRenderer — the GPU Resident Drawer does not take it', ru: 'SkinnedMeshRenderer — GPU Resident Drawer его не берёт' },
  'why.srpCompatible': { en: 'Shader is compatible (CBUFFER UnityPerMaterial) → SRP Batcher', ru: 'Шейдер совместим (CBUFFER UnityPerMaterial) → SRP Batcher' },
  'why.srpOff': { en: 'SRP Batcher is off', ru: 'SRP Batcher выключен' },
  'why.birpNoSrp': { en: 'Built-in RP: no SRP Batcher and no GPU Resident Drawer', ru: 'Built-in RP: SRP Batcher и GPU Resident Drawer недоступны' },
  'why.skinned': { en: 'SkinnedMeshRenderer: no static, no dynamic, no instancing', ru: 'SkinnedMeshRenderer: ни static, ни dynamic, ни instancing' },
  'why.instOn': { en: 'The material has Enable GPU Instancing → instancing per mesh + material pair', ru: 'У материала Enable GPU Instancing → instancing по паре меш + материал' },
  'why.noInstFlag': { en: 'The material does not have Enable GPU Instancing', ru: 'У материала не стоит Enable GPU Instancing' },
  'why.instOff': { en: 'GPU instancing is off', ru: 'GPU instancing выключен' },
  'why.dynFits': { en: v => `${fmtI(v)} vertices ≤ 300 → the CPU will transform and merge them`, ru: v => `${fmtI(v)} вершин ≤ 300 → CPU пересчитает вершины и склеит` },
  'why.dynTooBig': { en: v => `${fmtI(v)} vertices > 300 — too heavy for dynamic batching`, ru: v => `${fmtI(v)} вершин > 300 — для dynamic batching слишком тяжёлый` },
  'why.dynHdrp': { en: 'HDRP does not support dynamic batching', ru: 'В HDRP dynamic batching не поддерживается' },
  'why.dynOff': { en: 'Dynamic batching is off', ru: 'Dynamic batching выключен' },

  'brk.first': { en: 'First call in the frame', ru: 'Первый вызов в кадре' },
  'brk.mpb': { en: 'The object has a MaterialPropertyBlock — it drops out of the SRP Batcher', ru: 'У объекта MaterialPropertyBlock — он выпадает из SRP Batcher' },
  'brk.skinned': { en: 'SkinnedMeshRenderer — the plain path', ru: 'SkinnedMeshRenderer — обычный путь' },
  'brk.variantAndPath': { en: 'A different shader variant and a different draw path', ru: 'Другой шейдерный вариант и другой способ отрисовки' },
  'brk.path': { en: 'A different draw path', ru: 'Другой способ отрисовки' },
  'brk.variant': { en: 'Different shader variants (shader or keywords)', ru: 'Разные шейдерные варианты (шейдер или keywords)' },
  'brk.mesh': { en: 'A different mesh — instancing needs one mesh', ru: 'Другой меш — instancing требует один меш' },
  'brk.material': { en: 'A different material', ru: 'Другой материал' },

  'na.srp': { en: 'The SRP Batcher exists only in URP and HDRP', ru: 'SRP Batcher есть только в URP и HDRP' },
  'na.grd': { en: 'The GPU Resident Drawer exists only in URP and HDRP (Unity 6+)', ru: 'GPU Resident Drawer есть только в URP и HDRP (Unity 6+)' },
  'na.grdNeedsSrp': { en: 'Needs the SRP Batcher switched on', ru: 'Нужен включённый SRP Batcher' },
  'na.dyn': { en: 'HDRP does not support dynamic batching', ru: 'HDRP не поддерживает dynamic batching' },

  'path.info.plain': {
    en: 'The plain path: for every object the CPU sets the state again, uploads the material and object constants and sends a separate call. The most expensive path for the CPU.',
    ru: 'Обычный путь: для каждого объекта CPU заново выставляет состояние, заливает константы материала и объекта и шлёт отдельный вызов. Самый дорогой путь по CPU.'
  },
  'path.info.srp': {
    en: 'Draw calls did not go down — every object is still its own call. But the materials already live in GPU memory, SetPass happens once per shader variant, and object data goes out in one big buffer. Every call is cheap.',
    ru: 'Draw calls не уменьшились — каждый объект по-прежнему отдельный вызов. Но материалы уже лежат в памяти GPU, SetPass один на шейдерный вариант, а данные объектов уходят одним большим буфером. Каждый вызов дешёвый.'
  },
  'path.info.stat': {
    en: 'The meshes were merged ahead of time into a shared vertex and index buffer in world space. One call draws a whole index range. You pay with memory, and such objects cannot move.',
    ru: 'Меши заранее склеены в общий вершинный и индексный буфер в мировых координатах. Один вызов рисует целый диапазон индексов. Платим памятью, и двигать такие объекты нельзя.'
  },
  'path.info.statsrp': {
    en: 'A static batch inside the SRP Batcher: geometry merged ahead of time, call preparation done by the fast SRP Batcher path. You pay with memory, and it cannot move.',
    ru: 'Static batch внутри SRP Batcher: геометрия склеена заранее, а подготовку вызовов делает быстрый путь SRP Batcher. Платим памятью, двигать нельзя.'
  },
  'path.info.grd': {
    en: 'GPU Resident Drawer: object data lives on the GPU permanently (BatchRendererGroup). The CPU does almost nothing per object, and identical mesh + material pairs are instanced automatically.',
    ru: 'GPU Resident Drawer: данные объектов постоянно живут на GPU (BatchRendererGroup). CPU почти ничего не делает на объект, одинаковые меш + материал рисуются инстансингом автоматически.'
  },
  'path.info.inst': {
    en: 'GPU instancing: the mesh and the material are set once, an array of matrices is attached, and the GPU draws N copies in one call.',
    ru: 'GPU instancing: меш и материал выставляются один раз, к ним прикладывается массив матриц — GPU рисует N копий одним вызовом.'
  },
  'path.info.dyn': {
    en: 'Dynamic batching: every frame the CPU transforms the vertices of small meshes into world space and uploads them into a shared buffer — one call instead of many.',
    ru: 'Dynamic batching: CPU каждый кадр пересчитывает вершины мелких мешей в мировые координаты и заливает их в общий буфер — один вызов вместо многих.'
  },

  /* ---------------- главы с теорией ---------------- */
  'static.h2': { en: 'Static batching: merge it ahead of time', ru: 'Static batching: склеить заранее' },
  'static.prose': {
    en: `<p>Objects with the <code>Batching Static</code> flag are transformed into world space at build time (or on scene load) and packed into one shared vertex buffer and one shared index buffer. Each buffer holds up to 64,000 vertices; beyond that Unity creates more batches.</p>
      <p>During the frame the CPU no longer transforms or rebinds meshes: one call draws a whole index range with one material. Almost nothing is spent per frame — but the price is paid up front.</p>
      <p>The first price is <b>memory</b>. A hundred identical lamps used to reference one mesh; now that is a hundred copies of vertices in the shared buffer. The second is <b>immobility</b>: the vertices are already baked in world space, so the object cannot move. The third is <b>culling</b>: if the camera sees the objects scattered, one range breaks into several calls.</p>
      <p>Works only with <code>MeshRenderer</code> (not skinned) and with objects sharing a material inside a batch. For runtime merging there is <code>StaticBatchingUtility.Combine</code>.</p>`,
    ru: `<p>Объекты с флагом <code>Batching Static</code> Unity ещё при сборке (или при загрузке сцены) переводит в мировые координаты и складывает в один общий вершинный и один индексный буфер. Каждый такой буфер вмещает до 64 000 вершин; если нужно больше, Unity создаёт несколько батчей.</p>
      <p>В кадре CPU уже не пересчитывает и не перевязывает меши: один вызов рисует целый диапазон индексов с одним материалом. На каждый кадр почти ничего не тратится, но цена платится заранее.</p>
      <p>Первая цена — <b>память</b>. Сто одинаковых фонарей раньше ссылались на один меш, а теперь это сто копий вершин в общем буфере. Вторая — <b>неподвижность</b>: вершины уже запечены в мире, двигать такой объект нельзя. Третья — <b>culling</b>: если камера видит объекты вразнобой, один диапазон рвётся на несколько вызовов.</p>
      <p>Работает только с <code>MeshRenderer</code> (не со skinned) и с объектами одного материала внутри батча. Для склейки в рантайме есть <code>StaticBatchingUtility.Combine</code>.</p>`
  },
  'static.facts': {
    en: `<div><span class="k save">Saves</span><p>Draw calls and buffer switches on the CPU. Per-frame cost is close to zero.</p></div>
      <div><span class="k cost">Costs</span><p>Memory (a copy of every mesh in world space), build size, and the objects can no longer move.</p></div>
      <div><span class="k need">Needs</span><p>The Static flag, a MeshRenderer, a shared material. In Unity 6 the docs suggest turning it off for URP/HDRP in favour of the GPU Resident Drawer.</p></div>`,
    ru: `<div><span class="k save">Экономит</span><p>Draw calls и смену буферов на CPU. Затраты на кадр почти нулевые.</p></div>
      <div><span class="k cost">Цена</span><p>Память (копия каждого меша в мировых координатах), объём сборки, объекты нельзя двигать.</p></div>
      <div><span class="k need">Условия</span><p>Флаг Static, MeshRenderer, общий материал. В Unity 6 для URP/HDRP доки советуют выключить его в пользу GPU Resident Drawer.</p></div>`
  },
  'static.miniCamera': { en: 'What the camera sees', ru: 'Что видит камера' },
  'static.miniHint': {
    en: 'This is one static batch: 16 buildings in a row inside a shared index buffer. Click the segments to hide objects from the frame, the way frustum culling does.',
    ru: 'Это один static batch: 16 зданий подряд в общем индексном буфере. Щёлкай сегменты — прячь объекты из кадра, как это делает frustum culling.'
  },
  'static.ibufAria': { en: 'Objects in the index buffer', ru: 'Объекты в индексном буфере' },
  'static.capLeft': { en: 'index 0', ru: 'индекс 0' },
  'static.capMid': { en: 'shared index buffer →', ru: 'общий index buffer →' },
  'static.capRight': { en: 'index N', ru: 'индекс N' },
  'static.out': {
    en: (n, runs) => `<b>${n}</b> of 16 visible → <b>${runs}</b> draw call${runs === 1 ? '' : 's'}. Every contiguous run of visible indices is its own call.${runs === 1 && n === 16 ? ' Everything is visible — the whole buffer in one call.' : ''}`,
    ru: (n, runs) => `Видно <b>${n}</b> из 16 → <b>${runs}</b> ${plural(runs, 'draw call', 'draw calla', 'draw callов')}. Каждый непрерывный кусок видимых индексов — отдельный вызов.${runs === 1 && n === 16 ? ' Всё видно — весь буфер одним вызовом.' : ''}`
  },
  'static.outEmpty': {
    en: 'The camera sees nothing — <b>0</b> draw calls. The buffer still sits in memory though.',
    ru: 'Камера ничего не видит — <b>0</b> draw calls. Но буфер всё равно лежит в памяти.'
  },
  'static.cellAria': { en: (i, v) => `Building ${i}: ${v ? 'visible' : 'hidden'}`, ru: (i, v) => `Здание ${i}: ${v ? 'видно' : 'скрыто'}` },
  'static.turn': { en: 'Turn the camera', ru: 'Повернуть камеру' },
  'static.all': { en: 'Show everything', ru: 'Видно всё' },
  'static.memTitle': { en: 'The price in memory', ru: 'Цена в памяти' },
  'static.memLabel': { en: 'Fence copies, 800 vertices × 48 bytes', ru: 'Копий забора, 800 вершин × 48 байт' },
  'static.memWithout': { en: 'Without static batching: one mesh for all', ru: 'Без static batching: 1 меш на всех' },
  'static.memWith': {
    en: k => `With static batching: ${fmtI(k)} ${k === 1 ? 'copy' : 'copies'} in world space`,
    ru: k => `Со static batching: ${fmtI(k)} ${plural(k, 'копия', 'копии', 'копий')} в мировых координатах`
  },
  'static.move': { en: 'Move the object at runtime', ru: 'Сдвинуть объект в рантайме' },
  'static.toast': {
    en: 'The transform changes, the picture does not: the vertices are already baked into the shared buffer in world space. Moving objects must not get the <code>Batching Static</code> flag.',
    ru: 'Transform изменится, а картинка — нет: вершины уже запечены в общем буфере в мировых координатах. Движущимся объектам флаг <code>Batching Static</code> ставить нельзя.'
  },

  'dyn.h2': { en: 'Dynamic batching: the CPU rebuilds meshes every frame', ru: 'Dynamic batching: CPU пересобирает меши каждый кадр' },
  'dyn.prose': {
    en: `<p>For small moving meshes Unity takes their vertices every frame, multiplies them by the object matrices <b>on the CPU</b>, packs them into a shared dynamic buffer and draws them with one call. Draw calls are saved, but in exchange the CPU does work the vertex shader would normally do on the GPU.</p>
      <p>Hence the hard limits: no more than <b>300 vertices</b> and <b>900 vertex attributes</b> — the more channels (normals, UV1, tangents), the fewer vertices allowed. One material; in a multi-pass shader only the first pass batches; with baked light, one lightmap.</p>
      <p>The Unity 6 documentation says it plainly: for most cases dynamic batching is no longer recommended — the CPU overhead can cost more than the draw call itself. HDRP does not have it, and in URP it is off by default.</p>`,
    ru: `<p>Для мелких движущихся мешей Unity каждый кадр берёт их вершины, <b>на CPU</b> умножает на матрицы объектов, складывает в общий динамический буфер и рисует одним вызовом. Draw calls экономятся, но взамен CPU делает работу, которую обычно делает вершинный шейдер на GPU.</p>
      <p>Поэтому жёсткие лимиты: меш не больше <b>300 вершин</b> и <b>900 вершинных атрибутов</b> — чем больше каналов (нормали, UV1, тангенты), тем меньше допустимых вершин. Один и тот же материал, в многопроходном шейдере батчится только первый проход, при запечённом свете — один lightmap.</p>
      <p>В документации Unity 6 прямо сказано: для большинства случаев dynamic batching больше не рекомендуется — накладные расходы на CPU могут оказаться больше, чем цена самого draw call. В HDRP его нет, в URP он выключен по умолчанию.</p>`
  },
  'dyn.facts': {
    en: `<div><span class="k save">Saves</span><p>Draw calls for a pile of tiny meshes: mesh particles, UI-like quads, small debris.</p></div>
      <div><span class="k cost">Costs</span><p>Every frame the CPU transforms the vertices and re-uploads them to the GPU — even if the object is standing still.</p></div>
      <div><span class="k need">Needs</span><p>≤ 300 vertices and ≤ 900 attributes, one material, not skinned, first shader pass only.</p></div>`,
    ru: `<div><span class="k save">Экономит</span><p>Draw calls для кучи крошечных мешей: частиц-мешей, UI-подобных квадов, мелкого мусора.</p></div>
      <div><span class="k cost">Цена</span><p>CPU каждый кадр трансформирует вершины и заново заливает их на GPU — даже если объект стоит.</p></div>
      <div><span class="k need">Условия</span><p>≤ 300 вершин и ≤ 900 атрибутов, один материал, не skinned, только первый проход шейдера.</p></div>`
  },
  'dyn.miniMesh': { en: 'Set up the mesh', ru: 'Настрой меш' },
  'dyn.verts': { en: 'Vertices in the mesh', ru: 'Вершин в меше' },
  'dyn.count': { en: 'How many such objects', ru: 'Сколько таких объектов' },
  'dyn.miniCpu': { en: 'CPU per frame', ru: 'CPU за кадр' },
  'dyn.limit': {
    en: (na, limit, v, ok) => `Attributes: <b>${na}</b> → limit: min(300, 900 / ${na}) = <b>${limit}</b> vertices. A mesh of ${v} — ${ok ? '<span style="color:var(--ok)">fits</span>' : '<span style="color:var(--bad)">does not fit</span>'}.`,
    ru: (na, limit, v, ok) => `Атрибутов: <b>${na}</b> → лимит: min(300, 900 / ${na}) = <b>${limit}</b> вершин. Меш на ${v} — ${ok ? '<span style="color:var(--ok)">проходит</span>' : '<span style="color:var(--bad)">не проходит</span>'}.`
  },
  'dyn.barWithout': { en: c => `No batching: ${fmtI(c)} draw calls`, ru: c => `Без батчинга: ${fmtI(c)} draw calls` },
  'dyn.barWith': {
    en: (ok, verts) => ok ? `Dynamic batch: 1 call + ${fmtI(verts)} vertices on the CPU` : 'Dynamic batching: will not apply',
    ru: (ok, verts) => ok ? `Dynamic batch: 1 вызов + ${fmtI(verts)} вершин на CPU` : 'Dynamic batching: не применится'
  },
  'dyn.verdictTooBig': { en: '✗ The mesh is too big — Unity will draw them one by one', ru: '✗ Меш слишком большой — Unity нарисует по одному' },
  'dyn.verdictGood': { en: p => `✓ Worth it: −${p}% CPU`, ru: p => `✓ Выгодно: −${p}% CPU` },
  'dyn.verdictSame': { en: '≈ Almost no difference', ru: '≈ Почти без разницы' },
  'dyn.verdictBad': { en: p => `✗ Worse: +${p}% CPU — batching costs more than the draw calls`, ru: p => `✗ Хуже: +${p}% CPU — батчинг дороже draw calls` },
  'dyn.noteOk': {
    en: (size, per) => `On top of that, <b>${size}</b> of vertices are re-uploaded to the GPU every frame (${per} bytes per vertex) — even when the objects stand still.`,
    ru: (size, per) => `Плюс каждый кадр на GPU заново уезжает <b>${size}</b> вершин (${per} байт на вершину) — даже если объекты стоят на месте.`
  },
  'dyn.noteBad': {
    en: 'Try fewer vertices or drop the extra attributes — UV1 and Tangent, for instance.',
    ru: 'Попробуй уменьшить число вершин или убрать лишние атрибуты — например, UV1 и Tangent.'
  },
  'dyn.posLock': { en: 'Position is always there', ru: 'Позиция есть всегда' },

  'srp.h2': { en: 'SRP Batcher: same draw calls, cheaper preparation', ru: 'SRP Batcher: draw calls те же, подготовка дешевле' },
  'srp.prose': {
    en: `<p>The classic trick question: <b>the SRP Batcher does not reduce the number of draw calls</b>. Every object is still drawn by its own call. What shrinks is the work the CPU does between calls.</p>
      <p>The classic path re-binds the material and uploads its constants for every object. The SRP Batcher keeps the properties of all materials <b>permanently in GPU memory</b> (the <code>UnityPerMaterial</code> buffer) and re-uploads a material only when its properties changed. Per-object data — matrices, light probes — is written as one large buffer (<code>UnityPerDraw</code>) through a separate fast path.</p>
      <p>A batch survives until the <b>shader variant</b> changes, not the material. Ten materials on one shader with the same keywords are one SetPass and ten cheap calls. Change a keyword and you get a new variant and a new batch.</p>
      <p>Works only in URP and HDRP. All the standard URP/HDRP shaders are compatible except the particle variants.</p>`,
    ru: `<p>Самый частый вопрос-ловушка: <b>SRP Batcher не уменьшает количество draw calls</b>. Каждый объект всё так же рисуется своим вызовом. Уменьшается то, что CPU делает между вызовами.</p>
      <p>Классический путь для каждого объекта заново выставляет материал и заливает его константы. SRP Batcher держит свойства всех материалов <b>постоянно в памяти GPU</b> (буфер <code>UnityPerMaterial</code>) и перезаливает материал, только если его свойства поменялись. Данные объектов — матрицы, пробы света — пишутся одним большим буфером (<code>UnityPerDraw</code>) по быстрому отдельному пути.</p>
      <p>Батч держится, пока не меняется <b>шейдерный вариант</b>, а не материал. Десять материалов на одном шейдере с одинаковыми keywords — это один SetPass и десять дешёвых вызовов. Меняешь keyword — новый вариант, новый батч.</p>
      <p>Работает только в URP и HDRP. Все стандартные шейдеры URP/HDRP совместимы, кроме вариантов для частиц.</p>`
  },
  'srp.facts': {
    en: `<div><span class="k save">Saves</span><p>SetPass calls and constant uploads on the CPU — no matter how many materials there are, as long as the shader is one.</p></div>
      <div><span class="k cost">Costs</span><p>Almost nothing. You need a compatible shader, and you cannot use MaterialPropertyBlock.</p></div>
      <div><span class="k need">Needs</span><p>Material properties in <code>CBUFFER UnityPerMaterial</code>, built-ins in <code>UnityPerDraw</code>. Mesh or skinned mesh, not particles, no MPB.</p></div>`,
    ru: `<div><span class="k save">Экономит</span><p>SetPass calls и заливку констант на CPU. Сколько бы ни было материалов, если шейдер один.</p></div>
      <div><span class="k cost">Цена</span><p>Почти никакой. Нужен совместимый шейдер, и нельзя пользоваться MaterialPropertyBlock.</p></div>
      <div><span class="k need">Условия</span><p>Свойства материала в <code>CBUFFER UnityPerMaterial</code>, встроенные — в <code>UnityPerDraw</code>. Меш или skinned mesh, не частицы, без MPB.</p></div>`
  },
  'srp.frameTitle': { en: 'One frame · 6 objects · 3 materials · 1 Lit shader', ru: 'Один кадр · 6 объектов · 3 материала · 1 шейдер Lit' },
  'srp.run': { en: '► Frame 1', ru: '► Кадр 1' },
  'srp.next': { en: 'Next frame (nothing changed)', ru: 'Следующий кадр (ничего не меняли)' },
  'srp.dirty': { en: 'Change the colour of Mat B', ru: 'Поменять цвет у Mat B' },
  'srp.colA': { en: 'Without the SRP Batcher', ru: 'Без SRP Batcher' },
  'srp.colB': { en: 'SRP Batcher', ru: 'SRP Batcher' },
  'srp.frameNo': { en: n => `frame ${n || '—'}`, ru: n => `кадр ${n || '—'}` },
  'srp.cmdSetPass': { en: m => `SetPass · Lit · Mat ${m}`, ru: m => `SetPass · Lit · Mat ${m}` },
  'srp.cmdSetPassOne': { en: 'SetPass · Lit (one variant)', ru: 'SetPass · Lit (один вариант)' },
  'srp.cmdMatProps': { en: m => `↑ properties of Mat ${m}`, ru: m => `↑ свойства Mat ${m}` },
  'srp.cmdMatrices': { en: o => `↑ matrices of ${o}`, ru: o => `↑ матрицы ${o}` },
  'srp.cmdDraw': { en: o => `Draw ${o}`, ru: o => `Draw ${o}` },
  'srp.cmdUploadAll': { en: '↑ Mat A, B, C → VRAM (once)', ru: '↑ Mat A, B, C → VRAM (один раз)' },
  'srp.cmdUploadOne': { en: m => `↑ only Mat ${m} (changed)`, ru: m => `↑ только Mat ${m} (изменился)` },
  'srp.cmdNothing': { en: 'materials already in VRAM — nothing to upload', ru: 'материалы уже в VRAM — заливать нечего' },
  'srp.cmdPerDraw': { en: '↑ UnityPerDraw: 6 objects in one chunk', ru: '↑ UnityPerDraw: 6 объектов одним куском' },
  'srp.cmdBind': { en: (m, o) => `bind Mat ${m} · Draw ${o}`, ru: (m, o) => `bind Mat ${m} · Draw ${o}` },
  'srp.sumSetPass': { en: 'SetPass:', ru: 'SetPass:' },
  'srp.sumUploads': { en: 'Uploads:', ru: 'Заливок:' },
  'srp.sumDraws': { en: 'Draw calls:', ru: 'Draw calls:' },
  'srp.compatTitle': { en: 'Is the object compatible?', ru: 'Совместим ли объект?' },
  'srp.compatHint': {
    en: 'In the shader Inspector Unity writes “SRP Batcher: compatible” or “not compatible”. Play with the conditions:',
    ru: 'В Inspector шейдера Unity пишет «SRP Batcher: compatible» или «not compatible». Поиграй условиями:'
  },
  'srp.chkCbuffer': { en: 'Material properties in CBUFFER UnityPerMaterial', ru: 'Свойства материала в CBUFFER UnityPerMaterial' },
  'srp.chkPerDraw': { en: 'Built-in properties in CBUFFER UnityPerDraw', ru: 'Встроенные свойства в CBUFFER UnityPerDraw' },
  'srp.chkMpb': { en: 'The object uses a MaterialPropertyBlock', ru: 'Объект использует MaterialPropertyBlock' },
  'srp.chkParticles': { en: 'It is a Particle System', ru: 'Это Particle System' },
  'srp.badMat': { en: 'material properties outside UnityPerMaterial', ru: 'свойства материала вне UnityPerMaterial' },
  'srp.badDraw': { en: 'built-in properties outside UnityPerDraw', ru: 'встроенные свойства вне UnityPerDraw' },
  'srp.badMpb': { en: 'MaterialPropertyBlock', ru: 'MaterialPropertyBlock' },
  'srp.badParticles': { en: 'particles', ru: 'частицы' },
  'srp.badgeNo': { en: bad => `SRP Batcher: not compatible — ${bad}`, ru: bad => `SRP Batcher: not compatible — ${bad}` },
  'srp.badgeOk': { en: 'SRP Batcher: compatible', ru: 'SRP Batcher: compatible' },
  'srp.shaderTitle': { en: 'What it looks like in the shader', ru: 'Как это выглядит в шейдере' },
  'srp.shaderCode': {
    en: `<span class="c">// every material property in one buffer</span>
<span class="k">CBUFFER_START</span>(<span class="t">UnityPerMaterial</span>)
    float4 _BaseColor;
    float4 _BaseMap_ST;
    float  _Smoothness;
<span class="k">CBUFFER_END</span>

<span class="c">// engine built-ins go to UnityPerDraw
// (unity_ObjectToWorld, unity_SHAr, …)
// in URP the Core includes already do this</span>`,
    ru: `<span class="c">// все свойства материала — в одном буфере</span>
<span class="k">CBUFFER_START</span>(<span class="t">UnityPerMaterial</span>)
    float4 _BaseColor;
    float4 _BaseMap_ST;
    float  _Smoothness;
<span class="k">CBUFFER_END</span>

<span class="c">// встроенные свойства движка — в UnityPerDraw
// (unity_ObjectToWorld, unity_SHAr, …)
// в URP это уже сделано в инклюдах Core</span>`
  },
  'srp.shaderNote': {
    en: 'Textures do not go into a CBUFFER — only numeric properties. If even one property is declared outside the buffer, the shader becomes incompatible.',
    ru: 'Текстуры в CBUFFER не кладутся — только числовые свойства. Если хотя бы одно свойство объявлено вне буфера, шейдер становится несовместимым.'
  },

  'inst.h2': { en: 'GPU instancing: one mesh, a thousand copies', ru: 'GPU instancing: один меш, тысяча копий' },
  'inst.prose': {
    en: `<p>If objects share <b>the same mesh and the same material</b>, the GPU can draw all of them in one call. The mesh is sent once and an array of per-instance data is attached to it: matrices and, optionally, per-instance properties (colour, scale). The vertex shader picks the right matrix by instance index.</p>
      <p>Turned on with the <code>Enable GPU Instancing</code> checkbox on the material. From code — <code>Graphics.RenderMeshInstanced</code> or the old <code>DrawMeshInstanced</code> (up to 1023 instances per call). Automatically drawn instances are split into batches by constant buffer size — usually up to 500.</p>
      <p><b>The URP trap:</b> the SRP Batcher has higher priority. If an object is SRP Batcher compatible, the instancing checkbox on it does nothing. Instancing kicks in if you disable the SRP Batcher, make the shader incompatible — or if the object has a MaterialPropertyBlock. The most convenient option in Unity 6 is the GPU Resident Drawer: it does the instancing for you.</p>`,
    ru: `<p>Если у объектов <b>один и тот же меш и один и тот же материал</b>, GPU может нарисовать их все одним вызовом. Меш отправляется один раз, а к нему прикладывается массив per-instance данных: матрицы и, по желанию, свои свойства (цвет, масштаб). Вершинный шейдер сам берёт нужную матрицу по индексу инстанса.</p>
      <p>Включается галочкой <code>Enable GPU Instancing</code> на материале. Из кода — <code>Graphics.RenderMeshInstanced</code> или старый <code>DrawMeshInstanced</code> (до 1023 инстансов за вызов). Автоматически рисуемые инстансы режутся на батчи по размеру constant buffer — обычно до 500 штук.</p>
      <p><b>Ловушка в URP:</b> у SRP Batcher приоритет выше. Если объект совместим с SRP Batcher, галочка instancing на нём ничего не делает. Instancing сработает, если отключить SRP Batcher, сделать шейдер несовместимым — или у объекта есть MaterialPropertyBlock. Самый удобный вариант в Unity 6 — GPU Resident Drawer: он делает instancing сам.</p>`
  },
  'inst.facts': {
    en: `<div><span class="k save">Saves</span><p>Draw calls and SetPass for masses of identical objects: grass, trees, rocks, crowds of bullets.</p></div>
      <div><span class="k cost">Costs</span><p>A per-instance buffer every frame and extra shader variants. With few copies of a mesh there is almost no gain.</p></div>
      <div><span class="k need">Needs</span><p>One mesh + one material, a MeshRenderer (not skinned), a shader with instancing support.</p></div>`,
    ru: `<div><span class="k save">Экономит</span><p>Draw calls и SetPass при массовых одинаковых объектах: трава, деревья, камни, толпы пуль.</p></div>
      <div><span class="k cost">Цена</span><p>Per-instance буфер каждый кадр, дополнительные шейдерные варианты. На мешах с малым числом копий выгоды почти нет.</p></div>
      <div><span class="k need">Условия</span><p>Один меш + один материал, MeshRenderer (не skinned), шейдер с поддержкой instancing.</p></div>`
  },
  'inst.canvasAria': { en: 'Instance field: colour shows which draw call an instance landed in', ru: 'Поле инстансов: цвет показывает, в какой draw call попал инстанс' },
  'inst.count': { en: 'Instances', ru: 'Инстансов' },
  'inst.meshes': { en: '3 different meshes', ru: '3 разных меша' },
  'inst.colors': { en: 'Per-instance colour', ru: 'Свой цвет у каждого' },
  'inst.limit': { en: 'Limit 1023 (DrawMeshInstanced)', ru: 'Лимит 1023 (DrawMeshInstanced)' },
  'inst.out': {
    en: (draws, n, size, per, colored, meshes) => `Draw calls: <b>${fmtI(draws)}</b> instead of <b>${fmtI(n)}</b><br>Per-instance buffer: <b>${size}</b> per frame (${per} B per instance: 2 matrices${colored ? ' + colour' : ''})<br>Mesh on the GPU: <b>1 copy</b>${meshes > 1 ? ' of each of the 3' : ''}`,
    ru: (draws, n, size, per, colored, meshes) => `Draw calls: <b>${fmtI(draws)}</b> вместо <b>${fmtI(n)}</b><br>Per-instance буфер: <b>${size}</b> за кадр (${per} Б на инстанс: 2 матрицы${colored ? ' + цвет' : ''})<br>Меш на GPU: <b>1 копия</b>${meshes > 1 ? ' каждого из 3' : ''}`
  },
  'inst.noteColor': {
    en: 'A per-instance colour is a per-instance property. In Built-in you set it through a MaterialPropertyBlock and <code>UNITY_INSTANCING_BUFFER</code>, and instancing keeps working. In URP, though, a MaterialPropertyBlock kicks the object out of the SRP Batcher. ',
    ru: 'Цвет у каждого инстанса — это per-instance свойство. В Built-in его задают через MaterialPropertyBlock и <code>UNITY_INSTANCING_BUFFER</code>, instancing при этом не ломается. Но в URP MaterialPropertyBlock выбивает объект из SRP Batcher. '
  },
  'inst.notePlain': { en: 'The colour of a dot is the draw call the instance landed in. ', ru: 'Цвет точки — номер draw call, в который попал инстанс. ' },
  'inst.noteMeshes': { en: 'Different meshes are not instanced together — each gets its own series of calls.', ru: 'Разные меши не инстансятся вместе — у каждого своя серия вызовов.' },
  'inst.noteLimit': { en: max => `A limit of ${max} instances per call: the next instance opens a new draw call.`, ru: max => `Лимит ${max} инстансов на вызов: следующий инстанс открывает новый draw call.` },

  'grd.h2': { en: 'GPU Resident Drawer: the data lives on the graphics card', ru: 'GPU Resident Drawer: данные живут на видеокарте' },
  'grd.prose': {
    en: `<p>A Unity 6 feature for URP and HDRP. Under the hood is the <code>BatchRendererGroup</code> API: the data of every suitable <code>MeshRenderer</code> is uploaded into GPU memory once and stays there. Each frame the CPU does almost nothing per object — it only updates what changed.</p>
      <p>Identical mesh + material pairs are instanced automatically, with no checkboxes on materials and no manual code. In the Frame Debugger such calls are labelled <b>Hybrid Batch Group</b>. On top of that you can enable GPU occlusion culling: visibility is decided by the graphics card itself.</p>
      <p>If an object does not qualify (skinned mesh, MaterialPropertyBlock, an unsuitable shader), Unity quietly draws it the normal way. Switched on in the URP Asset → Rendering → <code>GPU Resident Drawer: Instanced Drawing</code>.</p>`,
    ru: `<p>Новая фишка Unity 6 для URP и HDRP. Под капотом — API <code>BatchRendererGroup</code>: данные всех подходящих <code>MeshRenderer</code> один раз загружаются в память GPU и там живут. Каждый кадр CPU почти ничего не делает на объект — обновляет только то, что поменялось.</p>
      <p>Одинаковые меш + материал автоматически рисуются инстансингом, без галочек на материалах и без ручного кода. В Frame Debugger такие вызовы подписаны <b>Hybrid Batch Group</b>. Дополнительно можно включить GPU occlusion culling: видимость проверяет сама видеокарта.</p>
      <p>Если объект не подходит (skinned mesh, MaterialPropertyBlock, неподходящий шейдер), Unity тихо рисует его обычным путём. Включается в URP Asset → Rendering → <code>GPU Resident Drawer: Instanced Drawing</code>.</p>`
  },
  'grd.facts': {
    en: `<div><span class="k save">Saves</span><p>Almost all of the CPU render time for static and rarely-changing MeshRenderers, plus draw calls through automatic instancing.</p></div>
      <div><span class="k cost">Costs</span><p>More shader variants (BRG ones must stay in the build), longer builds, compute shaders required.</p></div>
      <div><span class="k need">Needs</span><p>Forward+, the SRP Batcher enabled, BatchRendererGroup Variants = Keep All, a platform with compute (not OpenGL ES).</p></div>`,
    ru: `<div><span class="k save">Экономит</span><p>Почти всё CPU-время рендера для статичных и редко меняющихся MeshRenderer и draw calls через авто-instancing.</p></div>
      <div><span class="k cost">Цена</span><p>Больше шейдерных вариантов (BRG нужно оставить в сборке), дольше сборка, нужны compute shaders.</p></div>
      <div><span class="k need">Условия</span><p>Forward+, включённый SRP Batcher, BatchRendererGroup Variants = Keep All, платформа с compute (не OpenGL ES).</p></div>`
  },
  'grd.checklist': { en: 'Turn-on checklist', ru: 'Чеклист включения' },
  'grd.result': { en: 'Result', ru: 'Результат' },
  'grd.chkFp': { en: 'Rendering Path: Forward+', ru: 'Rendering Path: Forward+' },
  'grd.chkSrp': { en: 'SRP Batcher enabled', ru: 'SRP Batcher включён' },
  'grd.chkBrg': { en: 'BatchRendererGroup Variants: Keep All', ru: 'BatchRendererGroup Variants: Keep All' },
  'grd.chkCs': { en: 'A platform with compute shaders (not OpenGL ES)', ru: 'Платформа с compute shaders (не OpenGL ES)' },
  'grd.chkMr': { en: 'The object is a MeshRenderer, not a SkinnedMeshRenderer', ru: 'Объект — MeshRenderer, не SkinnedMeshRenderer' },
  'grd.chkMpb': { en: 'No MaterialPropertyBlock', ru: 'Без MaterialPropertyBlock' },
  'grd.badgeNo': { en: 'The GPU Resident Drawer does not work', ru: 'GPU Resident Drawer не работает' },
  'grd.outNo': {
    en: (list, srpOn) => `Not satisfied at the project level: <b>${list}</b>. Everything is drawn the normal SRP Batcher way${srpOn ? '' : ' (or without it at all)'}.`,
    ru: (list, srpOn) => `Не выполнено на уровне проекта: <b>${list}</b>. Всё рисуется обычным путём SRP Batcher${srpOn ? '' : ' (или вообще без него)'}.`
  },
  'grd.badgeFallback': { en: 'Fallback for this object', ru: 'Fallback для этого объекта' },
  'grd.outFallback': {
    en: list => `The project is set up, but this object does not qualify: <b>${list}</b>. Unity will quietly draw it without GPU instancing — the normal way.`,
    ru: list => `Проект настроен, но этот объект не подходит: <b>${list}</b>. Unity тихо нарисует его без GPU instancing — обычным путём.`
  },
  'grd.badgeOk': { en: '✓ Hybrid Batch Group', ru: '✓ Hybrid Batch Group' },
  'grd.outOk': {
    en: 'The object lives in GPU memory through a BatchRendererGroup. Every object with the same mesh and material is drawn by one instanced call, and the CPU spends almost no time per object. In the Frame Debugger look for <b>Hybrid Batch Group</b>.',
    ru: 'Объект живёт в GPU-памяти через BatchRendererGroup. Все объекты с тем же мешем и материалом рисуются одним instanced-вызовом, CPU почти не тратит время на объект. В Frame Debugger ищи <b>Hybrid Batch Group</b>.'
  },
  'chk.yes': { en: 'YES', ru: 'ДА' },
  'chk.no': { en: 'NO', ru: 'НЕТ' },

  /* ---------------- шпаргалка ---------------- */
  'cheat.tag': { en: 'CH.09 // CHEAT SHEET', ru: 'CH.09 // CHEAT SHEET' },
  'cheat.h2': { en: 'Cheat sheet and the order of priority', ru: 'Шпаргалка и порядок приоритета' },
  'cheat.kicker': { en: 'If several techniques fit an object, Unity picks in this order:', ru: 'Если объекту подходит несколько техник, Unity выбирает по порядку:' },
  'cheat.prio1': {
    en: '<span class="n">1</span><h3>SRP Batcher + static batching</h3><p>If they are on and the object is compatible — that is it, nothing else is considered.</p>',
    ru: '<span class="n">1</span><h3>SRP Batcher + static batching</h3><p>Если включены и объект совместим — всё, дальше не смотрим.</p>'
  },
  'cheat.prio2': {
    en: '<span class="n">2</span><h3>GPU instancing</h3><p>Including the GPU Resident Drawer and a hand-written BatchRendererGroup.</p>',
    ru: '<span class="n">2</span><h3>GPU instancing</h3><p>Включая GPU Resident Drawer и ручной BatchRendererGroup.</p>'
  },
  'cheat.prio3': {
    en: '<span class="n">3</span><h3>Dynamic batching</h3><p>The last chance for small meshes.</p>',
    ru: '<span class="n">3</span><h3>Dynamic batching</h3><p>Последний шанс для мелких мешей.</p>'
  },
  'cheat.thTech': { en: 'Technique', ru: 'Техника' },
  'cheat.thSaves': { en: 'What it saves', ru: 'Что экономит' },
  'cheat.thCosts': { en: 'What you pay', ru: 'Чем платишь' },
  'cheat.thNeeds': { en: 'Requirements', ru: 'Условия' },
  'cheat.thWhere': { en: 'Where it works', ru: 'Где работает' },
  'cheat.thDebug': { en: 'Frame Debugger', ru: 'Frame Debugger' },
  'cheat.rows': {
    en: [
      ['stat', 'Static batching', 'Draw calls and buffer switches; per-frame cost is near zero', 'Memory for vertex copies, build size, objects cannot move', 'Static flag, MeshRenderer, shared material; ≤ 64,000 vertices per buffer', 'Built-in, URP, HDRP'],
      ['dyn', 'Dynamic batching', 'Draw calls for tiny moving meshes', 'The CPU transforms vertices every frame and re-uploads them', '≤ 300 vertices and ≤ 900 attributes, one material, first pass', 'Built-in, URP (off by default); absent in HDRP'],
      ['srp', 'SRP Batcher', 'SetPass and constant uploads. Does not reduce draw calls', 'Almost nothing; needs a compatible shader', 'CBUFFER UnityPerMaterial / UnityPerDraw, no MPB, not particles', 'URP, HDRP'],
      ['inst', 'GPU instancing', 'Draw calls and SetPass for identical objects', 'A per-instance buffer, extra shader variants', 'One mesh + one material, MeshRenderer; in URP only past the SRP Batcher', 'Built-in, URP, HDRP'],
      ['grd', 'GPU Resident Drawer', 'Almost all per-object CPU time + automatic instancing', 'Compute shaders, BRG variants in the build, longer builds', 'Forward+, SRP Batcher, MeshRenderer without MPB', 'URP, HDRP · Unity 6+']
    ],
    ru: [
      ['stat', 'Static batching', 'Draw calls и смену буферов; на кадр почти ничего не тратится', 'Память под копии вершин, объём сборки, объекты нельзя двигать', 'Флаг Static, MeshRenderer, общий материал; ≤ 64 000 вершин на буфер', 'Built-in, URP, HDRP'],
      ['dyn', 'Dynamic batching', 'Draw calls для крошечных движущихся мешей', 'CPU трансформирует вершины каждый кадр + повторная заливка', '≤ 300 вершин и ≤ 900 атрибутов, один материал, первый проход', 'Built-in, URP (выкл. по умолчанию); нет в HDRP'],
      ['srp', 'SRP Batcher', 'SetPass и заливку констант. Draw calls не уменьшает', 'Почти ничего; нужен совместимый шейдер', 'CBUFFER UnityPerMaterial / UnityPerDraw, без MPB, не частицы', 'URP, HDRP'],
      ['inst', 'GPU instancing', 'Draw calls и SetPass для одинаковых объектов', 'Per-instance буфер, дополнительные шейдерные варианты', 'Один меш + один материал, MeshRenderer; в URP — только мимо SRP Batcher', 'Built-in, URP, HDRP'],
      ['grd', 'GPU Resident Drawer', 'Почти всё CPU-время на объект + авто-instancing', 'Compute shaders, BRG-варианты в сборке, дольше билд', 'Forward+, SRP Batcher, MeshRenderer без MPB', 'URP, HDRP · Unity 6+']
    ]
  },

  /* ---------------- вопросы ---------------- */
  'qa.tag': { en: 'CH.10 // INTERVIEW', ru: 'CH.10 // INTERVIEW' },
  'qa.h2': { en: 'Questions you will be asked', ru: 'Вопросы, которые спросят' },
  'qa.kicker': { en: 'Answer out loud first, then open the card.', ru: 'Сначала ответь вслух сам, потом открывай.' },
  'qa.items': {
    en: [
      ['What is the difference between a draw call and a SetPass call?', '<p>A draw call is the command “draw this mesh / index range”. A SetPass call is switching the shader pass and the render state (shader, textures, blending, material constants). SetPass is more expensive for the CPU. Having 500 draw calls and 5 SetPass calls is perfectly normal, especially with the SRP Batcher.</p>'],
      ['Does batching speed up the CPU or the GPU?', '<p>The CPU (render thread) first of all: less preparation and fewer state switches. The GPU still draws the same vertices and pixels. If the game is GPU-bound (heavy shaders, overdraw, fill rate), batching barely helps. Look in the Profiler first to see which side is longer.</p>'],
      ['Does the SRP Batcher reduce the number of draw calls?', '<p>No. Every object stays its own call. The SRP Batcher makes those calls cheap: materials sit permanently in GPU memory (<code>UnityPerMaterial</code>) and are re-uploaded only when they change, object data goes out as one large buffer (<code>UnityPerDraw</code>), and a batch survives as long as the shader variant — not the material — stays the same.</p>'],
      ['Why should you avoid MaterialPropertyBlock in URP?', '<p>An object with an MPB becomes incompatible with the SRP Batcher and falls onto the slow path. The better move is separate materials on the same shader (or Material Variants) — the SRP Batcher draws them cheaply anyway. For mass per-instance data use the GPU Resident Drawer / BRG or your own instancing solution.</p>'],
      ['I ticked “Enable GPU Instancing” in URP and there is no instancing. Why?', '<p>The SRP Batcher has higher priority: a compatible object is drawn by it and the instancing checkbox is ignored. Options: disable the SRP Batcher (rarely right), make the shader incompatible, draw via <code>Graphics.RenderMeshInstanced</code>, or switch on the GPU Resident Drawer, which instances automatically.</p>'],
      ['When does static batching hurt?', '<p>When you have many copies of one large mesh: memory grows per copy. When objects are scattered and the camera sees them interleaved — culling breaks the ranges into many calls. When the object has to move. And in Unity 6 with URP/HDRP the documentation suggests turning static batching off in favour of the GPU Resident Drawer.</p>'],
      ['Why is dynamic batching no longer recommended?', '<p>It moves vertex transformation from the GPU to the CPU every frame and re-uploads the result. On modern APIs a draw call is cheaper than that work. The limits are strict: ≤ 300 vertices and ≤ 900 attributes. It only makes sense on weak hardware and for really tiny meshes.</p>'],
      ['What is the order if several techniques fit an object?', '<p>1) SRP Batcher and static batching; 2) GPU instancing, including the GPU Resident Drawer and BatchRendererGroup; 3) dynamic batching.</p>'],
      ['How do you find out why objects did not batch?', '<p>The Frame Debugger: every call has a line explaining why it was not merged with the previous one (different materials, keywords, MPB, static batch and so on). Plus the Stats window (Batches, SetPass calls, Saved by batching), the Profiler (render thread vs GPU) and the Rendering Debugger in URP.</p>'],
      ['What is the GPU Resident Drawer and what does it need?', '<p>A Unity 6 feature: MeshRenderers are drawn through a BatchRendererGroup automatically — data lives on the GPU and identical mesh + material pairs are instanced. It needs Forward+ (in URP), the SRP Batcher enabled, BatchRendererGroup Variants = Keep All, and a platform with compute shaders. Skinned meshes and objects with an MPB take the normal path. In the Frame Debugger it shows as Hybrid Batch Group.</p>'],
      ['How do transparent objects batch?', '<p>Worse than opaque ones: they must be drawn strictly back to front, so Unity cannot reorder them to group by material. Different materials interleaved by depth break the batches.</p>'],
      ['How do you draw 5000 animated characters?', '<p>A SkinnedMeshRenderer is neither instanced nor batched (only the SRP Batcher makes the calls cheaper). For crowds the animation is baked into textures (vertex animation textures) and drawn as a regular mesh through GPU instancing / BRG — then thousands of copies go out in a handful of calls.</p>']
    ],
    ru: [
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
    ]
  },

  /* ---------------- подвал ---------------- */
  'foot.stop': { en: '■ STOP · END OF TAPE 01', ru: '■ STOP · КОНЕЦ КАССЕТЫ 01' },
  'foot.line': { en: 'End of tape 01.', ru: 'Конец кассеты №1.' },
  'foot.sources': { en: 'Facts checked against the Unity 6 documentation:', ru: 'Факты сверены с документацией Unity 6:' }
};
