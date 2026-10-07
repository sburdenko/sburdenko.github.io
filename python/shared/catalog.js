/** The six tapes of the stand: where they live and how much is in each (for progress bars). */
export const CATALOG = [
  { id: '01', dir: '01-basics', ready: true, totals: { chapters: 10, quizzes: 14, problems: 0 }, tags: ['print', 'names → objects', 'str', 'types'] },
  { id: '02', dir: '02-flow', ready: false, totals: { chapters: 10, quizzes: 0, problems: 0 }, tags: ['if', 'for · while', 'def', 'recursion'] },
  { id: '03', dir: '03-collections', ready: false, totals: { chapters: 10, quizzes: 0, problems: 0 }, tags: ['list', 'dict', 'set', 'generators'] },
  { id: '04', dir: '04-strings-errors', ready: false, totals: { chapters: 9, quizzes: 0, problems: 0 }, tags: ['f-strings', 'try · except', 'files', 'modules'] },
  { id: '05', dir: '05-oop-advanced', ready: false, totals: { chapters: 13, quizzes: 0, problems: 0 }, tags: ['class', 'dunders', 'decorators', 'asyncio'] },
  { id: '06', dir: '06-algorithms', ready: false, totals: { chapters: 8, quizzes: 0, problems: 34 }, tags: ['sorting', 'search', 'recursion', 'grids'] },
];
