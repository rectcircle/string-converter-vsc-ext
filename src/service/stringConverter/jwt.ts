import { TokenInfo } from "../codeParser";
import { isStringToken, isUnknownToken } from "../literalParser/interface";
import { StringConverter, StringConverterConvertResult, StringConverterMatchResult, StringConverterMeta, StringConverterOptions } from "./interface";
import { jwtDecode, JwtPayload } from "jwt-decode";
import moment from "moment";

export class JwtParser implements StringConverter<JwtPayload> {
    meta: StringConverterMeta = {
        id: "jwt-parser",
        name: "Parse the JWT String",
        resultLanguageId: "json",
        specInfo: {
            name: "JWT",
            url: "https://datatracker.ietf.org/doc/html/rfc7519",
            description: "JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.",
            referenceLinks: [
                {
                    title: "RFC 7519 - JSON Web Token (JWT)",
                    url: "https://datatracker.ietf.org/doc/html/rfc7519",
                },
                {
                    title: "RFC 7518 - JSON Web Algorithms (JWA)",
                    url: "https://datatracker.ietf.org/doc/html/rfc7518",
                }
            ]
        }
    };

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult<JwtPayload> {
        if (!isStringToken(tokenInfo.type) && !isUnknownToken(tokenInfo.type)) {
            return { matched: false };
        }
        try {
            const jwtPayload = jwtDecode(tokenInfo.text);
            return {
                matched: true,
                byProduct: jwtPayload,
            };
        } catch (error) {
            return { matched: false };
        }
    }

    convert(tokenInfo: TokenInfo, byproductOfMatch?: JwtPayload, options?: StringConverterOptions): StringConverterConvertResult {
        const header = jwtDecode(tokenInfo.text, { header: true });
        const payload = byproductOfMatch || jwtDecode(tokenInfo.text);
        const result = JSON.stringify({
            header,
            payload
        }, null, 2);
        let explainList = [];
        if (header.alg) {
            explainList.push(`- Signature or encryption algorithm ([alg](https://datatracker.ietf.org/doc/html/rfc7518#section-3.1)): \`${header.alg}\`.`);
        }
        if (payload?.exp) {
            let exp = moment.unix(payload.exp);
            let now = moment();
            let expStr =exp.format('YYYY-MM-DDTHH:mm:ssZ');
            explainList.push(`- Expiration time ([exp](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4)): \`${expStr}\`${exp.isBefore(now)? ' (**has expired**)' : ''}.`);
        }
        if (payload?.iss) {
            explainList.push(`- Issuer ([iss](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1)): \`${payload.iss}\`.`);
        }
        if (payload?.sub) {
            explainList.push(`- Subject ([sub](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2)): \`${payload.sub}\`.`);
        }
        if (payload?.nbf) {
            let nbf = moment.unix(payload.nbf);
            let nbfStr = nbf.format('YYYY-MM-DDTHH:mm:ssZ');
            explainList.push(`- Not Before ([nbf](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4)): \`${nbfStr}\`.`);
        }
        if (payload?.iat) {
            let iat = moment.unix(payload.iat);
            let iatStr = iat.format('YYYY-MM-DDTHH:mm:ssZ');
            explainList.push(`- Issued At ([iat](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.6): \`${iatStr}\`.`);
        }
        if (payload?.jti) {
            explainList.push(`- JWT ID ([jti](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7)): \`${payload.jti}\`.`);
        }
        if (payload?.aud) {
            explainList.push(`- Audience ([aud](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3)): \`${payload.aud}\`.`);
        }
        return {
            result: result,
            explain: explainList.join("\n"),
        };
    }
};
