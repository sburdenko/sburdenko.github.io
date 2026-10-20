/** Step texts for the chapter 16 rigs: games — paths and space. */
const list = a => a.join(', ');
const chain = a => a.join(' → ');
const fx = v => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const fxRu = v => fx(v).replace('.', ',');
/** Russian plural: 1 шаг, 2 шага, 5 шагов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};
const H_EN = { chebyshev: 'Chebyshev max(dr, dc)', octile: 'octile max + 0.41·min', manhattan: 'Manhattan dr + dc', zero: 'h = 0' };
const H_RU = { chebyshev: 'Чебышёву max(dr, dc)', octile: 'октилю max + 0,41·min', manhattan: 'Манхэттену dr + dc', zero: 'h = 0' };
const H_RU_NOM = { chebyshev: 'Чебышёв', octile: 'октиль', manhattan: 'Манхэттен', zero: 'h = 0' };

/** The tail of a neighbor step: closed neighbors skipped, and whether a closed one would have been shorter. */
const skippedEn = (closed, kept, missed) => [
  closed ? ` ${closed} closed neighbor(s) are skipped${missed ? ` — though ${missed} of them would be shorter through here: this h is inconsistent, and A* does not reopen closed cells` : ''}.` : '',
  kept ? ` ${kept} open neighbor(s) already have a g that is no worse.` : '',
].join('');
const skippedRu = (closed, kept, missed) => [
  closed ? ` Закрытых соседей (${closed}) пропускаем${missed ? ` — хотя к ${missed} из них отсюда путь короче: эта h несогласованна, а закрытые клетки A* заново не открывает` : ''}.` : '',
  kept ? ` У открытых соседей (${kept}) g уже не хуже.` : '',
].join('');

/** One find: a root answers at once, anything else walks up to its root. */
const walkEn = (x, path) => (path.length === 1 ? `${x} is a root itself` : `find(${x}) walks ${chain(path)}`);
const walkRu = (x, path) => (path.length === 1 ? `${x} — сам корень` : `find(${x}) проходит ${chain(path)}`);

export const EV_GAMES = {
  /* A* on a grid */
  'ast.ev.start': {
    en: (h, h0) => `A* from S to G. In each cell: g — steps from S (top left), h — the estimate of the rest by ${H_EN[h]} (top right), f = g + h (centre). The heap always gives the smallest f; S starts with g = 0 and f = ${fx(h0)}. ${h === 'zero' ? 'With h = 0 this is plain Dijkstra — with unit steps, just BFS.' : h === 'chebyshev' ? 'With 8 directions and a diagonal costing 1, Chebyshev is the exact rest on an empty map: it never overestimates.' : 'Careful: a diagonal costs 1 here, and this h can overestimate.'}`,
    ru: (h, h0) => `A* из S в G. В каждой клетке: g — шагов от S (слева вверху), h — оценка остатка по ${H_RU[h]} (справа вверху), f = g + h (в центре). Куча всегда отдаёт наименьшее f; у S g = 0 и f = ${fxRu(h0)}. ${h === 'zero' ? 'С h = 0 это обычный Дейкстра, а при шагах по 1 — просто BFS.' : h === 'chebyshev' ? 'При 8 направлениях и диагонали за 1 Чебышёв — точный остаток на пустой карте: он никогда не переоценивает.' : 'Осторожно: диагональ здесь стоит 1, и эта h может переоценивать.'}`,
  },
  'ast.ev.blocked': {
    en: cell => `${cell} is blocked, so no clear path exists at all. Answer <b>−1</b> before any search.`,
    ru: cell => `${cell} занята, свободного пути нет вовсе. Ответ <b>−1</b> ещё до поиска.`,
  },
  'ast.ev.pop': {
    en: (cell, g, h, f, left) => `Take ${cell} from the heap: f = ${g} + ${fx(h)} = ${fx(f)} is ${left ? `the smallest of ${left + 1}` : 'the only entry'}. It goes into the closed set — its g = ${g} is final. Now its 8 neighbors.`,
    ru: (cell, g, h, f, left) => `Берём из кучи ${cell}: f = ${g} + ${fxRu(h)} = ${fxRu(f)} — ${left ? `наименьшее из ${left + 1}` : 'единственная запись'}. Клетка уходит в закрытое множество — её g = ${g} окончательно. Теперь её 8 соседей.`,
  },
  'ast.ev.open': {
    en: (cell, opened, better, closed, kept, missed) => `New in the heap: ${list(opened)} — each gets g, h and f.${skippedEn(closed, kept, missed)}`,
    ru: (cell, opened, better, closed, kept, missed) => `Новые в куче: ${list(opened)} — каждая получает g, h и f.${skippedRu(closed, kept, missed)}`,
  },
  'ast.ev.relax': {
    en: (cell, opened, better, closed, kept, missed) => `A shorter way in: ${list(better)} — g dropped, so a new heap entry is pushed. The old entry stays (there is no decrease-key) and will be skipped as stale.${opened.length ? ` New: ${list(opened)}.` : ''}${skippedEn(closed, kept, missed)}`,
    ru: (cell, opened, better, closed, kept, missed) => `Путь короче: ${list(better)} — g уменьшилось, в кучу идёт новая запись. Старая остаётся (decrease-key нет), её потом пропустят как устаревшую.${opened.length ? ` Новые: ${list(opened)}.` : ''}${skippedRu(closed, kept, missed)}`,
  },
  'ast.ev.closed': {
    en: (cell, opened, better, closed, kept, missed) => `Nothing new and nothing better from ${cell}.${skippedEn(closed, kept, missed)}`,
    ru: (cell, opened, better, closed, kept, missed) => `Из ${cell} ничего нового и ничего лучше.${skippedRu(closed, kept, missed)}`,
  },
  'ast.ev.dead': {
    en: cell => `${cell} has no free neighbors at all — only walls and the edge of the map. Nothing enters the heap.`,
    ru: cell => `У ${cell} нет ни одного свободного соседа — только стены и край карты. В кучу ничего не идёт.`,
  },
  'ast.ev.stale': {
    en: (cell, ge, best) => `Pop ${cell} with g = ${ge}, but it is closed already with g = ${best}: a stale entry, left behind when its g improved. <b>Skip</b> it.`,
    ru: (cell, ge, best) => `Вынимаем ${cell} с g = ${ge}, но клетка уже закрыта с g = ${best}: устаревшая запись, оставшаяся после улучшения g. <b>Пропускаем</b>.`,
  },
  'ast.ev.found': {
    en: (len, expanded, h, zero) => `G leaves the heap, so its g is final: the shortest path has <b>${len}</b> cells (g + 1, the start counts). ${h === 'zero' ? `Dijkstra expanded ${expanded} cells — the price of searching without an aim; try h = chebyshev.` : `A* expanded ${expanded} cells; Dijkstra (h = 0) needs ${zero} for the same answer.`}`,
    ru: (len, expanded, h, zero) => `G вышла из кучи, значит, её g окончательно: в кратчайшем пути <b>${ru(len, 'клетка', 'клетки', 'клеток')}</b> (g + 1, старт тоже считается). ${h === 'zero' ? `Дейкстра раскрыл ${ru(expanded, 'клетку', 'клетки', 'клеток')} — цена поиска без прицела; попробуй h = chebyshev.` : `A* раскрыл ${ru(expanded, 'клетку', 'клетки', 'клеток')}; Дейкстре (h = 0) для того же ответа нужно ${zero}.`}`,
  },
  'ast.ev.worse': {
    en: (len, expanded, h, zero, best) => `G leaves the heap with a path of <b>${len}</b> cells — but the shortest has ${best}. ${H_EN[h]} overestimates when a diagonal costs 1, so a cell was closed too early. Only ${expanded} cells expanded (Dijkstra: ${zero}), and the answer is wrong: an admissible h never overestimates.`,
    ru: (len, expanded, h, zero, best) => `G вышла из кучи с путём в <b>${ru(len, 'клетку', 'клетки', 'клеток')}</b>, а в кратчайшем — ${best}. ${H_RU_NOM[h]} переоценивает, когда диагональ стоит 1, и какую-то клетку закрыли слишком рано. Раскрыто всего ${expanded} (у Дейкстры ${zero}), но ответ неверный: допустимая h никогда не переоценивает.`,
  },
  'ast.ev.none': {
    en: expanded => `The heap is empty after ${expanded} expanded cell(s): G cannot be reached. Answer <b>−1</b>.`,
    ru: expanded => `Куча пуста после ${ru(expanded, 'раскрытой клетки', 'раскрытых клеток', 'раскрытых клеток')}: до G не добраться. Ответ <b>−1</b>.`,
  },

  /* Flow field */
  'ff.ev.cost': {
    en: (rows, cols, walls, max) => `Phase 1, the cost field: ${rows} × ${cols}, ${walls} wall(s) (0), every other number is what it costs to cross that cell — 1 is open ground, up to ${max} is mud or water. G marks the goals.`,
    ru: (rows, cols, walls, max) => `Фаза 1, поле стоимости: ${rows} × ${cols}, стен (0) — ${walls}, остальные числа — сколько стоит пересечь клетку: 1 — ровная земля, до ${max} — грязь или вода. G — цели.`,
  },
  'ff.ev.seed': {
    en: goals => `Phase 2, the integration field. ${goals.length > 1 ? `Every goal — ${list(goals)} — gets 0 and enters the queue at once, like the zeros of 01 Matrix.` : `The goal ${goals[0]} gets 0 and enters the queue; with several goals they would all start at once, like the zeros of 01 Matrix.`} The search runs from the goals outwards, not from the units.`,
    ru: goals => `Фаза 2, поле интеграции. ${goals.length > 1 ? `Все цели — ${list(goals)} — получают 0 и сразу встают в очередь, как нули в 01 Matrix.` : `Цель ${goals[0]} получает 0 и встаёт в очередь; будь целей несколько, они стартовали бы все сразу, как нули в 01 Matrix.`} Поиск идёт от целей наружу, а не от юнитов.`,
  },
  'ff.ev.relax': {
    en: (cell, d, moves) => `Pop ${cell} with integration ${d}, the smallest in the queue. Its neighbors get integration = ${d} + their own cost: ${moves.join('; ')}. Set once — whoever reaches a cell first comes from the cheapest side.`,
    ru: (cell, d, moves) => `Вынимаем ${cell} с интеграцией ${d} — наименьшей в очереди. Соседи получают интеграцию = ${d} + своя цена: ${moves.join('; ')}. Ставим один раз — кто первым дошёл до клетки, тот и пришёл с самой дешёвой стороны.`,
  },
  'ff.ev.settle': {
    en: (cell, d) => `Pop ${cell} with integration ${d}: every passable neighbor already has its value — nothing to add.`,
    ru: (cell, d) => `Вынимаем ${cell} с интеграцией ${d}: у всех проходимых соседей значение уже есть — добавлять нечего.`,
  },
  'ff.ev.row': {
    en: (r, arrows, cut, open) => (open ? `Phase 3, the direction field, row ${r}: each of its ${arrows} cell(s) points at the neighbor with the smallest integration (ties: up, right, down, left). The small number is the integration.` : `Phase 3, row ${r}: only walls and goals, no arrows.`),
    ru: (r, arrows, cut, open) => (open ? `Фаза 3, поле направлений, строка ${r}: стрелок — ${arrows}, каждая указывает на соседа с наименьшей интеграцией (при равенстве: вверх, вправо, вниз, влево). Маленькое число — интеграция.` : `Фаза 3, строка ${r}: только стены и цели, стрелок нет.`),
  },
  'ff.ev.rowCut': {
    en: (r, arrows, cut) => `Phase 3, the direction field, row ${r}: ${arrows} arrow(s) to the neighbor with the smallest integration, and ${cut} cell(s) marked × — walls cut them off from every goal, their integration stayed ∞, and no arrow can lead anywhere.`,
    ru: (r, arrows, cut) => `Фаза 3, поле направлений, строка ${r}: стрелок к соседу с наименьшей интеграцией — ${arrows}, а клеток с × — ${cut}: стены отрезали их от всех целей, интеграция осталась ∞, и стрелке вести некуда.`,
  },
  'ff.ev.done': {
    en: (start, cost, steps) => (start ? `Done: one field for every unit. The dearest way home starts at ${start}: ${steps} step(s) along the arrows at a total cost of <b>${cost}</b>. Every other unit walks the same way from wherever it stands, reading one arrow per frame.` : 'Done: there is no cell left that could walk to a goal.'),
    ru: (start, cost, steps) => (start ? `Готово: одно поле на всех юнитов. Дороже всех путь из ${start}: ${ru(steps, 'шаг', 'шага', 'шагов')} по стрелкам с общей ценой <b>${cost}</b>. Любой другой юнит идёт так же — оттуда, где стоит, читая по одной стрелке за кадр.` : 'Готово: не осталось клетки, из которой можно дойти до цели.'),
  },

  /* Spatial hash grid */
  'sg.ev.start': {
    en: (n, size, q) => `${n} points, ${q} circle(s), cells of ${size} × ${size}. Brute force would check all ${n} points for every circle — ${n * q} distance checks. First put every point into the bucket of its cell, key (⌊x / ${size}⌋, ⌊y / ${size}⌋).`,
    ru: (n, size, q) => `Точек — ${n}, окружностей — ${q}, клетки ${size} × ${size}. Перебор проверил бы все точки для каждой окружности — ${n * q} проверок расстояния. Сначала кладём каждую точку в корзину её клетки, ключ (⌊x / ${size}⌋, ⌊y / ${size}⌋).`,
  },
  'sg.ev.newCell': {
    en: (i, x, y, cx, cy) => `Point ${i} (${x}, ${y}) → cell (${cx}, ${cy}). That cell had no bucket yet: a new key in the hash.`,
    ru: (i, x, y, cx, cy) => `Точка ${i} (${x}, ${y}) → клетка (${cx}, ${cy}). У этой клетки корзины ещё не было: новый ключ в хэше.`,
  },
  'sg.ev.put': {
    en: (i, x, y, cx, cy, count) => `Point ${i} (${x}, ${y}) → cell (${cx}, ${cy}), which already has a bucket: now ${count} point(s) in it.`,
    ru: (i, x, y, cx, cy, count) => `Точка ${i} (${x}, ${y}) → клетка (${cx}, ${cy}), у неё корзина уже есть: теперь в ней ${ru(count, 'точка', 'точки', 'точек')}.`,
  },
  'sg.ev.query': {
    en: (j, x, y, r, cx, cy) => `Circle ${j}: centre (${x}, ${y}), r = ${r}, in cell (${cx}, ${cy}). r is no bigger than a cell, so any point within r lies in this cell or one of the 8 around it: read only those 9 buckets (cells with a negative number do not exist).`,
    ru: (j, x, y, r, cx, cy) => `Окружность ${j}: центр (${x}, ${y}), r = ${r}, клетка (${cx}, ${cy}). r не больше клетки, значит, любая точка ближе r лежит в этой клетке или в одной из 8 вокруг: читаем только эти 9 корзин (клеток с отрицательным номером нет).`,
  },
  'sg.ev.empty': {
    en: (gx, gy) => `Cell (${gx}, ${gy}): no bucket — one hash lookup, no distance checks.`,
    ru: (gx, gy) => `Клетка (${gx}, ${gy}): корзины нет — один поиск в хэше, проверок расстояния нет.`,
  },
  'sg.ev.hit': {
    en: (gx, gy, count, hits, r2) => `Cell (${gx}, ${gy}): ${count} point(s), ${count > 1 ? 'each checked' : 'checked'} by dx² + dy² ≤ ${r2} — no square root. Inside: point${hits.length > 1 ? 's' : ''} ${list(hits)}.`,
    ru: (gx, gy, count, hits, r2) => `Клетка (${gx}, ${gy}): ${ru(count, 'точка', 'точки', 'точек')}, ${count > 1 ? 'у каждой проверяем' : 'проверяем'} dx² + dy² ≤ ${r2} — без корня. Внутри ${hits.length > 1 ? 'точки' : 'точка'} ${list(hits)}.`,
  },
  'sg.ev.miss': {
    en: (gx, gy, count, hits, r2) => `Cell (${gx}, ${gy}): ${count} point(s), but dx² + dy² > ${r2} for ${count > 1 ? 'all of them' : 'it'} — in a nearby cell, yet outside the circle.`,
    ru: (gx, gy, count, hits, r2) => `Клетка (${gx}, ${gy}): ${ru(count, 'точка', 'точки', 'точек')}, но у ${count > 1 ? 'всех' : 'неё'} dx² + dy² > ${r2} — в соседней клетке, но вне окружности.`,
  },
  'sg.ev.answer': {
    en: (j, count, own, n) => `Circle ${j}: <b>${count}</b> point(s) inside, after ${own} distance check(s) instead of ${n}.`,
    ru: (j, count, own, n) => `Окружность ${j}: внутри <b>${ru(count, 'точка', 'точки', 'точек')}</b>, проверок расстояния — ${own} вместо ${n}.`,
  },
  'sg.ev.done': {
    en: (answers, checks, brute) => `Answers: <b>${list(answers)}</b>. ${checks} distance checks against ${brute} for brute force. With thousands of agents each asking “who is near me” that is about n·k instead of n².`,
    ru: (answers, checks, brute) => `Ответы: <b>${list(answers)}</b>. Проверок расстояния — ${checks}, у перебора — ${brute}. Когда тысячи агентов спрашивают «кто рядом со мной», это примерно n·k вместо n².`,
  },

  /* Union-Find */
  'uf.ev.start': {
    en: n => `${n} nodes, ${n} edges: a tree plus one extra edge. At first every node is its own set — parent[v] = v, rank 0. The edges come one at a time.`,
    ru: n => `Узлов ${n}, рёбер ${n}: дерево и одно лишнее ребро. Сначала каждый узел — отдельное множество: parent[v] = v, ранг 0. Рёбра приходят по одному.`,
  },
  'uf.ev.find': {
    en: (u, v, pu, pv, moved, ru1, rv) => `Edge ${u}-${v}: ${walkEn(u, pu)}, ${walkEn(v, pv)}. Roots ${ru1} and ${rv}; the paths are short already, nothing to compress.`,
    ru: (u, v, pu, pv, moved, ru1, rv) => `Ребро ${u}-${v}: ${walkRu(u, pu)}, ${walkRu(v, pv)}. Корни ${ru1} и ${rv}; пути и так короткие, сжимать нечего.`,
  },
  'uf.ev.compress': {
    en: (u, v, pu, pv, moved, ru1, rv) => `Edge ${u}-${v}: ${walkEn(u, pu)}, ${walkEn(v, pv)}. <b>Path compression</b>: ${list(moved)} now ${moved.length > 1 ? 'point' : 'points'} straight at the root, so the next find from there takes one step.`,
    ru: (u, v, pu, pv, moved, ru1, rv) => `Ребро ${u}-${v}: ${walkRu(u, pu)}, ${walkRu(v, pv)}. <b>Сжатие пути</b>: ${list(moved)} теперь ${moved.length > 1 ? 'указывают' : 'указывает'} прямо на корень, и следующий find оттуда — один шаг.`,
  },
  'uf.ev.union': {
    en: (u, v, lo, hi, rank) => `Different roots, so ${u} and ${v} were not connected. Union by rank: the root ${lo} has the lower tree and goes under ${hi}; the height does not grow, rank[${hi}] stays ${rank}.`,
    ru: (u, v, lo, hi, rank) => `Корни разные — значит, ${u} и ${v} не были связаны. Объединение по рангу: у корня ${lo} дерево ниже, он уходит под ${hi}; высота не растёт, rank[${hi}] остаётся ${rank}.`,
  },
  'uf.ev.tie': {
    en: (u, v, lo, hi, rank) => `Different roots, so ${u} and ${v} were not connected. Equal ranks: ${lo} goes under ${hi}, and the tree can be one level taller — rank[${hi}] = ${rank}.`,
    ru: (u, v, lo, hi, rank) => `Корни разные — значит, ${u} и ${v} не были связаны. Ранги равны: ${lo} уходит под ${hi}, и дерево может стать на уровень выше — rank[${hi}] = ${rank}.`,
  },
  'uf.ev.cycle': {
    en: (u, v, root, k) => `${u} and ${v} have the same root ${root}: they are connected already, so edge ${k}, <b>[${u}, ${v}]</b>, closes the cycle. It is the redundant one — and the last edge of that cycle in the input.`,
    ru: (u, v, root, k) => `У ${u} и ${v} общий корень ${root}: они уже связаны, и ребро №${k}, <b>[${u}, ${v}]</b>, замыкает цикл. Оно и лишнее — и последнее ребро этого цикла во входе.`,
  },
  'uf.ev.none': {
    en: () => 'Every edge joined two different sets: there is no cycle.',
    ru: () => 'Каждое ребро соединило два разных множества: цикла нет.',
  },

  /* Swim in Rising Water */
  'sw.ev.start': {
    en: (n, s, e) => `${n} × ${n}, heights 0..${n * n - 1}, all different. The water rises one level per step; at time t exactly one cell — the one of height t — gets wet. S is ${s} high, E is ${e}: the answer is at least ${Math.max(s, e)}.`,
    ru: (n, s, e) => `${n} × ${n}, высоты 0..${n * n - 1}, все разные. Вода поднимается на уровень за шаг; в момент t намокает ровно одна клетка — та, что высоты t. S на высоте ${s}, E — ${e}: ответ не меньше ${Math.max(s, e)}.`,
  },
  'sw.ev.island': {
    en: (t, cell) => `t = ${t}: ${cell} gets wet, but none of its neighbors is wet yet — a new pool of its own.`,
    ru: (t, cell) => `t = ${t}: намокает ${cell}, но ни один сосед ещё не мокрый — отдельный новый водоём.`,
  },
  'sw.ev.grow': {
    en: (t, cell) => `t = ${t}: ${cell} gets wet and touches one pool — union, the pool grows.`,
    ru: (t, cell) => `t = ${t}: намокает ${cell} и касается одного водоёма — union, водоём растёт.`,
  },
  'sw.ev.merge': {
    en: (t, cell, k) => `t = ${t}: ${cell} gets wet and touches ${k} different pools — union joins them into one.`,
    ru: (t, cell, k) => `t = ${t}: намокает ${cell} и касается разных водоёмов (${k}) — union сливает их в один.`,
  },
  'sw.ev.done': {
    en: t => `Now S and E share a root: one pool joins the corners. The answer is <b>${t}</b> — at any lower level some cell on every route is still dry.`,
    ru: t => `Теперь у S и E общий корень: углы в одном водоёме. Ответ <b>${t}</b> — при уровне ниже на любом маршруте ещё есть сухая клетка.`,
  },
};
