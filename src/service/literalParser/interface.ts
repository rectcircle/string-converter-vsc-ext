
export function isStringToken(type: string): boolean {
    return type === 'string' || 
        type === 'template-string' ||
        type === 'triple-quoted-string';
}

export function isNumberToken(type: string): boolean {
    return type === 'number';
}

export function isUnknownToken(type: string): boolean {
    return type === 'unknown';
}

export interface StringLiteralParseResult {
    text: string;
    startMarker?: string, 
    endMarker?: string,
}

export type StringLiteralParser = (originText: string, type: string) => StringLiteralParseResult;
