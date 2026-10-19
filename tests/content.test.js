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
const courses = existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(root, d.name, 'course.json'))).map(d => d.name) : [];   // content/ui — не курс

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
    if (!lid) return;   // у курса пока только план — нечего сверять
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

test('строки интерфейса: у каждого ключа есть ru и en, одинаковые подстановки, в en нет кириллицы', () => {
  const ru = read('ui', 'ru.json'), en = read('ui', 'en.json');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ru).sort(), 'наборы ключей ru и en различаются');
  const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  for (const k of Object.keys(ru)) {
    assert.equal(typeof ru[k], 'string'); assert.equal(typeof en[k], 'string');
    assert.equal(vars(en[k]), vars(ru[k]), `${k}: подстановки {…} различаются`);
    assert.ok(!/[А-Яа-яЁё]/.test(en[k]), `${k}: кириллица в английской строке`);
  }
});

/* Форма карточек — зеркало типов из learn/types.d.ts: если меняешь одно, поправь и другое. */
const is = {
  str: v => typeof v === 'string',
  num: v => Number.isInteger(v),
  strs: v => Array.isArray(v) && v.every(x => typeof x === 'string'),
  nums: v => Array.isArray(v) && v.every(Number.isInteger),
  pairs: v => Array.isArray(v) && v.every(p => Array.isArray(p) && p.length === 2 && p.every(x => typeof x === 'string'))
};
const SHAPE = {
  learn: { need: { title: is.str, body: is.str }, may: { deep: is.str, code: is.str, lang: is.str, flow: is.strs } },
  choice: { need: { q: is.str, options: is.strs, answer: is.num, explain: is.str }, may: { wrong: v => v && typeof v === 'object', code: is.str, lang: is.str, deep: is.str } },
  multi: { need: { q: is.str, options: is.strs, answer: is.nums, explain: is.str }, may: { code: is.str, lang: is.str, deep: is.str } },
  order: { need: { q: is.str, items: is.strs }, may: { explain: is.str, code: is.str, lang: is.str } },
  blanks: { need: { q: is.str, code: is.str, tiles: is.strs, answer: is.strs }, may: { explain: is.str, lang: is.str } },
  tapline: { need: { q: is.str, code: is.str, answer: is.num }, may: { explain: is.str, lang: is.str } },
  match: { need: { q: is.str, pairs: is.pairs }, may: { code: is.str, lang: is.str } },
  rig: { need: { rig: is.str, task: is.str }, may: null }   // у стендов своя форма полей
};

for (const id of courses) {
  test(`content/${id}: карточки подходят под типы из types.d.ts`, async () => {
    const bad = [];
    for (const lang of ['ru', 'en']) {
      const course = await loadCourseFromSource(id, lang);
      for (const u of course.units) for (const l of u.lessons ?? []) {
        for (const [i, card] of l.cards.entries()) {
          const at = `${l.id} #${i + 1} (${card.t}/${lang})`, shape = SHAPE[card.t];
          if (!shape) { bad.push(`${at}: неизвестный тип`); continue; }
          for (const [k, ok] of Object.entries(shape.need)) if (!ok(card[k])) bad.push(`${at}: поле ${k}`);
          if (shape.may) for (const k of Object.keys(card)) {
            if (k === 't' || k in shape.need) continue;
            if (!(k in shape.may)) bad.push(`${at}: лишнее поле ${k}`);
            else if (!shape.may[k](card[k])) bad.push(`${at}: поле ${k}`);
          }
        }
      }
    }
    assert.deepEqual(bad, [], bad.slice(0, 8).join('\n'));
  });
}

test('строки стендов: ru и en совпадают по ключам и подстановкам, каждый ключ из кода есть в данных и наоборот', () => {
  const ru = read('rigs', 'ru.json'), en = read('rigs', 'en.json');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ru).sort(), 'наборы ключей ru и en различаются');
  const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  // языки вправе отличаться подстановками, только если так требует грамматика — тогда ключ в этом списке с причиной
  const GRAMMAR = { 'r.3d.convert.3': 'в английском существительное согласуется с числом ({noun}), в русском после «из N» — нет' };
  for (const k of Object.keys(ru)) {
    assert.ok(!/[А-Яа-яЁё]/.test(en[k]), `${k}: кириллица в английской строке`);
    if (!(k in GRAMMAR)) assert.equal(vars(en[k]), vars(ru[k]), `${k}: подстановки {…} различаются`);
  }
  // ключи, которые код запрашивает через tl/bi/tp, и ключи в данных — одно и то же множество
  const learn = join(root, '..', 'learn');
  const files = readdirSync(learn, { recursive: true }).map(String).filter(f => f.endsWith('.js'));
  const used = new Set();
  for (const f of files) for (const m of readFileSync(join(learn, f), 'utf8').matchAll(/\b(?:tl|bi|tp)\('([mrx]\.[^']+)'/g)) used.add(m[1]);
  assert.deepEqual([...used].filter(k => !(k in ru)), [], 'код просит ключи, которых нет в content/rigs');
  assert.deepEqual(Object.keys(ru).filter(k => !used.has(k)), [], 'в content/rigs есть ключи, которые код не использует');
});
