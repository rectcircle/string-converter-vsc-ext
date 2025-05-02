export function parseTypeScriptLiteral(originText: string, type: string): string {
    if (!originText) return originText;

    // 检查是否是字符串字面量
    if (type!=='string' && type!== 'template-string') {
        return originText;
    }
    
    const quoteChar = originText[0];
    if (quoteChar !== '"' && quoteChar !== "'" && quoteChar !== '`') {
        return originText;
    }
    
    // 检查是否匹配的引号
    if (originText[originText.length - 1] !== quoteChar) {
        return originText;
    }
    
    // 移除引号
    const content = originText.slice(1, -1);
    const result: string[] = [];
    let i = 0;
    
    while (i < content.length) {
        const char = content[i];
        
        if (char === '\\') {
            // 处理转义字符
            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Grammar_and_types#%E5%AD%97%E9%9D%A2%E9%87%8F
            // 检查是否到达字符串末尾
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }
            // 处理八进制转义序列
            if (i+3 < content.length) {
                const octal = content.slice(i + 1, i + 4);
                if (/^[0-7]{3}$/.test(octal)) {
                    const charCode = parseInt(octal, 8);
                    if (charCode >= 0 && charCode <= 255) {
                        result.push(String.fromCharCode(charCode));
                        i += 4;
                        continue;
                    }
                }
            }
            // 其他场景
            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case "'":
                case '`':
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case '0':
                    result.push('\0');
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
                case 'u':
                    if (i + 5 < content.length) {
                        const hex = content.slice(i + 2, i + 6);
                        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 6;
                            break;
                        }
                    }
                    if (i + 7 < content.length && content[i + 2] === '{' && content[i + 7] === '}') {
                        const unicode = content.slice(i + 3, i + 7);
                        if (/^[0-9a-fA-F]{4}$/.test(unicode)) {
                            result.push(String.fromCharCode(parseInt(unicode, 16)));
                            i += 8;
                            break;
                        }
                    }
                    // 如果不符合Unicode转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                case 'x':
                    if (i + 3 < content.length) {
                        const hex = content.slice(i + 2, i + 4);
                        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 4;
                            break;
                        }
                    }
                    // 如果不符合十六进制转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                default:
                    // 如果不是合法转义字符，按照规范，忽略这个转义字符
                    i++;
            }
        } else {
            result.push(char);
            i++;
        }
    }
    return result.join('');
}
