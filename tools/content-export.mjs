/**
 * Выгружает уроки курса из данных в пары модулей (русский и английский) — для правки руками.
 *   node tools/content-export.mjs <курс> <папка> [id урока…]
 * В папке появятся <id>.js и <id>.en.js. После правки урок кладётся обратно:
 *   node tools/content-add.mjs <курс> <папка>/<id>.js <папка>/<id>.en.js
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadCourseFromSource } from '../learn/content.js';

const [course, out, ...only] = process.argv.slice(2);
if (!course || !out) { console.error('usage: node tools/content-export.mjs <курс> <папка> [id урока…]'); process.exit(1); }
const dir = resolve(out);
mkdirSync(dir, { recursive: true });
const [ru, en] = await Promise.all([loadCourseFromSource(course, 'ru'), loadCourseFromSource(course, 'en')]);
const byId = c => Object.fromEntries(c.units.flatMap(u => (u.lessons ?? []).map(l => [l.id, l])));
const R = byId(ru), E = byId(en);
const ids = only.length ? only : Object.keys(R);
for (const id of ids) {
  if (!R[id]) { console.error(`нет урока ${id}`); process.exit(1); }
  writeFileSync(join(dir, `${id}.js`), `export default ${JSON.stringify(R[id], null, 2)};\n`);
  writeFileSync(join(dir, `${id}.en.js`), `export default ${JSON.stringify(E[id], null, 2)};\n`);
}
console.log(`${ids.length} уроков выгружено в ${dir}`);
