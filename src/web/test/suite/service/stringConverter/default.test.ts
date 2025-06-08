import assert  from 'assert';
import { StringLiteralConverter } from '../../../../../service/stringConverter/stringLiteral';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/default.ts', () => {
    suite('DefaultConverter', () => {
        const converter = new StringLiteralConverter();

        suite('match()', () => {
            test('应该返回false当类型不是string或template-string', () => {
                const tokenInfo: TokenInfo = {
                    type: 'number',
                    text: '123',
                    originText: '123'
                };
                assert.strictEqual(converter.match(tokenInfo).matched, false);
            });

            test('应该返回false当原始文本不包含转义字符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'hello',
                    originText: 'hello'
                };
                assert.strictEqual(converter.match(tokenInfo).matched, false);
            });

            test('应该返回true当原始文本包含转义字符', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'hello\n',
                    originText: '\"hello\\n\"'
                };
                assert.strictEqual(converter.match(tokenInfo).matched, true);
            });
        });

        suite('convert()', () => {
            test('应该返回原始文本', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'hello',
                    originText: '\"hello\"'
                };
                assert.strictEqual(converter.convert(tokenInfo).result, 'hello');
            });
        });
    });
});