import { $, $$, bootVhs, press, bytes } from '../assets/vhs.js?v=202609161617';
import { initI18n, t, onLang, getLang } from '../assets/i18n.js?v=202609161617';
import { COMMON } from '../assets/i18n-common.js?v=202609161617';
import { DICT } from './i18n.js?v=202609161617';
import { PRINCIPLES, STATE_TRANSITIONS, poolModel, transitionState, flyweightMemory, dirtyWork, recommendPattern, applyMove } from './model.js?v=202609161617';

initI18n({ ...COMMON, ...DICT });
bootVhs();
const active = button => button.getAttribute('aria-pressed') === 'true';
const select = (buttons, chosen) => press(buttons, button => button === chosen);
const tile = (label, value, detail = '') => `<div class="tile"><span class="lbl">${label}</span><span class="val">${value}</span><span class="d">${detail}</span></div>`;

let renderers = [];

function initSolid() {
  const tabs = $('#solidTabs');
  let index = 0;
  function render() {
    const labels = t('solid.labels'), cases = t('solid.cases');
    tabs.innerHTML = PRINCIPLES.map((principle, i) => `<button class="chip" data-i="${i}" aria-pressed="${i === index}">${principle.toUpperCase()}</button>`).join('');
    const [problem, before, after] = cases[index];
    $('#solidProblem').textContent = problem; $('#solidBefore').textContent = before;
    $('#solidRule').textContent = labels[index]; $('#solidAfter').textContent = after;
    $$('#solidTabs button').forEach(button => button.onclick = () => { index = +button.dataset.i; render(); });
  }
  renderers.push(render); render();
}

function initLifetime() {
  const enemies = $$('#enemySeg button');
  enemies.forEach(button => button.onclick = () => select(enemies, button));
  $('#factorySpawn').onclick = () => {
    const type = enemies.find(active).dataset.v;
    $('#factoryProduct').textContent = `${type[0].toUpperCase()}${type.slice(1)} : IEnemy`;
    const enemy = document.createElement('i'); enemy.className = `enemy ${type}`; enemy.title = `Initialize(${type})`;
    $('#spawnBay').appendChild(enemy); if ($('#spawnBay').children.length > 9) $('#spawnBay').firstElementChild.remove();
  };
  const toggle = $('#poolToggle'), rate = $('#spawnRate'), life = $('#objectLife'), size = $('#poolSize');
  function pool() {
    const enabled = active(toggle), result = poolModel({ spawnRate:+rate.value, lifetime:+life.value, seconds:10, pooling:enabled, poolSize:+size.value });
    $('#rateOut').textContent = rate.value; $('#lifeOut').textContent = `${life.value}s`; $('#sizeOut').textContent = size.value;
    const bars = Math.min(40, result.peakAlive); $('#poolStrip').innerHTML = Array.from({length:bars}, (_,i) => `<i class="${i >= result.capacity && enabled ? 'miss' : ''}"></i>`).join('');
    const labels = getLang() === 'ru' ? ['создано / 10с','пик активных','выделений','повторно'] : ['spawned / 10s','peak alive','allocations','reused'];
    $('#poolStats').innerHTML = tile(labels[0], result.spawned) + tile(labels[1], result.peakAlive) + tile(labels[2], result.allocations, enabled ? (getLang()==='ru'?'прогрев + промахи':'warmup + misses') : (getLang()==='ru'?'каждое создание':'every spawn')) + tile(labels[3], result.reused, result.misses ? `${result.misses} ${getLang()==='ru'?'не хватило мест':'capacity misses'}` : (getLang()==='ru'?'в пределах пула':'inside capacity'));
  }
  toggle.onclick = () => { toggle.setAttribute('aria-pressed', active(toggle) ? 'false' : 'true'); pool(); };
  [rate,life,size].forEach(input => input.oninput = pool); renderers.push(pool); pool();
  const dependencyButtons = $$('#dependencySeg button');
  dependencyButtons.forEach(button => button.onclick = () => { select(dependencyButtons, button); const explicit = button.dataset.v === 'explicit'; $('#dependencyMap').classList.toggle('explicit', explicit); $('#dependencyMap strong').innerHTML = explicit ? 'IScoreService<br><small>injected reference</small>' : 'GameManager<br><small>static Instance</small>'; });
}

function initCommand() {
  let position = {x:2,y:2}, commands = [], cursor = 0;
  function render() {
    $('#commandGrid').innerHTML = Array.from({length:25},(_,i) => `<i class="${i === position.y * 5 + position.x ? 'player' : ''}"></i>`).join('');
    $('#commandHistory').innerHTML = commands.map((command,i) => `<i class="${i >= cursor ? 'undone' : ''}">${command.direction} [${command.before.x},${command.before.y}]→[${command.after.x},${command.after.y}]</i>`).join('') || `<span class="hint">${t('command.empty')}</span>`;
    $('#undoBtn').disabled = cursor === 0; $('#redoBtn').disabled = cursor === commands.length;
  }
  $$('.move-pad button').forEach(button => button.onclick = () => { const before = {...position}, after = applyMove(before,button.dataset.dir); if (before.x === after.x && before.y === after.y) return; commands = commands.slice(0,cursor); commands.push({direction:button.dataset.dir,before,after}); cursor++; position=after; render(); });
  $('#undoBtn').onclick = () => { if(cursor){cursor--;position={...commands[cursor].before};render();} };
  $('#redoBtn').onclick = () => { if(cursor<commands.length){position={...commands[cursor].after};cursor++;render();} };
  $('#resetCommand').onclick = () => {position={x:2,y:2};commands=[];cursor=0;render();}; renderers.push(render); render();
}

function initState() {
  let state = 'idle';
  const allEvents = [...new Set(Object.values(STATE_TRANSITIONS).flatMap(item => Object.keys(item)))];
  $('#stateEvents').innerHTML = allEvents.map(event => `<button data-event="${event}">${event.toUpperCase()}</button>`).join('');
  function render(message='') { $$('#stateMachine [data-state]').forEach(node => node.classList.toggle('active',node.dataset.state===state)); $('#currentState').textContent=state.toUpperCase(); $('#stateMessage').textContent=message; const routes=Object.entries(STATE_TRANSITIONS[state]).map(([event,next])=>`${event} → ${next}`).join(' · '); $('#validEvents').textContent=t('state.valid',routes); }
  $$('#stateEvents button').forEach(button => button.onclick=()=>{const before=state,event=button.dataset.event,next=transitionState(state,event);state=next;render(next===before?t('state.ignored',event):t('state.changed',before,next));}); render();
  renderers.push(()=>render(''));
}

function initObserver() {
  const counts = new Map(); const buttons = $$('#subscribers button'); buttons.forEach(button=>{counts.set(button,0);button.onclick=()=>button.setAttribute('aria-pressed',active(button)?'false':'true');});
  function render(){buttons.forEach(button=>{const count=counts.get(button);button.querySelector('span').textContent=getLang()==='ru'?`${count} событий`:`${count} events`;});}
  $('#emitDamage').onclick=()=>{const line=$('#signalLine');line.classList.remove('pulse');void line.offsetWidth;line.classList.add('pulse');buttons.forEach(button=>{if(!active(button))return;counts.set(button,counts.get(button)+1);button.classList.add('flash');setTimeout(()=>button.classList.remove('flash'),450);});render();};
  renderers.push(render); render();
}

function initUi() {
  let health=100; const modes=$$('#uiMode button');
  function render(pulse=false){const mode=modes.find(active).dataset.v;$('#healthFill').style.width=`${health}%`;$('#healthText').textContent=`${health} / 100`;$('#flowDiagram').innerHTML=mode==='mvp'?'<span>MODEL<br>health</span><i>event →</i><span>PRESENTER<br>UpdateUI()</span><i>→</i><span>VIEW</span>':'<span>MODEL</span><i>→</i><span>VIEWMODEL<br>CurrentHealth</span><i>binding →</i><span>VIEW</span>';$('#uiReason').textContent=t(`ui.${mode}`);if(pulse){$('#flowDiagram').classList.remove('pulse');void $('#flowDiagram').offsetWidth;$('#flowDiagram').classList.add('pulse');}}
  modes.forEach(button=>button.onclick=()=>{select(modes,button);render();});$('#damageHealth').onclick=()=>{health=Math.max(0,health-10);render(true);};$('#healHealth').onclick=()=>{health=Math.min(100,health+10);render(true);};renderers.push(()=>render());render();
}

function initPerformance() {
  const strategies=$$('#strategySeg button'), names={radar:'RadarAbility',heal:'FirstAidAbility',air:'AirSupportAbility'},results={radar:'TARGETS REVEALED',heal:'SQUAD +25 HP',air:'STRIKE QUEUED'};
  function strategy(){const key=strategies.find(active).dataset.v;$('#strategyName').textContent=names[key];$('#strategyScreen').textContent='READY';}
  strategies.forEach(button=>button.onclick=()=>{select(strategies,button);strategy();});$('#runStrategy').onclick=()=>{const screen=$('#strategyScreen'),key=strategies.find(active).dataset.v;screen.textContent=results[key];screen.classList.remove('run');void screen.offsetWidth;screen.classList.add('run');};strategy();
  const units=$('#unitCount'),shared=$('#sharedSize');function fly(){const result=flyweightMemory({units:+units.value,sharedBytes:+shared.value*1024,uniqueBytes:64});const max=result.duplicated;$('#unitsOut').textContent=(+units.value).toLocaleString();$('#sharedOut').textContent=`${shared.value} KB`;$('#flyBars').innerHTML=bar(getLang()==='ru'?'ДУБЛИРОВАНИЕ':'DUPLICATED',result.duplicated,max,false)+bar('FLYWEIGHT',result.flyweight,max,true)+`<p class="badge ok">${getLang()==='ru'?'ЭКОНОМИЯ':'SAVE'} ${bytes(result.saved)}</p>`;}function bar(label,value,max,good){return `<div class="memory-row ${good?'good':''}"><div><span>${label}</span><b>${bytes(value)}</b></div><i style="width:${Math.max(1,value/max*100)}%"></i></div>`;}[units,shared].forEach(input=>input.oninput=fly);renderers.push(fly);fly();
  const frames=$('#frameCount'),changes=$('#changeCount'),reads=$('#readCount');function countBar(label,value,max,good){return `<div class="memory-row ${good?'good':''}"><div><span>${label}</span><b>${value} ${getLang()==='ru'?'пересч.':'runs'}</b></div><i style="width:${Math.max(1,value/max*100)}%"></i></div>`;}function dirty(){const result=dirtyWork({frames:+frames.value,changes:+changes.value,reads:+reads.value});$('#framesOut').textContent=frames.value;$('#changesOut').textContent=changes.value;$('#readsOut').textContent=reads.value;$('#dirtyBars').innerHTML=countBar(getLang()==='ru'?'ПЕРЕСЧЁТ КАЖДЫЙ КАДР':'EAGER RECALCULATIONS',result.eager,result.eager,false)+countBar('DIRTY FLAG',result.dirty,result.eager,true)+`<p class="badge ok">${getLang()==='ru'?'ПРОПУЩЕНО':'SKIP'} ${result.saved}</p>`;}[frames,changes,reads].forEach(input=>input.oninput=dirty);dirty();renderers.push(dirty);
}

function initChooser() {
  const problems={en:{create:'Concrete creation leaks everywhere',reuse:'Projectiles create GC spikes',global:'One service truly owns app-wide state',undo:'Actions need undo or replay',modes:'An object has exclusive modes',notify:'Many systems react to one event',ui:'UI refresh glue keeps growing',swap:'Behavior must change at runtime',memory:'Thousands duplicate the same data',recalc:'Expensive derived data rarely changes'},ru:{create:'Конкретное создание расползлось по коду',reuse:'Снаряды вызывают всплески GC',global:'Один сервис владеет состоянием приложения',undo:'Действиям нужен undo или replay',modes:'У объекта взаимоисключающие режимы',notify:'Много систем реагируют на событие',ui:'Код ручного обновления UI растёт',swap:'Поведение меняется во время игры',memory:'Тысячи объектов дублируют данные',recalc:'Дорогой результат редко меняется'}};
  let selected='create';function render(){const labels=problems[getLang()];$('#problemList').innerHTML=Object.entries(labels).map(([key,label])=>`<button data-key="${key}" aria-pressed="${key===selected}">${label}</button>`).join('');const pattern=recommendPattern(selected);$('#recommendation').textContent=t('choose.names')[pattern];$('#recommendationCost').textContent=t('choose.costs')[pattern];$$('#problemList button').forEach(button=>button.onclick=()=>{selected=button.dataset.key;render();});}renderers.push(render);render();
}

function initQa(){function render(){ $('#qaList').innerHTML=t('qa.items').map(([q,a],i)=>`<details><summary>${String(i+1).padStart(2,'0')} · ${q}</summary><p>${a}</p></details>`).join('');}renderers.push(render);render();}

initSolid();initLifetime();initCommand();initState();initObserver();initUi();initPerformance();initChooser();initQa();
onLang(()=>renderers.forEach(render=>render()));
