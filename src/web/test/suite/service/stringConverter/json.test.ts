import assert from 'assert';
import { JsonParser } from '../../../../../service/stringConverter/json';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/json.ts', () => {
    const parser = new JsonParser();
    
    suite('match方法', () => {
        test('有效的JSON字符串应返回匹配成功', () => {
            const tokenInfo: TokenInfo = {
                type: 'string',
                text: '{"name":"test"}',
                originText: '{"name":"test"}'
            };
            const result = parser.match(tokenInfo);
            assert.strictEqual(result.matched, true);
            assert.deepStrictEqual(result.byProduct, {name: 'test'});
        });
        
        test('无效的JSON字符串应返回匹配失败', () => {
            const tokenInfo: TokenInfo = {
                type: 'string',
                text: 'invalid json',
                originText: 'invalid json'
            };
            const result = parser.match(tokenInfo);
            assert.strictEqual(result.matched, false);
        });
        
        test('非字符串类型的token应返回匹配失败', () => {
            const tokenInfo: TokenInfo = {
                type: 'number',
                text: '123',
                originText: '123'
            };
            const result = parser.match(tokenInfo);
            assert.strictEqual(result.matched, false);
        });
    });
    
    suite('convert方法', () => {
        test('应正确格式化JSON字符串', () => {
            const tokenInfo: TokenInfo = {
                type: 'string',
                text: '{"name":"test"}',
                originText: '{"name":"test"}'
            };
            const result = parser.convert(tokenInfo);
            assert.strictEqual(result.result, '{\n  "name": "test"\n}');
            assert.strictEqual(result.explain, '- Formatted JSON string with 2-space indentation.');
        });
    });
});