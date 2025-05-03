import assert from "assert";
import { parseTypeScriptStringLiteral } from "../../../../../service/literalParser/typescript";

suite('src/service/literalParser/typescript.ts', () => {
    suite('parseTypeScriptLiteral', () => {
        test('should return original text when originText is empty', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('', 'string').text, '');
        });
    
        test('should return original text when type is not string or template-string', () => {
            const text = '"hello"';
            assert.strictEqual(parseTypeScriptStringLiteral(text, 'number').text, text);
        });
    
        test('should return original text when quotes do not match', () => {
            const text = '"hello';
            assert.strictEqual(parseTypeScriptStringLiteral(text, 'string').text, text);
        });
    
        test('should handle simple string without escape characters', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello"', 'string').text, 'hello');
        });
    
        test('should handle escaped quotes', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\"world"', 'string').text, 'hello"world');
        });
    
        test('should handle escaped backslash', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\\\world"', 'string').text, 'hello\\world');
        });
    
        test('should handle null character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\0world"', 'string').text, 'hello\0world');
        });
    
        test('should handle backspace character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\bworld"', 'string').text, 'hello\bworld');
        });
    
        test('should handle form feed character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\fworld"', 'string').text, 'hello\fworld');
        });
    
        test('should handle newline character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\nworld"', 'string').text, 'hello\nworld');
        });
    
        test('should handle carriage return character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\rworld"', 'string').text, 'hello\rworld');
        });
    
        test('should handle tab character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\tworld"', 'string').text, 'hello\tworld');
        });
    
        test('should handle vertical tab character', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\vworld"', 'string').text, 'hello\vworld');
        });
    
        test('should handle unicode escape sequences', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\u0061world"', 'string').text, 'helloaworld');
        });
    
        test('should handle unicode escape sequences with curly braces', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\u{0061}world"', 'string').text, 'helloaworld');
        });
    
        test('should handle hex escape sequences', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\x61world"', 'string').text, 'helloaworld');
        });
    
        test('should handle octal escape sequences', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\141world"', 'string').text, 'helloaworld');
        });
    
        test('should ignore invalid escape sequences', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\qworld"', 'string').text, 'helloqworld');
        });
    
        test('should handle template strings', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('`hello`', 'template-string').text, 'hello');
        });
    
        test('should handle single quoted strings', () => {
            assert.strictEqual(parseTypeScriptStringLiteral("'hello'", 'string').text, 'hello');
        });
    
        test('should handle incomplete escape sequence at end of string', () => {
            assert.strictEqual(parseTypeScriptStringLiteral('"hello\\"', 'string').text, 'hello\\');
        });

        test('result marker 用该是双引号', () => {
            const result = parseTypeScriptStringLiteral('"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('result marker 用该是单引号', () => {
            const result = parseTypeScriptStringLiteral("'hello'",'string');
            assert.strictEqual(result.startMarker, "'");
            assert.strictEqual(result.endMarker, "'");
        });

        test('result marker 用该是反引号', () => {
            const result = parseTypeScriptStringLiteral("`hello`",'string');
            assert.strictEqual(result.startMarker, "`");
            assert.strictEqual(result.endMarker, "`");
        });
    });
});