import * as vscode from 'vscode';
import { extractCodeTokens, TokenInfo } from '../service/codeParser';
import { stringConverterManager } from '../service/stringConverter';
import { StringConverterMeta } from '../service/stringConverter/interface';

export async function showTextCommandCallback(token: TokenInfo, meta: StringConverterMeta) {
    vscode.window.showInformationMessage(`${meta.name}: ${stringConverterManager.convert(token, meta)}`);
}

type CodeActionWithData = vscode.CodeAction & { 
    data: { 
        token: TokenInfo,
        meta: StringConverterMeta,
    } 
};

export function getCodeActionProviderCallback(): vscode.CodeActionProvider<CodeActionWithData> {
    return {
        provideCodeActions: async (document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) => {
            const codeContent = document.getText();
            const startOffset = document.offsetAt(range.start);
            let endOffset: number | undefined;
            let selectionText: string | undefined;
            if (!range.isEmpty) {
                selectionText = document.getText(range);
                endOffset = document.offsetAt(range.end);
            }
            const tokens = extractCodeTokens(codeContent, document.languageId, startOffset, endOffset, selectionText);
            
            return tokens.flatMap(token => {
                return stringConverterManager.match(token).map(meta => {
                    const action = new vscode.CodeAction(meta.name, vscode.CodeActionKind.Refactor) as CodeActionWithData;
                    action.data = { token, meta };
                    return action;
                });
            });
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            action.command = {
                command: 'string-converter.showText',
                title: 'Convert Selected Text',
                arguments: [action.data.token, action.data.meta],
            }
            return action;
        }
    };
}
