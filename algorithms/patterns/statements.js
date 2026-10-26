/** Full problem statements, keyed by rig id: { ex: { in, out }, en: { text, limits?, note? }, ru: { … } }. */
import { ST_A } from './statements-a.js?v=202610261308';
import { ST_B } from './statements-b.js?v=202610261308';
import { ST_C } from './statements-c.js?v=202610261308';
import { ST_D } from './statements-d.js?v=202610261308';

export const STATEMENTS = { ...ST_A, ...ST_B, ...ST_C, ...ST_D };
