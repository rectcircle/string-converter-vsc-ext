import { parseTypeScriptStringLiteral as parseTypeScriptStringLiteral } from './typescript';
import { parseJSONStringLiteral } from './json';
import { parseGoStringLiteral } from './go';
import { parseRustStringLiteral } from './rust';
import { parseJavaStringLiteral } from './java';
import { parsePythonStringLiteral } from './python';
import { parseCppStringLiteral } from './cpp';
import { isStringToken, StringLiteralParser, StringLiteralParseResult } from './interface';

const parsers: Record<string, StringLiteralParser> = {};

export function registerLiteralParser(languageId: string, parser: StringLiteralParser) {
    parsers[languageId] = parser;
}

export function parseLiteral(languageId: string, originText: string, type: string): StringLiteralParseResult {
    if (!isStringToken(type)) {
        return  { text: originText};
    }
    
    const parser = parsers[languageId];
    return parser ? parser(originText, type) : { text: originText};
}

// 注册TypeScript/JavaScript解析器
registerLiteralParser('typescript', parseTypeScriptStringLiteral);
registerLiteralParser('javascript', parseTypeScriptStringLiteral);

// 注册JSON解析器
registerLiteralParser('json', parseJSONStringLiteral);

// 注册Go解析器
registerLiteralParser('go', parseGoStringLiteral);

// 注册Rust解析器
registerLiteralParser('rust', parseRustStringLiteral);

// 注册Java解析器
registerLiteralParser('java', parseJavaStringLiteral);

// 注册Python解析器
registerLiteralParser('python', parsePythonStringLiteral);

// 注册C/C++解析器
registerLiteralParser('cpp', parseCppStringLiteral);
registerLiteralParser('c', parseCppStringLiteral);
