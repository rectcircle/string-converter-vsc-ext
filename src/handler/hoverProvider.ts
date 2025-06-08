import * as vscode from 'vscode';
import { extractCodeTokens } from '../service/codeParser';
import { stringConverterManager } from '../service/stringConverter';
import { MarkdownRenderParam, renderMarkdownToHover } from '../service/markdownRender';
import { fixStringConverterConvertResult } from '../service/vscode';


export const strconvHoverProvider : vscode.HoverProvider = {
    async provideHover(document, position, token) {
        // 获取 tokens
        const codeContent = document.getText();
        let startOffset: number | undefined;
        let endOffset: number | undefined;
        let selectionText: string | undefined;
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document === document && !vscode.window.activeTextEditor.selection.isEmpty) {
           startOffset = document.offsetAt( vscode.window.activeTextEditor.selection.start);
           position = vscode.window.activeTextEditor.selection.start;
           endOffset = document.offsetAt( vscode.window.activeTextEditor.selection.end);
           selectionText = document.getText(vscode.window.activeTextEditor.selection);
        } else {
            startOffset = document.offsetAt(position);
        }
        const positionEvent = {
            line: position.line,
            character: position.character,
            uri: document.uri.toString(),
        };
        const tokens = await extractCodeTokens(codeContent, document.languageId, startOffset, endOffset, selectionText, positionEvent);

        // 解析 token
        const results = (await Promise.all(tokens.flatMap(token => {
            return stringConverterManager.match(token, {
                triggerSource: 'hover',
            }).map(r => {
                return {
                    token: token,
                    matchResult: r,
                };
            });
        }).map<Promise<MarkdownRenderParam>>(async r => {
            return {
                token: r.token,
                matchResult:r.matchResult,
                convertResult: await fixStringConverterConvertResult(stringConverterManager.convert(r.token, r.matchResult), positionEvent),
                vscodeUriScheme: vscode.env.uriScheme,
            };
        })))
        .filter(r => r.convertResult.error === undefined);

        if (results.length === 0) {
            return;
        }

        // 渲染成 markdown
        const content = new vscode.MarkdownString(renderMarkdownToHover(results, positionEvent), true);
        content.isTrusted = true;
        const hover = new vscode.Hover(content);
        return hover;
    }
};
