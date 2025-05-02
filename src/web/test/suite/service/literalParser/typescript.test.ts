import assert from "assert";
import { parseTypeScriptLiteral } from "../../../../../service/literalParser/typescript";

suite('src/service/literalParser/typescript.ts', () => {
    suite('parseTypeScriptLiteral', () => {
        test('should return original text when originText is empty', () => {
            assert.strictEqual(parseTypeScriptLiteral('', 'string'), '');
        });
    
        test('should return original text when type is not string or template-string', () => {
            const text = '"hello"';
            assert.strictEqual(parseTypeScriptLiteral(text, 'number'), text);
        });
    
        test('should return original text when quotes do not match', () => {
            const text = '"hello';
            assert.strictEqual(parseTypeScriptLiteral(text, 'string'), text);
        });
    
        test('should handle simple string without escape characters', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello"', 'string'), 'hello');
        });
    
        test('should handle escaped quotes', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\"world"', 'string'), 'hello"world');
        });
    
        test('should handle escaped backslash', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\\\world"', 'string'), 'hello\\world');
        });
    
        test('should handle null character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\0world"', 'string'), 'hello\0world');
        });
    
        test('should handle backspace character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\bworld"', 'string'), 'hello\bworld');
        });
    
        test('should handle form feed character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\fworld"', 'string'), 'hello\fworld');
        });
    
        test('should handle newline character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\nworld"', 'string'), 'hello\nworld');
        });
    
        test('should handle carriage return character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\rworld"', 'string'), 'hello\rworld');
        });
    
        test('should handle tab character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\tworld"', 'string'), 'hello\tworld');
        });
    
        test('should handle vertical tab character', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\vworld"', 'string'), 'hello\vworld');
        });
    
        test('should handle unicode escape sequences', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\u0061world"', 'string'), 'helloaworld');
        });
    
        test('should handle unicode escape sequences with curly braces', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\u{0061}world"', 'string'), 'helloaworld');
        });
    
        test('should handle hex escape sequences', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\x61world"', 'string'), 'helloaworld');
        });
    
        test('should handle octal escape sequences', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\141world"', 'string'), 'helloaworld');
        });
    
        test('should ignore invalid escape sequences', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\qworld"', 'string'), 'helloqworld');
        });
    
        test('should handle template strings', () => {
            assert.strictEqual(parseTypeScriptLiteral('`hello`', 'template-string'), 'hello');
        });
    
        test('should handle single quoted strings', () => {
            assert.strictEqual(parseTypeScriptLiteral("'hello'", 'string'), 'hello');
        });
    
        test('should handle incomplete escape sequence at end of string', () => {
            assert.strictEqual(parseTypeScriptLiteral('"hello\\"', 'string'), 'hello\\');
        });
    });
});