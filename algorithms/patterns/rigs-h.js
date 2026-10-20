/** Editable rigs for chapter 17: data structure design. */
import * as H from './model-h.js?v=202610201316';
import * as V from './views-h.js?v=202610201316';
import { treeFromLevelOrder, levelOrderOf } from './inputs.js?v=202610201316';
import { defineRig, randInt, pick, shuffle } from './rig-kit.js?v=202610201316';

/** The trie view stays readable up to this many nodes (root not counted). */
export const TRIE_NODES = 24;

/** Word families that share prefixes, so random runs walk existing edges, branch and miss. */
const FAMILIES = [
  ['car', 'card', 'care', 'cart', 'cat', 'cab'],
  ['tea', 'ten', 'team', 'tear', 'to', 'top'],
  ['do', 'dog', 'dot', 'dove', 'door'],
  ['in', 'inn', 'ink', 'it', 'is'],
  ['sun', 'sung', 'sunk', 'sum', 'so'],
];

function randomTrieOps(next) {
  const family = pick(next, FAMILIES), words = shuffle(next, family);
  const inserted = words.slice(0, randInt(next, 3, 4)), others = words.slice(inserted.length);
  const query = () => {
    const w = pick(next, inserted), kind = randInt(next, 0, 4);
    if (kind === 0) return ['search', w];
    if (kind === 1) return ['startsWith', w.slice(0, randInt(next, 1, w.length))];
    if (kind === 2 && w.length > 1) return ['search', w.slice(0, -1)];
    if (kind === 3 && others.length) return [pick(next, ['search', 'startsWith']), pick(next, others)];
    return [pick(next, ['search', 'startsWith']), `${w.slice(0, 1)}${pick(next, ['x', 'z', 'q'])}`];
  };
  const split = randInt(next, 2, inserted.length - 1);
  return [
    ...inserted.slice(0, split).map(w => ['insert', w]),
    ...Array.from({ length: randInt(next, 1, 2) }, query),
    ...inserted.slice(split).map(w => ['insert', w]),
    ...Array.from({ length: randInt(next, 2, 3) }, query),
  ];
}

function randomTree(next, depth = 0) {
  if (depth > 3 || (depth > 0 && next() < 0.3)) return null;
  return [randInt(next, -9, 30), randomTree(next, depth + 1), randomTree(next, depth + 1)];
}

export const RIGS_H = {
  trie: defineRig({
    fields: [{ key: 'ops', type: 'trie', minLen: 1, maxLen: 10, maxWord: 6 }],
    example: { ops: [['insert', 'apple'], ['search', 'apple'], ['search', 'app'], ['startsWith', 'app'], ['insert', 'app'], ['search', 'app'], ['insert', 'ape'], ['search', 'apt']] },
    random: next => ({ ops: randomTrieOps(next) }),
    check: p => (H.trieLayout(p.ops).nodes.length - 1 > TRIE_NODES ? ['in.err.trieSize', TRIE_NODES] : null),
    run: p => ({ ...H.trieTrace(p.ops), layout: H.trieLayout(p.ops), ops: p.ops }),
  }, V.trie),
  serialize: defineRig({
    fields: [{ key: 'root', type: 'tree', maxNodes: 15, maxDepth: 4, min: -99, max: 99 }],
    example: { root: [1, 2, 3, null, null, 4, 5] },
    random: next => ({ root: levelOrderOf(randomTree(next)) }),
    run: p => H.serializeTrace(treeFromLevelOrder(p.root)),
  }, V.serialize),
  circularQueue: defineRig({
    fields: [{ key: 'k', type: 'int', min: 1, max: 8 }, { key: 'ops', type: 'queue', minLen: 1, maxLen: 16, min: 0, max: 99 }],
    example: {
      k: 3,
      ops: [['enQueue', 1], ['enQueue', 2], ['enQueue', 3], ['enQueue', 4], ['Rear'], ['isFull'], ['deQueue'], ['enQueue', 4], ['Rear'],
        ['deQueue'], ['deQueue'], ['Front'], ['deQueue'], ['deQueue'], ['isEmpty']],
    },
    random: next => {
      const k = randInt(next, 2, 5);
      const ops = Array.from({ length: randInt(next, 9, 14) }, () => {
        const x = next();
        if (x < 0.45) return ['enQueue', randInt(next, 1, 30)];
        if (x < 0.72) return ['deQueue'];
        if (x < 0.9) return [pick(next, ['Front', 'Rear'])];
        return [pick(next, ['isEmpty', 'isFull'])];
      });
      return { k, ops };
    },
    run: p => ({ ...H.circularQueueTrace(p.k, p.ops), k: p.k, ops: p.ops }),
  }, V.circularQueue),
  lfu: defineRig({
    fields: [{ key: 'capacity', type: 'int', min: 1, max: 4 }, { key: 'ops', type: 'cache', minLen: 1, maxLen: 14 }],
    example: {
      capacity: 2,
      ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['get', 3], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4], ['put', 4, 7]],
    },
    random: next => {
      const keys = [];
      const ops = Array.from({ length: randInt(next, 8, 12) }, () => {
        if (!keys.length || next() < 0.45) {
          const key = randInt(next, 1, 5);
          keys.push(key);
          return ['put', key, randInt(next, 1, 9)];
        }
        return ['get', next() < 0.8 ? pick(next, keys) : randInt(next, 1, 5)];
      });
      return { capacity: randInt(next, 2, 3), ops };
    },
    run: p => ({ ...H.lfuTrace(p.capacity, p.ops), capacity: p.capacity, ops: p.ops }),
  }, V.lfu),
};
