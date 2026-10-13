/**
 * Собирает content/<курс>/bundle.<язык>.json — весь курс на одном языке одним файлом.
 * Сайт грузит курс одним запросом вместо трёх на каждый урок. Исходники (lessons/ и i18n/) остаются
 * источником правды, bundle — их свёртка: tests/content.test.js падает, если он устарел.
 *   node tools/content-bundle.mjs        (его запускает и npm run stamp)
 */
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCourseFromSource } from '../learn/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
let files = 0, bytes = 0;
for (const d of readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())) {
  const langs = readdirSync(join(root, d.name, 'i18n'), { withFileTypes: true }).filter(l => l.isDirectory()).map(l => l.name);
  for (const lang of langs) {
    const json = JSON.stringify(await loadCourseFromSource(d.name, lang));
    writeFileSync(join(root, d.name, `bundle.${lang}.json`), json);
    files++; bytes += json.length;
  }
}
console.log(`content bundle: ${files} файлов, ${(bytes / 1024 / 1024).toFixed(1)} МБ`);
