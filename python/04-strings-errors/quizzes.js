/** PY-04 quizzes. */
export const QUIZZES = [
  { id: 'q-strip', kind: 'output', code: 's = "  hi there  "\nprint(repr(s.strip()), len(s.split()))', options: ["'hi there' 2", "'  hi there  ' 2", "'hi there' 1", "'hithere' 2"], answer: 0, rig: 'strmethods' },
  { id: 'q-join', kind: 'error', code: 'parts = ["a", 1, "b"]\nprint("-".join(parts))', options: ['none', 'TypeError', 'ValueError', 'AttributeError'], answer: 1, rig: 'splitjoin' },
  { id: 'q-fstring', kind: 'output', code: 'x = 3.14159\nprint(f"{x:.2f}|{x:8.1f}|{42:04d}")', options: ['3.14|     3.1|0042', '3.14|3.1     |0042', '3.141|3.1|42', '3.14|     3.1|42'], answer: 0, rig: 'fstrings' },
  { id: 'q-bytes', kind: 'output', code: 'print(len("é"), len("é".encode("utf-8")))', options: ['1 2', '1 1', '2 2', '2 1'], answer: 0, rig: 'unicode' },
  { id: 'q-regex', kind: 'output', code: 'import re\nprint(re.findall(r"\\d+", "a1 b22 c333"))', options: ["['1', '22', '333']", "['1', '2', '2', '3', '3', '3']", '[1, 22, 333]', "['a1', 'b22', 'c333']"], answer: 0, rig: 'regex' },
  { id: 'q-tryelse', kind: 'output', code: 'try:\n    x = int("5")\nexcept ValueError:\n    print("bad")\nelse:\n    print("ok", x)\nfinally:\n    print("end")', options: ['ok 5\nend', 'end', 'bad\nend', 'ok 5'], answer: 0, rig: 'tryflow' },
  { id: 'q-finally', kind: 'output', code: 'def f():\n    try:\n        return "try"\n    finally:\n        print("cleanup")\n\nprint(f())', options: ['cleanup\ntry', 'try\ncleanup', 'try', 'cleanup'], answer: 0, rig: 'tryflow' },
  { id: 'q-subclass', kind: 'output', code: 'class MyError(ValueError):\n    pass\n\ntry:\n    raise MyError("x")\nexcept ValueError as e:\n    print("caught", type(e).__name__)', options: ['caught MyError', 'caught ValueError', 'MyError: x', '(nothing)'], answer: 0, rig: 'raisechain' },
  { id: 'q-with', kind: 'output', code: 'class R:\n    def __enter__(self):\n        print("in"); return self\n    def __exit__(self, *a):\n        print("out"); return False\n\nwith R():\n    print("body")', options: ['in\nbody\nout', 'body', 'in\nbody', 'in\nout\nbody'], answer: 0, rig: 'contextmgr' },
  { id: 'q-import', kind: 'output', code: 'from math import sqrt as root\nprint(root(81), "sqrt" in dir())', options: ['9.0 False', '9 True', '9.0 True', 'NameError'], answer: 0, rig: 'imports' },
  { id: 'q-fill-split', kind: 'fill', code: 'line = "Luna;12;guitar"\nname, age, hobby = ___     # three strings', answers: ['line.split(";")', "line.split(';')", 'line.split(";", 2)'], rig: 'splitjoin' },
  { id: 'q-order-try', kind: 'order', lines: ['try:', '    n = int(input())', 'except ValueError:', '    n = 0', 'print(n)'], rig: 'tryflow' },
];
