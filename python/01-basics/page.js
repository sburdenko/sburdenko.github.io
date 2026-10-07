/** PY-01 assembly. */
import { bootTape } from '../shared/tape.js?v=202610071637';
import { DICT } from './i18n.js?v=202610071637';
import { RIGS } from './rigs.js?v=202610071637';
import { QUIZZES } from './quizzes.js?v=202610071637';

export const CHAPTERS = [
  { id: 'print', n: '01' }, { id: 'names', n: '02' }, { id: 'numbers', n: '03' }, { id: 'strings', n: '04' }, { id: 'types', n: '05' },
  { id: 'truth', n: '06' }, { id: 'input', n: '07' }, { id: 'errors', n: '08' }, { id: 'mutable', n: '09' }, { id: 'cheat', n: '10' },
];

bootTape({ tape: '01', dict: DICT, rigs: RIGS, quizzes: QUIZZES, chapters: CHAPTERS });
