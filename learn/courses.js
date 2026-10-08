/** Реестр курсов. Новый курс — одна запись здесь и папка с уроками. */
import dotnet from './dotnet/course.js?v=202610081317';
import asyncCourse from './async/course.js?v=202610081317';
import formats3d from './formats/course.js?v=202610081317';

export const COURSES = [
  { id: 'dotnet', badge: '.NET', color: 'var(--gpu)', title: '.NET изнутри', blurb: 'Как код на C# превращается в работающую программу. Для тех, кто только начинает, и для тех, кто пришёл из другого языка.', course: dotnet },
  { id: 'async', badge: 'async', color: '#b28dff', title: 'Async/await до дна', blurb: 'От «зачем вообще асинхронность» до машины состояний, SynchronizationContext, deadlock с .Result и async в Unity. Двигаешь время, ловишь deadlock и шагаешь по MoveNext.', course: asyncCourse },
  { id: 'formats3d', badge: '3D', color: '#7fd4ff', title: '3D-форматы', blurb: 'Меши, CAD, BIM и облака точек: чем glTF отличается от FBX, STEP от STL, а IFC от GLB. Собираешь меш руками, тесселируешь цилиндр, ищешь коллизии и считаешь размер скана.', course: formats3d },
  { id: 'csharp', badge: 'C#', color: 'var(--cpu)', title: 'C# с нуля', blurb: 'Переменные, условия, циклы и классы — по шагу за урок.', soon: true },
  { id: 'unity', badge: 'Unity', color: 'var(--ok)', title: 'Unity для программиста', blurb: 'Жизненный цикл MonoBehaviour, корутины, физика и рендер.', soon: true },
  { id: 'algo', badge: 'Algo', color: 'var(--osd)', title: 'Алгоритмы', blurb: 'Паттерны задач с собеседований — короткими уроками.', soon: true }
];

export const findCourse = id => COURSES.find(c => c.id === id && c.course)?.course;

/** Все уроки курса подряд — для открытия по порядку и поиска «следующего». */
export const lessonsOf = course => course.units.filter(u => !u.soon).flatMap(u => u.lessons);
