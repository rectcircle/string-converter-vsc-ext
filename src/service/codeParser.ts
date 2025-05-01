import Prism from 'prismjs';

export interface TokenInfo {
    OriginText: string;
    Text: string;
    Type: string;
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
    position: number,  // 包含
    endPosition?: number,  // 不包含
    selectionText?: string
): TokenInfo[] {
    'abc'.substring(0, 1);
    // 检查语言支持
    // 导入 Prism 库
    if (!Prism.languages[languageId]) {
        if (selectionText) {
            return [{
                OriginText: selectionText,
                Text: selectionText,
                Type: 'unknown'
            }];
        }
        return [];
    }
    // 获取token列表
    const tokens = Prism.tokenize(codeContent, Prism.languages[languageId]);
    const tokenInfos: TokenInfo[] = [];

    // 过滤 position，endPosition? 范围内的 token。
    // tokens 类型为 (string | Prism.Token)[]， Prism.Token 是一个展平的结构。
    let currentEndPos = 0;
    // console.log('===== tokens', tokens);
    for (let token of tokens) {
        const currentStartPos = currentEndPos;
        // 一般是空白字符。无需处理
        if (typeof token === 'string') {
            if (token.trim() === '') {
                currentEndPos = currentEndPos + token.length;
                continue;
            }
            token = {
                type: 'unknown',
                content: token,
                length: token.length,
                alias: undefined as any,
                greedy: undefined as any,
            }
        }
        // 处理 token
        currentEndPos = currentEndPos + token.length;
        // 是选中的范围
        if (endPosition) {
            // console.log('===== pos', currentStartPos, currentEndPos, position, endPosition);
            if (currentStartPos >= endPosition) {
                break;
            }
            if (currentEndPos < position) {
                continue;
            }
            const text = getTokenContent(token);
            tokenInfos.push({
                OriginText: text,
                Text: text,
                Type: token.type
            })
            continue;
        }
        // 是光标位置
        const text = getTokenContent(token);
        if (position >= currentStartPos && position <= currentEndPos) {
            tokenInfos.push({
                OriginText: text,
                Text: text,
                Type: token.type
            })
            break;
        }
    }
    // 选中了字符串类型的 Token 的一部分场景。
    if (selectionText !== undefined && tokenInfos.length === 1 && (tokenInfos[0].Type === 'string' || tokenInfos[0].Type ==='template-string')) {
        const tokenOriginText = tokenInfos[0].OriginText;
        const originText = tokenOriginText[0] + selectionText + tokenOriginText[tokenOriginText.length-1];
        return [{
            OriginText: originText,
            Text: originText,
            Type: tokenInfos[0].Type
        }]
    }
    return tokenInfos;
}

// 语言特定的解析器可以在这里添加
// 例如：
// function extractTypeScriptToken(...) {...}
// function extractPythonToken(...) {...}