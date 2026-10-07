/** PY-03 quizzes. */
export const QUIZZES = [
  { id: 'q-listalias', kind: 'output', code: 'a = [1, 2, 3]\nb = a\nc = a[:]\nb.append(4)\nprint(len(a), len(c))', options: ['4 3', '3 3', '4 4', '3 4'], answer: 0, rig: 'listcopy' },
  { id: 'q-shallow', kind: 'output', code: 'grid = [[0] * 2] * 2\ngrid[0][0] = 1\nprint(grid)', options: ['[[1, 0], [0, 0]]', '[[1, 0], [1, 0]]', '[[1, 1], [1, 1]]', '[[0, 0], [0, 0]]'], answer: 1, rig: 'listcopy' },
  { id: 'q-tuple', kind: 'output', code: 't = (1, 2)\nt += (3,)\nx = (4)\nprint(t, type(x).__name__)', options: ['(1, 2, 3) tuple', 'TypeError', '(1, 2, 3) int', '(1, 2, (3,)) int'], answer: 2, rig: 'tuples' },
  { id: 'q-dictget', kind: 'output', code: 'd = {"a": 1}\nprint(d.get("b"), d.get("b", 0), d.setdefault("c", 5), d)', options: ['None 0 5 {\'a\': 1, \'c\': 5}', 'KeyError', 'None 0 None {\'a\': 1}', '0 0 5 {\'a\': 1, \'c\': 5}'], answer: 0, rig: 'dictbasic' },
  { id: 'q-dictkey', kind: 'error', code: 'd = {}\nd[[1, 2]] = "pair"', options: ['none', 'TypeError', 'KeyError', 'ValueError'], answer: 1, rig: 'tuplekey' },
  { id: 'q-set', kind: 'output', code: 'a = {1, 2, 3}\nb = {3, 4}\nprint(a & b, a - b, len(a | b))', options: ['{3} {1, 2} 4', '{3} {1, 2} 5', '{1, 2, 3, 4} {1, 2} 4', '{3} {4} 4'], answer: 0, rig: 'setops' },
  { id: 'q-popzero', kind: 'output', code: 'from collections import deque\nq = deque([1, 2, 3])\nq.appendleft(0)\nq.append(4)\nprint(q.popleft(), q.pop(), list(q))', options: ['0 4 [1, 2, 3]', '1 3 [0, 2, 4]', '0 4 [1, 2, 3, 4]', '4 0 [1, 2, 3]'], answer: 0, rig: 'stackq' },
  { id: 'q-heap', kind: 'output', code: 'import heapq\nh = [5, 1, 8, 3]\nheapq.heapify(h)\nprint(h[0], heapq.heappop(h), heapq.heappop(h))', options: ['1 1 3', '5 5 1', '1 1 5', '3 1 3'], answer: 0, rig: 'heap' },
  { id: 'q-comp', kind: 'output', code: 'print([x * 2 for x in range(5) if x % 2])', options: ['[2, 6]', '[0, 4, 8]', '[1, 3]', '[2, 4, 6, 8]'], answer: 0, rig: 'listcomp' },
  { id: 'q-gen', kind: 'output', code: 'def g():\n    yield 1\n    yield 2\n\nit = g()\nprint(next(it), list(it), list(it))', options: ['1 [2] []', '1 [1, 2] [1, 2]', '1 [2] [2]', 'StopIteration'], answer: 0, rig: 'generator' },
  { id: 'q-stable', kind: 'output', code: 'pairs = [("b", 1), ("a", 2), ("c", 1)]\nprint(sorted(pairs, key=lambda p: p[1]))', options: ['[(\'b\', 1), (\'c\', 1), (\'a\', 2)]', '[(\'c\', 1), (\'b\', 1), (\'a\', 2)]', '[(\'a\', 2), (\'b\', 1), (\'c\', 1)]', 'TypeError'], answer: 0, rig: 'stable' },
  { id: 'q-fill-comp', kind: 'fill', code: 'names = ["luna", "nova"]\nupper = ___      # ["LUNA", "NOVA"]', answers: ['[n.upper() for n in names]', '[name.upper() for name in names]', '[x.upper() for x in names]', 'list(map(str.upper, names))', '[s.upper() for s in names]'], rig: 'listcomp' },
  { id: 'q-order-gen', kind: 'order', lines: ['def evens(n):', '    for x in range(n):', '        if x % 2 == 0:', '            yield x', 'print(list(evens(6)))'], rig: 'generator' },
];
