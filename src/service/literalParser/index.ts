import { parseTypeScriptLiteral } from './typescript';

type LiteralParser = (originText: string, type: string) => string;

const parsers: Record<string, LiteralParser> = {};

// 注册TypeScript/JavaScript解析器
registerLiteralParser('typescript', parseTypeScriptLiteral);
registerLiteralParser('javascript', parseTypeScriptLiteral);

export function registerLiteralParser(languageId: string, parser: LiteralParser) {
    parsers[languageId] = parser;
}

export function parseLiteral(languageId: string, originText: string, type: string): string {
    if (type !== 'string' && type !== 'template-string') {
        return originText;
    }
    
    const parser = parsers[languageId];
    return parser ? parser(originText, type) : originText;
}