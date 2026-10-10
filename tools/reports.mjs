/**
 * Читает жалобы из Firestore и печатает их сгруппированными по карточке.
 *   node tools/reports.mjs [--json] [--limit 200]
 * Нужен доступ на чтение к проекту: сервисный аккаунт (роль Cloud Datastore Viewer) и
 *   gcloud auth activate-service-account --key-file=key.json
 * Токен берётся у gcloud, ключи в репозиторий не кладутся.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT = 'bathys-d6656';

const val = v => {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(val);
  return undefined;
};

/** Ответ Firestore REST → простые объекты. */
export function parseDocs(json) {
  return (json.documents ?? []).map(d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, val(v)])) }));
}

async function fetchAll(limit) {
  const token = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();
  const out = [];
  let pageToken = '';
  while (out.length < limit) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/reports?pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    out.push(...parseDocs(json));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return out.slice(0, limit);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const limit = Number(args[args.indexOf('--limit') + 1]) || 200;
  const reports = await fetchAll(limit);
  if (args.includes('--json')) console.log(JSON.stringify(reports, null, 2));
  else {
    const groups = new Map();
    for (const r of reports) { const k = `${r.courseId} / ${r.lessonId} #${r.cardIndex}`; (groups.get(k) ?? groups.set(k, []).get(k)).push(r); }
    for (const [k, rs] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n${k}  (${rs.length})  «${rs[0].snippet}»`);
      for (const r of rs) console.log(`  [${r.lang}] ${r.categories.join(', ') || '—'}${r.text ? `: ${r.text}` : ''}`);
    }
    console.log(`\nВсего: ${reports.length}`);
  }
}
