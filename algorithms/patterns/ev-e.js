/** Step texts for the chapter 14 rigs: shortest paths. */
const list = a => a.join(', ');
const chain = a => a.join(' → ');
/** Russian plural: 1 шаг, 2 шага, 5 шагов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};

export const EV_E = {
  /* 01 Matrix */
  'zom.ev.start': {
    en: (zeros, ones) => `All ${zeros} zero(s) go into the queue at once with distance 0; the ${ones} one(s) are unknown (?). One BFS from every source: the wave reaches each 1 from its nearest 0 first.`,
    ru: (zeros, ones) => `Все нули (${zeros}) сразу идут в очередь с расстоянием 0, единицы (${ones}) пока неизвестны (?). Один BFS из всех источников: волна доходит до каждой 1 сначала от ближайшего к ней 0.`,
  },
  'zom.ev.level': {
    en: (d, count) => `Every cell at distance ${d - 1} is done. The queue now holds exactly the cells at distance <b>${d}</b> — ${count} of them.`,
    ru: (d, count) => `Все клетки на расстоянии ${d - 1} обработаны. В очереди теперь ровно клетки на расстоянии <b>${d}</b> — их ${count}.`,
  },
  'zom.ev.pop': {
    en: (r, c, d, count, next) => `Take (${r}, ${c}) at distance ${d}. ${count} unknown neighbor(s) get <b>${next}</b> and join the queue — set right now, on enqueue: no later wave can bring them closer.`,
    ru: (r, c, d, count, next) => `Берём (${r}, ${c}) на расстоянии ${d}. Неизвестные соседи (${count}) получают <b>${next}</b> и встают в очередь — ставим сразу, при добавлении: следующие волны ближе не будут.`,
  },
  'zom.ev.skip': {
    en: (r, c, d) => `Take (${r}, ${c}) at distance ${d}: every neighbor already has a distance — nothing to add.`,
    ru: (r, c, d) => `Берём (${r}, ${c}) на расстоянии ${d}: у всех соседей расстояние уже есть — добавлять нечего.`,
  },
  'zom.ev.done': {
    en: max => `The queue is empty: every cell knows the distance to its nearest 0, the farthest is <b>${max}</b>. Each cell entered the queue once — O(R·C), not a BFS from every 1.`,
    ru: max => `Очередь пуста: каждая клетка знает расстояние до ближайшего 0, самое большое — <b>${max}</b>. Каждая клетка была в очереди один раз — O(R·C), а не BFS от каждой единицы.`,
  },

  /* Network Delay Time */
  'ndt.ev.start': {
    en: (k, n) => `The signal starts at node ${k}: dist[${k}] = 0, the other ${n - 1} node(s) are ∞. The priority queue holds distance:node pairs, and the smallest distance comes out first.`,
    ru: (k, n) => `Сигнал выходит из узла ${k}: dist[${k}] = 0, у остальных узлов (${n - 1}) — ∞. В очереди с приоритетом лежат пары расстояние:узел, первой выходит наименьшая.`,
  },
  'ndt.ev.pop': {
    en: (u, d, out) => `Pop ${d}:${u} — the smallest in the queue. Weights are non-negative, so no detour through other nodes can be shorter: dist[${u}] = <b>${d}</b> is final. ${out ? `${out} outgoing edge(s) to relax.` : 'No outgoing edges.'}`,
    ru: (u, d, out) => `Вынимаем ${d}:${u} — наименьшее в очереди. Веса неотрицательные, поэтому обход через другие узлы короче не будет: dist[${u}] = <b>${d}</b> окончательно. ${out ? `Исходящих рёбер: ${out}, проверяем их.` : 'Исходящих рёбер нет.'}`,
  },
  'ndt.ev.relax': {
    en: (u, v, w, d, cand, old) => `Edge ${u}→${v} (${w}): ${d} + ${w} = ${cand} < ${old} — better. dist[${v}] = <b>${cand}</b>, push ${cand}:${v}.${old === '∞' ? '' : ` The old entry ${old}:${v} stays in the queue — there is no decrease-key; it will be skipped when it comes out.`}`,
    ru: (u, v, w, d, cand, old) => `Ребро ${u}→${v} (${w}): ${d} + ${w} = ${cand} < ${old} — лучше. dist[${v}] = <b>${cand}</b>, кладём ${cand}:${v}.${old === '∞' ? '' : ` Старая запись ${old}:${v} остаётся в очереди — decrease-key нет; её пропустят, когда она выйдет.`}`,
  },
  'ndt.ev.keep': {
    en: (u, v, w, d, cand, cur) => `Edge ${u}→${v} (${w}): ${d} + ${w} = ${cand} ≥ ${cur} — not better, dist[${v}] stays ${cur}.`,
    ru: (u, v, w, d, cand, cur) => `Ребро ${u}→${v} (${w}): ${d} + ${w} = ${cand} ≥ ${cur} — не лучше, dist[${v}] остаётся ${cur}.`,
  },
  'ndt.ev.stale': {
    en: (u, d, best) => `Pop ${d}:${u}, but dist[${u}] is already ${best} < ${d}: a stale entry from before the improvement. <b>Skip</b> it — that is lazy deletion.`,
    ru: (u, d, best) => `Вынимаем ${d}:${u}, но dist[${u}] уже ${best} < ${d}: устаревшая запись, оставшаяся с прошлого раза. <b>Пропускаем</b> — это и есть ленивое удаление.`,
  },
  'ndt.ev.done': {
    en: (ans, node) => `The queue is empty and every node is reached. Everyone has the signal once the farthest node, ${node}, has it: answer <b>${ans}</b>.`,
    ru: (ans, node) => `Очередь пуста, все узлы достигнуты. Сигнал есть у всех, когда он дошёл до самого дальнего узла ${node}: ответ <b>${ans}</b>.`,
  },
  'ndt.ev.unreach': {
    en: lost => `The queue is empty, but node(s) ${list(lost)} were never reached — their dist is still ∞. Answer <b>−1</b>.`,
    ru: lost => `Очередь пуста, но до узлов ${list(lost)} сигнал так и не дошёл — dist у них по-прежнему ∞. Ответ <b>−1</b>.`,
  },

  /* Path With Minimum Effort */
  'eff.ev.start': {
    en: (rows, cols) => `${rows} × ${cols}. A route costs its steepest step, not a sum. Dijkstra still works, because that cost never decreases along a route. effort (the small number in the corner) is 0 at the start and ∞ elsewhere.`,
    ru: (rows, cols) => `${rows} × ${cols}. Маршрут стоит столько, сколько его самый крутой шаг, а не сумма. Дейкстра всё равно работает: вдоль маршрута такая цена не уменьшается. effort (маленькое число в углу) на старте 0, в остальных клетках ∞.`,
  },
  'eff.ev.relax': {
    en: (r, c, e, moves) => `Pop (${r}, ${c}) with effort ${e} — the smallest in the queue, so it is final. Neighbors that improve: ${moves.join('; ')}.`,
    ru: (r, c, e, moves) => `Вынимаем (${r}, ${c}) с усилием ${e} — наименьшее в очереди, значит, оно окончательно. Соседи, которым стало лучше: ${moves.join('; ')}.`,
  },
  'eff.ev.settle': {
    en: (r, c, e) => `Pop (${r}, ${c}) with effort ${e}: final, but no neighbor gets a smaller effort through it.`,
    ru: (r, c, e) => `Вынимаем (${r}, ${c}) с усилием ${e}: оно окончательно, но ни одному соседу через неё не стало лучше.`,
  },
  'eff.ev.stale': {
    en: (r, c, e, best) => `Pop ${e}:(${r}, ${c}), but its effort is already ${best} < ${e} — a stale entry. <b>Skip</b>.`,
    ru: (r, c, e, best) => `Вынимаем ${e}:(${r}, ${c}), но усилие там уже ${best} < ${e} — устаревшая запись. <b>Пропускаем</b>.`,
  },
  'eff.ev.done': {
    en: (e, heights) => `The bottom-right corner comes out of the queue, so its effort is final: <b>${e}</b>. Heights along the route: ${chain(heights)}. Popped means final — no need to empty the queue.`,
    ru: (e, heights) => `Правый нижний угол вышел из очереди, значит, его усилие окончательно: <b>${e}</b>. Высоты на маршруте: ${chain(heights)}. Вынули — значит, окончательно, опустошать очередь не нужно.`,
  },

  /* Shortest Path in a Grid with Obstacles Elimination */
  'obs.ev.start': {
    en: (k, rows, cols) => `BFS over states (row, column, breaks left). Start: (0, 0) · ${k}. The number in a cell is the step it was first reached at; the small numbers in the corner are the “breaks left” it has been reached with.`,
    ru: (k, rows, cols) => `BFS по состояниям (строка, столбец, осталось ломаний). Старт: (0, 0) · ${k}. Число в клетке — шаг, на котором до неё впервые дошли; маленькие числа в углу — с каким запасом ломаний до неё доходили.`,
  },
  'obs.ev.step': {
    en: (r, c, rem, d, count, broke, blocked) => `State (${r}, ${c}) · ${rem}, step ${d}: ${count} new state(s) through empty cells, at step ${d + 1}.${blocked ? ` No breaks left, so ${blocked} neighboring wall(s) stay shut.` : ''}`,
    ru: (r, c, rem, d, count, broke, blocked) => `Состояние (${r}, ${c}) · ${rem}, шаг ${d}: новых состояний через пустые клетки — ${count}, они на шаге ${d + 1}.${blocked ? ` Ломаний не осталось, поэтому соседние стены (${blocked}) не пройти.` : ''}`,
  },
  'obs.ev.smash': {
    en: (r, c, rem, d, count, broke) => `State (${r}, ${c}) · ${rem}, step ${d}: ${count} new state(s), ${broke} of them by <b>breaking a wall</b> — they go on with ${rem - 1} break(s) left.`,
    ru: (r, c, rem, d, count, broke) => `Состояние (${r}, ${c}) · ${rem}, шаг ${d}: новых состояний — ${count}; в ${broke} из них <b>ломаем стену</b>, и дальше они идут с запасом ${rem - 1}.`,
  },
  'obs.ev.dead': {
    en: (r, c, rem, d, count, broke, blocked) => `State (${r}, ${c}) · ${rem}: every neighboring state is already seen${blocked ? ' or is a wall with no breaks left' : ''} — nothing new.`,
    ru: (r, c, rem, d, count, broke, blocked) => `Состояние (${r}, ${c}) · ${rem}: все соседние состояния уже встречались${blocked ? ' или упираются в стену без запаса ломаний' : ''} — ничего нового.`,
  },
  'obs.ev.found': {
    en: (steps, r, c, rem) => `The corner (${r}, ${c}) is reached with ${rem} break(s) left after <b>${steps}</b> step(s). BFS reaches it on the earliest possible level, so no path is shorter.`,
    ru: (steps, r, c, rem) => `Угол (${r}, ${c}) достигнут за <b>${ru(steps, 'шаг', 'шага', 'шагов')}</b>, ломаний в запасе: ${rem}. BFS дошёл до него на самом раннем уровне, значит, короче пути нет.`,
  },
  'obs.ev.none': {
    en: k => `The queue is empty: ${k ? `even breaking ${k} wall(s)` : 'without breaking walls'}, the corner cannot be reached. Answer <b>−1</b>.`,
    ru: k => `Очередь пуста: ${k ? `даже если сломать ${ru(k, 'стену', 'стены', 'стен')},` : 'без ломания стен'} до угла не добраться. Ответ <b>−1</b>.`,
  },
};
