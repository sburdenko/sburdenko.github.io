# input: Varvara|12
name = input("Name? ")
age = int(input("Age? "))
print(f"Hi {name}, next year you will be {age + 1}")
try:
    input()
except EOFError as e:
    print("EOFError:", e)
