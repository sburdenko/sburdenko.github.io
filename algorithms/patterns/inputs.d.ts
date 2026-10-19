/** Types for learn/ (npm run typecheck). */
type Spec = { key: string; type: string; [limit: string]: any };
export const PARSERS: Record<string, (text: string, spec: Spec) => { value?: any; error?: any[] }>;
export const FORMATTERS: Record<string, (value: any) => string>;
export function parseField(text: string, spec: Spec): { value?: any; error?: any[] };
export function formatField(value: any, spec: Spec): string;
export function treeFromLevelOrder(values: (number | null)[]): any;
export function levelOrderOf(spec: any): (number | null)[];
