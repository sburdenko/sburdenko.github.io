/**
 * Bathys: каталог → курс → урок, плюс профиль. Одна страница, адрес в hash:
 *   #/            каталог
 *   #/profile     профиль: вход, язык, статистика
 *   #/dotnet      курс
 *   #/dotnet/<id> урок поверх курса
 */
import { $, esc, startNoise, setLocale } from '../assets/vhs.js?v=202610101018';
import { GROUPS, COURSES, findCourse, lessonsOf, loadCourses, courseTitle, courseBlurb } from './courses.js?v=202610101018';
import { getLang, switchLang, tr, LANGS, LANG_NAMES } from './i18n.js?v=202610101018';
import { t } from './ui.js?v=202610101018';
import { auth } from './auth/auth.js?v=202610101018';
import { CATEGORIES, MAX_TEXT, buildReport } from './reports/report.js?v=202610101018';
import { submit, flushQueue, reportsEnabled } from './reports/reports.js?v=202610101018';
import * as P from './progress.js?v=202610101018';
import * as E from './engine.js?v=202610101018';
import { renderCard, feedback } from './cards.js?v=202610101018';

/** Полка кассет — отдельный модуль сайта. */
const SHELF_URL = new URL('../shelf/', import.meta.url).href;

/** Версия сборки из метки ?v= у этого модуля — чтобы знать, какую версию страницы видел человек. */
const APP_VER = new URL(import.meta.url).searchParams.get('v') ?? '';

/** Режим разработчика: ?dev=1 включает, ?dev=0 выключает, переключатель — в профиле. */
const DEV_KEY = 'bathys-dev';
const DEV = (() => {
  try {
    const q = new URLSearchParams(location.search).get('dev');
    if (q === '1') localStorage.setItem(DEV_KEY, '1');
    if (q === '0') localStorage.removeItem(DEV_KEY);
    return localStorage.getItem(DEV_KEY) === '1';
  } catch { return false; }
})();

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
  $('#stStreak').title = streak ? t('stat.streakOn', { n: streak }) : t('stat.streakOff');
  $('#stXp').textContent = `⚡ ${prog.xp} XP`;
}

/** Кнопка профиля в шапке: аватар, первая буква имени или «Войти». */
function drawProfileBtn() {
  const b = $('#profBtn');
  const u = auth.user;
  b.title = t('nav.profile');
  b.setAttribute('aria-label', t('nav.profile'));
  b.innerHTML = u?.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">`
    : u ? `<span class="ini">${esc((u.name || '?')[0].toUpperCase())}</span>`
    : `<span class="ini guest">${esc(t('nav.signIn'))}</span>`;
}

/* ---------- свой диалог вместо confirm(): системный не везде показывается ---------- */
let askClose = null;
function ask(text, yes = t('ask.yes'), no = t('ask.cancel')) {
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
  return `<div class="segbar" role="progressbar" aria-valuemin="0" aria-valuemax="${lessons.length}" aria-valuenow="${done}" aria-label="${esc(t('seg.aria'))}">${lessons.map(l =>
    `<i class="${P.isDone(prog, l.id) ? 'on' : l === next ? 'cur' : ''}${l.boss ? ' boss' : ''}"></i>`).join('')}</div>`;
}

const starsHtml = (n, total = 3) => '★'.repeat(n) + `<span class="off">${'★'.repeat(total - n)}</span>`;

/* ---------- каталог ---------- */
const storeWarn = () => (canSave ? '' : `<p class="warn-store">${esc(t('warn.noStore'))}</p>`);

function catalog() {
  document.title = t('page.catalog');
  const card = (c, i) => {
    if (c.soon) {
      return `<div class="course soon" aria-disabled="true">
        <div class="top">${badgeHtml(c, i)}<h2>${esc(courseTitle(c))}</h2></div>
        <p>${esc(courseBlurb(c))}</p><span class="soon-tag">${esc(t('cat.soon'))}</span></div>`;
    }
    const ls = lessonsOf(c.course);
    const done = ls.filter(l => P.isDone(prog, l.id)).length;
    return `<a class="course" href="#/${c.id}">
      <div class="top">${badgeHtml(c, i)}<h2>${esc(courseTitle(c))}</h2></div>
      <p>${esc(courseBlurb(c))}</p>
      ${c.fallback ? `<span class="soon-tag">${esc(t('cat.fallback'))}</span>` : ''}
      ${segBar(ls)}
      <div class="cta"><span>${esc(t('cat.ofLessons', { done, total: ls.length }))}</span><b>${esc(t(done ? 'cat.continue' : 'cat.start'))}</b></div></a>`;
  };
  // в группе сначала готовые курсы, потом «скоро»; номер i сдвигает глитч логотипов
  let i = 0;
  const groups = GROUPS.map(g => {
    const cs = COURSES.filter(c => c.group === g.id);
    if (!cs.length) return '';
    const sorted = [...cs.filter(c => !c.soon), ...cs.filter(c => c.soon)];
    return `<section class="cgroup"><div class="cgroup-h"><h2>${esc(tr(g.title))}</h2><p>${esc(tr(g.blurb))}</p></div>
      <div class="courses">${sorted.map(c => card(c, i++)).join('')}</div></section>`;
  }).join('');
  view.innerHTML = `<section class="view">
    <h1>${esc(t('cat.title'))}</h1>
    <p class="lede">${esc(t('cat.lede'))}</p>
    ${storeWarn()}
    ${groups}
    <a class="shelf-door" href="${SHELF_URL}">
      <span class="sd-icon" aria-hidden="true">📼</span>
      <span class="sd-txt"><b>${esc(t('cat.shelfTitle'))}</b><span>${esc(t('cat.shelfDesc'))}</span></span>
      <span class="sd-go">${esc(t('cat.shelfGo'))}</span>
    </a>
  </section>`;
}

/* ---------- профиль ---------- */
function profilePage() {
  document.title = t('page.profile');
  const u = auth.user;
  const done = Object.keys(prog.lessons).length;
  const stars = Object.values(prog.lessons).reduce((sum, r) => sum + (r.stars || 0), 0);
  const streak = P.liveStreak(prog.streak, P.today());
  const who = u
    ? `<div class="pf-who">${u.photo ? `<img class="pf-ava" src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="pf-ava ini">${esc((u.name || '?')[0].toUpperCase())}</span>`}
        <div><b>${esc(u.name)}</b><span>${esc(u.email)}</span><small>${esc(t('p.signedHint', { provider: u.provider }))}</small></div></div>
       <button class="ghost-btn" id="pfOut">${esc(t('p.signOut'))}</button>`
    : `<div class="pf-who"><span class="pf-ava ini guest">?</span><div><b>${esc(t('p.guest'))}</b><small>${esc(t('p.guestHint'))}</small></div></div>
       ${auth.enabled ? `<button class="google-btn" id="pfIn"><span class="g" aria-hidden="true">G</span>${esc(t('p.google'))}</button>` : `<p class="pf-note">${esc(t('p.authOff'))}</p>`}`;
  view.innerHTML = `<section class="view profile">
    <a class="back" href="#/">${esc(t('course.back'))}</a>
    <h1>${esc(t('p.title'))}</h1>
    <div class="pf-card">${who}<p class="pf-err" id="pfErr" hidden></p></div>
    <div class="pf-card">
      <h2>${esc(t('p.lang'))}</h2>
      <p class="pf-note">${esc(t('p.langHint'))}</p>
      <div class="lang-pick" role="radiogroup" aria-label="${esc(t('p.lang'))}">${LANGS.map(l =>
        `<button role="radio" aria-checked="${l === getLang()}" data-lang="${l}"><b>${l.toUpperCase()}</b><span>${esc(LANG_NAMES[l])}</span></button>`).join('')}</div>
    </div>
    <div class="pf-card">
      <h2>${esc(t('p.dev'))}</h2>
      <p class="pf-note">${esc(t('p.devHint'))}</p>
      <button class="ghost-btn" id="pfDev" aria-pressed="${DEV}">${esc(t(DEV ? 'p.devOn' : 'p.devOff'))}</button>
    </div>
    <div class="pf-card">
      <h2>${esc(t('p.stats'))}</h2>
      <div class="tiles">
        <div class="tile-s xp"><span class="v">${prog.xp}</span><span class="l">${esc(t('p.xp'))}</span></div>
        <div class="tile-s"><span class="v">${streak}</span><span class="l">${esc(t('p.streak'))}</span></div>
        <div class="tile-s"><span class="v">${done}</span><span class="l">${esc(t('p.lessons'))}</span></div>
        <div class="tile-s"><span class="v">${stars}</span><span class="l">${esc(t('p.stars'))}</span></div>
      </div>
    </div>
  </section>`;
  view.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => switchLang(b.dataset.lang));
  $('#pfDev').onclick = () => { try { DEV ? localStorage.removeItem(DEV_KEY) : localStorage.setItem(DEV_KEY, '1'); } catch { /* не запомним */ } location.reload(); };
  const err = $('#pfErr');
  const fail = e => { err.hidden = false; err.textContent = t('p.authFail', { msg: e?.code || e?.message || e }); };
  $('#pfIn')?.addEventListener('click', () => auth.signIn('google').catch(fail));
  $('#pfOut')?.addEventListener('click', () => auth.signOut().catch(fail));
}

/* ---------- курс ---------- */
function coursePage(id) {
  const course = findCourse(id);
  if (!course) return catalog();
  document.title = t('page.course', { title: course.title });
  const all = lessonsOf(course);
  const nextIdx = all.findIndex(l => !P.isDone(prog, l.id));
  const units = course.units.map((u, ui) => {
    if (u.soon) {
      return `<section class="unit soon"><span class="kick">${esc(t('course.unitSoon', { n: ui + 1 }))}</span><h2>${esc(u.title)}</h2><p class="src">${esc(u.blurb)}</p></section>`;
    }
    const done = u.lessons.filter(l => P.isDone(prog, l.id)).length;
    const steps = u.lessons.map(l => {
      const gi = all.indexOf(l);
      const rec = prog.lessons[l.id];
      const cls = ['step', rec ? 'done' : '', gi === nextIdx ? 'next' : '', nextIdx >= 0 && gi > nextIdx ? 'later' : '', l.boss ? 'boss' : ''].join(' ');
      const node = rec ? '✓' : l.boss ? '★' : gi + 1;
      const side = rec
        ? `<span class="stars">${starsHtml(rec.stars)}</span><span>${esc(t('course.redo'))}</span>`
        : gi === nextIdx ? `<span class="go">${esc(t(gi === 0 ? 'course.go0' : 'course.go'))}</span>` : `<span>${esc(t('course.min', { n: l.minutes }))}</span>`;
      return `<li><button class="${cls}" data-id="${l.id}" data-later="${nextIdx >= 0 && gi > nextIdx ? 1 : 0}">
        <span class="node">${node}</span>
        <span class="txt"><span class="h3">${esc(l.title)}</span><span class="sub">${esc(l.sub)}</span></span>
        <span class="st-side">${side}</span></button></li>`;
    }).join('');
    return `<section class="unit">
      <span class="kick">${esc(t('course.unit', { n: ui + 1 }))}</span>
      <h2>${esc(u.title)}</h2>
      <p class="lede" style="font-size:16px">${esc(u.blurb)}</p>
      ${segBar(u.lessons)}
      <div class="meta"><span>${esc(t('cat.ofLessons', { done, total: u.lessons.length }))}</span><span>~${esc(t('course.min', { n: u.lessons.reduce((s, l) => s + l.minutes, 0) }))}</span></div>
      <ol class="path">${steps}</ol>
      ${u.source ? `<p class="src">${t('course.source', { link: `<a href="${esc(u.source.url)}" target="_blank" rel="noopener">${esc(u.source.title)}</a>` })}</p>` : ''}
    </section>`;
  }).join('');
  view.innerHTML = `<section class="view">
    <a class="back" href="#/">${esc(t('course.back'))}</a>
    <div class="course-head">${badgeHtml(COURSES.find(c => c.id === id), 0, true)}<h1>${esc(course.title)}</h1></div>
    ${storeWarn()}
    ${units}
    <button class="reset" id="reset">${esc(t('course.reset'))}</button>
  </section>`;
  view.querySelectorAll('.step').forEach(b => b.onclick = async () => {
    if (b.dataset.later === '1' && !(await ask(t('course.later'), t('course.open')))) return;
    location.hash = `#/${id}/${b.dataset.id}`;
  });
  $('#reset').onclick = async () => {
    if (!(await ask(t('course.resetAsk'), t('course.erase')))) return;
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
      <span class="l-nav"><button class="x" id="lx" aria-label="${esc(t('l.exit'))}">✕</button><button class="x" id="lback" aria-label="${esc(t('l.prev'))}" title="${esc(t('l.prevTitle'))}" disabled>‹</button></span>
      <div class="pbar" role="progressbar" aria-label="${esc(t('l.progress'))}"><i id="lp" style="width:0"></i></div>
      <span class="l-right"><span class="l-count" id="lc"></span>
        <button class="x tool" id="lreset" aria-label="${esc(t('l.reset'))}" title="${esc(t('l.reset'))}">↺</button>
        <button class="x tool" id="lflag" aria-label="${esc(t('rp.btn'))}" title="${esc(t('rp.btn'))}">⚑</button>
        ${DEV ? `<button class="x tool dev" id="lskip" aria-label="${esc(t('l.skip'))}" title="${esc(t('l.skip'))}">⏭</button>` : ''}
      </span>
    </div>
    <div class="l-body" id="lb"></div>
    <div class="l-foot" id="lf"><div class="in"><div class="fb" id="lfb" aria-live="polite"></div><button class="cta-btn" id="lbtn"></button></div></div>
    <div class="l-foot review" id="lr" hidden><div class="in"><div class="fb" id="lrfb" aria-live="polite"></div><div class="nav-btns"><button class="ghost-btn" id="rvPrev">${esc(t('l.back'))}</button><button class="cta-btn" id="rvNext"></button></div></div></div>`;
  $('#lx').onclick = () => leave();
  $('#lflag').onclick = () => openReport();
  $('#lreset').onclick = () => { if (run.view === null && run.phase === 'input') showCard(); };
  if (DEV) $('#lskip').onclick = () => skipCard();
  $('#lback').onclick = () => (run.view === null ? review(run.history.length - 1) : review(run.view - 1));
  $('#rvPrev').onclick = () => review(run.view - 1);
  $('#rvNext').onclick = () => (run.view + 1 < run.history.length ? review(run.view + 1) : backToLive());
  showCard();
}

async function leave(force = false) {
  if (!force && run && !run.state.done && run.state.cleared.size > 0 && !(await ask(t('leave.ask'), t('leave.yes'), t('leave.stay')))) return;
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
  run.curIdx = idx;
  const body = $('#lb'), foot = $('#lf'), fb = $('#lfb'), btn = $('#lbtn');
  $('#lp').style.width = `${E.progress(state) * 100}%`;
  $('#lc').textContent = `${state.cleared.size} / ${state.total}`;
  foot.className = 'l-foot';
  fb.innerHTML = '';
  body.scrollTop = 0;
  const host = document.createElement('div');
  host.className = 'card';
  const again = state.seen.has(idx);
  if (again) host.innerHTML = `<span class="tag again">${esc(t('l.again'))}</span>`;
  else if (card.t === 'learn') host.innerHTML = `<span class="tag">${esc(t('l.new'))}</span>`;
  else if (card.t === 'rig') host.innerHTML = `<span class="tag">${esc(t('l.try'))}</span>`;
  body.replaceChildren(host);
  run.liveHost = host;
  $('#lback').disabled = run.history.length === 0;

  let phase = 'input';   // input → feedback
  run.phase = 'input';
  $('#lreset').disabled = false;
  let completed = false;
  const api = {
    ready(ok) { if (phase === 'input') btn.disabled = !ok; },
    complete(ok, text) {
      if (completed) return;
      completed = true;
      E.answer(state, lesson, ok);
      showFeedback(ok, text, t(ok ? 'l.done' : 'l.almost'));
    }
  };
  const r = renderCard(card, host, api, run.seed + run.step * 31);
  run.step++;

  function showFeedback(ok, text, title) {
    phase = 'feedback';
    run.phase = 'feedback';
    $('#lreset').disabled = true;
    run.lastFb = { ok, title, text };
    // «Глубже» у вопроса открывается после ответа, чтобы не подсказывать
    if (card.deep && card.t !== 'learn') host.insertAdjacentHTML('beforeend', `<details class="deep"><summary>${esc(t('l.deep'))}</summary><div>${card.deep}</div></details>`);
    foot.className = 'l-foot ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = `<b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ''}`;
    btn.disabled = false;
    btn.textContent = t('l.next');
    btn.focus({ preventScroll: true });
  }

  if (r.mode === 'learn') {
    btn.textContent = t('l.gotIt');
    btn.disabled = false;
  } else if (r.mode === 'check') {
    btn.textContent = t('l.check');
    btn.disabled = true;
  } else {
    btn.textContent = t(card.t === 'rig' ? 'l.doTask' : 'l.findPairs');
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
      const praise = t('l.praise').split('|')[run.step % 4];
      return showFeedback(ok, feedback(card, input, ok), ok ? praise : t('l.notQuite'));
    }
    if (phase === 'feedback') advance();
  };
  run.key = e => {
    if (e.key === 'Enter' && !btn.disabled && !(e.target instanceof HTMLButtonElement && e.target !== btn)) { btn.click(); return true; }
    return phase === 'input' && r.key ? r.key(e) : false;
  };
}


/** Только в режиме разработчика: засчитать карточку верной и перейти к следующей. */
function skipCard() {
  if (!run || run.state.done || run.view !== null) return;
  if (run.phase === 'input') E.answer(run.state, run.lesson, true);
  advance();
}

/* ---------- жалоба на карточку ---------- */
/** Какая карточка сейчас на экране: просматриваемая из истории или живая. */
function visibleCardIndex() {
  return run.view !== null ? run.history[run.view].idx : run.curIdx;
}

function openReport() {
  if (!run || document.querySelector('.ask.report')) return;
  const idx = visibleCardIndex();
  const card = run.lesson.cards[idx];
  const picked = new Set();
  const wrap = document.createElement('div');
  wrap.className = 'ask report';
  wrap.innerHTML = `<form class="ask-box rp-box" role="dialog" aria-modal="true" aria-label="${esc(t('rp.title'))}">
      <h3>${esc(t('rp.title'))}</h3>
      <p class="rp-sub">${esc(t('rp.cats'))}</p>
      <div class="rp-cats">${CATEGORIES.map(c => `<button type="button" class="rp-cat" data-id="${c.id}" aria-pressed="false">${esc(tr(c))}</button>`).join('')}</div>
      <label class="rp-sub" for="rpText">${esc(t('rp.text'))}</label>
      <textarea id="rpText" rows="4" maxlength="${MAX_TEXT}" placeholder="${esc(t('rp.ph'))}"></textarea>
      <p class="rp-msg" id="rpMsg" role="status" aria-live="polite"></p>
      <div class="row-btns"><button type="button" class="ghost-btn" id="rpNo">${esc(t('rp.cancel'))}</button><button type="submit" class="cta-btn" id="rpYes">${esc(t('rp.send'))}</button></div>
    </form>`;
  const close = () => { wrap.remove(); askClose = null; };
  askClose = close;
  document.body.append(wrap);
  const msg = wrap.querySelector('#rpMsg'), text = wrap.querySelector('#rpText'), yes = wrap.querySelector('#rpYes');
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.rp-cat');
    if (b) {
      const on = !picked.has(b.dataset.id);
      on ? picked.add(b.dataset.id) : picked.delete(b.dataset.id);
      b.setAttribute('aria-pressed', on);
    } else if (e.target === wrap || e.target.id === 'rpNo') close();
  });
  wrap.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    if (!reportsEnabled) { msg.textContent = t('rp.off'); return; }
    let report;
    try {
      report = buildReport({ lang: getLang(), courseId: run.courseId, lessonId: run.lesson.id, cardIndex: idx, card, uid: auth.user?.id, ver: APP_VER, answered: run.view !== null ? undefined : !run.state.missed.has(idx) }, { categories: [...picked], text: text.value });
    } catch { msg.textContent = t('rp.empty'); return; }
    yes.disabled = true;
    const res = await submit(report);
    msg.textContent = t(res === 'sent' ? 'rp.sent' : 'rp.queued');
    wrap.querySelector('.row-btns').innerHTML = `<button type="button" class="cta-btn" id="rpDone">${esc(t('rp.close'))}</button>`;
    wrap.querySelector('#rpDone').onclick = close;
    wrap.querySelector('#rpDone').focus();
  };
  text.focus();
}

/* ---------- просмотр пройденных карточек: только чтение ---------- */
function snapshot() {
  const node = run.liveHost.cloneNode(true);
  node.querySelectorAll('button').forEach(b => { b.disabled = true; b.tabIndex = -1; });
  node.querySelector('.tag')?.remove();
  node.insertAdjacentHTML('afterbegin', `<span class="tag past">${esc(t('l.past'))}</span>`);
  run.history.push({ node, fb: run.lastFb, idx: run.curIdx });
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
    : `<span class="past-n">${esc(t('l.pastN', { i: i + 1, n: run.history.length }))}</span>`;
  $('#rvPrev').disabled = i === 0;
  $('#lback').disabled = i === 0;
  $('#rvNext').textContent = t(i + 1 < run.history.length ? 'l.fwd' : run.state.done ? 'l.toResult' : 'l.toLive');
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
  const title = t(lesson.boss ? 'r.unit' : res.mistakes === 0 ? 'r.perfect' : 'r.lesson');
  const best = before && before.stars >= res.stars ? '' : before ? `<p class="lede">${esc(t('r.record'))}</p>` : '';
  $('#lp').style.width = '100%';
  $('#lc').textContent = `${state.total} / ${state.total}`;
  $('#lf').hidden = true;
  $('#lback').disabled = false;
  run.key = null;   // иначе Enter нажмёт скрытую «Дальше» и засчитает урок второй раз
  $('#lb').innerHTML = `<div class="result card">
    <div class="big-stars" aria-label="${esc(t('r.stars', { n: res.stars }))}">${starsHtml(res.stars)}</div>
    <h2>${title}</h2>
    ${best}
    <div class="tiles">
      <div class="tile-s xp"><span class="v">+${res.xp}</span><span class="l">XP</span></div>
      <div class="tile-s"><span class="v">${res.accuracy}%</span><span class="l">${esc(t('r.accuracy'))}</span></div>
      <div class="tile-s"><span class="v">${min}:${sec}</span><span class="l">${esc(t('r.time'))}</span></div>
    </div>
    <div class="row-btns">
      ${next ? `<button class="cta-btn" id="rNext">${esc(t('r.nextLesson'))}</button>` : `<button class="cta-btn" id="rMap">${esc(t('r.toCourse'))}</button>`}
      <button class="ghost-btn" id="rReview">${esc(t('r.reread'))}</button>
      <button class="ghost-btn" id="rAgain">${esc(t('r.again'))}</button>
      ${next ? `<button class="ghost-btn" id="rMap">${esc(t('r.toCourse2'))}</button>` : ''}
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
  if (courseId === 'profile') profilePage();
  else if (courseId) coursePage(courseId);
  else catalog();
  scrollTo(0, 0);
}

addEventListener('hashchange', async () => {
  // «Назад» в браузере посреди урока: вернуть адрес урока и спросить, точно ли выходить.
  const inLesson = location.hash.split('/').length > 2;
  if (run && !inLesson && !run.state.done && run.state.cleared.size > 0) {
    const target = location.hash || '#/';
    history.pushState(null, '', `#/${run.courseId}/${run.lesson.id}`);
    if (await ask(t('leave.ask'), t('leave.yes'), t('leave.stay'))) { closeLesson(); location.hash = target; }
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

/* ---------- запуск ---------- */
document.documentElement.lang = getLang();
setLocale(getLang() === 'ru' ? 'ru-RU' : 'en-US');   // числа в стендах: 2 000 или 2,000
$('#navShelf').textContent = t('nav.shelf');
$('#navShelf').href = SHELF_URL;
$('#brandTag').textContent = t('brand.tag');
drawStats();
drawProfileBtn();
startNoise($('#noise'));
await loadCourses(getLang());
route();
flushQueue();   // дослать жалобы, которые не ушли в прошлый раз
// вход приходит асинхронно: перерисовать шапку и, если открыт профиль, его тоже
auth.onChange(() => { drawProfileBtn(); if (location.hash === '#/profile') profilePage(); });
auth.ready.then(() => { drawProfileBtn(); if (location.hash === '#/profile') profilePage(); });
