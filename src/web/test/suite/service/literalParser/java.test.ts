import assert from "assert";
import { parseJavaStringLiteral } from "../../../../../service/literalParser/java";

suite('src/service/literalParser/java.ts', () => {
    suite('parseJavaLiteral', () => {
        test('should return original text when originText is empty', () => {
            assert.strictEqual(parseJavaStringLiteral('', 'string').text, '');
        });
    
        test('should return original text when type is not string', () => {
            const text = '"hello"';
            assert.strictEqual(parseJavaStringLiteral(text, 'number').text, text);
        });
    
        test('should return original text when quotes do not match', () => {
            const text = '"hello';
            assert.strictEqual(parseJavaStringLiteral(text, 'string').text, text);
        });
    
        test('should handle simple string without escape characters', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello"', 'string').text, 'hello');
        });
    
        test('should handle escaped quotes', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\"world"', 'string').text, 'hello"world');
        });
    
        test('should handle escaped backslash', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\\\world"', 'string').text, 'hello\\world');
        });
    
        test('should handle backspace character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\bworld"', 'string').text, 'hello\bworld');
        });
    
        test('should handle form feed character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\fworld"', 'string').text, 'hello\fworld');
        });
    
        test('should handle newline character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\nworld"', 'string').text, 'hello\nworld');
        });
    
        test('should handle carriage return character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\rworld"', 'string').text, 'hello\rworld');
        });
    
        test('should handle tab character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\tworld"', 'string').text, 'hello\tworld');
        });
    
        test('should handle space character', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\sworld"', 'string').text, 'hello world');
        });
    
        test('should handle unicode escape sequences', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\u0061world"', 'string').text, 'helloaworld');
        });
    
        test('should ignore invalid escape sequences', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\qworld"', 'string').text, 'hello\\qworld');
        });
    
        test('should handle incomplete escape sequence at end of string', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\"', 'string').text, 'hello\\');
        });
        test('should handle octal escape sequences', () => {
            assert.strictEqual(parseJavaStringLiteral('"hello\\141world"', 'string').text, 'helloaworld');
        });

        test('should handle text block with multiple lines', () => {
            const text = '"""\n    line1\n    line2\n    """';
            assert.strictEqual(parseJavaStringLiteral(text, 'triple-quoted-string').text, 'line1\nline2\n');
        });

        test('should handle text block with escaped newline', () => {
            const text = '"""\n    line1\\n    line2\n    """';
            assert.strictEqual(parseJavaStringLiteral(text, 'triple-quoted-string').text, 'line1\n    line2\n');
        });

        test('should handle text block with minimal indentation', () => {
            const text = '"""\n        line1\n    line2\n        """';
            assert.strictEqual(parseJavaStringLiteral(text, 'triple-quoted-string').text, '    line1\nline2\n    ');
        });

        test('result marker 用该是双引号', () => {
            const result = parseJavaStringLiteral('"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });
        test('result marker 用该是 """', () => {
            const result = parseJavaStringLiteral('"""hello"""','triple-quoted-string');
            assert.strictEqual(result.startMarker, '"""');
            assert.strictEqual(result.endMarker, '"""');
        });

    });
});