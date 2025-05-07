console.log('hello world');
console.log("hello world");
console.log(`hello ${'world'}`);

// 测试不同引号类型
console.log("double quoted string");
console.log('single quoted string');
console.log(`template string`);
console.log(`template string
newline`);

// 测试转义字符
console.log("string with \\ backslash");
console.log("string with \" quote");
console.log("string with \n newline");
console.log("string with \t tab");
console.log("string with \0 null char");
console.log("string with \b backspace");
console.log("string with \f form feed");
console.log("string with \r carriage return");
console.log("string with \v vertical tab");

// 测试Unicode转义
console.log("string with \u0061 unicode");
console.log("string with \u{0061} unicode");

// 测试十六进制转义
console.log("string with \x61 hex");

// 测试八进制转义
console.log("string with \141 octal");

// 测试无效转义
console.log("string with \q invalid escape");

// 测试 jwt 字符串
console.log("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30");
console.log("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw");

// 测试时间戳字符串
console.log("1672531200");
console.log("1672531200000");
console.log(1672531200);

// 测试 base64 字符串
// ASCII
console.log("SGVsbG8gV29ybGQ=");
console.log("KCk=");
// utf8
console.log("5L2g5aW9");
// GB18030
console.log("xOO6w6Os1eLKx9bQzsShow==");
// png 图片
console.log("iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg==");
// 英文单词长度为 4 的倍数，不应该被识别为 base64
console.log("test");


// 测试 URL 编码字符串
// 简单URL
console.log("https://www.example.com");
// 带查询参数的URL
console.log("https://www.example.com/search?q=hello+world&lang=en");
// 包含特殊字符的URL
console.log("https://www.example.com/path%20with%20spaces?param1=value%201&param2=%E4%B8%AD%E6%96%87");
// 纯查询字符串
console.log("?name=John+Doe&age=30&city=New+York");
// 二次编码
console.log("%3Fq%3D%25E4%25B8%25AD%25E6%2596%2587%26lang%3Dzh");


// 测试JSON字符串
// 有效JSON
console.log('{"name":"test"}');
console.log('{"array":[1,2,3]}');
console.log('{"nested":{"key":"value"}}');
console.log('["one","two","three"]');
// 无效JSON
console.log('invalid json');
console.log('{"name":"test"'); // 缺少闭合括号
console.log('{"name":test}'); // 缺少引号
console.log('{"name":"test",}'); // 尾部逗号
// 边缘情况
console.log('{}'); // 空对象
console.log('[]'); // 空数组
console.log('{"":""}'); // 空键值
console.log('{"key":null}'); // null值
console.log('{"key":true}'); // 布尔值
console.log('{"key":123}'); // 数字值
