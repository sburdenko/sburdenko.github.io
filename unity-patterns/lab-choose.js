/** CH.12 decision deck and CH.13 interview drill. */
import { $ } from '../assets/vhs.js?v=202609241230';
import { t } from '../assets/i18n.js?v=202609241230';
import { bindSeg } from '../assets/lab.js?v=202609241230';
import { PRESSURES, recommendPattern, PATTERN_CHAPTERS } from './model-choose.js?v=202609241230';

export function initChooser() {
  let selected = 'creation';
  const list = $('#chooseList');
  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-p]');
    if (!button) return;
    selected = button.dataset.p;
    render();
  });

  function render() {
    const labels = t('choose.pressures');
    list.innerHTML = Object.keys(PRESSURES).map(key =>
      `<button data-p="${key}" aria-pressed="${key === selected}">${labels[key]}</button>`).join('');
    const pattern = recommendPattern(selected);
    const [name, why, cost] = t('choose.answers')[pattern];
    $('#choosePattern').textContent = name;
    $('#chooseWhy').innerHTML = why;
    $('#chooseCost').innerHTML = cost;
    $('#chooseGo').href = `#${PATTERN_CHAPTERS[pattern]}`;
  }
  render();
  return render;
}

const CATEGORIES = ['all', 'solid', 'creation', 'behavior', 'ui', 'data'];

export function initInterview() {
  let category = 'all';
  const filters = $('#qaFilters');
  filters.innerHTML = CATEGORIES.map((key, i) => `<button data-v="${key}" aria-pressed="${i === 0}"></button>`).join('');
  bindSeg(filters, value => { category = value; render(); });

  function render() {
    const names = t('qa.categories');
    [...filters.children].forEach(button => { button.textContent = names[button.dataset.v]; });
    const items = t('qa.items').filter(item => category === 'all' || item.c === category);
    $('#qaCount').textContent = t('qa.count', items.length);
    $('#qa').innerHTML = items.map((item, i) =>
      `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${item.q}</span></summary><div class="a">${item.a}</div></details>`).join('');
  }
  render();
  return render;
}
