import assert from 'assert';
import { Base64BinaryParser, Base64StringParser } from '../../../../../service/stringConverter/base64';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/base64.ts', () => {

    suite('Base64StringParser', () => {

        const parser = new Base64StringParser();

        suite('match()', () => {
            test('应该返回false当类型不是string', () => {
                const tokenInfo: TokenInfo = {
                    type: 'number',
                    text: '123',
                    originText: '123'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回false这是纯数字字符串', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: '123456',
                    originText: '"123456"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回false这是二进制文件base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg==',
                    originText: '"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg=="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回true这是ASCII编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'SGVsbG8gV29ybGQ=',
                    originText: '"SGVsbG8gV29ybGQ="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, true);
                assert.strictEqual(parser.match(tokenInfo).byProduct?.encoding, 'ASCII');
            });
    
            test('应该返回true这是UTF8编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: '5L2g5aW9',
                    originText: '"5L2g5aW9"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, true);
                assert.strictEqual(parser.match(tokenInfo).byProduct?.encoding, 'UTF-8');
            });
    
            test('应该返回true这是GB18030编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'xOO6w6Os1eLKx9bQzsShow==',
                    originText: '"xOO6w6Os1eLKx9bQzsShow=="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, true);
                assert.strictEqual(parser.match(tokenInfo).byProduct?.encoding, 'GB18030');
            });
            test('应该返回false这是png的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg==',
                    originText: '"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg=="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
            test('应该返回false这是英文单词', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'test',
                    originText: '"test"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });

            test('应该返回false这是标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'TestAbcd',
                    originText: '"TestAbcd"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
            
            test('应该返回false这是camelCase标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'camelCaseIdentifier',
                    originText: '"camelCaseIdentifier"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });

            test('应该返回false这是PascalCase标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'PascalCaseIdentifier',
                    originText: '"PascalCaseIdentifier"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });

            test('应该返回false这是snake_case标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'snake_case_identifier',
                    originText: '"snake_case_identifier"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });

            test('应该返回false这是kebab-case标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'kebab-case-identifier',
                    originText: '"kebab-case-identifier"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });

            test('应该返回false这是混合格式标识符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'HTTP_RequestHandlerV2',
                    originText: '"HTTP_RequestHandlerV2"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
        });
    
        suite('convert()', () => {
            test('应该正确转换ASCII编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'SGVsbG8gV29ybGQ=',
                    originText: '"SGVsbG8gV29ybGQ="'
                };
                const result = parser.convert(tokenInfo);
                assert.strictEqual(result.result, 'Hello World');
            });
    
            test('应该正确转换UTF8编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: '5L2g5aW9',
                    originText: '"5L2g5aW9"'
                };
                const result = parser.convert(tokenInfo);
                assert.strictEqual(result.result, '你好');
            });
    
            test('应该正确转换GB18030编码的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'xOO6w6Os1eLKx9bQzsShow==',
                    originText: '"xOO6w6Os1eLKx9bQzsShow=="'
                };
                const result = parser.convert(tokenInfo);
                assert.strictEqual(result.result, '你好，这是中文。');
            });
        });
    });
   
    suite('Base64BinaryParser', () => {
        const parser = new Base64BinaryParser();

        suite('match()', () => {
            test('应该返回false当类型不是string', () => {
                const tokenInfo: TokenInfo = {
                    type: 'number',
                    text: '123',
                    originText: '123'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回false这是纯数字字符串', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: '123456',
                    originText: '"123456"'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回false这是文本base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'SGVsbG8gV29ybGQ=',
                    originText: '"SGVsbG8gV29ybGQ="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
    
            test('应该返回true这是png的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg==',
                    originText: '"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg=="'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, true);
                assert.strictEqual(parser.match(tokenInfo).byProduct?.encoding, 'png');
            });
        });
    
        suite('convert()', () => {
            test('应该正确转换png的base64', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg==',
                    originText: '"iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAIklEQVQ4jWP8////fwYqAiZqGjZq4KiBowaOGjhq4FAyEACzFQQkuFxUKAAAAABJRU5ErkJggg=="'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(typeof result.result === 'string');
                assert.ok(result.result.includes('PNG'));
                assert.ok(result.explain?.includes('png'));
            });
        });
    });
});
