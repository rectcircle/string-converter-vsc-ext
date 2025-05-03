import { parseLiteral } from '../../../../../service/literalParser/index';
import assert from 'assert';

suite('src/service/literalParser/go.ts', () => {
    suite('parseGoStringLiteral', () => {
        test('should parse interpreted string literal', () => {
            const result = parseLiteral('go', '\"test\\n\\t\\\"quote\\\"\"', 'string').text;
            assert.strictEqual(result, 'test\n\t\"quote\"');
        });

        test('should parse raw string literal', () => {
            const result = parseLiteral('go', '`test\n\t\"quote\"`', 'string').text;
            assert.strictEqual(result, 'test\n\t\"quote\"');
        });

        test('should handle hex escape sequence', () => {
            const result = parseLiteral('go', '\"\\x41\"', 'string').text;
            assert.strictEqual(result, 'A');
        });

        test('should handle unicode escape sequence', () => {
            const result = parseLiteral('go', '\"\\u0041\"', 'string').text;
            assert.strictEqual(result, 'A');
        });

        test('should handle long unicode escape sequence', () => {
            const result = parseLiteral('go', '\"\\U00000041\"', 'string').text;
            assert.strictEqual(result, 'A');
        });
        test('result marker 用该是双引号', () => {
            const result = parseLiteral('go', '"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });
    });
});