import { TokenInfo } from "../codeParser";
import { isStringToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterOptions } from "./interface";
import chardet from 'chardet';
import iconv from 'iconv-lite';
import { filetypeinfo } from 'magic-bytes.js';
import { hexy } from 'hexy';

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
        if (!isStringToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
            return { matched: false };
        }
        let text = tokenInfo.text;
        if (isUnknownToken(tokenInfo.type)) {
            text = text.trim();
        }
        // 判断 base64 格式
        if (!text.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/)) {
            return { matched: false };
        }
        // 判断是否是纯数字，直接返回，避免误判。
        if (text.match(/^\d+$/)) {
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
        if (!isStringToken(tokenInfo.type)) {
            return { matched: false };
        }
        // 判断是否是纯数字，直接返回，避免误判。
        if (tokenInfo.text.match(/^\d+$/)) {
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