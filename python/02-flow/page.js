/** PY-02 assembly. */
import { bootTape } from '../shared/tape.js?v=202610071646';
import { DICT } from './i18n.js?v=202610071646';
import { RIGS } from './rigs.js?v=202610071646';
import { QUIZZES } from './quizzes.js?v=202610071646';

export const CHAPTERS = [
  { id: 'cond', n: '01' }, { id: 'while', n: '02' }, { id: 'forloop', n: '03' }, { id: 'loopextra', n: '04' }, { id: 'functions', n: '05' },
  { id: 'arguments', n: '06' }, { id: 'scope', n: '07' }, { id: 'recursion', n: '08' }, { id: 'closures', n: '09' }, { id: 'cheat', n: '10' },
];

bootTape({ tape: '02', dict: DICT, rigs: RIGS, quizzes: QUIZZES, chapters: CHAPTERS });
