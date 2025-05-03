import './typescript.test';
import './json.test';
import { parseLiteral } from '../../../../../service/literalParser/index';
import assert from 'assert';

suite('src/service/literalParser/index.ts', () => {
    suite('parseLiteral', () => {
        test('should return original text for non-string types', () => {
            const result = parseLiteral('typescript', 'test', 'number');
            assert.strictEqual(result, 'test');
        });

        test('should parse string literal for registered language', () => {
            const result = parseLiteral('typescript', '\"test\"', 'string');
            assert.strictEqual(result, 'test');
        });

        test('should parse template string for registered language', () => {
            const result = parseLiteral('typescript', '`test`', 'template-string');
            assert.strictEqual(result, 'test');
        });

        test('should return original text for unregistered language', () => {
            const result = parseLiteral('unknown', '\"test\"', 'string');
            assert.strictEqual(result, '\"test\"');
        });
    });
});