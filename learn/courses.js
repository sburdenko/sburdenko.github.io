/** Реестр курсов. Новый курс — одна запись здесь и папка с уроками. */
import history from './history/course.js?v=202610081418';
import dotnet from './dotnet/course.js?v=202610081418';
import asyncCourse from './async/course.js?v=202610081418';
import csharp from './csharp/course.js?v=202610081418';
import avalonia from './avalonia/course.js?v=202610081418';
import formats3d from './formats/course.js?v=202610081418';

/** Группы на полке курсов — по порядку показа. */
export const GROUPS = [
  { id: 'net', title: '.NET и C#', blurb: 'Откуда взялся .NET, как он работает внутри, язык C#, асинхронность и интерфейсы.' },
  { id: 'gfx', title: '3D и графика', blurb: 'Форматы 3D-моделей: от меша до BIM и облаков точек.' },
  { id: 'more', title: 'Ещё', blurb: 'Скоро на полке.' }
];

export const COURSES = [
  { id: 'history', group: 'net', badge: '1→10', color: '#ffb86b', title: 'История .NET', blurb: 'От .NET Framework 1.0 до .NET 10: Mono и Unity, .NET Core, почему .NET Standard 2.1 есть в Unity, но не во Framework, и на чём сейчас Revit. Листаешь годы и подбираешь TargetFrameworks под Revit, Unity и .NET 10.', course: history },
  { id: 'dotnet', group: 'net', badge: '.NET', color: 'var(--gpu)', title: '.NET изнутри', blurb: 'Как код на C# превращается в работающую программу. Для тех, кто только начинает, и для тех, кто пришёл из другого языка.', course: dotnet },
  { id: 'csharp', group: 'net', badge: 'C#', color: 'var(--cpu)', title: 'C# глубже', blurb: 'Для тех, кто уже пишет на C#: дженерики и ограничения, делегаты и замыкания, LINQ и его цена, Span и защитные копии, pattern matching и новое в C# 12–14. Подбираешь where, ловишь замыкание в for, считаешь вызовы Where и переставляешь ветки switch.', course: csharp },
  { id: 'async', group: 'net', badge: 'async', color: '#b28dff', title: 'Async/await до дна', blurb: 'От «зачем вообще асинхронность» до машины состояний, SynchronizationContext, deadlock с .Result и async в Unity. Двигаешь время, ловишь deadlock и шагаешь по MoveNext.', course: asyncCourse },
  { id: 'avalonia', group: 'net', badge: 'AXAML', color: '#8b5cf6', title: 'Avalonia: основы', blurb: 'Кросс-платформенный UI на C# и XAML для Windows, macOS, Linux и не только. Двигаешь колонки Grid, выбираешь панели, чинишь привязки, которые не обновляют экран, и подбираешь селекторы стилей.', course: avalonia },
  { id: 'formats3d', group: 'gfx', badge: '3D', color: '#7fd4ff', title: '3D-форматы', blurb: 'Меши, CAD, BIM и облака точек: чем glTF отличается от FBX, STEP от STL, а IFC от GLB. Собираешь меш руками, тесселируешь цилиндр, ищешь коллизии и считаешь размер скана.', course: formats3d },
  { id: 'unity', group: 'more', badge: 'Unity', color: 'var(--ok)', title: 'Unity для программиста', blurb: 'Жизненный цикл MonoBehaviour, корутины, физика и рендер.', soon: true },
  { id: 'algo', group: 'more', badge: 'Algo', color: 'var(--osd)', title: 'Алгоритмы', blurb: 'Паттерны задач с собеседований — короткими уроками.', soon: true }
];

export const findCourse = id => COURSES.find(c => c.id === id && c.course)?.course;

/** Все уроки курса подряд — для открытия по порядку и поиска «следующего». */
export const lessonsOf = course => course.units.filter(u => !u.soon).flatMap(u => u.lessons);
