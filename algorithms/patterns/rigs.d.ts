/** Types for learn/ (npm run typecheck): the tape's own code stays plain JS and is not type-checked. */
export interface TapeEvent { key: string; args: any[]; [state: string]: any }
export interface TapeRun { events: TapeEvent[]; [field: string]: any }
export interface TapeField { key: string; type: string; [limit: string]: any }
export interface TapeRig {
  fields: TapeField[];
  example: Record<string, any>;
  random(next: () => number): Record<string, any>;
  check(params: Record<string, any>): any[] | null;
  run(params: Record<string, any>): TapeRun;
  view(run: TapeRun, event: TapeEvent): string;
  vars(run: TapeRun, event: TapeEvent): [string, string][];
}
export const PATTERN_IDS: string[];
export const RIGS: Record<string, TapeRig>;
export const MAX_STEPS: number;
export function runWithInput(rig: TapeRig, texts: Record<string, string>):
  { run: TapeRun; params: Record<string, any>; error?: undefined; field?: undefined } | { error: any[]; field: string | null; run?: undefined };
