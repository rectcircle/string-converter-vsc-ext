import { isStringToken, StringLiteralParseResult } from "./interface";

export function parseJavaStringLiteral(originText: string, type: string): StringLiteralParseResult {
    if (!originText) {
        return { text: originText };
    }

    // Java支持双引号字符串和Text Blocks(Java 15+)
    if (!isStringToken(type)) {
        return { text: originText };
    }
    if (originText.length < 2) {
        return { text: originText };
    }
    
    // 检查是否是Text Block(三引号)
    const isTextBlock = originText.startsWith('"""') && originText.endsWith('"""');
    const quoteChar = isTextBlock? '"""' : '"';
    
    // 检查引号是否匹配
    if (isTextBlock) {
        if (originText.length < 6 || !originText.endsWith('"""')) {
            return { text: originText };
        }
    } else if (originText[0] !== '"' || originText[originText.length - 1] !== '"') {
        return { text: originText };
    }

    // 移除引号
    let content = isTextBlock ? 
        (
            originText[3] === '\n'? // 如果第一行以换行符开头，则去除换行符
                originText.slice(4, -3) :
                originText.slice(3, -3)
        ) : 
        originText.slice(1, -1);
    const result: string[] = [];
    
    // 如果是Text Block，处理多行字符串和缩进
    if (isTextBlock) {
        const lines = content.split('\n');
        // 计算最小缩进
        let minIndent = Infinity;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().length === 0) { 
                continue; 
            }
            const indent = (line.match(/^\s*/) as  RegExpMatchArray)[0]?.length;
            if (indent < minIndent) {
                minIndent = indent;
            }
        }
        
        // 去除每行的最小缩进
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length > minIndent) {
                lines[i] = lines[i].substring(minIndent);
            } else {
                lines[i] = '';
            }
        }
        
        // 重新组合内容
        content = lines.join('\n');
    }
    
    let i = 0;

    // 处理转义字符和Unicode转义
    while (i < content.length) {
        const char = content[i];
        
        if (char === '\\') {
            // 处理转义字符
            // https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.6
            // 检查是否到达字符串末尾
            if (i + 1 >= content.length) {
                result.push(char);
                break;
            }
            
            // 处理Unicode转义
            if (i + 5 < content.length && content[i + 1] === 'u') {
                const hex = content.slice(i + 2, i + 6);
                if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                    result.push(String.fromCharCode(parseInt(hex, 16)));
                    i += 6;
                    continue;
                }
            }
            
            // 处理八进制转义序列
            if (i + 3 < content.length) {
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
            
            // 处理其他转义字符
            const nextChar = content[i + 1];
            switch (nextChar) {
                case '"':
                case '\\':
                    result.push(nextChar);
                    i += 2;
                    break;
                case '\n':
                    if (isTextBlock) {
                        // 如果是 Text Block，则忽略这个转义字符和换行符
                        i += 2;
                    } else {
                        result.push(char);
                        i += 1;
                    }
                    break;
                case 'b':
                    result.push('\b');
                    i += 2;
                    break;
                case 't':
                    result.push('\t');
                    i += 2;
                    break;
                case 'n':
                    result.push('\n');
                    i += 2;
                    break;
                case 'f':
                    result.push('\f');
                    i += 2;
                    break;
                case 'r':
                    result.push('\r');
                    i += 2;
                    break;
                case 's':
                    result.push(' ');
                    i += 2;
                    break;
                default:
                    // 如果不是合法转义字符，按照Java规范，保留反斜杠
                    result.push(char);
                    i++;
            }
        } else {
            result.push(char);
            i++;
        }
    }
    return { text: result.join(''), startMarker: quoteChar, endMarker: quoteChar };
}
