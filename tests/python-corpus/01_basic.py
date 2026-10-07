a = 5
b = a
a = 6
print(a, b, a is b, id(a) == id(b))
x = 2 ** 100
print(x, type(x))
print(0.1 + 0.2, 1 / 3, 7 // 2, -7 // 2, 7 % 3, -7 % 3, 7 % -3, divmod(17, 5))
print(1e16, 1e-5, 123456789.0, 2.5e10, 1.0, 100.0 / 3, 3.0 * 2)
s = "Varvara"
print(s[0], s[-1], s[1:4], s[::-1], s[::2], len(s), s.upper(), s * 2)
print(int("12") + 3, str(12) + "3", float("2.5"), int(3.99), round(2.5), round(3.5), round(2.675, 2), round(-0.5))
print(bool(0), bool(""), bool([]), bool(None), bool("0"), bool(0.0), 1 and 2, 0 or "x", None or 0, 3 and 0)
print(True + True, True == 1, 1.0 == 1, "1" == 1, [1, 2] == [1, 2], (1, 2) is (1, 2))
print(repr("it's"), repr('say "hi"'), repr("a\nb"), 'x', "y", """tri
ple""")
print(f"{s!r:>12}|{len(s):03d}|{3.14159:.2f}|{1234567:,}|{0.5:.0%}|{'hi':^8}|{255:#x}|{-5:+d}")
print("%s has %d letters and %.1f%%" % (s, len(s), 42.5))
print(10 > 3 > 1, 1 < 2 < 1, "abc" < "abd", [1, 2] < [1, 3], (1, "a") < (1, "b"))
print(max(3, 9, 2), min([4, 1, 8]), sum([1, 2, 3]), abs(-7), pow(2, 10), pow(3, 4, 5), 2 ** -1, 9 ** 0.5)
print(not 0, not [1], 5 // 0.5, 1e308 * 10, -0.0, 10 / 4, int(True), float(False))
