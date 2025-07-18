import Prism from 'prismjs';
import { parseLiteral } from './literalParser';
import { isStringToken } from './literalParser/interface';
import { canRename } from './vscode';
import { PositionEvent } from './type';

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

async function toTokenInfo(codeContent: string, tokens: (string | Prism.Token)[], index: number, token: Prism.Token, languageId: string, startOffset: number, endOffset: number, positionEvent?: PositionEvent) : Promise<internalTokenInfo> {
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
        } else if (positionEvent) {
            // 使用 canRename api 来判断是否可以 rename，如果可以 rename 那么可以推断这个地方是一个符号。
            // TODO: 调研考虑是否可以使用 vscode.executeDocumentSymbolProvider 更加科学呢？
            const canRenameResult = await canRename(positionEvent);
            if (canRenameResult) {
                // rename 获取到信息更置信
                originText = codeContent.substring(canRenameResult.startOffset, canRenameResult.endOffset);
                type = 'symbol';
                startOffset = canRenameResult.startOffset;
                endOffset = canRenameResult.endOffset;
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

function vscodeLanguageIdToPrism(languageId: string) {
    switch (languageId) {
        case 'javascriptreact':
            return 'jsx';
        case 'typescriptreact':
            return 'tsx';
        default:
            return languageId;
    }
}


export async function extractCodeTokens(
    codeContent: string,
    languageId: string,
    offset: number,  // 包含
    endOffset?: number,  // 不包含
    selectionText?: string,
    positionEvent?: PositionEvent,
): Promise<TokenInfo[]> {
    // 检查语言支持
    // 导入 Prism 库
    if (!Prism.languages[vscodeLanguageIdToPrism(languageId)]) {
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
    const tokens = Prism.tokenize(codeContent, Prism.languages[vscodeLanguageIdToPrism(languageId)]);
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
            // fixme: 如果有用户选中，这里如果传递了 positionEvent。
            // 在 plaintext 场景，会误识别，所以这里先不传递 positionEvent。
            // 后续如果有需要，可以再优化。
            tokenInfos.push(await toTokenInfo(codeContent, tokens, index, token, languageId, currentStartOffset, currentEndOffset, undefined));
            continue;
        }
        // 是光标位置
        if (offset >= currentStartOffset && offset <= currentEndOffset) {
            tokenInfos.push(await toTokenInfo(codeContent, tokens, index, token, languageId, currentStartOffset, currentEndOffset, positionEvent));
            break;
        }
    }
    // 选中了字符串类型的 Token 的一部分场景。
    if (
        selectionText !== undefined &&
        endOffset !== undefined &&
        tokenInfos.length === 1 &&
        (isStringToken(tokenInfos[0].type) || tokenInfos[0].type === 'unknown' )
    ) {
        const tokenInfo = tokenInfos[0];
        let startMarker = '';
        let endMarker = '';
        if (tokenInfo.startOffset !== offset) {
            startMarker = tokenInfo?.startMarker || '';
        }
        if (tokenInfo.endOffset !== endOffset) {
            endMarker =  tokenInfo?.endMarker || '';
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
