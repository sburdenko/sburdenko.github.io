/**
 * Типы данных платформы. Описывают то, что лежит в content/<курс>/ после сборки строк
 * (см. learn/content.js); проверяются командой npm run typecheck.
 */

/** Карточка-пояснение: текст, необязательный код, схема «поток» и блок «Глубже» для опытных. */
export interface LearnCard { t: 'learn'; title: string; body: string; deep?: string; code?: string; lang?: string; flow?: string[] }

/** Один верный вариант. wrong[i] — что не так с вариантом i. */
export interface ChoiceCard { t: 'choice'; q: string; options: string[]; answer: number; explain: string; wrong?: Record<number, string>; code?: string; lang?: string; deep?: string }

/** Несколько верных вариантов: answer — индексы. */
export interface MultiCard { t: 'multi'; q: string; options: string[]; answer: number[]; explain: string; code?: string; lang?: string; deep?: string }

/** Расставить шаги: items уже в правильном порядке, показываются перемешанными. */
export interface OrderCard { t: 'order'; q: string; items: string[]; explain?: string; code?: string; lang?: string }

/** Вставить плитки в пропуски «___» в коде: answer — плитки по порядку пропусков. */
export interface BlanksCard { t: 'blanks'; q: string; code: string; tiles: string[]; answer: string[]; explain?: string; lang?: string }

/** Нажать строку кода: answer — номер строки. */
export interface TaplineCard { t: 'tapline'; q: string; code: string; answer: number; explain?: string; lang?: string }

/** Соединить пары: [левое, правое]. */
export interface MatchCard { t: 'match'; q: string; pairs: [string, string][]; code?: string; lang?: string }

/** Стенд: rig — имя стенда в rigs*.js, solve — действия, которые выполняют задание (проверяются тестами). */
export interface RigCard { t: 'rig'; rig: string; task: string; goal?: any; solve?: string[]; [field: string]: any }

export type Card = LearnCard | ChoiceCard | MultiCard | OrderCard | BlanksCard | TaplineCard | MatchCard | RigCard;

export interface Lesson { id: string; title: string; sub: string; minutes: number; cards: Card[] }

export interface Unit {
  id: string; title: string; blurb: string;
  soon?: boolean;
  source?: { title: string; url: string };
  lessons?: Lesson[];
}

export interface Course { id: string; title: string; units: Unit[] }

/** Строки по языкам: { ru: {…}, en: {…} }, ключ — путь внутри структуры. */
export type StringTable = Record<string, string>;
