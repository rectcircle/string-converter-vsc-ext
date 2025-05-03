export function parseJSONStringLiteral(originText: string, type: string): string {
    if (!originText) {
        return originText;
    }

    // 检查是否是字符串字面量
    if (type!=='string' && type!== 'template-string') {
        return originText;
    }
    
    try {
        // 使用JSON.parse解析字符串
        return JSON.parse(originText);
    } catch {
        // 解析失败返回原字符串
        return originText;
    }
}