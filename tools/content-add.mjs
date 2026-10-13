/**
 * Добавляет урок в курс-данные: пишется как два модуля (русский и английский, формат, как у
 * прежних уроков), а скрипт раскладывает их на структуру и строки.
 *   node tools/content-add.mjs <курс в content/> <урок.js> <урок.en.js>
 * Потом добавь id урока в нужный раздел content/<курс>/course.json (поле lessons).
 */
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { emit } from './content-convert.mjs';
import { loadLesson } from '../learn/content.js';

const [course, ruFile, enFile] = process.argv.slice(2);
if (!course || !ruFile || !enFile) { console.error('usage: node tools/content-add.mjs <курс> <урок.js> <урок.en.js>'); process.exit(1); }
const open = f => import(pathToFileURL(resolve(f)).href).then(m => m.default);
const [ru, en] = await Promise.all([open(ruFile), open(enFile)]);
assert.equal(ru.id, en.id, 'id уроков должны совпадать');
emit(course, ru.id, ru, en);
for (const [lang, orig] of [['ru', ru], ['en', en]]) {
  assert.deepEqual(JSON.parse(JSON.stringify(await loadLesson(course, ru.id, lang))), JSON.parse(JSON.stringify(orig)), `${lang}: сборка не совпала`);
}
console.log(`content/${course}: урок ${ru.id} добавлен; впиши его id в course.json`);
