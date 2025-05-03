export function parseGoStringLiteral(originText: string, type: string): string {
    if (!originText) {
        return originText;
    }

    // 检查是否是字符串字面量
    if (type !== 'string') {
        return originText;
    }
    
    // Go有两种字符串字面量：解释型字符串(""包裹)和原始字符串(``包裹)
    const isRawString = originText[0] === '`';
    const quoteChar = isRawString ? '`' : '"';
    
    if (originText[0] !== quoteChar || originText[originText.length - 1] !== quoteChar) {
        return originText;
    }
    
    // 移除引号
    const content = originText.slice(1, -1);
    
    // 原始字符串字面量不需要处理转义
    if (isRawString) {
        return content;
    }
    
    // 处理解释型字符串的转义
    const result: string[] = [];
    let i = 0;
    
    while (i < content.length) {
        const char = content[i];
        
        if (char === '\\') {
            // 处理转义字符
            // https://go.dev/ref/spec#Rune_literals
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }
            
            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case 'a':
                    result.push('\a');
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
                case 'x':
                    // 处理十六进制转义
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
                case 'u':
                    // 处理Unicode转义
                    if (i + 5 < content.length) {
                        const hex = content.slice(i + 2, i + 6);
                        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 6;
                            break;
                        }
                    }
                    // 如果不符合Unicode转义格式，则按原样处理
                    result.push(char);
                    i++;
                    break;
                case 'U':
                    // 处理长Unicode转义
                    if (i + 9 < content.length) {
                        const hex = content.slice(i + 2, i + 10);
                        if (/^[0-9a-fA-F]{8}$/.test(hex)) {
                            result.push(String.fromCharCode(parseInt(hex, 16)));
                            i += 10;
                            break;
                        }
                    }
                    // 如果不符合长Unicode转义格式，则按原样处理
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