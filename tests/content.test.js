/**
 * Курсы из данных (content/): структура, строки и загрузчик.
 * Правила: у каждой строки есть русский и английский текст, пути в таблицах строк существуют
 * в структуре, на месте переводимой строки в структуре стоит null, а у урока есть и файл структуры, и строки.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fill, setPath, loadCourse, loadCourseFromSource, loadLesson, HOLE } from '../learn/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const read = (...p) => JSON.parse(readFileSync(join(root, ...p), 'utf8'));
const courses = existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) : [];

test('fill подставляет строки по путям и ругается на несуществующий путь', () => {
  const sk = { a: HOLE, list: [HOLE, 'x', { q: HOLE }] };
  assert.deepEqual(fill(sk, { a: 'A', 'list/0': 'L0', 'list/2/q': 'Q' }), { a: 'A', list: ['L0', 'x', { q: 'Q' }] });
  assert.deepEqual(sk, { a: HOLE, list: [HOLE, 'x', { q: HOLE }] }, 'структура не меняется');
  assert.throws(() => setPath({ a: 1 }, 'b', 'x'), /нет пути/);
  assert.throws(() => setPath({ a: [] }, 'a/3/q', 'x'), /нет пути/);
});

for (const id of courses) {
  const lessonIds = () => {
    const head = read(id, 'course.json');
    return head.units.flatMap(u => u.lessons ?? []);
  };

  test(`content/${id}: у каждого урока есть структура и строки на русском и английском`, () => {
    for (const lid of ['course', ...lessonIds()]) {
      const skeleton = lid === 'course' ? read(id, 'course.json') : read(id, 'lessons', `${lid}.json`);
      const ru = read(id, 'i18n', 'ru', `${lid}.json`), en = read(id, 'i18n', 'en', `${lid}.json`);
      assert.deepEqual(Object.keys(en).sort(), Object.keys(ru).sort(), `${id}/${lid}: наборы строк ru и en различаются`);
      // пути существуют, и в структуре на их месте метка (или строка, которую язык переопределяет)
      for (const path of Object.keys(ru)) {
        let node = skeleton;
        for (const k of path.split('/')) { node = node?.[k]; }
        assert.equal(typeof node, 'string', `${id}/${lid}: путь ${path} не указывает на строку структуры`);
      }
      for (const [lang, strings] of [['ru', ru], ['en', en]]) {
        for (const [path, v] of Object.entries(strings)) assert.equal(typeof v, 'string', `${id}/${lid}/${lang}: ${path} — не строка`);
      }
    }
  });

  test(`content/${id}: все переводимые места структуры заполнены`, async () => {
    for (const lang of ['ru', 'en']) {
      const course = await loadCourse(id, lang);
      const holes = [];
      const walk = (v, path) => {
        if (v === HOLE) holes.push(path);
        else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}/${i}`));
        else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}/${k}`);
      };
      walk(course, id);
      assert.deepEqual(holes, [], `${id}/${lang}: остались пустые места: ${holes.slice(0, 5)}`);
    }
  });

  test(`content/${id}: язык без перевода показывается на английском`, async () => {
    const lid = lessonIds()[0];
    const en = await loadLesson(id, lid, 'en');
    assert.deepEqual(await loadLesson(id, lid, 'xx'), en);
  });
}

for (const id of courses) {
  test(`content/${id}: bundle совпадает с исходниками (если устарел — npm run stamp)`, async () => {
    const langs = readdirSync(join(root, id, 'i18n'));
    assert.ok(langs.includes('ru') && langs.includes('en'));
    for (const lang of langs) {
      assert.ok(existsSync(join(root, id, `bundle.${lang}.json`)), `${id}: нет bundle.${lang}.json`);
      assert.deepEqual(read(id, `bundle.${lang}.json`), JSON.parse(JSON.stringify(await loadCourseFromSource(id, lang))), `${id}/${lang}: bundle устарел`);
    }
  });
}
