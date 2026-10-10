/**
 * Реестр курсов. Новый курс — одна запись здесь и папка с уроками.
 * Уроки каждого курса лежат в двух вариантах: course.js (русский) и course.en.js (английский);
 * loadCourses(lang) подгружает нужный. Названия и описания — { ru, en }, читаются через tr().
 */
import { tr } from './i18n.js?v=202610101649';

/** Группы на полке курсов — по порядку показа. */
export const GROUPS = [
  { id: 'net', title: { ru: '.NET и C#', en: '.NET and C#' }, blurb: { ru: 'Откуда взялся .NET, как он работает внутри, язык C#, асинхронность и интерфейсы.', en: 'Where .NET came from, how it works inside, the C# language, async code and user interfaces.' } },
  { id: 'gfx', title: { ru: '3D и графика', en: '3D and graphics' }, blurb: { ru: 'Форматы 3D-моделей от меша до BIM и Three.js — 3D прямо в браузере, от первого кубика до шейдеров.', en: '3D model formats from meshes to BIM, and Three.js — 3D right in the browser, from the first cube to shaders.' } },
  { id: 'more', title: { ru: 'Ещё', en: 'More' }, blurb: { ru: 'Скоро в Bathys.', en: 'Coming to Bathys.' } }
];

const loader = (ru, en) => ({ ru, en });

export const COURSES = [
  {
    id: 'history', group: 'net', badge: '1→10', color: '#ffb86b',
    title: { ru: 'История .NET', en: 'The history of .NET' },
    blurb: { ru: 'От .NET Framework 1.0 до .NET 10: Mono и Unity, .NET Core, почему .NET Standard 2.1 есть в Unity, но не во Framework, и на чём сейчас Revit. Листаешь годы и подбираешь TargetFrameworks под Revit, Unity и .NET 10.', en: 'From .NET Framework 1.0 to .NET 10: Mono and Unity, .NET Core, why .NET Standard 2.1 works in Unity but not in the Framework, and what Revit runs on today. Flip through the years and pick TargetFrameworks for Revit, Unity and .NET 10.' },
    load: loader(() => import('./history/course.js?v=202610101649'), () => import('./history/course.en.js?v=202610101649'))
  },
  {
    id: 'dotnet', group: 'net', badge: '.NET', color: 'var(--gpu)',
    title: { ru: '.NET изнутри', en: '.NET under the hood' },
    blurb: { ru: 'Как код на C# превращается в работающую программу. Для тех, кто только начинает, и для тех, кто пришёл из другого языка.', en: 'How C# code turns into a running program. For complete beginners and for people coming from another language.' },
    load: loader(() => import('./dotnet/course.js?v=202610101649'), () => import('./dotnet/course.en.js?v=202610101649'))
  },
  {
    id: 'csharp', group: 'net', badge: 'C#', color: 'var(--cpu)',
    title: { ru: 'C# глубже', en: 'Deeper C#' },
    blurb: { ru: 'Для тех, кто уже пишет на C#: дженерики и ограничения, делегаты и замыкания, LINQ и его цена, Span и защитные копии, pattern matching и новое в C# 12–14. Подбираешь where, ловишь замыкание в for, считаешь вызовы Where и переставляешь ветки switch.', en: 'For people who already write C#: generics and constraints, delegates and closures, LINQ and its cost, Span and defensive copies, pattern matching and what is new in C# 12–14. Pick where clauses, catch the closure in a for loop, count Where calls and reorder switch arms.' },
    load: loader(() => import('./csharp/course.js?v=202610101649'), () => import('./csharp/course.en.js?v=202610101649'))
  },
  {
    id: 'review', group: 'net', badge: 'BUG', color: '#ff7a59',
    title: { ru: 'Ревью кода: найди баг', en: 'Code review: find the bugs' },
    blurb: { ru: 'Четыре настоящих задания с собеседований: ModelManager, ClashService, TileLoader и ClashMarkers. Сначала разбираешь каждую ловушку отдельно — изменяемые структуры, async void, дедлоки, гонки, утечки материалов, — а в финале раздела сам кликаешь строки с багами в полном листинге.', en: 'Four real interview tasks: ModelManager, ClashService, TileLoader and ClashMarkers. First take each trap apart on its own — mutable structs, async void, deadlocks, races, leaked materials — then click the buggy lines yourself in the full listing at the end of each unit.' },
    load: loader(() => import('./review/course.js?v=202610101649'), () => import('./review/course.en.js?v=202610101649'))
  },
  {
    id: 'async', group: 'net', badge: 'async', color: '#b28dff',
    title: { ru: 'Async/await до дна', en: 'Async/await in depth' },
    blurb: { ru: 'От «зачем вообще асинхронность» до машины состояний, SynchronizationContext, deadlock с .Result и async в Unity. Двигаешь время, ловишь deadlock и шагаешь по MoveNext.', en: 'From “why async at all” to the state machine, SynchronizationContext, the .Result deadlock and async in Unity. Move time forward, catch a deadlock and step through MoveNext.' },
    load: loader(() => import('./async/course.js?v=202610101649'), () => import('./async/course.en.js?v=202610101649'))
  },
  {
    id: 'avalonia', group: 'net', badge: 'AXAML', color: '#8b5cf6',
    title: { ru: 'Avalonia: основы', en: 'Avalonia basics' },
    blurb: { ru: 'Кросс-платформенный UI на C# и XAML для Windows, macOS, Linux и не только. Двигаешь колонки Grid, выбираешь панели, чинишь привязки, которые не обновляют экран, и подбираешь селекторы стилей.', en: 'Cross-platform UI in C# and XAML for Windows, macOS, Linux and more. Resize Grid columns, pick panels, fix bindings that do not update the screen and choose style selectors.' },
    load: loader(() => import('./avalonia/course.js?v=202610101649'), () => import('./avalonia/course.en.js?v=202610101649'))
  },
  {
    id: 'formats3d', group: 'gfx', badge: '3D', color: '#7fd4ff',
    title: { ru: '3D-форматы', en: '3D formats' },
    blurb: { ru: 'Меши, CAD, BIM и облака точек: чем glTF отличается от FBX, STEP от STL, а IFC от GLB. Собираешь меш руками, тесселируешь цилиндр, ищешь коллизии и считаешь размер скана.', en: 'Meshes, CAD, BIM and point clouds: how glTF differs from FBX, STEP from STL and IFC from GLB. Build a mesh by hand, tessellate a cylinder, find clashes and estimate the size of a scan.' },
    load: loader(() => import('./formats/course.js?v=202610101649'), () => import('./formats/course.en.js?v=202610101649'))
  },
  {
    id: 'three1', group: 'gfx', badge: 'TJS 1', color: '#9ef0ff',
    title: { ru: 'Three.js: начальный уровень', en: 'Three.js: beginner' },
    blurb: { ru: 'Первая сцена, камера, объекты и иерархия, свет и тени, текстуры и загрузка glTF. На каждом стенде — настоящий Three.js: включаешь строки кода, крутишь fov и far, переносишь Луну к Земле и зажигаешь тени.', en: 'The first scene, the camera, objects and hierarchy, lights and shadows, textures and loading glTF. Every rig runs real Three.js: switch lines of code on, turn fov and far, move the Moon to the Earth and light up shadows.' },
    load: loader(() => import('./three1/course.js?v=202610101649'), () => import('./three1/course.en.js?v=202610101649'))
  },
  { id: 'three2', group: 'gfx', badge: 'TJS 2', color: '#ffd166', soon: true, title: { ru: 'Three.js: средний уровень', en: 'Three.js: intermediate' }, blurb: { ru: 'Карты окружения и HDR, PBR всерьёз, анимации glTF и AnimationMixer, клики по объектам через Raycaster, InstancedMesh и счёт draw calls, постобработка.', en: 'Environment maps and HDR, PBR for real, glTF animations and AnimationMixer, clicking objects with Raycaster, InstancedMesh and counting draw calls, post-processing.' } },
  { id: 'three3', group: 'gfx', badge: 'TJS 3', color: '#ff6b9a', soon: true, title: { ru: 'Three.js: продвинутый уровень', en: 'Three.js: advanced' }, blurb: { ru: 'Свои шейдеры (ShaderMaterial, GLSL), WebGPURenderer и язык TSL, рендер в текстуру, частицы на GPU, физика и React Three Fiber.', en: 'Your own shaders (ShaderMaterial, GLSL), WebGPURenderer and the TSL language, render targets, GPU particles, physics and React Three Fiber.' } },
  { id: 'unity', group: 'more', badge: 'Unity', color: 'var(--ok)', soon: true, title: { ru: 'Unity для программиста', en: 'Unity for programmers' }, blurb: { ru: 'Жизненный цикл MonoBehaviour, корутины, физика и рендер.', en: 'The MonoBehaviour lifecycle, coroutines, physics and rendering.' } },
  { id: 'algo', group: 'more', badge: 'Algo', color: 'var(--osd)', soon: true, title: { ru: 'Алгоритмы', en: 'Algorithms' }, blurb: { ru: 'Паттерны задач с собеседований — короткими уроками.', en: 'Interview problem patterns in short lessons.' } }
];

/**
 * Загружает уроки всех готовых курсов на языке lang в поле course.
 * Если английской версии курса ещё нет, берёт русскую и помечает fallback.
 */
export async function loadCourses(lang) {
  await Promise.all(COURSES.filter(c => c.load).map(async c => {
    let mod;
    try { mod = await c.load[lang](); c.fallback = false; }
    catch { mod = await c.load.ru(); c.fallback = lang !== 'ru'; }
    c.course = mod.default;
  }));
  return COURSES;
}

export const findCourse = id => COURSES.find(c => c.id === id && c.course)?.course;
export const courseTitle = c => tr(c.title);
export const courseBlurb = c => tr(c.blurb);

/** Все уроки курса подряд — для открытия по порядку и поиска «следующего». */
export const lessonsOf = course => course.units.filter(u => !u.soon).flatMap(u => u.lessons);
