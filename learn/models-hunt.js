/**
 * Стенд «найди баг»: листинг кода, строки отмечаются нажатием, потом проверка.
 * Без DOM — тесты проходят задание теми же действиями, что и кнопки.
 *
 * card.code   — листинг (строки нумеруются с нуля)
 * card.bugs   — [{ lines: [номера строк], title, why, cat? }]: любая из строк баги засчитывает его
 * card.goal   — { min, maxFalse }: сколько багов нужно найти и сколько ложных отметок допустимо
 */
import { tr } from './i18n.js?v=202610101341';

export const HUNT_DEFAULT = { maxFalse: 2 };

/** Что отмечено: найденные баги, пропущенные баги и ложные строки. */
export function huntAnalyze(card, flagged) {
  const set = new Set(flagged);
  const bugLines = new Set(card.bugs.flatMap(b => b.lines));
  const found = card.bugs.map((b, i) => (b.lines.some(l => set.has(l)) ? i : -1)).filter(i => i >= 0);
  const missed = card.bugs.map((_, i) => i).filter(i => !found.includes(i));
  const falseLines = [...set].filter(l => !bugLines.has(l)).sort((a, b) => a - b);
  return { found, missed, falseLines };
}

export function huntNeed(card) {
  return { min: card.goal?.min ?? card.bugs.length, maxFalse: card.goal?.maxFalse ?? HUNT_DEFAULT.maxFalse };
}

export const huntRig = {
  init: () => ({ flag: [], checked: false, revealed: false }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return huntRig.init(card);
    if (s0.revealed && k !== 'reset') return s0;
    if (k === 'flag') {
      const n = Number(v), lines = card.code.split('\n').length;
      if (!Number.isInteger(n) || n < 0 || n >= lines) throw new Error(`нет строки ${v}`);
      const flag = s0.flag.includes(n) ? s0.flag.filter(x => x !== n) : [...s0.flag, n];
      return { ...s0, flag, checked: false };
    }
    if (k === 'check') return { ...s0, checked: true };
    if (k === 'reveal') return { ...s0, revealed: true, checked: true };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    if (s.revealed) return true;   // сдался и посмотрел разбор — урок засчитывается, чтобы идти дальше
    if (!s.checked) return false;
    const r = huntAnalyze(card, s.flag), need = huntNeed(card);
    return r.found.length >= need.min && r.falseLines.length <= need.maxFalse;
  }
};

/** Одна строка сводки после проверки. */
export function huntSummary(card, s) {
  const r = huntAnalyze(card, s.flag), need = huntNeed(card);
  return tr({
    ru: `Найдено багов: ${r.found.length} из ${need.min}. Лишних отметок: ${r.falseLines.length}${r.falseLines.length > need.maxFalse ? ` (допустимо не больше ${need.maxFalse})` : ''}.`,
    en: `Bugs found: ${r.found.length} of ${need.min}. Extra flags: ${r.falseLines.length}${r.falseLines.length > need.maxFalse ? ` (at most ${need.maxFalse} allowed)` : ''}.`
  });
}
