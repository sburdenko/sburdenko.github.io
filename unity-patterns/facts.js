/** Builds the three-row "gives / costs / use when" block used by every chapter. */
const LABELS = {
  en: ['Gives', 'Costs', 'Use when'],
  ru: ['Даёт', 'Цена', 'Когда брать'],
};

export function facts(lang, gives, costs, when) {
  const [g, c, w] = LABELS[lang];
  return `<div><span class="k save">${g}</span><p>${gives}</p></div>`
    + `<div><span class="k cost">${c}</span><p>${costs}</p></div>`
    + `<div><span class="k need">${w}</span><p>${when}</p></div>`;
}
