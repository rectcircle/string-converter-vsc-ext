import { TokenInfo } from "../codeParser";
import { isStringToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterMatchOptions } from "./interface";

export class StringLiteralConverter implements StringConverter {
    meta: StringConverterMeta = {
        id: "string-literal",
        name: "Resolve the String Literal Escapes",
        resultLanguageId: "plaintext",
    };

    match(tokenInfo: TokenInfo, options?: StringConverterMatchOptions): StringConverterMatchResult {
        if (!isStringToken(tokenInfo.type)) {
            return { matched: false };
        }
        if (tokenInfo.startMarker !== undefined && tokenInfo.endMarker!== undefined) {
            return {
                matched: tokenInfo.startMarker + tokenInfo.text + tokenInfo.endMarker !== tokenInfo.originText,
            };
        }
        // 兜底逻辑
        return {
            matched: !tokenInfo.originText.includes(tokenInfo.text),
        };
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: null, options?: StringConverterMatchOptions): StringConverterConvertResult {
        return {
            result: tokenInfo.text,
        };
    }
}