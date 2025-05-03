import { parseTypeScriptStringLiteral as parseTypeScriptStringLiteral } from './typescript';
import { parseJSONStringLiteral } from './json';
import { parseGoStringLiteral } from './go';

type StringLiteralParser = (originText: string, type: string) => string;

const parsers: Record<string, StringLiteralParser> = {};

export function registerLiteralParser(languageId: string, parser: StringLiteralParser) {
    parsers[languageId] = parser;
}

export function parseLiteral(languageId: string, originText: string, type: string): string {
    if (type !== 'string' && type !== 'template-string') {
        return originText;
    }
    
    const parser = parsers[languageId];
    return parser ? parser(originText, type) : originText;
}

// 注册TypeScript/JavaScript解析器
registerLiteralParser('typescript', parseTypeScriptStringLiteral);
registerLiteralParser('javascript', parseTypeScriptStringLiteral);

// 注册JSON解析器
registerLiteralParser('json', parseJSONStringLiteral);

// 注册Go解析器
registerLiteralParser('go', parseGoStringLiteral);
