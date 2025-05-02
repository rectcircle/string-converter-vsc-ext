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

