import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORIES, CATEGORY_IDS, MAX_TEXT, buildReport, isValidReport, cardSnippet, loadQueue, saveQueue } from '../learn/reports/report.js';
import { UI_STRINGS } from '../learn/ui.js';
import { parseDocs } from '../tools/reports.mjs';

const ctx = { lang: 'en', courseId: 'async', lessonId: 'as.u1.l1', cardIndex: 3, card: { t: 'choice', q: 'What <b>blocks</b>   the thread?' }, ver: '202610100752' };

test('категории: уникальные id, текст на двух языках', () => {
  assert.equal(new Set(CATEGORY_IDS).size, CATEGORIES.length);
  for (const c of CATEGORIES) assert.ok(c.ru && c.en && !/[А-Яа-яЁё]/.test(c.en), c.id);
  assert.ok(CATEGORY_IDS.includes('other'));
});

test('отчёт: собирается, чистит категории и текст, режет длину', () => {
  const r = buildReport(ctx, { categories: ['typo', 'typo', 'нет-такой'], text: `  ${'x'.repeat(MAX_TEXT + 50)}  ` });
  assert.deepEqual(r.categories, ['typo']);
  assert.equal(r.text.length, MAX_TEXT);
  assert.equal(r.snippet, 'What blocks the thread?');
  assert.equal(r.cardType, 'choice');
  assert.ok(isValidReport(r));
});

test('отчёт: пустой не принимается, достаточно категории или текста', () => {
  assert.throws(() => buildReport(ctx, { categories: [], text: '   ' }), /empty/);
  assert.ok(isValidReport(buildReport(ctx, { categories: ['other'], text: '' })));
  assert.ok(isValidReport(buildReport(ctx, { categories: [], text: 'hello' })));
});

test('isValidReport отсеивает испорченные отчёты', () => {
  const ok = buildReport(ctx, { categories: ['rig'], text: '' });
  assert.ok(isValidReport(ok));
  for (const bad of [null, { ...ok, lang: 'de' }, { ...ok, cardIndex: -1 }, { ...ok, cardIndex: 1.5 }, { ...ok, categories: ['x'] }, { ...ok, snippet: 'y'.repeat(301) }, { ...ok, courseId: '' }, { ...ok, categories: [], text: '' }]) assert.ok(!isValidReport(bad), JSON.stringify(bad).slice(0, 60));
});

test('cardSnippet берёт вопрос, задание или заголовок без тегов', () => {
  assert.equal(cardSnippet({ q: 'A' }), 'A');
  assert.equal(cardSnippet({ task: 'Do <i>it</i>' }), 'Do it');
  assert.equal(cardSnippet({ title: 'T' }), 'T');
});

test('очередь: сохраняется, фильтрует мусор и ограничена', () => {
  const store = (() => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; })();
  const ok = buildReport(ctx, { categories: ['typo'], text: '' });
  saveQueue([ok, { junk: true }], store);
  assert.deepEqual(loadQueue(store), [ok]);
  saveQueue(Array.from({ length: 50 }, () => ok), store);
  assert.equal(loadQueue(store).length, 20);
  assert.deepEqual(loadQueue({ getItem() { throw new Error('private'); } }), []);
});

test('строки окна жалобы есть на обоих языках', () => {
  for (const [k, v] of Object.entries(UI_STRINGS)) if (k.startsWith('rp.')) assert.ok(v.ru && v.en, k);
});

test('правила Firestore: те же поля, что и у отчёта, чтение закрыто', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  const r = buildReport(ctx, { categories: ['typo'], text: '' });
  for (const k of [...Object.keys(r), 'createdAt']) assert.ok(rules.includes(`'${k}'`), `в правилах нет поля ${k}`);
  assert.match(rules, /allow read, update, delete: if false/);
  assert.match(rules, /createdAt == request\.time/);
});

test('tools/reports: разбор ответа Firestore REST', () => {
  const docs = parseDocs({ documents: [{ name: 'projects/p/databases/(default)/documents/reports/abc', createTime: '2026-10-10T10:00:00Z', fields: {
    courseId: { stringValue: 'async' }, cardIndex: { integerValue: '3' }, categories: { arrayValue: { values: [{ stringValue: 'typo' }] } },
    text: { stringValue: 'oops' }, uid: { nullValue: null }, wasWrong: { booleanValue: true }, createdAt: { timestampValue: '2026-10-10T10:00:00Z' } } }] });
  assert.deepEqual(docs[0], { id: 'abc', courseId: 'async', cardIndex: 3, categories: ['typo'], text: 'oops', uid: null, wasWrong: true, createdAt: '2026-10-10T10:00:00Z' });
  assert.deepEqual(parseDocs({}), []);
});
