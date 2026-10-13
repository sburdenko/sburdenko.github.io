/**
 * Проверка типов в обычных js-файлах (JSDoc + checkJs), без сборки и без изменений в коде.
 *   npm run typecheck
 * tsc не понимает адреса с меткой версии (import './x.js?v=123'), поэтому проверка идёт по копии
 * исходников во временной папке, где метки сняты; пути в ошибках возвращаются к настоящим.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, symlinkSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = join(tmpdir(), `bathys-typecheck-${process.pid}`);
const SKIP = new Set(['node_modules', '.git', 'content', '.github']);
const SCOPE = readdirSync(root).filter(n => !SKIP.has(n) && !n.startsWith('.'));

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
symlinkSync(join(root, 'node_modules'), join(tmp, 'node_modules'));

const strip = src => src.replace(/(\bfrom\s+'|\bimport\(')(\.{1,2}\/[^']+?\.js)\?v=[^']*'/g, "$1$2'");
const copy = (from, to) => {
  if (statSync(from).isDirectory()) {
    mkdirSync(to, { recursive: true });
    for (const n of readdirSync(from)) copy(join(from, n), join(to, n));
  } else if (/\.(js|mjs|d\.ts)$/.test(from)) {
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, strip(readFileSync(from, 'utf8')));
  }
};
for (const p of SCOPE) if (statSync(join(root, p)).isDirectory() || /\.(js|mjs)$/.test(p)) copy(join(root, p), join(tmp, p));
cpSync(join(root, 'tsconfig.json'), join(tmp, 'tsconfig.json'));

const tsc = join(root, 'node_modules', '.bin', 'tsc');
const r = spawnSync(tsc, ['-p', '.', '--pretty', 'false'], { encoding: 'utf8', cwd: tmp });
const out = (r.stdout + r.stderr).trim();
if (out) console.log(out);
rmSync(tmp, { recursive: true, force: true });
const errors = (out.match(/error TS\d+/g) ?? []).length;
console.log(errors ? `typecheck: ошибок — ${errors}` : 'typecheck: ошибок нет');
process.exit(errors ? 1 : 0);
