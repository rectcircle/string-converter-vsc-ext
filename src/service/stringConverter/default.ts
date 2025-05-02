import { TokenInfo } from "../codeParser";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterOptions } from "./interface";

export class DefaultConverter implements StringConverter {
    meta: StringConverterMeta = {
        id: "default-converter",
        name: "Resolve the String Literal Escapes",
        resultLanguageId: "plaintext",
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult {
        if (tokenInfo.type!== "string" && tokenInfo.type!== "template-string") {
            return { matched: false };
        }
        return {
            matched: !tokenInfo.originText.includes(tokenInfo.text),
        };
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: null, options?: StringConverterOptions): StringConverterConvertResult {
        return {
            result: tokenInfo.text,
        };
    }
}