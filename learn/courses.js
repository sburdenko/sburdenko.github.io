/**
 * Реестр курсов. Новый курс — одна запись здесь, данные в content/<курс>/ и тексты каталога
 * (course.<id>.title и course.<id>.blurb) в content/ui/<язык>.json.
 * jsonCourse('id') даёт загрузчик на каждый язык; loadCourses(lang) подгружает нужный.
 */
import { tr } from './i18n.js?v=202610191643';
import { jsonCourse } from './content.js?v=202610191643';
import { bi } from './ui.js?v=202610191643';

/** Группы на полке курсов — по порядку показа. */
export const GROUPS = [
  { id: 'net', title: bi('group.net.title'), blurb: bi('group.net.blurb') },
  { id: 'gfx', title: bi('group.gfx.title'), blurb: bi('group.gfx.blurb') },
  { id: 'more', title: bi('group.more.title'), blurb: bi('group.more.blurb') }
];

export const COURSES = [
  { id: 'history', group: 'net', badge: '1→10', color: '#ffb86b', title: bi('course.history.title'), blurb: bi('course.history.blurb'), load: jsonCourse('history') },
  { id: 'dotnet', group: 'net', badge: '.NET', color: 'var(--gpu)', title: bi('course.dotnet.title'), blurb: bi('course.dotnet.blurb'), load: jsonCourse('dotnet') },
  { id: 'csharp', group: 'net', badge: 'C#', color: 'var(--cpu)', title: bi('course.csharp.title'), blurb: bi('course.csharp.blurb'), load: jsonCourse('csharp') },
  { id: 'review', group: 'net', badge: 'BUG', color: '#ff7a59', title: bi('course.review.title'), blurb: bi('course.review.blurb'), load: jsonCourse('review') },
  { id: 'async', group: 'net', badge: 'async', color: '#b28dff', title: bi('course.async.title'), blurb: bi('course.async.blurb'), load: jsonCourse('async') },
  { id: 'memory', group: 'net', badge: 'MEM', color: '#5dfc9a', title: bi('course.memory.title'), blurb: bi('course.memory.blurb'), load: jsonCourse('memory') },
  { id: 'avalonia', group: 'net', badge: 'AXAML', color: '#8b5cf6', title: bi('course.avalonia.title'), blurb: bi('course.avalonia.blurb'), load: jsonCourse('avalonia') },
  { id: 'formats3d', group: 'gfx', badge: '3D', color: '#7fd4ff', title: bi('course.formats3d.title'), blurb: bi('course.formats3d.blurb'), load: jsonCourse('formats3d') },
  { id: 'three1', group: 'gfx', badge: 'TJS 1', color: '#9ef0ff', title: bi('course.three1.title'), blurb: bi('course.three1.blurb'), load: jsonCourse('three1') },
  { id: 'three2', group: 'gfx', badge: 'TJS 2', color: '#ffd166', soon: true, title: bi('course.three2.title'), blurb: bi('course.three2.blurb') },
  { id: 'three3', group: 'gfx', badge: 'TJS 3', color: '#ff6b9a', soon: true, title: bi('course.three3.title'), blurb: bi('course.three3.blurb') },
  { id: 'unity', group: 'more', badge: 'Unity', color: 'var(--ok)', soon: true, title: bi('course.unity.title'), blurb: bi('course.unity.blurb') },
  { id: 'algo', group: 'more', badge: 'Algo', color: 'var(--osd)', title: bi('course.algo.title'), blurb: bi('course.algo.blurb'), load: jsonCourse('algo') }
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
