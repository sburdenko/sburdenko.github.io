import { renderGraph } from './graph-view.js?v=202609161544';
import { bootVhs } from '../../assets/vhs.js?v=202609161544';
import { register } from '../../assets/i18n.js?v=202609161544';
import { COMMON } from '../../assets/i18n-common.js?v=202609161544';
import { createPlayer, bindTransport } from '../bfs-dfs/player.js?v=202609161544';
import { oppositeTrace, floydTrace, floydLinks } from './model.js?v=202609161544';

register(COMMON);
bootVhs();
const pairCases = [
  { values: [1, 2, 4, 7, 11, 15], target: 15 },
  { values: [1, 2, 4, 7, 11, 15], target: 10 },
  { values: [-5, -2, 0, 3, 6, 9], target: 4 },
  { values: [1, 3, 3, 5, 8, 12], target: 6 }
];
const code = {
  opposite: ['L = 0; R = n - 1', 'while L < R:', '    sum = a[L] + a[R]', '    if sum == target: return (L, R)', '    if sum < target: L += 1', '    else: R -= 1', 'return no pair'],
  floyd: ['slow = fast = head', 'while fast != null and fast.next != null:', '    slow = slow.next; fast = fast.next.next', '    if slow == fast: break to phase 2', 'if fast == null or fast.next == null: return no cycle', 'slow = head', 'while slow != fast:', '    slow = slow.next; fast = fast.next', 'return slow  // cycle entrance']
};

for (const kind of ['opposite', 'floyd', 'duplicate']) {
  const root = document.getElementById(kind + 'Deck');
  const rail = root.querySelector('.pointer-rail');
  const scrub = root.querySelector('.scrub');
  const select = root.querySelector('select');
  const scene = root.querySelector('.crt');
  const graph = document.createElement('div');
  graph.className = 'graph-scene';
  const movement = document.createElement('div');
  movement.className = 'movement-readout';
  scene.after(movement);
  scene.before(root.querySelector('.transport'));
  if (kind !== 'opposite') {
    scene.append(graph);
    if (kind === 'floyd') rail.hidden = true;
  }
  let updateTransport, current;
  const player = createPlayer(frame => {
    const state = frame.run.events[frame.index];
    updateTransport(frame);
    scrub.max = frame.total - 1;
    scrub.value = frame.index;
    const isPair = kind === 'opposite';
    const isDuplicate = kind === 'duplicate';
    const values = isPair ? current.values : isDuplicate ? frame.run.next : frame.run.next.map((_, i) => i);
    rail.replaceChildren(...values.map((value, i) => {
      const cell = document.createElement('div');
      const l = i === (isPair ? state.left : state.slow), r = i === (isPair ? state.right : state.fast);
      cell.className = `cell${l ? ' left' : ''}${r ? ' right' : ''}${isPair && (i < state.left || i > state.right) ? ' discarded' : ''}`;
      const label = document.createElement('small');
      label.textContent = isPair || isDuplicate ? `index ${i}` : `node ${i}`;
      const number = document.createElement('b');
      number.textContent = value;
      const markers = document.createElement('span');
      markers.className = 'markers';
      markers.textContent = [l ? (isPair ? 'L →' : 'S') : '', r ? (isPair ? '← R' : 'F') : ''].filter(Boolean).join(' + ');
      cell.append(label, number, markers);
      if (isDuplicate) {
        const destination = document.createElement('small');
        destination.textContent = `next → ${value}`;
        cell.append(destination);
        if (state.done && value === frame.run.entry) cell.classList.add('duplicate-value');
      }
      return cell;
    }));
    if (!isPair) {
      movement.innerHTML = renderGraph(graph, frame.run.next, state, frame.run.events[frame.index - 1], kind);
    } else {
      const sum = values[state.left] + values[state.right];
      movement.textContent = state.left >= state.right ? 'L and R met · no pair found' : `${values[state.left]} + ${values[state.right]} = ${sum} ${sum < current.target ? '<' : sum > current.target ? '>' : '='} ${current.target} · ${sum < current.target ? 'need a larger sum → move L right' : sum > current.target ? 'need a smaller sum → move R left' : 'target reached'}`;
    }
    root.querySelector('.link-note').textContent = isPair
      ? `Target: ${current.target} · pair checks: ${state.checks} · ${values.length * (values.length - 1) / 2} possible pairs by brute force`
      : isDuplicate ? `Array links: ${frame.run.next.map((value, i) => `${i} → ${value}`).join(' · ')} · phase: ${state.phase === 'entry' ? 'find entrance, 1 + 1' : 'detect cycle, 1 + 2'}`
      : `PHASE ${state.phase === 'entry' ? '2 · FIND ENTRANCE · both move 1 link' : '1 · DETECT CYCLE · slow 1 link / fast 2 links'}`;
    root.querySelector('.explanation').textContent = isDuplicate && state.done ? `The cycle entrance is index ${frame.run.entry}. So the duplicate VALUE is ${frame.run.entry}: multiple array positions point here. The input array was never changed.` : state.message;
    root.querySelector('.pseudo').replaceChildren(...(kind === 'duplicate' ? ['slow = fast = 0', 'repeat:', '    slow = nums[slow]; fast = nums[nums[fast]]', '    until slow == fast', '// A cycle is guaranteed by the input constraints', 'slow = 0', 'while slow != fast:', '    slow = nums[slow]; fast = nums[fast]', 'return slow  // duplicate value'] : code[kind]).map((text, i) => {
      const line = document.createElement('div');
      line.className = 'ln' + (i === state.line ? ' on' : '');
      const number = document.createElement('span'), content = document.createElement('span');
      number.textContent = i + 1; content.textContent = text;
      line.append(number, content);
      return line;
    }));
  });
  updateTransport = bindTransport(root.querySelector('.transport'), player);
  scrub.oninput = () => player.seek(+scrub.value);
  const load = () => {
    if (kind === 'opposite') {
      current = pairCases[+select.value];
      player.load(oppositeTrace(current.values, current.target));
    } else if (kind === 'duplicate') {
      player.load(floydLinks(+select.value === 0 ? [1, 3, 4, 2, 2] : [3, 1, 3, 4, 2]));
    } else player.load(floydTrace(8, +select.value));
  };
  select.onchange = load;
  load();
}
