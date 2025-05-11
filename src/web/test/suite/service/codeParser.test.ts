import assert from "assert";
import { extractCodeTokens } from "../../../../service/codeParser";

suite('src/service/codeParser.ts', () => {
    suite('extractCodeToken', () => {
        test('basic', async () => {
            // 测试基本功能 - JavaScript代码
            const jsCode = 'const x = "hello world";';
            const result = await extractCodeTokens(jsCode, 'javascript', 0);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].type, 'keyword');
            assert.strictEqual(result[0].originText, 'const');

            // 测试不支持的语言
            const unknownResult = await  extractCodeTokens('some code', 'unknown', 0);
            assert.strictEqual(unknownResult.length, 0);

            // 测试选中范围
            const rangeResult = await  extractCodeTokens(jsCode, 'javascript', 0, 5, 'const');
            assert.strictEqual(rangeResult.length, 1);
            assert.strictEqual(rangeResult[0].originText, 'const');

            // 测试选中了多个 Token
            const multiTokenResult = await  extractCodeTokens(jsCode, 'javascript', 1, 7, 'onst x');
            assert.strictEqual(multiTokenResult.length, 2);
            assert.strictEqual(multiTokenResult[0].originText, 'const');
            assert.strictEqual(multiTokenResult[1].originText, ' x ');

            // 测试选中了一个字符串类型的 Token 的一部分
            let start = jsCode.indexOf('hello') + 1;
            let end = start + 4;
            let selectionText = jsCode.substring(start, end);
            const stringResult = await extractCodeTokens(jsCode, 'javascript', start, end, selectionText);
            assert.strictEqual(stringResult.length, 1);
            assert.strictEqual(stringResult[0].originText, '"ello"');
            assert.strictEqual(stringResult[0].type, 'string');
        });
        test('typescript-string', async () => {
            const tsCode = `// comment
console.log('hello world'); 
console.log(\`hello 
\${'world'}\`);
function test() {
	console.log("hello world");
}`;

            // 测试单引号字符串中的hello
            const singleQuoteResult = await extractCodeTokens(tsCode, 'typescript', tsCode.indexOf("'hello") + 3);
            assert.strictEqual(singleQuoteResult.length, 1);
            assert.strictEqual(singleQuoteResult[0].originText, "'hello world'");
            assert.strictEqual(singleQuoteResult[0].type, 'string');

            // 测试双引号字符串中的hello
            const doubleQuoteResult = await extractCodeTokens(tsCode, 'typescript', tsCode.indexOf('`hello') + 3);
            assert.strictEqual(doubleQuoteResult.length, 1);
            assert.strictEqual(doubleQuoteResult[0].originText, "`hello \n${'world'}`");
            assert.strictEqual(doubleQuoteResult[0].type, 'template-string');

            // 测试模板字符串中的hello
            const templateResult = await extractCodeTokens(tsCode, 'typescript', tsCode.indexOf('"hello') + 3);
            assert.strictEqual(templateResult.length, 1);
            assert.strictEqual(templateResult[0].originText, '"hello world"');
            assert.strictEqual(templateResult[0].type, 'string');
        });
    });
});


