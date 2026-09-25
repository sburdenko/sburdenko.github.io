/** Tape 04 strings: shadows, shadow atlas, light modes, rendering layers. */
import { facts } from './facts.js?v=202609252015';

const LEVEL = { en: ['low', 'medium', 'high'], ru: ['низкая', 'средняя', 'высокая'] };

export const LIGHT = {
  'shadow.h2': { en: 'A shadow map is a fixed sheet you keep stretching', ru: 'Shadow map — фиксированный лист, который ты растягиваешь' },
  'shadow.prose': {
    en: '<p>Lights are split into one <b>Main Light</b> — the brightest directional light or the <i>Sun Source</i> in the Lighting window — and <b>Additional Lights</b>. Shadows are configured mostly in the URP Asset: set Main Light to Per Pixel, tick Cast Shadows, pick the shadow map resolution. Cost grows with the number of casters inside Shadow Distance, the visible receivers, cascade splits and soft-shadow filtering.</p><p><b>Max Distance</b> is in scene units and should match what the player actually sees: the book’s poles 10 units apart show that at 400 units the same map covers so much ground that near shadows fall apart, while 60 is enough. <b>Cascades</b> give near objects a bigger share of the map; one cascade is best for a small room, two or three for a long view. With the metric working unit, end the last cascade at the last shadow caster. Higher resolution is not always better — with Soft Shadows on, 1024 already looked too crisp in the book’s room.</p><p><b>Additional lights</b> cast shadows only in Per Pixel mode, and only Spot and Point lights do — URP has no shadows for additional directional lights. A Point light renders six maps (a cube). All of them go into one <b>shadow atlas</b>; each map’s size comes from three resolution tiers in the URP Asset combined with the light’s own Low/Medium/High choice. Unity 6 adds Soft Shadows Quality Low/Medium/High.</p>',
    ru: '<p>Источники делятся на один <b>Main Light</b> — самый яркий направленный свет или <i>Sun Source</i> в окне Lighting — и <b>Additional Lights</b>. Тени в основном настраиваются в URP Asset: Main Light в Per Pixel, галочка Cast Shadows, разрешение shadow map. Цена растёт с числом отбрасывающих тень объектов в пределах Shadow Distance, видимых получателей, разбиением на каскады и фильтрацией мягких теней.</p><p><b>Max Distance</b> задаётся в единицах сцены и должна соответствовать тому, что игрок реально видит: столбы через 10 единиц в книге показывают, что при 400 та же карта покрывает столько земли, что ближние тени разваливаются, а 60 уже достаточно. <b>Каскады</b> отдают ближним объектам большую долю карты; для маленькой комнаты лучше один каскад, для длинного вида — два-три. В метрических единицах последний каскад заканчивают на последнем объекте, отбрасывающем тень. Большее разрешение не всегда лучше — с Soft Shadows комната в книге уже при 1024 выглядела слишком резкой.</p><p><b>Дополнительные источники</b> отбрасывают тени только в режиме Per Pixel и только Spot и Point — теней от дополнительных направленных источников в URP нет. Point рисует шесть карт (куб). Все они попадают в один <b>атлас теней</b>; размер каждой карты — это три уровня разрешения в URP Asset вместе с выбором Low/Medium/High на самом источнике. В Unity 6 появилось качество мягких теней Low/Medium/High.</p>',
  },
  'shadow.facts': {
    en: facts('en', 'Real-time shadows for moving objects and moving lights.', 'One more render of every caster per shadow view: cascades, spot views, six views per point light; memory for the map and the atlas.', 'Shadow Distance close to what is visible, cascades for long views, the smallest resolution that looks right with soft shadows.'),
    ru: facts('ru', 'Тени в реальном времени для движущихся объектов и источников.', 'Ещё одна отрисовка всех объектов с тенью на каждый вид: каскады, spot, шесть видов на point; память под карту и атлас.', 'Shadow Distance по видимой дальности, каскады для длинных видов, минимальное разрешение, которое выглядит нормально с мягкими тенями.'),
  },
  'shadow.labTag': { en: 'INTERACTIVE · MAIN LIGHT SHADOWS', ru: 'ИНТЕРАКТИВ · ТЕНИ ОСНОВНОГО СВЕТА' },
  'shadow.labH': { en: 'Stretch the distance and watch the near shadow lose detail', ru: 'Растяни дальность и смотри, как ближняя тень теряет детали' },
  'shadow.distance': { en: 'Max Distance', ru: 'Max Distance' },
  'shadow.resolution': { en: 'Shadow resolution', ru: 'Разрешение карты' },
  'shadow.cascades': { en: 'Cascade count', ru: 'Число каскадов' },
  'shadow.soft': { en: 'Soft Shadows', ru: 'Soft Shadows' },
  'shadow.canvas': { en: 'Ground plane in perspective with cascade bands and three shadow casters', ru: 'Земля в перспективе с полосами каскадов и тремя объектами с тенью' },
  'shadow.frustum': { en: 'CAMERA VIEW · CASCADES', ru: 'ВИД КАМЕРЫ · КАСКАДЫ' },
  'shadow.cascadeLabel': { en: (i, from, to, res) => `C${i} · ${from}–${to} m · ${res}px`, ru: (i, from, to, res) => `C${i} · ${from}–${to} м · ${res}px` },
  'shadow.cutoff': { en: m => `SHADOWS END · ${m} m`, ru: m => `ТЕНИ ДО · ${m} м` },
  'shadow.noShadow': { en: 'NO SHADOW', ru: 'БЕЗ ТЕНИ' },
  'shadow.caption': {
    en: (n, texels) => `${n}/3 objects cast a shadow. The nearest cascade gives ≈ <b>${texels}</b> texels per metre — the stair-stepping on the near shadow grows as this number falls. Beyond the yellow line objects stay visible, their real-time shadows do not.`,
    ru: (n, texels) => `${n}/3 объектов отбрасывают тень. Ближний каскад даёт ≈ <b>${texels}</b> текселей на метр — чем меньше число, тем сильнее лесенка на ближней тени. За жёлтой линией объекты видны, а их real-time тени — нет.`,
  },
  'shadow.quality.high': { en: 'SHARP', ru: 'РЕЗКО' },
  'shadow.quality.balanced': { en: 'BALANCED', ru: 'БАЛАНС' },
  'shadow.quality.low': { en: 'BLURRY / BLOCKY', ru: 'МЫЛО / ЛЕСЕНКА' },
  'shadow.statMemory': { en: 'Shadow map memory', ru: 'Память карты' },
  'shadow.statMemoryD': { en: '32-bit depth estimate', ru: 'оценка для 32-бит глубины' },
  'shadow.statViews': { en: 'Main light views', ru: 'Видов основного света' },
  'shadow.statViewsD': { en: 'one per cascade', ru: 'по одному на каскад' },
  'shadow.statDensity': { en: 'Texels / metre (near)', ru: 'Текселей / метр (близко)' },
  'shadow.statCost': { en: 'Relative cost', ru: 'Относительная цена' },
  'shadow.statCostD': { en: 'compare settings, not devices', ru: 'сравнивай настройки, не устройства' },
  'shadow.warning.point': { en: (n, maps) => `${n} shadowed point lights add ${maps} views.`, ru: (n, maps) => `${n} point-источников с тенями добавляют ${maps} видов.` },
  'shadow.warning.distance': { en: 'The map is spread over a very long distance — near shadows lose detail. Match Max Distance to what is visible; with Shadowmask, statics beyond it get baked shadows.', ru: 'Карта растянута на очень большую дальность — ближние тени теряют детали. Подгони Max Distance под видимое; в режиме Shadowmask статика за ней получает запечённые тени.' },
  'shadow.warning.cascades': { en: 'A long Max Distance with one cascade wastes most texels far away — try 2 or 3 cascades.', ru: 'Большая Max Distance с одним каскадом тратит большую часть текселей вдали — попробуй 2 или 3 каскада.' },
  'shadow.warning.default': { en: 'A reasonable start. Verify in the target scene on the target device.', ru: 'Разумная отправная точка. Проверь в целевой сцене на целевом устройстве.' },

  'atlas.labTag': { en: 'INTERACTIVE · ADDITIONAL LIGHT SHADOW ATLAS', ru: 'ИНТЕРАКТИВ · АТЛАС ТЕНЕЙ ДОП. ИСТОЧНИКОВ' },
  'atlas.labH': { en: 'Pack the book’s haunted room: one point light, one spot light, a 1024 atlas', ru: 'Упакуй комнату из книги: один point, один spot, атлас 1024' },
  'atlas.add': { en: 'ADD A SHADOWED LIGHT', ru: 'ДОБАВИТЬ ИСТОЧНИК С ТЕНЬЮ' },
  'atlas.book': { en: 'Reset to the book example', ru: 'Вернуть пример из книги' },
  'atlas.canvas': { en: 'Shadow atlas grid with one square per shadow map', ru: 'Сетка атласа теней, по квадрату на карту' },
  'atlas.empty': { en: 'No additional lights cast shadows.', ru: 'Нет дополнительных источников с тенями.' },
  'atlas.out': {
    en: (maps, grid, required, atlas, down, pct) => `${maps} maps → ${grid}×${grid} tiling → needs ${required}px, atlas is ${atlas}px. ${down ? `<b style="color:var(--bad)">Every map shrinks to ${pct}%</b> and URP logs a warning in the Console.` : '<b style="color:var(--ok)">Fits at full tier resolution.</b>'}`,
    ru: (maps, grid, required, atlas, down, pct) => `${maps} карт → сетка ${grid}×${grid} → нужно ${required}px, атлас ${atlas}px. ${down ? `<b style="color:var(--bad)">Каждая карта уменьшается до ${pct}%</b>, а URP пишет предупреждение в Console.` : '<b style="color:var(--ok)">Помещается в полном разрешении уровня.</b>'}`,
  },
  'atlas.thMaps': { en: 'Number of maps', ru: 'Число карт' },
  'atlas.thTiling': { en: 'Atlas tiling', ru: 'Разбиение атласа' },
  'atlas.thSize': { en: 'Atlas size needed', ru: 'Нужный размер атласа' },
  'atlas.table': {
    en: '<tr><td>1</td><td>1×1</td><td>tier size × 1</td></tr><tr><td>2–4</td><td>2×2</td><td>tier size × 2</td></tr><tr><td>5–16</td><td>4×4</td><td>tier size × 4</td></tr>',
    ru: '<tr><td>1</td><td>1×1</td><td>размер уровня × 1</td></tr><tr><td>2–4</td><td>2×2</td><td>размер уровня × 2</td></tr><tr><td>5–16</td><td>4×4</td><td>размер уровня × 4</td></tr>',
  },

  'modes.h2': { en: 'Bake what never changes; decide what stays live', ru: 'Запекай неизменное; решай, что остаётся живым' },
  'modes.prose': {
    en: '<p>Static geometry lit by static lights does not need its lighting recomputed every frame — bake it into <b>lightmaps</b>. Lights have a Mode: <b>Realtime</b>, <b>Baked</b> or <b>Mixed</b>. Mixed lights light static and dynamic objects, and the scene’s <i>Lighting Mode</i> decides what exactly is baked:</p><p><b>Baked Indirect</b> bakes only bounced light into lightmaps and probes; direct light and shadows stay real-time for everything — correct but expensive, not ideal for mobile. <b>Subtractive</b> bakes direct light and shadows from the main mixed directional light into statics and subtracts real-time shadows of dynamic objects, clamped by <i>Realtime Shadow Color</i>; statics cannot shadow dynamic objects except through probes; cheapest, but baked and real-time shadows do not combine correctly. <b>Shadowmask</b> is like Baked Indirect up close and adds a shadowmask texture plus probe occlusion, so statics keep shadows beyond Shadow Distance — highest fidelity, most memory, mid-to-high-end hardware and open worlds.</p><p>Unity 6 adds an interactive lightmap <i>Preview</i> in the Scene view draw modes that does not overwrite the last bake, a GPU <i>Baking Profile</i> trading speed for GPU memory, and replaces the old SkyManager with a default Lighting Data Asset — after changing Skybox environment lighting you must press Generate Lighting yourself. <b>Rendering Layers</b> (URP Asset › Lighting › Advanced Properties) let a light affect only chosen objects, like the book’s syringe highlighted in a dark corner.</p>',
    ru: '<p>Статичную геометрию со статичным светом не нужно пересчитывать каждый кадр — свет запекают в <b>lightmaps</b>. У источника есть Mode: <b>Realtime</b>, <b>Baked</b> или <b>Mixed</b>. Mixed освещает и статику, и динамику, а <i>Lighting Mode</i> сцены решает, что именно запекается:</p><p><b>Baked Indirect</b> запекает только отражённый свет в lightmaps и probes; прямой свет и тени остаются real-time для всех — корректно, но дорого, не лучший выбор для мобильных. <b>Subtractive</b> запекает прямой свет и тени основного mixed направленного источника в статику и вычитает real-time тени динамических объектов, ограничивая затемнение цветом <i>Realtime Shadow Color</i>; статика не отбрасывает тень на динамику, кроме как через probes; самый дешёвый, но запечённые и real-time тени сочетаются некорректно. <b>Shadowmask</b> вблизи как Baked Indirect и добавляет текстуру shadowmask и затенение в probes, поэтому статика сохраняет тени за Shadow Distance — лучшее качество, больше всего памяти, железо среднего и высокого уровня, открытые миры.</p><p>В Unity 6 появился интерактивный <i>Preview</i> lightmap в режимах отображения Scene view, который не затирает прошлое запекание, GPU <i>Baking Profile</i> с выбором между скоростью и памятью GPU, а старый SkyManager заменён Lighting Data Asset по умолчанию — после смены окружения Skybox нужно самому нажать Generate Lighting. <b>Rendering Layers</b> (URP Asset › Lighting › Advanced Properties) позволяют источнику освещать только выбранные объекты — как шприц из книги, подсвеченный в тёмном углу.</p>',
  },
  'modes.steps': {
    en: '<li>Mark environment geometry <b>Static</b> (Contribute GI).</li><li>Window › Rendering › Lighting › Scene: keep Lightmap Resolution low while iterating; use <b>Progressive GPU</b> if supported.</li><li>Filtering removes noise but can open gaps where objects meet — the book suggests <b>A-Trous</b>.</li><li>Static meshes need non-overlapping UVs or <b>Generate Lightmap UVs</b> on import.</li><li>Set lights to <b>Baked</b> or <b>Mixed</b>; for Mixed pick Baked Indirect, Subtractive or Shadowmask.</li><li>Lower <b>Scale In Lightmap</b> for distant objects (the book’s rocks: 0.05–0.5).</li><li><b>Generate Lighting</b>. Bake time grows with statics, lights, lightmap size and resolution, and the direct/indirect/environment sample counts.</li>',
    ru: '<li>Пометь геометрию окружения как <b>Static</b> (Contribute GI).</li><li>Window › Rendering › Lighting › Scene: при подборе держи Lightmap Resolution низким; бери <b>Progressive GPU</b>, если поддерживается.</li><li>Фильтрация убирает шум, но может открыть щели на стыках объектов — книга советует <b>A-Trous</b>.</li><li>Статичным мешам нужны неперекрывающиеся UV или <b>Generate Lightmap UVs</b> при импорте.</li><li>Поставь источникам <b>Baked</b> или <b>Mixed</b>; для Mixed выбери Baked Indirect, Subtractive или Shadowmask.</li><li>Уменьши <b>Scale In Lightmap</b> дальним объектам (камни в книге: 0.05–0.5).</li><li><b>Generate Lighting</b>. Время растёт с числом статики, источников, размером и разрешением lightmap и числом direct/indirect/environment samples.</li>',
  },
  'modes.labTag': { en: 'INTERACTIVE · MIXED LIGHTING MODES', ru: 'ИНТЕРАКТИВ · РЕЖИМЫ СМЕШАННОГО СВЕТА' },
  'modes.labH': { en: 'Walk the character into the pillar’s shadow in every mode', ru: 'Проведи персонажа в тень колонны в каждом режиме' },
  'modes.walk': { en: 'Character position', ru: 'Позиция персонажа' },
  'modes.canvas': { en: 'Side view: sun, static pillar, far pillar beyond shadow distance, moving character', ru: 'Вид сбоку: солнце, статичная колонна, дальняя колонна за дальностью теней, движущийся персонаж' },
  'modes.names': {
    en: { realtime: 'Realtime', bakedIndirect: 'Baked Indirect', shadowmask: 'Shadowmask', subtractive: 'Subtractive', baked: 'Baked' },
    ru: { realtime: 'Realtime', bakedIndirect: 'Baked Indirect', shadowmask: 'Shadowmask', subtractive: 'Subtractive', baked: 'Baked' },
  },
  'modes.cost': {
    en: (runtime, memory) => `RUNTIME ${LEVEL.en[Math.min(2, Math.max(0, runtime - 1))]} · MEMORY ${['none', 'lightmaps', '+ shadowmask'][memory]}`,
    ru: (runtime, memory) => `РАНТАЙМ ${LEVEL.ru[Math.min(2, Math.max(0, runtime - 1))]} · ПАМЯТЬ ${['нет', 'lightmaps', '+ shadowmask'][memory]}`,
  },
  'modes.rows': {
    en: { directStatic: 'Direct light on statics', directDynamic: 'Direct light on dynamics', indirect: 'Bounced (indirect) light', staticOnStatic: 'Static → static shadow, near', farStatic: 'Static shadows beyond Shadow Distance', dynamicOnStatic: 'Dynamic → static shadow', staticOnDynamic: 'Static → dynamic shadow', specular: 'Specular highlight on statics' },
    ru: { directStatic: 'Прямой свет на статике', directDynamic: 'Прямой свет на динамике', indirect: 'Отражённый (непрямой) свет', staticOnStatic: 'Тень статики на статику, вблизи', farStatic: 'Тени статики за Shadow Distance', dynamicOnStatic: 'Тень динамики на статику', staticOnDynamic: 'Тень статики на динамику', specular: 'Блик specular на статике' },
  },
  'modes.cells': {
    en: { rt: 'real-time', baked: 'baked', probe: 'via probes', none: 'none' },
    ru: { rt: 'real-time', baked: 'запечено', probe: 'через probes', none: 'нет' },
  },
  'modes.explain': {
    en: {
      realtime: 'Everything is computed every frame; nothing is baked, so there is no bounced light besides ambient.',
      bakedIndirect: 'Only bounces are baked. Up close it looks like Realtime with GI; beyond Shadow Distance all shadows disappear.',
      shadowmask: 'Same as Baked Indirect near the camera, but the far pillar keeps its shadow from the shadowmask texture. The Quality panel’s Shadowmask Mode chooses Distance Shadowmask (real-time near) or Shadowmask (baked statics everywhere).',
      subtractive: 'Statics are fully baked; the character still casts a real-time shadow, but the pillar cannot shadow the character — probes only darken it approximately.',
      baked: 'Nothing about this light changes at runtime. The character is lit by probes only and casts no shadow from it; no specular highlights on statics.',
    },
    ru: {
      realtime: 'Всё считается каждый кадр; ничего не запечено, поэтому отражённого света нет, кроме ambient.',
      bakedIndirect: 'Запечены только отражения. Вблизи выглядит как Realtime с GI; за Shadow Distance все тени пропадают.',
      shadowmask: 'Вблизи как Baked Indirect, но дальняя колонна сохраняет тень из текстуры shadowmask. Shadowmask Mode в панели Quality выбирает Distance Shadowmask (вблизи real-time) или Shadowmask (статика запечена везде).',
      subtractive: 'Статика запечена полностью; персонаж ещё отбрасывает real-time тень, но колонна не может затенить персонажа — probes лишь приблизительно его затемняют.',
      baked: 'Ничего в этом источнике не меняется во время игры. Персонаж освещён только probes и не отбрасывает от него тень; бликов на статике нет.',
    },
  },
  'modes.walkNote.lit': { en: 'The character stands in direct light.', ru: 'Персонаж стоит под прямым светом.' },
  'modes.walkNote.shadow': { en: 'In the pillar’s shadow: a real shadow map test darkens it correctly.', ru: 'В тени колонны: настоящая проверка shadow map затемняет его правильно.' },
  'modes.walkNote.probe': { en: 'In the pillar’s shadow, but only interpolated probe light darkens it — the edge is soft and approximate.', ru: 'В тени колонны, но затемняет его только интерполированный свет probes — граница мягкая и приблизительная.' },
  'modes.char.lit': { en: 'LIT', ru: 'СВЕТ' },
  'modes.char.shadow': { en: 'SHADOWED', ru: 'В ТЕНИ' },
  'modes.char.probe': { en: 'PROBE-DARKENED', ru: 'ЗАТЕМНЁН PROBES' },
  'modes.pillar': { en: 'STATIC', ru: 'СТАТИКА' },
  'modes.farPillar': { en: 'FAR STATIC', ru: 'ДАЛЬНЯЯ СТАТИКА' },

  'layers.labTag': { en: 'INTERACTIVE · RENDERING LAYERS', ru: 'ИНТЕРАКТИВ · RENDERING LAYERS' },
  'layers.labH': { en: 'Highlight the syringe without lighting the whole corner', ru: 'Подсвети шприц, не освещая весь угол' },
  'layers.light': { en: 'LIGHT · RENDERING LAYERS', ru: 'ИСТОЧНИК · RENDERING LAYERS' },
  'layers.steps': {
    en: 'URP Asset › Lighting › ⁝ Advanced Properties › <b>Use Rendering Layers</b>. Name layers in Project Settings › Tags and Layers › Rendering Layers. A light affects a renderer when their masks share at least one layer. Decals and APV use the same masks.',
    ru: 'URP Asset › Lighting › ⁝ Advanced Properties › <b>Use Rendering Layers</b>. Имена слоёв — Project Settings › Tags and Layers › Rendering Layers. Источник освещает renderer, если у их масок есть хотя бы один общий слой. Декали и APV используют те же маски.',
  },
  'layers.lit': { en: 'receives this light', ru: 'получает этот свет' },
  'layers.unlit': { en: 'ignored by this light', ru: 'этот свет его игнорирует' },
};
