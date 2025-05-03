import { isStringToken, StringLiteralParseResult } from "./interface";

export function parseJSONStringLiteral(originText: string, type: string): StringLiteralParseResult {
    if (!originText) {
        return { text: originText };
    }

    // 检查是否是字符串字面量
    if (!isStringToken(type)) {
        return { text: originText };
    }
    
    try {
        // 使用JSON.parse解析字符串
        return { text: JSON.parse(originText), startMarker: '"', endMarker: '"'};
    } catch {
        // 解析失败返回原字符串
        return { text: originText };
    }
}