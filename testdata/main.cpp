// 测试基本字符串
const char* str1 = "hello world";

// 测试转义字符
const char* str2 = "\n"; // 换行
const char* str3 = "\t"; // 制表符
const char* str4 = "\r"; // 回车
const char* str5 = "\\"; // 反斜杠
const char* str6 = "\""; // 双引号
const char* str7 = "\b"; // 退格
const char* str8 = "\f"; // 换页
const char* str9 = "\v"; // 垂直制表符
const char* str10 = "\a"; // 响铃
const char* str11 = "\?"; // 问号

// 测试八进制转义序列
const char* str12 = "\141"; // 字符 'a'
const char* str13 = "\142"; // 字符 'b'
const char* str14 = "\143"; // 字符 'c'

// 测试十六进制转义序列
const char* str15 = "\x41"; // 字符 'A'
const char* str16 = "\x42"; // 字符 'B'
const char* str17 = "\x43"; // 字符 'C'

// 测试通用字符名（Unicode）
const char* str18 = "\u0041"; // 字符 'A'
const char* str19 = "\u0042"; // 字符 'B'
const char* str20 = "\u0043"; // 字符 'C'

// 测试长通用字符名（Unicode）
const char* str21 = "\U00000041"; // 字符 'A'
const char* str22 = "\U00000042"; // 字符 'B'
const char* str23 = "\U00000043"; // 字符 'C'

// 测试无效转义序列
const char* str24 = "\z"; // 无效转义
const char* str25 = "\xZZ"; // 无效十六进制
const char* str26 = "\uZZZZ"; // 无效Unicode
const char* str27 = "\UZZZZZZZZ"; // 无效长Unicode

// 测试 C++23 八进制转义序列
const char* str28 = "\o{141}"; // 字符 'a'
const char* str29 = "\o{142}"; // 字符 'b'
const char* str30 = "\o{143}"; // 字符 'c'

// 测试 C++23 十六进制转义序列
const char* str31 = "\x{41}"; // 字符 'A'
const char* str32 = "\x{42}"; // 字符 'B'
const char* str33 = "\x{43}"; // 字符 'C'

// 测试 C++23 Unicode 大括号转义序列
const char* str34 = "\u{41}"; // 字符 'A'
const char* str35 = "\u{42}"; // 字符 'B'
const char* str36 = "\u{43}"; // 字符 'C'

// 测试 C++23 Unicode 命名字符转义序列
const char* str37 = "\N{VS256}";

// 测试带前缀的字符串字面量
const char* str40 = L"Hello"; // 宽字符串
const char* str41 = u8"Hello"; // UTF-8 字符串
const char* str42 = u"Hello"; // UTF-16 字符串
const char* str43 = U"Hello"; // UTF-32 字符串

// 测试原始字符串字面量
const char* str44 = R"(SGVsbG8gV29ybGQ=)"; // 不处理转义字符
const char* str45 = R"foo(SGVsbG8gV29ybGQ=)foo"; // 带分隔符
const char* str46 = R"({"name":
"test"})"; // 包含反斜杠和引号

// 测试带前缀的原始字符串字面量
const char* str47 = LR"(1672531200)"; // 宽字符原始字符串
const char* str48 = u8R"(https://www.example.com)"; // UTF-8 原始字符串
const char* str49 = uR"({"name":"test"})"; // UTF-16 原始字符串
const char* str50 = UR"({"name":"test"})"; // UTF-32 原始字符串

// 测试多行字符串
const char* str51 = "This is a\n"
                   "multi-line\n"
                   "string";

// 测试包含各种字符的字符串
const char* str52 = "Mixed string with \n newline, \t tab, \x41 hex, \141 octal";
