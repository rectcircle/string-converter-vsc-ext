import './typescript.test';
import './json.test';
import './go.test';
import './rust.test';
import './java.test';
import './python.test';
import { parseLiteral } from '../../../../../service/literalParser/index';
import assert from 'assert';

suite('src/service/literalParser/index.ts', () => {
    suite('parseLiteral', () => {
        test('should return original text for non-string types', () => {
            const result = parseLiteral('typescript', 'test', 'number').text;
            assert.strictEqual(result, 'test');
        });

        test('should parse string literal for registered language', () => {
            const result = parseLiteral('typescript', '\"test\"', 'string').text;
            assert.strictEqual(result, 'test');
        });

        test('should parse template string for registered language', () => {
            const result = parseLiteral('typescript', '`test`', 'template-string').text;
            assert.strictEqual(result, 'test');
        });

        test('should return original text for unregistered language', () => {
            const result = parseLiteral('unknown', '\"test\"', 'string').text;
            assert.strictEqual(result, '\"test\"');
        });


        test('result marker 用该是双引号', () => {
            const result = parseLiteral('typescript','"hello"','string');
            assert.strictEqual(result.startMarker, '"');
            assert.strictEqual(result.endMarker, '"');
        });

        test('result marker 用该是单引号', () => {
            const result = parseLiteral('typescript',"'hello'",'string');
            assert.strictEqual(result.startMarker, "'");
            assert.strictEqual(result.endMarker, "'");
        });

        test('result marker 用该是反引号', () => {
            const result = parseLiteral('typescript',"`hello`",'string');
            assert.strictEqual(result.startMarker, "`");
            assert.strictEqual(result.endMarker, "`");
        });

    });
});