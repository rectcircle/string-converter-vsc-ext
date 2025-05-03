import assert from 'assert';
import { parseJSONStringLiteral } from '../../../../../service/literalParser/json';

suite('src/service/literalParser/json.ts', () => {
    suite('parseJSONStringLiteral', () => {
        test('应该正确解析JSON字符串', () => {
            assert.strictEqual(
                parseJSONStringLiteral('"hello\\nworld"', 'string'),
                'hello\nworld'
            );
            assert.strictEqual(
                parseJSONStringLiteral('"\\"quoted\\""', 'string'),
                '"quoted"'
            );
            assert.strictEqual(
                parseJSONStringLiteral('"\\u0041"', 'string'),
                'A'
            );
        });

        test('非字符串类型应返回原字符串', () => {
            assert.strictEqual(
                parseJSONStringLiteral('"test"', 'number'),
                '"test"'
            );
        });

        test('无效JSON字符串应返回原字符串', () => {
            assert.strictEqual(
                parseJSONStringLiteral('"unclosed', 'string'),
                '"unclosed'
            );
        });

        test('非法转义字符串返回原样', () => {
            assert.strictEqual(
                parseJSONStringLiteral('"string with \\q invalid escape"','string'),
                '"string with \\q invalid escape"'
            );
        });
    });
});