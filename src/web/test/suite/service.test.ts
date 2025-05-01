import assert from "assert";
import { extractCodeTokens } from "../../../service/codeParser";

suite('test src/service/', () => {
	suite('codeParser.ts', () => {
		suite('extractCodeToken', () =>{
			test('basic', () => {
				// 测试基本功能 - JavaScript代码
				const jsCode = 'const x = "hello world";';
				const result = extractCodeTokens(jsCode, 'javascript', 0);
				assert.strictEqual(result.length, 1);
				assert.strictEqual(result[0].Type, 'keyword');
				assert.strictEqual(result[0].OriginText, 'const');
				
				// 测试不支持的语言
				const unknownResult = extractCodeTokens('some code', 'unknown', 0);
				assert.strictEqual(unknownResult.length, 0);
				
				// 测试选中范围
				const rangeResult = extractCodeTokens(jsCode, 'javascript', 0, 5, 'const');
				assert.strictEqual(rangeResult.length, 1);
				assert.strictEqual(rangeResult[0].OriginText, 'const');

				// 测试选中了多个 Token
				const multiTokenResult = extractCodeTokens(jsCode, 'javascript', 1, 7, 'onst x');
				assert.strictEqual(multiTokenResult.length, 2);
				assert.strictEqual(multiTokenResult[0].OriginText, 'const');
				assert.strictEqual(multiTokenResult[1].OriginText, ' x ');

				// 测试选中了一个字符串类型的 Token 的一部分
				let start = jsCode.indexOf('hello')+1;
				let end = start + 4;
				let selectionText = jsCode.substring(start, end);
				const stringResult = extractCodeTokens(jsCode, 'javascript', start, end, selectionText);
				assert.strictEqual(stringResult.length, 1);
				assert.strictEqual(stringResult[0].OriginText, '"ello"');
				assert.strictEqual(stringResult[0].Type, 'string');
			});
			test('typescript-string', () => {
				const tsCode= `// comment
console.log('hello world'); 
console.log(\`hello 
\${'world'}\`);
function test() {
	console.log("hello world");
}`;
				
				// 测试单引号字符串中的hello
				const singleQuoteResult = extractCodeTokens(tsCode, 'typescript', tsCode.indexOf("'hello")+3);
				assert.strictEqual(singleQuoteResult.length, 1);
				assert.strictEqual(singleQuoteResult[0].OriginText, "'hello world'");
				assert.strictEqual(singleQuoteResult[0].Type, 'string');
				
				// 测试双引号字符串中的hello
				const doubleQuoteResult = extractCodeTokens(tsCode, 'typescript', tsCode.indexOf('`hello')+3);
				assert.strictEqual(doubleQuoteResult.length, 1);
				assert.strictEqual(doubleQuoteResult[0].OriginText, "`hello \n${'world'}`");
				assert.strictEqual(doubleQuoteResult[0].Type,'template-string');
				
				// 测试模板字符串中的hello
				const templateResult = extractCodeTokens(tsCode, 'typescript', tsCode.indexOf('"hello')+3);
				assert.strictEqual(templateResult.length, 1);
				assert.strictEqual(templateResult[0].OriginText, '"hello world"');
				assert.strictEqual(templateResult[0].Type,'string');
			});
		});
	});
});

