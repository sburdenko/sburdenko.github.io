/** Step texts for the chapter 17 rigs: data structure design. */
/** Russian plural: 1 узел, 2 узла, 5 узлов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};
const en = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const sideEn = side => (side === 'L' ? 'left' : 'right');
const sideRu = side => (side === 'L' ? 'левого' : 'правого');
const sideRuAcc = side => (side === 'L' ? 'левым' : 'правым');

export const EV_H = {
  /* Implement Trie */
  'trie.ev.start': {
    en: () => 'An empty trie: just the root, the empty prefix. Every node is an array next[26] — one slot per letter — plus an end flag that says “a word ends here”.',
    ru: () => 'Пустой бор: только корень — пустой префикс. Каждый узел — массив next[26], по ячейке на букву, и флаг end: «здесь кончается слово».',
  },
  'trie.ev.make': {
    en: (op, word, i, ch, last) => `insert("${word}"), letter ${i + 1} “${ch}”: next['${ch}'] is null — create a node and go down to it${last ? '. That was the last letter' : ''}.`,
    ru: (op, word, i, ch, last) => `insert("${word}"), буква ${i + 1} «${ch}»: next['${ch}'] пуст — создаём узел и спускаемся в него${last ? '. Это была последняя буква' : ''}.`,
  },
  'trie.ev.walk': {
    en: (op, word, i, ch) => `${op}("${word}"), letter ${i + 1} “${ch}”: the edge already exists — ${op === 'insert' ? 'reuse it: the prefix is shared, no new node' : 'go down'}.`,
    ru: (op, word, i, ch) => `${op}("${word}"), буква ${i + 1} «${ch}»: такое ребро уже есть — ${op === 'insert' ? 'идём по нему: префикс общий, новый узел не нужен' : 'спускаемся'}.`,
  },
  'trie.ev.mark': {
    en: (word, again) => (again
      ? `Every letter of "${word}" was already there and end is already true: the word was inserted before, nothing changes.`
      : `All letters are in place: set end = true on the last node. Now "${word}" is a word, not only a prefix.`),
    ru: (word, again) => (again
      ? `Все буквы "${word}" уже были, и end уже true: слово вставляли раньше, ничего не меняется.`
      : `Все буквы на месте: ставим end = true последнему узлу. Теперь "${word}" — слово, а не только префикс.`),
  },
  'trie.ev.word': {
    en: word => `search("${word}"): every letter found and end = true on the last node — <b>true</b>.`,
    ru: word => `search("${word}"): все буквы нашлись, и у последнего узла end = true — <b>true</b>.`,
  },
  'trie.ev.notWord': {
    en: word => `search("${word}"): the path exists, but end = false here — "${word}" is only the beginning of a longer word. <b>false</b>.`,
    ru: word => `search("${word}"): путь есть, но здесь end = false — "${word}" лишь начало более длинного слова. <b>false</b>.`,
  },
  'trie.ev.prefix': {
    en: (word, isWord) => `startsWith("${word}"): the whole path exists — <b>true</b>. The end flag is not checked${isWord ? ' (here it happens to be a word too)' : ''}.`,
    ru: (word, isWord) => `startsWith("${word}"): путь есть целиком — <b>true</b>. Флаг end не проверяем${isWord ? ' (здесь это заодно и слово)' : ''}.`,
  },
  'trie.ev.miss': {
    en: (op, word, i, ch) => `${op}("${word}"), letter ${i + 1} “${ch}”: next['${ch}'] is null — no stored word goes this way. Stop early: <b>false</b>.`,
    ru: (op, word, i, ch) => `${op}("${word}"), буква ${i + 1} «${ch}»: next['${ch}'] пуст — ни одно сохранённое слово так не продолжается. Останавливаемся сразу: <b>false</b>.`,
  },
  'trie.ev.done': {
    en: (nodes, words) => `${en(words, 'word', 'words')} in ${en(nodes, 'node', 'nodes')}: shared prefixes are stored once. Each operation took as many steps as its word has letters, however many words are stored.`,
    ru: (nodes, words) => `${ru(words, 'слово', 'слова', 'слов')} в ${ru(nodes, 'узле', 'узлах', 'узлах')}: общие префиксы хранятся один раз. Каждая операция заняла столько шагов, сколько букв в её слове, сколько бы слов ни было в дереве.`,
  },

  /* Serialize and Deserialize Binary Tree */
  'ser.ev.start': {
    en: n => `Serialize: pre-order — the node, then its left subtree, then the right one — and # for every missing child. ${en(n, 'node gives', 'nodes give')} ${en(n, 'value', 'values')} and ${en(n + 1, 'marker', 'markers')}.`,
    ru: n => `Сериализация: прямой обход — узел, потом его левое поддерево, потом правое — и # на месте каждого отсутствующего ребёнка. ${ru(n, 'узел даёт', 'узла дают', 'узлов дают')} ${ru(n, 'значение', 'значения', 'значений')} и ${ru(n + 1, 'маркер', 'маркера', 'маркеров')}.`,
  },
  'ser.ev.val': {
    en: (v, parent, side) => (parent === null ? `Write the root, ${v}. Next comes its left subtree.` : `Write ${v}, the ${sideEn(side)} child of node ${parent}. Next comes its own left subtree.`),
    ru: (v, parent, side) => (parent === null ? `Пишем корень, ${v}. Дальше — его левое поддерево.` : `Пишем ${v} — это ${side === 'L' ? 'левый' : 'правый'} ребёнок узла ${parent}. Дальше — уже его собственное левое поддерево.`),
  },
  'ser.ev.nil': {
    en: (parent, side) => `Node ${parent} has no ${sideEn(side)} child: write #. ${side === 'L' ? `Now the right subtree of ${parent}.` : `The subtree of ${parent} is written — back up.`}`,
    ru: (parent, side) => `У узла ${parent} нет ${sideRu(side)} ребёнка: пишем #. ${side === 'L' ? `Теперь правое поддерево узла ${parent}.` : `Поддерево узла ${parent} записано — поднимаемся.`}`,
  },
  'ser.ev.str': {
    en: (tokens, n, markers) => `The string is ready: ${tokens} tokens, ${n} values and ${markers} markers. Deserialize reads it back in the same order, with one cursor that only moves forward.`,
    ru: (tokens, n, markers) => `Строка готова: ${ru(tokens, 'токен', 'токена', 'токенов')} — ${ru(n, 'значение', 'значения', 'значений')} и ${ru(markers, 'маркер', 'маркера', 'маркеров')}. Десериализация читает её в том же порядке одним курсором, который движется только вперёд.`,
  },
  'des.ev.node': {
    en: (v, parent, side, j) => `Token ${j + 1} is ${v}: create a node${parent === null ? ' — the root' : ` and hang it as the ${sideEn(side)} child of node ${parent}`}. Then read its left subtree.`,
    ru: (v, parent, side, j) => `Токен ${j + 1} — ${v}: создаём узел${parent === null ? ' — это корень' : ` и вешаем его ${sideRuAcc(side)} ребёнком узла ${parent}`}. Затем читаем его левое поддерево.`,
  },
  'des.ev.nil': {
    en: (parent, side) => `Token #: null. Node ${parent} gets no ${sideEn(side)} child — return to it${side === 'L' ? '; the next token starts its right subtree' : ''}.`,
    ru: (parent, side) => `Токен #: null. У узла ${parent} нет ${sideRu(side)} ребёнка — возвращаемся к нему${side === 'L' ? '; следующий токен начинает его правое поддерево' : ''}.`,
  },
  'des.ev.up': {
    en: (v, parent, side) => `Both subtrees of node ${v} are read: it is complete. ${parent === null ? 'That was the root — the whole tree is rebuilt.' : `Return to node ${parent}${side === 'L' ? ', which now reads its right subtree' : ''}.`}`,
    ru: (v, parent, side) => `Оба поддерева узла ${v} прочитаны — узел готов. ${parent === null ? 'Это был корень: дерево собрано целиком.' : `Возвращаемся к узлу ${parent}${side === 'L' ? ', дальше его правое поддерево' : ''}.`}`,
  },
  'des.ev.done': {
    en: (n, same) => `Every token is used: ${en(n, 'node', 'nodes')}, ${same ? '<b>exactly the original tree</b>' : 'a different tree'}. The cursor went through the string once — O(n).`,
    ru: (n, same) => `Все токены прочитаны: ${ru(n, 'узел', 'узла', 'узлов')}, ${same ? '<b>ровно исходное дерево</b>' : 'другое дерево'}. Курсор прошёл строку один раз — O(n).`,
  },

  /* Design Circular Queue */
  'cq.ev.start': {
    en: k => `An array of ${en(k, 'slot', 'slots')} used as a ring. The state is head (the front) and count = 0. The tail — the next free slot — is not stored: it is (head + count) % k.`,
    ru: k => `Массив из ${ru(k, 'ячейки', 'ячеек', 'ячеек')}, замкнутый в кольцо. Состояние — head (начало) и count = 0. Хвост — следующая свободная ячейка — не хранится: это (head + count) % k.`,
  },
  'cq.ev.enq': {
    en: (v, at, head, count, k) => `enQueue(${v}): the tail is (${head} + ${count}) % ${k} = ${at}. Write ${v} there, count = ${count + 1}. <b>true</b>.`,
    ru: (v, at, head, count, k) => `enQueue(${v}): хвост — (${head} + ${count}) % ${k} = ${at}. Пишем туда ${v}, count = ${count + 1}. <b>true</b>.`,
  },
  'cq.ev.wrap': {
    en: (v, at, head, count, k) => `enQueue(${v}): ${head} + ${count} = ${head + count} is past the end, and % ${k} wraps the tail around to ${at}. Write ${v} there, count = ${count + 1}. <b>true</b>.`,
    ru: (v, at, head, count, k) => `enQueue(${v}): ${head} + ${count} = ${head + count} — уже за концом массива, и % ${k} заворачивает хвост к ячейке ${at}. Пишем туда ${v}, count = ${count + 1}. <b>true</b>.`,
  },
  'cq.ev.full': {
    en: (v, k) => `enQueue(${v}): count = ${k} = k, the queue is full — refuse and overwrite nothing: <b>false</b>. head and the tail point at the same slot, exactly as in an empty queue; only count tells the two apart.`,
    ru: (v, k) => `enQueue(${v}): count = ${k} = k, очередь полна — отказываем и ничего не перезаписываем: <b>false</b>. head и хвост указывают на одну ячейку — ровно как в пустой очереди; различает их только count.`,
  },
  'cq.ev.deq': {
    en: (v, from, head, count) => `deQueue(): take ${v} from slot ${from} by moving head to ${head}; count = ${count}. The value stays in the array, but it is outside the queue now. <b>true</b>.`,
    ru: (v, from, head, count) => `deQueue(): снимаем ${v} из ячейки ${from} — просто сдвигаем head на ${head}; count = ${count}. Значение остаётся в массиве, но в очередь уже не входит. <b>true</b>.`,
  },
  'cq.ev.headWrap': {
    en: (v, from, head, count, k) => `deQueue(): take ${v} from the last slot ${from}; head = (${from} + 1) % ${k} = 0 — the front wraps around too. count = ${count}. <b>true</b>.`,
    ru: (v, from, head, count, k) => `deQueue(): снимаем ${v} из последней ячейки ${from}; head = (${from} + 1) % ${k} = 0 — начало тоже уходит на круг. count = ${count}. <b>true</b>.`,
  },
  'cq.ev.empty': {
    en: op => (op === 'deQueue' ? 'deQueue() on an empty queue: nothing to take — <b>false</b>.' : `${op}() on an empty queue: there is no element — <b>−1</b>.`),
    ru: op => (op === 'deQueue' ? 'deQueue() на пустой очереди: снимать нечего — <b>false</b>.' : `${op}() на пустой очереди: элемента нет — <b>−1</b>.`),
  },
  'cq.ev.front': {
    en: (v, at) => `Front(): a[head] = a[${at}] = <b>${v}</b>. Nothing moves.`,
    ru: (v, at) => `Front(): a[head] = a[${at}] = <b>${v}</b>. Ничего не сдвигается.`,
  },
  'cq.ev.rear': {
    en: (v, at, head, count, k) => `Rear(): the last element is at (${head} + ${count} − 1) % ${k} = ${at} — <b>${v}</b>. The tail points one slot past it.`,
    ru: (v, at, head, count, k) => `Rear(): последний элемент — в ячейке (${head} + ${count} − 1) % ${k} = ${at}: <b>${v}</b>. Хвост указывает на ячейку после него.`,
  },
  'cq.ev.isEmpty': {
    en: (answer, count) => `isEmpty(): count = ${count} — <b>${answer}</b>.`,
    ru: (answer, count) => `isEmpty(): count = ${count} — <b>${answer}</b>.`,
  },
  'cq.ev.isFull': {
    en: (answer, count, k) => `isFull(): count = ${count}, k = ${k} — <b>${answer}</b>.`,
    ru: (answer, count, k) => `isFull(): count = ${count}, k = ${k} — <b>${answer}</b>.`,
  },
  'cq.ev.done': {
    en: (count, k) => `Done: ${count} of ${k} slots are in the queue. Every operation was O(1), and the array was never reallocated.`,
    ru: (count, k) => `Готово: в очереди ${count} из ${k}. Каждая операция — O(1), и массив ни разу не пересоздавался.`,
  },

  /* LFU Cache */
  'lfu.ev.start': {
    en: c => `Capacity ${c}. Keys sit in buckets by use count; inside a bucket the oldest is on the left. minFreq points at the lowest non-empty bucket — that is where eviction looks.`,
    ru: c => `Вместимость ${c}. Ключи лежат в корзинах по числу обращений; внутри корзины самый старый — слева. minFreq указывает на самую нижнюю непустую корзину — там и ищем, кого вытеснить.`,
  },
  'lfu.ev.miss': {
    en: key => `get(${key}) → −1: there is no such key. A miss changes nothing, not even a count.`,
    ru: key => `get(${key}) → −1: такого ключа нет. Промах ничего не меняет — даже счётчики.`,
  },
  'lfu.ev.hit': {
    en: (key, v, f, f1, left) => `get(${key}) → <b>${v}</b>. Its count grows ${f} → ${f1}: the key moves from bucket ${f} to the right end of bucket ${f1}.${left ? '' : ` Bucket ${f} is empty now.`}`,
    ru: (key, v, f, f1, left) => `get(${key}) → <b>${v}</b>. Счётчик растёт: ${f} → ${f1}, ключ переезжает из корзины ${f} в правый конец корзины ${f1}.${left ? '' : ` Корзина ${f} опустела.`}`,
  },
  'lfu.ev.update': {
    en: (key, old, v, f, f1) => `put(${key}, ${v}): the key is there — the value ${old} → ${v}, and this counts as a use: ${f} → ${f1}, the key moves to bucket ${f1}.`,
    ru: (key, old, v, f, f1) => `put(${key}, ${v}): ключ уже есть — значение ${old} → ${v}, и это тоже обращение: ${f} → ${f1}, ключ переезжает в корзину ${f1}.`,
  },
  'lfu.ev.minUp': {
    en: (f, f1) => `Bucket ${f} was minFreq and is empty now, and the key that left it went to bucket ${f1}. So minFreq = ${f1} — no search needed.`,
    ru: (f, f1) => `Корзина ${f} была minFreq и теперь пуста, а ушедший из неё ключ попал в корзину ${f1}. Значит, minFreq = ${f1} — искать ничего не нужно.`,
  },
  'lfu.ev.evict': {
    en: (key, f, tie) => (tie
      ? `The cache is full. Evict from bucket minFreq = ${f}: ${tie + 1} keys there have the same count, so the tie goes to the least recently used — key ${key}, the leftmost.`
      : `The cache is full. Evict from bucket minFreq = ${f}: its only key, ${key}, is the least frequently used.`),
    ru: (key, f, tie) => (tie
      ? `Кэш полон. Вытесняем из корзины minFreq = ${f}: там ${ru(tie + 1, 'ключ', 'ключа', 'ключей')} с одинаковым счётчиком, и ничью решает давность — уходит ключ ${key}, крайний слева.`
      : `Кэш полон. Вытесняем из корзины minFreq = ${f}: её единственный ключ ${key} — самый редкий.`),
  },
  'lfu.ev.put': {
    en: (key, v, was) => `put(${key}, ${v}): a new key starts with count 1, at the right end of bucket 1. minFreq = 1${was > 1 ? ` (it was ${was}): nothing is used less often than a new key` : ''}.`,
    ru: (key, v, was) => `put(${key}, ${v}): новый ключ начинает со счётчика 1, в правом конце корзины 1. minFreq = 1${was > 1 ? ` (было ${was}): реже нового ключа не используется никто` : ''}.`,
  },
  'lfu.ev.done': {
    en: (hits, gets) => `${hits} of ${en(gets, 'get', 'gets')} hit. Every operation was O(1): a dictionary lookup, a move between two lists, and minFreq that only resets to 1 or steps up by 1.`,
    ru: (hits, gets) => `Попаданий: ${hits} из ${gets}. Каждая операция — O(1): поиск в словаре, перенос между двумя списками и minFreq, который только сбрасывается в 1 или растёт на 1.`,
  },
};
