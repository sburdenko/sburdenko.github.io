/** Local progress of the Python stand: chapters, quizzes and problems done, kept in localStorage. Immutable updates. */
const KEY = 'py.progress.v1';
const EMPTY = Object.freeze({ chapters: {}, quizzes: {}, problems: {}, updatedAt: null });

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return isProgress(parsed) ? Object.freeze({ ...EMPTY, ...parsed }) : EMPTY;
  } catch { return EMPTY; }
}

function write(next) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: nothing is remembered */ }
  listeners.forEach(cb => cb(next));
  return next;
}

export const isProgress = p => !!p && typeof p === 'object' && ['chapters', 'quizzes', 'problems'].every(k => !p[k] || typeof p[k] === 'object');

const listeners = new Set();
export const onProgress = cb => { listeners.add(cb); return () => listeners.delete(cb); };

const stamp = () => new Date().toISOString().slice(0, 10);
const withKey = (p, bucket, key, value) => Object.freeze({ ...p, [bucket]: { ...p[bucket], [key]: value }, updatedAt: stamp() });

export const getProgress = read;
export const markChapter = (tape, chapter) => write(withKey(read(), 'chapters', `${tape}/${chapter}`, 'done'));
export const markQuiz = (tape, quiz, ok) => { const p = read(); const cur = p.quizzes[`${tape}/${quiz}`]; return write(withKey(p, 'quizzes', `${tape}/${quiz}`, cur === 'ok' ? 'ok' : ok ? 'ok' : 'tried')); };
export const markProblem = (tape, problem) => write(withKey(read(), 'problems', `${tape}/${problem}`, 'done'));
export const isChapterDone = (tape, chapter) => read().chapters[`${tape}/${chapter}`] === 'done';
export const isQuizDone = (tape, quiz) => read().quizzes[`${tape}/${quiz}`] === 'ok';
export const isProblemDone = (tape, problem) => read().problems[`${tape}/${problem}`] === 'done';

/** Counts for one tape: how many of its chapters / quizzes / problems are done. */
export function summary(tape, totals) {
  const p = read();
  const count = (bucket, want) => Object.entries(p[bucket]).filter(([k, v]) => k.startsWith(`${tape}/`) && v === want).length;
  const done = { chapters: count('chapters', 'done'), quizzes: count('quizzes', 'ok'), problems: count('problems', 'done') };
  const complete = totals.chapters > 0 && done.chapters >= totals.chapters && done.quizzes >= (totals.quizzes || 0) && done.problems >= (totals.problems || 0);
  return { ...done, totals, complete };
}

export const exportProgress = () => JSON.stringify(read(), null, 2);
export function importProgress(json) {
  const parsed = JSON.parse(json);
  if (!isProgress(parsed)) throw new Error('not a progress export');
  return write(Object.freeze({ ...EMPTY, ...parsed, updatedAt: stamp() }));
}
export const resetProgress = () => write(EMPTY);
