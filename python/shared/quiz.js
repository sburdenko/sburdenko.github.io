/**
 * Quiz cards: "what will it print", "does it crash", "fill the gap", "put lines in order".
 * mountQuiz(root, quiz, { tape }) — quiz texts live in the tape dictionary under `quiz.<id>.*`.
 */
import { $, $$, esc, rng } from '../../assets/vhs.js?v=202610071637';
import { t, onLang } from '../../assets/i18n.js?v=202610071637';
import { pyBlock } from './py-code.js?v=202610071637';
import { markQuiz, isQuizDone } from './progress.js?v=202610071637';

const normalize = s => String(s).trim().replace(/\s+/g, ' ').replace(/\s*([=,:()[\]])\s*/g, '$1');
const hashOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function shuffled(list, seed) {
  const next = rng(seed), out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out.some((v, i) => v !== list[i]) ? out : shuffled(list, seed + 1);
}

export function mountQuiz(root, quiz, { tape = '' } = {}) {
  root.classList.add('quiz');
  let state = { answered: false, ok: false, order: quiz.kind === 'order' ? shuffled(quiz.lines.map((_, i) => i), hashOf(quiz.id)) : null };
  const done = () => isQuizDone(tape, quiz.id);

  function render() {
    const question = t(`quiz.${quiz.id}.q`) !== `quiz.${quiz.id}.q` ? t(`quiz.${quiz.id}.q`) : t(`py.quiz.${quiz.kind}`);
    let body = '';
    if (quiz.kind === 'output' || quiz.kind === 'error') {
      const options = quiz.kind === 'error' ? quiz.options.map(o => (o === 'none' ? t('py.quiz.noError') : o)) : quiz.options;
      body = `<div class="qopts">${options.map((o, i) => `<button type="button" class="qopt${state.answered ? (i === quiz.answer ? ' right' : state.pick === i ? ' wrong' : '') : ''}" data-i="${i}" ${state.answered ? 'disabled' : ''}><span class="qn">${String.fromCharCode(65 + i)}</span><code>${esc(o)}</code></button>`).join('')}</div>`;
    } else if (quiz.kind === 'fill') {
      body = `<div class="qfill"><input type="text" spellcheck="false" autocomplete="off" placeholder="${t('py.quiz.answerPh')}" value="${esc(state.text || '')}" ${state.answered && state.ok ? 'disabled' : ''}><button type="button" class="btn primary" data-check ${state.answered && state.ok ? 'disabled' : ''}>${t('py.quiz.check')}</button></div>`;
    } else if (quiz.kind === 'order') {
      body = `<ol class="qorder">${state.order.map((li, pos) => `<li data-pos="${pos}"><pre class="code py static"><span class="ln"><span class="src">${esc(quiz.lines[li])}</span></span></pre><span class="qmoves"><button type="button" class="btn" data-up="${pos}" aria-label="${t('py.quiz.up')}" ${pos === 0 || state.ok ? 'disabled' : ''}>▲</button><button type="button" class="btn" data-down="${pos}" aria-label="${t('py.quiz.down')}" ${pos === state.order.length - 1 || state.ok ? 'disabled' : ''}>▼</button></span></li>`).join('')}</ol><button type="button" class="btn primary" data-check ${state.ok ? 'disabled' : ''}>${t('py.quiz.check')}</button>`;
    }
    const verdict = state.answered
      ? `<div class="qverdict ${state.ok ? 'ok' : 'bad'}"><b>${state.ok ? t('py.quiz.right') : t('py.quiz.wrong')}</b> ${t(`quiz.${quiz.id}.why`)}${!state.ok && quiz.kind !== 'output' && quiz.kind !== 'error' ? ` <button type="button" class="btn" data-retry>${t('py.quiz.retry')}</button>` : ''}${quiz.rig ? ` <a class="qsteps" href="#rig-${quiz.rig}">${t('py.quiz.steps')}</a>` : ''}</div>`
      : '';
    root.innerHTML = `<div class="qhead"><span class="lbl">${t('py.quiz.tag')}${done() ? ' · ✓' : ''}</span><h4>${question}</h4></div>${quiz.code ? pyBlock(quiz.code) : ''}${body}${verdict}`;
  }

  root.addEventListener('click', event => {
    const opt = event.target.closest('.qopt');
    if (opt && !state.answered) {
      const pick = Number(opt.dataset.i);
      state = { ...state, answered: true, ok: pick === quiz.answer, pick };
      markQuiz(tape, quiz.id, state.ok);
      render();
      return;
    }
    if (event.target.closest('[data-check]')) {
      if (quiz.kind === 'fill') {
        const text = $('input', root).value;
        const ok = quiz.answers.map(normalize).includes(normalize(text));
        state = { ...state, answered: true, ok, text };
      } else {
        const ok = state.order.every((li, pos) => li === pos);
        state = { ...state, answered: true, ok };
      }
      markQuiz(tape, quiz.id, state.ok);
      render();
      return;
    }
    if (event.target.closest('[data-retry]')) { state = { ...state, answered: false }; render(); $('input', root)?.focus(); return; }
    const up = event.target.closest('[data-up]'), down = event.target.closest('[data-down]');
    if (up || down) {
      const pos = Number((up || down).dataset.up ?? (up || down).dataset.down), to = up ? pos - 1 : pos + 1;
      const order = [...state.order];
      [order[pos], order[to]] = [order[to], order[pos]];
      state = { ...state, order, answered: false };
      render();
    }
  });
  root.addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.matches('input')) $('[data-check]', root)?.click(); });
  onLang(render);
  render();
}

export function mountQuizzes(container, quizzes, ctx) {
  $$('[data-quiz]', container).forEach(el => {
    const quiz = quizzes.find(q => q.id === el.dataset.quiz);
    if (quiz) mountQuiz(el, quiz, ctx);
  });
}
