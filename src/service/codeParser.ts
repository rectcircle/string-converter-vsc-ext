import Prism from 'prismjs';
import { parseLiteral } from './literalParser';
import { parseRawStringMarker } from './literalParser/rust';
import { isStringToken } from './literalParser/interface';

export interface TokenInfo {
    originText: string;
    text: string;
    type: string;
    startMarker?: string;
    endMarker?: string;
}

interface internalTokenInfo extends TokenInfo   {
    startOffset: number,
    endOffset: number,
} 

function getTokenContent(token: Prism.Token | string): string {
    if (typeof token === 'string') {
        return token;
    }
    if (typeof token.content === 'string') {
        return token.content;
    }
    if (Array.isArray(token.content)) {
        return token.content.map(getTokenContent).join('');   
    }
    if (typeof token === 'object') {
        return getTokenContent(token.content);
    }
    return '';
}

function toTokenInfo(tokens: (string | Prism.Token)[], index: number, token: Prism.Token, languageId: string, startOffset: number, endOffset: number) : internalTokenInfo {
    let originText = getTokenContent(token);
    let type = token.type;
    if (type === 'unknown') {
        // 处理 java 某些特殊情况。
        if (languageId === 'java' && index - 1 >= 0 && index + 2 < tokens.length) {
            const prevToken = tokens[index - 1];
            const nextToken = tokens[index + 1];
            const nextNextToken = tokens[index + 2];
            if (typeof prevToken !== 'string' && typeof nextToken !== 'string' && typeof nextNextToken === 'string'
                && prevToken.type === 'string' && nextToken.type === 'string'
                && prevToken.content === '""'
                && nextToken.content === '""'
                && nextNextToken === '"'
            ) {
                originText = '""' + originText + '"""';
                type = 'triple-quoted-string';
                startOffset = startOffset - 2;
                endOffset = endOffset + 3;
            }
        }
    }

    return {
        originText: originText,
        type: type,
        startOffset: startOffset,
        endOffset: endOffset,
        ...parseLiteral(languageId, originText, type),
    };
}

export function extractCodeTokens(
    codeContent: string,
    languageId: string,
    offset: number,  // 包含
    endOffset?: number,  // 不包含
    selectionText?: string
): TokenInfo[] {
    // 检查语言支持
    // 导入 Prism 库
    if (!Prism.languages[languageId]) {
        if (endOffset !== undefined && selectionText) {
            return [{
                originText: selectionText,
                type: 'unknown',
                ...parseLiteral(languageId, selectionText, 'unknown'),
            }];
        }
        return [];
    }
    // 获取token列表
    const tokens = Prism.tokenize(codeContent, Prism.languages[languageId]);
    const tokenInfos: internalTokenInfo[] = [];

    // 过滤 offset，endOffset? 范围内的 token。
    // tokens 类型为 (string | Prism.Token)[]， Prism.Token 是一个展平的结构。
    let currentEndOffset = 0;
    // console.log('===== tokens', tokens);
    for (let [index, token] of tokens.entries()) {
        const currentStartOffset = currentEndOffset;
        // 一般是空白字符。无需处理
        if (typeof token === 'string') {
            if (token.trim() === '') {
                currentEndOffset = currentEndOffset + token.length;
                continue;
            }
            token = {
                type: 'unknown',
                content: token,
                length: token.length,
                alias: undefined as any,
                greedy: undefined as any,
            };
        }
        // 处理 token
        currentEndOffset = currentEndOffset + token.length;
        // 是选中的范围
        if (endOffset) {
            // console.log('===== pos', currentStartOffset, currentEndOffset, offset, endOffset);
            if (currentStartOffset >= endOffset) {
                break;
            }
            if (currentEndOffset < offset) {
                continue;
            }
            tokenInfos.push(toTokenInfo(tokens, index, token, languageId, currentStartOffset, currentEndOffset));
            continue;
        }
        // 是光标位置
        if (offset >= currentStartOffset && offset <= currentEndOffset) {
            tokenInfos.push(toTokenInfo(tokens, index, token, languageId, currentStartOffset, currentEndOffset));
            break;
        }
    }
    // 选中了字符串类型的 Token 的一部分场景。
    if (
        selectionText !== undefined &&
        endOffset !== undefined &&
        tokenInfos.length === 1 &&
        isStringToken(tokenInfos[0].type)
    ) {
        const tokenInfo = tokenInfos[0];
        const tokenOriginText = tokenInfo.originText;
        let startMarker = '';
        let endMarker = '';
        let specialMarkers: {
            startMarker: string;
            endMarker: string;
        } | undefined;
        if (languageId === 'rust') {
            specialMarkers = parseRawStringMarker(tokenOriginText);
        }
        if (tokenInfo.startOffset !== offset) {
            startMarker = specialMarkers?.startMarker || tokenOriginText[0] || '';
        }
        if (tokenInfo.endOffset !== endOffset) {
            endMarker =  specialMarkers?.endMarker || tokenOriginText[tokenOriginText.length - 1] || '';
        }
        const originText = startMarker + selectionText + endMarker;
        return [{
            originText: originText,
            type: tokenInfos[0].type,
            ...parseLiteral(languageId, originText, tokenInfos[0].type),
        }];
    }
    return tokenInfos;
}
