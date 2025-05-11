import assert from 'assert';
import { SymbolStyleConverter } from '../../../../../service/stringConverter/symbolStyle';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/symbolStyle.ts', () => {
    suite('SymbolStyleConverter', () => {
        const parser = new SymbolStyleConverter();
        
        suite('match()', () => {
            test('should return false for non-symbol types', () => {
                const tokenInfo: TokenInfo = {
                    type: 'number',
                    text: '123',
                    originText: '123'
                };
                assert.strictEqual(parser.match(tokenInfo).matched, false);
            });
            
            test('should match PascalCase strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'PascalCaseExample',
                    originText: 'PascalCaseExample'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.includes('pascal_case_example'));
            });
            
            test('should match camelCase strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'camelCaseExample',
                    originText: 'camelCaseExample'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.includes('camel_case_example'));
            });
            
            test('should match snake_case strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'snake_case_example',
                    originText: 'snake_case_example'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.includes('SnakeCaseExample'));
            });
            
            test('should match SNAKE_CASE strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'SNAKE_CASE_EXAMPLE',
                    originText: 'SNAKE_CASE_EXAMPLE'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.includes('snake_case_example'));
            });
            
            test('should match strings with numbers', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'Test123Number',
                    originText: 'Test123Number'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.includes('test123_number'));
            });
            
            test('should match Rust macro symbols', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'TestMacro!',
                    originText: 'TestMacro!'
                };
                const result = parser.match(tokenInfo);
                assert.strictEqual(result.matched, true);
                assert.ok(result.byProduct?.some(r => r.endsWith('!')));
            });
        });
        
        suite('convert()', () => {
            test('should convert PascalCase to other formats', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'PascalCaseExample',
                    originText: 'PascalCaseExample'
                };
                const result = parser.convert(tokenInfo);
                assert.strictEqual(result.result.length, 3);
                assert.ok(Array.isArray(result.result));
                assert.ok(result.result.some(r => r.result === 'pascalCaseExample'));
                assert.ok(result.result.some(r => r.result === 'pascal_case_example'));
                assert.ok(result.result.some(r => r.result === 'PASCAL_CASE_EXAMPLE'));
            });
            
            test('should convert camelCase to other formats', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'camelCaseExample',
                    originText: 'camelCaseExample'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(Array.isArray(result.result));
                assert.strictEqual(result.result.length, 3);
                assert.ok(result.result.some(r => r.result === 'CamelCaseExample'));
                assert.ok(result.result.some(r => r.result === 'camel_case_example'));
                assert.ok(result.result.some(r => r.result === 'CAMEL_CASE_EXAMPLE'));
            });
            
            test('should convert snake_case to other formats', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'snake_case_example',
                    originText: 'snake_case_example'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(Array.isArray(result.result));
                assert.strictEqual(result.result.length, 3);
                assert.ok(result.result.some(r => r.result === 'SnakeCaseExample'));
                assert.ok(result.result.some(r => r.result === 'snakeCaseExample'));
                assert.ok(result.result.some(r => r.result === 'SNAKE_CASE_EXAMPLE'));
            });
            
            test('should convert SNAKE_CASE to other formats', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'SNAKE_CASE_EXAMPLE',
                    originText: 'SNAKE_CASE_EXAMPLE'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(Array.isArray(result.result));
                assert.strictEqual(result.result.length, 3);
                assert.ok(result.result.some(r => r.result === 'SnakeCaseExample'));
                assert.ok(result.result.some(r => r.result === 'snakeCaseExample'));
                assert.ok(result.result.some(r => r.result === 'snake_case_example'));
            });
            
            test('should convert strings with numbers', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'Test123Number',
                    originText: 'Test123Number'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(Array.isArray(result.result));
                assert.strictEqual(result.result.length, 3);
                assert.ok(result.result.some(r => r.result === 'test123Number'));
                assert.ok(result.result.some(r => r.result === 'test123_number'));
                assert.ok(result.result.some(r => r.result === 'TEST123_NUMBER'));
            });
            
            test('should convert Rust macro symbols', () => {
                const tokenInfo: TokenInfo = {
                    type: 'symbol',
                    text: 'TestMacro!',
                    originText: 'TestMacro!'
                };
                const result = parser.convert(tokenInfo);
                assert.strictEqual(result.result.length, 3);
                assert.ok(Array.isArray(result.result));
                assert.ok(result.result.every(r => r.result.endsWith('!')));
            });
        });
    });
});