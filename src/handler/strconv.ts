import * as vscode from 'vscode';
import { extractCodeTokens, TokenInfo } from '../service/codeParser';

export async function showTextCommandCallback(token: TokenInfo) {
    vscode.window.showInformationMessage(`Text is: ${token.Text}, Type is: ${token.Type}`);
}

type CodeActionWithData = vscode.CodeAction & { 
    data: { 
        token: TokenInfo,
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
            
            return tokens.map(token => {
                const action = new vscode.CodeAction('Convert String: ' + token.Text, vscode.CodeActionKind.Refactor) as CodeActionWithData;
                action.data = { token };
                return action;
            });
        },
        resolveCodeAction: async (action: CodeActionWithData, token: vscode.CancellationToken) => {
            action.command = {
                command: 'string-converter.showText',
                title: 'Convert Selected Text',
                arguments: [action.data.token],
            }
            return action;
        }
    };
}
