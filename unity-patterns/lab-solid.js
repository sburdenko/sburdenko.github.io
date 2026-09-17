/** CH.00 pressure map and CH.01 SOLID change-impact rig. */
import { $, esc } from '../assets/vhs.js?v=202609162304';
import { t } from '../assets/i18n.js?v=202609162304';
import { bindSeg, tile } from '../assets/lab.js?v=202609162304';
import { renderCode } from '../assets/code.js?v=202609162304';
import { PRINCIPLES, SOLID_CASES, applyRequest, totalImpact } from './model-solid.js?v=202609162304';
import { SNIPPETS } from './snippets.js?v=202609162304';

export function initMap() {
  const box = $('#pressureMap');
  function render() {
    box.innerHTML = t('map.items').map(([pain, pattern, chapter]) =>
      `<a href="#${chapter}"><small>${pain}</small><b>${pattern}</b></a>`).join('');
  }
  render();
  return render;
}

const isInterface = name => /^I[A-Z]/.test(name);

export function initSolid() {
  const tabs = $('#solidTabs');
  const requestsBox = $('#solidRequests');
  let principle = 'srp', design = 'before', request = null;

  tabs.innerHTML = PRINCIPLES.map((p, i) =>
    `<button data-v="${p}" aria-pressed="${i === 0}">${p.toUpperCase()}</button>`).join('');
  bindSeg(tabs, value => { principle = value; request = null; render(); });
  bindSeg($('#solidDesign'), value => { design = value; render(); });
  requestsBox.addEventListener('click', event => {
    const button = event.target.closest('button[data-r]');
    if (!button) return;
    request = button.dataset.r;
    render();
  });

  function render() {
    const scenario = SOLID_CASES[principle];
    const labels = t('solid.req')[principle];
    $('#solidRule').innerHTML = t('solid.rules')[principle];
    requestsBox.innerHTML = Object.keys(scenario.requests).map(key =>
      `<button class="chip" data-r="${key}" aria-pressed="${key === request}">${labels[key]}</button>`).join('');

    const result = request ? applyRequest(principle, design, request) : null;
    const classes = result ? result.classes : scenario[design];
    $('#solidBoard').innerHTML = classes.map(name => {
      const state = !result ? '' : result.fail.includes(name) ? 'fail' : result.edit.includes(name) ? 'edit' : result.add.includes(name) ? 'add' : '';
      const note = state ? t(`solid.mark.${state}`) : isInterface(name) ? 'interface' : 'class';
      return `<div class="cls ${isInterface(name) ? 'iface' : ''} ${state}"><small>${note}</small>${esc(name)}</div>`;
    }).join('');

    const total = totalImpact(principle, design);
    $('#solidStats').innerHTML = [
      tile(t('solid.statEdits'), result ? result.edit.length : '—', t('solid.statAll', total.edits)),
      tile(t('solid.statNew'), result ? result.add.length : '—'),
      tile(t('solid.statStubs'), result ? result.stubs : '—', t('solid.statAll', total.stubs)),
    ].join('');
    $('#solidOutcome').innerHTML = result
      ? t(`solid.out.${principle}.${design}`, request, result)
      : t('solid.pick');
    renderCode($('#solidCode'), SNIPPETS[`${principle}.${design}`]);
  }

  function renderTable() {
    $('#abstractBody').innerHTML = t('solid.abstractRows')
      .map(([what, abstract, iface]) => `<tr><td>${what}</td><td>${abstract}</td><td>${iface}</td></tr>`).join('');
  }

  render();
  renderTable();
  return () => { render(); renderTable(); };
}
