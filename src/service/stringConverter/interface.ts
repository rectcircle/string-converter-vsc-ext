import { TokenInfo } from "../codeParser";


export interface StringConverterMeta {
    id: string;
    name: string;
    resultLanguageId: string;
}

export interface StringConverterOptions {
}

export interface StringConverter {
    meta: StringConverterMeta;
    
    match(tokenInfo: TokenInfo, options?: StringConverterOptions): boolean;
    
    convert(tokenInfo: TokenInfo, options?: StringConverterOptions): string;
}

