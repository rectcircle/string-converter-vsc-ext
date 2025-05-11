def func():
    return "Hello, World!"

# 测试不同引号类型
print('single quoted string')
print("double quoted string")
print('''triple single quoted string''')
print("""triple double quoted string""")

# 测试转义字符
print("string with \\ backslash")
print('string with \' quote')
print("string with \n newline")
print("string with \t tab")
print("string with \0 null char")
print("string with \b backspace")
print("string with \f form feed")
print("string with \r carriage return")
print("string with \v vertical tab")

# 测试十六进制转义
print("string with \x61 hex")

# 测试八进制转义
print("string with \141 octal")

# 测试Unicode转义
print("string with \u0061 unicode")
print("string with \U00000061 long unicode")
print("string with \N{NEL} newline")

# 测试无效转义
print("string with \q invalid escape")

# 测试多行字符串
print("""multi-line
string""")

# 测试raw字符串
print(r"raw string with \n not escaped")
print(R"raw string with \t not escaped")

# 测试raw多行字符串
print(r"""raw multi-line
string with \n""")

# jwt
print("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw")
print("""\neyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw""")
