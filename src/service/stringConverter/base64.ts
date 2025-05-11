import { TokenInfo } from "../codeParser";
import { isStringToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterOptions } from "./interface";
import chardet from 'chardet';
import iconv from 'iconv-lite';
import { filetypeinfo } from 'magic-bytes.js';
import { hexy } from 'hexy';
import spelling from 'spelling';
import enDictData from 'spelling/dictionaries/en_US';

const enDictSpelling = spelling(enDictData);

interface Base64MatchResult {
    buffer: Uint8Array;
    encoding: string;
}

function base64ToArrayBuffer(base64: string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper functions for word splitting
function isLowerCase(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 97 && charCode <= 122; // 'a' to 'z'
}

function isUpperCase(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 65 && charCode <= 90; // 'A' to 'Z'
}

// Splits a string by camelCase and PascalCase.
// e.g., "camelCaseString" -> ["camel", "Case", "String"]
// e.g., "HTTPRequestHandler" -> ["HTTP", "Request", "Handler"]
function splitCase(s: string): string[] {
    const words: string[] = [];
    if (!s) {
        return words;
    }
    let wordStart = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        const nextChar = s[i + 1];

        // Split before an uppercase letter if it's preceded by a lowercase letter
        if (i > wordStart && isUpperCase(char) && s[i-1] && isLowerCase(s[i-1])) {
            words.push(s.substring(wordStart, i));
            wordStart = i;
        } 
        // Split before an uppercase letter if it's part of a sequence like 'AAa' (e.g. HTTPServer -> HTTP, Server)
        // This means current char is Upper, previous is Upper, next is Lower
        else if (i > wordStart && isUpperCase(char) && nextChar && isLowerCase(nextChar) && s[i-1] && isUpperCase(s[i-1])) {
            words.push(s.substring(wordStart, i));
            wordStart = i;
        }
    }
    words.push(s.substring(wordStart));
    return words.filter(w => w.length > 0);
}

// 快速判断是否是 base64 格式，如果不是，则直接返回 false。返回 true 也不一定是 base64。
function quickExcludeBase64(tokenInfo: TokenInfo) {
    if (!isStringToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
        return false;
    }
    let text = tokenInfo.text;
    if (isUnknownToken(tokenInfo.type)) {
        text = text.trim();
    }

    if (text.length === 0) {
        return false;
    }

    // 判断 base64 格式
    if (!text.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/)) {
        return false;
    }
    // 判断是否是纯数字，直接返回，避免误判。
    if (text.match(/^\d+$/)) {
        return false;
    }

    // 常见的标识符类型
    // 英文单词，不应该被识别为 base64。
    // For text < 256 chars, split by case and underscore, check parts.
    if (text.length < 256) {
        const words = splitCase(text);
        for (const word of words) {
            if (word.length < 4) {
                // 特殊处理，短单词，不应该被识别为 base64，防止误排除。
                continue;
            }
            // 如果单词以连续数字结尾，去除数字再去判断
            const wordWithoutDigits = word.replace(/\d+$/, '');
            // `word` is already lowercased and length-filtered by splitByCaseAndUnderscore
            const lookupResult = enDictSpelling.lookup(wordWithoutDigits, {suggest: false});
            if (lookupResult.found) {
                return false; // Found a valid English word part
            }
        }
    }

    return true;
}

export class Base64StringParser implements StringConverter<Base64MatchResult> {
    meta: StringConverterMeta = {
        id: "base64-parser-string",
        name: "Parse Base64 (String)",
        resultLanguageId: "plaintext",
        specInfo: {
            name: "Base64",
            url: "https://datatracker.ietf.org/doc/html/rfc4648",
            description: "Base64 is a group of binary-to-text encoding schemes that represent binary data in an ASCII string format by translating it into a radix-64 representation.",
            referenceLinks: [
                {
                    title: "RFC 4648 - The Base16, Base32, and Base64 Data Encodings",
                    url: "https://datatracker.ietf.org/doc/html/rfc4648"
                }
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult<Base64MatchResult> {
        let text = tokenInfo.text;
        if (quickExcludeBase64(tokenInfo) === false) {
            return { matched: false };
        }

        try {
            // Basic Base64 validation
            const buffer = base64ToArrayBuffer(text);
            // 猜测二进制文件类型，如果是二进制文件，不处理。
            const detectedBins = filetypeinfo(buffer);
            if (detectedBins.length > 0) {
                return { matched: false };
            }
            // 推测文本编码，中文优先级更高
            const detecteds = chardet.analyse(buffer).sort((a, b) => b.confidence - a.confidence);
            if (detecteds.length === 0) {
                return { matched: false };
            }
            let detected = detecteds[0];
            const gbkDetectedArr = detecteds.filter(d => d.name === 'GB18030');
            const gbkDetected = gbkDetectedArr.length > 0 ? gbkDetectedArr[0] : undefined;
            if (gbkDetected && gbkDetected.confidence === detected.confidence) {
                detected = gbkDetected;
            }
            if (detected) {
                return {
                    matched: true,
                    byProduct: {
                        buffer,
                        encoding: detected.name,
                    }
                };
            }
            return { matched: false };
        } catch (error) {
            return { matched: false };
        }
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: Base64MatchResult, options?: StringConverterOptions): StringConverterConvertResult {
        byproductOfMatch = byproductOfMatch || this.match(tokenInfo).byProduct;

        if (!byproductOfMatch) {
            return {
                error: "Invalid Base64 format",
                result: tokenInfo.text,
            };
        }

        const decodedString = iconv.decode(byproductOfMatch.buffer, byproductOfMatch.encoding);

        return {
            result: decodedString,
            explain: `- Detect encoding format: \`${byproductOfMatch.encoding}\``
        };
    }
}

export class Base64BinaryParser implements StringConverter<Base64MatchResult> {
    meta: StringConverterMeta = {
        id: "base64-parser-binary",
        name: "Parse Base64 (Binary)",
        resultLanguageId: "plaintext",
        specInfo: {
            name: "Base64",
            url: "https://datatracker.ietf.org/doc/html/rfc4648",
            description: "Base64 is a group of binary-to-text encoding schemes that represent binary data in an ASCII string format by translating it into a radix-64 representation.",
            referenceLinks: [
                {
                    title: "RFC 4648 - The Base16, Base32, and Base64 Data Encodings",
                    url: "https://datatracker.ietf.org/doc/html/rfc4648"
                }
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult<Base64MatchResult> {
        if (quickExcludeBase64(tokenInfo) === false) {
            return { matched: false };
        }
        
        try {
            // Basic Base64 validation
            const buffer = base64ToArrayBuffer(tokenInfo.text);
            // 非二进制忽略。
            const detectedBins = filetypeinfo(buffer);
            if (detectedBins.length === 0) {
                return { matched: false };
            }
            // 二进制。
            return {
                matched: true,
                byProduct: {
                    buffer,
                    encoding: detectedBins[0].typename,
                }
            };
        } catch (error) {
            return { matched: false };
        }
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: Base64MatchResult, options?: StringConverterOptions): StringConverterConvertResult {
        byproductOfMatch = byproductOfMatch || this.match(tokenInfo).byProduct;

        if (!byproductOfMatch) {
            return {
                error: "Invalid Base64 format",
                result: tokenInfo.text,
            };
        }

        // TODO: 图片等二进制直接用 markdown 格式展示出来。
        const result = hexy(Array.from(byproductOfMatch.buffer));

        return {
            result: result,
            explain: `- Detect encoding format: \`${byproductOfMatch.encoding}\``
        };
    }
}