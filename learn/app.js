/**
 * Курсы: каталог → курс → урок. Одна страница, адрес в hash:
 *   #/            каталог
 *   #/dotnet      курс
 *   #/dotnet/<id> урок поверх курса
 */
import { $, esc, startNoise } from '../assets/vhs.js?v=202610081418';
import { GROUPS, COURSES, findCourse, lessonsOf } from './courses.js?v=202610081418';
import * as P from './progress.js?v=202610081418';
import * as E from './engine.js?v=202610081418';
import { renderCard, feedback } from './cards.js?v=202610081418';

const loaded = P.load();
let prog = loaded.state;
const canSave = loaded.saved;

const view = $('#view');
const lessonEl = $('#lesson');

/* ---------- строка состояния ---------- */
function drawStats() {
  const streak = P.liveStreak(prog.streak, P.today());
  $('#stStreak').textContent = `🔥 ${streak}`;
  $('#stStreak').classList.toggle('off', streak === 0);
  $('#stStreak').title = streak ? `Серия: ${streak} дн. подряд` : 'Пройди урок сегодня, чтобы начать серию';
  $('#stXp').textContent = `⚡ ${prog.xp} XP`;
}

/* ---------- свой диалог вместо confirm(): системный не везде показывается ---------- */
let askClose = null;
const LEAVE = 'Выйти из урока? Прогресс этого урока пропадёт.';

function ask(text, yes = 'Да', no = 'Отмена') {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'ask';
    wrap.innerHTML = `<div class="ask-box" role="alertdialog" aria-modal="true" aria-label="${esc(text)}">
      <p>${esc(text)}</p>
      <div class="row-btns"><button class="ghost-btn" data-v="0">${esc(no)}</button><button class="cta-btn" data-v="1">${esc(yes)}</button></div></div>`;
    const done = v => { wrap.remove(); askClose = null; resolve(v); };
    askClose = done;
    wrap.onclick = e => {
      const b = e.target.closest('button');
      if (b) done(b.dataset.v === '1');
      else if (e.target === wrap) done(false);
    };
    document.body.append(wrap);
    wrap.querySelector('.cta-btn').focus();
  });
}

/** Логотип курса: маленький CRT-экран. Копии текста в data-text нужны для глитча на псевдоэлементах. */
const badgeHtml = (c, i = 0, big = false) =>
  `<span class="badge${big ? ' big' : ''}" style="--c:${c.color};--d:${(i * 2.3) % 7}s" data-text="${esc(c.badge)}" data-len="${Math.min(5, c.badge.length)}" aria-hidden="true">${esc(c.badge)}</span>`;

/** Прогресс сегментами, как счётчик на кассете: по сегменту на урок, следующий мигает. */
function segBar(lessons) {
  const next = lessons.find(l => !P.isDone(prog, l.id));
  const done = lessons.filter(l => P.isDone(prog, l.id)).length;
  return `<div class="segbar" role="progressbar" aria-valuemin="0" aria-valuemax="${lessons.length}" aria-valuenow="${done}" aria-label="Пройдено уроков">${lessons.map(l =>
    `<i class="${P.isDone(prog, l.id) ? 'on' : l === next ? 'cur' : ''}${l.boss ? ' boss' : ''}"></i>`).join('')}</div>`;
}

const starsHtml = (n, total = 3) => '★'.repeat(n) + `<span class="off">${'★'.repeat(total - n)}</span>`;

/* ---------- каталог ---------- */
function catalog() {
  document.title = 'Курсы — учись по урокам';
  const card = (c, i) => {
    if (c.soon) {
      return `<div class="course soon" aria-disabled="true">
        <div class="top">${badgeHtml(c, i)}<h2>${esc(c.title)}</h2></div>
        <p>${esc(c.blurb)}</p><span class="soon-tag">Скоро</span></div>`;
    }
    const ls = lessonsOf(c.course);
    const done = ls.filter(l => P.isDone(prog, l.id)).length;
    return `<a class="course" href="#/${c.id}">
      <div class="top">${badgeHtml(c, i)}<h2>${esc(c.title)}</h2></div>
      <p>${esc(c.blurb)}</p>
      ${segBar(ls)}
      <div class="cta"><span>${done} из ${ls.length} уроков</span><b>${done ? 'ПРОДОЛЖИТЬ ►' : 'НАЧАТЬ ►'}</b></div></a>`;
  };
  // в группе сначала готовые курсы, потом «скоро»; номер i сдвигает глитч логотипов
  let i = 0;
  const groups = GROUPS.map(g => {
    const cs = COURSES.filter(c => c.group === g.id);
    if (!cs.length) return '';
    const sorted = [...cs.filter(c => !c.soon), ...cs.filter(c => c.soon)];
    return `<section class="cgroup"><div class="cgroup-h"><h2>${esc(g.title)}</h2><p>${esc(g.blurb)}</p></div>
      <div class="courses">${sorted.map(c => card(c, i++)).join('')}</div></section>`;
  }).join('');
  view.innerHTML = `<section class="view">
    <a class="back" href="../">← Полка кассет</a>
    <h1>Курсы</h1>
    <p class="lede">Короткие уроки по 5 минут. Ничего не нужно знать заранее: каждое слово объясняем, на каждом экране что-то делаешь сам. Опытным — раскрывающиеся блоки «Глубже».</p>
    ${canSave ? '' : '<p class="warn-store">Браузер не даёт сохранять данные — прогресс пропадёт после перезагрузки.</p>'}
    ${groups}
  </section>`;
}

/* ---------- курс ---------- */
function coursePage(id) {
  const course = findCourse(id);
  if (!course) return catalog();
  document.title = `${course.title} — курсы`;
  const all = lessonsOf(course);
  const nextIdx = all.findIndex(l => !P.isDone(prog, l.id));
  const units = course.units.map((u, ui) => {
    if (u.soon) {
      return `<section class="unit soon"><span class="kick">Раздел ${ui + 1} · скоро</span><h2>${esc(u.title)}</h2><p class="src">${esc(u.blurb)}</p></section>`;
    }
    const done = u.lessons.filter(l => P.isDone(prog, l.id)).length;
    const steps = u.lessons.map(l => {
      const gi = all.indexOf(l);
      const rec = prog.lessons[l.id];
      const cls = ['step', rec ? 'done' : '', gi === nextIdx ? 'next' : '', nextIdx >= 0 && gi > nextIdx ? 'later' : '', l.boss ? 'boss' : ''].join(' ');
      const node = rec ? '✓' : l.boss ? '★' : gi + 1;
      const side = rec
        ? `<span class="stars">${starsHtml(rec.stars)}</span><span>повторить</span>`
        : gi === nextIdx ? `<span class="go">${gi === 0 ? 'НАЧАТЬ' : 'ДАЛЬШЕ'}</span>` : `<span>${l.minutes} мин</span>`;
      return `<li><button class="${cls}" data-id="${l.id}" data-later="${nextIdx >= 0 && gi > nextIdx ? 1 : 0}">
        <span class="node">${node}</span>
        <span class="txt"><span class="h3">${esc(l.title)}</span><span class="sub">${esc(l.sub)}</span></span>
        <span class="st-side">${side}</span></button></li>`;
    }).join('');
    return `<section class="unit">
      <span class="kick">Раздел ${ui + 1}</span>
      <h2>${esc(u.title)}</h2>
      <p class="lede" style="font-size:16px">${esc(u.blurb)}</p>
      ${segBar(u.lessons)}
      <div class="meta"><span>${done} из ${u.lessons.length} уроков</span><span>~${u.lessons.reduce((s, l) => s + l.minutes, 0)} мин</span></div>
      <ol class="path">${steps}</ol>
      ${u.source ? `<p class="src">По материалу <a href="${u.source.url}" target="_blank" rel="noopener">${esc(u.source.title)}</a>. Где современный .NET работает иначе, урок говорит об этом отдельно.</p>` : ''}
    </section>`;
  }).join('');
  view.innerHTML = `<section class="view">
    <a class="back" href="#/">← Все курсы</a>
    <div class="course-head">${badgeHtml(COURSES.find(c => c.id === id), 0, true)}<h1>${esc(course.title)}</h1></div>
    ${canSave ? '' : '<p class="warn-store">Браузер не даёт сохранять данные — прогресс пропадёт после перезагрузки.</p>'}
    ${units}
    <button class="reset" id="reset">Сбросить прогресс</button>
  </section>`;
  view.querySelectorAll('.step').forEach(b => b.onclick = async () => {
    if (b.dataset.later === '1' && !(await ask('Этот урок дальше по курсу — лучше идти по порядку. Всё равно открыть?', 'Открыть'))) return;
    location.hash = `#/${id}/${b.dataset.id}`;
  });
  $('#reset').onclick = async () => {
    if (!(await ask('Стереть весь прогресс, очки и серию?', 'Стереть'))) return;
    prog = P.reset();
    drawStats();
    coursePage(id);
  };
}

/* ---------- урок ---------- */
let run = null;   // { lesson, courseId, state, seed, t0, ui }

function openLesson(courseId, lessonId) {
  const course = findCourse(courseId);
  const lesson = course && lessonsOf(course).find(l => l.id === lessonId);
  if (!lesson) { location.hash = `#/${courseId}`; return; }
  if (run?.lesson === lesson && !run.state.done) return;
  // history — снимки пройденных карточек для просмотра назад; view — какой из них открыт (null — живая карточка)
  run = { lesson, courseId, state: E.start(lesson), seed: (Math.random() * 1e9) | 0, t0: Date.now(), step: 0, history: [], view: null, lastFb: null, liveHost: null };
  document.body.classList.add('in-lesson');
  lessonEl.hidden = false;
  lessonEl.innerHTML = `<div class="l-top">
      <span class="l-nav"><button class="x" id="lx" aria-label="Выйти из урока">✕</button><button class="x" id="lback" aria-label="Предыдущая карточка" title="Перечитать прошлые карточки" disabled>‹</button></span>
      <div class="pbar" role="progressbar" aria-label="Прогресс урока"><i id="lp" style="width:0"></i></div>
      <span class="l-count" id="lc"></span>
    </div>
    <div class="l-body" id="lb"></div>
    <div class="l-foot" id="lf"><div class="in"><div class="fb" id="lfb" aria-live="polite"></div><button class="cta-btn" id="lbtn"></button></div></div>
    <div class="l-foot review" id="lr" hidden><div class="in"><div class="fb" id="lrfb" aria-live="polite"></div><div class="nav-btns"><button class="ghost-btn" id="rvPrev">‹ Назад</button><button class="cta-btn" id="rvNext"></button></div></div></div>`;
  $('#lx').onclick = () => leave();
  $('#lback').onclick = () => (run.view === null ? review(run.history.length - 1) : review(run.view - 1));
  $('#rvPrev').onclick = () => review(run.view - 1);
  $('#rvNext').onclick = () => (run.view + 1 < run.history.length ? review(run.view + 1) : backToLive());
  showCard();
}

async function leave(force = false) {
  if (!force && run && !run.state.done && run.state.cleared.size > 0 && !(await ask(LEAVE, 'Выйти', 'Остаться'))) return;
  const id = run?.courseId ?? 'dotnet';
  closeLesson();
  location.hash = `#/${id}`;
}

function closeLesson() {
  run = null;
  lessonEl.hidden = true;
  lessonEl.innerHTML = '';
  document.body.classList.remove('in-lesson');
}

function showCard() {
  const { lesson, state } = run;
  const card = E.current(state, lesson);
  const idx = E.currentIndex(state);
  const body = $('#lb'), foot = $('#lf'), fb = $('#lfb'), btn = $('#lbtn');
  $('#lp').style.width = `${E.progress(state) * 100}%`;
  $('#lc').textContent = `${state.cleared.size} / ${state.total}`;
  foot.className = 'l-foot';
  fb.innerHTML = '';
  body.scrollTop = 0;
  const host = document.createElement('div');
  host.className = 'card';
  const again = state.seen.has(idx);
  if (again) host.innerHTML = '<span class="tag again">↻ Ещё раз — исправь ошибку</span>';
  else if (card.t === 'learn') host.innerHTML = '<span class="tag">Новое</span>';
  else if (card.t === 'rig') host.innerHTML = '<span class="tag">Попробуй сам</span>';
  body.replaceChildren(host);
  run.liveHost = host;
  $('#lback').disabled = run.history.length === 0;

  let phase = 'input';   // input → feedback
  let completed = false;
  const api = {
    ready(ok) { if (phase === 'input') btn.disabled = !ok; },
    complete(ok, text) {
      if (completed) return;
      completed = true;
      E.answer(state, lesson, ok);
      showFeedback(ok, text, ok ? 'Готово!' : 'Почти');
    }
  };
  const r = renderCard(card, host, api, run.seed + run.step * 31);
  run.step++;

  function showFeedback(ok, text, title) {
    phase = 'feedback';
    run.lastFb = { ok, title, text };
    // «Глубже» у вопроса открывается после ответа, чтобы не подсказывать
    if (card.deep && card.t !== 'learn') host.insertAdjacentHTML('beforeend', `<details class="deep"><summary>Глубже — для тех, кто уже программирует</summary><div>${card.deep}</div></details>`);
    foot.className = 'l-foot ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = `<b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ''}`;
    btn.disabled = false;
    btn.textContent = 'Дальше ►';
    btn.focus({ preventScroll: true });
  }

  if (r.mode === 'learn') {
    btn.textContent = 'Понятно ►';
    btn.disabled = false;
  } else if (r.mode === 'check') {
    btn.textContent = 'Проверить';
    btn.disabled = true;
  } else {
    btn.textContent = card.t === 'rig' ? 'Выполни задание' : 'Найди все пары';
    btn.disabled = true;
  }

  btn.onclick = () => {
    if (phase === 'input' && r.mode === 'learn') {
      E.answer(state, lesson, true);
      return advance();
    }
    if (phase === 'input' && r.mode === 'check') {
      const input = r.input();
      const ok = E.check(card, input);
      E.answer(state, lesson, ok);
      r.reveal(ok);
      const praise = ['Верно!', 'Отлично!', 'Точно!', 'Так и есть!'][run.step % 4];
      return showFeedback(ok, feedback(card, input, ok), ok ? praise : 'Не совсем');
    }
    if (phase === 'feedback') advance();
  };
  run.key = e => {
    if (e.key === 'Enter' && !btn.disabled && !(e.target instanceof HTMLButtonElement && e.target !== btn)) { btn.click(); return true; }
    return phase === 'input' && r.key ? r.key(e) : false;
  };
}

/* ---------- просмотр пройденных карточек: только чтение ---------- */
function snapshot() {
  const node = run.liveHost.cloneNode(true);
  node.querySelectorAll('button').forEach(b => { b.disabled = true; b.tabIndex = -1; });
  node.querySelector('.tag')?.remove();
  node.insertAdjacentHTML('afterbegin', '<span class="tag past">↺ Пройдено — только для чтения</span>');
  run.history.push({ node, fb: run.lastFb });
  run.lastFb = null;
}

function review(i) {
  if (i < 0 || i >= run.history.length) return;
  const body = $('#lb'), entry = run.history[i];
  run.view = i;
  body.replaceChildren(entry.node);
  body.scrollTop = 0;
  $('#lf').hidden = true;
  const foot = $('#lr');
  foot.hidden = false;
  foot.className = 'l-foot review' + (entry.fb ? (entry.fb.ok ? ' ok' : ' bad') : '');
  $('#lrfb').innerHTML = entry.fb
    ? `<b>${esc(entry.fb.title)}</b>${entry.fb.text ? `<p>${esc(entry.fb.text)}</p>` : ''}`
    : `<span class="past-n">Карточка ${i + 1} из ${run.history.length} пройденных</span>`;
  $('#rvPrev').disabled = i === 0;
  $('#lback').disabled = i === 0;
  $('#rvNext').textContent = i + 1 < run.history.length ? 'Вперёд ›' : run.state.done ? 'К итогам ►' : 'Вернуться к уроку ►';
  $('#rvNext').focus({ preventScroll: true });
}

function backToLive() {
  run.view = null;
  $('#lb').replaceChildren(run.liveHost);
  $('#lr').hidden = true;
  $('#lf').hidden = run.state.done;
  $('#lback').disabled = run.history.length === 0;
}

function advance() {
  snapshot();
  E.next(run.state);
  if (run.state.done) finish();
  else showCard();
}

function finish() {
  const { lesson, courseId, state } = run;
  const res = E.result(state, Date.now() - run.t0);
  const before = prog.lessons[lesson.id];
  prog = P.record(prog, lesson.id, res, P.today());
  P.save(prog);
  drawStats();
  const all = lessonsOf(findCourse(courseId));
  const next = all[all.indexOf(lesson) + 1];
  const min = Math.floor(res.ms / 60000), sec = String(Math.floor(res.ms / 1000) % 60).padStart(2, '0');
  const title = lesson.boss ? 'Раздел пройден!' : res.mistakes === 0 ? 'Без единой ошибки!' : 'Урок пройден!';
  const best = before && before.stars >= res.stars ? '' : before ? '<p class="lede">Новый рекорд по звёздам.</p>' : '';
  $('#lp').style.width = '100%';
  $('#lc').textContent = `${state.total} / ${state.total}`;
  $('#lf').hidden = true;
  $('#lback').disabled = false;
  run.key = null;   // иначе Enter нажмёт скрытую «Дальше» и засчитает урок второй раз
  $('#lb').innerHTML = `<div class="result card">
    <div class="big-stars" aria-label="${res.stars} из 3 звёзд">${starsHtml(res.stars)}</div>
    <h2>${title}</h2>
    ${best}
    <div class="tiles">
      <div class="tile-s xp"><span class="v">+${res.xp}</span><span class="l">XP</span></div>
      <div class="tile-s"><span class="v">${res.accuracy}%</span><span class="l">точность</span></div>
      <div class="tile-s"><span class="v">${min}:${sec}</span><span class="l">время</span></div>
    </div>
    ${lesson.boss ? '<p class="lede">Ты разобрался, как код .NET проходит путь от текста на C# до команд процессора. Следующие разделы курса — скоро.</p>' : ''}
    <div class="row-btns">
      ${next ? '<button class="cta-btn" id="rNext">Следующий урок ►</button>' : '<button class="cta-btn" id="rMap">К курсу ►</button>'}
      <button class="ghost-btn" id="rReview">Перечитать урок</button>
      <button class="ghost-btn" id="rAgain">Пройти ещё раз</button>
      ${next ? '<button class="ghost-btn" id="rMap">К курсу</button>' : ''}
    </div>
  </div>`;
  const go = hash => { closeLesson(); location.hash = hash; route(); };
  if (next) $('#rNext').onclick = () => go(`#/${courseId}/${next.id}`);
  $('#rMap').onclick = () => go(`#/${courseId}`);
  $('#rAgain').onclick = () => { closeLesson(); openLesson(courseId, lesson.id); };
  $('#rReview').onclick = () => review(0);
  run.liveHost = $('#lb').firstElementChild;
  ($('#rNext') ?? $('#rMap')).focus();
}

/* ---------- роутер ---------- */
function route() {
  const [, courseId, lessonId] = (location.hash.slice(1) || '/').split('/');
  if (lessonId) {
    if (!view.innerHTML || view.dataset.course !== courseId) { coursePage(courseId); view.dataset.course = courseId; }
    openLesson(courseId, lessonId);
    return;
  }
  if (run) closeLesson();
  view.dataset.course = courseId || '';
  if (courseId) coursePage(courseId);
  else catalog();
  scrollTo(0, 0);
}

addEventListener('hashchange', async () => {
  // «Назад» в браузере посреди урока: вернуть адрес урока и спросить, точно ли выходить.
  const inLesson = location.hash.split('/').length > 2;
  if (run && !inLesson && !run.state.done && run.state.cleared.size > 0) {
    const target = location.hash || '#/';
    history.pushState(null, '', `#/${run.courseId}/${run.lesson.id}`);
    if (await ask(LEAVE, 'Выйти', 'Остаться')) { closeLesson(); location.hash = target; }
    return;
  }
  route();
});
addEventListener('keydown', e => {
  if (askClose) {
    if (e.key === 'Escape') { e.preventDefault(); askClose(false); }
    return;
  }
  if (!run) return;
  if (run.view !== null) {
    // в просмотре прошлого стрелки листают, Esc возвращает к уроку, а не закрывает его
    if (e.key === 'ArrowLeft') review(run.view - 1);
    else if (e.key === 'ArrowRight' || e.key === 'Enter') $('#rvNext').click();
    else if (e.key === 'Escape') backToLive();
    else return;
    e.preventDefault();
    return;
  }
  if (e.key === 'Escape') { leave(); return; }
  if (e.key === 'ArrowLeft' && run.history.length && !e.altKey) { review(run.history.length - 1); e.preventDefault(); return; }
  if (!run.key) return;
  if (run.key(e)) e.preventDefault();
});

drawStats();
route();
startNoise($('#noise'));
