import { parseCppStringLiteral } from '../../../../../service/literalParser/cpp';
import assert from 'assert';

suite('src/service/literalParser/cpp.ts', () => {
    suite('parseCppStringLiteral', () => {
        test('should handle empty string', () => {
            const result = parseCppStringLiteral('', 'string');
            assert.strictEqual(result.text, '');
        });

        test('should handle non-string type', () => {
            const result = parseCppStringLiteral('test', 'number');
            assert.strictEqual(result.text, 'test');
        });

        test('should handle invalid quote', () => {
            const result = parseCppStringLiteral('\'test\'', 'string');
            assert.strictEqual(result.text, '\'test\'');
        });

        test('should handle unmatched quotes', () => {
            const result = parseCppStringLiteral('"test', 'string');
            assert.strictEqual(result.text, '"test');
        });

        test('should handle basic string', () => {
            const result = parseCppStringLiteral('"hello"', 'string');
            assert.strictEqual(result.text, 'hello');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('should handle escape characters', () => {
            const testCases = [
                ['"\\n"', '\n'],
                ['"\\t"', '\t'],
                ['"\\r"', '\r'],
                ['"\\\\"', '\\'],
                ['"\\""', '"'],
                ['"\\b"', '\b'],
                ['"\\f"', '\f'],
                ['"\\v"', '\v'],
                ['"\\a"', '\x07'],
                ['"\\?"', '?']
            ];

            for (const [input, expected] of testCases) {
                const result = parseCppStringLiteral(input, 'string');
                assert.strictEqual(result.text, expected);
            }
        });

        test('should handle octal escapes', () => {
            const result = parseCppStringLiteral('"\\141"', 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle hex escapes', () => {
            const result = parseCppStringLiteral('"\\x41"', 'string');
            assert.strictEqual(result.text, 'A');
        });

        test('should handle \\u unicode escapes', () => {
            const result = parseCppStringLiteral('"\\u0041"', 'string');
            assert.strictEqual(result.text, 'A');
        });

        test('should handle \\U unicode escapes', () => {
            const result = parseCppStringLiteral('"\\U00000041"', 'string');
            assert.strictEqual(result.text, 'A');
        });

        test('should handle invalid escape sequences', () => {
            const testCases = [
                ['"\\z"', '\\'],
                ['"\\xZZ"', '\\'],
                ['"\\uZZZZ"', '\\'],
                ['"\\UZZZZZZZZ"', '\\']
            ];

            for (const [input, expected] of testCases) {
                const result = parseCppStringLiteral(input, 'string');
                assert.strictEqual(result.text[0], expected);
            }
        });

        test('should handle C++23 octal escape sequences', () => {
            const result = parseCppStringLiteral('"\\o{141}"', 'string');
            assert.strictEqual(result.text, 'a');
        });

        test('should handle C++23 hex escape sequences', () => {
            const result = parseCppStringLiteral('"\\x{41}"', 'string');
            assert.strictEqual(result.text, 'A');
        });

        test('should handle C++23 unicode braced escape sequences', () => {
            const result = parseCppStringLiteral('"\\u{41}"', 'string');
            assert.strictEqual(result.text, 'A');
        });

        test('should handle C++23 Unicode named character escape sequences', () => {
            const result = parseCppStringLiteral('"\\N{VS256}"', 'string');
            assert.strictEqual(result.text, '\u{E01EF}');
        });

        test('should handle raw string literals', () => {
            const testCases = [
                ['R"(Hello\nWorld)"', 'Hello\nWorld', 'R"(', ')"'],
                ['R"foo(Hello(World)foo"', 'Hello(World', 'R"foo(', ')foo"'],
                ['R"(a\\b\"c)"', 'a\\b\"c', 'R"(', ')"']
            ];

            for (const [input, expected, expectedStartMarker, expectedEndMarker] of testCases) {
                const result = parseCppStringLiteral(input, 'string');
                assert.strictEqual(result.text, expected);
                assert.strictEqual(result.startMarker, expectedStartMarker);
                assert.strictEqual(result.endMarker, expectedEndMarker);
            }
        });

        test('should handle prefixed string literals', () => {
            const testCases = [
                ['L"Hello"', 'Hello', 'L"', '"'],
                ['u8"Hello"', 'Hello', 'u8"', '"'],
                ['u"Hello"', 'Hello', 'u"', '"'],
                ['U"Hello"', 'Hello', 'U"', '"']
            ];

            for (const [input, expected, expectedStartMarker, expectedEndMarker] of testCases) {
                const result = parseCppStringLiteral(input, 'string');
                assert.strictEqual(result.text, expected);
                assert.strictEqual(result.startMarker, expectedStartMarker);
                assert.strictEqual(result.endMarker, expectedEndMarker);
            }
        });

        test('should handle prefixed raw string literals', () => {
            const testCases = [
                ['LR"(Hello)"', 'Hello', 'LR"(', ')"'],
                ['u8R"(Hello)"', 'Hello', 'u8R"(', ')"'],
                ['uR"(Hello)"', 'Hello', 'uR"(', ')"'],
                ['UR"(Hello)"', 'Hello', 'UR"(', ')"']
            ];

            for (const [input, expected, expectedStartMarker, expectedEndMarker] of testCases) {
                const result = parseCppStringLiteral(input, 'string');
                assert.strictEqual(result.text, expected);
                assert.strictEqual(result.startMarker, expectedStartMarker);
                assert.strictEqual(result.endMarker, expectedEndMarker);
            }
        });
    });
});