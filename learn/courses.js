/** Реестр курсов. Новый курс — одна запись здесь и папка с уроками. */
import dotnet from './dotnet/course.js?v=202610072257';

export const COURSES = [
  { id: 'dotnet', badge: '.NET', color: 'var(--gpu)', title: '.NET изнутри', blurb: 'Как код на C# превращается в работающую программу. Для тех, кто только начинает, и для тех, кто пришёл из другого языка.', course: dotnet },
  { id: 'csharp', badge: 'C#', color: 'var(--cpu)', title: 'C# с нуля', blurb: 'Переменные, условия, циклы и классы — по шагу за урок.', soon: true },
  { id: 'unity', badge: 'Unity', color: 'var(--ok)', title: 'Unity для программиста', blurb: 'Жизненный цикл MonoBehaviour, корутины, физика и рендер.', soon: true },
  { id: 'algo', badge: 'Algo', color: 'var(--osd)', title: 'Алгоритмы', blurb: 'Паттерны задач с собеседований — короткими уроками.', soon: true }
];

export const findCourse = id => COURSES.find(c => c.id === id && c.course)?.course;

/** Все уроки курса подряд — для открытия по порядку и поиска «следующего». */
export const lessonsOf = course => course.units.filter(u => !u.soon).flatMap(u => u.lessons);
