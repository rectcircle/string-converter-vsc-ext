import { TokenInfo } from "./codeParser";
import { DefaultConverter } from "./stringConverter/default";
import { StringConverter, StringConverterMeta, StringConverterOptions } from "./stringConverter/interface";
import { JwtParser } from "./stringConverter/jwt";

class StringConverterManager {
    private converters: StringConverter[] = [];

    register(converter: StringConverter): void {
        this.converters.push(converter);
    }

    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMeta[] {
        return this.converters
            .filter(converter => converter.match(tokenInfo, options))
            .map(converter => converter.meta);
    }

    convert(
        tokenInfo: TokenInfo, 
        meta: StringConverterMeta, 
        options?: StringConverterOptions
    ): string {
        const converter = this.converters.find(c => c.meta.id === meta.id);
        if (!converter) {
            throw new Error(`Converter with id ${meta.id} not found`);
        }
        return converter.convert(tokenInfo, options);
    }
}

export const stringConverterManager = new StringConverterManager();

// 注册转换器
stringConverterManager.register(new JwtParser());
stringConverterManager.register(new DefaultConverter());
