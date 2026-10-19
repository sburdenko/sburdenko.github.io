/** Types for learn/ (npm run typecheck). */
export interface TapeProblem { rig: string; name: string; num: number; slug: string; diff: 'Easy' | 'Medium' | 'Hard'; code: string; must: boolean }
export const NAMES: Record<string, string>;
export const PROBLEMS: Record<string, TapeProblem[]>;
