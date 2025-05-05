import assert from 'assert';
import { UrlParser } from '../../../../../service/stringConverter/url';
import { TokenInfo } from '../../../../../service/codeParser';

suite('src/service/stringConverter/url.ts', () => {
    const parser = new UrlParser();
    
    suite('match()', () => {
        test('匹配URL编码字符串', () => {
            const token: TokenInfo = {
                originText: '%E4%BD%A0%E5%A5%BD',
                text: '%E4%BD%A0%E5%A5%BD',
                type: 'string'
            };
            const result = parser.match(token);
            assert.strictEqual(result.matched, true);
            assert.strictEqual(result.byProduct?.decodedString, '你好');
        });

        test('匹配完整URL', () => {
            const token: TokenInfo = {
                originText: 'https://example.com/path?query=%E4%BD%A0%E5%A5%BD',
                text: 'https://example.com/path?query=%E4%BD%A0%E5%A5%BD',
                type: 'string'
            };
            const result = parser.match(token);
            assert.strictEqual(result.matched, true);
            assert.strictEqual(result.byProduct?.url?.host, 'example.com');
        });

        test('匹配查询参数', () => {
            const token: TokenInfo = {
                originText: '?name=%E4%BD%A0%E5%A5%BD',
                text: '?name=%E4%BD%A0%E5%A5%BD',
                type: 'string'
            };
            const result = parser.match(token);
            assert.strictEqual(result.matched, true);
            assert.strictEqual(result.byProduct?.decodedString, '?name=你好');
        });
    });

    suite('convert()', () => {
        test('解码URL编码字符串', () => {
            const token: TokenInfo = {
                originText: '%E4%BD%A0%E5%A5%BD',
                text: '%E4%BD%A0%E5%A5%BD',
                type: 'string'
            };
            const result = parser.convert(token);
            assert.strictEqual(result.result, '你好');
        });

        test('解析URL参数', () => {
            const token: TokenInfo = {
                originText: '"https://example.com/path?name=%E4%BD%A0%E5%A5%BD"',
                text: 'https://example.com/path?name=%E4%BD%A0%E5%A5%BD',
                type: 'string'
            };
            const result = parser.convert(token);
            assert(result.explain?.includes('scheme: `https`'), 'scheme');
            assert(result.explain?.includes('host: `example.com`'), 'host');
            assert(result.explain?.includes('`name`: `你好`'), 'name');
        });
    });
});