import { StringLiteralParseResult } from "./interface";

export function parseRustStringLiteral(originText: string, type: string): StringLiteralParseResult {
    if (!originText) {
        return { text: originText };
    }

    // 检查是否是字符串字面量
    if (type !== 'string') {
        return { text: originText };
    }

    // 检查是否是原生字符串
    let rawMarkers = parseRawStringMarker(originText);
    if (rawMarkers !== undefined) {
        return { text: parseRawString(originText), ...rawMarkers };
    }
    // 处理转义字符
    if (originText.startsWith('"') && originText.endsWith('"')) {
        return { text: parseEscapedString(originText), startMarker: '"', endMarker: '"' };
    }
    // 处理字节字符串
    if (originText.startsWith('b"') && originText.endsWith('"')) {
        return { text: parseEscapedByteString(originText), startMarker: 'b"', endMarker: '"' };
    }
    // 有问题的字符串
    return { text: originText };
}

export function parseRawStringMarker(text: string): {
    startMarker: string;
    endMarker: string;
} | undefined {
    if (text.startsWith('r') || text.startsWith('br')) {
        const startMarkerLen = text.indexOf('"') + 1;
        if (startMarkerLen <= 0) {
            return undefined;
        }
        const startMarker = text.substring(0, startMarkerLen);
        const endMarker = text.substring(
            text.length - startMarkerLen + (startMarker.startsWith('br') ? 2 : 1)
        );
        return {startMarker, endMarker};
    }
    return undefined;
}

function parseRawString(originText: string): string {
    const markers = parseRawStringMarker(originText);
    if (!markers) {
        return originText;
    }
    const {startMarker, endMarker} = markers;
    return originText.slice(startMarker.length, originText.length - endMarker.length);
}

function parseEscapedString(originText: string): string {
    // 移除引号
    const content = originText.slice(1, -1);
    const result: string[] = [];
    let i = 0;

    while (i < content.length) {
        const char = content[i];
        
        if (char === '\\') {
            // 处理转义字符
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }
            
            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case '\'':
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case 'n':
                    result.push('\n');
                    i += 2;
                    break;
                case 'r':
                    result.push('\r');
                    i += 2;
                    break;
                case 't':
                    result.push('\t');
                    i += 2;
                    break;
                case '0':
                    result.push('\0');
                    i += 2;
                    break;
                case 'x':
                    // 处理7-bit码点转义 \xHH
                    if (i + 3 < content.length) {
                        const hex = content.slice(i + 2, i + 4);
                        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
                            const charCode = parseInt(hex, 16);
                            if (charCode <= 0x7F) {
                                result.push(String.fromCharCode(charCode));
                                i += 4;
                                break;
                            }
                        }
                    }
                    result.push(char);
                    i++;
                    break;
                case 'u':
                    // 处理Unicode转义 \u{...}
                    if (i + 3 < content.length && content[i + 2] === '{') {
                        const endBrace = content.indexOf('}', i + 3);
                        if (endBrace !== -1) {
                            const hex = content.slice(i + 3, endBrace);
                            if (/^[0-9a-fA-F]{1,6}$/.test(hex)) {
                                const charCode = parseInt(hex, 16);
                                if (charCode <= 0x10FFFF) {
                                    result.push(String.fromCharCode(charCode));
                                    i = endBrace + 1;
                                    break;
                                }
                            }
                        }
                    }
                    result.push(char);
                    i++;
                    break;
                default:
                    // 非法转义字符，忽略反斜线
                    i++;
            }
        } else {
            result.push(char);
            i++;
        }
    }
    
    return result.join('');
}

function parseEscapedByteString(originText: string): string {
    // 移除引号
    const content = originText.slice(2, -1);
    // TODO 探测编码，现在不知道其编码情况，先原样返回。
    return content;
}
