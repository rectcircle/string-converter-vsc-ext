import assert from "assert";
import { parseRustStringLiteral } from "../../../../../service/literalParser/rust";

suite('src/service/literalParser/rust.ts', () => {
    suite('parseRustStringLiteral', () => {
        test('should return original text when originText is empty', () => {
            assert.strictEqual(parseRustStringLiteral('', 'string').text, '');
        });
    
        test('should return original text when type is not string or template-string', () => {
            const text = '123';
            assert.strictEqual(parseRustStringLiteral(text, 'number').text, '123');
        });
    
        test('should return original text when quotes do not match', () => {
            const text = '"hello';
            assert.strictEqual(parseRustStringLiteral(text, 'string').text, text);
        });
    
        test('should handle simple string without escape characters', () => {
            assert.strictEqual(parseRustStringLiteral('"hello"', 'string').text, 'hello');
        });
    
        test('should handle escaped quotes', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\"world"', 'string').text, 'hello"world');
        });
    
        test('should handle escaped backslash', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\\\world"', 'string').text, 'hello\\world');
        });
    
        test('should handle null character', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\0world"', 'string').text, 'hello\0world');
        });
    
        test('should handle newline character', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\nworld"', 'string').text, 'hello\nworld');
        });
    
        test('should handle carriage return character', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\rworld"', 'string').text, 'hello\rworld');
        });
    
        test('should handle tab character', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\tworld"', 'string').text, 'hello\tworld');
        });
    
        test('should handle unicode escape sequences', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\u{0061}world"', 'string').text, 'helloaworld');
        });
    
        test('should handle hex escape sequences', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\x61world"', 'string').text, 'helloaworld');
        });
    
        test('should ignore invalid escape sequences', () => {
            assert.strictEqual(parseRustStringLiteral('"hello\\qworld"', 'string').text, 'helloqworld');
        });
        
        test('should handle raw string with quotes', () => {
            assert.strictEqual(parseRustStringLiteral('r#"raw string with \"quotes\" inside"#', 'string').text, 'raw string with "quotes" inside');
        });
        
        test('should handle raw string with no escaped', () => {
            assert.strictEqual(parseRustStringLiteral('r#"raw string with \\n no escaped"#', 'string').text, 'raw string with \\n no escaped');
        });
        
        test('should handle raw string with delimiters', () => {
            assert.strictEqual(parseRustStringLiteral('r##"raw string with # delimiters"##', 'string').text, 'raw string with # delimiters');
        });
        
        test('should handle byte string', () => {
            assert.strictEqual(parseRustStringLiteral('b"byte string"', 'string').text, 'byte string');
        });
        
        test('should handle jwt token in raw string', () => {
            const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwOTI1YjkzNmYzZWZjNTYzOGI5MjhkOTIzN2VlZmJhIn0.eyJleHAiOjE3NDYyMDI1MjcsInN1YiI6InVzZXJpZF8xIiwiaXNzIjoicmVjdGNpcmNsZSIsIm5iZiI6MTc0NjAyODgwMCwiaWF0IjoxNzQ2MDI4ODAwLCJqdGkiOiJ1dWlkLXh4eCIsImF1ZCI6ImF1ZGllbmNlIn0.0ZRNxzL82QSi0mmdPx6S4Sw9I0B1sfgd8G1cCoHAKXvFwck2ryWOzTjGIFctXlOI6Cl3Xhy5fHgXY9fWe15KBw';
            assert.strictEqual(parseRustStringLiteral(`r"${jwt}"`, 'string').text, jwt);
        });

        test('result marker 用该是双引号', () => {
            const result = parseRustStringLiteral('"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('result marker 用该是 r#" 和 "#', () => {
            const result = parseRustStringLiteral('r#"hello"#','string');
            assert.strictEqual(result.startMarker, 'r#"');
            assert.strictEqual(result.endMarker, '"#');
        });
    });
});