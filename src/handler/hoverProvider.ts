import * as vscode from 'vscode';
import { extractCodeTokens } from '../service/codeParser';
import { stringConverterManager } from '../service/stringConverter';
import { MarkdownRenderParam, rednerMarkdownToHover } from '../service/markdownRender';


export const strconvHoverProvider : vscode.HoverProvider = {
    provideHover(document, position, token) {
        // 获取 tokens
        const codeContent = document.getText();
        let startOffset: number | undefined;
        let endOffset: number | undefined;
        let selectionText: string | undefined;
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document === document && !vscode.window.activeTextEditor.selection.isEmpty) {
           startOffset = document.offsetAt( vscode.window.activeTextEditor.selection.start);
           endOffset = document.offsetAt( vscode.window.activeTextEditor.selection.end);
           selectionText = document.getText(vscode.window.activeTextEditor.selection);
        } else {
            startOffset = document.offsetAt(position);
        }
        const tokens = extractCodeTokens(codeContent, document.languageId, startOffset, endOffset, selectionText);

        // 解析 token
        const results = tokens.flatMap(token => {
            return stringConverterManager.match(token).map(r => {
                return {
                    token: token,
                    matchResult: r,
                };
            });
        }).map<MarkdownRenderParam>(r => {
            return {
                token: r.token,
                matchResult:r.matchResult,
                convertResult: stringConverterManager.convert(r.token, r.matchResult),
                vscodeUriScheme: vscode.env.uriScheme,
            };
        })
        .filter(r => r.convertResult.error === undefined);

        if (results.length === 0) {
            return;
        }

        // 渲染成 markdown
        const content = new vscode.MarkdownString(rednerMarkdownToHover(results), true);
        content.isTrusted = true;
        const hover = new vscode.Hover(content);
        return hover;
    }
};
