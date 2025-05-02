import assert  from 'assert';
import { JwtParser } from '../../../../../service/stringConverter/jwt';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/jwt.ts', () => {
    suite('JwtParser', () => {
        const parser = new JwtParser();
        
        suite('match()', () => {
            test('should return false for non-string types', () => {
                const tokenInfo: TokenInfo = {
                    type: 'number',
                    text: '123',
                    originText: '123'
                };
                assert.strictEqual(parser.match(tokenInfo), false);
            });
            
            test('should return false for invalid JWT strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'invalid.jwt.string',
                    originText: '"invalid.jwt.string"'
                };
                assert.strictEqual(parser.match(tokenInfo), false);
            });
            
            test('should return true for valid JWT strings', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    originText: '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"'
                };
                assert.strictEqual(parser.match(tokenInfo), true);
            });
        });
        
        suite('convert()', () => {
            test('should convert valid JWT to JSON object', () => {
                const tokenInfo: TokenInfo = {
                    type: 'string',
                    text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                    originText: '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"'
                };
                const result = parser.convert(tokenInfo);
                assert.ok(result.includes('"alg": "HS256"'));
                assert.ok(result.includes('"sub": "1234567890"'));
            });
        });
    });
});