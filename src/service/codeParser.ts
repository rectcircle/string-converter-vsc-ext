import Prism from 'prismjs';
import { parseLiteral } from './literalParser';

export interface TokenInfo {
    originText: string;
    text: string;
    type: string;
}

interface internalTokenInfo extends TokenInfo   {
    StartOffset: number,
    EndOffset: number,
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

export function extractCodeTokens(
    codeContent: string,
    languageId: string,
    offset: number,  // 包含
    endOffset?: number,  // 不包含
    selectionText?: string
): TokenInfo[] {
    'abc'.substring(0, 1);
    // 检查语言支持
    // 导入 Prism 库
    if (!Prism.languages[languageId]) {
        if (endOffset !== undefined && selectionText) {
            return [{
                originText: selectionText,
                text: parseLiteral(languageId, selectionText, 'unknown'),
                type: 'unknown',
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
    for (let token of tokens) {
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
            const originText = getTokenContent(token);
            tokenInfos.push({
                originText: originText,
                text: parseLiteral(languageId, originText, token.type),
                type: token.type,
                StartOffset: currentStartOffset,
                EndOffset: currentEndOffset,
            });
            continue;
        }
        // 是光标位置
        const originText = getTokenContent(token);
        if (offset >= currentStartOffset && offset <= currentEndOffset) {
            tokenInfos.push({
                originText: originText,
                text: parseLiteral(languageId, originText, token.type),
                type: token.type,
                StartOffset: currentStartOffset,
                EndOffset: currentEndOffset,
            });
            break;
        }
    }
    // 选中了字符串类型的 Token 的一部分场景。
    if (
        selectionText !== undefined &&
        endOffset !== undefined &&
        tokenInfos.length === 1 &&
        (tokenInfos[0].type === 'string' || tokenInfos[0].type ==='template-string')
    ) {
        const tokenInfo = tokenInfos[0];
        const tokenOriginText = tokenInfo.originText;
        let originText = selectionText;
        if (tokenInfo.StartOffset !== offset) {
            originText = (tokenOriginText[0] || '') + originText;
        }
        if (tokenInfo.EndOffset !== endOffset) {
            originText = originText + (tokenOriginText[tokenOriginText.length - 1] || '');
        }
        return [{
            originText: originText,
            text: parseLiteral(languageId, originText, tokenInfos[0].type),
            type: tokenInfos[0].type
        }];
    }
    return tokenInfos;
}
