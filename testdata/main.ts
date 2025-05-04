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
