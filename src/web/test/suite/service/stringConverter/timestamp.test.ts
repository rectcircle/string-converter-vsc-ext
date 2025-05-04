import assert from 'assert';
import { TimestampParser } from '../../../../../service/stringConverter/timestamp';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/timestamp.ts', () => {
    const parser = new TimestampParser();
    
    suite('match()', () => {
        test('应该匹配秒级时间戳', () => {
            const now = Math.floor(Date.now() / 1000);
            const result = parser.match({ originText: now.toString(), text: now.toString(), type: 'number' });
            assert.strictEqual(result.matched, true);
            assert.strictEqual(result.byProduct?.unit, 's');
        });

        test('应该匹配毫秒级时间戳', () => {
            const now = Date.now();
            const result = parser.match({ originText: now.toString(), text: now.toString(), type: 'number' });
            assert.strictEqual(result.matched, true);
            assert.strictEqual(result.byProduct?.unit, 'ms');
        });

        test('不应该匹配无效时间戳', () => {
            const result = parser.match({ originText: '"invalid"', text: 'invalid', type: 'string' });
            assert.strictEqual(result.matched, false);
        });
    });

    suite('convert()', () => {
        test('应该正确转换秒级时间戳', () => {
            const now = Math.floor(Date.now() / 1000);
            const result = parser.convert(
                { originText: now.toString(), text: now.toString(), type: 'number' },
                { timestamp: now, unit: 's' }
            );
            assert.strictEqual(typeof result.result, 'string');
            assert(result.explain?.includes('second'));
        });

        test('应该正确转换毫秒级时间戳', () => {
            const now = Date.now();
            const result = parser.convert(
                { originText: now.toString(), text: now.toString(), type: 'number' },
                { timestamp: now, unit: 'ms' }
            );
            assert.strictEqual(typeof result.result, 'string');
            assert(result.explain?.includes('millisecond'));
        });
    });
});