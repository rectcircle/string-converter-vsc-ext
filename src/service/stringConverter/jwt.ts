import { TokenInfo } from "../codeParser";
import { StringConverter, StringConverterMeta, StringConverterOptions } from "./interface";
import { jwtDecode } from "jwt-decode";

export class JwtParser implements StringConverter {
    meta: StringConverterMeta = {
        id: "jwt-parser",
        name: "Parse the JWT String",
        resultLanguageId: "json"
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): boolean {
        if (tokenInfo.type !== "string" && tokenInfo.type !== "template-string") {
            return false;
        }
        try {
            jwtDecode(tokenInfo.text);
            return true;
        } catch (error) {
            return false;
        }
    }

    convert(tokenInfo: TokenInfo, options?: StringConverterOptions): string {
        const header = jwtDecode(tokenInfo.text, { header: true });
        const payload = jwtDecode(tokenInfo.text);
        return JSON.stringify({
            header,
            payload
        }, null, 2);
    }
}