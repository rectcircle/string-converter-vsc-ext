import { parseLiteral } from '../../../../../service/literalParser/index';
import assert from 'assert';
import { parsePythonStringLiteral } from '../../../../../service/literalParser/python';

suite('src/service/literalParser/python.ts', () => {
    suite('parseLiteral', () => {
        test('should parse single quoted string', () => {
            const result = parseLiteral('python', "'hello'", 'string');
            assert.strictEqual(result.text, 'hello');
            assert.strictEqual(result.startMarker, "'");
            assert.strictEqual(result.endMarker, "'");
        });

        test('should parse double quoted string', () => {
            const result = parseLiteral('python', '"hello"', 'string');
            assert.strictEqual(result.text, 'hello');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('should parse triple single quoted string', () => {
            const result = parseLiteral('python', "'''hello'''", 'string');
            assert.strictEqual(result.text, 'hello');
            assert.strictEqual(result.startMarker, "'''");
            assert.strictEqual(result.endMarker, "'''");
        });

        test('should parse triple double quoted string', () => {
            const result = parseLiteral('python', '"""hello"""', 'string');
            assert.strictEqual(result.text, 'hello');
            assert.strictEqual(result.startMarker, '"""');
            assert.strictEqual(result.endMarker, '\"""');
        });

        test('should handle escape characters', () => {
            const result = parseLiteral('python', "'hello\\nworld'", 'string');
            assert.strictEqual(result.text, 'hello\nworld');
        });

        test('should handle hex escape', () => {
            const result = parseLiteral('python', "'\\x61'", 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle octal escape', () => {
            const result = parseLiteral('python', "'\\141'", 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle unicode escape', () => {
            const result = parseLiteral('python', "'\\u0061'", 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle long unicode escape', () => {
            const result = parseLiteral('python', "'\\U00000061'", 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle raw string', () => {
            const result = parseLiteral('python', "r'hello\\nworld'", 'string');
            assert.strictEqual(result.text, 'hello\\nworld');
            assert.strictEqual(result.startMarker, "r'");
            assert.strictEqual(result.endMarker, "'");
        });

        test('should handle raw double quoted string', () => {
            const result = parseLiteral('python', 'R"hello\\nworld"', 'string');
            assert.strictEqual(result.text, 'hello\\nworld');
            assert.strictEqual(result.startMarker, 'R"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('should handle invalid escape sequence', () => {
            const result = parseLiteral('python', "'hello\\qworld'", 'string');
            assert.strictEqual(result.text, 'hello\\qworld');
        });

        test('should return original text for non-string types', () => {
            const result = parseLiteral('python', '123', 'number');
            assert.strictEqual(result.text, '123');
        });

        test('should return original text for unregistered language', () => {
            const result = parseLiteral('python', '"\\N{NEL}"','string');
            assert.strictEqual(result.text, String.fromCodePoint(0x0085));
        });

        test('result marker 用该是双引号', () => {
            const result = parsePythonStringLiteral('"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('result marker 用该是单引号', () => {
            const result = parsePythonStringLiteral("'hello'",'string');
            assert.strictEqual(result.startMarker, "'");
            assert.strictEqual(result.endMarker, "'");
        });

        test('result marker 用该是"""', () => {
            const result = parsePythonStringLiteral('"""hello"""','string');
            assert.strictEqual(result.startMarker, '"""');
            assert.strictEqual(result.endMarker, '"""');
        });

        test('result marker 用该是r""" 和 """', () => {
            const result = parsePythonStringLiteral('r"""hello"""','string');
            assert.strictEqual(result.startMarker, 'r"""');
            assert.strictEqual(result.endMarker, '"""');
        });
    });
});