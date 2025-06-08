import { TokenInfo } from "../codeParser";
import { isStringToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterMatchOptions } from "./interface";

interface URLMatchByProduct {
    decodedString: string;
    url?: URL;
}

export class UrlParser implements StringConverter<URLMatchByProduct> {
    meta: StringConverterMeta = {
        id: "url-parser",
        name: "Parse URL String",
        resultLanguageId: "plaintext",
        specInfo: {
            name: "URL",
            url: "https://datatracker.ietf.org/doc/html/rfc1738",
            description: "URL (Uniform Resource Locator) is essentially the address used to access resources on the internet. It's what you type into your web browser to visit a specific webpage or resource. A URL typically has the following structure: `protocol://domain_name/path?query_string#fragment`",
            referenceLinks: [
                {
                    title: "RFC 1738 - Uniform Resource Locators (URL)",
                    url: "https://datatracker.ietf.org/doc/html/rfc1738"
                }
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterMatchOptions): StringConverterMatchResult<URLMatchByProduct> {
        if (!isStringToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
            return { matched: false };
        }

        const parseURL = (str: string) => {
            try {
                return new URL(str);
            } catch (error) {
                return undefined;
            }
        };

        // 如果长度 <= 8k 直接使用 decodeURIComponent 尝试解码，然后比较是否相同的方式进行匹配。
        if (tokenInfo.text.length <= 8192 ) {
            const decodedString = decodeURIComponent(tokenInfo.text);
            if (tokenInfo.text !== decodedString) {
                return { 
                    matched: true,
                    byProduct: {
                        decodedString: decodedString,
                        url: parseURL(tokenInfo.text),
                    }
                 };   
            }
        }

        // 判断是否是 URL 格式字符串，如果是，直接返回。
        const parsedURL = parseURL(tokenInfo.text);
        if (
            parsedURL
        ) {
            return { 
                matched: true,
                byProduct: {
                    decodedString: decodeURIComponent(tokenInfo.text),
                    url: parsedURL,
                }
            };
        }

        // 最后判断字符串包含 %[0-9a-fA-F]{2} 格式的字符串，如果是，返回 true。
        if (tokenInfo.text.match(/%[0-9a-fA-F]{2}/) || (tokenInfo.text.includes('+') && tokenInfo.text.startsWith('?'))) {
            return { 
                matched: true,
                byProduct: {
                    decodedString: decodeURIComponent(tokenInfo.text),
                    url: undefined,
                }
            };
        }
        return { matched: false };
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: URLMatchByProduct, options?: StringConverterMatchOptions): StringConverterConvertResult {
        try {
            // 解码URL编码字符串
            byproductOfMatch = byproductOfMatch || this.match(tokenInfo).byProduct;
            if (!byproductOfMatch) {
                return {
                    error: "Invalid URL encoded format",
                    result: tokenInfo.text
                };
            }

            // 解释字段
            let explainList: string[] = [];

            if (byproductOfMatch.url) {
                // 如果是 url
                let scheme = byproductOfMatch.url.protocol;
                if (scheme.endsWith(':')) {
                    scheme = scheme.slice(0, -1);
                }
                explainList.push(`- scheme: \`${scheme}\``);
                explainList.push(`- host: \`${byproductOfMatch.url.host}\``);
                explainList.push(`- path: \`${byproductOfMatch.url.pathname}\``);
                let decodedPath = decodeURIComponent(byproductOfMatch.url.pathname);
                if (decodedPath !== byproductOfMatch.url.pathname) {
                    explainList.push(`- decoded path: \`${decodedPath}\``);
                }
                if (byproductOfMatch.url.searchParams.size > 0) {
                    explainList.push(`- query params:`);
                    byproductOfMatch.url.searchParams.forEach((value, key) => {
                        explainList.push(`    - \`${key}\`: \`${value}\``);
                    });
                }
            } else {
                // 如果是query参数格式，解析并展示参数
                if (tokenInfo.text.includes('?') || tokenInfo.text.includes('=')) {
                    let queryStr = tokenInfo.text;
                    const queryStart = tokenInfo.text.indexOf('?');
                    if (queryStart > -1) {
                        queryStr = tokenInfo.text.slice(queryStart + 1);
                    }
                    const params = new URLSearchParams(queryStr);
                    explainList.push(`- params:`);
                    explainList.push("");
                    params.forEach((value, key) => {
                        explainList.push(`    - \`${key}\`: \`${value}\``);
                    });
                }
            }
                          
            
            return {
                result: byproductOfMatch.decodedString,
                explain: explainList.join('\n'),
            };
        } catch (error) {
            return {
                error: "Invalid URL encoded format",
                result: tokenInfo.text
            };
        }
    }
}