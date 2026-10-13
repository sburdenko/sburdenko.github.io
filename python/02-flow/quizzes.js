/** PY-02 quizzes. */
export const QUIZZES = [
  { id: 'q-elif', kind: 'output', code: 'x = 7\nif x > 5:\n    print("a")\nelif x > 6:\n    print("b")\nelse:\n    print("c")', options: ['a', 'a\nb', 'b', 'c'], answer: 0, rig: 'ifelse' },
  { id: 'q-indent', kind: 'output', code: 'n = 3\nif n > 5:\n    print("big")\n    print("still big")\nprint("done")', options: ['done', 'big\nstill big\ndone', 'still big\ndone', '(nothing)'], answer: 0, rig: 'indent' },
  { id: 'q-while', kind: 'output', code: 'n = 0\nwhile n < 3:\n    n += 1\n    if n == 2:\n        continue\n    print(n)', options: ['1\n2\n3', '1\n3', '0\n1\n3', '1\n2'], answer: 1, rig: 'whileloop' },
  { id: 'q-range', kind: 'output', code: 'print(list(range(10, 0, -3)))', options: ['[10, 7, 4, 1]', '[10, 7, 4, 1, 0]', '[0, 3, 6, 9]', '[]'], answer: 0, rig: 'rangelab' },
  { id: 'q-forelse', kind: 'output', code: 'for n in [2, 4, 6]:\n    if n % 2:\n        print("odd")\n        break\nelse:\n    print("all even")', options: ['odd', 'all even', 'odd\nall even', '(nothing)'], answer: 1, rig: 'forelse' },
  { id: 'q-return', kind: 'output', code: 'def f(x):\n    print("in", x)\n    return x * 2\n    print("never")\n\ny = f(3)\nprint(y)', options: ['in 3\n6', 'in 3\nnever\n6', '6', 'in 3\nNone'], answer: 0, rig: 'funcframe' },
  { id: 'q-noreturn', kind: 'output', code: 'def add(a, b):\n    total = a + b\n\nprint(add(2, 3))', options: ['5', 'None', 'total', 'NameError'], answer: 1, rig: 'funcframe' },
  { id: 'q-kwargs', kind: 'output', code: 'def f(a, b=2, *rest, **kw):\n    print(a, b, rest, kw)\n\nf(1, 5, 6, k=7)', options: ['1 5 (6,) {\'k\': 7}', '1 2 (5, 6) {\'k\': 7}', '1 5 [6] {k: 7}', 'TypeError'], answer: 0, rig: 'args' },
  { id: 'q-mutdefault', kind: 'output', code: 'def f(x=[]):\n    x.append(1)\n    return len(x)\n\nprint(f(), f(), f([]))', options: ['1 1 1', '1 2 1', '1 2 3', '2 2 1'], answer: 1, rig: 'mutdefault' },
  { id: 'q-scope', kind: 'error', code: 'count = 0\n\ndef bump():\n    count += 1\n\nbump()', options: ['none', 'NameError', 'UnboundLocalError', 'TypeError'], answer: 2, rig: 'unbound' },
  { id: 'q-recursion', kind: 'output', code: 'def s(n):\n    if n == 0:\n        return 0\n    return n + s(n - 1)\n\nprint(s(4))', options: ['10', '4', '24', 'RecursionError'], answer: 0, rig: 'factorial' },
  { id: 'q-closure', kind: 'output', code: 'def make():\n    n = 0\n    def step():\n        nonlocal n\n        n += 1\n        return n\n    return step\n\na = make()\nb = make()\nprint(a(), a(), b())', options: ['1 2 3', '1 2 1', '1 1 1', '0 1 0'], answer: 1, rig: 'globalkw' },
  { id: 'q-lambda', kind: 'output', code: 'fs = [lambda: i for i in range(3)]\nprint([f() for f in fs])', options: ['[0, 1, 2]', '[2, 2, 2]', '[3, 3, 3]', '[None, None, None]'], answer: 1, rig: 'lambdaloop' },
  { id: 'q-fill-range', kind: 'fill', code: 'for i in ___:      # prints 1 3 5 7 9\n    print(i, end=" ")', answers: ['range(1, 10, 2)', 'range(1, 11, 2)', 'range(1,10,2)', '[1, 3, 5, 7, 9]', '(1, 3, 5, 7, 9)'], rig: 'rangelab' },
  { id: 'q-order-func', kind: 'order', lines: ['def double(n):', '    return n * 2', 'x = double(4)', 'print(x)'], rig: 'funcframe' },
];
