/** Builds the three-row "gives / costs / needs" block used by URP chapters. */
const LABELS = {
  en: ['Gives', 'Costs', 'Needs'],
  ru: ['Даёт', 'Цена', 'Нужно'],
};

export function facts(lang, gives, costs, needs) {
  const [g, c, n] = LABELS[lang];
  return `<div><span class="k save">${g}</span><p>${gives}</p></div>`
    + `<div><span class="k cost">${c}</span><p>${costs}</p></div>`
    + `<div><span class="k need">${n}</span><p>${needs}</p></div>`;
}
