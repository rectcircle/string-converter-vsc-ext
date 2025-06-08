import { TokenInfo } from "./codeParser";
import { Base64BinaryParser, Base64StringParser } from "./stringConverter/base64";
import { StringLiteralConverter } from "./stringConverter/stringLiteral";
import { StringConverter, StringConverterConvertResult, StringConverterMeta, StringConverterMatchOptions, StringConverterTriggerSource } from "./stringConverter/interface";
import { JsonParser } from "./stringConverter/json";
import { JwtParser } from "./stringConverter/jwt";
import { SymbolStyleConverter } from "./stringConverter/symbolStyle";
import { TimestampParser } from "./stringConverter/timestamp";
import { UrlParser } from "./stringConverter/url";

export interface MatchResult {
    meta: StringConverterMeta;
    byProduct?: any;
}

class StringConverterManager {
    private converters: StringConverter<any>[] = [];
    private converterSupportTiggerSources: {
        [key in string]: StringConverterTriggerSource[];
    } = {};

    register(converter: StringConverter, supportTriggerSources?: StringConverterTriggerSource[] ): void {
        this.converters.push(converter);
        this.converterSupportTiggerSources[converter.meta.id] = supportTriggerSources || ['*'];
    }

    setSupportTriggerSources(converterId: string, supportTriggerSources: StringConverterTriggerSource[]): void {
        this.converterSupportTiggerSources[converterId] = supportTriggerSources;
    }

    match(tokenInfo: TokenInfo, options?: StringConverterMatchOptions): MatchResult[] {
        return this.converters
            .filter(converter => {
                if (!options) {
                    return true;
                }
                if (!options.triggerSource) {
                    return true;
                }
                const supportTriggerSources = this.converterSupportTiggerSources[converter.meta.id];
                if (!supportTriggerSources) {
                    return true;
                }
                return supportTriggerSources.includes(options.triggerSource) || supportTriggerSources.includes('*');
            })
            .map(converter => {
                return {
                    matchResult: converter.match(tokenInfo, options),
                    meta: converter.meta,
                };
            })
            .filter(converter => converter.matchResult.matched)
            .map(converter => {
                return {
                    meta: converter.meta,
                    byProduct: converter.matchResult.byProduct,
                };
            });
    }

    convert(
        tokenInfo: TokenInfo, 
        matchResult: MatchResult, 
        options?: StringConverterMatchOptions
    ): StringConverterConvertResult {
        const converter = this.converters.find(c => c.meta.id === matchResult.meta.id);
        if (!converter) {
            throw new Error(`Converter with id ${matchResult.meta.id} not found`);
        }
        return converter.convert(tokenInfo, matchResult.byProduct, options);
    }
}

export const stringConverterManager = new StringConverterManager();

// 注册转换器
stringConverterManager.register(new JwtParser(), ['hover']);
stringConverterManager.register(new TimestampParser(), ['hover']);
stringConverterManager.register(new Base64StringParser(), ['codeAction']);
stringConverterManager.register(new Base64BinaryParser(), ['codeAction']);
stringConverterManager.register(new UrlParser(), ['hover']);
stringConverterManager.register(new JsonParser(), ['hover']);
stringConverterManager.register(new StringLiteralConverter(), ['hover']);
stringConverterManager.register(new SymbolStyleConverter(), ['codeAction']);
