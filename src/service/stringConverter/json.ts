import { TokenInfo } from "../codeParser";
import { isStringToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterMatchOptions } from "./interface";

export class JsonParser implements StringConverter<any> {
    meta: StringConverterMeta = {
        id: "json-formater",
        name: "Format JSON String",
        resultLanguageId: "json",
        specInfo: {
            name: "JSON",
            url: "https://www.json.org/json-en.html",
            description: "JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate.",
            referenceLinks: [
                {
                    title: "Introducing JSON",
                    url: "https://www.json.org/json-en.html"
                }
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterMatchOptions): StringConverterMatchResult<any> {
        if (!isStringToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
            return { matched: false };
        }
        const textTrimStart = tokenInfo.text.trimStart();
        if (!textTrimStart.startsWith('{') && !textTrimStart.startsWith('[')) {
            return { matched: false };
        }
        try {
            const jsonObj = JSON.parse(tokenInfo.text);
            return {
                matched: true,
                byProduct: jsonObj
            };
        } catch (error) {
            return { matched: false };
        }
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: any, options?: StringConverterMatchOptions): StringConverterConvertResult {
        const jsonObj = byproductOfMatch || JSON.parse(tokenInfo.text);
        return {
            result: JSON.stringify(jsonObj, null, 2),
            explain: "- Formatted JSON string with 2-space indentation."
        };
    }
}