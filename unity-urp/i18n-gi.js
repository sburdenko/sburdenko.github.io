/** Tape 04 strings: light probes, APV, leaks, reflection probes, effects. */
import { facts } from './facts.js?v=202609241230';

export const GI = {
  'probes.h2': { en: 'Probes: how moving objects get baked light', ru: 'Probes: как движущиеся объекты получают запечённый свет' },
  'probes.prose': {
    en: '<p>A probe is a point where global illumination was computed at bake time. At runtime a lit URP shader blends the nearest probes. With Mixed lighting, probes are what make a character dark inside the hangar and bright outside.</p><p><b>Light Probe Groups</b> (URP Asset › Lighting › Light Probe System = Light Probe Group) are placed by hand: start with a cube of eight, add probes where dynamic objects go and where lighting changes. The engine finds a tetrahedron of the nearest probes and interpolates <b>one value per object</b> — a large object spanning dark and bright areas gets one colour, like the car door in the book. Unity 6 adds an API to reposition probes of additively loaded scenes.</p><p><b>Adaptive Probe Volumes</b> (Light Probe System = Adaptive Probe Volumes) place probes automatically on a grid, densest near geometry (default subdivisions 1, 3, 9, 27 m), and are sampled <b>per pixel</b>. Add a global volume, bake, inspect with Rendering Debugger › Probe Volumes › Display Probes/Bricks. For control, combine a global volume with coarse spacing and a local one with fine spacing around the action, as the book does around the oasis tent.</p><p><b>Lighting Scenarios</b> store several bakes (day/night) for the same probe positions and switch or blend at runtime through <code>ProbeReferenceVolume</code> — only indirect light changes. <b>Streaming</b> loads APV cells from disk to CPU and CPU to GPU as the camera moves. <b>Sky occlusion</b> bakes how much sky each probe sees so the sky colour can change at runtime (Progressive GPU only; the ambient probe updates live only in Color or Gradient mode).</p>',
    ru: '<p>Probe — точка, где при запекании посчитано глобальное освещение. Во время игры освещённый шейдер URP смешивает ближайшие probes. При Mixed-освещении именно probes делают персонажа тёмным в ангаре и светлым снаружи.</p><p><b>Light Probe Group</b> (URP Asset › Lighting › Light Probe System = Light Probe Group) расставляют вручную: начинают с куба из восьми, добавляют probes там, где ходят динамические объекты и меняется свет. Движок находит тетраэдр ближайших probes и интерполирует <b>одно значение на объект</b> — большой объект на границе тьмы и света получает один цвет, как дверь машины в книге. В Unity 6 есть API для перемещения probes аддитивно загруженных сцен.</p><p><b>Adaptive Probe Volumes</b> (Light Probe System = Adaptive Probe Volumes) расставляют probes автоматически по сетке, гуще возле геометрии (подразделения по умолчанию 1, 3, 9, 27 м), и сэмплируются <b>на пиксель</b>. Добавь глобальный volume, запеки, проверь через Rendering Debugger › Probe Volumes › Display Probes/Bricks. Для контроля комбинируют глобальный volume с крупным шагом и локальный с мелким вокруг места действия, как в книге вокруг шатра в оазисе.</p><p><b>Lighting Scenarios</b> хранят несколько запеканий (день/ночь) при тех же позициях probes и переключаются или смешиваются во время игры через <code>ProbeReferenceVolume</code> — меняется только непрямой свет. <b>Streaming</b> подгружает ячейки APV с диска в CPU и из CPU в GPU по мере движения камеры. <b>Sky occlusion</b> запекает, сколько неба видит каждый probe, чтобы цвет неба менялся во время игры (только Progressive GPU; ambient probe обновляется вживую только в режиме Color или Gradient).</p>',
  },
  'probes.table': {
    en: '<tr><td>Slow to place, must be moved when geometry changes</td><td>Placed in seconds, rebaked when geometry changes</td></tr><tr><td>One interpolated value per object</td><td>Every pixel sampled — smooth transitions, volumetrics work</td></tr><tr><td>Statics use lightmaps, only dynamics use probes</td><td>One solution for all objects, no lightmap UVs needed</td></tr><tr><td>Probes can be moved at runtime</td><td>Grid positions are fixed at runtime</td></tr><tr><td>No GI switching</td><td>Lighting Scenarios: day/night, lights on/off</td></tr>',
    ru: '<tr><td>Долго расставлять, двигать при изменении геометрии</td><td>Расставляются за секунды, перезапекаются при изменениях</td></tr><tr><td>Одно интерполированное значение на объект</td><td>Каждый пиксель сэмплируется — плавные переходы, работают объёмные эффекты</td></tr><tr><td>Статика на lightmaps, probes только у динамики</td><td>Одно решение для всех объектов, UV для lightmap не нужны</td></tr><tr><td>Probes можно двигать во время игры</td><td>Позиции сетки во время игры фиксированы</td></tr><tr><td>Нет переключения GI</td><td>Lighting Scenarios: день/ночь, свет вкл/выкл</td></tr>',
  },
  'probes.labTag': { en: 'INTERACTIVE · PER OBJECT VS PER PIXEL', ru: 'ИНТЕРАКТИВ · НА ОБЪЕКТ ИЛИ НА ПИКСЕЛЬ' },
  'probes.labH': { en: 'Slide a long object across the hangar doorway', ru: 'Проведи длинный объект через проём ангара' },
  'probes.position': { en: 'Object position', ru: 'Позиция объекта' },
  'probes.length': { en: 'Object length', ru: 'Длина объекта' },
  'probes.canvas': { en: 'Dark hangar opening into daylight with probes and a long object', ru: 'Тёмный ангар, выходящий на свет, с probes и длинным объектом' },
  'probes.osd': { en: 'BAKED INDIRECT LIGHT', ru: 'ЗАПЕЧЁННЫЙ НЕПРЯМОЙ СВЕТ' },
  'probes.hangar': { en: 'HANGAR', ru: 'АНГАР' },
  'probes.outside': { en: 'DAYLIGHT', ru: 'ДНЕВНОЙ СВЕТ' },
  'probes.anchor': { en: 'anchor · one sample', ru: 'якорь · один сэмпл' },
  'probes.truth': { en: 'ground truth under the object', ru: 'истинный свет под объектом' },
  'probes.error': { en: n => `ERROR ${n}%`, ru: n => `ОШИБКА ${n}%` },
  'probes.explain.group': {
    en: 'Light Probe Group: the whole renderer takes the value interpolated at its anchor. Put the object across the doorway — one half is too bright, the other too dark.',
    ru: 'Light Probe Group: весь renderer получает значение, интерполированное в якорной точке. Поставь объект поперёк проёма — одна половина слишком светлая, другая слишком тёмная.',
  },
  'probes.explain.apv': {
    en: 'APV: every pixel samples the probe grid at its own position, so the gradient follows the object. The cost is probe memory and a denser grid near geometry.',
    ru: 'APV: каждый пиксель сэмплирует сетку probes в своей позиции, и градиент идёт вдоль объекта. Цена — память под probes и более плотная сетка возле геометрии.',
  },

  'leak.labTag': { en: 'INTERACTIVE · APV LIGHT LEAK', ru: 'ИНТЕРАКТИВ · ПРОТЕЧКА СВЕТА APV' },
  'leak.labH': { en: 'A dark room, a bright yard, one wall — make the inner wall pixel stop glowing', ru: 'Тёмная комната, светлый двор, одна стена — убери свечение пикселя на внутренней стене' },
  'leak.spacing': { en: 'PROBE SPACING', ru: 'ШАГ PROBES' },
  'leak.thickness': { en: 'Wall thickness', ru: 'Толщина стены' },
  'leak.canvas': { en: 'Cross-section through a wall with probes on both sides and the sampled pixel', ru: 'Разрез стены с probes по обе стороны и сэмплируемым пикселем' },
  'leak.fixes': {
    en: { virtualOffset: 'Virtual Offset (move capture point out of geometry)', dilation: 'Dilation (fill invalid probes from neighbours)', renderingLayers: 'Rendering Layers (interior mask)' },
    ru: { virtualOffset: 'Virtual Offset (вынести точку захвата из геометрии)', dilation: 'Dilation (заполнить невалидные probes соседями)', renderingLayers: 'Rendering Layers (маска интерьера)' },
  },
  'leak.inside': { en: 'INSIDE · DARK', ru: 'ВНУТРИ · ТЕМНО' },
  'leak.outside': { en: 'OUTSIDE · BRIGHT', ru: 'СНАРУЖИ · СВЕТЛО' },
  'leak.pixel': { en: 'wall pixel and its sample point →', ru: 'пиксель стены и точка сэмпла →' },
  'leak.truth': { en: 'Should be', ru: 'Должно быть' },
  'leak.truthD': { en: 'inside light level', ru: 'уровень света внутри' },
  'leak.sampled': { en: 'APV gives', ru: 'APV даёт' },
  'leak.error': { en: 'Leak', ru: 'Протечка' },
  'leak.errorD': { en: 'of the outside light', ru: 'от уровня снаружи' },
  'leak.dark': { en: 'too dark', ru: 'слишком темно' },
  'leak.explainLeak': {
    en: 'The pixel blends a probe from the bright side of the wall. Fixes from the book, in the order to try: thicker walls, an <b>Adaptive Probe Volume Options</b> override with NormalBias (push the sample along the normal) and ViewBias (towards the camera), Virtual Offset and Dilation, and best of all <b>Rendering Layers</b> — up to four masks so interior objects never sample exterior probes. Debug it with Rendering Debugger › Probe Volumes › Debug Probe Sampling.',
    ru: 'Пиксель подмешивает probe со светлой стороны стены. Решения из книги в порядке проб: толще стены, переопределение <b>Adaptive Probe Volume Options</b> с NormalBias (сдвиг сэмпла по нормали) и ViewBias (к камере), Virtual Offset и Dilation, а лучше всего — <b>Rendering Layers</b>: до четырёх масок, чтобы объекты интерьера не сэмплировали probes снаружи. Отладка — Rendering Debugger › Probe Volumes › Debug Probe Sampling.',
  },
  'leak.explainDark': {
    en: 'The nearest probe sits inside the wall, sees back faces and is <b>invalid</b> — it reads black. Turn on Virtual Offset or Dilation, or use a Probe Adjustment Volume to invalidate it on purpose.',
    ru: 'Ближайший probe стоит внутри стены, видит обратные грани и <b>невалиден</b> — он чёрный. Включи Virtual Offset или Dilation либо используй Probe Adjustment Volume, чтобы специально его инвалидировать.',
  },
  'leak.explainOk': {
    en: 'The pixel only uses interior probes now. Rendering Layers are the robust fix; bias values are per-Volume tweaks that can shift the problem elsewhere.',
    ru: 'Теперь пиксель использует только probes интерьера. Rendering Layers — надёжное решение; bias — настройка Volume, которая может перенести проблему в другое место.',
  },
  'probes.more': {
    en: '<h3>Reflection probes</h3><p>Real-time reflections use pre-rendered cubemaps. A single sky cubemap makes a robot’s metal parts reflect sky inside a hangar; a <b>Reflection Probe</b> placed in the hangar captures the local surroundings. Bake it after placing.</p><p><b>Blending</b> fades between two probes as an object crosses zones (always on in Forward+). <b>Box Projection</b> treats the cubemap as a finite box — size it to the room — so reflections of walls grow as the object approaches. Use the smallest cubemap resolution that survives the closest camera view.</p>',
    ru: '<h3>Reflection probes</h3><p>Отражения в реальном времени берутся из заранее отрендеренных cubemap. С одним cubemap неба металл робота отражает небо даже в ангаре; <b>Reflection Probe</b> в ангаре захватывает локальное окружение. После размещения его запекают.</p><p><b>Blending</b> плавно переходит между двумя probes, когда объект пересекает зоны (в Forward+ всегда включён). <b>Box Projection</b> считает cubemap коробкой конечного размера — подгони под комнату, — и отражения стен растут при приближении объекта. Бери минимальное разрешение cubemap, которое выдерживает самый близкий ракурс.</p>',
  },
  'probes.reflections': {
    en: facts('en', 'Local, believable reflections and indirect light for dynamic objects at almost no runtime cost.', 'Bake time, probe and cubemap memory, and light leaks with a coarse APV grid.', 'Probes where lighting changes, APV Rendering Layers for interiors, smallest reflection cubemaps that still look right.'),
    ru: facts('ru', 'Локальные правдоподобные отражения и непрямой свет для динамики почти без затрат во время игры.', 'Время запекания, память под probes и cubemap, протечки света при крупной сетке APV.', 'Probes там, где меняется свет, Rendering Layers APV для интерьеров, минимальные cubemap отражений.'),
  },

  'effects.h2': { en: 'Pick the right tool for the look', ru: 'Подбери инструмент под эффект' },
  'effects.kicker': {
    en: 'The lighting chapter ends with a toolbox: SRP lens flares, screen space lens flares, halos, SSAO and decals. Choose what you want to see — get the tool, the setup steps from the book and what it costs.',
    ru: 'Глава об освещении заканчивается набором инструментов: lens flare SRP, screen space lens flare, ореолы, SSAO и декали. Выбери, что хочешь увидеть, — получишь инструмент, шаги из книги и цену.',
  },
  'effects.use': { en: 'TOOL', ru: 'ИНСТРУМЕНТ' },
  'effects.cost': { en: 'COST / CATCH', ru: 'ЦЕНА / ПОДВОХ' },
  'effects.items': {
    en: {
      lightFlare: ['A flare from a specific light', 'Lens Flare (SRP)', ['Create › Rendering › Lens Flare (SRP) data asset', 'Add elements: Circle, Polygon or Image; set Tint and Intensity', 'On the light: Add Component › Rendering › Lens Flare (SRP)', 'Assign the data asset'], 'Per-light setup; tedious for many lights. Occlusion is tested per flare.'],
      brightFlare: ['Flares from anything bright — speculars, emissives', 'Screen Space Lens Flare override', ['Use the Default Volume (Project Settings › Graphics) or a scene Volume', 'Add Override › Post-processing › Screen Space Lens Flare', 'Set Intensity above 0; tune flares, warped flares and streaks', 'Can be combined with Lens Flare (SRP)'], 'A full-screen post pass; mind the cost on mobile.'],
      halo: ['A soft glow around a lamp', 'Fresnel transparency sphere (Shader Graph)', ['URP has no Draw Halo on lights', 'Unlit Shader Graph, Surface Type Transparent', 'Fresnel Effect → One Minus → Power → Multiply(Strength) → Alpha', 'Put a sphere with this material around the light, or use a billboard'], 'A transparent object: overdraw and sorting like any transparent.'],
      crevices: ['Contact darkening in gaps and corners', 'Screen Space Ambient Occlusion Renderer Feature', ['Renderer Data › Add Renderer Feature › SSAO', 'Intensity, Radius, Falloff Distance, Direct Lighting Strength', 'Quality: Source, Downsample, After Opaque, Blur Quality, Samples', 'A lower Radius and Falloff Distance are cheaper'], 'Needs depth (and normals); a full-screen pass that can break native pass merging.'],
      decal: ['Bullet holes, signs, cracks on curved surfaces', 'URP Decal Projector + Decal Renderer Feature', ['Renderer Data › Add Renderer Feature › Decal', 'Hierarchy › Rendering › URP Decal Projector; set Width, Height, Projection Depth', 'Material from Shader Graphs/Decal', 'Enable Use Rendering Layers to limit which meshes receive it'], 'Technique Automatic picks Screen Space on GPUs with hidden surface removal to avoid a depth prepass.'],
      highlight: ['Make one pickup stand out in the dark', 'Rendering Layers on a light', ['URP Asset › Lighting › Advanced Properties › Use Rendering Layers', 'Name a layer in Tags and Layers', 'Light Inspector › Rendering Layers', 'Object’s Rendering Layer Mask (also settable from code)'], 'Needs the layer feature enabled; one more light to budget.'],
      seeBehind: ['See the hero through walls', 'Two Render Objects Renderer Features', ['Put the hero on a SeeBehind layer; remove it from Opaque Layer Mask', 'Render Objects #1: AfterRenderingOpaques, Override Material, Depth Test Greater, no depth write', 'Render Objects #2: same layer, no overrides — draws the visible hero'], 'Two extra draws of that layer; the order of features matters.'],
      fullscreen: ['A custom full-screen tint or distortion', 'Full Screen Pass Renderer Feature + Fullscreen Shader Graph', ['Create › Shader Graph › URP › Fullscreen Shader Graph', 'URP Sample Buffer (BlitSource) → your math → output', 'Renderer Data › Add Renderer Feature › Full Screen Pass', 'Assign the material and injection point'], 'Reads the colour as a texture — the book shows how framebuffer fetch keeps passes merged.'],
      smoke: ['Smoke that reacts to scene lights', 'Six Way Shader Graph (+ VFX Graph)', ['Bake six-way lightmaps in Houdini, Blender or EmberGen', 'Create a Six Way Shader Graph', 'Use it on VFX Graph particles'], 'Six-way textures per effect; more expensive than unlit smoke.'],
    },
    ru: {
      lightFlare: ['Блик от конкретного источника', 'Lens Flare (SRP)', ['Create › Rendering › Lens Flare (SRP) — ассет данных', 'Добавь элементы: Circle, Polygon или Image; настрой Tint и Intensity', 'На источнике: Add Component › Rendering › Lens Flare (SRP)', 'Назначь ассет данных'], 'Настройка на каждый источник; утомительно для многих. Перекрытие проверяется на каждый блик.'],
      brightFlare: ['Блики от всего яркого — specular, emissive', 'Переопределение Screen Space Lens Flare', ['Используй Default Volume (Project Settings › Graphics) или Volume в сцене', 'Add Override › Post-processing › Screen Space Lens Flare', 'Intensity больше 0; настрой flares, warped flares и streaks', 'Можно сочетать с Lens Flare (SRP)'], 'Полноэкранный пост-проход; следи за ценой на мобильных.'],
      halo: ['Мягкий ореол вокруг лампы', 'Прозрачная сфера с Fresnel (Shader Graph)', ['У источников URP нет Draw Halo', 'Unlit Shader Graph, Surface Type Transparent', 'Fresnel Effect → One Minus → Power → Multiply(Strength) → Alpha', 'Сфера с этим материалом вокруг источника или билборд'], 'Прозрачный объект: overdraw и сортировка, как у любой прозрачности.'],
      crevices: ['Затемнение в щелях и углах', 'Renderer Feature Screen Space Ambient Occlusion', ['Renderer Data › Add Renderer Feature › SSAO', 'Intensity, Radius, Falloff Distance, Direct Lighting Strength', 'Quality: Source, Downsample, After Opaque, Blur Quality, Samples', 'Меньшие Radius и Falloff Distance дешевле'], 'Нужны depth (и нормали); полноэкранный проход, который может сломать слияние native passes.'],
      decal: ['Пулевые отверстия, надписи, трещины на кривых поверхностях', 'URP Decal Projector + Decal Renderer Feature', ['Renderer Data › Add Renderer Feature › Decal', 'Hierarchy › Rendering › URP Decal Projector; Width, Height, Projection Depth', 'Материал из Shader Graphs/Decal', 'Use Rendering Layers ограничивает, какие меши его получают'], 'Technique Automatic выбирает Screen Space на GPU с удалением невидимых поверхностей, чтобы не делать depth prepass.'],
      highlight: ['Выделить предмет в темноте', 'Rendering Layers у источника', ['URP Asset › Lighting › Advanced Properties › Use Rendering Layers', 'Назови слой в Tags and Layers', 'Light Inspector › Rendering Layers', 'Rendering Layer Mask объекта (можно и из кода)'], 'Нужно включить слои; ещё один источник в бюджете.'],
      seeBehind: ['Видеть героя сквозь стены', 'Два Renderer Feature Render Objects', ['Героя — на слой SeeBehind; убрать его из Opaque Layer Mask', 'Render Objects #1: AfterRenderingOpaques, Override Material, Depth Test Greater, без записи глубины', 'Render Objects #2: тот же слой, без переопределений — рисует видимого героя'], 'Две дополнительные отрисовки слоя; порядок фич важен.'],
      fullscreen: ['Свой полноэкранный тинт или искажение', 'Full Screen Pass Renderer Feature + Fullscreen Shader Graph', ['Create › Shader Graph › URP › Fullscreen Shader Graph', 'URP Sample Buffer (BlitSource) → твоя формула → выход', 'Renderer Data › Add Renderer Feature › Full Screen Pass', 'Назначь материал и точку внедрения'], 'Читает цвет как текстуру — книга показывает, как framebuffer fetch сохраняет слияние проходов.'],
      smoke: ['Дым, реагирующий на свет сцены', 'Six Way Shader Graph (+ VFX Graph)', ['Запеки six-way lightmaps в Houdini, Blender или EmberGen', 'Создай Six Way Shader Graph', 'Используй на частицах VFX Graph'], 'Шесть направлений в текстурах на эффект; дороже unlit-дыма.'],
    },
  },
  'effects.gloss': {
    en: '<div><dt>SSAO settings</dt><dd><b>Radius</b> — how far to sample normals around the pixel; smaller is faster. <b>Falloff Distance</b> — no AO beyond it; lower helps scenes with many distant objects. <b>Direct Lighting Strength</b> — how visible AO is in lit areas.</dd></div><div><dt>Decal editing modes</dt><dd>Scale, Crop and Pivot/UV buttons in the Decal Projector Inspector; the projector affects every surface in its frustum unless Rendering Layers limit it.</dd></div><div><dt>2D Renderer</dt><dd>URP Asset (with 2D Renderer), 2D lights and shadows, Sprite-Lit-Default / Sprite-Unlit-Default / Sprite-Mask-Default. With no lights a default global light makes Sprite-Lit look unlit.</dd></div>',
    ru: '<div><dt>Настройки SSAO</dt><dd><b>Radius</b> — насколько далеко сэмплировать нормали вокруг пикселя; меньше — быстрее. <b>Falloff Distance</b> — дальше AO нет; меньшее значение помогает сценам с множеством дальних объектов. <b>Direct Lighting Strength</b> — насколько AO заметен на освещённых участках.</dd></div><div><dt>Режимы редактирования декали</dt><dd>Кнопки Scale, Crop и Pivot/UV в инспекторе Decal Projector; проектор действует на все поверхности в своём фрустуме, если Rendering Layers не ограничивают.</dd></div><div><dt>2D Renderer</dt><dd>URP Asset (with 2D Renderer), 2D-свет и тени, Sprite-Lit-Default / Sprite-Unlit-Default / Sprite-Mask-Default. Без источников глобальный свет по умолчанию делает Sprite-Lit похожим на unlit.</dd></div>',
  },
};
