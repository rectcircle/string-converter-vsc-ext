import { TokenInfo } from "../codeParser";


export interface StringConverterMeta {
    id: string;
    name: string;
    resultLanguageId: string;
    specInfo?: {
        // 规范名称
        name: string;
        // 规范 URL
        url?: string;
        // 规范描述， Markdown 格式
        description?: string;
        // 参考链接
        referenceLinks?: {
            title: string;
            url: string;
        }[];
    }
}

export interface StringConverterOptions {
}

export interface StringConverterMatchResult<T = unknown> {
    // 是否匹配成功
    matched: boolean;
    // match 执行的中间产物，用于后续的 convert 执行
    byProduct?: T;
}

export interface StringConverterConvertResult {
    result: string;  
    explain?: string;
    error?: string;
}

export interface StringConverter<T = unknown> {
    meta: StringConverterMeta;
    
    match(tokenInfo: TokenInfo, options?: StringConverterOptions): StringConverterMatchResult<T>;
    
    convert(tokenInfo: TokenInfo, byproductOfMatch?: T, options?: StringConverterOptions): StringConverterConvertResult;
}

