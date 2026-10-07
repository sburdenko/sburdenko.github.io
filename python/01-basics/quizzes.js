/** PY-01 quizzes. Texts (question, explanation) live in i18n under quiz.<id>.q / .why. */
export const QUIZZES = [
  { id: 'q-print', kind: 'output', code: 'print("a", "b", sep="-", end="!")\nprint("c")', options: ['a-b!c', 'a b!\nc', 'a-b!\nc', 'a-b\n!c'], answer: 0, rig: 'hello' },
  { id: 'q-rebind', kind: 'output', code: 'x = 10\ny = x\nx = x + 1\nprint(x, y)', options: ['11 11', '11 10', '10 10', '10 11'], answer: 1, rig: 'names' },
  { id: 'q-floordiv', kind: 'output', code: 'print(9 // 2, 9 % 2, 9 / 3)', options: ['4 1 3', '4.5 1 3.0', '4 1 3.0', '4 0 3'], answer: 2, rig: 'bigint' },
  { id: 'q-float', kind: 'output', code: 'print(0.1 + 0.2 == 0.3)', options: ['True', 'False', 'SyntaxError', '0.3'], answer: 1, rig: 'floats' },
  { id: 'q-slice', kind: 'output', code: 's = "python"\nprint(s[1:4], s[-2:], s[::-1][0])', options: ['yth on n', 'pyt on p', 'yth no n', 'ytho on n'], answer: 0, rig: 'slices' },
  { id: 'q-strimm', kind: 'error', code: 's = "cat"\ns[0] = "b"\nprint(s)', options: ['none', 'TypeError', 'IndexError', 'ValueError'], answer: 1, rig: 'strimm' },
  { id: 'q-concat', kind: 'error', code: 'age = 12\nprint("age " + age)', options: ['none', 'ValueError', 'TypeError', 'NameError'], answer: 2, rig: 'convert' },
  { id: 'q-truth', kind: 'output', code: 'print(bool("0"), bool(0), bool([]), bool([0]))', options: ['False False False False', 'True False False True', 'True True False True', 'False False True True'], answer: 1, rig: 'truth' },
  { id: 'q-or', kind: 'output', code: 'name = ""\nprint(name or "guest")\nprint(0 and "x", 3 and "x")', options: ['guest\nFalse True', 'guest\n0 x', '\n0 x', 'guest\nx x'], answer: 1, rig: 'andor' },
  { id: 'q-input', kind: 'error', code: 'n = input()   # the user types 5\nprint(n + 1)', options: ['none', 'TypeError', 'ValueError', 'NameError'], answer: 1, rig: 'inputage' },
  { id: 'q-alias', kind: 'output', code: 'a = [1, 2]\nb = a\nb.append(3)\nc = a + [4]\nprint(a, b, c)', options: ['[1, 2] [1, 2, 3] [1, 2, 4]', '[1, 2, 3] [1, 2, 3] [1, 2, 3, 4]', '[1, 2, 3] [1, 2, 3] [1, 2, 4]', '[1, 2] [1, 2, 3] [1, 2, 3, 4]'], answer: 1, rig: 'mutable' },
  { id: 'q-funcmut', kind: 'output', code: 'def grow(lst, n):\n    lst.append(1)\n    n = n + 1\n\nitems, count = [], 0\ngrow(items, count)\nprint(items, count)', options: ['[1] 1', '[] 0', '[1] 0', '[] 1'], answer: 2, rig: 'funcmut' },
  { id: 'q-fill-len', kind: 'fill', code: 'word = "nebula"\nprint(___)        # should print 6', answers: ['len(word)', 'len("nebula")'], rig: 'strindex' },
  { id: 'q-fill-int', kind: 'fill', code: 'answer = input()   # types "42"\ntotal = ___ + 8   # should be the number 50', answers: ['int(answer)'], rig: 'inputage' },
];
