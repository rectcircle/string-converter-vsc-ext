import { TokenInfo } from "../codeParser";
import { StringConverter, StringConverterMeta, StringConverterOptions } from "./interface";

export class DefaultConverter implements StringConverter {
    meta: StringConverterMeta = {
        id: "default-converter",
        name: "Resolve the String Literal Escapes",
        resultLanguageId: "plaintext"
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): boolean {
        if (tokenInfo.type!== "string" && tokenInfo.type!== "template-string") {
            return false;
        }
        return !tokenInfo.originText.includes(tokenInfo.text);
    }

    convert(tokenInfo: TokenInfo, options?: StringConverterOptions): string {
        return tokenInfo.text;
    }
}