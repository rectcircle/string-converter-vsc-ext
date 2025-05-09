import { isStringToken, StringLiteralParseResult } from "./interface";
import { unicodeNameAliasesMap } from "./python";


interface RawStringLiteralResult {
    text: string;
    startMarker: string;
    endMarker: string;
}

function parseRawStringLiteral(content: string): RawStringLiteralResult | undefined {
    // 检查是否以 R" 开头
    if (!content.startsWith('R"')) {
        return undefined;
    }

    let i = 2; // 跳过 R"
    let dCharSeq = '';

    // 读取 d-char-seq（可选）
    while (i < content.length && content[i] !== '(') {
        dCharSeq += content[i];
        i++;
    }

    // 如果没有找到左括号，或者已经到达字符串末尾
    if (i >= content.length || content[i] !== '(') {
        return { text: content, startMarker: '', endMarker: '' };
    }

    const startMarker = 'R"' + dCharSeq + '(';
    const endMarker = ')' + dCharSeq + '"';

    if (content.startsWith(startMarker) && content.endsWith(endMarker)) {
        const text = content.slice(startMarker.length, content.length - endMarker.length);
        return { text, startMarker, endMarker };   
    }

    // 不是合法的原始字符串字面量
    return undefined;
}

function decodeUnicodeEscape(unicode: string, isLongForm: boolean = false): string {
    const charCode = parseInt(unicode, 16);
    if (isLongForm) {
        if (charCode <= 0x10FFFF) {
            return String.fromCodePoint(charCode);
        }
    } else {
        return String.fromCharCode(charCode);
    }
    return '';
}

// https://en.cppreference.com/w/cpp/language/string_literal
export function parseCppStringLiteral(originText: string, type: string): StringLiteralParseResult {
    if (!originText) {
        return { text: originText };
    }

    // 检查是否是字符串字面量
    if (!isStringToken(type)) {
        return { text: originText };
    }

    // 检查字符串前缀
    const prefixMatch = originText.match(/^(u8|[LuU])?R?"/);
    if (!prefixMatch) {
        return { text: originText };
    }

    const prefix = prefixMatch[1] || '';
    const isRawString = originText[prefix.length] === 'R';

    // 如果是原始字符串字面量
    if (isRawString) {
        const content = originText.slice(prefix.length);
        const result = parseRawStringLiteral(content);
        if (!result) {
            return { text: originText };
        }
        return { 
            text: result.text,
            startMarker: prefix + result.startMarker,
            endMarker: result.endMarker
        };
    }

    // 检查前置引号
    const quoteChar = originText[prefix.length];
    if (quoteChar !== '"') {
        return { text: originText };
    }

    // 检查是否匹配的引号
    if (originText[originText.length - 1] !== quoteChar) {
        return { text: originText };
    }

    // 移除引号和前缀
    const content = originText.slice(prefix.length + 1, -1);
    const result: string[] = [];
    let i = 0;

    // https://en.cppreference.com/w/cpp/language/escape
    while (i < content.length) {
        const char = content[i];

        if (char === '\\') {
            // 处理转义字符
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }

            // 处理 C++23 八进制转义序列 (\o{n...})
            if (i + 3 < content.length && content[i + 1] === 'o' && content[i + 2] === '{') {
                let j = i + 3;
                let octalValue = 0;
                let hasDigit = false;

                while (j < content.length && content[j] !== '}') {
                    const digit = content[j];
                    if (digit >= '0' && digit <= '7') {
                        octalValue = octalValue * 8 + (digit.charCodeAt(0) - '0'.charCodeAt(0));
                        hasDigit = true;
                    } else {
                        break;
                    }
                    j++;
                }

                if (hasDigit && j < content.length && content[j] === '}' && octalValue <= 255) {
                    result.push(String.fromCharCode(octalValue));
                    i = j + 1;
                    continue;
                }
            }

            // 处理传统八进制转义序列 (\ooo)
            let octalLength = 0;
            let octalValue = 0;
            // 最多读取3位八进制数
            for (let j = 1; j <= 3 && i + j < content.length; j++) {
                const digit = content[i + j];
                if (digit >= '0' && digit <= '7') {
                    octalValue = octalValue * 8 + (digit.charCodeAt(0) - '0'.charCodeAt(0));
                    octalLength = j;
                } else {
                    break;
                }
            }
            if (octalLength > 0 && octalValue <= 255) {
                result.push(String.fromCharCode(octalValue));
                i += octalLength + 1;
                continue;
            }

            // 处理十六进制转义序列 (\x{n...} 或 \xn...)
            if (i + 2 < content.length && content[i + 1] === 'x') {
                let j = i + 2;
                let hexValue = 0;
                let hasDigit = false;

                // 检查是否是大括号格式
                // C++23 标准
                if (content[j] === '{') {
                    j++;
                    // 读取大括号内的所有十六进制数字
                    while (j < content.length && content[j] !== '}') {
                        const digit = content[j].toLowerCase();
                        if ((digit >= '0' && digit <= '9') || (digit >= 'a' && digit <= 'f')) {
                            hexValue = hexValue * 16 + (digit >= 'a' ? digit.charCodeAt(0) - 87 : digit.charCodeAt(0) - 48);
                            hasDigit = true;
                        } else {
                            break;
                        }
                        j++;
                    }
                    // 检查是否有结束大括号
                    if (hasDigit && j < content.length && content[j] === '}' && hexValue <= 255) {
                        result.push(String.fromCharCode(hexValue));
                        i = j + 1;
                        continue;
                    }
                } else {
                    // 直接读取十六进制数字
                    while (j < content.length) {
                        const digit = content[j].toLowerCase();
                        if ((digit >= '0' && digit <= '9') || (digit >= 'a' && digit <= 'f')) {
                            hexValue = hexValue * 16 + (digit >= 'a' ? digit.charCodeAt(0) - 87 : digit.charCodeAt(0) - 48);
                            hasDigit = true;
                        } else {
                            break;
                        }
                        j++;
                    }
                    if (hasDigit && hexValue <= 255) {
                        result.push(String.fromCharCode(hexValue));
                        i = j;
                        continue;
                    }
                }
            }

            // 处理通用字符名 (\u{n...} 或 \uxxxx)
            if (i + 2 < content.length && content[i + 1] === 'u') {
                // 检查是否是大括号格式
                if (content[i + 2] === '{') {
                    let j = i + 3;
                    let hexValue = 0;
                    let hasDigit = false;

                    // 读取大括号内的所有十六进制数字
                    while (j < content.length && content[j] !== '}') {
                        const digit = content[j].toLowerCase();
                        if ((digit >= '0' && digit <= '9') || (digit >= 'a' && digit <= 'f')) {
                            hexValue = hexValue * 16 + (digit >= 'a' ? digit.charCodeAt(0) - 87 : digit.charCodeAt(0) - 48);
                            hasDigit = true;
                        } else {
                            break;
                        }
                        j++;
                    }

                    // 检查是否有结束大括号和有效的 Unicode 值
                    if (hasDigit && j < content.length && content[j] === '}' && hexValue <= 0x10FFFF) {
                        result.push(String.fromCodePoint(hexValue));
                        i = j + 1;
                        continue;
                    }
                } else if (i + 5 < content.length) {
                    // 处理传统的 \uxxxx 格式
                    const unicode = content.slice(i + 2, i + 6);
                    if (/^[0-9a-fA-F]{4}$/.test(unicode)) {
                        const decoded = decodeUnicodeEscape(unicode);
                        if (decoded) {
                            result.push(decoded);
                            i += 6;
                            continue;
                        }
                    }
                }
            }

            // 处理通用字符名 (\Uxxxxxxxx)
            if (i + 9 < content.length && content[i + 1] === 'U') {
                const unicode = content.slice(i + 2, i + 10);
                if (/^[0-9a-fA-F]{8}$/.test(unicode)) {
                    const decoded = decodeUnicodeEscape(unicode, true);
                    if (decoded) {
                        result.push(decoded);
                        i += 10;
                        continue;
                    }
                }
            }

            // 处理 C++23 Unicode 命名字符转义序列 (\N{NAME})
            if (i + 3 < content.length && content[i + 1] === 'N' && content[i + 2] === '{') {
                let j = i + 3;
                let name = '';
                
                // 读取大括号内的字符名称
                while (j < content.length && content[j] !== '}') {
                    name += content[j];
                    j++;
                }
                
                // 检查是否有结束大括号
                if (j < content.length && content[j] === '}') {
                    // 查找 Unicode 字符名称对应的码点
                    const unicodeCode = unicodeNameAliasesMap[name.toUpperCase()];
                    if (unicodeCode !== undefined) {
                        // 将 Unicode 码点转换为字符
                        if (unicodeCode <= 0xFFFF) {
                            result.push(String.fromCharCode(unicodeCode));
                        } else {
                            result.push(String.fromCodePoint(unicodeCode));
                        }
                        i = j + 1;
                        continue;
                    }
                }
            }

            // 处理其他转义字符
            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case 'a':
                    result.push('\x07'); // 响铃
                    i += 2;
                    break;
                case 'b':
                    result.push('\b');
                    i += 2;
                    break;
                case 'f':
                    result.push('\f');
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
                case 'v':
                    result.push('\v');
                    i += 2;
                    break;
                case '?':
                    result.push('?');
                    i += 2;
                    break;
                default:
                    // 如果不是合法转义字符，保留反斜杠
                    result.push(char);
                    i++;
            }
        } else {
            result.push(char);
            i++;
        }
    }

    return { text: result.join(''), startMarker: prefix+quoteChar, endMarker: quoteChar };
}