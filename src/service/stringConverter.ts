import { TokenInfo } from "./codeParser";
import { DefaultConverter } from "./stringConverter/default";
import { StringConverter, StringConverterConvertResult, StringConverterMeta, StringConverterOptions } from "./stringConverter/interface";
import { JwtParser } from "./stringConverter/jwt";
import { TimestampParser } from "./stringConverter/timestamp";

export interface MatchResult {
    meta: StringConverterMeta;
    byProduct?: any;
}

class StringConverterManager {
    private converters: StringConverter<any>[] = [];

    register(converter: StringConverter): void {
        this.converters.push(converter);
    }

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): MatchResult[] {
        return this.converters
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
        options?: StringConverterOptions
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
stringConverterManager.register(new JwtParser());
stringConverterManager.register(new TimestampParser());

stringConverterManager.register(new DefaultConverter());
