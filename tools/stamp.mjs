/**
 * Проставляет всем внутренним ссылкам на js и css одну и ту же метку ?v=<stamp>.
 *
 * GitHub Pages отдаёт файлы с max-age=600, поэтому после деплоя браузер может
 * смешать свежий HTML со старым модулем — граф импортов тогда не собирается и
 * страница остаётся мёртвой. Общая метка меняет все адреса разом, так что
 * смешать версии невозможно. Запускать перед коммитом: npm run stamp
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', 'tools', 'tests']);
const stamp = process.argv[2] || new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

const walk = dir => readdirSync(dir).flatMap(name => {
  if (SKIP.has(name)) return [];
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

const HTML_LINK = /\b(src|href)="((?:\.{0,2}\/)[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g;
const JS_IMPORT = /\bfrom '(\.{1,2}\/[^']+\.js)(?:\?v=[^']*)?'/g;

let touched = 0;
for (const file of walk(root)) {
  const isHtml = file.endsWith('.html'), isJs = file.endsWith('.js');
  if (!isHtml && !isJs) continue;
  const src = readFileSync(file, 'utf8');
  const out = isHtml
    ? src.replace(HTML_LINK, (_, attr, path) => `${attr}="${path}?v=${stamp}"`)
    : src.replace(JS_IMPORT, (_, path) => `from '${path}?v=${stamp}'`);
  if (out !== src) { writeFileSync(file, out); touched++; }
}
console.log(`stamp ${stamp}: обновлено файлов — ${touched}`);
