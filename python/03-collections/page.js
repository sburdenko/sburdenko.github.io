/** PY-03 assembly. */
import { bootTape } from '../shared/tape.js?v=202610071708';
import { DICT } from './i18n.js?v=202610071708';
import { RIGS } from './rigs.js?v=202610071708';
import { QUIZZES } from './quizzes.js?v=202610071708';

export const CHAPTERS = [
  { id: 'list', n: '01' }, { id: 'tuple', n: '02' }, { id: 'dict', n: '03' }, { id: 'set', n: '04' }, { id: 'stackq', n: '05' },
  { id: 'heap', n: '06' }, { id: 'comp', n: '07' }, { id: 'iter', n: '08' }, { id: 'sorting', n: '09' }, { id: 'cheat', n: '10' },
];

bootTape({ tape: '03', dict: DICT, rigs: RIGS, quizzes: QUIZZES, chapters: CHAPTERS });
